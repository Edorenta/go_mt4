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

/*
all the epoch columns are UTC+1 based. This will be attributed from Go
CREATE TABLE clients (
	id			SERIAL	PRIMARY KEY,		client number (internal)
	email		TEXT	UNIQUE NOT NULL,	client email
	p_hash		TEXT,						h1-s-h2 scrypted
	i_hash		TEXT,						s1-i1-s2-i2... encrypted
	user_name	TEXT	UNIQUE NOT NULL,	client pseudonym
	first_name	TEXT,						client first name
	last_name	TEXT,						client last name
	dob_epoch	BIGINT,						client birthday date
	reg_epoch	BIGINT,						client registration date
	log_epoch	BIGINT						client last login date
);
*/

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
