import { assertAddress, assertObject } from './quorum.mjs';
import { assertAmount, bigFormat } from './finance.mjs';
import { assertExtraLength } from './mvm.mjs';
import { utilitas, uoid, encryption, math } from 'utilitas';

const abiName = 'PaidGroup';
const AMOUNT_SCALE = 1e8;
const INT_FORMAT_OPTIONS = { precision: 0 };
const [ANNOUNCE_GROUP_PRICE, PAY_FOR_GROUP] = ['ANNOUNCE_GROUP_PRICE', 'PAY_FOR_GROUP'];
const ACTIONS = [ANNOUNCE_GROUP_PRICE, PAY_FOR_GROUP];
const memoReg = '^(.{2})(.{8})(.{4})(.{4})(.{4})(.{12})(.{40})(.{16})(.{8})$';
const encNum = (n, l) => { return new Number(n).toString(16).padStart(l, '0') };
const intFormat = (int) => bigFormat(int, '', INT_FORMAT_OPTIONS);
const scaleAmount = (amount) => intFormat(math.multiply(amount, AMOUNT_SCALE));
const unscaleAmount = (amount) => intFormat(math.divide(amount, AMOUNT_SCALE));

const assertInt = (int) => {
    int = utilitas.ensureString(String(int || 0)).replace(/\..*$/g, '');
    return int && int !== '0' ? assertAmount(int) : '0';
};

const assertMemo = (m) => {
    utilitas.assert(m, 'Invalid payload.', 400);
    m.action = utilitas.ensureString(m.action, { case: 'UP' });
    m.group_id = utilitas.ensureString(m.group_id, { case: 'LOW' });
    m.rum_address = assertAddress(m.rum_address, 'Invalid rum_address.');
    m.amount = assertInt(m.amount);
    m.duration = assertInt(m.duration);
    utilitas.assert(ACTIONS.includes(m.action), 'Invalid action.', 400);
    utilitas.assertUuid(m.group_id, 'Invalid group_id.', 400);
    return m;
};

const encodeMemo = (m) => {
    m = assertMemo(m);
    return encNum(ACTIONS.indexOf(m.action), 2)
        + uoid.compactUuid(m.group_id)
        + m.rum_address.toLowerCase().replace(/^0x/ig, '')
        + encNum(scaleAmount(m.amount), 16)
        + encNum(m.duration, 8);
};

const decodeMemo = (memo) => {
    const [sliceReg, s] = [new RegExp(memoReg), []];
    for (let i = 1; i <= 9; i++) { s.push(memo.replace(sliceReg, `$${i}`)); }
    const action = ACTIONS[~~s[0]];
    const group_id = `${s[1]}-${s[2]}-${s[3]}-${s[4]}-${s[5]}`;
    const rum_address = s[6];
    const amount = unscaleAmount(encryption.hexToBigInt(s[7]));
    const duration = encryption.hexToBigInt(s[8]);
    return assertMemo({ action, group_id, rum_address, amount, duration });
};

const unpackTransaction = async (data) => {
    assertObject(data, 'Invalid transaction data.');
    data.extra && utilitas.ignoreErrFunc(() => {
        data.extra = decodeMemo(assertExtraLength(data.extra))
    }, { log: false });
    return data;
};

export {
    ACTIONS,
    ANNOUNCE_GROUP_PRICE,
    PAY_FOR_GROUP,
    abiName,
    assertExtraLength,
    assertMemo,
    decodeMemo,
    encodeMemo,
    scaleAmount,
    unpackTransaction,
    unscaleAmount,
};
