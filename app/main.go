package main

import (
	"fmt"
	_c "./_const"
	// "./_db"
	// "./_logger"
	// "./_tracker"
	// "./_trader"
	//...
	_cs "./_webserver" //cs = client server
	_pr "./_price_router"
	_ir "./_info_router"
)

type APP struct {
	cs _cs.ClientServer		// client webserver
	ir _ir.InfoRouter		// unique info router (for general broker / acc info)
	pr []_pr.PriceRouter	// list of deployed price routers (max 1 per quote)
}

func NewApp()(*APP) {
	var app APP

	app.cs = *_cs.NewClientServer("./static", _c.APP_PORT)
	app.ir = *_ir.NewInfoRouter(_c.IR_PORT)
	// app.pr = _pr.NewPriceRouter
	return &app
}

func (app *APP)NewFeed(port uint16, client int, mode string) {
	// var new_feed = _pr.AddFeed(port, client, mode)
	for i := 0; i < len(app.pr); i++ { // stop when app.pr[i] != nil
		if app.pr[i].Port == port {
			if mode == "log" { app.pr[i].StartLogger() } else
			if mode == "calc" { app.pr[i].Mode_calc = true } else
			if mode == "sub" { app.pr[i].AddClient(client) }
			// return
		} else {
			new_pr := _pr.NewPriceRouter(port, client, mode)
			if new_pr != nil { app.pr = append(app.pr, *new_pr) }
		}
	}
}

func main() {
	app := *NewApp()
	fmt.Println(">> Application deployed on port", app.cs.Port, " <<")
	app_exit := make(chan bool)
	<- app_exit
}
