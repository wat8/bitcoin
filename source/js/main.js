var UI = require('./ui.js');
var Entropy = require('./entropy.js');
var Wallet = require('./wallet.js');
var $ = require('jquery');
var Bootstrap = require('bootstrap'); // Needed for .tab() function.

// var Tests = require('./tests.js');

var HDPrivateKey;

$(document).ready(function () {
    UI.renderDiceThrowButtons(Entropy.getEntropyBase());
    // If random dice throw is clicked, generate a throw.
    $("#throw-dice-buttons").on("click", ".throw-dice", function (e) {
        var button = $(e.currentTarget);
        if (!button.hasClass("disabled")) {
            // We have a valid dice throw so handle it.
            var diceThrow = button.attr("id") === "throw-dice-random"
                ? Math.floor((Math.random() * Entropy.getEntropyBase()) + 1)
                : button.attr("data-id");
            UI.addDiceThrow(diceThrow, Entropy.getRequiredThrows());
            // We want to store the dice throws as 0 - 19 so that zero is included.
            diceThrow -= 1;
            Entropy.pushElement(diceThrow);

            // If the big number binary equals or exceeds entropy max, disable button etc
            if (Entropy.getBitsEntropy() >= Entropy.getEntropyMinBits()) {
                UI.hideDiceThrower();
                HDPrivateKey = Wallet.createHdWallet(Entropy.getData().bigNumberBinary);
                UI.updateHD(Wallet.getData());
                var entropy = Entropy.getData();
                delete entropy['wordList'];  // We already have this data in tech tab.
                entropy.bigNumber = entropy.bigNumber.toString();
                UI.updateTechnicalTab(entropy);
            }
        }
    });

    //  If a button is pressed to change config (e.g. dice sides or bits entropy) then handle it.
    $(".config-chooser").on("click", function (e) {
        var button = $(e.currentTarget);
        if (button.hasClass("disabled")) {
          UI.showModal("option-disabled");
          return;
        }

        // Now that this question is answered, hide it from UI.
        button.closest(".config-chooser-outer").slideUp(500);

        // Then set the config change and open correct item in the UI.
        switch (button.attr("data-key")) {
            case "dice-sides":
                $("#bits-entropy-chooser").slideDown(500);
                Entropy.setEntropyBase(parseInt(button.attr("data-value")));
                UI.setProgressBarIncrement(Math.ceil($("#progress-bar-outer").outerWidth() / Entropy.getRequiredThrows()));
                UI.renderDiceThrowButtons(button.attr("data-value"), Entropy.getRequiredThrows());
                UI.changeHomeMenuItemsAvailability(0);
                break;
            case "bits-entropy":
                $("#dice-roller").slideDown(500);
                Entropy.setEntropyMinBits(parseInt(button.attr("data-value")));
                UI.setProgressBarIncrement(Math.ceil($("#progress-bar-outer").outerWidth() / Entropy.getRequiredThrows()));
                UI.changeHomeMenuItemsAvailability(0);
                break;
            case "entropy-source":
              if (button.attr("data-value") === "dice") {
                UI.showTab("dice");
              } else if (button.attr("data-value") === "generate") {
                UI.showTab("seed-words");
                UI.changeHomeMenuItemsAvailability(0);
                HDPrivateKey = Wallet.createHdWallet();
                UI.updateHD(Wallet.getData());
              } else {
                UI.showTab("import-seed-words");
                UI.changeHomeMenuItemsAvailability(0);
              }
              UI.changeHomeMenuItemsAvailability(0);
        }
    });


    $("button#reset").click(function () {
        UI.clean();
        Entropy.reset();
        Wallet.reset();
        HDPrivateKey = undefined;
    });

    $("button#validate-words").click(function (){
      var textArea = $("textarea#imported-words");
      var entropy = textArea.val();
      var entropyType = Entropy.classifyEntropy(entropy);

      if (entropyType === Entropy.getEntropyTypes().BINARY) {
         HDPrivateKey = HDPrivateKey.createHdWallet(entropy);
         UI.updateHD(Wallet.getData().getData());
         UI.showTab("seed-words");
         UI.hideTab("import-seed-words");
         return;
      } else if (entropyType === Entropy.getEntropyTypes().WORDS) {
        entropy = Entropy.cleanImportWords(entropy);
        textArea.val(entropy);
        entropy = entropy.split(" ");
        var entropyData = Entropy.setAll(Entropy.entropyFromWordList(entropy));
        if (entropyData === false || entropyData.length === 0) {
          UI.showModal("invalid-words");
        } else {
          HDPrivateKey = Wallet.createHdWallet(Entropy.getData().bigNumberBinary);

          // If last word disagrees with what user entered, checksum is wrong.
          console.log(Wallet.getData());
          if (Wallet.getData().wordList[Wallet.getData().wordList.length - 1] !== entropy[entropy.length - 1]) {
            UI.showModal("invalid-words");
          } else {
            UI.updateHD(Wallet.getData());
            UI.showTab("seed-words");
            UI.hideTab("import-seed-words");
          }
        }
      } else if (entropyType === Entropy.getEntropyTypes().WIF) {
        HDPrivateKey = Wallet.createWalletfromWif(entropy);
        UI.updateAddress(Wallet.getData().address, Wallet.getData().privateKeyWIF, "", false);
        UI.showTab("receive-addresses");
        UI.updateTechnicalTab(Wallet.getData());
        UI.hideTab("import-seed-words");
      }  else {
        UI.showModal("invalid-words");
      }
    });

    var textArea = $("textarea#imported-words");
    textArea.bind('paste', null, function() {
      setTimeout(function() {
        var words = textArea.val();
        if (Entropy.classifyEntropy(words) !== Entropy.getEntropyTypes().WIF) {
          words = Entropy.cleanImportWords(words);
          textArea.val(words);
        }
        $("#word-count").html(words.split(" ").length + " words / " + words.length + " characters")
          .fadeIn(500).fadeOut(2000);
      }, 200);

    });

    $("#dice-throw-backspace").click(function () {
        // We hit the back button so want to remove our last dice throw.

        if (Entropy.countElements() > 0) {
            Entropy.popElement();
            UI.removeLastDiceThrow(Entropy.getData().bigNumberBinary.length < Entropy.getEntropyMinBits());
        }
        if (Entropy.getData().elements.length < 1) {
            UI.hideDiceBackspace();
        }
    });

    // Events when nav items in top menu are clicked.
    $(".show-page-link").click( function(e) {
            console.log(e);
      $(".page").fadeOut(300);
      $("#page-" + $(e.currentTarget).attr("data-page")).delay(300).fadeIn(500);

    });

    $("a#next-address").click( function (e) {
      var splitPath = $(e.currentTarget).attr("data-next-path").split("/");
      var shortPathNewChild = splitPath.pop();
      var rootPath = splitPath.join("/");
      var newChild = Wallet.getChild(HDPrivateKey, rootPath, shortPathNewChild);
      UI.updateAddress(newChild.address, newChild.privateKeyWIF, rootPath + "/" + (parseInt(shortPathNewChild) + 1).toString(), true);
      UI.updateTechnicalTabChildren(newChild, rootPath + "/" + shortPathNewChild)
    });
});
