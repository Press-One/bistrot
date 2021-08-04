'use strict';

const solName = 'RumERC20';


const test = async (options) => {
    const key = '44b48135d9d1b40bc0092bf3a2ef180ef0e4df54fdeb21c0a82e095616ecbe2d';
    const add = '0x' + crypto.privateKeyToAddress(key);


    const y = await quorum.deployPreparedContract(
        solName,
        ['testToken', 'TTK', web3.utils.toBN('21000000000000000000000000'), add],
        { privateKey: key }
    );

    console.log(y);

    // const x = await etc.getSolByName(solName, {});

    // // console.log(Object.keys(x));
    // const a = new (
    //     await quorum.getEthClient(key, options)
    // ).Contract(x.abi);


    // const add = '0x' + crypto.privateKeyToAddress(key);

    // // console.log(add);
    // // return;
    // // console.log(x.evm.bytecode.object);
    // // return;

    // // console.log(Object.keys(x));
    // // console.log(x.evm.bytecode.object);

    // // const c = a.new('0x' + x.evm.bytecode.object);
    // // console.log(c);
    // // return;

    // const gas = await a.deploy({
    //     data: '0x' + x.evm.bytecode.object,
    //     arguments: ['testToken', 'TTK', web3.utils.toBN('21000000000000000000000000'), add]
    // }).estimateGas();
    // // console.log(gas);
    // // return;
    // const b = a.deploy(
    //     {
    //         data: '0x' + x.evm.bytecode.object,
    //         arguments: ['testToken', 'TTK', web3.utils.toBN('21000000000000000000000000'), add],
    //     }
    // );
    // // console.log(b);
    // // console.log('xxx');
    // const c = await b.send({
    //     from: add,
    //     gas: gas + 1,
    //     // gas: 1,
    //     // gasPrice: 1,
    // });
    // console.log('yyyy');

    // console.log(c);



    // const instance = await RumERC20.deployed();
    // const totalSupply = await instance.totalSupply();
    // assert.equal
    // construct(string tokenName, string tokensymbol, uint256 cap, address minter)
};

module.exports = {
    test,
};

const quorum = require('./quorum');
const crypto = require('./crypto');
const web3 = require('web3');
const etc = require('./etc');
