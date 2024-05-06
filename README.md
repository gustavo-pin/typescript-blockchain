This is a simple implementation of blockchain using typescript.

You need sqlite and typescript to work.

To use this program, follow the steps:

## Install dependencies

```bash
npm install
```

## Create Prisma migration
Init prisma instance:
```bash
npx prisma init
```
Paste this table model into prisma/schema.prisma:
```javascript
model Chain {
  index Int @unique
  timestamp BigInt
  data String
  previousHash String
  merkle String
  hash String
  difficult Int
  nonce Int
}
```
Create a migration:
```bash
npx prisma migrate dev --name init
```

## Compile

```bash
tsc
```

## Run the program

```bash
node dist/index.js help
```
