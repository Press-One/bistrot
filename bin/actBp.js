'use strict';

const { finance, producer, colors, math, utilitas } = require('..');

const render = (argv) => {
    return argv.account ? null : {
        table: {
            columns: [
                'priority',
                'owner',
                'total_votes',
                'scaled_votes',
                'producer_key',
                'is_active',
                'unpaid_blocks',
                'last_claim_time',
            ],
            config: {
                singleLine: true,
                columns: {
                    0: { alignment: 'right' },
                    2: { alignment: 'right' },
                    3: { alignment: 'right' },
                    5: { alignment: 'right' },
                    6: { alignment: 'right' },
                },
            },
        },
    };
};

const func = async (argv) => {
    let resp = argv.account
        ? await producer.queryByName(argv.account)
        : await producer.queryByRange(argv.bound, argv.count);
    if (!argv.json && !argv.account) {
        console.log(
            `BOUND: ${resp.more}\n`
            + `TOTAL_PRODUCER_VOTE_WEIGHT: ${resp.total_producer_vote_weight}`,
        );
    }
    const total = math.bignumber(resp && resp.total_producer_vote_weight);
    let priority = 0;
    resp = resp && resp.rows ? resp : { rows: resp ? [resp] : [] };
    resp.rows.map(x => {
        x.priority = ++priority;
        x.total_votes = x.total_votes.replace(/\.\d*$/, '');
        x.scaled_votes = finance.bigFormat(
            math.divide(math.bignumber(x.total_votes), total)
        );
        x.is_active = !!x.is_active;
        if (!argv.json && !argv.account) {
            x.producer_key = x.producer_key.slice(0, 10) + '...';
            if (argv.bound) {
                const opts = { pad: String(resp.rows.length).length };
                x.priority = `... ${utilitas.ensureInt(x.priority, opts)}`;
            }
            if (x.priority <= 21) {
                for (let i in x) {
                    try { x[i] = colors.green(x[i]); } catch (err) { }
                }
            }
        }
    });
    if (!argv.account) { return resp.rows; }
    utilitas.assert(resp.rows[0], `Producer Not Found (${argv.account}).`, 400);
    return resp.rows[0];
};

module.exports = {
    func,
    name: 'Check Producers Information',
    help: [
        '    --account  PRESS.one producer name           [STRING  / OPTIONAL]',
        '    --bound    Paging bound                      [STRING  / OPTIONAL]',
        '    --count    Page size                         [INTEGER / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Run with `account` to get info of one producer.            |',
        '    | 2. Run without `account` to get a producer list.              |',
        '    | 3. Specify `bound` to get a producer list start from `bound`. |',
        '    | 4. Default `count` is `50`.                                   |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            title: 'getting a producer list',
        },
        {
            title: 'getting info of one producer',
            args: {
                account: true,
            },
        },
    ],
    render,
};
