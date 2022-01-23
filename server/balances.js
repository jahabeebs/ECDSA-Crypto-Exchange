const EC = require('elliptic').ec;

class Balances {
    privateKey;
    publicKey;
    publicX;
    publicY;
    ec = new EC('secp256k1');

    constructor() {
        this.key = this.ec.genKeyPair();
        this.publicKey = this.key.getPublic().encode('hex');
        this.publicX = this.key.getPublic().x.toString(16);
        this.publicY = this.key.getPublic().y.toString(16);
        this.privateKey = this.key.getPrivate().toString(16);
    }

    get publicKey() {
        return this.publicKey;
    }

    get publicX() {
        return this.publicX;
    }

    get publicY() {
        return this.publicY;
    }

    get privateKey() {
        return this.privateKey;
    }
}

module.exports = Balances;