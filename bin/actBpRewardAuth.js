'use strict';

const { sushitrain } = require('..');

const func = async (argv) => {
    // const resp = await sushitrain.addClaimerAuth(argv.account, argv.pvtkey);

};

module.exports = {
    pvtkey: true,
    func,
    name: 'Claim Rewards',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --daemon   Automatically reward claiming     [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. You can only claim your reward once a day.                 |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            title: 'Claiming Reward',
            args: {
                account: true,
                keystore: true,
            }
        },
        {
            title: 'Running a Daemon to Claim Reward Automatically',
            args: {
                account: true,
                keystore: true,
                daemon: null,
            }
        },
    ],
};
