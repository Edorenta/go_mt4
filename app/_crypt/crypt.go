// package _crypt
package _crypt

import(
	"fmt"
)

func main(){
	var s1 string = "azertyuiopqsdfghjklmwxcvbn"
	var s2 []byte
	var c byte

	for i := 0; i < len(s1); i++ {
		c = s1[i] | 4 >> 2
		s2 = append(s2, c)
		fmt.Println(string(s2))
	}
	fmt.Println(s1)
	// a = a << 3
	// fmt.Println(a)
}