// package _webserver
package main

import (
	// _ws "../_websockets"
	. "../_const"
	// "../_error"
	"../_scrypt"
	"../_client"
	"../_db"
	"os"
	"net"
	"fmt"
	"log"
	"strconv"
	"net/url"
	"net/http"
	"os/signal"
	"html/template"
	"github.com/gorilla/sessions" //session cookie manager
	"github.com/gorilla/websocket"
	"github.com/julienschmidt/httprouter"
)

// cookie key must be 16, 24 or 32 bytes long in order to fit AES-128, AES-192 or AES-256 norms
// key = []byte("404a484c93d182ec2ae17d0296c0fe33") //MD5 of go_mt4

type Session struct {
	store *sessions.CookieStore
	key []byte
	name string
}

type VisitorTemplate struct {
	VisitorID string // session hash ID, public
	Access bool // access to site (passed captcha), private
	Auth bool // access to client areas (passed login), private
	IP string // private
/* once the client signs in, we could encode all the data we have on him in the cookie
 * so it can be used without accessing the database while the session is active,
 * this would lower the database load but require as much back-end CPU (more?)
	ID 			int64 		//incremental serial number, internal only
	IP			string		//last used ip (from net.IP.String())
	EMAIL		string		//email address
	P_HASH		string 		//pwd hash
	I_HASH		string 		//acc info hash
	USER_NAME	string		//pseudonym
	FIRST_NAME	string		//first name
	LAST_NAME	string		//last name
	DOB_EPOCH	int64		//dob date
	REG_EPOCH	int64		//registration date
	LOG_EPOCH	int64		//last login date
	//is_root		bool		//has admin rights?
*/
}

type ClientServer struct {
	db *_db.Database
	Clients map[string]*_client.Client
	s Session
	router *httprouter.Router
	t *template.Template
	// fs http.Handler
	// ws *_ws.WS
	host string
}

func parse_html_files()(*template.Template) {
	//can also use template.ParseGlob("*.html")
	tpl := template.Must(template.ParseGlob(
		"../static/html/*.html"))
		// "../static/html/x.html",
		// "../static/html/y.html",...)) //could use a wildcard as well, but better readability
	// fmt.Println("tpl:", tpl)
	return tpl
}

//  https://      user:pass  @host.com:8000/ path   ?key=value	  #fragment
//  scheme, authentication info, host, port, path, query params, query fragment
func GetQueryParam(query string, key string) string {
	// fmt.Println("clean_query:", clean_query)
	// val := query.Get(key)
	// fmt.Println("key:", key)
	// val, ok := r.URL.Query()[key]
	// fmt.Println("val:", val)
	// if !ok || len(val[0]) < 1 {
	// 	// log.Println("Url Param 'key' is missing")
	// 	return ""
	// }
	// Query()[key] will return an array of items, from which we return the first
	// fmt.Println("id:", val[0])
	n := len(query)
	nk := len(key)
	for i := 0; i < (n - nk - 1); i++ {
		if query[i:(i + nk)] == key {
			start := i + nk + 1
			for end, c := range query[start:n] {
				if (c == '&' || c == '#' || c == ' ') {
					fmt.Println("id len:",end)
					return query[start:(start+end)]
				}
			}
			return query[start:n]
		}
	}
	return ""
}

func GetReqParam(r *http.Request, key string) string {
	raw_query := r.URL.RawQuery
	fmt.Println("raw_query:", raw_query)
	clean_query, _ := url.QueryUnescape(raw_query) // _ = err
	// if err != nil { _error.Handle("QueryUnescape() failed", err) }
	return GetQueryParam(clean_query, key)
}

func GetIP(r *http.Request) net.IP {
	// get data from remote addr
	ip, _, err := net.SplitHostPort(r.RemoteAddr) // ip is a string, IPv4 or IPv6, _ = port
	if err != nil { fmt.Printf("userip: %q is not IP:port\n", r.RemoteAddr); return nil }
	// extract IP
	return net.ParseIP(ip)
}

