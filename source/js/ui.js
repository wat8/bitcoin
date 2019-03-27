var $ = require('jquery');

var QRCode = require('qrcode');
var Mustache = require('mustache');
module.exports = {
    updateNonHD: function (uiData, entropy, entropyMinBits) {
        updateNonHD(uiData, entropy, entropyMinBits);
    },
    renderDiceThrowButtons: function (diceSides, requiredThrowCount) {
        renderDiceThrowButtons(diceSides, requiredThrowCount);
    },
    hideDiceThrower: function () {
        hideDiceThrower();
    },
    removeLastDiceThrow: function (diceButtonsEnabled) {
        removeLastDiceThrow(diceButtonsEnabled);
    },
    setProgressBarIncrement: function (increment) {
        progressBarData.step = increment;
    },
    addDiceThrow: function (diceThrow, requiredThrowCount) {
        addDiceThrow(diceThrow, requiredThrowCount);
    },
    hideDiceBackspace: function () {
        $("#dice-throw-backspace").fadeOut(500);
    },
    showTab: function (tab) {
        showTab(tab);
    },
    clean: function () {
        clean();
    },
    updateHD: function (hdWalletData) {
        updateHD(hdWalletData);
    },
    hideTab: function (tab) {
        hideTab(tab);
    },
    showModal: function (id) {
        $('#modal-' + id).modal({show: true});
    },
    changeHomeMenuItemsAvailability: function (onOff) {
        changeHomeMenuItemsAvailability(onOff);
    },
    updateAddress: function (address, privateKey, nextPath, isHdAddress) {
        return updateAddress(address, privateKey, nextPath, isHdAddress);
    },
    updateTechnicalTab: function (walletData) {
        updateTechnicalTab(walletData);
    },
    updateTechnicalTabChildren: function (child, fullPath) {
        return updateTechnicalTabChildren(child, fullPath);
    }
};

var Selector = {
    btnPrimary: "btn-primary",
    btnOutlinePrimary: "btn-outline-primary",
    btnSecondary: "btn-secondary",
    btnOutlineSecondary: "btn-outline-secondary",
    btnWarning: "btn-outline-warning",
    diceRolls: '#dice-throws'
};

// What is the current progress bar width and how much should it change on each dicxe throw?
var progressBarData = {
    currentWidth: 1,
    step: 1
};

var Strings = {word: "word", random: "Random"};

var updateHD = function (hdWalletData) {
    if (hdWalletData === undefined) {
        // clear the UI elements.
        updateSeedWords([]);
        updateAddress("", "");
    } else {
        updateSeedWords(hdWalletData.wordList);
        updateAddress(
            hdWalletData.childKey.address,
            hdWalletData.childKey.privateKeyWIF,
            hdWalletData.pathRoot + "/" + parseInt(hdWalletData.childKey.shortPath + 1),
            true
        );
        unHideTab("receive-addresses");
        updateTechnicalTab(hdWalletData);
    }
};

var updateTechnicalTab = function (walletData) {
    var technicalTab = $("#technical-outer");
    // technicalTab.empty();
// Display names to match the data.
    var displayNames = {
        wordList: "Word List",
        xprivkey: "Extended Private Key (xprivkey)",
        xpubkey: "Extended Public Key (xpubvkey)",
        publickey: "Public key",
        privateKey: "Private Key",
        privateKeyWIF: "Private Key Wallet Import Format (WIF)",
        address: "Root Receive Address",
        privateKeyHex: "Private Key Hex",
        // now the elements from Entropy.getdata (if dice being used)
        elements: "Entropy seed (raw dice roll data in base 6, 16 or 20)",
        bigNumber: "Entropy (decimal)",
        bigNumberBinary: "Entropy (binary)",
        checkSum: "Entropy checksum",
        bitsEntropy: "Entropy count bits",
        pathRoot: "Path (root)"
    };

// Create and populate a div for each one.
    var displayDivs = [];

    if (Object.keys(walletData).indexOf("wordList") >= 0) {
        walletData.wordList = walletData.wordList.join(" ");
    }
    if (Object.keys(walletData).indexOf("elements") >= 0) {
        walletData.elements = walletData.elements.join("");
    }

    Object.keys(walletData).forEach(function (key) {
        displayDivs.push({
            id: "hd-wallet-" + key,
            title: displayNames[key],
            content: walletData[key]
        });
    });
    displayDivs.forEach(function (div) {
        technicalTab.append(
            $("<div><div>")
                .attr("id", div.id)
                .addClass("hd-wallet-item mt-2 mb-2")
                .append(
                    $("<h5></h5>")
                        .html(div.title)
                )
                .append(
                    $("<div></div>")
                        .addClass("small-font can-wrap")
                        .html(div.content)
                )
        )
    });
    updateTechnicalTabChildren(walletData.childKey, walletData.childKey.path);
};


