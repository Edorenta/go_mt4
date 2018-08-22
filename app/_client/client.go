package _client

import(
	"net"
	"time"
	"github.com/gorilla/sessions" //session cookie manager
	"github.com/gorilla/websocket"
)

type UserData struct {
	// id uint >> incremental serial number, internal only
	ip			string		//last used ip (from net.IP.String())
	email		string		//email address
	p_hash		string 		//pwd hash
	i_hash		string 		//acc info hash
	user_name	string		//pseudonym
	first_name	string		//first name
	last_name	string		//last name
	dob_epoch	uint32		//dob date
	reg_epoch	uint32		//registration date
	log_epoch	uint32		//last login date
	//is_root		bool		//has admin rights?
}

type Client struct {
	//browsing-time instant data
	wsconn *websocket.Conn
	conn_time time.Time
	// is_signed bool //if ud == nil user hasnt signed in
	//persistant account data
	ud UserData
}

// all the above can be retrieved from _db >> to do: retrieve methods

// func NewClient(name string, ip string, id uint, is_root bool)(*Client) {
// 	var c Client

// 	c.conn_time = time.Now()
// 	c.name = name
// 	c.ip = ip
// 	c.id = id
// 	c.is_root = is_root
// 	return &c
// }

func (c *Client)LogTime()(time.Duration) {
	return time.Since(c.conn_time)
}

func (c *Client)Elevate() {
	c.is_root = true //insert root stamp into the user i_hash
}