func (server *ClientServer)VerifySessionID(w http.ResponseWriter, r *http.Request) VisitorTemplate {
	s, _ := server.s.store.Get(r, server.s.name)
	// var client *_client.Client
	var access bool
	var auth bool
	var ip string
	// auth, _ := s.Values["auth"].(bool)
	// if !ok { http.Error(w, "Forbidden", http.StatusForbidden) } //
	visitor_id, _ := s.Values["visitor_id"].(string)
	// fod, _ := s.Values["fod"].(bool)
	// if !ok { http.Error(w, "Forbidden Session Access", http.StatusForbidden) } // couldn't read cookie
	// temporarily set user as visitor if he just arrived to the site
	if visitor_id == "" || server.Clients[visitor_id] == nil {// if (!auth && visitor_id == "") {
		visitor_id = string(_scrypt.SaltGenerate(32))
		access = false
		auth = false
		ip = GetIP(r).String()
		s.Values["visitor_id"] = visitor_id
		// if (access || auth) { /*handle error, shouldnt have permissions*/ } 
		s.Values["access"] = access
		s.Values["auth"] = auth
		s.Values["ip"] = ip
		// s.Values["fod"] = false
		s.Save(r, w)
		// client = _client.NewVisitor(visitor_id, ip)
		server.Clients[visitor_id] = _client.NewVisitor(visitor_id, ip) // = client
		fmt.Println("Created ID:", visitor_id, "for IP:", ip)
		// fmt.Println("Instanciated Client session:", client)
	} else {
		ip, _ = s.Values["ip"].(string)
		// if !ok { http.Error(w, "Forbidden Session Access", http.StatusForbidden) } // couldn't read cookie
		access, _ = s.Values["access"].(bool)
		auth, _ = s.Values["auth"].(bool)
		ip, _ = s.Values["ip"].(string)
	}
	// fmt.Println("cookie from index:", s, "\nrequest data:", r)
	// if err != nil { _error.Handle("GetClient() in HandleIndex() failed", err) }
	id := VisitorTemplate{
		VisitorID: visitor_id,
		Access: access,
		Auth: auth,
		IP: ip,
		// Lst: []LstTpl{
		// 	{Title: "", Done: false},
		// 	{Title: "", Done: true},
		// 	{Title: "", Done: true},
		// },
	}
	return id
}

func (server *ClientServer)HandleLogIn(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "log_in.html", "") //nil = template data
}

func (server *ClientServer)HandleLogInPost(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	if err := r.ParseForm(); err != nil {
		fmt.Fprintf(w, "ParseForm() err: %v", err)
		return
	}
	email := r.FormValue("email")
	pwd := r.FormValue("password")
	s, _ := server.s.store.Get(r, server.s.name)
	visitor_id, _ := s.Values["visitor_id"].(string)
	client := server.Clients[visitor_id]
	res := ""
	if err := server.db.PwdCheck(email, pwd); err != nil {// wrong password / email
		res = `
		{
			"access": "denied",
			"ud": "denied",
			"status": "` + err.Error() + `"
		}`
		client.Send(res) // for WebSocket
		fmt.Fprintf(w, "%s", res) // for AJAX (XHR)
		return
	}
	s.Values["email"] = email
	s.Values["auth"] = true
	s.Save(r, w)
	// auth, /*ok*/_ := s.Values["auth"].(bool)
	// if (!ok || !auth) {
	// 	http.Error(w, "Forbidden", http.StatusForbidden)
	// 	return
	// }
	// fmt.Println("cookie from login:", s, "\nrequest data:", r)
	err := client.GetData(email, pwd, s.Values["ip"].(string))
	if err != nil {
		// fmt.Fprintf(w, "Failed to log in: %s", err.Error())
		res = `
		{
			"access": "granted",
			"ud": "denied",
			"status": "` + err.Error() + `"
		}`
	} else if client.UD == nil {
		res = `
		{
			"access": "granted",
			"ud": "null",
			"status": "success"
		}`
	} else {
		// server.Clients[email] = client
		// fmt.Fprintf(w, "Welcome %s", client.UD.EMAIL)
		res = `
		{
			"access": "granted",
			"ud": "granted",
			"status": "success"
		}`
	}
	client.Send(res) // for WebSocket
	fmt.Fprintf(w, "%s", res) // for AJAX (XHR)
	return
	// if err != nil { _error.Handle("GetClient() in HandleLoginPost() failed", err) }
	// http.Redirect(w, r, DOMAIN, http.StatusSeeOther) //301 >> redirection= host + ":" + strconv.Itoa(int(APP_PORT))
}

