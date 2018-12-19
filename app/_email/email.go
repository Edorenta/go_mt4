package _email
// package main // only for unit tests

import(
	"fmt"
	"errors"
	"syscall"
	"net/smtp"
	// . "../_const"
	"../_error"
	"golang.org/x/crypto/ssh/terminal"
)

type EmailClient struct {
	SMTP_domain string
	SMTP_port string
	Address string
	// pwd string //private
	Auth smtp.Auth
}
//full tests
// func main() {
// 	ec := DefaultEmailClient()
// 	fmt.Println(ec)
// 	ec.Send("paul.ed.de.renty@gmail.com", "Contact", "Test")
// }

func DefaultEmailClient() *EmailClient {
	return NewEmailClient("smtp.gmail.com","587","paulrdonotreply@gmail.com","")
}

func NewEmailClient(smtp_domain, smtp_port, sender_address, sender_identifier string) *EmailClient {
	var ec EmailClient

	fmt.Print("Enter " + sender_address + " email password:\n");
	sender_pwd, err := terminal.ReadPassword(int(syscall.Stdin))
	if err != nil { _error.Handle("terminal.ReadPassword() method failed", err) }
	// fmt.Print("\033[8m"); fmt.Scanln(&ec_pwd); fmt.Print("\033[28m") // Shows input //can use a bufio scanner also
	ec.Auth = smtp.PlainAuth("", sender_address, string(sender_pwd), smtp_domain)
	ec.SMTP_domain = smtp_domain
	ec.SMTP_port = smtp_port
	ec.Address = sender_address
	// ec.pwd = sender_pwd // not so secure to keep unencrypted
	fmt.Println("Connection to Email \"" + sender_address + "\" established. SMTP:", smtp_domain + ":" + smtp_port)
	return &ec
}

func (ec *EmailClient)Send(recipient, subject, msg string) error { // ret error?
	content :=	"From: " + ec.Address + "\n" +
				"To: " + recipient + "\n" +
				"Subject: " + subject + "\n\n" + msg // msg is the email body
	if recipient == "" { return errors.New("Email recipient missing") }
	if subject == "" { return errors.New("Email subject missing") }
	if msg == "" { return errors.New("Email body missing") }
	err := smtp.SendMail(ec.SMTP_domain + ":" + ec.SMTP_port,
		ec.Auth, ec.Address, []string{ recipient }, []byte(content))
	return err
	//if err != nil { _error.Handle("smtp error", err) } // too violent, makes server crash
}
