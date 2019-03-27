
// #########################
//  TESTS
// #########################

var Entropy = require('./entropy.js');
const assert = require('assert');
var Mnemonic = require('bsv-mnemonic');
var Wallet = require('./wallet.js');

console.log("Running tests");

Entropy.reset();
var MNEMONIC_WORDS_LIST = Mnemonic.Words.ENGLISH;
Entropy.setMnemonicWordList(MNEMONIC_WORDS_LIST);
var wordList = "crane tape whip enrich peace child scale flower prize birth report stem school whip caught interest raw barely".split(" ");
var binaryEntropy = Entropy.entropyFromWordList(wordList);

var HD_WALLET_PATH = Wallet.getWalletPaths().MONEY_BUTTON;
var CHILD_PATH = 0;

Entropy.setAll(binaryEntropy);
console.log("Running tests2");
console.log(Entropy.getData());

// All hard coded values below are checked with independent sources.

 // Moneybutton
var testHDWallet1 = Wallet.createHdWallet(binaryEntropy, MNEMONIC_WORDS_LIST);
console.log(testHDWallet1);
Wallet.setHdWalletPath(HD_WALLET_PATH); // We want to ensure correct path is used to produce hard coded values below.
Wallet.addChild(CHILD_PATH);

assert.deepEqual(Entropy.generateWordListFromEntropy(), wordList);
assert.deepEqual(testHDWallet1.wordList, wordList);
assert.strictEqual(binaryEntropy, Entropy.getData().bigNumberBinary);
assert.strictEqual(testHDWallet1.privateKeyWIF, "KxjFsSofW9EzGwRChmdTjfXMBzVdo5zAT2Wc92t2QxNtXThQD2QA");

// BIP32 extended private key.
assert.strictEqual(testHDWallet1.xprivkey, "xprv9s21ZrQH143K2r89BzRgyYomhNpLBSDEGLuxjfZPDqUTMGXcYiw11ond1YtgXyqudRdEqBEak1VxKUgnHKkDsvvWSmfxceBw7G3ZxhD9aM5");

// Child key 1
assert.strictEqual(testHDWallet1.childKeys[CHILD_PATH].path, HD_WALLET_PATH.path + "/" + CHILD_PATH);
assert.strictEqual(testHDWallet1.childKeys[CHILD_PATH].address, "16nchYNHLrMxQwdSSApFCK17MmCtiYbx6n");
assert.strictEqual(testHDWallet1.childKeys[CHILD_PATH].publicKey, "02ed0c619e86dbe28bcc1eace9b1871efcc0b19086d4b9b620daa343fb40dbde54");
assert.strictEqual(testHDWallet1.childKeys[CHILD_PATH].privateKey, "7294EC40C3633812E3877EA1D69DAB3E506CA0F80069AC6273C83679385D8C18".toLowerCase());  // This is the private key WIF in Hex
assert.strictEqual(testHDWallet1.childKeys[CHILD_PATH].privateKeyWIF, "L14SdoZvcbs35fYtU15pFtGV9Y1Tg9jzyDie4yGxvEXM5qfjhXKn");


 // HANDCASH
var testHDWallet2 = Wallet.createHdWallet(Entropy.getData().bigNumberBinary, MNEMONIC_WORDS_LIST);
var child1 = 1;
Wallet.setHdWalletPath( Wallet.getWalletPaths().HANDCASH);
assert.strictEqual(testHDWallet2.xprivkey, "xprv9s21ZrQH143K2r89BzRgyYomhNpLBSDEGLuxjfZPDqUTMGXcYiw11ond1YtgXyqudRdEqBEak1VxKUgnHKkDsvvWSmfxceBw7G3ZxhD9aM5");
Wallet.addChild(child1);
assert.strictEqual(testHDWallet2.childKeys[child1].address, "1GqeLorBARxKix7NCxdVBq4CPwP7q4sQvm");
assert.strictEqual(testHDWallet2.childKeys[child1].privateKeyWIF, "L33rMphY65WQoUntcgfkTbXob42U85qmLPgeiPB2SKaztEmhS3c7");

var child19 = 19;
Wallet.addChild(child19);
assert.strictEqual(testHDWallet2.childKeys[child19].privateKeyWIF, "KxKJ5q5NSVJYxBJBUWyd53mzV4xrUr62JYKqRHfUCWgGR7bYZhkZ");
assert.strictEqual(testHDWallet2.childKeys[child19].address, "192J1qUe6rtCWXz2cw82GXpr7NPVF3sPXD");


