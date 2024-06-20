export default interface TransactionType {
    version:  number,
    inputs:{
        previousOutputTxHash: string,
        vout: number,
        utxoScript: string,
    }[];
    outputs:{
        value: number,
        scriptPubKey: string
    }[]
    locktime: number;
}