updateTechnicalTabChildren = function (child, fullPath) {
    var technicalTab = $("#technical-outer");
    var childrenDiv = $("#child-keys");
    if (childrenDiv.length === 0) {
        childrenDiv = technicalTab.append(
            $("<h5></h5>")
                .html("Child Keys")
        );
        childrenDiv.append(
            $("<ul></ul>")
                .attr("id", "child-keys")
                .addClass("ml-3")
                .addClass("small-font")
        );
    }

    $("#child-keys").append(
        $("<li></li>")
            .addClass("child-key")
            .html(
                "<div><strong>Path:</strong> " + fullPath + "</div>"
                + "<div><strong>Address:</strong> " + child.address + "</div>"
                + "<div><strong>WIF:</strong> " + child.privateKeyWIF + "</div>"
            )
    );

    unHideTab("technical");
};

var updateAddress = function (address, privateKey, nextPath, isHdAddress) {
    $("#receive-address-text").html(address);
    $("#private-key-text").html(privateKey);
    if (privateKey === "") {
        var canvas = document.getElementById('private-key-qr');
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        canvas = document.getElementById('receive-address-qr');
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        $("#view-balance").attr("href", "").hide();
        $("a#next-address").fadeOut(500);
    } else {
        QRCode.toCanvas(document.getElementById('private-key-qr'), privateKey, function () {
        });
        QRCode.toCanvas(document.getElementById('receive-address-qr'), address, function () {
        });
        $("#view-balance").attr("href", "https://www.whatsonchain.com/address/" + address).show();
        if (isHdAddress === true) {
            var thisPathShort = parseInt(nextPath.split("/").pop()) - 1;
            $("a#next-address").fadeIn(500).attr("data-next-path", nextPath).attr("title", "Skip to address " + (thisPathShort + 1).toString());
            $("#address-number").html(thisPathShort).closest("div").fadeIn(300);
        } else {
            $("a#next-address").fadeIn(500).attr("data-next-path", "");
            $("#address-number").html("").closest("div").fadeOut(300);
        }
    }

};

var updateSeedWords = function (wordList) {
    var seedWordsDiv = $(`#seed-words-inner`);
    seedWordsDiv.empty();

    // Split into lines.
    var currentLine;
    var WORDS_PER_LINE = 6;
    wordList.forEach(function (word, index) {
        if (index % WORDS_PER_LINE === 0) {
            currentLine = $("<div></div>").appendTo(seedWordsDiv);
        }
        currentLine.append(
            $("<span></span>")
                .addClass("seed-word")
                .attr("id", "seed-word-" + (index + 1).toString())
                .attr("title", Strings.word + (index + 1).toString())
                .html(word + " ")
        );
    });
};

var updateNonHD = function (entropyData, entropyMinBits, singleWalletData) {
    if (entropyData === undefined || entropyData.bigNumberBinary.length < entropyMinBits) {
        // Clean out the UI.
        clean();
    } else {
        $("#entropy").html(entropyData.bigNumber.toString());
        $("#entropy-hex").html(entropyData.bigNumber.toHex());
        $("#entropy-binary").html(entropyData.bigNumberBinary.replace(/(.{11})/g, "$&" + " "));  // Split binary into 11s as needed for word list.
        $("#entropy-binary-checksum").html(entropyData.checkSum);
        $("#entropy-bits").html(entropyData.bigNumberBinary.length.toString());
        $("#entropy-raw").html(entropyData.elements.join(""));
        updateSeedWords(entropyData.wordList);

        $('#address').html(singleWalletData.address);
        QRCode.toCanvas(document.getElementById('receive-address-qr'), singleWalletData.address, function () {
        });
        $('#private-key-wif').html(singleWalletData.privateKeyWIF);
        QRCode.toCanvas(document.getElementById('private-key-wif-qr'), singleWalletData.privateKeyWIF, function () {
        });
        $('#private-key-hex').html(singleWalletData.privateKeyHex);
        $('#public-key').html(singleWalletData.pubKey);
    }
};

var clean = function () {
    // Clean all data from UI
    updateAddress("", "");
    updateHD();
    resetDiceTab();
    $("#hd-private-key").removeClass("show");
    $("#technical-outer").empty();
    $('#seed-words-inner').empty();
    changeHomeMenuItemsAvailability(1);
    hideTab();
};

