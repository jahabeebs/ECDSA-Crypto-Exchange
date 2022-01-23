const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const Balances = require("./balances");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const walletOne = new Balances();
const walletTwo = new Balances();
const walletThree = new Balances();

const availableWallets = [walletOne, walletTwo, walletThree];

const wallets = {
    [walletOne.publicKey]: 100,
    [walletTwo.publicKey]: 50,
    [walletThree.publicKey]: 75,
}

console.log("Wallet one's public address is " + walletOne.publicKey + " has a balance of " + wallets[walletOne.publicKey]);
console.log("Wallet two's public address is " + walletTwo.publicKey + " has a balance of " + wallets[walletTwo.publicKey]);
console.log("Wallet three's public address is " + walletThree.publicKey + " has a balance of " + wallets[walletThree.publicKey]);

console.log("The private key for wallet one is " + walletOne.privateKey);
console.log("The private key for wallet two is " + walletTwo.privateKey);
console.log("The private key for wallet three is " + walletThree.privateKey);

app.get('/balance/:address', (req, res) => {
    const {address} = req.params;
    const balance = wallets[address] || 0;
    res.send({balance});
});

app.post('/send', (req, res) => {
    const {sender, recipient, amount, privateKeyForSignature} = req.body;
    const validSig = validateSignature(sender, amount, privateKeyForSignature);
    if (validSig) {
        wallets[sender] -= amount;
        wallets[recipient] = (wallets[recipient] || 0) + +amount;
        res.send({balance: wallets[sender]});
    } else {
        console.log("Invalid signature");
    }
});

function validateSignature(sender, amount, privateKeyForSignature) {
    const keyFromPrivate = ec.keyFromPrivate(privateKeyForSignature);
    const message = amount.toString();
    const msgHash = SHA256(message).toString();
    let signature = keyFromPrivate.sign(msgHash.toString());
    signature = {
        r: signature.r.toString(16),
        s: signature.s.toString(16)
    }
    let wallet = new Balances();
    for (let i = 0; i < availableWallets.length; i++) {
        if (availableWallets[i].publicKey.toString() === sender.toString()) {
            wallet = availableWallets[i];
        }
    }
    let publicKey = {
        x: wallet.publicX,
        y: wallet.publicY
    }
    const key = ec.keyFromPublic(publicKey, 'hex');
    const isValid = key.verify(msgHash, signature);
    return isValid;
}

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});
