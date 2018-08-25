// package _db
package main

import(
	//standard imports
	"fmt"
	"time"
	"errors"
	"strconv"
	"syscall"
	//local imports
	"../_error"
	"../_scrypt"
	_c "../_const"
	//sql and driver
	"database/sql"
	_ "github.com/lib/pq" //_ = silent driver import = blank identifier
	//password entry
	"golang.org/x/crypto/ssh/terminal"
	//email validation
	"github.com/badoux/checkmail"
)

type Database struct {
	driver *sql.DB
	info string
	tables []string
	fields map[string]string
	reqfmt map[string]string
	sqltypes map[string]string
}

type UserData struct {		//only used for UserData retrieval
	id 			uint32 		//incremental serial number, internal only
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

//full tests
func main() {

	db := NewDatabase(_c.DB_PORT, _c.DB_HOST, _c.DB_USER, _c.DB_NAME, "disable")
	fmt.Println(db.info)
	fmt.Println("fields:", db.fields["clients"])
	fmt.Println("sqltypes:", db.sqltypes["clients"])
	fmt.Println("reqfmt:", db.reqfmt["clients"])
	err := db.Delete("clients", "email", "test3@test.com")
	if err != nil { fmt.Println(err.Error()) }
	err = db.CreateUser(db.tables[0], "8.8.8.8", "test3@test.com", "pwd", "0", "Mitch3", "Mitch", "Smith", "631148400", "1514761200", "1514761200")
	if err != nil { fmt.Println(err.Error()) }
	usr, err := db.GetUserData("test3@test.com")
	if err != nil { fmt.Println(err.Error()) } else { fmt.Println(usr) }
	dob_epoch, err := db.LookupUser("test3@test.com", "dob_epoch")
	if err != nil { fmt.Println(err.Error()) } else { fmt.Println("dob_epoch:", dob_epoch) }
	dob, err := epoch_to_time(dob_epoch)
	if err != nil { fmt.Println(err.Error()) }
	dob_fmt, err := time_to_fmt(dob, "datetime full")
	if err != nil { fmt.Println(err.Error()) } else { fmt.Println("dob:", dob_fmt) }
	err = db.ModifyUser("test3@test.com", "ip", "127.0.0.1")
	if err != nil { fmt.Println(err.Error()) }
	usr, err = db.GetUserData("test3@test.com")
	if err != nil { fmt.Println(err.Error()) } else { fmt.Println(usr) }

}

//get time out of string epoch, i.e: t, err := epoch_to_time("1514761200")
func epoch_to_time(s string) (time.Time, error) {
	sec, err := strconv.ParseInt(s, 10, 64)
	if err != nil {	return time.Time{}, err	}
	return time.Unix(sec, 0), nil
}

//get formated string time from time.Time, i.e: epoch := time_to_fmt(t, "epoch")
//"Mon Jan 2 15:04:05 -0700 MST 2006" is the reference for time formatting	
func time_to_fmt(t time.Time, format string) (string, error) {
	switch format {
		case "date full":
			return fmt.Sprintf(t.Format("Monday 2 January 2006")), nil //t.Month().String()[:3] for 3 letters months
		case "datetime full":
			return fmt.Sprintf(t.Format("Monday 2 January 2006, 3.04 p.m.")), nil //t.Month().String()[:3] for 3 letters months
		case "date":
			return fmt.Sprintf(t.Format("02/01/2006")), nil //t.Month().String()[:3] for 3 letters months
			// return fmt.Sprintf("%s %s %02d %d", t.Day(), t.Month(), t.Day(), t.Year()), nil //t.Month().String()[:3] for 3 letters months
		case "time":
			return fmt.Sprintf(t.Format("15:04:05")), nil //t.Month().String()[:3] for 3 letters months
			// return fmt.Sprintf("%02d:%02d:%02d", t.Hour(), t.Minute(), t.Second()), nil //t.Month().String()[:3] for 3 letters months
		case "datetime":
			return fmt.Sprintf(t.Format("02/01/2006 15:04:05")), nil //t.Month().String()[:3] for 3 letters months
			// return fmt.Sprintf("%02d-%02d-%d %02d:%02d:%02d", t.Day(), t.Month(), t.Year(), t.Hour(), t.Minute(), t.Second()), nil //t.Month().String()[:3] for 3 letters months
		case "epoch":
			return fmt.Sprint(t.Unix()), nil
	}
	return "", errors.New("Wrong format input") //can print t.UnixNano() for ms or t.String for full time with UTC offset
}

func NewDatabase(db_port uint16, db_host, db_user, db_name, db_ssl_mode string) *Database {
	var db Database

	fmt.Print("Enter " + db_name + " database password:\n");
	db_pwd, err := terminal.ReadPassword(int(syscall.Stdin))
	if err != nil { _error.Handle("terminal.ReadPassword() method failed", err) }
	// fmt.Print("\033[8m"); fmt.Scanln(&db_pwd); fmt.Print("\033[28m") // Shows input //can use a bufio scanner also
	db.info = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
    db_host, db_port, db_user, db_pwd, db_name, db_ssl_mode)
	db.driver, err = sql.Open("postgres", db.info)
	if err != nil { _error.Handle("Wrong database credentials", err) }
	// defer db.driver.Close() //db connection will be closed on scope exit
	if err = db.driver.Ping(); err != nil { _error.Handle("Unable to connect to database", err) }
	db.fields = make(map[string]string); db.sqltypes = make(map[string]string); db.reqfmt = make(map[string]string)
	db.GetFields()
	fmt.Println("Database connection established")
	return &db
}

