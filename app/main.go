package main

import (
	// "io"
	// "fmt"
	// "strings"
	// "net/http"
	// "html/template"
	// "github.com/gorilla/websocket"
	"./_const"
	"./_server"
	"./_db"
	_pr "./_price_router"
	// "./_info_router"
)

type APP struct {
	tpl _server.TPL
	ws _server.WS
	pr _pr.PriceRouter
}

func (app *APP)StartRouter() {
	if (app.pr == nil) { app.pr = _pr.NewPriceRouter() }
}

func main() {
	_server.Init()
}
