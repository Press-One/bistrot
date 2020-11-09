'use strict';

const getBps = async (argv = {}) => {
    const resp = await prsAtm.producer.getAll();
    if (!argv.json) {
        console.log(
            'TOTAL_PRODUCER_VOTE_WEIGHT:', resp.total_producer_vote_weight
        );
    }
    const total = prsAtm.math.bignumber(resp.total_producer_vote_weight);
    let priority = 0;
    resp.rows.map(x => {
        x.priority = ++priority;
        x.total_votes = x.total_votes.replace(/\.\d*$/, '');
        x.scaled_votes = prsAtm.finance.bigFormat(
            prsAtm.math.divide(prsAtm.math.bignumber(x.total_votes), total)
        );
        // if (!argv.json && x.priority <= 21) {
        //     for (let i in x) {
        //         try { x[i] = prsAtm.colors.green(x[i]); } catch (err) { }
        //     }
        // }
    });
    return resp.rows;
};

let x = [];

prsAtm.views.push({
    name: 'BP Manage',
    icon: 'globe',
    component: {
        template:/*html*/
            `<table class="ui celled table">
                <thead>
                    <tr>
                        <th>PRIORITY</th>
                        <th>OWNER</th>
                        <th>TOTAL_VOTES</th>
                        <th>SCALED_VOTES</th>
                        <th>PRODUCER_KEY</th>
                        <th>IS_ACTIVE</th>
                        <th>UNPAID_BLOCKS</th>
                        <th>LAST_CLAIM_TIME</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in producers">
                        <td>{{item.priority}}</td>
                        <td>{{item.owner}}</td>
                        <td>{{item.total_votes}}</td>
                        <td>{{item.scaled_votes}}</td>
                        <td>{{item.producer_key}}</td>
                        <td>{{item.is_active}}</td>
                        <td>{{item.unpaid_blocks}}</td>
                        <td>{{item.last_claim_time}}</td>
                    </tr>
                </tbody>
            </table>`,
        data() {
            return {
                producers: x,
            };
        },
        // computed: {
        //     producers: () => { return x; },
        // },

    },
    init: () => {
        (async () => {
            x = await getBps();
        })();
    }
});
