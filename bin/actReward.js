'use strict';

const { } = require('../index');

const func = async (argv) => {
    const resp = await atm.claimRewards(
        argv.account,
        argv.pvtkey,
    );
    return resp;
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Claim Rewards',
    help: [
        "    --action   Set as 'reward'                   [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 2. You can only claim your reward once a day.                 |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=reward \\',
        '              --account=ABCDE \\',
        '              --keystore=keystore.json',
    ],
};
