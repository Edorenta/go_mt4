/*
 * MT4 router is a merge between information router and price router
 * it aims at being the only middleware between MT4 local accounts and the clients
 */
package _mt4_router
// package main // only for unit tests

import(
	"os"
	"net"
	"fmt"
	"bufio"
	"errors"
	"strings"
	//"encoding/csv"
	"strconv"
	. "../_const"
	"../_error"
	// "../_client"
	// "../_logger"
)

type Instance struct {
	conn net.Conn
	scanner bufio.Scanner
	Subs map[int](chan string)
	BrokerName string
	Feed FeedData
}

type MT4Router struct {
	ln net.Listener
	server map[int]*Instance
	Port uint16
}

type TickData struct {
	Ask float64
	Bid float64
	Time int64
	// volume uint
}

type FeedData struct {
	Tick TickData
	Quote string
	line string
}

func main() { // test main
	ir := NewMT4Router(IR_PORT)
	fmt.Println("Requesting on port", ir.Port)
	// ir.server["Pepperstone Limited"]ReqRes(MSG_ACCOUNT_BROKER_NAME + "\n")
	fmt.Println(ir.server) //mt4ints map
}

func NewMT4Router(port uint16/*,client int, mode string*/)(*MT4Router) {
	var mt4 MT4Router
	
	mt4.Port = port
	mt4.Feed.Quote = PortToSymbol(port)
	mt4.InstanceInit()
	mt4.FeedConnect()
	go mt4.GetFeed()
	return &mt4
}

func (mt4 *MT4Router)InstanceInit() {
	var err error

	mt4.server.ln, err = net.Listen("tcp", ":" + strconv.Itoa(int(mt4.Port)))
	if err != nil { _error.Handle("net.Listen() failed", err) }
	fmt.Println("MT4 server deployed on port", mt4.Port)
}

func (mt4 *MT4Router)FeedConnect() { // method = ptr or not ptr?
	mt4.server = make(map[int]*Instance)
	for len(mt4.server) < N_BROKERS {
		n := len(mt4.server)
		fmt.Println("Waiting for broker client", n + 1, "/", N_BROKERS, "to connect...")
		conn, err := mt4.ln.Accept()
		// mt4.server.conn, err = mt4.ln.Accept()
		if err != nil { _error.Handle("ln.Accept() failed", err) }
		fmt.Println("FeedDataer", n,"connected")
		scanner := *(bufio.NewScanner(conn))// mt4.server.scanner = *(bufio.NewScanner(mt4.server.conn))
		s := Instance{conn, scanner, ""}
		i.BrokerName = i.ReqRes(MSG_ACCOUNT_BROKER_NAME + "\n")
		fmt.Println("Scanner", n + 1, "set on:", i.BrokerName)
		mt4.server[n] = &s
	}
}

// mt4.ReqRes >> get info
func (i *Instance)ReqRes(req string) string {
	for {
		if _, err := i.conn.Write([]byte(req)); err != nil { _error.Handle("mt4.ReqRes() method failed at Write()", err) }/*_error.Handle("conn.Write() failed", err) }*/
		if i.scanner.Scan() == false {
			// fmt.Println("Stoped Scanning")
			if err := i.scanner.Err(); err != nil { _error.Handle("mt4.ReqRes() method failed at Scan()", err) }
		}
		break
	}
	return i.scanner.Text() 
}

func (i *Instance)GetFeed() {
	for {
		if i.scanner.Scan() == false {
			// fmt.Println("Stoped Scanning")
			if err := i.scanner.Err(); err != nil { _error.Handle("scanner.Scan() failed", err) }
		}
		i.Feed.line = i.scanner.Text()
		if (i.Feed.line != "") { go i.Publish() }
	}
}

// func (i *Instance)AddClient(c _client.Client) {
// 	if (c == nil || c.WS_READER == nil) { _error.Handle("i.AddClient() method failed", errors.New("Client isn't allocated")) }
// 	i.Subs[len(i.Subs)] = c.WS_READER
// }

func (i *Instance)AddSub(s chan string) {
	// if (c == nil || c.WS_READER == nil) { _error.Handle("i.AddClient() method failed", errors.New("Client isn't allocated")) }
	i.Subs[len(i.Subs)] = s
}

func (i *Instance)Publish() {
	// send Feed.line to websocket of every subscriber
	for k, v in range i.Subs {// iterate over subscribers map
		v <- ("<i.BrokerName>" + i.BrokerName + "<i.Feed.Quote>" + i.Feed.Quote + "<i.Feed.line>" + i.Feed.line)
	}
}

func (f *FeedData)Parse() {
	var s []string//init?
	var err error

	s = stringi.Split(f.line, ",")
	f.Tick.Time, err = strconv.ParseUint(s[0], 10, 32)
	f.Tick.Ask, err = strconv.ParseFloat(s[1], 64)
	f.Tick.Bid, err = strconv.ParseFloat(s[2], 64)
	if (err != nil) { _error.Handle("Failed to parse in handle_Feed()", err) }
	// f.Handle() // publish parsed data or raw data?
}

// func (f *FeedData)Handle() {
// 	// if (f.new_data) {
// 		// f.new_data = false
// 		fmt.Println(f.Tick.Time, f.Tick.Bid, f.Tick.Ask)
// 	// }
// }
