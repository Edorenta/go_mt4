package _server

import (
	"net"
	"net/http"
	"html/template"
	// "github.com/gorilla/websocket"
)

type TPL struct {
	t *template.Template
}

func Init() {
	var tpl TPL
	var ws WS

	ws.nb_conn = -1
	fs := http.FileServer(http.Dir("../static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	tpl.t = parse_html_files()
	// h := http.FileServer(http.Dir("./"))
	http.HandleFunc("/", tpl.RenderIndex)
	http.HandleFunc("/ws", ws.Handle)
	panic(http.ListenAndServe(":" + APP_PORT, nil)) //nil = default http handler
}

func parse_html_files()(*template.Template) {
	//can also use template.ParseGlob("*.html")
	tpl := template.Must(template.ParseFiles(
		"../static/html/head.html",
		"../static/html/header.html",
		"../static/html/navbar.html",
		"../static/html/footer.html",
		"../static/html/index_body.html",
		"../static/html/index.html"))
	return tpl
}

func (tpl *TPL)RenderIndex(w http.ResponseWriter, r *http.Request) {
	tpl.t.ExecuteTemplate(w, "index.html", nil) //nil = template data
}
