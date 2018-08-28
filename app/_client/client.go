package _client

import(
	. "../_const"
	"../_error"
	// "net"
	// "time"
	"fmt"
	"../_db"
	"github.com/gorilla/websocket"
)

// is_signed bool //if ud == nil user hasnt signed in
type Client struct {
	UD *_db.UserData		//persistant account data
	WS_CONN *websocket.Conn	//browsing-time instant data
	WS_READER chan string
	ID string
	// IP string
	// CONN_TIME time.Time		//only if needed
}

var DB = _db.NewDatabase(DB_PORT, DB_HOST, DB_USER, DB_NAME, "disable")

// all the above can be retrieved from _db >> to do: retrieve methods

func GetClient(email, pwd, ip string)(*Client, error) {
	var c Client
	var err error

	// fmt.Println("email:", email)
	// fmt.Println("db:", DB.Info)
	c.UD, err = DB.GetUserData(email)
	if err != nil { return nil, err } // user doesn't exist or database is down!!!
	if err := DB.PwdCheck(email, pwd); err != nil { return nil, err } // wrong password!!!
	if ip != c.UD.IP {// IP address has changed!!!!
		err := DB.Modify("clients", "email", c.UD.EMAIL, "ip", ip)
		if err != nil { return nil, err }// _error.Handle("IP change failed", err) }
	}
	c.WS_READER = make(chan string)
	c.WS_CONN = nil
	return &c, nil // all good son, return user
}

func NewClient(email, ip, user_name, pwd, first_name, last_name string, dob_epoch int64)(*Client, error) {
	var c Client
	var err error

	c.UD, err = DB.NewUser(ip, email, pwd, "r=f", user_name, first_name, last_name, dob_epoch)
	if err != nil { return nil, err }
	if ip != c.UD.IP {// email has changed
		err = DB.Modify("clients", "email", c.UD.EMAIL, "ip", ip)
		if err != nil { _error.Handle("IP change failed", err) }
	}
	c.WS_READER = make(chan string)
	c.WS_CONN = nil
	return &c, nil
}

func NewVisitor(id/*, ip*/ string) *Client {
	var c Client
	// var err error

	c.ID = id
	c.UD = nil
	// if ip != c.UD.IP {// email has changed
	// 	err = DB.Modify("clients", "email", c.UD.EMAIL, "ip", ip)
	// 	if err != nil { _error.Handle("IP change failed", err) }
	// }
	c.WS_READER = make(chan string)
	c.WS_CONN = nil
	return &c
}

// func (c *Client)LogTime()(time.Duration) {
// 	return time.Since(c.conn_time)
// }

func (c *Client)Elevate() {
	// c.is_root = true //insert root stamp into the user i_hash
}

func (c *Client)Listen() {
	fmt.Println(c.ID, "connected")
	for {
		reader := ""
		// websocket.JSON.Receive(ws, &m) /websocket.JSON.Send(ws, m) also work
		if err := c.WS_CONN.ReadJSON(&reader); err != nil { fmt.Println(c.ID, "disconnected"); return } /*_error.Handle("Error reading json.", err)*/
		fmt.Println(c.ID, "<<<", reader)
		// c.WS_READER <- reader
	}
}
