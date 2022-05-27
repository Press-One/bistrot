import { event, math, utilitas } from 'utilitas';
import { bigFormat } from './finance.mjs';

import {
    getBlockByNumberOrHash, getLastIrreversibleBlockNumber
} from './quorum.mjs';

const [idxSys, cy_tenantid, classBlack, classTranx]
    = ['cypress', 'chain.prs', 'BLOCK', 'TRANSACTION'];
const [percentagePrecision, inteval, curDefault] = [100 * 100, 0.5, 100];
const [version, encoding, _text, _cdata] = ['1.0', 'utf-8', '_text', '_cdata'];
const voidFun = async () => { };
const uriRoot = 'https://prs-bp2.press.one/api/';
const DOCS = 'docs';
const curLimit = { min: 1, max: curDefault * 100 };
const vfdlDefault = 10; // 10 seconds
const vfdlLimit = { min: 1, max: vfdlDefault * 10 };
const dfultWorkers = { workerIndex: 0, workers: [{}] };
const log = content => silent || utilitas.log(content, import.meta.url);
const getVerifyLength = () => current * 100;
const getVerifyDelay = () => (current / inteval) * (verifyDelay + 1);
const getVerifyCatch = () => utilitas.ensureInt(current / 1); // cnf
const makeAttrs = object => { return { _attributes: object }; };
const makeAttrType = type => makeAttrs({ type: `${idxSys}.${type}` });
const assRule = (k, r) => utilitas.assertSet(r, `Undefined rule: '${k}'.`, 500);
const key = k => { const resp = keys[k]?.[0]; assRule(k, resp); return resp; };
const rule = k => { const resp = rules[k]; assRule(k, resp); return resp; };
const lastIdSet = a => runCallback('lastIdSet', id => ~~id && (curId = id), a);
const verifyIndex = (arg, opt) => runCallback('verifyIndex', id => 0, arg, opt);
const error = arg => runCallback('error', log, arg);
const heartbeat = () => runCallback('heartbeat', () => dfultWorkers);
const newIndex = arg => runCallback('newIndex', voidFun, arg);

const [ORI, TXT, STR, JSN, UTK, NUM, LNG, BLN, TME, STM, CDT, ENM, STA] = [
    'ORIGINAL', 'TEXT', 'STRING', 'JSON', 'UNTOKEN', 'NUMBER', 'LONG',
    'BOOLEAN', 'TIME', 'STRTIME', 'CDATA', 'ENUM', 'STRARR',
];

