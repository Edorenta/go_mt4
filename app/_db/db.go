package _db
// package main

import(
	//standard imports
	"fmt"
	"errors"
	"strconv"
	"syscall"
	//local imports
	// . "../_const"
	_tx "../_toolbox"
	"../_error"
	"../_scrypt"
	//sql and driver
	"database/sql"
	_ "github.com/lib/pq" //_ = silent driver import = blank identifier
	//password entry
	"golang.org/x/crypto/ssh/terminal"
)

type Database struct {
	Driver *sql.DB
	Info string
	Tables []string
	Fields map[string]string
	Reqfmt map[string]string
	SQLtypes map[string]string
}

type UserData struct {		//only used for UserData retrieval
	ID 			int64 		//incremental serial number, internal only
	IP			string		//last used ip (from net.IP.String())
	EMAIL		string		//email address
	P_HASH		string 		//pwd hash
	I_HASH		string 		//acc info hash
	USER_NAME	string		//pseudonym
	FIRST_NAME	string		//first name
	LAST_NAME	string		//last name
	DOB_EPOCH	int64		//dob date
	REG_EPOCH	int64		//registration date
	LOG_EPOCH	int64		//last login date
	//is_root		bool		//has admin rights?
}

// //full tests
// func main() {
// 	db := NewDatabase(DB_PORT, DB_HOST, DB_USER, DB_NAME, "disable")
// 	fmt.Println(db.Info)
// 	fmt.Println("fields:", db.Fields["clients"])
// 	fmt.Println("sqltypes:", db.SQLtypes["clients"])
// 	fmt.Println("Reqfmt:", db.Reqfmt["clients"])
// 	if err := db.DeleteUser("edorenta@gmail.com"); err != nil {  }
// 	usr, err := db.NewUser("8.8.8.8", "edorenta@gmail.com", "Test123456789", "r=f", "Mitch1", "Mitch", "Smith", 631148400)
// 	if err != nil { _error.Handle("crash", err) } else { fmt.Println("user:", usr) }
// 	dob_epoch, err := db.LookupUser("edorenta@gmail.com", "dob_epoch")
// 	if err != nil { _error.Handle("crash", err) }
// 	dob, err := _tx.EpochToTime(dob_epoch)
// 	if err != nil { _error.Handle("crash", err) }
// 	dob_fmt, err := _tx.TimeToFormat(dob, "datetime full")
// 	if err != nil { _error.Handle("crash", err) } else { fmt.Println("dob:", dob_fmt) }
// 	if err = db.ModifyUser(usr, "Test123456789", "ip", "127.0.0.1"); err != nil { _error.Handle("crash", err) } else { fmt.Println("user:", usr) }
// }

func NewDatabase(db_port uint16, db_host, db_user, db_name, db_ssl_mode string) *Database {
	var db Database

	fmt.Print("Enter " + db_name + " database password:\n");
	db_pwd, err := terminal.ReadPassword(int(syscall.Stdin))
	if err != nil { _error.Handle("terminal.ReadPassword() method failed", err) }
	// fmt.Print("\033[8m"); fmt.Scanln(&db_pwd); fmt.Print("\033[28m") // Shows input //can use a bufio scanner also
	db.Info = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
    db_host, db_port, db_user, db_pwd, db_name, db_ssl_mode)
	db.Driver, err = sql.Open("postgres", db.Info)
	if err != nil { _error.Handle("Wrong database credentials", err) }
	// defer db.Driver.Close() //db connection will be closed on scope exit
	if err = db.Driver.Ping(); err != nil { _error.Handle("Unable to connect to database", err) }
	db.Fields = make(map[string]string); db.SQLtypes = make(map[string]string); db.Reqfmt = make(map[string]string)
	db.GetFields()
	fmt.Println("Database connection established")
	fmt.Println("fields:", db.Fields["clients"])
	fmt.Println("sqltypes:", db.SQLtypes["clients"])
	fmt.Println("Reqfmt:", db.Reqfmt["clients"])
	return &db
}

//GetTables takes the database table list and store it inside db.Tables (string slice)
func (db *Database)GetTables() {
	sql_query := `
	SELECT n.nspname as "Schema",
	  c.relname as "Name",
	  CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' WHEN 'i' THEN 'index' WHEN 'S' THEN 'sequence' WHEN 's' THEN 'special' WHEN 'f' THEN 'foreign table' WHEN 'p' THEN 'table' END as "Type",
	  pg_catalog.pg_get_userbyid(c.relowner) as "Owner"
	FROM pg_catalog.pg_class c
	     LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
	WHERE c.relkind IN ('r','p','')
	      AND n.nspname <> 'pg_catalog'
	      AND n.nspname <> 'information_schema'
	      AND n.nspname !~ '^pg_toast'
	  AND pg_catalog.pg_table_is_visible(c.oid)
	ORDER BY 1,2;
	`
	rows, err := db.Driver.Query(sql_query)
	if err != nil { _error.Handle("Query failed", err) }
	defer rows.Close()
	var schema, name, ttype, owner string
	for rows.Next() {
		if err := rows.Scan(&schema, &name, &ttype, &owner); err != nil { _error.Handle("Query rows.Scan() method failed", err) }
		db.Tables = append(db.Tables, name)
	}
	// fmt.Println(db.Tables)
}

