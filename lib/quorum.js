'use strict';

const getEthClient = async (pk, o) => { return (await getClient(pk, o)).eth; };
const clients = {};

let rpc = null;

const getRpcUrl = async (options) => {
    options = options || {};
    const c = await config();
    if (!options.rpcapi && !rpc) {
        if (c.speedTest) {
            if (c.debug) { log('Evaluating RPC API nodes...'); }
            rpc = await network.pickFastestHttpServer(
                c.rpcApi, { debug: c.debug }
            );
        } else { rpc = utilitas.getConfigFromStringOrArray(c.rpcApi); }
    }
    const resp = options.rpcapi || rpc;
    utilitas.assert(resp, 'RPC api root has not been configured', 500);
    return resp;
};

const buildClient = async (privateKey, opts) => {
    utilitas.assert(opts?.noKey || privateKey, 'Private key is required.', 400);
    let provider = (
        opts?.ignoreGiven ? null : web3.givenProvider
    ) || new web3.providers.HttpProvider(await getRpcUrl(opts));
    privateKey && (provider = new hdWalletProvider({
        privateKeys: [privateKey],
        providerOrUrl: provider,
    }));
    utilitas.assert(provider, 'Error configurating signature provider.', 500);
    const client = new web3(provider);
    utilitas.assert(client, 'Error configurating api client.', 500);
    return client;
};

const buildDefaultClient = async () => {
    return await buildClient(null, { noKey: true });
};

const getClient = async (privateKey, options) => {
    options = options || {};
    const key = privateKey ? crypto.privateKeyToAddress(privateKey) : '_';
    if (key && clients[key]) { return clients[key]; }
    const client = privateKey
        ? await buildClient(privateKey, options)
        : await buildDefaultClient();
    if (key) { clients[key] = client; }
    return client;
};

const getBlockByNumOrHash = async (numOrHash, options) => {
    return (await getEthClient(null, options)).getBlock(numOrHash, true);
};

const getTransactionByHash = async (hash, options) => {
    return (await getEthClient(null, options)).getTransaction(hash);
};

const getTransactionReceiptByHash = async (hash, options) => {
    return (await getEthClient(null, options)).getTransactionReceipt(hash);
};

const getBalanceByAddress = async (address, options) => {
    return (await getEthClient(null, options)).getBalance(address);
};

const initContract = async (abi, address, options) => {
    return new (
        await getEthClient(options?.privateKey, options)
    ).Contract(abi, address);
};

const initPreparedContract = async (name, options) => {
    const { abi, address } = await etc.readAbi(name, options);
    return await initContract(abi, address, options);
};

module.exports = {
    buildClient,
    buildDefaultClient,
    getBalanceByAddress,
    getBlockByNumOrHash,
    getClient,
    getRpcUrl,
    getTransactionByHash,
    getTransactionReceiptByHash,
    initContract,
    initPreparedContract,
};

const { utilitas, network } = require('utilitas');
const hdWalletProvider = require('@truffle/hdwallet-provider');
const config = require('./config');
const crypto = require('./crypto');
const web3 = require('web3');
const etc = require('./etc');





// let i = 3200;
// let i = 9702;

// > transaction hash:    0xa47771e0246c901164af592cc2f3cf105aceea765c5a00f075550d01fbcb7d03
//    > Blocks: 0            Seconds: 9
//    > contract address:    0xaeab303FC1A4c364a16C8D86ad2563E44089E3a0
//    > block number:        14606
//    > block timestamp:     1626148517
//    > account:             0x2AeF3da35e9A2EC29aE25A04d9C9e92110910A51
//    > balance:             904625697166532776746648320380374280103671755200316906558.261437262821325312
//    > gas used:            703518 (0xabc1e)
//    > gas price:           1 gwei
//    > value sent:          0 ETH
//    > total cost:          0.000703518 ETH

