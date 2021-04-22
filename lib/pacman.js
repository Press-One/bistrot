'use strict';

const modName = 'pacman';
const idxSys = 'cypress';
const keyRootTrx = 'transactions_trx';
const keyRootTrxAct = `${keyRootTrx}_transaction_actions`;
const keyRootTrxActData = `${keyRootTrxAct}_data`;
const percentagePrecision = 100 * 100;
const inteval = 0.5;
const curDefault = 100;
const curLimit = { min: 1, max: curDefault * 100 };
const dfultWorkers = { workerIndex: 0, workers: [{}] };
const log = (content) => { silent || utilitas.modLog(content, modName); };
const getVerifyLength = () => { return current * 100; };
const getVerifyDelay = () => { return current * inteval * (10 + 1); }; // 10secs
const getVerifyCatch = () => { return utilitas.ensureInt(current / 10); };
const makeAttrs = (object) => { return { _attributes: object }; };
const makeAttrType = (tp) => { return makeAttrs({ type: `${idxSys}.${tp}` }); };
const vf = () => { return callbacks.verifiedIdGet && callbacks.verifiedIdSet; };
const astFd = (k, r) => { utilitas.assert(r, `Undefined rule: '${k}'.`, 500); };
const key = (k) => { const resp = keys[k]?.[0]; astFd(k, resp); return resp; };
const rule = (k) => { const resp = rules[k]; astFd(k, resp); return resp; };

const callbacks = {
    initIdGet: null, lastIdGet: null, lastIdSet: null,
    verifyIndex: null, verifiedIdGet: null, verifiedIdSet: null,
    heartbeat: null, newAction: null, newBlock: null, newTransaction: null,
};

const [nT, nC, aUTK, aINT, aSTR, aFLT, aDTE] = [
    '_text', '_cdata', makeAttrType('untoken'), makeAttrType('long'),
    makeAttrType('string'), makeAttrType('float'), makeAttrType('date'),
];

const [ORI, TXT, STR, JSN, UTK, NUM, BLN, TME, STM, CDT, ENM, TXR] = [
    'ORIGINAL', 'TEXT', 'STRING', 'JSON', 'UNTOKEN', 'NUMBER',
    'BOOLEAN', 'TIME', 'STRTIME', 'CDATA', 'ENUM', 'TEXTARR',
];

const keys = {
    ACTION_ACCOUNT: [`${keyRootTrxAct}_account`, UTK],
    ACTION_MROOT: ['action_mroot', TXT],
    ACTION_NAME: [`${keyRootTrxAct}_name`, UTK],
    BLOCK_EXTENSIONS: ['block_extensions', JSN],
    BLOCK_ID: ['block_id', TXT],
    BLOCK_NUM: ['block_num', NUM],
    BLOCK: ['block', null],
    CLASS: ['class', ENM],
    CONFIRMED: ['confirmed', NUM],
    CONTENT: ['content', JSN],
    CY_TENANTID: ['cy_tenantid', UTK],
    CYPRESS_MATCH: [`${idxSys}.match`, NUM],
    CYPRESS_UPDATETIME: [`${idxSys}_updatetime`, STM],
    DATA_ALLOW: [`${keyRootTrxActData}_data_allow`, UTK],
    DATA_BILL_ID: [`${keyRootTrxActData}_data_bill_id`, TXT],
    DATA_CONTENT_ID: [`${keyRootTrxActData}_data_content_id`, TXT],
    DATA_DENY: [`${keyRootTrxActData}_data_deny`, UTK],
    DATA_FILE_HASH: [`${keyRootTrxActData}_data_file_hash`, TXT],
    DATA_ID: [`${keyRootTrxActData}_id`, TXT],
    DATA_MIXIN_TRACE_ID: [`${keyRootTrxActData}_mixin_trace_id`, TXT],
    DATA_ORACLESERVICE: [`${keyRootTrxActData}_oracleservice`, TXT],
    DATA_PROFILE_PROVIDER: [`${keyRootTrxActData}_data_profile_provider`, UTK],
    DATA_QUANTITY_AMT: [`${keyRootTrxActData}__amount_quantity__amt`, NUM],
    DATA_QUANTITY_CUR: [`${keyRootTrxActData}__amount_quantity__cur`, UTK],
    DATA_REQ_ID: [`${keyRootTrxActData}__dp_wd_req__id`, TXT],
    DATA_SYNC_AUTH_RESULT: [`${keyRootTrxActData}__sync_auth__result`, BLN],
    DATA_TOPIC: [`${keyRootTrxActData}_data_topic`, TXT],
    DATA_TYPE: [`${keyRootTrxActData}_type`, TXT],
    DATA_USER_ADDRESS: [`${keyRootTrxActData}_user_address`, TXT],
    DATA_USER_FROM: [`${keyRootTrxActData}__from_user`, UTK],
    DATA_USER_TO: [`${keyRootTrxActData}__to_user`, UTK],
    DATA_WRAPPING_ID: [`${keyRootTrxActData}_data_wrapping_id`, TXT],
    DATA: [`${keyRootTrxActData}_data`, JSN],
    HEADER_EXTENSIONS: ['header_extensions', JSN],
    META_MIME: [`${keyRootTrxActData}_meta_mime`, TXT],
    META_URIS: [`${keyRootTrxActData}_meta_uris`, TXT],
    META: [`${keyRootTrxActData}_meta`, JSN],
    NEW_PRODUCERS: ['new_producers', UTK],
    PREVIOUS: ['previous', TXT],
    PRODUCER_SIGNATURE: ['producer_signature', TXT],
    PRODUCER: ['producer', UTK],
    REF_BLOCK_PREFIX: ['ref_block_prefix', NUM],
    SCHEDULE_VERSION: ['schedule_version', NUM],
    TIMESTAMP: ['timestamp', TME],
    TITLE: ['title', CDT],
    TRANSACTION_ID: [`${keyRootTrx}_id`, TXT],
    TRANSACTION_IDS: ['transaction_ids', TXR],
    TRANSACTION_MROOT: ['transaction_mroot', TXT],
    URI: ['uri', TXT],
    XMLURI: ['xmluri', TXT],
};

