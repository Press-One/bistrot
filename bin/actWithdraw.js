'use strict';

const { finance } = require('sushitrain');
const { atm } = require('../index');

const func = async (argv) => {
    return await atm.withdraw(
        argv.pvtkey,
        argv.account,
        argv['mx-id'],
        argv['mx-num'],
        argv.email,
        argv.amount,
        argv.memo
    );
};

module.exports = {
    pubkey: true,
    pvtkey: true,
    func,
    name: 'Withdrawal',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [STRING  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --mx-id    Mixin user id (UUID)              [STRING  / OPTIONAL]',
        '    --mx-num   Mixin user number                 [STRING  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |',
        '    | 2. One of `mx-num` or `mx-id` must be provided.               |',
        '    | 3. Execute the `auth` command before the first withdrawal.    |',
        '    | 4. You can only withdraw to the original MX payment accounts. |',
        '    | 5. Sum greater than ' + finance.maxWithdrawAmount
        + ' in last 24H requires manual review.| ',
        '    | 6. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 7. Finish, `cancel` or timeout a current trx before request.  |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of withdrawing to Mixin number (with Mixin user name):',
        '    $ prs-atm withdraw \\',
        '              --account=ABCDE \\',
        '              --amount=12.3456 \\',
        '              --keystore=keystore.json \\',
        '              --mx-num=12345 \\',
        '              --email=abc@def.com',
        '',
        '    > Example of withdrawing to Mixin user id:',
        '    $ prs-atm withdraw \\',
        '              --account=ABCDE \\',
        '              --amount=12.3456 \\',
        '              --keystore=keystore.json \\',
        '              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \\',
        '              --email=abc@def.com',
    ],
};
