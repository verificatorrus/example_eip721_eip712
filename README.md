# EIP-721 Example with EIP-712 Vaucher

This project uses React.js, ethers and Fastify.

For NFT metadata storage, useed [https://jsonbin.io](https://jsonbin.io)

Smart edited was created with [https://remix.ethereum.org](https://remix.ethereum.org)

Sepolia test net, for example, is used.

You need to have [Metamask](https://metamask.io/) installed and mannualy set network to sepolia test net!

## ⛔️ Do not use this code AS IS in production.

All private keys and API keys were hardcoded!

For more security, use [AWS](https://docs.aws.amazon.com/kms/latest/developerguide/asymmetric-key-specs.html#key-spec-ecc) private key storage for the backend signer (named minter in smart contracts).

For API keys, use environment variables. Also, it can help with service scaling.

## Available Scripts

In the project directory, you can run:

### `npm run full`

Build React app run backend based on fastify\
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run server`

Run backend based on fastify\
Backend [http://localhost:3001](http://localhost:3001)

## 🛤 SScaling in production

Backends use ECDSA for user verification, and signatures can be delivered to any backend instance without any problems.\
It can be deployed in multiple independent instances for high availability issues.\
For example:

### Digital Ocaen

[Floating IP](https://www.digitalocean.com/blog/floating-ips-start-architecting-your-applications-for-high-availability)

### Cloudflare

[Load Balancing](https://www.cloudflare.com/load-balancing/)

### AWS

[Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/)

### Google cloud

[Cloud Load Balancing](https://cloud.google.com/load-balancing)