const callbacks = {
    error: null, heartbeat: null, initIdGet: null, lastIdGet: null,
    lastIdSet: null, newBlock: null, newIndex: null, progress: null,
    verifiedIdGet: null, verifiedIdSet: null, verifyIndex: null,
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
    // common
    CLASS: ['class', ENM],
    CONTENT: ['content', JSN],
    CY_TENANTID: ['cy_tenantid', UTK],
    CYPRESS_MATCH: [`${idxSys}.match`, NUM],
    CYPRESS_UPDATETIME: [`${idxSys}_updatetime`, STM],
    TITLE: ['title', CDT],
    URI: ['uri', UTK],
    XMLURI: ['xmluri', UTK],
    // transaction
    CONTRACT: ['contract', UTK],
    FROM: ['from', UTK],
    GAS_PRICE: ['gasPrice', UTK],
    GAS: ['gas', LNG],
    INPUT: ['input', CDT],
    NAME: ['name', UTK],
    R: ['r', UTK],
    S: ['s', UTK],
    TO: ['to', UTK],
    TRANSACTION_HASH: ['transactionHash', UTK],
    TRANSACTION_INDEX: ['transactionIndex', LNG],
    TYPE: ['type', UTK],
    V: ['v', UTK],
    VALUE: ['value', UTK],
    // transaction params
    PARAMS_AMOUNT: ['params.amount', UTK],
    PARAMS_DATA_ALLOW: ['params.data.allow', UTK],
    PARAMS_DATA_BILL_ID: ['params.data.bill_id', UTK], // legacy
    PARAMS_DATA_CONTENT_ID: ['params.data.content_id', UTK], // legacy
    PARAMS_DATA_DENY: ['params.data.deny', UTK],
    PARAMS_DATA_FILE_HASH: ['params.data.file_hash', UTK],
    PARAMS_DATA_TOPIC: ['params.data.topic', UTK],
    PARAMS_DATA_WRAPPING_ID: ['params.data.wrapping_id', UTK],  // legacy
    PARAMS_DATA: ['params.data', JSN],
    PARAMS_HASH: ['params.hash', UTK],
    PARAMS_ID: ['params.id', UTK],
    PARAMS_META_MIME: ['params.meta.mime', UTK],
    PARAMS_META_URIS: ['params.meta.uris', UTK],
    PARAMS_META: ['params.meta', JSN],
    PARAMS_RECIPIENT: ['params.recipient', UTK],
    PARAMS_SIGNATURE: ['params.signature', UTK],
    PARAMS_TYPE: ['params.type', UTK],
    PARAMS_USER_ADDRESS: ['params.user_address', UTK],
    PARAMS_UUID: ['params.uuid', UTK],
    PARAMS_UUID_ARRAY: ['params.uuid_array', STA],
    PARAMS: ['params', JSN],
    // transaction / block
    BLOCK_HASH: ['blockHash', UTK],
    BLOCK_NUMBER: ['blockNumber', LNG],
    NONCE: ['nonce', LNG],
    TIMESTAMP: ['timestamp', TME],
    // block
    DIFFICULTY: ['difficulty', UTK],
    EXTRA_DATA: ['extraData', UTK],
    GAS_LIMIT: ['gasLimit', LNG],
    GAS_USED: ['gasUsed', LNG],
    LOGS_BLOOM: ['logsBloom', CDT],
    MINER: ['miner', UTK],
    MIX_HASH: ['mixHash', UTK],
    PARENT_HASH: ['parentHash', UTK],
    RECEIPTS_ROOT: ['receiptsRoot', UTK],
    SHA3_UNCLES: ['sha3Uncles', UTK],
    SIZE: ['size', LNG],
    STATE_ROOT: ['stateRoot', UTK],
    TOTAL_DIFFICULTY: ['totalDifficulty', UTK],
    TRANSACTION_IDS: ['transactionIds', STA],
    TRANSACTIONS_ROOT: ['transactionsRoot', UTK],
    UNCLES: ['uncles', STA],
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
    POST_COUNT: ['post_count', LNG],
    TOPIC_ID: ['topic_id', UTK],
};

const rules = {}; for (let i in keys) { rules[keys[i][0]] = keys[i][1]; }

let [curId, current, verifiedId, verifyDelay] = [0, 0, 0, 0];
let [silent, xmlJson] = [false, false];

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
        default: assRule(k);
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
        default: assRule(k);
    };
    return v;
};

const runCallback = async (type, func, ar, o) => {
    try { return await (callbacks[type] || func)(ar, o); } catch (e) { log(e); }
};

const initIdGet = async () =>
    (curId = await runCallback('initIdGet', getLastIrreversibleBlockNumber));

const lastIdGet = () =>
    runCallback('lastIdGet', () => utilitas.ensureInt(curId, { min: 0 }));

const verifiedIdGet = () =>
    runCallback('verifiedIdGet', () => utilitas.ensureInt(verifiedId, { min: 0 }));

const verifiedIdSet = arg =>
    runCallback('verifiedIdSet', (id) => ~~id && (verifiedId = id), arg);

const progress = arg => runCallback('progress', objLog => {
    const arrLog = [];
    for (let i in objLog) { arrLog.push([i, objLog[i]].join(': ')); }
    return log(arrLog.join(', ') + '.');
}, arg);

const newBlock = (arg) => runCallback('newBlock', block =>
    !callbacks.newIndex && !callbacks.verifyIndex && log(block), arg);

