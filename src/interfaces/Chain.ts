export default interface Blocks {
    index: number,
    timestamp: bigint,
    data: string[],
    previousHash: string,
    merkle: string,
    hash: string
}