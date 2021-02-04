'use strict';

const { atm } = require('..');

const func = async (argv) => {
    const resp = await atm.accountEvolution(
        argv.prevkey, argv.account, argv.pubkey, argv.pvtkey
    );
    return resp;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Evolve legacy PRESS.one / Flying Pub accounts',
    help: [
        '    --prevkey  Legacy account, topic private key [STRING  / REQUIRED]',
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
    ],
    example: {
        args: {
            prevkey: true,
            account: true,
            keystore: true,
        },
    },
};
