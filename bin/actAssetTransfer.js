'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.transfer(
        argv.payee, argv.amount, argv.account, argv.pvtkey, argv.memo
    );
};

module.exports = {
    hide: true,
    pvtkey: true,
    func,
    name: 'Transfer PRS to another account',
    help: [
        '    --payee    PRESS.one account of the Receiver [NUMBER  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [NUMBER  / REQUIRED]',
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌- WARNING -----------------------------------------------------┐',
        '    | ⚠ For the safety of your asset, please check `payee` accounts |',
        '    |   carefully before making any transfer.                       |',
        '    | ⚠ We are not responsible for any loss of property due to the  |',
        '    |   mistake of `payee` accounts.                                |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            payee: true,
            amount: true,
            account: true,
            keystore: true,
        }
    },
};
