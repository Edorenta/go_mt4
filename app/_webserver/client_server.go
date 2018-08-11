package _webserver

import (
	// "net"
	_ws "../_websockets"
	"strconv"
	"os"
	"os/signal"
	"net/http"
	"html/template"
	"github.com/julienschmidt/httprouter"
)

type ClientServer struct {
	t *template.Template
	fs http.Handler
	ws *_ws.WS
	Port uint16
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

func (cs *ClientServer)RenderIndex(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	cs.t.ExecuteTemplate(w, "index.html", nil) //nil = template data
}

func (cs *ClientServer)Start(is_ready chan bool) {
	router := httprouter.New()

	router.GET("/", cs.RenderIndex)
	router.GET("/ws", cs.ws.Handle)
	// router.GET("/login", cs.RenderLogin)
	//...
	is_ready <- true
	go func() {
		log.Fatal(http.ListenAndServe(":" + strconv.Itoa(int(cs.Port)), router)) //,nil = default http handler
	}
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interupt, os.Kill)
	<- c
	// BackUp()
}

func NewClientServer(static_dir string, port uint16)(*ClientServer) { //static_dir = ../static
	var cs ClientServer

	cs.Port = port
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
