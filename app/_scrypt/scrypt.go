// package main
package _scrypt

import(
	// "fmt" //only for main test
	"golang.org/x/crypto/scrypt"
	"math/rand"
	"time"
)

//HashGet related:
const(
	// salt = sha256("NaCl")
	// salt = "DBCD6D34E827BCBDFCC06F0D7C6B54880D8F892701F81880AD319883EC6D6510"
	N = 32768	//CPU exp. difficulty
	r = 8		//memory exp. difficulty
	p = 1		//parallelization exp. difficulty
	l = 64		//output len 
)

//SaltGenerate generator related:
const(
	alpha_bytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    byte_bits = 6                    // 6 bits to represent a letter index
    byte_mask = 1 << byte_bits - 1 // All 1-bits, as many as byte_bits
    max_alpha_bit  = 63 / byte_bits   // # of letter indices fitting in 63 bits
)

func HashGet(s string, salt string) string {
	// salt := SaltGenerate(32)
	byte_hash, err := scrypt.Key([]byte(s), []byte(salt), N, r, p, l)
	if err != nil { return "" }
	return string(byte_hash[:l])
}

func HashMatch(s string, salt string, h string) bool {
	h2 := HashGet(s, salt)
    return h == h2
}

func PwdHash(pwd string) (string, string, error) {
	salt := SaltGenerate(32)
	hash, err := scrypt.Key([]byte(pwd), salt, N, r, p, l)
	if err != nil { return "", "", err }
	return string(hash), string(salt), nil
}

//IN ../_db
// func PwdMatch(id string, pwd string) bool {
// 	salt := _db.QueryKey(SALT_TABLE, id)
// 	hash := _db.QueryKey(HASH_TABLE, id)
// 	if HashMatch(id, salt, hash) { return true }
// 	return false
// }

//unique rand seed for all salt generation
var src = rand.NewSource(time.Now().UnixNano())

//not goroutine safe, needs to instanciate an rand.Int63() per task for concurrent access
func SaltGenerate(n int) []byte {
    salt := make([]byte, n)
    // A src.Int63() generates 63 random bits, enough for max_alpha_bit characters!
    for i, cache, remain := n-1, src.Int63(), max_alpha_bit; i >= 0; {
        if remain == 0 {
            cache, remain = src.Int63(), max_alpha_bit
        }
        if i := int(cache & byte_mask); i < len(alpha_bytes) {
            salt[i] =	alpha_bytes[i]
            i--
        }
        cache >>= byte_bits
        remain--
    }
    return salt
}

// func unsafeCompare(a string, b []byte) int {
//     abp := *(*[]byte)(unsafe.Pointer(&a))
//     return bytes.Compare(abp, b)
// }

// func unsafeEqual(a string, b []byte) bool {
//     bbp := *(*string)(unsafe.Pointer(&b))
//     return a == bbp
// }

// func main () {
// 	pwd := "azerty123"
// 	hash := HashGet(pwd)
// 	fmt.Println("hash:", hash, "\nmatch:", HashMatch(pwd, hash))
// }
