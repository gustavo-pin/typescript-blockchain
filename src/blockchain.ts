import Chain from './interfaces/Chain.js';
import { PrismaClient } from '@prisma/client';
import { Block } from './block.js';

const db = new PrismaClient();


class Blockchain {
    public chain: Chain[] = [];

    private async verifyChainLen(n: number): Promise<boolean> {
        await this.loadChain();

        if(n > this.chain.length - 1) {
            return false;
        }

        return true;
    }

    private async loadChain() {
        const dbChain = await db.chain.findMany();
        
        this.chain = dbChain.map(block => {
            return {
                index:        block.index,
                timestamp:    block.timestamp,
                data:         block.data.split(' ? '),
                previousHash: block.previousHash,
                merkle:       block.merkle,
                hash:         block.hash,
                difficult:    block.difficult,
                nonce:        block.nonce
            }
        });

        if(this.chain.length == 0) {
            return this.genesisBLock();
        }
    }

    private async genesisBLock() {
        const genesisBlock: Block = new Block(0, ["tx1"], "", 1);
        return await db.chain.create({
            data: {
                index:        genesisBlock.index, 
                timestamp:    genesisBlock.timestamp, 
                data:         genesisBlock.data.join(" ? "), 
                previousHash: genesisBlock.previousHash, 
                merkle:       genesisBlock.merkle, 
                hash:         genesisBlock.hash,
                difficult:    genesisBlock.difficulty,
                nonce:        genesisBlock.nonce
            }
        })
    }

    public async addBlock(txs: string[], difficulty: number = 3) {
        await this.loadChain();
        
        var chainLen = this.chain.length;
        
        const block: Block = new Block(chainLen, txs, this.chain[chainLen - 1].hash, difficulty);
        
        return await db.chain.create({
            data: {
                index: block.index, 
                timestamp: block.timestamp, 
                data: block.data.join(" ? "), 
                previousHash: block.previousHash, 
                merkle: block.merkle, 
                hash: block.hash,
                difficult: block.difficulty,
                nonce: block.nonce
            }
        });
    }

    public async showChain() {
        await this.loadChain();
        return console.log(this.chain);
    }

    public async get(i: number) {
        await this.loadChain();
        const block = this.chain.find(b => b.index == i);
        if(!await this.verifyChainLen(i)) {
            return console.error(
            new Error(`The chain has not this number of blocks. The latest block index is ${this.chain.length - 1}`))
        }
        return console.log(block);
    }
}

export { Blockchain };