// package _webserver
package main

import (
	// _ws "../_websockets"
	. "../_const"
	"../_error"
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
	tpl := template.Must(template.ParseFiles(
		// generics
		"../static/html/generic_head.html",
		"../static/html/generic_header.html",
		"../static/html/generic_navbar.html",
		"../static/html/generic_footer.html",
		// page specific heads
		"../static/html/index_head.html",
		"../static/html/log_in_head.html",
		"../static/html/sign_up_head.html",
		// page specific bodies
		"../static/html/index_body.html",
		"../static/html/log_in_body.html",
		"../static/html/sign_up_body.html",
		// page rendering templates
		"../static/html/index.html",
		"../static/html/log_in.html",
		"../static/html/sign_up.html")) //could use a wildcard as well, but better readability
	return tpl
}

//  https://     user:pass  @host.com:8000/  path   ?key=value     #fragment
//>>scheme, authentication info, host, port, path, query params, query fragment
func GetParams(r *http.Request, key string) string {
	// uri := req.URL.RequestURI()
	// clean_uri, err := url.PathUnescape(uri)
	// if err != nil { _error.Handle("PathUnescape() failed", err) }
	query_val := r.URL.Query()
	val, err := url.QueryUnescape(query_val.Get(key))
	if err != nil { _error.Handle("QueryUnescape() failed", err) }
    return val
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
	auth, _ := s.Values["auth"].(bool)
	// if !ok { http.Error(w, "Forbidden", http.StatusForbidden) } //
	visitor_id, _ := s.Values["email"].(string)
	// fod, _ := s.Values["fod"].(bool)
	// if !ok { http.Error(w, "Forbidden", http.StatusForbidden) } // couldn't read cookie
	// temporarily set user as visitor if he just arrived to the site
	if (!auth && visitor_id == "") {
		visitor_id = string(_scrypt.SaltGenerate(32))
		s.Values["email"] = visitor_id
		s.Values["auth"] = false
		// s.Values["fod"] = false
		s.Save(r, w)
		client := _client.NewVisitor(visitor_id/*, GetIP(r).String()*/)
		server.Clients[visitor_id] = client
	} else {
		visitor_id, _ = s.Values["email"].(string)
		// client := server.Clients[visitor_id]
	}
	// fmt.Println("cookie from index:", s, "\nrequest data:", r)
	// if err != nil { _error.Handle("GetClient() in HandleIndex() failed", err) }
	fmt.Println("visitor_id:", visitor_id)
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
	http.Redirect(w, r, "http://localhost:8080/", http.StatusSeeOther) //301 >> redirection
}

func (server *ClientServer)HandleIndex(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// var err error
	id := server.VerifySessionID(w, r)
	server.t.ExecuteTemplate(w, "index.html", id) //nil = template data
}

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
	email := GetParams(r, "email")
	client := server.Clients[email]
	if client != nil { //set websocket only once per user
		if client.WS_CONN == nil {
			client.WS_CONN, err = websocket.Upgrade(w, r, w.Header(), 1024, 1024)
			if err != nil {
				http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
			}
			go client.Listen() // listen and server on /ws
		}//else { fmt.Println("client", email, "is already bound") }
	}//else { fmt.Println("client", email, "isn't on the server's stack") }
	fmt.Fprint(w, "There is nothing for you here if you are not a WebSocket nor an API :(")
}

func (server *ClientServer)SigKill() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, os.Kill)
	<- c
	// BackUp()// called whenever server is stopped with ctrl + c or killed
}

func NewClientServer(static_dir string, port uint16)(*ClientServer) { //static_dir = ../static
	var server ClientServer

	// host settings	
	server.host		= ":" + strconv.Itoa(int(port))
	// template settings
	server.t		= parse_html_files()
	// database settings
	server.db		= _client.DB
	// client map settings
	server.Clients 	= make(map[string]*_client.Client)
	// httprouter settings
	server.router = httprouter.New()
	server.router.GET("/", server.HandleIndex)
	server.router.GET("/ws", server.HandleWebsocket)
	server.router.GET("/log_in", server.HandleLogIn)
	server.router.GET("/sign_up", server.HandleSignUp)
	server.router.POST("/log_in_post", server.HandleLogInPost) // user login request
	server.router.POST("/sign_up_post", server.HandleSignUpPost) // user login request
	server.router.ServeFiles("/static/*filepath", http.Dir(static_dir)) // static dir fileserver
	// gorilla session settings (cookies & co)
	server.s.key	= []byte("404a484c93d182ec2ae17d0296c0fe33") //MD5 of go_mt4
	server.s.name	= "go_mt4_session"
	server.s.store	= sessions.NewCookieStore(server.s.key)
	server.s.store.Options = &sessions.Options{
	    Path:     "/",
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
