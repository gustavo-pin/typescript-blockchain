import crypto from 'node:crypto';

export default function sha256(data: any): string {
    return crypto.createHash("sha256").update(data).digest().toString("hex");
}