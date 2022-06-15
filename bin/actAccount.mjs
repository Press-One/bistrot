import { account, utilitas } from '../index.mjs';

const action = async (argv) => {
    const resp = await account.getByAddress(
        argv.address, { ...argv, amountOnly: !argv.json }
    );
    if (!argv.json) {
        const assets = [];
        for (let i in resp.assets) {
            assets.push(`${i}: ${resp.assets[i]}`);
        }
        resp.assets = assets.join('\n');
    }
    return resp;
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Check an Account',
    help: [
        '    --address  Quorum account address            [STRING  / REQUIRED]',
    ],
    example: {
        args: {
            address: true,
        }
    },
    render: { table: { KeyValue: true } },
};
