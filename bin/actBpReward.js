'use strict';

const { atm, event } = require('..');

const func = async (argv) => {
    const claim = async () => {
        return await atm.claimRewards(argv.account, argv.pvtkey);
    };
    if (!argv.daemon) { return await claim(); }
    await event.loop(async () => {
        try {
            console.log(await claim());
        } catch (err) {
            if (!err || !err.message || !/already\ claimed/.test(err.message)) {
                console.log(err && err.message ? err.message : err);
            }
        }
    }, 60 * 60 * 1, 10, 0, 'Reward Daemon');
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
