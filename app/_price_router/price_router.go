package _price_router

import(
	"os"
	"net"
	"fmt"
	"bufio"
	"strings"
	//"encoding/csv"
	"strconv"
	_c "../_const"
	"../_error"
	"../_logger"
)

type Server struct {
	conn net.Conn
	scanner bufio.Scanner
	BrokerName string
	feed Feed
}

type PriceRouter struct {
	ln net.Listener
	server map[int]*Server
	logger _logger.Logger
	// Mode_log bool
	// Mode_pub bool
	// Mode_calc bool
	clients []int
	Port uint16
}

type Tick struct {
	ask float64
	bid float64
	time uint64
	// volume uint
}

type Feed struct {
	tick Tick
	quote string
	line string
	// new_line bool
	// new_data bool
}

func (pr *PriceRouter)ServerInit() {
	var err error

	pr.server.ln, err = net.Listen("tcp", ":" + strconv.Itoa(int(pr.Port)))
	if (err != nil) { _error.Handle("net.Listen() failed", err) }
	fmt.Println("Price server deployed on port", pr.Port)
}

func (pr *PriceRouter)FeedConnect() { // method = ptr or not ptr?
	pr.server = make(map[int]*Server)
	for len(pr.server) < _c.N_BROKERS {
		n := len(pr.server)
		fmt.Println("Waiting for broker client", n + 1, "/", _c.N_BROKERS, "to connect...")
		conn, err := pr.ln.Accept()
		// pr.server.conn, err = pr.ln.Accept()
		if (err != nil) { _error.Handle("ln.Accept() failed", err) }
		fmt.Println("Feeder", n,"connected")
		scanner := *(bufio.NewScanner(conn))// pr.server.scanner = *(bufio.NewScanner(pr.server.conn))
		s := Server{conn, scanner, ""}
		s.BrokerName = s.ReqRes(_c.MSG_ACCOUNT_BROKER_NAME + "\n")
		fmt.Println("Scanner", n + 1, "set on:", s.BrokerName)
		pr.server[n] = &s
	}
}

func (s *Server)GetFeed(broker_index int) {
	var err error

	for {
		if (s.scanner.Scan() == false) {
			fmt.Println("Stoped Scanning")
			err = s.scanner.Err()
			if (err != nil) { return "Err" }
			 /*_error.Handle("scanner.Scan() failed", err)*/
		}
		s.feed.line = s.scanner.Text()
		if (s.feed.line != "") {
			// pr.feed.new_line = true
			// if pr.Mode_pub == true { go pr.Pub() }
			// if pr.Mode_log == true { go pr.feed.Log() }
			// if pr.Mode_calc == true { go pr.feed.Parse() }
		}
	}
}

func (pr *PriceRouter)Pub() {
	// send feed.line to websocket of every subscriber
}

func (f *Feed)Log() {
	if f.log_file == nil {
		var err error
		f.log_file, err = os.Create("../../data/log/" + f.quote + ".csv")
		// defer f.log_file.Close()
		f.writer = bufio.NewWriter(f.log_file)
		if err != nil { _error.Handle("Failed to open the log file", err) }
	}
	_, err := f.writer.WriteString(f.line)
	if err != nil { _error.Handle("Failed to write to the log file", err) }
	f.writer.Flush()
}

func (f *Feed)Parse() {
	var s []string//init?
	var err error

	// if (f.new_line) {
		// f.new_line = false
		s = strings.Split(f.line, ",")
		f.tick.time, err = strconv.ParseUint(s[0], 10, 32)
		f.tick.ask, err = strconv.ParseFloat(s[1], 64)
		f.tick.bid, err = strconv.ParseFloat(s[2], 64)
		if (err != nil) { _error.Handle("Failed to parse in handle_feed()", err) }
		// f.new_data = true
		f.Handle()
	// }
}

func (f *Feed)Handle() {
	// if (f.new_data) {
		// f.new_data = false
		fmt.Println(f.tick.time, f.tick.bid, f.tick.ask)
	// }
}

func (pr *PriceRouter)AddClient(client int) {
	// pr.Mode_pub = true
	pr.clients = append(pr.clients, client)
}

func (pr *PriceRouter)Start(is_ready chan bool) {
	pr.ServerInit()
	pr.FeedConnect()
	is_ready <- true
	pr.GetFeed()
}

func (pr *PriceRouter)StartLogger() {
	if pr.logger == nil {
		pr.logger = *_logger.NewLogger("../../data/log/", pr.feed.quote, "csv")
		pr.Mode_log = true
	}
}

func NewPriceRouter(port uint16/*,client int, mode string*/)(*PriceRouter) {
	var pr PriceRouter
	
	pr.Port = port
	pr.feed.quote = _c.PortToSymbol(port)
	pr.logger = nil
	// if mode == "sub" { pr.AddClient(client) } else { pr.Mode_pub = false }
	// if mode == "log" { pr.StartLogger() } else { pr.Mode_log = false }
	// if mode == "calc" { pr.Mode_calc = true } else { pr.Mode_calc = false }
	// pr.feed.new_line = false //feed cannot be fetched yet
	// pr.feed.new_data = false //feed cannot be parsed yet
	is_ready := make(chan bool)
	go pr.Start(is_ready)
	<- is_ready
	return &pr
}
