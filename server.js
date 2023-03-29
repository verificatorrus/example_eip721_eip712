const fastify = require('fastify')({
  logger: true
});
const fastifyStatic = require('@fastify/static');
fastify.register(require('@fastify/cookie'), {
});

fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true,
});

const path = require('path');
const { ethers } = require("ethers");

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'build')
});

// "privateKey":"0xc2ed146c705c14554f36b75a4d55f8ef471f33a338c2ab7042cf36a98d2616dc",
// "address":"0xf128C41d7F8c0CFc93B490b049C054D975Cc4a1e"

const NODE_URL = 'https://rpc2.sepolia.org';
const PRIVATE_KEY = "0xc2ed146c705c14554f36b75a4d55f8ef471f33a338c2ab7042cf36a98d2616dc";
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const SIGNING_DOMAIN_NAME = "Voucher-Domain";
const SIGNING_DOMAIN_VERSION = "1";
const ContractAddress = "0x37f2723C1f31E5530069A61930EcF6E4A390eb20";
const chainId = 11155111;

const domain = {
  name: SIGNING_DOMAIN_NAME,
  version: SIGNING_DOMAIN_VERSION,
  verifyingContract: ContractAddress,
  chainId,
};

// Declare a route
fastify.post('/api/sign', async function (request, reply) {
  const inputData = request.body;
  // cookies and headers can be used for auth
  if (request.cookies.authsign || request.headers.authsign){
    const [cookieSig, cookieMess] = request.cookies.authsign ? request.cookies.authsign.split("&") : request.headers.authsign.split("&");
    //signature verification
    const address = ethers.utils.verifyMessage(cookieMess, cookieSig);
    if (address.toLowerCase() === inputData.address.toLowerCase()) {
      
      const metadata = { 
        "name": inputData.name,
        "description": inputData.description,
        "external_url": "https://github.com/verificatorrus",
        "image": inputData.iamgeURL,
        "attributes": []
      };

      // Using jsonbin.io as metadata storage
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Bin-Private": "false",
          "X-ACCESS-KEY": "$2b$10$YBF9LH0j9rMuhCDhbGipF.MkV3BK1Fb0iwDGco/uqHCJ7hvYGvz.C"
       },
        body: JSON.stringify(metadata)
      };
      const response = await fetch('https://api.jsonbin.io/v3/b', requestOptions);
      const jsonbin = await response.json();

      const voucher = { "tokenId" : inputData.id, "price" : inputData.price, "uri" : `https://api.jsonbin.io/v3/b/${jsonbin.metadata.id}?meta=false`,  "buyer": inputData.address };
      const types = {
        Voucher: [
          { name: "tokenId", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "uri", type: "string" },
          { name: "buyer", type: "address" },
        ],
      };
      const signature = await signer._signTypedData(domain, types, voucher);
      reply.send([voucher.tokenId, voucher.price, voucher.uri, voucher.buyer, signature]);
    }
  }

  reply
    .code(403)
    .send({"error":"Forbidden","statusCode":403});
  
});

// Run the server!
fastify.listen({ port: 3001 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});