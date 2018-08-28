package _toolbox

import(
	"../_error"
	"strconv"
	"errors"
	"fmt"
	"time"
	// "github.com/badoux/checkmail" //forked it, available at Edorenta/checkmail
)

const (//time formats
	F_DATETIME_FULL = "Monday 2 January 2006, 3.04 p.m."
	F_DATETIME      = "02/01/2006 15:04:05"
	F_DATE_FULL     = "Monday 2 January 2006"
	F_DATE          = "02/01/2006"
	F_TIME          = "15:04:05"
)

//get time out of string epoch, i.e: t, err := epoch_to_time("1514761200")
func EpochToTime(s string) (time.Time, error) {
	sec, err := strconv.ParseInt(s, 10, 64)
	if err != nil { return time.Time{}, err }
	return time.Unix(sec, 0), nil
}

//get formated string time from time.Time, i.e: epoch := time_to_fmt(t, "epoch")
//"Mon Jan 2 15:04:05 -0700 MST 2006" is the reference for time formatting  
func TimeToFormat(t time.Time, format string) (string, error) {
	switch format {
		case "datetime full":   return fmt.Sprintf(t.Format(F_DATETIME_FULL)), nil //t.Month().String()[:3] for 3 letters months
		case "date full":		return fmt.Sprintf(t.Format(F_DATE_FULL)), nil //t.Month().String()[:3] for 3 letters months
		case "datetime":        return fmt.Sprintf(t.Format(F_DATETIME)), nil //t.Month().String()[:3] for 3 letters months
		case "date":            return fmt.Sprintf(t.Format(F_DATE)), nil //t.Month().String()[:3] for 3 letters months
		case "time":	        return fmt.Sprintf(t.Format(F_TIME)), nil //t.Month().String()[:3] for 3 letters months
		case "epoch":           return fmt.Sprint(t.Unix()), nil
	}
	return "", errors.New("Wrong format input") //can print t.UnixNano() for ms or t.String for full time with UTC offset
}

func CheckUserDOB(dob int64) error {
	if dob < (-2208988800) { return errors.New("Are you telling me that you are the oldest person alive?") } //<1900
	now := time.Now()
	if dob > now.Unix() { return errors.New("So you are from the future, right?") } //>today
	birthdate := time.Unix(dob, 0)
	if years, _, _, _, _, _ := TimeDiff(birthdate, now); years < 18 { return errors.New("You must be 18 or older to use this app") }
	return nil
}

func NowInt64() int64 {
	return time.Now().Unix()
}

// Make time.Time() homogeneous (UTC or UTC+1)
// if t1.Location() != t2.Location() {
//     b = t2.In(t1.Location())
// }

func TimeDiff(t1, t2 time.Time) (year, month, day, hour, min, sec int) {
	if t1.Location() != t2.Location() { t2 = t2.In(t1.Location()) }
	if t1.After(t2) { t1, t2 = t2, t1 }
	y1, M1, d1 := t1.Date(); h1, m1, s1 := t1.Clock()
	y2, M2, d2 := t2.Date(); h2, m2, s2 := t2.Clock()

	year = int(y2 - y1); month = int(M2 - M1); day = int(d2 - d1)
	hour = int(h2 - h1); min = int(m2 - m1); sec = int(s2 - s1)

	// Normalize negative values
	if sec < 0 { sec += 60; min-- }
	if min < 0 { min += 60; hour-- }
	if hour < 0 { hour += 24; day-- }
	if day < 0 { // days in month:
		t := time.Date(y1, M1, 32, 0, 0, 0, 0, time.UTC)
		day += 32 - t.Day(); month--
	}
	if month < 0 { month += 12; year-- }
	return // returning all expected values
}

func CheckUserEmail(email string) error {
	i := 0
	n := len(email)
	if n > 128 { return errors.New("Invalid email address") }
	for i = i; i < n; i++ {
		if email[i] == '@' { if i > 0 { i++; break } else { return errors.New("Invalid email address") } }
		if (email[i] < '!' || email[i] > '~') { return errors.New("Invalid email address") }	// non printable >> invalid
	}
	for i = i; i < n; i++ {
		if email[i] == '.' { i++; break }
		if !((email[i] >= 'a' && email[i] <= 'z') || (email[i] >= 'A' && email[i] <= 'Z')) { return errors.New("Invalid email host") }
	}
	for i = i; i < n; i++ {
		if !(email[i] >= 'a' && email[i] <= 'z') { return errors.New("Invalid email domain") }
	}
	// if err := checkmail.ValidateFormat(email); err != nil { return errors.New("Invalid email format") }
	// if err := checkmail.ValidateHost(email); err != nil {
	// 	if _, ok := err.(checkmail.SmtpError); ok { return errors.New("Invalid email account") } // _ = smtp_err
	// } else { return err }
	return nil
}

func CheckUserName(name string, name_type string) error {
	n := len(name)
	if (n < 2) 	{ return errors.New(name_type + " name musts be at least 2 characters") }
	if (n > 32) { return errors.New(name_type + " name musts be at most 32 characters") }
	if (name_type == "First" || name_type == "Last") {
		for _, c := range name {
			if !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == ' ') {
				return errors.New(name_type + " name musts be contain only alphabetical characters")
			}
		}
	} else if (name_type == "User") {
		for _, c := range name {
			if !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == ' ') {
				return errors.New(name_type + " name musts be contain only alphanumeric characters")
			}
		}
	} else { _error.Handle("check_user_name() failed", errors.New("function name_type unrecognized")) }
	return nil
}

func CheckUserInfo(s string) error {
	is_root := s[0:3]
	if (is_root == "r=t" || is_root == "r=f") { return nil } else { _error.Handle("check_user_info() failed", errors.New("Invalid user information hash")) }
	return errors.New("Invalid user information hash") // which is not yet a hash
}

func CheckUserPwd(s string) error {
	n := len(s)
	if (n < 8) 				{ return errors.New("Password musts be at least 8 characters") }
	if (n > 64) 			{ return errors.New("Password musts be at most 64 characters") }
	upper := false; lower := false; digit := false
	for _, c := range s {
		if (c >= 'a' && c <= 'z') {
			lower = true // lower case ok
		} else if (c >= 'A' && c <= 'Z') {
			upper = true // upper case ok
		} else if (c >= '0' && c <= '9') {
			digit = true // digit ok
		} else if (c < '!' || c > '~') { return errors.New("Password musts contain only printable ascii characters") }	// non printable >> invalid
	}
	if !lower { return errors.New("Password musts contain at least 1 lower case character") }
	if !upper { return errors.New("Password musts contain at least 1 upper case character") }
	if !digit { return errors.New("Password musts contain at least 1 digit") }
	return nil
}