const buildXmlJson = (node, ext) => {
    assert(node && Object.keys(node).length, 'Invalid index.', 400);
    for (let i in ext) { node[key(i)] = ext[i] ?? null; }
    node = Object.assign({
        [key('CY_TENANTID')]: cy_tenantid,
        [key('XMLURI')]: node[key('URI')] ? `${node[key('URI')]}/xml` : null,
    }, node);
    ['CY_TENANTID', 'CLASS', 'URI', 'XMLURI'].map(x => {
        assert(node[key(x)], `Missing index-key: '${x}'.`, 400);
    });
    for (let i in node) {
        if (utilitas.isUndefined(node[i] = valuePack(i, node[i]))) {
            try { delete node[i]; } catch (e) { }
        }
    };
    return { _declaration, node };
};

const compactUuidArray = (any) => utilitas.ensureArray(
    utilitas.ensureString(any).split(' ')
).map(x => x.replace(/[^0-9a-z]*/ig, '')).filter(x => x);

const handleIdx = (trx, blk, options) => {
    let trans = {
        BLOCK_HASH: trx.blockHash,
        BLOCK_NUMBER: trx.blockNumber,
        CONTRACT: trx.contract,
        FROM: trx.from,
        GAS_PRICE: trx.gasPrice,
        GAS: trx.gas,
        INPUT: trx.input,
        NAME: trx.name,
        NONCE: trx.nonce,
        R: trx.r,
        S: trx.s,
        TO: trx.to,
        TRANSACTION_HASH: trx.hash,
        TRANSACTION_INDEX: trx.transactionIndex,
        TYPE: trx.type,
        V: trx.v,
        VALUE: trx.value,
        // transaction params
        PARAMS_AMOUNT: trx?.params?.amount,
        PARAMS_DATA_ALLOW: trx?.params?.data?.allow,
        PARAMS_DATA_BILL_ID: trx?.params?.data?.bill_id,
        PARAMS_DATA_CONTENT_ID: trx?.params?.data?.content_id,
        PARAMS_DATA_DENY: trx?.params?.data?.deny,
        PARAMS_DATA_FILE_HASH: trx?.params?.data?.file_hash,
        PARAMS_DATA_TOPIC: trx?.params?.data?.topic,
        PARAMS_DATA_WRAPPING_ID: trx?.params?.data?.wrapping_id,
        PARAMS_DATA: trx?.params?.data,
        PARAMS_HASH: trx?.params?.hash,
        PARAMS_ID: trx?.params?.id?.toLowerCase?.(),
        PARAMS_META_MIME: trx?.params?.meta?.mime,
        PARAMS_META_URIS: trx?.params?.meta?.uris,
        PARAMS_META: trx?.params?.meta,
        PARAMS_RECIPIENT: trx?.params?.recipient,
        PARAMS_SIGNATURE: trx?.params?.signature,
        PARAMS_TYPE: trx?.params?.type,
        PARAMS_USER_ADDRESS: trx?.params?.user_address,
        PARAMS_UUID: trx?.params?.uuid,
        PARAMS_UUID_ARRAY: compactUuidArray(trx?.params?.uuid),
        PARAMS: trx?.params,
        // transaction / block
        TIMESTAMP: blk.timestamp,
    };
    let block = {
        DIFFICULTY: blk.difficulty,
        EXTRA_DATA: blk.extraData,
        GAS_LIMIT: blk.gasLimit,
        GAS_USED: blk.gasUsed,
        BLOCK_HASH: blk.hash,
        LOGS_BLOOM: blk.logsBloom,
        MINER: blk.miner,
        MIX_HASH: blk.mixHash,
        NONCE: blk.nonce,
        BLOCK_NUMBER: blk.number,
        PARENT_HASH: blk.parentHash,
        RECEIPTS_ROOT: blk.receiptsRoot,
        SHA3_UNCLES: blk.sha3Uncles,
        SIZE: blk.size,
        STATE_ROOT: blk.stateRoot,
        TIMESTAMP: blk.timestamp,
        TOTAL_DIFFICULTY: blk.totalDifficulty,
        TRANSACTIONS_ROOT: blk.transactionsRoot,
        UNCLES: blk.uncles,
        TRANSACTION_IDS: blk?.transactions?.map?.(x => { return x.hash; }),
    };
    for (let i in trans) { trans[key(i)] = trans[i] ?? null; delete trans[i]; }
    for (let i in block) { block[key(i)] = block[i] ?? null; delete block[i]; }
    if (options?.xmlJson || xmlJson) {
        trans = trx ? buildXmlJson(trans, {
            CLASS: classTranx, URI: `${uriRoot}chain/transactions/${trx.hash}`,
            TITLE: `Transaction ${trx.hash}`, CONTENT: trx.receipt,
        }) : null;
        block = buildXmlJson(block, {
            CLASS: classBlack, URI: `${uriRoot}chain/blocks/${blk.hash}`,
            TITLE: `Block ${blk.hash} (${blk.number})`, CONTENT: null,
        });
    }
    return { transaction: trx ? trans : null, block };
};

