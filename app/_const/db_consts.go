package _const

//should I type the consts?
const (
	DB_HOST			= "localhost"
	DB_PORT uint16	= 5432
	DB_USER			= "postgres"
	// DB_PWD 	= "" //not storing any password in the code, the admin will be asked for psql pwd at start time
	DB_NAME  		= "webserver" //all the further DB info is retrieved in db.go
	Q_INSERT		= 1
	Q_MODIFY		= 2
	Q_DELETE		= 3
	Q_GETVAL		= 4
)