func (server *ClientServer)CheckCaptcha(w http.ResponseWriter, r *http.Request, template string, success_URI string, failure_URI string) {
	id := server.VerifySessionID(w, r)
	parsed_id := GetReqParam(r, "visitor_id")
	s, _ := server.s.store.Get(r, server.s.name)
	// client := server.Clients[visitor_id]
	// the id passed by JS matches with the cookie >> user has clicked to get here
	// fmt.Println("cookie id:", id.VisitorID, "query id:", parsed_id, "cookie access:", id.Access)
	if id.VisitorID != "" && id.Access == true {
		// fmt.Println("Template Exec")
		server.t.ExecuteTemplate(w, template, id)
	} else {
		if id.VisitorID == parsed_id {
			s.Values["access"] = true
			s.Save(r, w)
			// fmt.Println("Redirection Success, cookie access:", s.Values["access"])
			// server.t.ExecuteTemplate(w, success_URI, server.VerifySessionID(w, r))
			http.Redirect(w, r, success_URI, http.StatusSeeOther)
		} else {
			// fmt.Println(r)
			http.Redirect(w, r, failure_URI, http.StatusSeeOther) //301 >> redirection= host + ":" + strconv.Itoa(int(APP_PORT))	
			// fmt.Println("Redirection Failure")
		}
	}
}

func (server *ClientServer)SecureExec(w http.ResponseWriter, r *http.Request, file string, custom_fallback string) {
	fallback := FALLBACK; if custom_fallback != "" { fallback = custom_fallback }
	id := server.VerifySessionID(w, r)
	if id.VisitorID != "" && id.Access == true && server.Clients[id.VisitorID] != nil {
		fmt.Println("rendering: " + file)
		server.t.ExecuteTemplate(w, file, id) //nil = template data
	// } else if server.Client[id.VisitorID] == nil {
	// 	http.Redirect(w, r, /*DOMAIN +*/ fallback + url.QueryEscape("access=denied&req=" + r.URL.RequestURI()[1:]), http.StatusSeeOther) //301 >> redirection= host + ":" + strconv.Itoa(int(APP_PORT))	
	} else {
		http.Redirect(w, r, /*DOMAIN +*/ fallback + url.QueryEscape("access=denied&req=" + r.URL.RequestURI()[1:]), http.StatusSeeOther) //301 >> redirection= host + ":" + strconv.Itoa(int(APP_PORT))	
	}
}

func (server *ClientServer)HandleSignUp(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "sign_up.html", "") //nil = template data
}

func (server *ClientServer)HandleSignUpPost(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// if err := r.ParseForm(); err != nil {
	// 	fmt.Fprintf(w, "ParseForm() err: %v", err)
	// 	return
	// }
	// email := r.FormValue("email")
	// pwd := r.FormValue("password")
	// s, _ := server.s.store.Get(r, server.s.name)
	// s.Values["email"] = email
	// s.Values["auth"] = true
	// auth, ok := s.Values["auth"].(bool)
	// if (!ok || !auth) {
	// 	http.Error(w, "Forbidden", http.StatusForbidden)
	// 	return
	// }
	// fmt.Println("cookie from login:", s, "\nrequest data:", r)
	// s.Save(r, w)
	// client, err := _client.GetClient(email, pwd, GetIP(r).String())
	// if err != nil {
	// 	fmt.Fprintf(w, "Failed to log in: %s", err.Error())
	// } else {
	// 	server.Clients[email] = client
	// 	// fmt.Fprintf(w, "Welcome %s", client.UD.EMAIL)
	// }
	// // if err != nil { _error.Handle("GetClient() in HandleLoginPost() failed", err) }
	http.Redirect(w, r, DOMAIN, http.StatusSeeOther) //301 >> redirection
}

