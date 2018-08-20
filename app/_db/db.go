// package _db
package main

import(
	"fmt"
	"time"
	"../_error"
	_c "../_const"
	"database/sql"
	_ "github.com/lib/pq" //_ = silent driver import = blank identifier
)

type Database struct {
	driver *sql.DB
	info string
	tables []string
	fields map[string]string
}

func main() {
	db := NewDatabase(_c.DB_PORT, _c.DB_HOST, _c.DB_USER, _c.DB_NAME, "disable")
	time.Sleep(100000)
	fmt.Println(db.info)
}

func NewDatabase(db_port uint16, db_host, db_user, db_name, db_ssl_mode string) *Database {
	var db Database
	var db_pwd string
	var err error

	fmt.Print("Enter " + db_name + " database password:\n")
	fmt.Print("\033[8m") // Hides input
	fmt.Scanln(&db_pwd) //can use a bufio scanner also
	fmt.Print("\033[28m") // Shows input
	db.info = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
    db_host, db_port, db_user, db_pwd, db_name, db_ssl_mode)
	db.driver, err = sql.Open("postgres", db.info)
	if err != nil { _error.Handle("Wrong database credentials", err) }
	defer db.driver.Close() //db connection will be closed on scope exit
	if err = db.driver.Ping(); err != nil { _error.Handle("Unable to connect to database", err) }
	db.fields = make(map[string]string)
	db.GetTables()
	db.GetFields()
	fmt.Println("Database connection established")
	return &db
}

//GetTables takes the database table list and store it inside db.tables (string slice)
func (db *Database)GetTables() {
	sql_query :=
	`
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
	for i := 0; i < len(db.tables); i++ {
		sql_query :=
		`
		SELECT column_name as "Name", data_type as "Type"
		FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name  = '` + db.tables[i] + `';
		`
		rows, err := db.driver.Query(sql_query)
		if err != nil { _error.Handle("Query failed", err) }
		defer rows.Close()
		var name, sqltype string
		db.fields[db.tables[i]] = ""
		for rows.Next() {
			if err := rows.Scan(&name, &sqltype); err != nil { _error.Handle("Query rows.Scan() method failed", err) }
			if i > 0 { db.fields[db.tables[i]] += " " }
			db.fields[db.tables[i]] += name
		}
	}
	// fmt.Println(db.fields["clients"]) //testing purposes
}

// func (DB *Database)MatchQuery(query_type int, table string, ret_field string) string {
// 	ret := ""
// 	switch query_type {
// 		case _c.Q_INSERT:
// 			ret += "INSERT INTO " + table + GetFields(table) + "VALUES " + GetInFmt(table)
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

// func (DB *Database)AddRow(table string, row string) {
// 	sql_query := DB.MatchQuery(table, 'id')'
// 	id := 0
// 	err = db.QueryRow(sql_query, 30, "jon@calhoun.io", "Jonathan", "Calhoun").Scan(&id)
// 	if err != nil { _error.Handle("db.Insert method failed", err) }
// 	fmt.Println("New record ID is:", id)
// }

// func (DB *Database)AlterRow(table, id_type, id, field, new_val string) {
// 	sql_query := '
// 	UPDATE ' + table + '
// 	SET ' field + ' = $2
// 	WHERE ' + id_type + ' = $1;'
// 	res, err := db.Exec(sql_query, id, new_val)
// 	if err != nil { _error.Handle("Query failed", err) }
// 	count, err := res.RowsAffected()
// 	if err != nil { _error.Handle("Query affected no fields", err) }
// 	fmt.Println(count)
// }

// func (DB *Database)DelRow(table string, field string, val string) {
// }

// // func (DB *Database)UpdateTable(table string, from string, to string) {
// // }