//GetTables takes the database table list and store it inside db.tables (string slice)
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
	rows, err := db.driver.Query(sql_query)
	if err != nil { _error.Handle("Query failed", err) }
	defer rows.Close()
	var schema, name, ttype, owner string
	for rows.Next() {
		if err := rows.Scan(&schema, &name, &ttype, &owner); err != nil { _error.Handle("Query rows.Scan() method failed", err) }
		db.tables = append(db.tables, name)
	}
	// fmt.Println(db.tables)
}

//GetFields takes the database structure deeper (column titles and types) and store in in the db.fields map
func (db *Database)GetFields() {
	db.GetTables()
	for i := 0; i < len(db.tables); i++ {
		sql_query := `
		SELECT column_name as "Name", data_type as "Type"
		FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name  = '` + db.tables[i] + `';
		`
		rows, err := db.driver.Query(sql_query)
		if err != nil { _error.Handle("Query failed", err) }
		defer rows.Close()
		var name, sqltype string
		db.fields[db.tables[i]] = "("; db.sqltypes[db.tables[i]] = "("; db.reqfmt[db.tables[i]] = "("
		n := 1
		for rows.Next() {
			if err := rows.Scan(&name, &sqltype); err != nil { _error.Handle("Query rows.Scan() method failed", err) }
			if name == "id" && sqltype == "integer" { continue } //escaping serial column, theoretically col 1
			if n > 1 { db.fields[db.tables[i]] += ", "; db.sqltypes[db.tables[i]] += ", "; db.reqfmt[db.tables[i]] += ", "; }
			db.reqfmt[db.tables[i]] += "$" + strconv.Itoa(n); db.fields[db.tables[i]] += name; db.sqltypes[db.tables[i]] += sqltype
			n++
		}
		db.fields[db.tables[i]] += ")"; db.sqltypes[db.tables[i]] += ")"; db.reqfmt[db.tables[i]] += ")"
	}
	// fmt.Println(db.fields["clients"]) //testing purposes
}

