'use strict';

const { atm } = require('../index');

const func = async (argv) => {
    return await atm.updateAuth(argv.account, argv.pubkey, argv.pvtkey);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Update Authorization',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pubkey   Active public key (NOT owner key) [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Remember to authorize your ACTIVE KEY ONLY, NOT OWNER KEY. |',
        '    | 2. `keystore` (recommend) or `pub/pvt key` must be provided.  |',
        '    | 3. You have to execute this cmd to activate your new account. |',
        '    | 4. Normally, this command only needs to be executed 1 time.   |',
        '    | 5. Reauthorize after you update your active or owner keys.    |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm auth --account=ABCDE --keystore=keystore.json',
    ],
};
