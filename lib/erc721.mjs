import { assertAddress, assertAsset, assertOwner } from './crypto.mjs';
import { utilitas } from 'utilitas';

import {
    callPreparedContractMethod, deployPreparedContract,
    sendToPreparedContractMethod,
} from './quorum.mjs';

const abiName = 'RumERC721';

const [CONTRACT_FLAVOR, BURN, MINT, CONTRACT_BYTES_START, CONTRACT_BYTES_END] = [
    'ERC721PresetMinterPauserAutoId', 'BURN', 'MINT',
    '0x60806040523480156200001157600080fd5b5060405162004cfd38038062004cfd833981810160405281019062000037919062000514565',
    'b5056fea2646970667358221220a0b276b853e944292cef42f64b60693e52d81aac2c2706e365a8d9a8149fcc1a64736f6c63430008070033',
];

const callPreparedMethod = (add, mth, args, opts) => callPreparedContractMethod(
    CONTRACT_FLAVOR, mth, args || [], {
    ...opts || {}, contractAddress: assertAsset(add)
});

const sendToPreparedMethod = (ad, m, a, key, o) => sendToPreparedContractMethod(
    CONTRACT_FLAVOR, m, a || [], {
    ...o || {}, contractAddress: assertAsset(ad), privateKey: key
});

const mint = (add, acc, key, options) => sendToPreparedMethod(
    add, 'mint', [assertAddress(acc)], key, options
);

const deploy = async (symbol, privateKey, options) => {
    symbol = utilitas.ensureString(symbol, { case: 'UP' });
    privateKey = utilitas.ensureString(privateKey);
    const baseTokenURI = utilitas.ensureString(options?.baseTokenURI, { trim: true });
    assert(symbol, 'Symbol is required', 400);
    assert(privateKey, 'Private-key is required', 400);
    baseTokenURI && utilitas.assertUrl(baseTokenURI, 'Invalid baseTokenURI', 400);
    return await deployPreparedContract(abiName, [
        utilitas.ensureString(options?.name) || `${symbol} Token`, symbol,
        baseTokenURI,
    ], { ...options || {}, contract: CONTRACT_FLAVOR, privateKey });
};

const getTokenURI = async (add, options) => await callPreparedMethod(
    add, 'tokenURI', ['0'], options
);

const balanceOf = async (add, acc, options) => Number(
    await callPreparedMethod(add, 'balanceOf', [assertOwner(acc)], options)
);

export {
    BURN,
    CONTRACT_BYTES_END,
    CONTRACT_BYTES_START,
    CONTRACT_FLAVOR,
    MINT,
    balanceOf,
    callPreparedMethod,
    deploy,
    getTokenURI,
    mint,
    sendToPreparedMethod,
};
