/*
 * TypeDecoder is an HTML type decoding machine
 * it is designed to be light, self-sufficient and fast
 * it has no dependency
 * Copyright @ Paul de Renty (Edorenta) - 2018 
 */

"use strict";

var TypeDecoder_n = 0;

class TypeDecoder {
    constructor(id, delay, max_buffer) {
        // this.ascii = "!“#$%‘()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\"";
        this.ascii = "!#$%()*+-/0123456789=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]_abcdefghijklmnopqrstuvwxyz{|}~\;"
        this.max_buffer = max_buffer || 30;
        this.delay = delay || 70; //ms per char
        this.id = id;
        this.el = document.getElementById(id);
        TypeDecoder_n++;
    }
    Sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    RandomASCII() {
        return this.ascii[Math.floor(Math.random() * this.ascii.length)];
    }
    async Decode(str) {
        let max_len = 0;
        let rn_buf = [];
        for (let i = 0; i < str.length; i++) {
          rn_buf[i] = [];
          let rn_len = Math.floor(Math.random() * this.max_buffer);
            max_len = rn_len > max_len ? rn_len : max_len;
            for (var k = 0; k < rn_len; k++) {
                rn_buf[i][k] = this.RandomASCII();
            }
            rn_buf[i][k] = str[i];
            rn_buf[i][k+1] = null;
        } //console.log(max_len, rn_buf);
        let s = this.el.innerHTML;
        for (let i = 0; i < max_len + 2; i++) {
        let word = "";
          for (let j = 0; j < str.length; j++) {
                word += (rn_buf[j][i] != null ? rn_buf[j][i] : str[j]);
            }
            this.el.innerHTML = s + word;//console.log(word);
            await this.Sleep(this.delay);
        }
    }
    async DecodeType(str) {
        let n = str.length;
        let s = "";
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < this.max_buffer; j++) {
                this.el.innerHTML = s + this.RandomASCII();
                await this.Sleep(this.delay / 6);
            }
            s += str[i];
            this.el.innerHTML = s;
            await this.Sleep(this.delay / 6);
        }
        this.el.innerHTML = str;
    }
    async Flush() {
        let str = this.el.innerHTML
        let s = str;
        for (let i = str.length; i > 0; i-=2) {
            s = s.substring(1, i);
            this.el.innerHTML = s;
            await this.Sleep((this.delay * 10) / (str.length));
        }
        this.el.innerHTML = "";
    }
    async DecodeFlush() {
        let x = 5; //random rounds
        let str = this.el.innerHTML
        let n = str.length;
        let s = str;
        for (let i = 0; i < n + 1; i++) {
            for (let j = 0; j < x; j++) {
                this.el.innerHTML = s + RandomAscii();
                await this.Sleep(this.delay / 6);
            }
            s = str.substring(0, str.length - i);
            this.el.innerHTML = s;
            await this.Sleep(this.delay / 3);
        }
        this.el.innerHTML = "";
    }
    async MultiDecode(str_array, loop_enabled) {
        while (true) {
            let n = str_array.length;
            for (let i = 0; i < n; i++) {
                await this.Decode(str_array[i]);
                if (loop_enabled || (i != n - 1)) {
                    await this.Sleep(str_array[i].length * 50 + 500);
                    this.Flush(); //this.el.innerHTML = "";
                }
                await this.Sleep(1000);
            }
            if (!loop_enabled) {
                break;
            }
        }
    }
}

// !function(){
//   var td = new TypeDecoder("core", 60);
//   //td.Decode("Hello Codepen!");
//   td.MultiDecode(["Hello Codepen!","This is a tiny TypeDecoder...", "It has no dependencies...","And fits in a tiny class!"], true);
// }()
