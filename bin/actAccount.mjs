import { account } from '../index.mjs';

const func = async (argv) => {
    return await account.getByAddress(argv.address);
};

export const { func, name, help, example, render } = {
    func,
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