func (server *ClientServer)HandleRoot(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	if id.Access == false {
		http.Redirect(w, r, /*DOMAIN + */"/captcha", http.StatusSeeOther) //301 >> redirection
	} else {
		http.Redirect(w, r, /*DOMAIN + */"/home", http.StatusSeeOther) //301 >> redirection
	}
}

func (server *ClientServer)HandleCaptcha(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// access := GetReqParam(r, "access")
	// if access == "denied" { fmt.Println("access denied") } // do this on client side
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "captcha.html", id) //nil = template data
}

func (server *ClientServer)HandleHome(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.CheckCaptcha(w, r, "home.html", "/home",/*DOMAIN +*/ "/captcha?" + url.QueryEscape("access=denied&req=" + r.URL.RequestURI()[1:])) //nil = template data
}

func (server *ClientServer)HandleSkills(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// server.SecureExec(w, r, "skills.html", "")
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "skills.html", id) //nil = template data
}

func (server *ClientServer)HandleContact(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "contact.html", "") //nil = template data
}

func (server *ClientServer)HandleShowcase(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase.html", "") //nil = template data
}

// server.HandleMisc
func (server *ClientServer)HandleMisc(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_misc.html", "") //nil = template data
}

func (server *ClientServer)HandleTypeWriter(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_typewriter.html", "") //nil = template data
}

func (server *ClientServer)HandleTypeFader(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_typefader.html", "") //nil = template data
}

func (server *ClientServer)HandleTypeDecoder(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_typedecoder.html", "") //nil = template data
}

func (server *ClientServer)HandleMsgBox(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_msgbox.html", "") //nil = template data
}

func (server *ClientServer)Handle1Bit(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.t.ExecuteTemplate(w, "showcase_1_bit.html", nil)
}

func (server *ClientServer)Handle1BitConstruction(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.t.ExecuteTemplate(w, "showcase_1_bit_construction.html", nil) //nil = template data
}

func (server *ClientServer)HandleProcGen(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_proc_gen.html", "") //nil = template data
}

func (server *ClientServer)HandleFracTrees(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_frac_trees.html", "") //nil = template data
}

func (server *ClientServer)HandleFinance(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_finance.html", "") //nil = template data
}

func (server *ClientServer)HandleStockGen(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_stock_gen.html", "") //nil = template data
}

func (server *ClientServer)HandleStockChartist(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_stock_chartist.html", "") //nil = template data
}

func (server *ClientServer)HandleStockHeatmap(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_stock_heatmap.html", "") //nil = template data
}

func (server *ClientServer)HandleStockAnalyzer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_stock_analyzer.html", "") //nil = template data
}

func (server *ClientServer)HandleCryptoMarketCap(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_crypto_market_cap.html", "") //nil = template data
}

func (server *ClientServer)HandleCryptoHeatmap(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_crypto_heatmap.html", "") //nil = template data
}

func (server *ClientServer)HandleGaming(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_gaming.html", "") //nil = template data
}

func (server *ClientServer)HandlePong(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_pong.html", "") //nil = template data
}

func (server *ClientServer)HandleTron(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_tron.html", "") //nil = template data
}

func (server *ClientServer)HandleSnake(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_snake.html", "") //nil = template data
}

func (server *ClientServer)HandleTetris(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_tetris.html", "") //nil = template data
}

func (server *ClientServer)HandleAsteroids(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_asteroids.html", "") //nil = template data
}

func (server *ClientServer)HandleMineSweeper(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_minesweeper.html", "") //nil = template data
}

func (server *ClientServer)HandleSpaceInvaders(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "showcase_space_invaders.html", "") //nil = template data
}

func (server *ClientServer)HandleErrBrokser(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "error_brokser.html", "") //nil = template data
}

func (server *ClientServer)HandleErr404(w http.ResponseWriter, r *http.Request/*, _ httprouter.Params*/) {
	//id := server.VerifySessionID(w, r)
	server.SecureExec(w, r, "error_404.html", "") //nil = template data
}

