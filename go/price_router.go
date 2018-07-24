package main

import(
		"net"
		"fmt"
		"log"
		"bufio"
		"strings"
		//"encoding/csv"
		//"github.com/gorilla/websocket"
		"strconv"
)

const PORT uint16 = EURUSD_PORT

type Tick struct {
	ask float64
	bid float64
	time uint
	// volume uint
}

type Feed struct {
	tick Tick
	line string
	new_line bool
	new_data bool
}

type Server struct {
	ln net.Listener
	conn net.Conn
	scanner bufio.Scanner
}

func handle_error(msg string, err error) {
	// fmt.Println(msg)
	log.Fatalln(msg + "\n", err.Error())
	panic(err)
}

// func server_init()(net.Listener) {
// 	ln, err := net.Listen("tcp", ":" + strconv.Itoa(int(PORT)))
// 	if (err != nil) { handle_error("net.Listen() failed", err) }
// 	fmt.Println("Price server deployed on port", PORT)
// 	return (ln)
// }

// func get_client(ln net.Listener)(net.Conn, bufio.Scanner) {
// 	fmt.Println("Waiting for client to connect")
// 	conn, err := ln.Accept()
// 	if (err != nil) { handle_error("ln.Accept() failed", err) }
// 	fmt.Println("Client connected")
// 	scanner := *(bufio.NewScanner(conn))
// 	fmt.Println("Scanner set")
// 	return conn, scanner
// }

// func start_server(f *Feed) {
// 	listener := server_init()
// 	_, scanner := get_client(listener);
// 	for {
// 		if (scanner.Scan() == false) {
// 			fmt.Println("Stoped Scanning")
// 			err := scanner.Err()
// 			if (err != nil) { handle_error("scanner.Scan() failed", err) }
// 			_, scanner = get_client(listener)
// 			continue
// 		}
// 		if ((*f.line = scanner.Text()) != "")
// 			*f.new_line = true
// 	}
// }

func (s *Server)Init() {
	*s.ln, err := net.Listen("tcp", ":" + strconv.Itoa(int(PORT)))
	if (err != nil) { handle_error("net.Listen() failed", err) }
	fmt.Println("Price server deployed on port", PORT)
}

func (s *Server)GetClient() { // method = ptr or not ptr?
	fmt.Println("Waiting for client to connect")
	*s.conn, err := ln.Accept()
	if (err != nil) { handle_error("ln.Accept() failed", err) }
	fmt.Println("Client connected")
	*s.scanner := *(bufio.NewScanner(*s.conn))
	fmt.Println("Scanner set")
}

func (s *Server)Start(f *Feed) {
	*s.Init()
	*s.GetClient()
	for {
		if (*s.scanner.Scan() == false) {
			fmt.Println("Stoped Scanning")
			err := *s.scanner.Err()
			if (err != nil) { handle_error("scanner.Scan() failed", err) }
			*s.GetClient()
			continue
		}
		if ((*f.line = *s.scanner.Text()) != "")
			*f.new_line = true
	}
}

func (f *Feed)Parse() {
	var s []string//init?
	var prev string = ""

	for {
		if (*f.new_line) {
			*f.new_line = false
			s = strings.Split(*f.line, ",")
			*f.tick.time, err := strconv.ParseUint(s[0], 10, 32)
			*f.tick.ask, err := strconv.ParseFloat(s[1], 64)
			*f.tick.bid, err := strconv.ParseFloat(s[2], 64)
			if (err != nil) { handle_error("Failed to parse in handle_feed()", err) }
			*f.new_data = true
			// time, ask, bid = s[0], s[1], s[2]
		}
	}
}

func (f *Feed)Handle() {
	for {
		if (*f.new_data) {
			*f.new_data = false
			fmt.Println(*f.tick.time, *f.tick.bid, *f.tick.ask)
		}
	}
}

func main() {
	var server Server
	var feed Feed

	feed.new_line = false //feed cannot be fetched yet
	feed.new_data = false //feed cannot be parsed yet
	go feed.Handle()
	go feed.Parse()
	go server.Start(&f)
}
