import encodeUtf8 from "encode-utf8";
import * as Mode from "./mode.js";

export class ByteData {
    constructor(data) {
        this.mode = Mode.BYTE;
        this.data = new Uint8Array(encodeUtf8(data));
    }
    getLength() {
        return this.data.length;
    }
    getBitsLength() {
        return ByteData.getBitsLength(this.data.length);
    }
    write(bitBuffer) {
        for (let i = 0, l = this.data.length; i < l; i++) {
            bitBuffer.put(this.data[i], 8);
        }
    }
    static getBitsLength(length) {
        return length * 8;
    }
}
