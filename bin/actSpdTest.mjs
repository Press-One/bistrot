import { quorum } from '../index.mjs';

const func = async (argv) => {
    Object.assign(global.chainConfig, { speedTest: true, debug: true });
    await quorum.getRpcUrl();
};

export const { func, name, help, example, render } = {
    func,
    name: 'Evaluate the connection speed of server nodes',
    help: [
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `spdtest` feature depends on the system `ping` command.    |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            title: 'evaluating all pre-configured nodes',
        },
        {
            title: 'evaluating a designated node',
            args: {
                rpcapi: true,
                chainapi: true,
            }
        }
    ],
};