// Now try again deriving from dice rolls.

// Moneybutton
Entropy.reset();
Entropy.setEntropyMinBits(128);
Entropy.setEntropyBase(20);
var dummyDiceThrows = [5, 12, 11, 19, 10, 14, 13, 12, 9, 17, 10, 11, 5, 5, 12, 9, 14, 19, 8, 8, 10, 9, 2, 20, 20, 19, 3, 18, 3, 5];
var baseTwenty = "";
dummyDiceThrows.forEach (function (roll) {
  roll -= 1;
  // Convert the roll to a base 20 number and add to entropy stack.
  baseTwenty += "0123456789ABCDEFGHIJK".charAt(roll);
  Entropy.pushElement(roll);
});
assert.strictEqual(baseTwenty, "4BAI9DCB8G9A44B8DI77981JJI2H24");
assert.strictEqual(Entropy.getData().bigNumberBinary, "10111000111000000100100000001000101101010001010101111011000011101111110101001010111100111000110010101111011111011111011100111100");
// assert.strictEqual(Entropy.getData().bigNumberBinary, parseInt("4BAI9DCB8G9A44B8DI77981JJI2H24", 20));
assert.deepEqual(Entropy.getData().wordList, "rib across acquire health fish manual vivid fury million know lava kangaroo".split(" "));

var testHDWallet3 = Wallet.createHdWallet(Entropy.getData().bigNumberBinary, MNEMONIC_WORDS_LIST);
Wallet.setHdWalletPath(HD_WALLET_PATH); // We want to ensure correct path is used to produce hard coded values below.
assert.strictEqual(testHDWallet3.xprivkey, "xprv9s21ZrQH143K2uQQ68Q4xEsG3567vYpcA1RJRvv2i2EqWKHoKBgzEBQEwvQESwvph2pGGvuFmKpAa2VBFDjffTcMSG9scu2ighuWysX7GCS");

Wallet.addChild(CHILD_PATH);
assert.strictEqual(testHDWallet3.childKeys[CHILD_PATH].address, "1FPw9NYA4snB9TiVr48ZKWQQ34B9aYMtK4");
assert.strictEqual(testHDWallet3.childKeys[CHILD_PATH].privateKeyWIF, "L4qFp8fjKHLG4NyuK3nKRJ6BhmJLAm44ySwzjpLTVtkUvZvxZKYa");

var child19 = 19;
Wallet.addChild(child19);
assert.strictEqual(testHDWallet3.childKeys[child19].privateKeyWIF, "L3BxtoJpsjX95XGfieYTDuDLKU374YRNUqP3TPPU1NGJLGUBdXh8");
assert.strictEqual(testHDWallet3.childKeys[child19].address, "1DrjSqy5yXh96SpwBCT8TTFdMKaUVHY5BN");

// HANDCASH
var testHDWallet4 = Wallet.createHdWallet(Entropy.getData().bigNumberBinary, MNEMONIC_WORDS_LIST);
var child1 = 1;
Wallet.setHdWalletPath( Wallet.getWalletPaths().HANDCASH);
assert.strictEqual(testHDWallet4.xprivkey, "xprv9s21ZrQH143K2uQQ68Q4xEsG3567vYpcA1RJRvv2i2EqWKHoKBgzEBQEwvQESwvph2pGGvuFmKpAa2VBFDjffTcMSG9scu2ighuWysX7GCS");
Wallet.addChild(child1);
assert.strictEqual(testHDWallet4.childKeys[child1].address, "1Cfv7LyKJwR8xxLKFT68RUC9k5QDndSQWt");
assert.strictEqual(testHDWallet4.childKeys[child1].privateKeyWIF, "KyAA1hxEutS2HoJvbkRHJ86kCJk3CVQxELkumfbncS1zrGBdKH1W");

var child19 = 19;
Wallet.addChild(child19);
assert.strictEqual(testHDWallet4.childKeys[child19].privateKeyWIF, "L3SAEZJqH6rrKZKzzCjjVQYCh3EgtxRweNDTFRmfoq1rUZH8kcrg");
assert.strictEqual(testHDWallet4.childKeys[child19].address, "1JYuvjVRb2aCZhmcWQcNVLph4DnmKGjBF3");


console.log("Tests complete.");
