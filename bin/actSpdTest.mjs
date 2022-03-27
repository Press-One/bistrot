import { quorum } from '../index.mjs';

const action = async (argv) => {
    Object.assign(globalThis.chainConfig, { speedTest: true, debug: true });
    await quorum.getRpcUrl();
};

export const { func, name, help, example, render } = {
    func: action,
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
