'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.unauthOfficialReward(argv.account, argv.pvtkey);
};

module.exports = {
    hide: true,
    pvtkey: true,
    func,
    name: 'Unauth official node of claiming rewards',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. This cmd REVOKES the claiming keys on official nodes.      |',
        '    | 2. This cmd RESETS claiming permission to `active` as well.   |',
        '    | 3. After revoked, you will need to claim rewards by your self.|',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            keystore: true,
        }
    },
};
