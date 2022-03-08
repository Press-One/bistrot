import { assertAddress, assertObject } from './quorum.mjs';
import { assertAmount } from './finance.mjs';
import { assertExtraLength } from './mvm.mjs';
import { utilitas, uoid, encryption } from 'utilitas';

const abiName = 'PaidGroup';
const [ANNOUNCE_GROUP_PRICE, PAY_FOR_GROUP] = ['ANNOUNCE_GROUP_PRICE', 'PAY_FOR_GROUP'];
const actions = [ANNOUNCE_GROUP_PRICE, PAY_FOR_GROUP];
const memoReg = '^(.{2})(.{8})(.{4})(.{4})(.{4})(.{12})(.{40})(.{16})(.{8})$';
const encNum = (n, l) => { return new Number(n).toString(16).padStart(l, '0') };

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
    utilitas.assert(actions.includes(m.action), 'Invalid action.', 400);
    utilitas.assertUuid(m.group_id, 'Invalid group_id.', 400);
    return m;
};

const encodeMemo = (m) => {
    m = assertMemo(m);
    return encNum(actions.indexOf(m.action), 2)
        + uoid.compactUuid(m.group_id)
        + m.rum_address.toLowerCase().replace(/^0x/ig, '')
        + encNum(m.amount, 16)
        + encNum(m.duration, 8);
};

const decodeMemo = (memo) => {
    const [sliceReg, s] = [new RegExp(memoReg), []];
    for (let i = 1; i <= 9; i++) { s.push(memo.replace(sliceReg, `$${i}`)); }
    const action = actions[~~s[0]];
    const group_id = `${s[1]}-${s[2]}-${s[3]}-${s[4]}-${s[5]}`;
    const rum_address = s[6];
    const amount = encryption.hexToBigInt(s[7]);
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
    ANNOUNCE_GROUP_PRICE,
    PAY_FOR_GROUP,
    abiName,
    assertExtraLength,
    assertMemo,
    decodeMemo,
    encodeMemo,
    unpackTransaction,
};
