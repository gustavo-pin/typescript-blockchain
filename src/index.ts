import { Blockchain } from './blockchain.js';
import process from 'process';

const blockchain = new Blockchain();

const command = process.argv[2];

switch(command) {
    case "add":
        if(process.argv[3] === undefined) {
            console.error(new Error("The field transactions must contain at least one transaction.")); 
            break;
        }
        if(parseInt(process.argv[4]) > 4) {
            console.error("Difficulty too high, the limit is 4");
            break; 
        }
        if(process.argv[4] != undefined) {
            blockchain.addBlock(process.argv[3].split(","), parseInt(process.argv[4]));
            break;
        }
        blockchain.addBlock(process.argv[3].split(","));
        break;
    case "show":
        blockchain.showChain();
        break;
    case "get":
        blockchain.get(parseInt(process.argv[3]));
        break;
    case "help":
        console.log(`
            Hello! Use: 
            \'help\'        - to see this message
            \'show\'        - to see the chain
            \'add tx1,tx2\' - to add a new block
            \'get {index}\' - to see a specific block
        `)
}
