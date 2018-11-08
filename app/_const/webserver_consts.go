package _const

const (
	APP_PORT uint16 		= 80
	DOMAIN string			= ":80"
	HTTPS bool 				= false
	SSL_KEY_PATH string 	= "../ssl/http.key"
	SSL_CRT_PATH string 	= "../ssl/http.pem"
	MAX_CONN int 			= 64
)