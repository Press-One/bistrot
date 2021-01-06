'use strict';

const { chain } = require('..');

const func = async (argv) => {
    const resp = await chain.accountEvolution(
        argv.address, argv.prevkey, argv.account, argv.pubkey, argv.pvtkey
    );
    return resp;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Evolve legacy PRESS.one accounts and Flying Pub topics',
    help: [
        '    --address  Legacy account, topic address     [STRING  / REQUIRED]',
        '    --prevkey  Legacy account, topic private key [STRING  / REQUIRED]',
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
    ],
    example: {
        args: {
            address: true,
            prevkey: true,
            account: true,
            keystore: true,
        },
    },
};
