"use strict";

const ascii = "!“#$%‘()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\"";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class TypeWriter {
    constructor(id, delay, bar) {
        this.bar = bar;
        this.id = id;
        this.delay = delay; //ms per char
        this.el = document.getElementById(id);
    }
    Bar() {
        return ((Math.round((new Date()).getTime() / 200)) % 2 ? this.bar : " ");
    }
    async Type(str) {//async?
        let n = str.length;
        let s = "";
        for (let i = 0; i < n; i++) {
            s += str[i];
            this.el.innerHTML = s + this.Bar();
            await sleep(this.delay); //could also use setTimeout
        }
        this.el.innerHTML = str;
    }
    async DecodeType(str) {//async?
        let ascii_len = ascii.length;
        let x = 5; //random rounds
        let n = str.length;
        let s = "";
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < x; j++) {
                this.el.innerHTML = s + ascii[Math.floor(Math.random() * 94)] + this.Bar();
                await sleep(this.delay / 6);
            }
            s += str[i];
            this.el.innerHTML = s + this.Bar();
            await sleep(this.delay / 6); //could also use setTimeout
        }
        this.el.innerHTML = str;
    }
    async Flush() {
        let str = this.el.innerHTML
        let n = str.length;
        let s = str;
        for (let i = 0; i < n + 1; i++) {
            s = str.substring(0, str.length - i);
            this.el.innerHTML = s + this.Bar();
            await sleep(this.delay / 3); //could also use setTimeout
        }
        this.el.innerHTML = "";
    }
    async DecodeFlush() {
        let ascii_len = ascii.length;
        let x = 5; //random rounds
        let str = this.el.innerHTML
        let n = str.length;
        let s = str;
        for (let i = 0; i < n + 1; i++) {
            for (let j = 0; j < x; j++) {
                this.el.innerHTML = s + ascii[Math.floor(Math.random() * 94)] + this.Bar();
                await sleep(this.delay / 6);
            }
            s = str.substring(0, str.length - i);
            this.el.innerHTML = s + this.Bar();
            await sleep(this.delay / 3); //could also use setTimeout
        }
        this.el.innerHTML = "";
    }
    async Loop(str_array) {
        while (true) {
            let n = str_array.length;
            for (let i = 0; i < n; i++) {
                await this.Type(str_array[i]);
                await sleep(str_array[i].length * 50);
                await this.Flush();
                //Do something
            }
        }
    }
}
