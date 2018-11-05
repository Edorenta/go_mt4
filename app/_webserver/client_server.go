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
	Visitor_id string
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
		// // generics
		// "../static/html/generic_head.html",
		// "../static/html/generic_header.html",
		// "../static/html/generic_navbar.html",
		// "../static/html/generic_footer.html",
		// // page specific heads
		// "../static/html/captcha_head.html",
		// "../static/html/index_head.html",
		// "../static/html/log_in_head.html",
		// "../static/html/sign_up_head.html",
		// // page specific bodies
		// "../static/html/captcha_body.html",
		// "../static/html/log_in_body.html",
		// "../static/html/sign_up_body.html",
		// "../static/html/index_body.html",
		// // page rendering templates
		// "../static/html/captcha.html",
		// "../static/html/index.html",
		// "../static/html/log_in.html",
		// "../static/html/sign_up.html")) //could use a wildcard as well, but better readability
	fmt.Println("tpl:", tpl)
	return tpl
}

//  https://	 user:pass  @host.com:8000/  path   ?key=value	 #fragment
//>>scheme, authentication info, host, port, path, query params, query fragment
func GetReqParam(r *http.Request, key string) string {
	// query := r.URL.Query()
	raw_query := r.URL.RawQuery
	fmt.Println("raw_query:", raw_query)
	// fmt.Println("query:", query)
	// uri := r.URL.RequestURI()
	// clean_uri, _ := url.PathUnescape(uri) // _ = err
	// fmt.Println("uri:", clean_uri)
	// if err != nil { _error.Handle("PathUnescape() failed", err) }
	clean_query, _ := url.QueryUnescape(raw_query) // _ = err
	// if err != nil { _error.Handle("QueryUnescape() failed", err) }
	fmt.Println("clean_query:", clean_query)
	// fmt.Println("uri:", clean_uri)
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
	n := len(clean_query)
	nk := len(key)
	for i := 0; i < (n - nk - 1); i++ {
		if clean_query[i:(i + nk)] == key {
			start := i + nk + 1
			// for end := i; end < n; end++ {
			// 	if (clean_query[end] == "&" || clean_query[end] == "#") {
			// 		return clean_query[start:end]
			// 	}
			// }
			for end, c := range clean_query[start:n] {
				if (c == '&' || c == '#' || c == ' ') {
					return clean_query[start:end]
				}
			}
			return clean_query[start:n]
		}
	}
	return ""
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
	var client *_client.Client 
	// auth, _ := s.Values["auth"].(bool)
	// if !ok { http.Error(w, "Forbidden", http.StatusForbidden) } //
	visitor_id, _ := s.Values["visitor_id"].(string)
	// fod, _ := s.Values["fod"].(bool)
	// if !ok { http.Error(w, "Forbidden Session Access", http.StatusForbidden) } // couldn't read cookie
	// temporarily set user as visitor if he just arrived to the site
	if visitor_id == "" {// if (!auth && visitor_id == "") {
		visitor_id = string(_scrypt.SaltGenerate(32))
		s.Values["visitor_id"] = visitor_id
		s.Values["auth"] = false
		// s.Values["fod"] = false
		s.Save(r, w)
		client = _client.NewVisitor(visitor_id/*, GetIP(r).String()*/)
		server.Clients[visitor_id] = client
		fmt.Println("Created visitor_id:", visitor_id)
		fmt.Println("Instanciated Client session:", client)
	} else {
		visitor_id, _ = s.Values["visitor_id"].(string)
		// if !ok { http.Error(w, "Forbidden Session Access", http.StatusForbidden) } // couldn't read cookie
		client = server.Clients[visitor_id]
	}
	// fmt.Println("cookie from index:", s, "\nrequest data:", r)
	// if err != nil { _error.Handle("GetClient() in HandleIndex() failed", err) }
	id := VisitorTemplate{
		Visitor_id: visitor_id,
		// Lst: []LstTpl{
		// 	{Title: "", Done: false},
		// 	{Title: "", Done: true},
		// 	{Title: "", Done: true},
		// },
	}
	return id
}

func (server *ClientServer)HandleLogIn(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "log_in.html", id) //nil = template data
}

func (server *ClientServer)HandleLogInPost(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	if err := r.ParseForm(); err != nil {
		fmt.Fprintf(w, "ParseForm() err: %v", err)
		return
	}
	email := r.FormValue("email")
	pwd := r.FormValue("password")
	s, _ := server.s.store.Get(r, server.s.name)
	s.Values["email"] = email
	s.Values["auth"] = true
	auth, ok := s.Values["auth"].(bool)
	if (!ok || !auth) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	s.Save(r, w)
	// fmt.Println("cookie from login:", s, "\nrequest data:", r)
	client, err := _client.GetClient(email, pwd, GetIP(r).String())
	if err != nil {
		fmt.Fprintf(w, "Failed to log in: %s", err.Error())
	} else {
		server.Clients[email] = client
		// fmt.Fprintf(w, "Welcome %s", client.UD.EMAIL)
	}
	// if err != nil { _error.Handle("GetClient() in HandleLoginPost() failed", err) }
	http.Redirect(w, r, "http://localhost:8080/", http.StatusSeeOther) //301 >> redirection
}

