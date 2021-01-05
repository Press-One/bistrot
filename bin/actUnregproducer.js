'use strict';

const { producer } = require('..');

const func = async (argv) => {
    const result = await producer.unregister(argv.account, argv.pvtkey,
    );
    return result;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Register as a Producer',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --url      URL where info about producer     [STRING  / OPTIONAL]',
        '    --location Relative location for scheduling  [INTEGER / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pubkey` must be provided.       |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm unregproducer --account=ABCDE --keystore=keystore.json',
    ],
};
