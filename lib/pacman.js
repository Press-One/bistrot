'use strict';

const [modName, idxSys, cy_tenantid, classBlack, classTranx]
    = ['pacman', 'cypress', 'chain.prs', 'BLOCK', 'TRANSACTION'];
const [percentagePrecision, inteval, curDefault] = [100 * 100, 0.5, 100];
const [version, encoding, _text, _cdata] = ['1.0', 'utf-8', '_text', '_cdata'];
const uriRoot = 'https://prs-bp1.press.one/api/';
const keyRootTrx = 'transactions_trx';
const keyRootTrxAct = `${keyRootTrx}_transaction_actions`;
const keyRootTrxActData = `${keyRootTrxAct}_data`;
const DOCS = 'docs';
const curLimit = { min: 1, max: curDefault * 100 };
const vfdlDefault = 10; // 10 seconds
const vfdlLimit = { min: 1, max: vfdlDefault * 10 };
const dfultWorkers = { workerIndex: 0, workers: [{}] };
const log = (content) => { silent || utilitas.modLog(content, modName); };
const getVerifyLength = () => { return current * 100; };
const getVerifyDelay = () => { return (current / inteval) * (verifyDelay + 1); };
const getVerifyCatch = () => { return utilitas.ensureInt(current / 1); }; // cnf
const makeAttrs = (object) => { return { _attributes: object }; };
const makeAttrType = (tp) => { return makeAttrs({ type: `${idxSys}.${tp}` }); };
const aF = (k, r) => { utilitas.assertSet(r, `Undefined rule: '${k}'.`, 500); };
const key = (k) => { const resp = keys[k]?.[0]; aF(k, resp); return resp; };
const rule = (k) => { const resp = rules[k]; aF(k, resp); return resp; };

const [ORI, TXT, STR, JSN, UTK, NUM, LNG, BLN, TME, STM, CDT, ENM, STA] = [
    'ORIGINAL', 'TEXT', 'STRING', 'JSON', 'UNTOKEN', 'NUMBER', 'LONG',
    'BOOLEAN', 'TIME', 'STRTIME', 'CDATA', 'ENUM', 'STRARR',
];

const callbacks = {
    initIdGet: null, lastIdGet: null, lastIdSet: null, error: null,
    verifyIndex: null, verifiedIdGet: null, verifiedIdSet: null, progress: null,
    heartbeat: null, newIndex: null, newBlock: null, newTransaction: null,
};

const makeAttrText = (def) => {
    const atts = {
        type: `${idxSys}.text`, sort: false, store: true,
        token: false, trimhtml: false, tv: false, ...def || {},
    };
    atts.index = atts.index ? atts.index.join(',') : '';
    for (let i in atts) { if (!atts[i]) { delete atts[i]; } }
    return makeAttrs(atts);
};

const [_declaration, aDTE, aFLT, aLNG, aSTG, aSTR, aUTK, aTXT] = [
    makeAttrs({ version, encoding }), makeAttrType('date'),
    makeAttrType('float'), makeAttrType('long'), makeAttrType('saveonly'),
    makeAttrText({ index: [DOCS], token: true }),
    makeAttrText({ index: [DOCS] }), makeAttrText({
        index: [DOCS, 'offset', 'freq', 'pos'], token: true, trimhtml: true,
    }),
];