var hideDiceThrower = function () {
    $(".throw-dice").removeClass(Selector.btnOutlinePrimary).addClass(Selector.btnOutlineSecondary).addClass("disabled");
    $("#dice-roller-complete").slideDown(500);
    $("#dice-roller-head").slideUp(500);
    $("#dice-throw-backspace").fadeOut(500);

    $("#dice-nav-tabs").find(".nav-item:not(:has(#tab-import-seed-words))").removeClass("hidden");
};

var resetDiceTab = function () {
    $("#dice-roller-complete").slideUp();
    $("#dice-roller-head").slideDown();
    $(Selector.diceRolls).children().each(function () {
        removeLastDiceThrow(1);
    });
    progressBarData.currentWidth = 1;
    $("#progress-bar").css("width", "1");
    $("#progress-percent").html("");
};

var renderDiceThrowButtons = function (diceSides, requiredThrowCount) {
    // Render the dice throw buttons.
    var buttons = [];

    for (var val = 1; val <= diceSides; val += 1) {
        buttons.push({"button-id": val.toString(), "button-title": val.toString()});
    }
    buttons.push(
        {"button-id": "random", "button-title": Strings.random, "extraclass": "wide " + Selector.btnWarning}
    );

    // $.get('/templates/dice-button.mustache', function (template) {
    //     $("#throw-dice-buttons").empty().append(
    //         buttons.map(function (buttonId) {
    //             return Mustache.render(template, buttonId);
    //         }).join("")
    //     )
    // });
    $("#throw-dice-buttons").empty();
    buttons.forEach( function(button){
      $("#throw-dice-buttons").append(
        $("<div></div>")
        .addClass("btn btn-outline-primary throw-dice")
        .attr("id", "throw-dice-" + button["button-id"].toString())
        .attr("data-id", button["button-id"].toString())
        .html(button["button-title"])
        .addClass(button.extraclass)
      )
    });
    $("#dice-throws-required").html(" " + requiredThrowCount + " times");
};

var removeLastDiceThrow = function (diceButtonsEnabled) {
    $(Selector.diceRolls).children().last().remove();
    $("#dice-throw-count").html($(Selector.diceRolls).children().length);
    if (diceButtonsEnabled) {
        $(".throw-dice").removeClass("disabled").removeClass(Selector.btnOutlineSecondary).addClass(Selector.btnOutlinePrimary);
    } else {
        $(".throw-dice").addClass("disabled").addClass(Selector.btnOutlineSecondary).removeClass(Selector.btnOutlinePrimary);
    }
    $("#dice-roller-complete").hide();
};


var addDiceThrow = function (diceThrow, requiredThrowCount) {
    $("<div></div>").addClass("dice-throw-inner").html(diceThrow).appendTo($("<div></div>").addClass("dice-throw").appendTo($(Selector.diceRolls)));
    var throwCount = $(Selector.diceRolls).children().length;
    var progressBar = $("#progress-bar");
    if (throwCount > 0) {
        $("#dice-throw-backspace").fadeIn(500);
    } else {
        $("#dice-throw-backspace").fadeOut(500);
    }
    if (throwCount <= requiredThrowCount) {
        progressBarData.currentWidth += progressBarData.step;
        progressBar.animate({width: progressBarData.currentWidth}, 100, 'linear');
        // progressBar.css("width", progressBar.outerWidth() + Config.progress_throw_width);
        // parseInt(Math.ceil(throwCount / Config.required_throws * 100)) + "% "
        $("#progress-percent").html(parseInt(throwCount) + "/" + requiredThrowCount + " rolls");
    } else {
        $("#progress-percent").fadeOut(500);
    }
};

var hideTab = function (tab) {
    if (tab !== undefined) {
        var tabId = "#tab-" + tab;
        $(tabId).closest(".nav-item").addClass("hidden");
    } else {
        $(".nav-item").not(".active").addClass("hidden");
    }
};

var unHideTab = function (tab) {
    var tabId = "#tab-" + tab;
    $(tabId).closest(".nav-item").removeClass("hidden");
};

var showTab = function (tab) {
    $(".tab-pane").removeClass("active").removeClass("show");
    var tabId = "#tab-" + tab;
    $(tabId).tab('show').closest(".nav-item").removeClass("hidden");
};

var changeHomeMenuItemsAvailability = function (onOff) {
    switch (onOff) {
        case 0:
            $("#home").find(".config-chooser").addClass("disabled").find("button.btn").addClass("disabled");
            $("button#reset").fadeIn(500);
            break;
        case 1:
            $("#home").find(".config-chooser").removeClass("disabled").find("button.btn").removeClass("disabled");
            $("button#reset").fadeOut(500);
            break;
    }
};