func (server *ClientServer)HandleErrConstruction(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	server.SecureExec(w, r, "error_construction.html", "") //nil = template data
}

// websockets
func (server *ClientServer)HandleWebSocket(w http.ResponseWriter, r *http.Request,  _ httprouter.Params) {
	var err error
	host := "http://" + DOMAIN; if HTTPS { host = "https://" + DOMAIN }
	fmt.Println(r.Header.Get("Origin"), host)
	if r.Header.Get("Origin") != host { //r.Host do not show http/https
		http.Error(w, "Origin not allowed", 403) // same as forbidden below
		return
	}
	// s, _ := server.s.store.Get(r, server.s.name)
	// fmt.Println("cookie from ws:", s, "\nrequest data:", r)
	// // Check if user is auth
	// auth, ok := s.Values["auth"].(bool)
	// if !ok || !auth {
	// 	// fmt.Println("403, auth:", auth)
	// 	http.Error(w, "Forbidden", http.StatusForbidden)
	// 	return
	// }
	// email := s.Values["email"].(string)
	// fmt.Println("ws request header:", r)
	// visitor_id := r.URL.Query().Get("id")
	visitor_id := GetReqParam(r, "visitor_id")
	use := GetReqParam(r, "use")
	client := server.Clients[visitor_id]
	fmt.Println("visitor_id:", visitor_id)
	fmt.Println("client:", client)
	if client != nil { //set websocket only once per user
		client.WS_CONN = nil
		client.WS_CONN, err = websocket.Upgrade(w, r, w.Header(), 1024, 1024)
		if err != nil {
			http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
			return
		}
		client.Send("Hello from server to client")
		go client.Listen(use) // listen and server on /ws
		//}else { fmt.Println("client", email, "is already bound") }
	}//else { fmt.Println("client", email, "isn't on the server's stack") }
	// fmt.Fprint(w, "There is nothing for you here if you are not a WebSocket nor an API :(")
}

func (server *ClientServer)HandleComponentAPI(w http.ResponseWriter, r *http.Request,  _ httprouter.Params) {
	// reject request if it originates from outside of domain
	// host := "http://" + DOMAIN; if HTTPS { host = "https://" + DOMAIN }
	// fmt.Println(r.Header.Get("Origin"), host)
	// if r.Header.Get("Origin") != host { //r.Host do not show http/https
	// 	http.Error(w, "Origin not allowed", 403) // same as forbidden below
	// 	return
	// }
	id := server.VerifySessionID(w, r)
	component := GetReqParam(r, "id")
	fmt.Println("component req:", component)
	if component != "" {
		fmt.Println("Client", id.VisitorID, "requested", component, "component")
		server.t.ExecuteTemplate(w, /*component + "*/"log_in.html", id)
	}
}

func (server *ClientServer)SigKill() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, os.Kill)
	<- c
	// BackUp()// called whenever server is stopped with ctrl + c or killed
}