//GetFields takes the database structure deeper (column titles and types) and store in in the db.Fields map
func (db *Database)GetFields() {
	db.GetTables()
	for i := 0; i < len(db.Tables); i++ {
		sql_query := `
		SELECT column_name as "Name", data_type as "Type"
		FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name  = '` + db.Tables[i] + `';
		`
		rows, err := db.Driver.Query(sql_query)
		if err != nil { _error.Handle("Query failed", err) }
		defer rows.Close()
		var name, sqltype string
		db.Fields[db.Tables[i]] = "("; db.SQLtypes[db.Tables[i]] = "("; db.Reqfmt[db.Tables[i]] = "("
		n := 1
		for rows.Next() {
			if err := rows.Scan(&name, &sqltype); err != nil { _error.Handle("Query rows.Scan() method failed", err) }
			if name == "id" && sqltype == "integer" { continue } //escaping serial column, theoretically col 1
			if n > 1 { db.Fields[db.Tables[i]] += ", "; db.SQLtypes[db.Tables[i]] += ", "; db.Reqfmt[db.Tables[i]] += ", "; }
			db.Reqfmt[db.Tables[i]] += "$" + strconv.Itoa(n); db.Fields[db.Tables[i]] += name; db.SQLtypes[db.Tables[i]] += sqltype
			n++
		}
		db.Fields[db.Tables[i]] += ")"; db.SQLtypes[db.Tables[i]] += ")"; db.Reqfmt[db.Tables[i]] += ")"
	}
	// fmt.Println(db.Fields["clients"]) //testing purposes
}

//INSERT METHOD
func (db *Database)Insert(table string, val... string) error {
	sql_query := `
	INSERT INTO ` + table + ` ` + db.Fields[table] + ` 
	VALUES ` + db.Reqfmt[table] + ` 
	RETURNING id, email;
	`
	values := make([]interface{}, len(val))
	for i, v := range val { values[i] = v }
	ret_id := 0
	ret_email := ""
	if err := db.Driver.QueryRow(sql_query, values...).Scan(&ret_id, &ret_email); err != nil {
		// fmt.Println("db.Insert method failed:\n" + err.Error())
		switch err.Error() {
			case "pq: duplicate key value violates unique constraint \"clients_email_key\"":
				return errors.New("Email already registered")
			case "pq: duplicate key value violates unique constraint \"clients_user_name_key\"":
				return errors.New("User name already registered")
			default:
				_error.Handle("db.Insert() method failed", err)
		}
	}
	fmt.Println("New entry in", "\"" + table + "\"", "table >>> id:", ret_id, "email:", ret_email)
	return nil
}

//DELETE METHOD
func (db *Database)Delete(table, id_field, id string) error {
	sql_query := `
	DELETE FROM ` + table + ` 
	WHERE ` + id_field +  ` = $1;
	`
	res, err := db.Driver.Exec(sql_query, id)
	if err != nil {	_error.Handle("db.Delete() method failed", err) }
	n, err := res.RowsAffected()
	if err != nil { _error.Handle("RowsAffected() method failed", err) }
	if n == 0 { return errors.New("User not found") }
	return nil
}

//RETRIEVE METHOD >> SINGLE DATA CELL // scan fills the data with their types, so string only here
func (db *Database)Lookup(table, id_field, id, val_field string) (string, error) {
	sql_query :=`
	SELECT id,` + val_field + ` FROM ` + table + ` 
	WHERE ` + id_field + ` = $1;`
	ret_id := 0
	ret := ""
	err := db.Driver.QueryRow(sql_query, id).Scan(&ret_id, &ret)
	if err != nil {
		switch err.Error() {
			case "database/sql: connection is already closed":
				return "", errors.New("Database connection lost, please try again later")
			case "sql: no rows in result set":
				return "", errors.New("User not found")
			case "sql: Transaction has already been committed or rolled back":
				return "", errors.New("Database overload, please try again later")
			case "pq: duplicate key value violates unique constraint \"clients_email_key\"":
				return "", errors.New("Email already registered")
			case "pq: duplicate key value violates unique constraint \"clients_user_name_key\"":
				return "", errors.New("User name already registered")
			default:
				_error.Handle("db.Lookup() method failed", err)
		} // if err == sql.ErrNoRows { return nil } else { _error.Handle("db.GetUserData() row.Scan method failed", err) }
	}
	return ret, nil
}

