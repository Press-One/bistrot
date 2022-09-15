
import { assertAsset } from './crypto.mjs';
import { callPreparedContractMethod, sendToPreparedContractMethod } from './quorum.mjs';

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

const mint = (address, to, key, options) => sendToPreparedMethod(
    address, 'mint', [assertAsset(to)], key, options
);

export {
    BURN,
    CONTRACT_BYTES_END,
    CONTRACT_BYTES_START,
    CONTRACT_FLAVOR,
    MINT,
    callPreparedMethod,
    mint,
    sendToPreparedMethod,
};
