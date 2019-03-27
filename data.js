module.exports = {
  templateData: function() {
    return templateData;
  }
};

var wwwroot = require('./wwwroot').wwwroot();
// var wwwroot = 'https://www.example.com/bitcoin'

var templateData = {
    Config: {wwwroot: wwwroot.wwwroot(), imageroot: wwwroot.wwwroot() + "/images"},
    sitename: 'Bitcoin Wallet Tools',
    navitems: [
        {title: 'Home', url: '#', id: 'app'},
        {title: 'FAQ', url: '#', id: 'faqs'},
        {title: 'Links', url: '#', id: 'links'},
    ],
    tabs: [
        {title: 'Start', id: 'home', show: 1, active: 1},
        {title: 'Import', id: 'import-seed-words'},
        {title: 'Dice', id: 'dice'},
        {title: 'Seed words', id: 'seed-words'},
        {title: 'Receive Addresses', id: 'receive-addresses'},
        {title: 'Technical', id: 'technical'}
    ],
    modals: [
        {
            title: "Invalid words",
            id: "invalid-words",
            body: "<p>These words are not valid.  Please try again.</p><p>If you need new words, go to the home tab.</p>"
        },
        {
            title: "Option disabled",
            id: "option-disabled",
            body: "<p>That option is disabled as it would delete your existing wallet data.</p><p>If you are sure you want to <strong>erase everything</strong> and start again, press the 'Reset wallet' button below.</p>"
        }
    ],
    linksandheadings: [
        {
            heading: "Javascript Libraries",
            links: [
                {link: "https://docs.moneybutton.com/docs/bsv-overview.html"},
                {link: "https://github.com/moneybutton/bsv"},
                {link: "https://github.com/moneybutton/bsv-mnemonic"},
                {link: "https://blog.moneybutton.com/2018/12/11/introducing-bsv-a-javascript-bitcoin-library-for-bitcoin-sv/"},
                {link: "https://github.com/bitpay/bitcore-lib-cash"},
                {link: "https://github.com/bitcoinjs/bitcoinjs-lib"}
            ]
        },
        {
            heading: "BIPs",
            links: [
                {link: "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"},
                {link: "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki"},
                {link: "https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki"}
            ]
        },
        {
            heading: "Wallet analysis / explorer tools",
            links: [
                {link: "https://iancoleman.io/bip39/"},
                {link: "https://whatsonchain.com/"},
            ]
        },
        {
            heading: "Font Awesome Licence",
            links: [
                {link: "https://fontawesome.com/license/free"}
            ]
        }
    ],
    faqs: [
      {
        question: "Can I trust this site?",
       answer:
        "<p>When you use any site to generate Bitcoin addresses or keys online, there is a significant risk of loss.  You must be very careful, unless you have a very good reason to trust the site and your own security setup. </p"
        + "<p>Even if a site is not malicious (this one isn't!) other malware on yoru machine or on the the internet can still steal or intercept your keys (if they are generated while you are online).</p>"
        + "<p>The safest way is to generate keys offline.  Since this site is designed to generate the keys on <strong>your</strong> computer, it does not require an internet connection.  It will work offline if you save a copy of it to your computer and use that copy offline.</p>"
        + "<p>In Chrome, press CTRL-S and then save as 'Web page complete'.  You can then launch the 'index.html' file locally.</p>"
      }
    ]
};
