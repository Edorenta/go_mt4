package _error

import (
	"log"
)

func Handle(msg string, err error) {
	// fmt.Println(msg)
	log.Fatalln(msg + "\n", err.Error())
	panic(err)
}