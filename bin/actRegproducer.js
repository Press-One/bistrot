'use strict';

const { producer } = require('sushitrain');

const func = async (argv) => {
    const result = await producer.register(
        argv.account, argv.url, argv.location, argv.pubkey, argv.pvtkey,
    );
    return result;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Register as a Producer',
    help: [
        "    --action   Set as 'regproducer'              [STRING  / REQUIRED]",
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
        '    $ prs-atm --action=regproducer \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
    ],
};