//INSERT METHOD
func (db *Database)Insert(table string, val... string) error {
	sql_query := `
	INSERT INTO ` + table + ` ` + db.fields[table] + ` 
	VALUES ` + db.reqfmt[table] + ` 
	RETURNING id;
	`
	values := make([]interface{}, len(val))
	for i, v := range val { values[i] = v }
	ret_id := 0
	if err := db.driver.QueryRow(sql_query, values...).Scan(&ret_id); err != nil {
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
	fmt.Println("New entry in", "\"" + table + "\"", "table: client #", ret_id)
	return nil
}

//DELETE METHOD
func (db *Database)Delete(table, id_field, id string) error {
	sql_query := `
	DELETE FROM ` + table + ` 
	WHERE ` + id_field +  ` = $1;
	`
	res, err := db.driver.Exec(sql_query, id)
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
	err := db.driver.QueryRow(sql_query, id).Scan(&ret_id, &ret)
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
	RETURNING id;
	`
	ret_id := 0
	err := db.driver.QueryRow(sql_query, id, val).Scan(&ret_id)
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
	fmt.Println("Entry modified in", "\"" + table + "\"", "table: client #", ret_id)
	return nil
}

// func (DB *Database)UniversalQuery(query_type int, table string, ret_field string) string {
// 	ret := ""
// 	switch query_type {
// 		case _c.Q_INSERT:
// 			ret += "INSERT INTO " + table + db.fields[table] + "VALUES " + GetInFmt(table)
// 		case _c.Q_MODIFY:
// 			ret += "UPDATE "
// 		case _c.Q_DELETE:
// 			ret += "DELETE FROM "
// 		case _c.Q_GETVAL:
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
	email		TEXT	UNIQUE NOT NULL,
	hash 		TEXT
);
*/

func check_user_email(email string) error {
	if err := checkmail.ValidateFormat(email); err != nil { return errors.New("Invalid email format") }
	if err := checkmail.ValidateHost(email); err != nil {
		if smtp_err, ok := err.(checkmail.SmtpError); ok { return errors.New("Invalid email account") }
	} else { return errors.New("Invalid email host") }
}

func check_user_pwd(s string) error {
	n := len(s)
	if (n < 8) 				{ return errors.New("Password must be at least 8 characters") }
	if (n > 64) 			{ return errors.New("Password must be at most 64 characters") }
	upper := false; lower := false, digit := false
    for _, c := range s {
    	if (c >= 'a' && c <= 'z') { lower = true }	// lower case ok
    	if (c >= 'A' && c <= 'Z') { upper = true }	// upper case ok
    	if (c >= '0' && c <= '9') { digit = true }	// digit ok
        if (c < '!' || c > '~') { return errors.New("Password must contain only printable ascii characters") }	// non printable >> invalid
    }
	if !(lower && upper && digit) { return errors.New("Password must contain at least an upper case and a lower case alphabetical character and a digit") }
	return nil
}

func check_user_name(s string) error {
	n := len(s)
	if (n < 2) 				{ return errors.New("Names must be at least 2 characters") }
	if (n > 32) 			{ return errors.New("Names must be at most 32 characters") }
    for _, c := range s {
        if (c < '!' || c > '~') { return errors.New("Password must contain only printable ascii characters") }	// non printable >> invalid
    }
	return nil
}

func check_user_info(email, pwd, info, user_name, first_name, last_name string, dob_epoch uint32) error {
	if err := check_user_info(info); err != nil { return err }
	if err := check_user_pwd(pwd); err != nil { return err }
	if err := check_user_name(user_name, first_name, last_name); err != nil { return err }
	if err := check_user_email(email); err != nil { return err }
	if err := check_user_dob(dob_epoch); err != nil { return err }
}

//RETRIEVE USER_DATA METHOD >> WHOLE ROW, ONLY FOR 'clients' TABLE
func (db *Database)NewUser(ip, email, pwd, info, user_name, first_name, last_name string, dob_epoch uint32) (*UserData, error) {
	var ud UserData

	if err := check_user_info(email, pwd, info, user_name, first_name, last_name); err != nil { return err}
	hash, salt, err := _scrypt.PwdHash(pwd)
	if err != nil { _error.Handle("_db.CreateUser() method failed", err) }
	ud.p_hash = hash
	if err = db.Insert("clients", ud.ip, ud.email, ud.p_hash, ud.i_hash,
								ud.user_name, ud.first_name, ud.last_name,
								strconv.FormatUint(uint64(ud.dob_epoch), 10),
								strconv.FormatUint(uint64(ud.reg_epoch), 10),
								strconv.FormatUint(uint64(ud.log_epoch), 10)); err != nil { return err }
	if err = db.Insert("salts", ud.email, salt); err != nil { return err }
	return &ud, nil
}

func (db *Database)CheckUserPwd(id string, pwd string) error {
	stored, err := db.Lookup("clients", "email", id, "p_hash")
	if err != nil { return err }
	salt, err := db.GetUserSalt(id)
	if _scrypt.HashMatch(pwd, salt, stored) { return nil }
	return errors.New("Wrong password")
}

func (db *Database)GetUserData(id string) (*UserData, error) {
	//table clients is default for user data, table salt is default for salt
	var ud UserData

	sql_query := `
	SELECT * FROM clients 
	WHERE email = $1;
	`
	ret_id := 0
	row := db.driver.QueryRow(sql_query, id)
	err := row.Scan(&ret_id, &ud.ip, &ud.email, &ud.p_hash, &ud.i_hash,
					&ud.user_name, &ud.first_name, &ud.last_name,
					&ud.dob_epoch, &ud.reg_epoch, &ud.log_epoch)
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
	err := db.driver.QueryRow(sql_query, id).Scan(&salt)
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

func (db *Database)ChangeUserPwd(id, pwd, new_pwd string) error {
	if err := db.CheckUserPwd(id, pwd); err != nil { return err }
	new_hash, new_salt, err := _scrypt.PwdHash(new_pwd)
	if err != nil { _error.Handle("_db.ChangeUserPwd() method failed", err) }
	if err = db.Modify("clients", "email", id, "p_hash", new_hash); err != nil { return err }
	if err = db.Modify("salts", "email", id, "hash", new_salt); err != nil { return err }
	return nil
}

func (db *Database)ModifyUser(id string, val_field string, val string) error {
	if err := db.Modify("clients", "email", id, val_field, val); err != nil { return err }
	return nil
}

func (db *Database)LookupUser(id string, val_field string) (string, error) {
	res, err := db.Lookup("clients", "email", id, val_field)
	if err != nil { return "", err }
	return res, nil
}
