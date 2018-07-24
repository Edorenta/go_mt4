package main

import(
		"net"
		"fmt"
		"log"
		// "time"
		"bufio"
		//"strings"
		"strconv"
)

func handle_error(msg string, err error) {
	// fmt.Println(msg)
	log.Fatalln(msg + "\n", err.Error())
	panic(err)
}

func server_init()(net.Listener) {
	ln, err := net.Listen("tcp", ":" + strconv.Itoa(int(PORT)))
	if (err != nil) { handle_error("net.Listen() failed", err) }
	fmt.Println("Requesting server deployed on port", PORT)
	return (ln)
}

func get_client(ln net.Listener)(net.Conn, bufio.Scanner) {
	// var err error
	// var conn net.Conn
	// var scanner bufio.Scanner

	fmt.Println("Waiting for client to connect")
	conn, err := ln.Accept()
	if (err != nil) { handle_error("ln.Accept() failed", err) }
	fmt.Println("Client connected")
	scanner := *(bufio.NewScanner(conn))
	fmt.Println("Scanner set")
	return conn, scanner
}

func main() {
	var msg_in string = ""
	var msg_out string = ""

	listener := server_init()
	conn, scanner := get_client(listener);
	
	//TEST REQUEST
	msg_out = MSG_QUOTE_CONCAT + "\n"//+ ",EURUSD\n"
	//

	for {
		_, err := conn.Write([]byte(msg_out))
		if (err != nil) { /*handle_error("conn.Write() failed", err) }*/
			conn, scanner = get_client(listener)
			continue
		}
		// err := net.Error()
		if (scanner.Scan() == false) {
			fmt.Println("Stoped Scanning")
			err = scanner.Err()
			if (err != nil) { handle_error("scanner.Scan() failed", err) }
		}
		msg_in = scanner.Text()
		fmt.Println(msg_in) 
		// time.Sleep(1000)
	}
	// if (err != nil) { handle_error("ParseFloat() failed", err) }
	// fmt.Println(msg_in)
}
