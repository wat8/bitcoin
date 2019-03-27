var bsv = require('bsv');
var Mnemonic = require('bsv-mnemonic');

var Config = {
    entropyMinBits: 128,
    entropyBase: 6,
};

var Data = {
    elements: [],
    bigNumber: undefined,
    bigNumberBinary: undefined,
    checkSum: undefined,
    bitsEntropy: undefined,
    wordList: []
};

var ENTROPY_TYPES = {
  BINARY: "binary",
  WIF: "WIF",
  WORDS: "words"
};

var MnemonicWordList = Mnemonic.Words.ENGLISH;

module.exports = {
    setEntropyBase: function (base) {
        Config.entropyBase = base;
        Config.requiredDiceThrows = requiredThrows(Config.entropyBase, Config.entropyMinBits);
    },
    setEntropyMinBits: function (bits) {
        Config.entropyMinBits = bits;
        Config.requiredDiceThrows = requiredThrows(Config.entropyBase, Config.entropyMinBits);
    },
    getRequiredThrows: function () {
        return Config.requiredDiceThrows;
    },
    getEntropyBase: function () {
        return Config.entropyBase;
    },
    getEntropyMinBits: function () {
        return Config.entropyMinBits;
    },
    getConfig: function () {
        return Config;
    },
    getData: function () {
        return Data;
    },
    getBitsEntropy: function () {
        return Data.bitsEntropy;
    },
    countElements: function () {
        return Data.elements.length;
    },
    getMnemonicWordList: function () {
        return MnemonicWordList;
    },
    setMnemonicWordList: function (wordList) {
        MnemonicWordList = wordList;
    },
    generateWordListFromEntropy: function () {
        return generateWordListFromEntropy();
    },
    pushElement: function (element) {
        return pushElement(element);
    },
    popElement: function (element) {
        return popElement(element);
    },
    setAll: function (binary, wordList) {
        return setAll(binary, wordList);
    },
    reset: function() {
        return reset();
    },
    entropyFromWordList: function(wordList) {
        return entropyFromWordList(wordList);
    },
    getEntropyTypes: function() {
      return ENTROPY_TYPES;
    },
    classifyEntropy: function (entropy) {
      return classifyEntropy(entropy);
    },
    cleanImportWords: function(words) {
      return cleanImportWords(words);
    }
};

var trimLeadingZeros = function (binary) {
    while (binary.charAt(0) === "0") {
        binary = binary.substring(1, binary.length);
    }
    return binary;
};

var setAll = function (binary, wordList) {
    var bn = new bsv.crypto.BN(binary, 2);
    // Caution BN.toString(2) omits leading zeroes!
    // So check if it equals what we tought it was, but keep our leading zero version..
    if (binary.length < Config.entropyMinBits || bn.toString(2) !== trimLeadingZeros(binary)) {
        return false;
    }
    Data.bigNumber = bn;
    Data.bigNumberBinary = binary;
    Data.checkSum = getChecksum(binary);
    Data.bitsEntropy = binary.length;
    wordList === undefined ? Data.wordList = generateWordListFromEntropy(binary): Data.wordList = wordList;
    return Data;
};

var pushElement = function (element) {
    element = base20SafeNumber(element);

    // Don't allow push if entopy is full.
    if (Data.bigNumberBinary !== undefined && Data.bigNumberBinary.length === Config.entropyMinBits) {
        throw "Entropy already at required length " + Data.bigNumberBinary.length;
    }

    Data.elements.push(element);
    Data.bigNumber = new bsv.crypto.BN(Data.elements.join(''), Config.entropyBase);
    Data.bigNumberBinary = Data.bigNumber.toString(2);

    // If the big number binary equals or exceeds entropy max, truncate it to max, and add checksum + words.
    if (Data.bigNumberBinary.length >= Config.entropyMinBits) {
        Data.bigNumber = new bsv.crypto.BN(Data.bigNumberBinary.substring(0, Config.entropyMinBits), 2);
        Data.bigNumberBinary = Data.bigNumber.toString(2);
        Data.checkSum = getChecksum(Data.bigNumberBinary);
        Data.wordList = generateWordListFromEntropy();
    }

    // If dice throws are all zero so ensure we use string of zeroes instead of one.
    if (Data.bigNumberBinary === "0" && Data.elements.length !== 0) {
        Data.bigNumberBinary = "";
        for (var t = 1; t <= Data.elements.length; t++) {
            Data.bigNumberBinary += "0";
        }
    }
    Data.bitsEntropy = Data.bigNumberBinary.length;
    return Data.elements;
};

var popElement = function () {
    if (Data.elements.length > 0) {
        Data.elements.pop();
        Data.bigNumber = new bsv.crypto.BN(Data.elements.join(''), Config.entropyBase);
        Data.bigNumberBinary = Data.bigNumber.toString(2);
        Data.CheckSum = undefined;
    }
    return Data.elements.length;
};


