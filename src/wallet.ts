import { 
    ripemd160,
    sha256 
} from "bitcoinjs-lib/src/crypto";
import TransactionType from "./interfaces/Transaction";
import { Uint64LE } from "int64-buffer";
import bip66 from "./helper/bip66";
import toDER from "./helper/toDER";
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

    private async ellipticsign(privateKey: Buffer, msg: Buffer) {
        const sign = await ec.sign(privateKey, msg);
        return sign;
    }

    private async signTx(tx: TransactionType, origArray: Buffer[]) {
        let sighash = Buffer.allocUnsafe(4);
        sighash.writeUint32LE(1);
        origArray.push(sighash);
        
        let transaction  = '';
        for(var item in origArray) {
            transaction += origArray[item].toString('hex');
        }
    
        let msg = Buffer.from(transaction, 'hex');
        let hash256 = crypto.createHash('sha256').update(crypto.createHash('sha256').update(msg).digest()).digest();
        
        let array = [];
        let version = Buffer.allocUnsafe(4);
        version.writeUint32LE(tx.version);
        array.push(version);
        
        let nInputs = Buffer.allocUnsafe(1);
        nInputs.writeInt8(tx.inputs.length);
        array.push(nInputs);
        
        for(var input in tx.inputs) {
            let privateKey = this.privateKey;
            let publicKey = Buffer.from(ec.getPublicCompressed(privateKey));
            let txOutHash = Buffer.from(tx.inputs[input].previousOutputTxHash, 'hex');
            let txOutIndex = Buffer.allocUnsafe(4);
            txOutIndex.writeUint32LE(tx.inputs[input].vout);
    
            array.push(txOutHash.reverse());
            array.push(txOutIndex);
    
            let sig = await this.ellipticsign(privateKey, hash256).then(async (data: Buffer) => {
                return data
            });
            await ec.verify(publicKey, hash256, sig);
    
            const r = toDER(sig.subarray(4, 36));
            const s = toDER(sig.subarray(38, 70));
    
            const signature: Buffer = bip66.encode(r, s);
    
            array.push(Buffer.from([signature.length+2+1+publicKey.length]));
            array.push(Buffer.from([signature.length+1]));
            array.push(signature);
            array.push(Buffer.from([1]));
    
            array.push(Buffer.from([publicKey.length]));
            array.push(publicKey);
    
            const sequence = Buffer.from('FFFFFFFF', 'hex');
            array.push(sequence);
        }
    
        let nOutputs = Buffer.allocUnsafe(1);
        nOutputs.writeInt8(tx.outputs.length);
        array.push(nOutputs);
    
        for(var output in tx.outputs) {
            let scriptLenght = Buffer.allocUnsafe(1);
            let script = Buffer.from(tx.outputs[output].scriptPubKey, 'hex');
            scriptLenght.writeUint8(script.length);
            
            let value = new Uint64LE(tx.outputs[output].value);
    
            array.push(value.toBuffer());
            array.push(scriptLenght);
            array.push(script);
        }
    
        let locktime = Buffer.allocUnsafe(4);
        locktime.writeUint32LE(tx.locktime);
        array.push(locktime);
    
        return array;
    }
}