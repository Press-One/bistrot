
prsAtm.views.push({
    name: 'Dashboard',
    icon: 'home',
    path: '/',
    component: {
        template: /*html*/
            `
            <table class="table-striped">
                <thead>
                    <tr>
                        <th>TIMESTAMP</th>
                        <th>BLOCK_NUM</th>
                        <th>COUNTER</th>
                        <th>TYPE</th>
                        <th>DESCRIPTION</th>
                        <th>FROM</th>
                        <th>TO</th>
                        <th>AMOUNT</th>
                        <th>CURRENCY</th>
                        <th>STATUS</th>
                        <th>DETAIL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2020-10-20T08:25:10.500Z</td>
                        <td>4095978</td>
                        <td>prs.tproxy</td>
                        <td>- EXPENSE</td>
                        <td>WITHDRAW</td>
                        <td>test.bp2</td>
                        <td>MIXIN</td>
                        <td>1.0000</td>
                        <td>PRS</td>
                        <td>SUCCESS
                        <td></td>
                    </tr>
                    <tr>
                        <td>2020-10-20T08:24:28.000Z</td>
                        <td>4095893</td>
                        <td>prs.tproxy</td>
                        <td>+ INCOME</td>
                        <td>DEPOSIT</td>
                        <td>MIXIN</td>
                        <td>test.bp2</td>
                        <td>1.0000</td>
                        <td>PRS</td>
                        <td>SUCCESS
                        <td></td>
                    </tr>
                    <tr>
                        <td>2020-10-01T21:09:26.000Z</td>
                        <td>904515</td>
                        <td>prs.tproxy</td>
                        <td>- EXPENSE</td>
                        <td>WITHDRAW</td>
                        <td>test.bp2</td>
                        <td>MIXIN</td>
                        <td>8.0000</td>
                        <td>PRS</td>
                        <td>SUCCESS
                        <td></td>
                    </tr>
                    <tr>
                        <td>2020-10-01T21:00:25.500Z</td>
                        <td>903434</td>
                        <td>prs.tproxy</td>
                        <td>- EXPENSE</td>
                        <td>WITHDRAW</td>
                        <td>test.bp2</td>
                        <td>MIXIN</td>
                        <td>8.0000</td>
                        <td>PRS</td>
                        <td>SUCCESS
                        <td></td>
                    </tr>
                    <tr>
                        <td>2020-10-01T16:44:23.000Z</td>
                        <td>872709</td>
                        <td>prs.tproxy</td>
                        <td>+ INCOME</td>
                        <td>DEPOSIT</td>
                        <td>MIXIN</td>
                        <td>test.bp2</td>
                        <td>1.0000</td>
                        <td>PRS</td>
                        <td>SUCCESS
                        <td></td>
                    </tr>
                    <tr>
                        <td>2020-10-01T16:42:16.000Z</td>
                        <td>872455</td>
                        <td>prs.tproxy</td>
                        <td>- EXPENSE</td>
                        <td>WITHDRAW</td>
                        <td>test.bp2</td>
                        <td>MIXIN</td>
                        <td>1.0000</td>
                        <td>PRS</td>
                        <td>SUCCESS
                        <td></td>
                    </tr>
                    <tr>
                        <td>2020-09-29T18:44:23.500Z</td>
                        <td>541510</td>
                        <td>eosio.token</td>
                        <td>+ INCOME</td>
                        <td>TRANSFER IN</td>
                        <td>eosio</td>
                        <td>test.bp2</td>
                        <td>9935.9000</td>
                        <td>PRS</td>
                        <td>SUCCESS
                        <td></td>
                    </tr>
                </tbody>
            </table>`
    },
});
