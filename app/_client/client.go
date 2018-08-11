package _client

import(
	"net"
	"time"
)

type Client struct {
	conn net.Conn
	ip net.IP
	conn_time time.Time
	name string
	id uint
	is_root bool 
}

// all the above can be retrieved from _db >> to do: retrieve methods

func NewClient(name string, ip string, id uint, is_root bool)(*Client) {
	var c Client

	c.conn_time = time.Now()
	c.name = name
	c.ip = ip
	c.id = id
	c.is_root = is_root
	return &c
}

func (c *Client)LogTime()(time.Duration) {
	return time.Since(c.conn_time)
}

func (c *Client)Elevate() {
	c.is_root = true
}
