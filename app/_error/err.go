package _error

import (
	"os"
	"log"
)

func SetLogFile(file_name string) { // default filename = "logfile.txt"
	f, err := os.OpenFile(file_name, os.O_CREATE | os.O_APPEND | os.O_WRONLY, 0664) // + os.MkdirAll to create dirs
	if err != nil { Handle("Unable to create log file", err) }
	defer f.Close()
	log.SetOutput(f)
}
func Handle(msg string, err error) {
	// fmt.Println(msg)
	log.Fatalln(msg + "\n", err.Error())
	panic(err)
}