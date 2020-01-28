'use strict';

const atm = require('./atm');

(async () => {
    try {

        // console.log(await atm.deposit(
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        //     'test.bp2',
        //     'i@leaskh.com',
        //     10
        // ));

        // console.log(await withdraw(
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        //     'test.bp2',
        //     '36029b33-838f-4dbe-ae9b-f0e86226d53d',
        //     null,
        //     null,
        //     'i@leaskh.com',
        //     1
        // ));

        console.log(await atm.withdraw(
            '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
            'test.bp2',
            null,
            '1092619',
            'Leask',
            'i@leaskh.com',
            1
        ));

        // console.log(await atm.getBalance(
        //     '5Jyqyqzx1FPzU6EqtmG4vLUABTuNR6P59eeSBW6an2rStuEgj77',
        //     'test.bp2'
        // ));

    } catch (err) {
        console.log(err.toString());
    }
})();