var getChecksum = function (entropyBinary) {
    var checkSumLength = entropyBinary.length / 32; // 4 bits for 128 Entropy.
    var buf = new Buffer((entropyBinary.length + checkSumLength) / 8); // New buffer length.
    for (var i = 0; i < entropyBinary.length / 8; i++) {
        buf.writeUInt8(parseInt(entropyBinary.slice(i * 8, (i + 1) * 8), 2), i);
    }
    var hash = bsv.crypto.Hash.sha256(buf);
    var hashbits = new bsv.crypto.BN(hash.toString('hex'), 16).toString(2);

    // zero pad the hash bits
    while (hashbits.length % 256 !== 0) {
        hashbits = '0' + hashbits;
    }

    // Take the first x bits of the hash (128 => 4 bits and 12 words, 256 => 8 bits and 24 words).
    // This is the checksum.
    return hashbits.slice(0, checkSumLength);
};

var requiredThrows = function (diceSides, entropyBits) {
    // See https://en.bitcoin.it/wiki/Passphrase_generation#Using_dice
    return Math.ceil(logarithm(2 ** entropyBits, diceSides));
    // 128 bit: 6 sides = 50 rolls, 20 sides = 30 rolls
    // 256 bit: 6 sides = 100 rolls, 20 sides = 60 rolls
};

var logarithm = (function () {
    var log = Math.log;
    return function (n, base) {
        return log(n) / (base ? log(base) : 1);
    };
})();


var base20SafeNumber = function (num) {
    if (num <= 9) {
        // Is decimal so no coversion needed.
        return num.toString();
    } else if (num > 20) {
        throw "Error base 20 number out of bounds";
    } else {
        // Base 20 (Vigesimal): 10 will ba "A", 11 will be "B" and so on.
        return "0123456789ABCDEFGHIJK".charAt(num)
    }
};

var generateWordListFromEntropy = function () {
    var wordList = [];
    var entropyBinary = Data.bigNumberBinary + Data.checkSum;
    var wordIndicesBinary = entropyBinary.replace(/(.{11})/g, "$&" + ",").split(",");
    wordIndicesBinary.forEach(function (binaryIndex, ind) {
        if (ind !== wordIndicesBinary.length - 1) {
            wordList.push(MnemonicWordList[parseInt(binaryIndex, 2)]);
        }
    });
    return wordList;
};

var reset = function() {
    Data = {
        elements: [],
        bigNumber: undefined,
        bigNumberBinary: undefined,
        checkSum: undefined,
        bitsEntropy: undefined,
        wordList: []
    };
};

var entropyFromWordList = function (wordList) {
    if (MnemonicWordList === undefined || MnemonicWordList.length === 0) {
        throw "Mnemonic words list empty";
    }
    var availableWords = MnemonicWordList;
    var binaryEntropy = "";
    var paddedBinary = "";
    wordList.forEach (function (word) {
        if (availableWords.indexOf(word) >= 0) {
            paddedBinary = (availableWords.indexOf(word)).toString(2);
            paddedBinary = "00000000000".substr(paddedBinary.length) + paddedBinary;
            binaryEntropy += paddedBinary;
        } else {
            // We have an invalid word.
            return false;
        }
    });
    // Now remove the checksum.
    var checkSumLength = binaryEntropy.length / 33;
    return binaryEntropy.substring(0, binaryEntropy.length - checkSumLength);
};

var cleanImportWords = function (words) {
  return words
    .toLowerCase()
    .trim()
    .replace( /\n/g, " " )
    .replace( ".", " " )
    .replace(/[^\w\s]|_|[0-9]/g, "")
    .replace(/\s+/g, " ")
    .split(" ")
    .map( function (word){
      return word.trim();
    })
    .join(" ").trim();
};

var classifyEntropy = function (entropy) {

  // Is it valid binary?
  if (entropy.length === 128 || entropy.length === 256) {
    var isBinary = true;
      for (var c = 0; c <= words.length - 1; c++) {
          if (words.charAt(c) !== "0" && words.charAt(c) !== "1") {
              isBinary = false;
              break;
          }
      }
      if (isBinary) {
        return ENTROPY_TYPES.BINARY;
      }
  }
  // Is it valid WIF?
  if (entropy.length === 52 && (entropy.charAt(0) == "L" || entropy.charAt(0) == "M")){
    return ENTROPY_TYPES.WIF;
  }

  // Is it valid words?
  var length = cleanImportWords(entropy).split(" ").length;
  if (length === 12 || length === 24){
    return ENTROPY_TYPES.WORDS;
  }
  return false;
};