const rules = {}; for (let i in keys) { rules[keys[i][0]] = keys[i][1]; }

let curId = 0;
let verifiedId = 0;
let current = 0;
let silent = false;

const valuePack = (k, v) => {
    let resp;
    switch (rule(k)) {
        case BLN: resp = { [nT]: String(!!v), ...aSTR }; break;
        case CDT: resp = { [nC]: v }; break;
        case ENM: resp = { [nT]: v.toUpperCase(), ...aSTR }; break;
        case NUM: resp = { [nT]: v, ...aINT }; break;
        case TXT: case 'TEXTARR': resp = { [nT]: v }; break;
        case TME: resp = { [nT]: new Date(v).getTime(), ...aINT }; break;
        case STR: resp = { [nT]: v, ...aSTR }; break;
        case UTK: resp = { [nT]: v, ...aUTK }; break;
        default: astFd(k);
    };
    return resp;
};

const valueUnpack = (k, v) => {
    let resp;
    switch (rule(k)) {
        case ORI: case CDT: case TXT: case STR: case ENM: case UTK:
            resp = v; break;
        case JSN: try { resp = JSON.parse(v); } catch (e) { }; break;
        case BLN: resp = utilitas.humanReadableBoolean(v); break;
        case NUM: resp = Number(v); break;
        case TME: v = parseInt(v); case STM: resp = new Date(v); break;
        case TXR: resp = String(v).split(' ').filter(x => { return x; }); break;
        default: astFd(k);
    };
    return resp;
};

const runCallback = async (type, func, args) => {
    try { return await (callbacks[type] || func)(args); } catch (e) { log(e); }
};

const initIdGet = async () => {
    return (curId = await runCallback(
        'initIdGet', sushitrain.getLastIrreversibleBlockNum
    ));
};

const lastIdGet = async () => {
    return await runCallback('lastIdGet', async () => {
        return utilitas.ensureInt(curId, { min: 0 });
    });
};

const lastIdSet = async (arg) => {
    return await runCallback('lastIdSet', async (id) => {
        return ~~id && (curId = id);
    }, arg);
};

const verifyIndex = async (a) => {
    return await runCallback('verifyIndex', async (id) => { return false; }, a);
};

const verifiedIdGet = async () => {
    return await runCallback('verifiedIdGet', async () => {
        return utilitas.ensureInt(verifiedId, { min: 0 });
    });
};

const verifiedIdSet = async (arg) => {
    return await runCallback('verifiedIdSet', async (id) => {
        return ~~id && (verifiedId = id);
    }, arg);
};

const heartbeat = async () => {
    return await runCallback('heartbeat', async () => { return dfultWorkers; });
};

const newAction = async (arg) => {
    return await runCallback('newAction', async () => { }, arg);
};

const newBlock = async (arg) => {
    return await runCallback('newBlock', async (block) => {
        return !callbacks.newAction
            && !callbacks.newTransaction
            && !callbacks.verifyIndex && log(block);
    }, arg);
};

