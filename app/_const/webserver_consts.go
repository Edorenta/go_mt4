package _const

const (
	APP_PORT uint16 		= 8080
	DOMAIN string			= "localhost:8080"
	// APP_PORT uint16 		= 80 //prod
	// DOMAIN string			= ":80" //prod
	HTTPS bool 			= false
	SSL_KEY_PATH string 	= "../ssl/http.key"
	SSL_CRT_PATH string 	= "../ssl/http.pem"
	FALLBACK string			= "/captcha?"
	MAX_CONN int 			= 64
)
