package _client

import(
	"net"
	"time"
	"../_db"
	"../_scrypt"
	"github.com/gorilla/sessions" //session cookie manager
	"github.com/gorilla/websocket"
)

type Client struct {
	//browsing-time instant data
	wsconn *websocket.Conn
	conn_time time.Time
	// is_signed bool //if ud == nil user hasnt signed in
	//persistant account data
	ud _db.UserData
}

// all the above can be retrieved from _db >> to do: retrieve methods

func NewClient(name string, ip string, id uint, is_root bool)(*Client) {

}

func (c *Client)LogTime()(time.Duration) {
	return time.Since(c.conn_time)
}

func (c *Client)Elevate() {
	// c.is_root = true //insert root stamp into the user i_hash
}