// const getBlockXXX = async () => {
    // var web3 =
    // var web3 = new Web3(Web3.givenProvider || 'http://Enlightenment.local:8545');


    // // var Web3 = require('web3');
    // // var web3 = new Web3('http://localhost:8545');
    // // // or
    // // var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

    // // // change provider
    // // web3.setProvider('ws://localhost:8546');
    // // // or
    // // web3.setProvider(new Web3.providers.WebsocketProvider('ws://localhost:8546'));

    // // for (let i = 0; i < 800; i++) {
    // //     const a = await web3.eth.getBlock(i);
    // //     const b = await web3.eth.getBlockTransactionCount(a.hash);
    // //     // a.decode = web3.eth.abi.decodeParameter('string', a.extraData);
    // //     console.log(a, b);
    // // }

    // // while (1 === 1) {
    // //     i++;
    // //     const a = await web3.eth.getBlock(i);
    // //     const b = await web3.eth.getBlockTransactionCount(a.hash);
    // //     console.log(a, b);
    // //     if (b != 0) {
    // //         console.log(i);
    // //         process.exit();
    // //     }
    // // }

    // // const a = await web3.eth.getBlock(11);
    // // const b = await web3.eth.getBlockTransactionCount(a.hash);
    // // console.log(a, b);
    // // for (let i = 0; i < b; i++) {
    // //     const c = await web3.eth.getTransactionFromBlock(a.hash, i);
    // //     const d = await web3.eth.getTransactionReceipt(c.hash);
    // //     console.log(c, d);
    // // }

    // // function hexToString(str) {
    // //     const buf = Buffer(str, 'hex');
    // //     return buf.toString('utf8');
    // // }

    // // while (true) {
    // //     i++;
    // //     const a = await web3.eth.getBlock(i); // 'latest'
    // //     const x = web3.utils.hexToAscii(a.extraData).replace(/[\u{0000}-\u{0020}]/gu, '');
    // //     // const x = hexToString('e4b883e5bda9e7a59ee4bb99e9b1bc040a21');
    // //     // const x = hexToString(a.extraData.replace(/^0x/i, ''));
    // //     const b = await web3.eth.getBlockTransactionCount(a.hash);
    // //     // console.log(a);
    // //     // console.log(a, b, x);
    // //     console.log(`------------------------${i}----------------------------`);
    // //     if (b != 0) {
    // //         console.log(a, b);
    // //         for (let i = 0; i < b; i++) {
    // //             const c = await web3.eth.getTransactionFromBlock(a.hash, i);
    // //             const d = await web3.eth.getTransactionReceipt(c.hash);
    // //             console.log(c, d);
    // //         }
    // //     }
    // // }

    // // const a = await web3.eth.getAccounts(); // get node accounts
    // // const b = await web3.eth.getBalance(a[0]); // get balance of first account
    // // console.log(a, b);
    // // web3.eth.getCode();
    // const abiDecoder = require('abi-decoder'); // NodeJS

    // let hash = '0x6d8a36e3c64eeb56a0111e9fc8b1f86691dc9ac2f7a973221d105841967e034b';

    // // while (true) {
    // //     const a = await web3.eth.getBlock(hash, true);
    // //     const b = await web3.eth.getBlock(a.number, true);
    // //     console.log(a, b);
    // //     console.log('--------------------------------------------------------');
    // //     console.log(a.uncles.length, b.uncles.length);
    // //     if (a.hash == b.hash) {
    // //         process.exit();
    // //     }
    // //     hash = a.parentHash;
    // // };


    // const a = await web3.eth.getBlock(9702, true);
    // // 9702
    // //0x1d33e2b4b60401360867ee7551737787a5f689652b2736285287b683bc11c779 // 9700
    // // for (let i = 9650; i < 10000; i++) {
    // // const a = await web3.eth.getUncle(9702, 0);
    // // https://github.com/ConsenSys/abi-decoder
    // // }
    // console.log(a);
    // return;
    // abiDecoder.addABI([
    //     {
    //         "constant": true,
    //         "inputs": [
    //             {
    //                 "internalType": "uint256",
    //                 "name": "",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "name": "posts",
    //         "outputs": [
    //             {
    //                 "internalType": "string",
    //                 "name": "id",
    //                 "type": "string"
    //             },
    //             {
    //                 "internalType": "address",
    //                 "name": "user_address",
    //                 "type": "address"
    //             },
    //             {
    //                 "internalType": "string",
    //                 "name": "content_type",
    //                 "type": "string"
    //             },
    //             {
    //                 "internalType": "string",
    //                 "name": "meta",
    //                 "type": "string"
    //             },
    //             {
    //                 "internalType": "string",
    //                 "name": "data",
    //                 "type": "string"
    //             },
    //             {
    //                 "internalType": "bytes32",
    //                 "name": "hash",
    //                 "type": "bytes32"
    //             },
    //             {
    //                 "internalType": "string",
    //                 "name": "signature",
    //                 "type": "string"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     },
    //     {
    //         "constant": false,
    //         "inputs": [
    //             {
    //                 "internalType": "string",
    //                 "name": "id",
    //                 "type": "string"
    //             },
    //             {
    //                 "internalType": "string",
    //                 "name": "content_type",
    //                 "type": "string"
    //             },
    //             {
    //                 "internalType": "string",
    //                 "name": "meta",
    //                 "type": "string"
    //             },
    //             {
    //                 "internalType": "string",
    //                 "name": "data",
    //                 "type": "string"
    //             },
    //             {
    //                 "internalType": "bytes32",
    //                 "name": "hash",
    //                 "type": "bytes32"
    //             },
    //             {
    //                 "internalType": "string",
    //                 "name": "signature",
    //                 "type": "string"
    //             }
    //         ],
    //         "name": "post",
    //         "outputs": [],
    //         "payable": false,
    //         "stateMutability": "nonpayable",
    //         "type": "function"
    //     },
    //     {
    //         "constant": true,
    //         "inputs": [],
    //         "name": "getLength",
    //         "outputs": [
    //             {
    //                 "internalType": "uint256",
    //                 "name": "",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     }
    // ]);

    // const d = abiDecoder.decodeMethod(a.transactions[0].input);

    // console.log(a, d);

    // a = {
    //     difficulty: '2',
    //     extraData: '0xd883010a04846765746888676f312e31362e34856c696e757800000000000000d2161656f619b17139749fc87d355bd842a2d739841bb48ae388b528cc1e9b6903b2182a1b9b2560a36da8bdf107c1c6d842b30ce762a611f9dd159af2bd51ee00',
    //     gasLimit: 8000000,
    //     gasUsed: 281240,
    //     hash: '0xf66c33085a6c439c37a3cb7782688f1e555ea6f522872a87fb476ac203bb8c35',
    //     logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    //     miner: '0x0000000000000000000000000000000000000000',
    //     mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    //     nonce: '0x0000000000000000',
    //     number: 9702,
    //     parentHash: '0x0884b65c6b386855436f9de0017ec1ed253f460f5c3539bccd6a8b96b50b8c21',
    //     receiptsRoot: '0x5172870bbbc60f65d88979f870631df2d66e2984c4fc1144936ba6e43a7c7560',
    //     sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    //     size: 1366,
    //     stateRoot: '0x2c82b5e2779798b8ee515bd4fec6eedd85441590d48932795b9f97037d5c864e',
    //     timestamp: 1625792898,
    //     totalDifficulty: '19405',
    //     transactions: [
    //         '0x1328c6961c40cfd62d9128ade49ebc9ba80db1d8edc81d2d4a80fb8db685d6dd'
    //     ],
    //     transactionsRoot: '0x9daad34fec4d7d3050b3dfdc1cf61aee0ece708ed6a10d5ff2d6c54e71c9ef3a',
    //     uncles: []
    // }

    // b = {
    //     difficulty: '2',
    //     extraData: '0xd883010a04846765746888676f312e31362e34856c696e7578000000000000005c4bace547e0c0ef4409a1985dc6abe4d9990d7c4a8ef3e423985cda2d0fb06e4f8bf077afa611dfa3cba8830313e365570758a12dadd9b756caa7bd2bb25bbd00',
    //     gasLimit: 8000000,
    //     gasUsed: 0,
    //     hash: '0xa30b68ef03c375c4dd35fd33b3e1700c1093cab313fec1145885b9fb38d37945',
    //     logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    //     miner: '0x0000000000000000000000000000000000000000',
    //     mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    //     nonce: '0x0000000000000000',
    //     number: 9702,
    //     parentHash: '0x307f8eb9754ad5878203c1ab3c1e4fe3c8f87c74ddca09c445d8c778c3eab5fe',
    //     receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
    //     sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    //     size: 608,
    //     stateRoot: '0xf7e91bfbef32d88f535bdef43feef847fa851959a2da9d250c5a1b2745eb39c5',
    //     timestamp: 1625802502,
    //     totalDifficulty: '19405',
    //     transactions: [],
    //     transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
    //     uncles: []
    // };
// };
