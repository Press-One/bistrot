'use strict';

const { sushitrain, helper } = require('../');

const func = async (argv) => {
    Object.assign(global.chainConfig, { speedTest: true, debug: true });
    console.log('Evaluate RPC API nodes:');
    await sushitrain.getRpcUrl();
    console.log('\nEvaluate Chain API nodes:');
    await helper.assembleChainApiUrl();
};

module.exports = {
    func,
    name: 'Evaluate the connection speed of server nodes',
    help: [
        '    ┌---------------------------------------------------------------┐',
        '    | 1. `spdtest` feature depends on the system `ping` command.    |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example of evaluating all pre-configured nodes:',
        '    $ prs-atm spdtest',
        '',
        '    > Example of evaluating a designated node:',
        '    $ prs-atm spdtest \\',
        '              --rpcapi=http://51.68.201.144:8888 \\',
        '              --chainapi=https://prs-bp3.press.one',
    ],
};
