'use strict';

const { producer } = require('..');

const func = async (argv) => {
    const result = await producer.unRegister(argv.account, argv.pvtkey);
    return result;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Unregister as a Producer',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pubkey` must be provided.       |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm unregproducer --account=ABCDE --keystore=keystore.json',
    ],
};
