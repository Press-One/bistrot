'use strict';

const { ballot } = require('..');

const func = async (argv) => {
    return await ballot.vote(argv.account, argv.add, argv.remove, argv.pvtkey);
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Vote or Revoke Voting for Producers',
    help: [
        '    --account  PRESS.one account                 [STRING  / OPTIONAL]',
        '    --add      Add BP to list of voted producers [STRING  / OPTIONAL]',
        '    --remove   Del BP to list of voted producers [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. One of `add` or `remove` must be provided.                 |',
        "    | 2. `add` and `remove` can be a list split by ',' or ';'.      |",
        "    | 3. Use `ballot` cmd to check info brfore and after voting.    |",
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm vote \\',
        '              --account=ABCDE \\',
        '              --add=bp1,bp2 \\',
        '              --remove=bp3,bp4 \\',
        '              --keystore=keystore.json',
    ],
};
