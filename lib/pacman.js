'use strict';

const cdtTenantid = { cy_tenantid: 'chain.prs' };
const cdtClasBlock = { class: 'BLOCK' };
const cdtBlock = [cdtTenantid, cdtClasBlock];
const cdtType = { type: 'long' };
const curDefault = 100;
const curLimit = { min: 1, max: 1000 };
const defaultSort = { field: 'cypress.match', weight: 1 };
const pageLimit = { min: 0, max: 1000 };
const pageSize = 10;
const percentagePrecision = 100 * 100;
const log = (content) => { silent || utilitas.modLog(content, __filename); };
const noVerify = () => { return !callbacks.lastIdGet && !callbacks.lastIdSet };

let curId = 0;
let current = 0;
let silent = false;

const callbacks = {
    heartbeat: null, lastIdGet: null, lastIdSet: null,
    newAction: null, newBlock: null, newTransaction: null,
};

const runCallback = async (type, func, args) => {
    try { return await (callbacks[type] || func)(args); } catch (e) { log(e); }
};

const heartbeat = async () => {
    return await runCallback('heartbeat', async () => {
        return { workerIndex: 0, workers: [{}] };
    });
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

const newAction = async (arg) => {
    return await runCallback('newAction', async () => { }, arg);
};

const newBlock = async (arg) => {
    return await runCallback('newBlock', async () => { }, arg);
};

const newTransaction = async (arg) => {
    return await runCallback('newTransaction', async () => { }, arg);
};

const query = async (body, options) => {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    body = body || {};
    body.start = utilitas.ensureInt(body.start, { min: 0 });
    body.number = utilitas.ensureInt(body.number ?? pageSize, pageLimit);
    body.option = body.option || {};
    body.option.explain = body.option.explain === false ? false : true;
    body.option.outputitems = body.option.outputitems === false ? false : true;
    body.sort = body.sort || [defaultSort];
    body.query = body.query || {};
    options.log && utilitas.prettyJson(body, options);
    const resp = await fetch(`${(await config()).indexingApi}/v2/search`, {
        method: 'POST', body: JSON.stringify(body), ...options
    }).then(res => res.json());
    options.log && utilitas.prettyJson(resp, options);
    utilitas.assert(
        resp.result && resp.result.query && !resp.error,
        resp.error || 'Error querying index.', 500
    );
    return resp.result;
};

const queryBlockByBlocuNum = async (nums, options) => {
    options = options || {};
    const [a, intNums] = [Array.isArray(nums), utilitas.ensureInt(nums)];
    const [from, to] = a ? [
        utilitas.ensureInt(nums[0]), utilitas.ensureInt(nums[1]),
    ] : [intNums, intNums];
    const number = to - from + 1;
    utilitas.assert(from, 'Invalid from_block_num.', 400);
    utilitas.assert(to, 'Invalid to_block_num.', 400);
    const resp = await query({
        number, option: { outputitems: !options.verifyOnly }, query: {
            bool: {
                must: {
                    condition: { must: cdtBlock },
                    range: { must: [{ block_num: { ...cdtType, from, to } }] },
                },
            },
        },
    }, options);
    utilitas.assert(resp.count === number, 'Block not found.', 404);
    return options.verifyOnly ? resp.count : (a ? resp.items : resp.items?.[0]);
};

const verifyBlockByBlocuNum = async (nums, options) => {
    options = options || {};
    options.verifyOnly = true;
    let resp = false;
    try { resp = await queryBlockByBlocuNum(nums, options); } catch (e) { }
    return resp;
};

const verifyIndex = async (options) => {
    options = options || {};
    options.max = utilitas.ensureInt(options.max);
    let id = await lastIdGet();
    let [vId, max, pending] = [id + 1, id + current * (options.scale || 1), []];
    if (options.max) { max = Math.min(options.max, max); }
    let [resp, lastVerifiedId] = [await verifyBlockByBlocuNum([vId, max]), id];
    if (resp) { lastVerifiedId = max; } else {
        resp = [];
        for (let i = vId; i <= max; i++) {
            resp.push(noVerify() ? (async () => { return false; })(
            ) : verifyBlockByBlocuNum(i));
        }
        resp = await Promise.all(resp);
        for (let i = 0; i < resp.length; i++) {
            const cId = vId + i;
            if (resp[i] && !pending.length) {
                lastVerifiedId = cId;
            } else if (!resp[i]) {
                pending.push(cId);
            }
        }
    }
    await lastIdSet((lastVerifiedId = noVerify() ? max : lastVerifiedId));
    return { lastVerifiedId, pending };
};

const getPercentage = (cur, total) => {
    return finance.bigFormat(math.divide(math.round(math.multiply(math.divide(
        cur, total
    ), 100 * percentagePrecision)), percentagePrecision)) + ' %';
};

const analytics = async () => {
    const { workerIndex, workers } = await heartbeat();
    const scale = workers.length;
    const max = await sushitrain.getLastIrreversibleBlockNum();
    const { lastVerifiedId, pending } = await verifyIndex({ max, scale });
    const vfPct = getPercentage(lastVerifiedId, max);
    const jobs = [];
    pending.map(x => { if (x % scale === workerIndex) { jobs.push(x); } });
    const [arrLog, objLog] = [[], {
        [noVerify() ? 'Block' : 'Verified']: `${lastVerifiedId} / ${max}`,
        Percentage: vfPct,
        Workers: `${workerIndex + 1} / ${workers.length}`,
        pending: `${jobs.length} / ${pending.length}`,
    }];
    for (let i in objLog) { arrLog.push([i, objLog[i]].join(': ')); }
    log(arrLog.join(', ') + '.');
    return {
        workerIndex, workers, lastIrreversibleId: max,
        lastVerifiedId, pending, jobs, verifiedPercentage: vfPct,
    };
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
        transactions_trx_transaction_actions_data_id: k?.id,
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
    const block = await sushitrain.getBlockByNumOrId(block_num);
    block.block_id = block.id;
    delete block.id;
    for (let i of block?.transactions?.length ? block.transactions : [{}]) {
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
        await newTransaction(i);
    }
    await newBlock(block);
};

const sync = async () => {
    try {
        const { jobs } = await analytics();
        const fetchResp = jobs.map(x => { fetchBlock(x); });
        await Promise.all(fetchResp);
    } catch (err) { log(err); }
};

const init = async (options) => {
    options = options || {};
    utilitas.mergeAtoB(options.callbacks, callbacks);
    current = utilitas.ensureInt(options.current || curDefault, curLimit);
    silent = !!options.silent;
    return await (options && options.event || event).loop(
        sync, 1, current, 0, __filename, { silent: true }
    );
};

module.exports = {
    init,
    query,
    queryBlockByBlocuNum,
};

const { utilitas, event, fetch, math } = require('utilitas');
const sushitrain = require('./sushitrain');
const finance = require('./finance');
const config = require('./config');