func (server *ClientServer)HandleSignUp(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "sign_up.html", id) //nil = template data
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
	http.Redirect(w, r, DOMAIN + "/captcha", http.StatusSeeOther) //301 >> redirection
}

func (server *ClientServer)HandleCaptcha(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "captcha.html", id) //nil = template data
}

func (server *ClientServer)HandleHome(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "home.html", id) //nil = template data
}

func (server *ClientServer)HandleShowcase(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase.html", id) //nil = template data
}

// server.HandleMisc
func (server *ClientServer)HandleMisc(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_misc.html", id) //nil = template data
}

func (server *ClientServer)HandleTypeWriter(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_typewriter.html", id) //nil = template data
}

func (server *ClientServer)HandleTypeFader(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_typefader.html", id) //nil = template data
}

func (server *ClientServer)HandleTypeDecoder(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_typedecoder.html", id) //nil = template data
}

func (server *ClientServer)HandleMsgBox(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_msgbox.html", id) //nil = template data
}

func (server *ClientServer)Handle1Bit(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_1_bit.html", id) //nil = template data
}

func (server *ClientServer)HandleProcGen(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_proc_gen.html", id) //nil = template data
}

func (server *ClientServer)HandleFracTrees(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_frac_trees.html", id) //nil = template data
}

func (server *ClientServer)HandleFinance(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_finance.html", id) //nil = template data
}

func (server *ClientServer)HandleStockGen(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_stock_gen.html", id) //nil = template data
}

func (server *ClientServer)HandleStockChartist(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_stock_chartist.html", id) //nil = template data
}

func (server *ClientServer)HandleStockHeatmap(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_stock_heatmap.html", id) //nil = template data
}

func (server *ClientServer)HandleStockAnalyzer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_stock_analyzer.html", id) //nil = template data
}

func (server *ClientServer)HandleCryptoMarketCap(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_crypto_market_cap.html", id) //nil = template data
}

func (server *ClientServer)HandleCryptoHeatmap(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_crypto_heatmap.html", id) //nil = template data
}

func (server *ClientServer)HandleGaming(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_gaming.html", id) //nil = template data
}

func (server *ClientServer)HandlePong(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_pong.html", id) //nil = template data
}

func (server *ClientServer)HandleTron(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_tron.html", id) //nil = template data
}

func (server *ClientServer)HandleSnake(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_snake.html", id) //nil = template data
}

func (server *ClientServer)HandleTetris(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_tetris.html", id) //nil = template data
}

func (server *ClientServer)HandleAsteroids(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_asteroids.html", id) //nil = template data
}

func (server *ClientServer)HandleMineSweeper(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_minesweeper.html", id) //nil = template data
}

func (server *ClientServer)HandleSpaceInvaders(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "showcase_space_invaders.html", id) //nil = template data
}

// websockets
func (server *ClientServer)HandleWebsocket(w http.ResponseWriter, r *http.Request,  _ httprouter.Params) {
	var err error

	// if r.Header.Get("Origin") != "http://"+r.Host {
	// 	http.Error(w, "Origin not allowed", 403) // same as forbidden below
	// 	return
	// }
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
	client := server.Clients[visitor_id]
	fmt.Println("visitor_id:", visitor_id)
	fmt.Println("client:", client)
	if client != nil { //set websocket only once per user
		if client.WS_CONN == nil {
			client.WS_CONN, err = websocket.Upgrade(w, r, w.Header(), 1024, 1024)
			if err != nil {
				http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
			}
			go client.Listen() // listen and server on /ws
		}//else { fmt.Println("client", email, "is already bound") }
	}//else { fmt.Println("client", email, "isn't on the server's stack") }
	// fmt.Fprint(w, "There is nothing for you here if you are not a WebSocket nor an API :(")
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
	// root handlers
	server.router.GET("/", server.HandleRoot)
	server.router.GET("/ws", server.HandleWebsocket)
	server.router.GET("/captcha", server.HandleCaptcha)
	server.router.GET("/home", server.HandleHome)
	server.router.GET("/showcase", server.HandleShowcase)
	// showcase MISCELLANEOUS handlers
	server.router.GET("/showcase/misc", server.HandleMisc)
	server.router.GET("/showcase/misc/_1_bit", server.Handle1Bit)
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

	// log-in and sign-in routes
	server.router.GET("/log_in", server.HandleLogIn)
	server.router.GET("/sign_up", server.HandleSignUp)
	server.router.POST("/log_in_post", server.HandleLogInPost) // user login request
	server.router.POST("/sign_up_post", server.HandleSignUpPost) // user login request
	// local files exposed from static/:
	server.router.ServeFiles("/static/*filepath", http.Dir(static_dir)) // static dir fileserver
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
	server := NewClientServer("../static", APP_PORT)
	fmt.Println(server.s)
}
