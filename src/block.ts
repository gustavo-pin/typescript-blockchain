import { createHash } from 'node:crypto';
import foundNonce from './interfaces/functionNonce.js';

class Block {
    public index: number;
    public timestamp: bigint;
    public data: string[];
    public merkle: string;
    public previousHash: string;
    public hash: string;
    public difficult: number;
    public nonce: number;
    private header: string[];

    constructor(index: number, data: string[], previousHash: string) {
        this.index = index;
        this.timestamp = BigInt(new Date().getTime());
        this.data = data;
        this.previousHash = previousHash;
        this.difficult = 4;
        
        this.merkle = this.calcMerkleRoot();
        this.header = [this.index.toString(), this.timestamp.toString(), this.merkle, this.previousHash];
        
        this.nonce = this.findNonce().nonce;
        this.hash = this.findNonce().hash;
        
    }

    private sha(item: string): string {
        return createHash("sha256").update(item).digest().toString("hex");
    }

    private calcMerkleRoot(): string {
        if (this.data.length === 1) return this.data[0];

        const hashes = this.data.map(tx => this.sha(tx));

        while (hashes.length > 1) {
            const level = [];
            for (let i = 0; i < hashes.length; i += 2) {
                const left = hashes[i];
                const right = (i + 1 === hashes.length) ? left : hashes[i + 1];
                const combined = left + right;
                const hash = this.sha(combined);
                level.push(hash);
            }

            hashes.splice(0, hashes.length, ...level);
        }

        return hashes[0];
    }

    public findNonce(): foundNonce {
        this.nonce = 0;

        while(true) {
            let hash: string = this.sha(`${this.nonce}${this.header.join("")}`);
            if(hash.startsWith("0".repeat(this.difficult))) {
                return {hash, nonce: this.nonce}
            }
            console.log(this.nonce);
            this.nonce++;
        }
    }
}

export { Block };