//MODIFY METHOD
func (db *Database)Modify(table, id_field, id, val_field, val string) error {
	sql_query := `
	UPDATE ` + table + ` 
	SET ` + val_field + `= $2
	WHERE ` + id_field + ` = $1
	RETURNING id, email;
	`
	ret_id := 0
	ret_email := ""
	err := db.Driver.QueryRow(sql_query, id, val).Scan(&ret_id, &ret_email)
	if err != nil {
		switch err.Error() {
			case "database/sql: connection is already closed":
				return errors.New("Database connection closed, please try again later")
			case "sql: no rows in result set":
				return errors.New("User not found")
			case "sql: Transaction has already been committed or rolled back":
				return errors.New("Cache overload, please try again later")
			default:
				_error.Handle("db.Modify() method failed", err)
		} // if err == sql.ErrNoRows { return nil } else { _error.Handle("db.GetUserData() row.Scan method failed", err) }
	}
	fmt.Println("Mod entry in", "\"" + table + "\"", "table >>> id:", ret_id, "email:", ret_email)
	return nil
}

// func (DB *Database)UniversalQuery(query_type int, table string, ret_field string) string {
// 	ret := ""
// 	switch query_type {
// 		case Q_INSERT:
// 			ret += "INSERT INTO " + table + db.Fields[table] + "VALUES " + GetInFmt(table)
// 		case Q_MODIFY:
// 			ret += "UPDATE "
// 		case Q_DELETE:
// 			ret += "DELETE FROM "
// 		case Q_GETVAL:
// 			ret += "FROM "
// 	}
// 	ret += table
// 	switch table {
// 		case "clients":
// 			 (age, email, first_name, last_name)
// 			VALUES ($1, $2, $3, $4)
// 			RETURNING id" //id is the first row (serialized int)
// 	}	
// }

//USER specific methods

/*
all the epoch columns are UTC+1 based. This will be attributed from Go
CREATE TABLE clients (
	id			SERIAL	PRIMARY KEY,
	ip 			TEXT,
	email		TEXT	UNIQUE NOT NULL,
	p_hash		TEXT,
	i_hash		TEXT,
	user_name	TEXT	UNIQUE NOT NULL,
	first_name	TEXT,
	last_name	TEXT,
	dob_epoch	BIGINT,
	reg_epoch	BIGINT,
	log_epoch	BIGINT
);

CREATE TABLE salts (
	id			SERIAL	PRIMARY KEY,
	email		TEXT	UNIQUE NOT NULL,
	hash 		TEXT
);
*/

func check_user_info(email, pwd, info, user_name, first_name, last_name string, dob_epoch int64) error {
	if err := _tx.CheckUserEmail(email); err != nil { return err }
	if err := _tx.CheckUserPwd(pwd); err != nil { return err }
	if err := _tx.CheckUserInfo(info); err != nil { return err }
	if err := _tx.CheckUserName(user_name, "User"); err != nil { return err }
	if err := _tx.CheckUserName(first_name, "First"); err != nil { return err }
	if err := _tx.CheckUserName(last_name, "Last"); err != nil { return err }
	if err := _tx.CheckUserDOB(dob_epoch); err != nil { return err }
	return nil
}

//RETRIEVE USER_DATA METHOD >> WHOLE ROW, ONLY FOR 'clients' TABLE
func (db *Database)NewUser(ip, email, pwd, info, user_name, first_name, last_name string, dob_epoch int64) (*UserData, error) {
	var ud UserData

	if err := check_user_info(email, pwd, info, user_name, first_name, last_name, dob_epoch); err != nil { return nil, err}
	hash, salt, err := _scrypt.PwdHash(pwd)
	if err != nil { _error.Handle("_db.CreateUser() method failed", err) }
	ud.IP = ip; ud.EMAIL = email; ud.P_HASH = hash; ud.I_HASH = info
	ud.USER_NAME = user_name; ud.FIRST_NAME = first_name; ud.LAST_NAME = last_name
	ud.DOB_EPOCH = dob_epoch; ud.REG_EPOCH = _tx.NowInt64(); ud.LOG_EPOCH = ud.REG_EPOCH
	if err = db.Insert("clients", ud.IP, ud.EMAIL, ud.P_HASH, ud.I_HASH,
								ud.USER_NAME, ud.FIRST_NAME, ud.LAST_NAME,
								strconv.FormatInt(ud.DOB_EPOCH, 10),
								strconv.FormatInt(ud.REG_EPOCH, 10),
								strconv.FormatInt(ud.LOG_EPOCH, 10)); err != nil { return nil, err }
	if err = db.Insert("salts", ud.EMAIL, salt); err != nil { return nil, err }
	return &ud, nil
}