const newTransaction = async (arg) => {
    return await runCallback('newTransaction', async () => { }, arg);
};

const packAct = (action, transaction, block) => {
    const k = action?.data;
    const s = k?.unpacked_meta;
    const n = s?.request;
    const o = s?.mixin_snapshot;
    const p = k?.unpacked_data || k;
    const y = k?.memo;
    let [l, m, q, r] = [finance.parseAmountAndCurrency(
        k?.amount || k?.quantity || n?.amount
    ), null, k?.from || k?.user || n?.user, k?.to || k?.user || n?.user];
    if (utilitas.isBoolean(k?.sync_result)) { m = k.sync_result; }
    else if (utilitas.isBoolean(k?.auth_result)) { m = k.auth_result; }
    if (!l && y?.bp_name && y?.bpay_amount && y?.vpay_amount) {
        const bm = finance.parseAmountAndCurrency(y.bpay_amount);
        const vm = finance.parseAmountAndCurrency(y.vpay_amount);
        const sm = bm && vm && parseInt(
            finance.bignumberSum(bm[2], vm[2]).toString()
        );
        l = bm && vm ? [finance.restoreAmount(sm), bm[1], sm] : null;
        q = 'eosio.vpay';
        r = y.bp_name;
    } else if (!l && ['SWAP', 'RM_LIQUID', 'ADD_LIQUID'].includes(y?.type)) {
        l = finance.parseAmountAndCurrency(y?.pool_token);
        q = y?.from_user;
        r = y?.to_user;
    }
    const act = {
        ACTION_ACCOUNT: action.account,
        ACTION_NAME: action.name,
        BLOCK_ID: block.block_id,
        BLOCK_NUM: block.block_num,
        BLOCK: block,
        DATA_ALLOW: p?.allow,
        DATA_BILL_ID: p?.bill_id,
        DATA_CONTENT_ID: p?.content_id,
        DATA_DENY: p?.deny,
        DATA_FILE_HASH: p?.file_hash,
        DATA_ID: k?.id?.toUpperCase?.(),
        DATA_MIXIN_TRACE_ID: k?.mixin_trace_id || o?.trace_id,
        DATA_ORACLESERVICE: k?.oracleservice,
        DATA_PROFILE_PROVIDER: p?.profile_provider,
        DATA_QUANTITY_AMT: l?.[2],
        DATA_QUANTITY_CUR: l?.[1],
        DATA_REQ_ID: k?.deposit_id || k?.withdraw_id || k?.req_id,
        DATA_SYNC_AUTH_RESULT: m,
        DATA_TOPIC: p?.topic,
        DATA_TYPE: k?.type || n?.type,
        DATA_USER_ADDRESS: k?.user_address,
        DATA_USER_FROM: q,
        DATA_USER_TO: r,
        DATA_WRAPPING_ID: p?.wrapping_id,
        DATA: p,
        META_MIME: s?.mime,
        META_URIS: s?.uris,
        META: s,
        PREVIOUS: block.previous,
        PRODUCER: block.producer,
        TIMESTAMP: block.timestamp,
        TRANSACTION_ID: transaction?.trx?.id || '*',
    };
    for (let i in act) { act[key(i)] = act[i] ?? null; delete act[i]; }
    return act;
};

const fetchBlock = async (block_num, options) => {
    const optOutput = (
        options?.newAction || options?.newTransaction || options?.newBlock
    ) ? async () => { } : null;
    let block = null;
    try { block = await sushitrain.getBlockByNumOrId(block_num); }
    catch (err) { log(err); return; }
    block.block_id = block.id.toUpperCase();
    delete block.id;
    for (let i of block?.transactions?.length ? block.transactions : [{}]) {
        i?.trx?.id && (i.trx.id = i.trx.id.toUpperCase());
        for (let j of i?.trx?.transaction?.actions?.length
            ? i.trx.transaction.actions : [{}]) {
            try {
                j.data.unpacked_meta
                    = JSON.parse(j?.data?.meta || j?.data?.sync_meta);
            } catch (e) { j.data && (j.data.unpacked_meta = null); }
            try {
                j.data.unpacked_data
                    = JSON.parse(j?.data?.data || j?.data?.auth_data);
            } catch (e) { j.data && (j.data.unpacked_data = null); }
            try { j.data.memo = JSON.parse(j?.data?.memo); } catch (e) { }
            await (
                options?.newAction || optOutput || newAction
            )({ action: packAct(j, i, block), transaction: i });
        }
        Object.keys(i).length && await (
            options?.newTransaction || optOutput || newTransaction
        )(i);
    }
    await (options?.newBlock || optOutput || newBlock)(block);
};

