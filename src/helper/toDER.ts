export default function toDER(x: Buffer) {
    const ZERO = Buffer.alloc(0, 1);
    let i = 0;
    while(x[i] === 0) i++;
    if(i === x.length) return ZERO;
    x = x.subarray(i);
    if (x[0] & 0x80) return Buffer.concat([ZERO], 1 + x.length);
    return x;
}