func (db *Database)DeleteUser(id string) error {
	if err := db.Delete("clients", "email", id); err != nil { return err }
	if err := db.Delete("salts", "email", id); err != nil { return err }
	return nil
}

func (db *Database)PwdCheck(id string, pwd string) error {
	stored, err := db.LookupUser(id, "p_hash")
	if err != nil { return err }
	salt, err := db.GetUserSalt(id)
	if _scrypt.HashMatch(pwd, salt, stored) { return nil }
	return errors.New("Invalid password")
}

func (db *Database)GetUserData(id string) (*UserData, error) {
	//table clients is default for user data, table salt is default for salt
	var ud UserData

	sql_query := `
	SELECT * FROM clients 
	WHERE email = $1;
	`
	ret_id := 0
	row := db.Driver.QueryRow(sql_query, id)
	err := row.Scan(&ret_id, &ud.IP, &ud.EMAIL, &ud.P_HASH, &ud.I_HASH,
					&ud.USER_NAME, &ud.FIRST_NAME, &ud.LAST_NAME,
					&ud.DOB_EPOCH, &ud.REG_EPOCH, &ud.LOG_EPOCH)
	if err != nil {
		switch err.Error() {
			case "database/sql: connection is already closed":
				return nil, errors.New("Database connection closed, please try again later")
			case "sql: no rows in result set":
				return nil, errors.New("User not found")
			case "sql: Transaction has already been committed or rolled back":
				return nil, errors.New("Cache overload, please try again later")
			default:
				_error.Handle("db.GetUserData() method failed", err)
		} // if err == sql.ErrNoRows { return nil } else { _error.Handle("db.GetUserData() row.Scan method failed", err) }
	}
	return &ud, nil
}

func (db *Database)GetUserSalt(id string) (string, error) {
	var salt string

	sql_query := `
	SELECT hash FROM salts 
	WHERE email = $1;
	`
	err := db.Driver.QueryRow(sql_query, id).Scan(&salt)
	if err != nil {
		switch err.Error() {
			case "database/sql: connection is already closed":
				return "", errors.New("Database connection closed, please try again later")
			case "sql: no rows in result set":
				return "", errors.New("User not found")
			case "sql: Transaction has already been committed or rolled back":
				return "", errors.New("Cache overload, please try again later")
			default:
				_error.Handle("db.GetUserData() method failed", err)
		} // if err == sql.ErrNoRows { return nil } else { _error.Handle("db.GetUserData() row.Scan method failed", err) }
	}
	return salt, nil
}

func (db *Database)ChangeUserPwd(id, new_pwd string) error {
	new_hash, new_salt, err := _scrypt.PwdHash(new_pwd)
	if err != nil { _error.Handle("_db.ChangeUserPwd() method failed", err) }
	if err = db.Modify("clients", "email", id, "p_hash", new_hash); err != nil { return err }
	if err = db.Modify("salts", "email", id, "hash", new_salt); err != nil { return err }
	return nil
}

func (db *Database)ModifyUser(ud *UserData, pwd, val_field string, val string) error {
	if err := db.PwdCheck(ud.EMAIL, pwd); err != nil { return err }
	switch val_field {
		case "ip": ud.IP = val
		case "pwd":
			if err := _tx.CheckUserPwd(val); err != nil { return err } else { return db.ChangeUserPwd(ud.EMAIL, val) }
		case "info":
			if err := _tx.CheckUserInfo(val); err != nil { return err } else { ud.I_HASH = val }
		case "user_name":
			if err := _tx.CheckUserName(val, "User"); err != nil { return err } else { ud.USER_NAME = val }
		case "first_name":
			if err := _tx.CheckUserName(val, "First"); err != nil { return err } else { ud.FIRST_NAME = val }
		case "last_name":
			if err := _tx.CheckUserName(val, "Last"); err != nil { return err } else { ud.LAST_NAME = val }
		case "dob_epoch":
			dob, err := strconv.ParseInt(val, 10, 64); if err != nil { _error.Handle("ParseUint() failed", err) }
			if err := _tx.CheckUserDOB(dob); err != nil { return err } else { ud.DOB_EPOCH = dob }
		default: _error.Handle("db.ModifyUser() method failed", errors.New("Invalid field called"))
	}
	if err := db.Modify("clients", "email", ud.EMAIL, val_field, val); err != nil { return err }
	return nil
}

func (db *Database)LookupUser(id string, val_field string) (string, error) {
	res, err := db.Lookup("clients", "email", id, val_field)
	if err != nil { return "", err }
	return res, nil
}
