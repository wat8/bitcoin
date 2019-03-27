A simple website which allows the user to generate bitcoin wallets and addresses:

* using dice rolls to produce random data
* using existing wallets imported using seed words, existing private keys or binary entropy

The user can see QR codes for the addresses generated, and technical data.

The code to generate the addresses runs client side, to allow for offline use (for security reasons).  It uses Node.js, Bootstrap and the Moneybutton BSV library.

For developers it includes tests to ensure that the keys and addresses are generated as expected (souce/tests/tests.js).

It is a work in progress, but is working in as far as it goes.
