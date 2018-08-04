package _server

import (
	"fmt"
	"strings"
	"github.com/gorilla/websocket"
)

type WS struct {
	conn [MAX_CONN]*websocket.Conn
	err error
	nb_conn int
}

func (ws *WS)DeinitConnection(index int) {
	ws.conn[index] = nil
	ws.nb_conn--
	fmt.Println("Client #", index + 1, "disconnected")
}

func (ws *WS)InitConnection(index int) {
	fmt.Println("Client #", index + 1, "connected")
	ws.ReqRes(index)
}

func (ws *WS)ReqRes(index int) {
	var s []string
	var m string

	for {
		m = ""
		// websocket.JSON.Receive(ws, &m) /websocket.JSON.Send(ws, m) also work
		ws.err = ws.conn[index].ReadJSON(&m)
		if ws.err != nil { ws.DeinitConnection(index); return } /*handle_error("Error reading json.", err)*/
		s = strings.Split(m, ",")
		fmt.Println("req tokens:", s)
		switch s[0] {
			case MSG_START_TERM_FEED :
				// fmt.Println("Recd:", m)
				go ws.StartRouter()
		}
	}
}

func (ws *WS)NextFreeSlot()(int) {
	for i := 0; i < MAX_CONN; i++ {
		if ws.conn[i] == nil { return i }
	}
	return -1
}

func (ws *WS)Handle(w http.ResponseWriter, r *http.Request) {
	// if r.Header.Get("Origin") != "http://"+r.Host {
	// 	http.Error(w, "Origin not allowed", 403)
	// 	return
	// }
	if ws.nb_conn == MAX_CONN {
		http.Error(w, "Client socket connection error: clients cap reached", 403)
		return
	} else {
		next := ws.NextFreeSlot()
		ws.conn[next], ws.err = websocket.Upgrade(w, r, w.Header(), 1024, 1024)
		if ws.err != nil {
			http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
		}
		ws.nb_conn++
		go ws.InitConnection(next)
	}
}