const keys = {
    ACTION_ACCOUNT: [`${keyRootTrxAct}_account`, UTK],
    ACTION_MROOT: ['action_mroot', UTK],
    ACTION_NAME: [`${keyRootTrxAct}_name`, UTK],
    BLOCK_EXTENSIONS: ['block_extensions', JSN],
    BLOCK_ID: ['block_id', UTK],
    BLOCK_NUM: ['block_num', LNG],
    BLOCK: ['block', null],
    CLASS: ['class', ENM],
    CONFIRMED: ['confirmed', LNG],
    CONTENT: ['content', JSN],
    CY_TENANTID: ['cy_tenantid', UTK],
    CYPRESS_MATCH: [`${idxSys}.match`, NUM],
    CYPRESS_UPDATETIME: [`${idxSys}_updatetime`, STM],
    DATA_ALLOW: [`${keyRootTrxActData}_data_allow`, UTK],
    DATA_BILL_ID: [`${keyRootTrxActData}_data_bill_id`, UTK],
    DATA_CONTENT_ID: [`${keyRootTrxActData}_data_content_id`, UTK],
    DATA_DENY: [`${keyRootTrxActData}_data_deny`, UTK],
    DATA_FILE_HASH: [`${keyRootTrxActData}_data_file_hash`, UTK],
    DATA_ID: [`${keyRootTrxActData}_id`, UTK],
    DATA_MIXIN_TRACE_ID: [`${keyRootTrxActData}_mixin_trace_id`, UTK],
    DATA_ORACLESERVICE: [`${keyRootTrxActData}_oracleservice`, UTK],
    DATA_PROFILE_PROVIDER: [`${keyRootTrxActData}_data_profile_provider`, UTK],
    DATA_QUANTITY_AMT: [`${keyRootTrxActData}__amount_quantity__amt`, LNG],
    DATA_QUANTITY_CUR: [`${keyRootTrxActData}__amount_quantity__cur`, UTK],
    DATA_REQ_ID: [`${keyRootTrxActData}__dp_wd_req__id`, UTK],
    DATA_SYNC_AUTH_RESULT: [`${keyRootTrxActData}__sync_auth__result`, BLN],
    DATA_TOPIC: [`${keyRootTrxActData}_data_topic`, UTK],
    DATA_TYPE: [`${keyRootTrxActData}_type`, UTK],
    DATA_USER_ADDRESS: [`${keyRootTrxActData}_user_address`, UTK],
    DATA_USER_FROM: [`${keyRootTrxActData}__from_user`, UTK],
    DATA_USER_TO: [`${keyRootTrxActData}__to_user`, UTK],
    DATA_WRAPPING_ID: [`${keyRootTrxActData}_data_wrapping_id`, UTK],
    DATA: [`${keyRootTrxActData}_data`, JSN],
    HEADER_EXTENSIONS: ['header_extensions', JSN],
    META_MIME: [`${keyRootTrxActData}_meta_mime`, UTK],
    META_URIS: [`${keyRootTrxActData}_meta_uris`, UTK],
    META: [`${keyRootTrxActData}_meta`, JSN],
    NEW_PRODUCERS: ['new_producers', UTK],
    PREVIOUS: ['previous', UTK],
    PRODUCER_SIGNATURE: ['producer_signature', UTK],
    PRODUCER: ['producer', UTK],
    REF_BLOCK_PREFIX: ['ref_block_prefix', LNG],
    SCHEDULE_VERSION: ['schedule_version', LNG],
    TIMESTAMP: ['timestamp', TME],
    TITLE: ['title', CDT],
    TRANSACTION_ID: [`${keyRootTrx}_id`, UTK],
    TRANSACTION_IDS: ['transaction_ids', STA],
    TRANSACTION_MROOT: ['transaction_mroot', UTK],
    TRANSACTIONS: ['transactions', null],
    URI: ['uri', UTK],
    XMLURI: ['xmluri', UTK],
    // PIP:2001
    AUTHORIZED: ['authorized', BLN],
    FETCHED_AT: ['fetched_at', TME],
    FILE_HASH: ['file_hash', UTK],
    PUBLISH_TX_ID: ['publish_tx_id', UTK],
    STATUS: ['status', LNG],
    TOPIC: ['topic', UTK],
    UPDATED_AT: ['updated_at', TME],
    UPDATED_BY: ['updated_by', UTK],
    UPDATED_TX_ID: ['updated_tx_id', UTK],
    // PIP-TOPIC
    AUTHOR_COUNT: ['author_count', LNG],
    EVOLVED_FROM: ['evolved_from', UTK],
    EVOLVED_TO: ['evolved_to', UTK],
    POST_COUNT: ['post_count', LNG],
    TOPIC_ID: ['topic_id', UTK],
    // PIP-AUTHOR
};

const rules = {}; for (let i in keys) { rules[keys[i][0]] = keys[i][1]; }

let curId = 0;
let current = 0;
let silent = false;
let verifiedId = 0;
let verifyDelay = 0;
let xmlJson = false;

