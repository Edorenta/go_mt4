package _websockets

import (
	"fmt"
	"strings"
	"net/http"
	"github.com/gorilla/websocket"
	_c "../_const"
	"../_client"
)

type WS struct {
	// []clients _client.Client
	conn [_c.MAX_CONN]*websocket.Conn
	nb_conn int
}

func (ws *WS)DeinitConnection(client_id int) {
	ws.conn[client_id] = nil
	ws.nb_conn--
	fmt.Println("Client #", client_id + 1, "disconnected")
}

func (ws *WS)InitConnection(client_id int) {
	fmt.Println("Client #", client_id + 1, "connected")
	ws.ReqRes(client_id)
}

func (ws *WS)ReqRes(client_id int) {
	var s []string
	var m string
	var err error

	for {
		m = ""
		// websocket.JSON.Receive(ws, &m) /websocket.JSON.Send(ws, m) also work
		err = ws.conn[client_id].ReadJSON(&m)
		if err != nil { ws.DeinitConnection(client_id); return } /*_error.Handle("Error reading json.", err)*/
		s = strings.Split(m, ",")
		// fmt.Println("req tokens:", s)
		switch s[0] {
			// case _c.MSG_START_TERM_FEED :
				// fmt.Println("Recd:", m)
				// go ws.StartRouter()
		}
	}
}

func (ws *WS)NextFreeSlot()(int) {
	for i := 0; i < _c.MAX_CONN; i++ {
		if ws.conn[i] == nil { return i }
	}
	return -1
}

func (ws *WS)Handle(w http.ResponseWriter, r *http.Request,  _ httprouter.Params) {
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

func NewWebsocket()(*WS) {
	var ws WS

	ws.nb_conn = -1
	return &ws
}
