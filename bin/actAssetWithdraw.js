'use strict';

const { finance, atm } = require('..');

const func = async (argv) => {
    try {
        const resp = await atm.updateAuth(argv.account, null, argv.pvtkey);
        // console.log(resp); // keep this line for debug
    } catch (e) { }
    return await atm.withdraw(
        argv.pvtkey, argv.account, argv['mx-id'],
        argv['mx-num'], argv.email, argv.amount, argv.memo
    );
};

module.exports = {
    pvtkey: true,
    func,
    name: 'Withdrawal',
    help: [
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --amount   Number like xx.xxxx               [NUMBER  / REQUIRED]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --mx-id    Mixin user id (UUID)              [STRING  / OPTIONAL]',
        '    --mx-num   Mixin user number                 [NUMBER  / OPTIONAL]',
        '    --email    Email for notification            [STRING  / OPTIONAL]',
        '    --memo     Comment to this transaction       [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. One of `mx-num` or `mx-id` must be provided.               |',
        '    | 2. Sum greater than ' + finance.maxWithdrawAmount
        + ' in last 24H requires manual review.| ',
        '    | 3. Only `1` trx (deposit / withdrawal) is allowed at a time.  |',
        '    | 4. Finish, `AssetCancel` or timeout a trx before request.     |',
        '    | 5. If any issue, try to run `AccountAuth` command to fix it.  |',
        '    └---------------------------------------------------------------┘',
        '    ┌- WARNING -----------------------------------------------------┐',
        '    | ⚠ If you withdraw via `mx-num`, for your security, you can    |',
        '    |   only withdraw to your original Mixin payment accounts.      |',
        '    | ⚠ If you withdraw via `mx-id`, you can withdraw to whatever   |',
        '    |   Mixin account you want.                                     |',
        '    | ⚠ Ensure to double-check `mx-num` or `mx-id` before withdraw. |',
        '    |   Wrong accounts will cause property loss.                    |',
        '    | ⚠ We are not responsible for any loss of property due to the  |',
        '    |   mistake of withdraw accounts.                               |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            title: 'withdrawing to Mixin number',
            args: {
                account: true,
                amount: true,
                keystore: true,
                'mx-num': true,
                email: true,
            },
        },
        {
            title: 'withdrawing to Mixin user id',
            args: {
                account: true,
                amount: true,
                keystore: true,
                'mx-id': true,
                email: true,
            },
        },
    ],
};
