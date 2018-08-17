package _webserver

import (
	// "net"
	_c "../_const"
	_ws "../_websockets"
	"../_client"
	"strconv"
	"os"
	"os/signal"
	"net/http"
	"html/template"
	"github.com/julienschmidt/httprouter"
)

type ClientServer struct {
	// db *_db.DB
	Client map[int]*_client.Client
	router *httprouter.Router
	t *template.Template
	fs http.Handler
	ws *_ws.WS
	host string
}

func parse_html_files()(*template.Template) {
	//can also use template.ParseGlob("*.html")
	tpl := template.Must(template.ParseFiles(
		"./static/html/head.html",
		"./static/html/header.html",
		"./static/html/navbar.html",
		"./static/html/footer.html",
		"./static/html/index_body.html",
		"./static/html/index.html"))
	return tpl
}

func GetIP(r *http.Request) net.IP {
	ip, port, err := net.SplitHostPort(r.RemoteAddr)

    if err != nil { fmt.Fprintf(w, "userip: %q is not IP:port", r.RemoteAddr); return "" }
    return net.ParseIP(ip)
}

func (cs *ClientServer)HandleIndex(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	cs.t.ExecuteTemplate(w, "index.html", nil) //nil = template data
}

func (cs *ClientServer)HandleWebsocket(w http.ResponseWriter, r *http.Request,  _ httprouter.Params) {
	var err error

	// if r.Header.Get("Origin") != "http://"+r.Host {
	// 	http.Error(w, "Origin not allowed", 403)
	// 	return
	// }
	if ws.nb_conn == _c.MAX_CONN {
		http.Error(w, "Client socket connection error: clients cap reached", 403)
		return
	} else {

		next := ws.NextFreeSlot()
		ws.conn[next], err = websocket.Upgrade(w, r, w.Header(), 1024, 1024)
		if err != nil {
			http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
		}
		ws.nb_conn++
		go ws.InitConnection(next)
	}
}

func (cs *ClientServer)Start(is_ready chan bool) {
	cs.router := httprouter.New()

	cs.router.GET("/", cs.HandleIndex)
	cs.router.GET("/ws", cs.HandleWebsocket)
	// router.GET("/login", cs.RenderLogin)
	//...
	is_ready <- true
	go func() {
		if _c.HTTPS {
			log.Fatal("HTTPS server error: ", http.ListenAndServeTLS(cs.host, _c.SSL_CRT_PATH, _c.SSL_KEY_PATH, cs.router))
		} else {
			log.Fatal("HTTP server error: ", http.ListenAndServe(cs.host, cs.router))
		}
	}
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interupt, os.Kill)
	<- c
	// BackUp()
}

func NewClientServer(static_dir string, port uint16)(*ClientServer) { //static_dir = ../static
	var cs ClientServer

	cs.host = ":" + strconv.Itoa(int(cs.Port))
	cs.fs = http.FileServer(http.Dir(static_dir))
	cs.ws = _ws.NewWebsocket()
	cs.t = parse_html_files()
	http.Handle("/static/", http.StripPrefix("/static/", cs.fs))
	// h := http.FileServer(http.Dir("./"))
	is_ready := make(chan bool)
	go cs.Start(is_ready)
	<- is_ready
	return &cs
}
