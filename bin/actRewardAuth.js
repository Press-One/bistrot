'use strict';

const { atm } = require('..');

const func = async (argv) => {
    return await atm.authOfficialReward(argv.account, argv.pvtkey);
};

module.exports = {
    hide: true,
    pvtkey: true,
    func,
    name: 'Auth official node to claim rewards automatically',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. This cmd creates NEW KEYS that can ONLY be used to claim.  |',
        '    | 2. The new keys HAVE NO OTHER PERMISSIONS except claiming.    |',
        '    | 3. The new keys will be SENT to PRESS.one official nodes.     |',
        '    | 4. You can use `RewardUnauth` to revoke the keys.             |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            account: true,
            keystore: true,
        }
    },
};
