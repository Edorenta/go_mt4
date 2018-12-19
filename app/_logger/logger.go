package _logger
// package main // only for unit tests

import(
	"os"
	"bufio"
	"../_error"
)

type Logger struct {
	dir string
	file_name string		// file name
	fd *os.File				// file descriptor
	writer *bufio.Writer	// bufio writer
	// bytes uint				// bytes written so far
}

func NewLogger(dir string, file_name string, extension string)(*Logger) {
	var l Logger
	var err error

	l.fd, err = os.OpenFile(dir + file_name + "." + extension, os.O_CREATE | os.O_APPEND | os.O_RDWR, 0664)
	// defer f.log_file.Close()
	// l.bytes = 0
	l.writer = bufio.NewWriter(l.fd)
	if err != nil { _error.Handle("Failed to open the log file", err) }
}

func (l *Logger)WriteString(s string) {
	n, err := l.writer.WriteString(s) // works with WriteBytes and WriteLine too
	if err != nil { _error.Handle("Failed to write to the log file", err) }
	// l.bytes += n
	l.writer.Flush() // make sure nothing is left in bufio writer
}

func (l *Logger)Deinit() {
	l.fd.Close()
}

func (l *Logger)Rename(new_file_name string) {
	err := os.Rename(l.file_name, new_file_name)
	if err != nil { _error.Handle("Failed to rename the log file", err) }
	l.file_name = new_file_name
}