const fetchBlock = async (block_num, options) => {
    const optOutput = (options?.newIndex || options?.newBlock) ? voidFun : null;
    let block = null;
    // const timeout = setTimeout(() => { console.log(`Timeout: ${block_num}`); }, 1000);
    try { block = await getBlockByNumberOrHash(block_num); }
    catch (err) { return await error(err); }
    // finally { clearTimeout(timeout); }
    block.hash = block.hash.toLowerCase();
    for (let i of block?.transactions?.length ? block.transactions : [null]) {
        i?.hash && (i.hash = i.hash.toLowerCase());
        await (options?.newIndex || optOutput || newIndex)(handleIdx(i, block, options));
    }
    await (options?.newBlock || optOutput || newBlock)(block);
};

const getPercentage = (cur, total) => bigFormat(math.divide(math.round(
    math.multiply(math.divide(cur, total), 100 * percentagePrecision)
), percentagePrecision)) + ' %';

const analytics = async () => {
    // sync
    const { workerIndex, workers } = (await heartbeat()) || dfultWorkers;
    const lastIrreversibleId = await getLastIrreversibleBlockNumber();
    const [scale, lastSyncedId] = [
        workers.length, Math.min(await lastIdGet(), lastIrreversibleId),
    ];
    const syncPercentage = getPercentage(lastSyncedId, lastIrreversibleId);
    const [targetFrom, targetTo] = [
        Math.min(lastSyncedId + 1, lastIrreversibleId),
        Math.min(lastSyncedId + current * (scale || 1), lastIrreversibleId),
    ];
    const [pending, jobs] = [lastSyncedId === lastIrreversibleId ? [
    ] : utilitas.range(targetFrom, targetTo), []];
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
        const [verifyFrom, verifyTo, verifyCatch] = [
            Math.min(lastVerifiedId + 1, verifyMax),
            Math.min(lastVerifiedId + getVerifyLength(), verifyMax),
            Math.min(lastVerifiedId + getVerifyCatch(), verifyMax),
        ];
        let verifyResp = await verifyIndex([verifyFrom, verifyTo]);
        if (verifyResp) { lastVerifiedId = verifyTo; } else {
            verifyResp = [];
            let o = await verifyIndex([verifyFrom, verifyCatch], { detail: 1 });
            for (let i in o) { verifyResp.push([Number(i), !!o[i]]); }
            verifyResp.sort((x, y) => { return x[0] - y[0]; })
            for (let i in verifyResp) {
                if (verifyResp[i][1] && !missing.length) {
                    lastVerifiedId = verifyResp[i][0];
                } else if (!verifyResp[i][1]) {
                    missing.push(verifyResp[i][0]);
                }
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
        sync, inteval, current, 0,
        utilitas.basename(import.meta.url), { silent: true }
    );
};

export {
    _cdata,
    _declaration,
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