const getPercentage = (cur, total) => {
    return finance.bigFormat(math.divide(math.round(math.multiply(math.divide(
        cur, total
    ), 100 * percentagePrecision)), percentagePrecision)) + ' %';
};

const analytics = async () => {
    // sync
    const { workerIndex, workers } = (await heartbeat()) || dfultWorkers;
    const lastIrreversibleId = await sushitrain.getLastIrreversibleBlockNum();
    const [scale, lastSyncedId] = [
        workers.length, Math.min(await lastIdGet(), lastIrreversibleId),
    ];
    const syncPercentage = getPercentage(lastSyncedId, lastIrreversibleId);
    const [targetFrom, targetTo] = [
        Math.min(lastSyncedId + 1, lastIrreversibleId),
        Math.min(lastSyncedId + current * (scale || 1), lastIrreversibleId),
    ];
    const [pending, jobs] = [utilitas.range(targetFrom, targetTo), []];
    pending.map(x => { if (x % scale === workerIndex) { jobs.push(x); } });
    let [objLog, arrLog] = [{
        Sync: `${lastSyncedId} / ${lastIrreversibleId} (${syncPercentage})`,
        Current: `${current} * (${workerIndex + 1} of ${workers.length})`,
        Range: [targetFrom, targetTo],
    }, []];
    for (let i in objLog) { arrLog.push([i, objLog[i]].join(': ')); }
    log(arrLog.join(', ') + '.');
    // verify
    const verifyMax = utilitas.ensureInt(
        lastSyncedId - getVerifyDelay(), { min: 1 }
    );
    let lastVerifiedId = vf() && Math.min(await verifiedIdGet(), verifyMax);
    const [verifyFrom, verifyTo, verifyCatch, missing] = [
        Math.min(lastVerifiedId + 1, verifyMax),
        Math.min(lastVerifiedId + getVerifyLength(), verifyMax),
        Math.min(lastVerifiedId + getVerifyCatch(), verifyMax), [],
    ];
    if (vf()) {
        let verifyResp = await verifyIndex([verifyFrom, verifyTo]);
        if (verifyResp) { lastVerifiedId = verifyTo; } else {
            verifyResp = [];
            for (let i = verifyFrom; i <= verifyCatch; i++) {
                verifyResp.push(verifyIndex(i));
            }
            verifyResp = await Promise.all(verifyResp);
            for (let i = 0; i < verifyResp.length; i++) {
                const cId = verifyFrom + i;
                if (verifyResp[i] && !missing.length) { lastVerifiedId = cId; }
                else if (!verifyResp[i]) { missing.push(cId); }
            }
        }
    }
    const verifiedPercentage = vf() && getPercentage(lastVerifiedId, verifyMax);
    const verifiedRange = [verifyFrom, missing.length ? verifyCatch : verifyTo];
    if (vf()) {
        await verifiedIdSet(lastVerifiedId);
        [objLog, arrLog] = [{
            Verified: `${lastVerifiedId} / ${verifyMax} (${verifiedPercentage})`,
            Range: verifiedRange,
            Missing: missing.length,
        }, []];
        for (let i in objLog) { arrLog.push([i, objLog[i]].join(': ')); }
        log(arrLog.join(', ') + '.');
    }
    // result
    return {
        current, workerIndex, workers, lastIrreversibleId, scale, lastSyncedId,
        pending, syncPercentage, syncRange: [targetFrom, targetTo], pending,
        jobs, verified: vf(), lastVerifiedId, verifiedPercentage, verifiedRange,
        missing,
    };
};

const sync = async () => {
    curId || await initIdGet();
    try {
        const anlResp = await analytics();
        const fetchResp = [...anlResp.jobs, ...anlResp.missing].map(x => {
            fetchBlock(x);
        });
        await Promise.all(fetchResp);
        await lastIdSet(anlResp.jobs[anlResp.jobs.length - 1]);
    } catch (err) { log(err); }
};

const init = async (options) => {
    options = options || {};
    utilitas.mergeAtoB(options.callbacks, callbacks);
    current = utilitas.ensureInt(options.current || curDefault, curLimit);
    silent = !!options.silent;
    return await (options && options.event || event).loop(
        sync, inteval, current, 0, modName, { silent: true }
    );
};

module.exports = {
    keys,
    rules,
    fetchBlock,
    init,
    initIdGet,
    key,
    rule,
    valuePack,
    valueUnpack,
};

const { utilitas, event, math } = require('utilitas');
const sushitrain = require('./sushitrain');
const finance = require('./finance');