const valuePack = (k, v) => {
    v = v ?? '';
    switch (rule(k)) {
        case BLN: v = { [_text]: String(utilitas.humanReadableBoolean(v)).toUpperCase(), ...aUTK }; break;
        case ENM: v = { [_text]: v.toUpperCase(), ...aUTK }; break;
        case JSN: v = JSON.stringify(v); case CDT: v = { [_cdata]: v, ...aSTG }; break;
        case LNG: v = { [_text]: utilitas.ensureInt(v), ...aLNG }; break;
        case ORI: break;
        case STA: v = utilitas.ensureArray(v).join(' '); case STR: v = { [_text]: v, ...aSTR }; break;
        case TME: v = { [_text]: new Date(v).getTime(), ...aLNG }; break;
        case TXT: v = { [_text]: v, ...aTXT }; break;
        case UTK: v = { [_text]: v, ...aUTK }; break;
        case null: v = undefined; break;
        default: aF(k);
    };
    return v;
};

const valueUnpack = (k, v) => {
    switch (rule(k)) {
        case BLN: v = utilitas.humanReadableBoolean(v); break;
        case JSN: try { v = JSON.parse(v); } catch (e) { v = null; }; break;
        case LNG: v = utilitas.ensureInt(v); break;
        case NUM: v = Number(v); break;
        case ORI: case CDT: case TXT: case STR: case ENM: case UTK: break;
        case STA: v = String(v).split(' ').filter(x => { return x; }); break;
        case TME: v = parseInt(v); case STM: v = new Date(v); break;
        default: aF(k);
    };
    return v;
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

const progress = async (arg) => {
    return await runCallback('progress', async (objLog) => {
        const arrLog = [];
        for (let i in objLog) { arrLog.push([i, objLog[i]].join(': ')); }
        return log(arrLog.join(', ') + '.');
    }, arg);
};

const error = async (arg) => {
    return await runCallback('error', async (err) => { return log(err); }, arg);
};

const heartbeat = async () => {
    return await runCallback('heartbeat', async () => { return dfultWorkers; });
};

const newIndex = async (arg) => {
    return await runCallback('newIndex', async () => { }, arg);
};

const newBlock = async (arg) => {
    return await runCallback('newBlock', async (block) => {
        return !callbacks.newIndex
            && !callbacks.newTransaction
            && !callbacks.verifyIndex && log(block);
    }, arg);
};

const newTransaction = async (arg) => {
    return await runCallback('newTransaction', async () => { }, arg);
};

const buildXmlJson = (node, ext) => {
    utilitas.assert(node && Object.keys(node).length, 'Invalid index.', 400);
    for (let i in ext) { node[key(i)] = ext[i] ?? null; }
    node = Object.assign({
        [key('CY_TENANTID')]: cy_tenantid,
        [key('XMLURI')]: node[key('URI')] ? `${node[key('URI')]}/xml` : null,
    }, node);
    ['CY_TENANTID', 'CLASS', 'URI', 'XMLURI'].map(x => {
        utilitas.assert(node[key(x)], `Missing index-key: '${x}'.`, 400);
    });
    for (let i in node) {
        if (utilitas.isUndefined(node[i] = valuePack(i, node[i]))) {
            try { delete node[i]; } catch (e) { }
        }
    };
    return { _declaration, node };
};

const packAction = (action, transaction, block, actIdx) => {
    const k = action?.data;
    const s = k?.unpacked_meta;
    const n = s?.request;
    const o = s?.mixin_snapshot;
    const p = k?.unpacked_data || k;
    const y = k?.memo;
    let [l, m, q, r] = [finance.parseAmountAndCurrency(
        k?.amount || k?.quantity || n?.amount
    ), null, k?.from || k?.user || n?.user, k?.to || k?.user || n?.user];
    if (utilitas.isSet(k?.sync_result)) { m = k.sync_result; }
    else if (utilitas.isSet(k?.auth_result)) { m = k.auth_result; }
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
    let act = {
        ACTION_ACCOUNT: action.account,
        ACTION_NAME: action.name,
        BLOCK_ID: block.block_id,
        BLOCK_NUM: block.block_num,
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
    if (xmlJson) {
        act = buildXmlJson(act, {
            CLASS: classTranx, CONTENT: transaction,
            TITLE: `Transaction ${act[key('TRANSACTION_ID')]}/${actIdx}`,
            URI: `${uriRoot}chain/transactions/${act[key('TRANSACTION_ID')]}/${actIdx}`,
        });
        block = buildXmlJson(block, {
            CLASS: classBlack, CONTENT: null,
            TITLE: `Block ${block[key('BLOCK_ID')]} (${block[key('BLOCK_NUM')]})`,
            URI: `${uriRoot}chain/blocks/${block[key('BLOCK_ID')]}`,
            TRANSACTION_IDS: block[key('TRANSACTIONS')].map(x => { return x.trx.id }),
        });
    }
    return { transaction: act, block };
};

const fetchBlock = async (block_num, options) => {
    const optOutput = (
        options?.newIndex || options?.newTransaction || options?.newBlock
    ) ? async () => { } : null;
    let block = null;
    // const timeout = setTimeout(() => { console.log(`Timeout: ${block_num}`); }, 1000);
    try { block = await sushitrain.getBlockByNumOrId(block_num); }
    catch (err) { return await error(err); }
    // finally { clearTimeout(timeout); }
    block.block_id = block.id.toUpperCase();
    delete block.id;
    for (let i of block?.transactions?.length ? block.transactions : [{}]) {
        i?.trx?.id && (i.trx.id = i.trx.id.toUpperCase());
        const actions = i?.trx?.transaction?.actions?.length
            ? i.trx.transaction.actions : [{}];
        for (let j in actions) {
            try {
                actions[j].data.unpacked_meta = JSON.parse(
                    actions[j]?.data?.meta || actions[j]?.data?.sync_meta
                );
            } catch (e) {
                actions[j].data && (actions[j].data.unpacked_meta = null);
            }
            try {
                actions[j].data.unpacked_data = JSON.parse(
                    actions[j]?.data?.data || actions[j]?.data?.auth_data
                );
            } catch (e) {
                actions[j].data && (actions[j].data.unpacked_data = null);
            }
            try {
                actions[j].data.memo = JSON.parse(actions[j]?.data?.memo);
            } catch (e) { }
            await (
                options?.newIndex || optOutput || newIndex
            )(packAction(actions[j], i, block, j));
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
    await progress({
        Sync: `${lastSyncedId} / ${lastIrreversibleId} (${syncPercentage})`,
        Current: `${current} * (${workerIndex + 1} of ${workers.length})`,
        Range: [targetFrom, targetTo],
    });
    // verify
    const [verified, missing] = [utilitas.checkInterval(
        verifyDelay
    ) && callbacks.verifiedIdGet && callbacks.verifiedIdSet, []];
    let lastVerifiedId, verifiedPercentage, verifiedRange;
    if (verified) {
        const verifyMax = utilitas.ensureInt(
            lastSyncedId - getVerifyDelay(), { min: 1 }
        );
        lastVerifiedId = Math.min(await verifiedIdGet(), verifyMax);
        const [verifyFrom, verifyTo, verifyCatch,] = [
            Math.min(lastVerifiedId + 1, verifyMax),
            Math.min(lastVerifiedId + getVerifyLength(), verifyMax),
            Math.min(lastVerifiedId + getVerifyCatch(), verifyMax), [],
        ];
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
        verifiedPercentage = getPercentage(lastVerifiedId, verifyMax);
        verifiedRange = [verifyFrom, missing.length ? verifyCatch : verifyTo];
        await verifiedIdSet(lastVerifiedId);
        await progress({
            Verified: `${lastVerifiedId} / ${verifyMax} (${verifiedPercentage})`,
            Range: verifiedRange,
            Missing: missing.length,
        });
    }
    // result
    return {
        current, workerIndex, workers, lastIrreversibleId, scale, lastSyncedId,
        pending, syncPercentage, syncRange: [targetFrom, targetTo], jobs,
        verified, lastVerifiedId, verifiedPercentage, verifiedRange, missing,
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

const init = async (opt) => {
    opt = opt || {};
    utilitas.mergeAtoB(opt.callbacks, callbacks);
    current = utilitas.ensureInt(opt.current || curDefault, curLimit);
    verifyDelay = utilitas.ensureInt(opt.verifyDelay || vfdlDefault, vfdlLimit);
    xmlJson = !!opt.xmlJson;
    silent = !!opt.silent;
    return await (opt && opt.event || event).loop(
        sync, inteval, current, 0, modName, { silent: true }
    );
};

module.exports = {
    _cdata,
    _text,
    classBlack,
    classTranx,
    cy_tenantid,
    inteval,
    keys,
    rules,
    uriRoot,
    buildXmlJson,
    fetchBlock,
    init,
    key,
    rule,
    valuePack,
    valueUnpack,
};

const { utilitas, event, math } = require('utilitas');
const sushitrain = require('./sushitrain');
const finance = require('./finance');
