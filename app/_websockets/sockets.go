package _websockets
// package main // only for unit tests

import (
	"fmt"
	"strings"
	"net/http"
	"github.com/gorilla/websocket"
	_c "../_const"
)

func Listen(wsconn *websocket.Conn, id int, s chan string) {
	// var s []string
	// var m string
	var err error

	fmt.Println("Client #", id, "connected")
	for {
		s = ""
		// websocket.JSON.Receive(ws, &m) /websocket.JSON.Send(ws, m) also work
		err = wsconn.ReadJSON(&s)
		if err != nil { fmt.Println("Client #", id, "disconnected"); return } /*_error.Handle("Error reading json.", err)*/
	}
}

func Handle(w http.ResponseWriter, r *http.Request,  _ httprouter.Params) {
	// if r.Header.Get("Origin") != "http://"+r.Host {
	// 	http.Error(w, "Origin not allowed", 403)
	// 	return
	// }
	if ws.nb_conn == _c.MAX_CONN {
		http.Error(w, "Client socket connection error: clients cap reached", 403)
		return
	} else {

		next := ws.NextFreeSlot()
		wsconn, err := websocket.Upgrade(w, r, w.Header(), 1024, 1024)
		if err != nil {	http.Error(w, "Could not open websocket connection", http.StatusBadRequest) }
		go Listen(next)
	}
}

func NewWebsocket()(*WS) {
	var ws WS

	ws.nb_conn = -1
	return &ws
}