func NewClientServer(static_dir string, port uint16)(*ClientServer) { //static_dir = ../static
	var server ClientServer

	server.host	= ":" + strconv.Itoa(int(port))			// host:port settings
	server.t = parse_html_files()						// HTML files template settings
	server.db = _client.DB 								// database settings
	server.Clients = make(map[string]*_client.Client)	// client map settings
	server.router = httprouter.New()					// httprouter settings
	// route handlers
	server.router.NotFound = http.HandlerFunc(server.HandleErr404)
	server.router.GET("/brokser", server.HandleErrBrokser)
	server.router.GET("/construction_site", server.HandleErrConstruction)
	server.router.GET("/", server.HandleRoot)
	server.router.GET("/ws", server.HandleWebSocket)
	// log-in and sign-in routes
	server.router.GET("/log_in", server.HandleLogIn)
	server.router.GET("/sign_up", server.HandleSignUp)
	server.router.POST("/post_log_in", server.HandleLogInPost) // user login request
	server.router.POST("/post_sign_up", server.HandleSignUpPost) // user login request
	// local files exposed from static/:
	server.router.ServeFiles("/static/*filepath", http.Dir(static_dir)) // static dir fileserver
	// api
	server.router.GET("/api/v1/private/component", server.HandleComponentAPI)
	// server.router.GET("/api/v1/public/data", server.HandleDataAPI)
	// main routes
	server.router.GET("/captcha", server.HandleCaptcha)
	server.router.GET("/home", server.HandleHome)
	server.router.GET("/skills", server.HandleSkills)
	server.router.GET("/contact", server.HandleContact)
	server.router.GET("/showcase", server.HandleShowcase)
	// showcase MISCELLANEOUS handlers
	server.router.GET("/showcase/misc", server.HandleMisc)
	server.router.GET("/showcase/misc/_1_bit", server.Handle1Bit)
	server.router.GET("/showcase/misc/_1_bit_construction", server.Handle1BitConstruction)
	server.router.GET("/showcase/misc/_typewriter", server.HandleTypeWriter)
	server.router.GET("/showcase/misc/_typefader", server.HandleTypeFader)
	server.router.GET("/showcase/misc/_typedecoder", server.HandleTypeDecoder)
	server.router.GET("/showcase/misc/_msgbox", server.HandleMsgBox)
	server.router.GET("/showcase/misc/_proc_gen", server.HandleProcGen)
	server.router.GET("/showcase/misc/_fractal_trees", server.HandleFracTrees)
	// showcase FINANCE handlers
	server.router.GET("/showcase/finance", server.HandleFinance)
	server.router.GET("/showcase/finance/_stock_generator", server.HandleStockGen)
	// server.router.GET("/showcase/finance/_stock_screener", server.HandleStockScreener)
	server.router.GET("/showcase/finance/_stock_chartist", server.HandleStockChartist)
	server.router.GET("/showcase/finance/_stock_heatmap", server.HandleStockHeatmap)
	server.router.GET("/showcase/finance/_stock_analyzer", server.HandleStockAnalyzer)
	server.router.GET("/showcase/finance/_crypto_market_cap", server.HandleCryptoMarketCap)
	server.router.GET("/showcase/finance/_crypto_heatmap", server.HandleCryptoHeatmap)
	// showcase GAMING handlers
	server.router.GET("/showcase/gaming", server.HandleGaming)
	server.router.GET("/showcase/gaming/_pong", server.HandlePong)
	server.router.GET("/showcase/gaming/_tron", server.HandleTron)
	server.router.GET("/showcase/gaming/_snake", server.HandleSnake)
	server.router.GET("/showcase/gaming/_tetris", server.HandleTetris)
	server.router.GET("/showcase/gaming/_asteroids", server.HandleAsteroids)
	server.router.GET("/showcase/gaming/_mine_sweeper", server.HandleMineSweeper)
	server.router.GET("/showcase/gaming/_space_invaders", server.HandleSpaceInvaders)
	// showcase DATA VUSUALIZATION handlers
	// server.router.GET("/showcase/data_viz", server.HandleDataViz)
	// server.router.GET("/showcase/data_viz/_ladder_sort", server.HandleLadderSort)

	// gorilla session settings (cookies & co)
	server.s.key	= []byte("404a484c93d182ec2ae17d0296c0fe33") //MD5 of go_mt4
	server.s.name	= "go_mt4_session"
	server.s.store	= sessions.NewCookieStore(server.s.key)
	server.s.store.Options = &sessions.Options{
		Path:	 "/",
		MaxAge:   900, //900 sec = 15min session survival
		HttpOnly: true,
	}
	// listen and server
	if HTTPS {
		go log.Fatal("HTTPS server error: ", http.ListenAndServeTLS(server.host, SSL_CRT_PATH, SSL_KEY_PATH, server.router))
	} else {
		go log.Fatal("HTTP server error: ", http.ListenAndServe(server.host, server.router))
	}
	go server.SigKill()
	return &server
}

func main() {
	// D:/Users/pde-rent/Desktop/work/go/go_mt4/app/_static
	fmt.Println("Server running at", DOMAIN, "ingress on port", APP_PORT)
	server := NewClientServer("../static", APP_PORT)
	fmt.Println(server.s)
}
