import { 
    ripemd160,
    sha256 
} from "bitcoinjs-lib/src/crypto";
import crypto from "node:crypto";
import base58 from "bs58";
import ec from 'eccrypto';

export default class Wallet {
    protected  privateKey: Buffer;
    protected  wif:        string;
    public     publicKey:  Buffer;
    public     address:    string;

    constructor() {
        this.privateKey = crypto.randomBytes(32);
        this.publicKey  = this.getPublicKey();
        this.wif        = this.createWifFormat();
        this.address    = this.getAddress();
    }

    private getPublicKey() {
        return ec.getPublic(this.privateKey);
    }

    private createWifFormat() {
        const prvAndVersion = '80' + this.privateKey.toString('hex');
        const firstSha = sha256(Buffer.from(prvAndVersion, 'hex'));
        const secondSha = sha256(firstSha);
        return base58.encode(Buffer.from(prvAndVersion + secondSha.toString('hex').substring(0, 8), 'hex'));
    }

    private getAddress() {
        const pulbicKeySha = sha256(this.publicKey);
        const ripe160 = ripemd160(pulbicKeySha);

        const hashAndVersion = Array.prototype.slice.call(ripe160, 0);
        hashAndVersion.unshift(Buffer.from("00", 'hex'));

        const firstSha = sha256(Buffer.from(hashAndVersion));
        const secondSha = sha256(firstSha);

        return base58.encode(
            Buffer.from(
                "00" + 
                ripe160.toString('hex') +
                secondSha.toString('hex').substring(0, 8), 'hex'
            )
        );
    }
}