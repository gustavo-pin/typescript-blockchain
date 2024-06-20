import TransactionInterface from './interfaces/Transaction';
import { Uint64LE } from 'int64-buffer';


class Transaction  {
    public unsignedraw: Buffer[];
    public txData:      TransactionInterface;

    constructor(transactionData: TransactionInterface){
        this.txData = transactionData;
        this.unsignedraw = this.buildUnsignedTx(this.txData)
    }

    private buildUnsignedTx(tx: TransactionInterface) {
        let array = [];
            let version = Buffer.allocUnsafe(4);
            version.writeUint32LE(tx.version);
            array.push(version);
            
            let nInputs = Buffer.allocUnsafe(1);
            nInputs.writeInt8(tx.inputs.length);
            array.push(nInputs);
            
            for(var input in tx.inputs) {
                let txOutHash = Buffer.from(tx.inputs[input].previousOutputTxHash, 'hex');
                let txOutIndex = Buffer.allocUnsafe(4);
                txOutIndex.writeUint32LE(tx.inputs[input].vout);
                
                let utxoScriptLength = Buffer.allocUnsafe(1);
                let utxoScript = Buffer.from(tx.inputs[input].utxoScript, 'hex');
                utxoScriptLength.writeInt8(utxoScript.length);
                
                let sequence = Buffer.from("FFFFFFFF", 'hex');
                
                array.push(txOutHash.reverse());
                array.push(txOutIndex);
                array.push(utxoScriptLength);
                array.push(utxoScript);
                array.push(sequence);
            }
    
        let nOutputs = Buffer.allocUnsafe(1);
        nOutputs.writeInt8(tx.outputs.length);
        array.push(nOutputs)
        
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

const tx = {
    version: 1,
    inputs: [
        {
            previousOutputTxHash: "ad53c439801e259cd1ea1398403dc3624ae3541ca1db03be5e3a8dabe4767e2c",
            vout: 0,
            utxoScript: "76a914bf77ab2865faa78a305b9971e61a97678d87e37488ac",
            //privateKey: "8eba9433ecd35f65b480c5e5ffd69b7508966e219c60d42ed3ebf77c383a5326"
        }
    ],
    outputs: [
        {
            value: 9000,
            scriptPubKey: "76a914b5c48ec991604db0862510aad2faad86c47f4dd888ac"
        }
    ],
    locktime: 0
}

const transaction = new Transaction(tx);
// const unsignedTx = buildUnsignedTx(tx);
// let transaction = '';


// signTx(tx, unsignedTx).then(data => {
//     for(var item in data) {
//         transaction += data[item].toString('hex');
//     }
//     const txid = sha256(Buffer.from(sha256(Buffer.from(transaction, 'hex')))).reverse().toString('hex');
//     console.log(transaction)
//     console.log(txid)

// }).catch(err => console.error(err));