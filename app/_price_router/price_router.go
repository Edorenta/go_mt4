package main

import(
		"net"
		"fmt"
		"bufio"
		"strings"
		//"encoding/csv"
		"strconv"
)


type Server struct {
	ln net.Listener
	conn net.Conn
	scanner bufio.Scanner
}

type Tick struct {
	ask float64
	bid float64
	time uint64
	// volume uint
}

type Feed struct {
	tick Tick
	line string
	new_line bool
	new_data bool
}

type PriceRouter struct {
	server Server
	feed Feed
	port uint16
	err error
}

func (pr *PriceRouter)ServerInit() {
	pr.server.ln, pr.err = net.Listen("tcp", ":" + strconv.Itoa(int(pr.port)))
	if (pr.err != nil) { handle_error("net.Listen() failed", pr.err) }
	fmt.Println("Price server deployed on port", pr.port)
}

func (pr *PriceRouter)FeederConnect() { // method = ptr or not ptr?
	fmt.Println("Waiting for Feeder to connect")
	pr.server.conn, pr.err = pr.server.ln.Accept()
	if (pr.err != nil) { handle_error("ln.Accept() failed", pr.err) }
	fmt.Println("Feeder connected")
	pr.server.scanner = *(bufio.NewScanner(pr.server.conn))
	fmt.Println("Scanner set")
}

func (pr *PriceRouter)GetFeed() {
	for {
		if (pr.server.scanner.Scan() == false) {
			fmt.Println("Stoped Scanning")
			pr.err = pr.server.scanner.Err()
			if (pr.err != nil) { handle_error("scanner.Scan() failed", pr.err) }
			s.FeederConnect()
			continue
		}
		f.line = s.scanner.Text()
		if (f.line != "") {
			f.new_line = true
			go f.Parse()
		}
	}
}

func (pr *PriceRouter)Start(is_ready chan bool) {
	pr.ServerInit()
	pr.FeederConnect()
	is_ready = true
	pr.GetFeed()
}

func (f *Feed)Parse() {
	var s []string//init?

	// for {
		if (f.new_line) {
			f.new_line = false
			s = strings.Split(f.line, ",")
			f.tick.time, f.err = strconv.ParseUint(s[0], 10, 32)
			f.tick.ask, f.err = strconv.ParseFloat(s[1], 64)
			f.tick.bid, f.err = strconv.ParseFloat(s[2], 64)
			if (f.err != nil) { handle_error("Failed to parse in handle_feed()", f.err) }
			f.new_data = true
			go f.Handle()
			// time, ask, bid = s[0], s[1], s[2]
		}
	// }
}

func (f *Feed)Handle() {
	// for {
		if (f.new_data) {
			f.new_data = false
			fmt.Println(f.tick.time, f.tick.bid, f.tick.ask)
		}
	// }
}

func NewPriceRouter(port uint16)(*PriceRouter) {
	var pr PriceRouter
	
	pr.port = port
	pr.feed.new_line = false //feed cannot be fetched yet
	pr.feed.new_data = false //feed cannot be parsed yet
	is_ready := make(chan bool)
	go pr.Start(is_ready)
	<- is_ready
	return &pr
}
