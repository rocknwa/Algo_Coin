const algosdk = require('algosdk');
const fs = require('fs');

async function deployToken() {
  // Read the account details from JSON
  const accountData = JSON.parse(fs.readFileSync('account.json', 'utf8'));
  const { address, privateKey } = accountData;

  // Convert the private key from base64 string back to Uint8Array
  const privateKeyUint8 = new Uint8Array(Buffer.from(privateKey, 'base64'));

   // Connect to the Algorand node
  console.log("Connecting to Algorand Testnet");
  const algodToken={
    "x-api-key": "qrdrJz89bZ8HB88tdqjJS9PigNsEsRML7Rya0ZAE" // fill in yours
  };
  const algodServer = 'https://testnet-algorand.api.purestake.io/ps2';
  const algodPort = "443";

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  // Get suggested transaction parameters
  const suggestedParams = await algodClient.getTransactionParams().do();

  // Create an asset creation transaction

  console.log("Creating the Token Metadata");
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: address,
    suggestedParams,
    defaultFrozen: false,
    unitName: 'NERD', // Symbol
    assetName: 'Nerd Coin', // Name of the asset
    manager: address,
    reserve: address,
    freeze: address,
    clawback: address,
    total: 1000,
    decimals: 0, // Decimals
  });

  // Sign the transaction
  const signedTxn = algosdk.signTransaction(txn, privateKeyUint8);

  // Submit the transaction to the network
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for confirmation
  const result = await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 3);
  
  console.log("Token deployed");
  const assetIndex = result['asset-index'];
  console.log(`Asset ID created: ${assetIndex}`);

  // Display AlgoExplorer URL
  const url = `https://testnet.algoexplorer.io/asset/${assetIndex}`;
  console.log(`Asset URL: ${url}`);

  // End the console
  process.exit();
}

deployToken();
