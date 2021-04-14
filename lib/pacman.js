'use strict';

const modName = 'pacman';
const curDefault = 100;
const curLimit = { min: 1, max: curDefault * 100 };
const inteval = 1;
const dfultWorkers = { workerIndex: 0, workers: [{}] };
const percentagePrecision = 100 * 100;
const log = (content) => { silent || utilitas.modLog(content, modName); };
const getVerifyLength = () => { return current * 100; };
const getVerifyDelay = () => { return current * inteval * (10 + 1); }; // 10secs
const getVerifyCatch = () => { return utilitas.ensureInt(current / 10); };
const vf = () => { return callbacks.verifiedIdGet && callbacks.verifiedIdSet; };

let curId = 0;
let verifiedId = 0;
let current = 0;
let silent = false;

const callbacks = {
    initIdGet: null, lastIdGet: null, lastIdSet: null,
    verifyIndex: null, verifiedIdGet: null, verifiedIdSet: null,
    heartbeat: null, newAction: null, newBlock: null, newTransaction: null,
};

const runCallback = async (type, func, args) => {
    try { return await (callbacks[type] || func)(args); } catch (e) { log(e); }
};

const initIdGet = async () => {
    return (curId = await runCallback('initIdGet', chaindex.queryLastBlockNum));
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
    const t = k?.deposit_id || k?.withdraw_id || k?.req_id;
    const u = p?.profile_provider;
    const v = s?.uris?.join?.(' ');
    const w = k?.mixin_trace_id || o?.trace_id;
    const x = k?.oracleservice;
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
        block_id: block.block_id,
        block_num: block.block_num,
        block,
        previous: block.previous,
        producer: block.producer,
        timestamp: block.timestamp,
        transactions_trx_id: transaction?.trx?.id || '*',
        transactions_trx_transaction_actions_account: action.account,
        transactions_trx_transaction_actions_data__amount_quantity__amt: l?.[2],
        transactions_trx_transaction_actions_data__amount_quantity__cur: l?.[1],
        transactions_trx_transaction_actions_data__dp_wd_req__id: t,
        transactions_trx_transaction_actions_data__from_user: q,
        transactions_trx_transaction_actions_data__sync_auth__result: m,
        transactions_trx_transaction_actions_data__to_user: r,
        transactions_trx_transaction_actions_data_data_allow: p?.allow,
        transactions_trx_transaction_actions_data_data_deny: p?.deny,
        transactions_trx_transaction_actions_data_data_file_hash: p?.file_hash,
        transactions_trx_transaction_actions_data_data_profile_provider: u,
        transactions_trx_transaction_actions_data_data_topic: p?.topic,
        transactions_trx_transaction_actions_data_data: p,
        transactions_trx_transaction_actions_data_id: k?.id?.toUpperCase?.(),
        transactions_trx_transaction_actions_data_meta_mime: s?.mime,
        transactions_trx_transaction_actions_data_meta_uris: v,
        transactions_trx_transaction_actions_data_meta: s,
        transactions_trx_transaction_actions_data_mixin_trace_id: w,
        transactions_trx_transaction_actions_data_oracleservice: x,
        transactions_trx_transaction_actions_data_type: k?.type || n?.type,
        transactions_trx_transaction_actions_data_user_address: k?.user_address,
        transactions_trx_transaction_actions_name: action.name,
    };
    for (let i in act) { act[i] = act[i] ?? null; }
    return act;
};

const fetchBlock = async (block_num) => {
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
            await newAction({ action: packAct(j, i, block), transaction: i });
        }
        Object.keys(i).length && await newTransaction(i);
    }
    await newBlock(block);
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
    init,
    initIdGet,
};

const { utilitas, event, math } = require('utilitas');
const sushitrain = require('./sushitrain');
const chaindex = require('./chaindex');
const finance = require('./finance');
