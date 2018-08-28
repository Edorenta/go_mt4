package main

import(
	"fmt"
	// "time"
)

var cnt = 0

func Feed(s chan int) {
	for { s <- (cnt) }
}

func main() {
	s := make(chan int)
	go Feed(s)
	for {
		fmt.Println(<-s)
	}
}