var bsv = require('bsv');
var Mnemonic = require('bsv-mnemonic');

var WALLET_PATHS = {
    HANDCASH: {title: "Handcash", path: "m/0'/1", firstChild: '1'},
    MONEY_BUTTON: {title: "Moneybutton", path: "m/44'/0'/0'/0", firstChild: '0'}, // keys will be children of this starting at 1.
    HANDCASH_OLD: {title: "Handcash old", path: "m/0'/0/", firstChild: '1'},
    IAN_COLEMAN: {title: "Ian Coleman", path: "m/0'/0'/0/0", firstChild: '0'}
};

var Config = {
    hdWalletPath: WALLET_PATHS.HANDCASH // Default may be changed in code.
};

var HdWalletData = {};

var HdPrivateKey;

module.exports = {
    createHdWallet: function (entropy) {
        return createHdWallet(entropy);
    },
    createWalletfromWif: function (wif) {
      return createWalletfromWif(wif);
    },
    getChild: function (hdPrivateKey, pathRoot, shortPath) {
      return getChild(hdPrivateKey, pathRoot, shortPath);
    },
    singleWalletData: function (entropy) {
        return singleWalletData(entropy);
    },
    setHdWalletPath: function (path) {
        Config.hdWalletPath = path;
    },
    getWalletPaths: function () {
        return WALLET_PATHS;
    },
    getData: function () {
        return HdWalletData;
    },
    reset: function () {
        HdWalletData = {};
        HdPrivateKey = undefined;
    }
};

var getChild = function(hdPrivateKey, pathRoot, shortPath) {
  var fullPath = pathRoot + "/" + parseInt(shortPath);
  console.log(hdPrivateKey.toString());
  console.log('child path' + fullPath);
      var childHdPrivateKey = hdPrivateKey.deriveChild(fullPath);
      var child = {
          path: fullPath,
          shortPath: parseInt(shortPath),
          pathTitle: Config.hdWalletPath.title,
          privateKey: childHdPrivateKey.privateKey.toString(),
          privateKeyWIF: childHdPrivateKey.privateKey.toWIF(),
          xprivkey: childHdPrivateKey.xprivkey.toString(),
          publicKey: childHdPrivateKey.publicKey.toString(),
          xpubkey: childHdPrivateKey.xpubkey.toString(),
          address: bsv.Address(bsv.PublicKey(childHdPrivateKey.publicKey.toString()), "livenet", "pubkeyhash").toString()
      }
      return child;
}
var singleWalletData = function (entropy) {
    var privateKey = new bsv.PrivateKey(entropy, "livenet");
    return {
        privateKeyWIF: privateKey.toWIF(), // use for private key QR code.
        privateKeyHex: privateKey.toHex(),
        address: privateKey.toAddress().toString(),
        pubKey: privateKey.toPublicKey().toString()
    };
};

var createWalletfromWif = function (wif) {
  var privateKey = bsv.PrivateKey.fromWIF(wif);
  return {
      privateKeyWIF: privateKey.toWIF(), // use for private key QR code.
      privateKeyHex: privateKey.toHex(),
      address: privateKey.toAddress().toString(),
      publickey: privateKey.toPublicKey().toString()
  };
};

var createHdWallet = function (binaryEntropy, mnemonicWordList) {
    if (binaryEntropy === undefined) {
        var m = new Mnemonic(mnemonicWordList);
    } else {
        var buf = new Buffer(binaryEntropy.length / 8); // New buffer length.
        for (var i = 0; i < binaryEntropy.length / 8; i++) {
            buf.writeUInt8(parseInt(binaryEntropy.slice(i * 8, (i + 1) * 8), 2), i);
        }
        var m = new Mnemonic(buf, mnemonicWordList);
    }

    HdPrivateKey = m.toHDPrivateKey();
    HdWalletData = {
        wordList: (m.phrase).split(" "),
        xprivkey: HdPrivateKey.xprivkey.toString(),
        xpubkey: HdPrivateKey.xpubkey.toString(),
        publickey: HdPrivateKey.publicKey.toString(),
        privateKey: HdPrivateKey.privateKey.toString(),
        privateKeyWIF: HdPrivateKey.privateKey.toWIF(),
        address: bsv.Address(bsv.PublicKey(HdPrivateKey.publicKey.toString()), "livenet", "pubkeyhash").toString(),
        pathRoot: Config.hdWalletPath.path,
        childKey: getChild(HdPrivateKey, Config.hdWalletPath.path, Config.hdWalletPath.firstChild)
    };

    return HdPrivateKey;
};
