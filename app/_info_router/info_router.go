package _info_router
// package main

import(
	"net"
	"fmt"
	"bufio"
	"strconv"
	_c "../_const" // only for test main
	"../_error"
)

type Server struct {
	conn net.Conn
	scanner bufio.Scanner
}

type InfoRouter struct {
	ln net.Listener
	server map[string]*Server
	Port uint16
}

func (ir *InfoRouter)ServerInit() {
	var err error

	ir.ln, err = net.Listen("tcp", ":" + strconv.Itoa(int(ir.Port)))
	if (err != nil) { _error.Handle("net.Listen() failed", err) }
	fmt.Println("Request server deployed on port", ir.Port)
}

func (ir *InfoRouter)FeedConnect() { // method = ptr or not ptr?
	ir.server = make(map[string]*Server)
	for len(ir.server) < _c.N_BROKERS {
		n := len(ir.server) + 1
		fmt.Println("Waiting for broker client", n, "/", _c.N_BROKERS, "to connect...")
		conn, err := ir.ln.Accept()
		// ir.server.conn, err = ir.ln.Accept()
		if (err != nil) { _error.Handle("ln.Accept() failed", err) }
		fmt.Println("Feeder", n,"connected")
		scanner := *(bufio.NewScanner(conn))// ir.server.scanner = *(bufio.NewScanner(ir.server.conn))
		s := Server{conn, scanner}
		broker_name := s.ReqRes(_c.MSG_ACCOUNT_BROKER_NAME + "\n")
		fmt.Println("Scanner", n, "set on:", broker_name)
		ir.server[broker_name] = &s
	}
}

func (s *Server)ReqRes(req string)(string) {
	var err error

	// TEST REQUEST:
	// req = MSG_QUOTE_CONCAT + "\n"//+ ",EURUSD\n"
	for {
		_, err = s.conn.Write([]byte(req))
		if (err != nil) { return "Err"/*_error.Handle("conn.Write() failed", err) }*/
// Reconnect:
// 			ir.FeedConnect()
// 			continue
		}
		if (s.scanner.Scan() == false) {
			fmt.Println("Stoped Scanning")
			err = s.scanner.Err()
			if (err != nil) { /*_error.Handle("scanner.Scan() failed", err)*/
				return "Err"
			}
		}
		break
	}
	res := s.scanner.Text()
	// fmt.Println("Req:", req)
	// fmt.Println("Res:", res)
	return res 
}

func (ir *InfoRouter)Start(is_ready chan bool) {
	ir.ServerInit()
	ir.FeedConnect()
	is_ready <- true
}

func NewInfoRouter(port uint16)(*InfoRouter) {
	var ir InfoRouter

	ir.Port = port
	is_ready := make(chan bool)
	go ir.Start(is_ready)
	<- is_ready
	return &ir
}

// func main() { // test main
// 	ir := NewInfoRouter(_c.IR_PORT)
// 	fmt.Println("Requesting on port", ir.Port)
// 	// ir.server["Pepperstone Limited"]ReqRes(_c.MSG_ACCOUNT_BROKER_NAME + "\n")
// 	fmt.Println(ir.server) //prints map
// }
