This is a simple implementation of blockchain using typescript.

You need sqlite and typescript to work.

To use this program, follow the steps:

## Install dependencies

```bash
npm install
```

## Create Prisma migration

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
