package _const

const (
	DB_HOST			= "localhost"
	DB_PORT uint16	= 5432
	DB_USER			= "postgres"
	// DB_PWD 	= "" //not storing any password in the code, the admin will be asked for psql pwd at start time
	DB_NAME  		= "go_mt4" //all the further DB info is retrieved in db.go
	Q_INSERT		= 1
	Q_MODIFY		= 2
	Q_DELETE		= 3
	Q_GETVAL		= 4
	F_DATETIME_FULL	= "Monday 2 January 2006, 3.04 p.m."
	F_DATETIME		= "02/01/2006 15:04:05"
	F_DATE_FULL		= "Monday 2 January 2006"
	F_DATE			= "02/01/2006"
	F_TIME			= "15:04:05"
)
