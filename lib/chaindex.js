'use strict';

const [cy_tenantid, classBlack, classTranx]
    = ['chain.prs', 'BLOCK', 'TRANSACTION'];
const [
    keyCprMth, keyTrxId, keyTransIds, keyBlkNum, keyBlkId, keyTimeSt, keyActAcc,
    keyActName, keyActDId, keyActAmnt,
] = [
        'cypress.match', 'transactions_trx_id', 'transaction_ids',
        'block_num', 'block_id', 'timestamp',
        'transactions_trx_transaction_actions_account',
        'transactions_trx_transaction_actions_name',
        'transactions_trx_transaction_actions_data_id',
        'transactions_trx_transaction_actions_data__amount_quantity__amt',
    ];
const [ORI, TXT, STR, JSN, UTK, NUM, BLN, TME, STM, CDT, ENM, SAR]
    = [
        'ORIGINAL', 'TEXT', 'STRING', 'JSON', 'UNTOKEN', 'NUMBER',
        'BOOLEAN', 'TIME', 'STRTIME', 'CDATA', 'ENUM', 'STRARR'
    ];
const [cdtTenantid, cdtClassBlock, cdtClassTranx]
    = [{ cy_tenantid }, { class: classBlack }, { class: classTranx }];
const [cdtBlock, cdtTranx]
    = [[cdtTenantid, cdtClassBlock], [cdtTenantid, cdtClassTranx]];
const [cdtInt, cdtDesc] = [{ type: 'long' }, { order: 'desc' }];
const cdtIntDesc = { ...cdtInt, ...cdtDesc };
const defaultSort = { field: 'cypress.match' };
const optionCount = { outputitems: false };
const pageSize = 10;
const pageLimit = { min: 0, max: pageSize * 10 };
const actionExt = [keyTrxId, keyBlkNum, keyBlkId, keyTimeSt];
const log = (content) => { return utilitas.modLog(content, 'chaindex'); };

const rules = {
    [keyActAcc]: UTK,
    [keyActAmnt]: NUM,
    [keyActDId]: TXT,
    [keyActName]: UTK,
    [keyBlkId]: TXT,
    [keyBlkNum]: NUM,
    [keyCprMth]: NUM,
    [keyTimeSt]: TME,
    [keyTransIds]: TXT,
    [keyTrxId]: TXT,
    action_mroot: TXT,
    block_extensions: JSN,
    class: ENM,
    confirmed: NUM,
    content: JSN,
    cy_tenantid: UTK,
    cypress_updatetime: STM,
    header_extensions: JSN,
    new_producers: UTK,
    previous: TXT,
    producer_signature: TXT,
    producer: UTK,
    ref_block_prefix: NUM,
    schedule_version: NUM,
    title: CDT,
    transaction_mroot: TXT,
    transactions_trx_transaction_actions_data__amount_quantity__cur: UTK,
    transactions_trx_transaction_actions_data__dp_wd_req__id: TXT,
    transactions_trx_transaction_actions_data__from_user: UTK,
    transactions_trx_transaction_actions_data__sync_auth__result: BLN,
    transactions_trx_transaction_actions_data__to_user: UTK,
    transactions_trx_transaction_actions_data_data_allow: UTK,
    transactions_trx_transaction_actions_data_data_bill_id: TXT,
    transactions_trx_transaction_actions_data_data_content_id: TXT,
    transactions_trx_transaction_actions_data_data_deny: UTK,
    transactions_trx_transaction_actions_data_data_file_hash: TXT,
    transactions_trx_transaction_actions_data_data_file_hash: TXT,
    transactions_trx_transaction_actions_data_data_profile_provider: UTK,
    transactions_trx_transaction_actions_data_data_topic: TXT,
    transactions_trx_transaction_actions_data_data_wrapping_id: TXT,
    transactions_trx_transaction_actions_data_data: JSN,
    transactions_trx_transaction_actions_data_meta_mime: TXT,
    transactions_trx_transaction_actions_data_meta_uris: TXT,
    transactions_trx_transaction_actions_data_meta: JSN,
    transactions_trx_transaction_actions_data_mixin_trace_id: TXT,
    transactions_trx_transaction_actions_data_oracleservice: TXT,
    transactions_trx_transaction_actions_data_type: TXT,
    transactions_trx_transaction_actions_data_user_address: TXT,
    uri: TXT,
    xmluri: TXT,
};

const extendedRules = { ...rules, [keyTransIds]: SAR };

const unpackedValue = (k, v) => {
    let resp;
    switch (extendedRules[k]) {
        case ORI: case CDT: case TXT: case STR: case ENM: case UTK:
            resp = v; break;
        case JSN: try { resp = JSON.parse(v); } catch (e) { }; break;
        case BLN: resp = utilitas.humanReadableBoolean(v); break;
        case NUM: resp = Number(v); break;
        case TME: v = parseInt(v); case STM: resp = new Date(v); break;
        case SAR: resp = String(v).split(' ').filter(x => { return x; }); break;
        default: utilitas.throwError(
            `Undefined packing rule for \`${k}\`.`, 500
        );
    };
    return resp;
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
    body = utilitas.distill(body);
    options.log && utilitas.prettyJson(body, options);
    const resp = await fetch(`${(await config()).indexingApi}/v2/search`, {
        method: 'POST', body: JSON.stringify(body), ...options
    }).then(res => res.json());
    options.log && utilitas.prettyJson(resp, options);
    utilitas.assert(
        resp.result && resp.result.query && !resp.error,
        resp.error || 'Error querying index.', 500
    );
    if ((await config()).debug === 'index') {
        const [objLog, arrLog] = [{
            Query: resp.result.query,
            'Process-Time': resp.result.processtime,
            'Query-Time': resp.result.querytime,
            Version: resp.result.version,
        }, []];
        for (let i in objLog) { arrLog.push([i, objLog[i]].join(': ')); }
        log(arrLog.join(', ') + '.');
    }
    resp.result?.items?.map?.(x => {
        for (let i in x) {
            x[i] = unpackedValue(i, x[i]);
        }
        switch (x.class) {
            case classBlack:
                delete x.content;
                break;
            case classTranx:
                x[keyActAmnt] = x[keyActAmnt] ?? finance.restoreAmount(
                    x[keyActAmnt]
                );
                x.payload = null;
                x?.content?.trx?.transaction?.actions?.map?.(y => {
                    if (utilitas.insensitiveCompare(
                        y?.data?.id, x[keyActDId]
                    )) {
                        actionExt.map(z => { y.data[z] = x[z]; });
                        y.data.data = y.data.unpacked_data;
                        y.data.meta = y.data.unpacked_meta;
                        try { delete y.data.unpacked_data; } catch (e) { }
                        try { delete y.data.unpacked_meta; } catch (e) { }
                        x.payload = y.data;
                    }
                });
        }
    });
    return resp.result;
};

const queryLastBlock = async (options) => {
    options = options || {};
    const resp = await query({
        number: 1, sort: [{ field: keyBlkNum, ...cdtIntDesc }],
        query: { bool: { must: { condition: { must: cdtBlock } } } },
    }, options);
    const block = resp?.items?.[0];
    if (options.blockNumOnly) {
        return utilitas.ensureInt(block?.[keyBlkNum], { min: 0 });
    }
    utilitas.assert(block, 'Block not found.', 404);
    return block;
};

const queryLastBlockNum = async (options) => {
    return await queryLastBlock({ ...options || {}, blockNumOnly: true });
};

const queryBlockByBlockNum = async (nums, options) => {
    options = options || {};
    const [a, intNums] = [Array.isArray(nums), utilitas.ensureInt(nums)];
    const [from, to] = a ? [
        utilitas.ensureInt(nums[0]), utilitas.ensureInt(nums[1]),
    ] : [intNums, intNums];
    const number = to - from + 1;
    utilitas.assert(from, `Invalid from_${keyBlkNum}.`, 400);
    utilitas.assert(to, `Invalid to_${keyBlkNum}.`, 400);
    const resp = await query({
        number, option: { outputitems: !options.verifyOnly }, query: {
            bool: {
                must: {
                    condition: { must: cdtBlock },
                    range: { must: [{ [keyBlkNum]: { ...cdtInt, from, to } }] },
                },
            },
        },
    }, options);
    utilitas.assert(resp.count === number, 'Block not found.', 404);
    return options.verifyOnly ? resp.count : (a ? resp.items : resp.items?.[0]);
};

const verifyBlockByBlockNum = async (nums, options) => {
    options = options || {};
    options.verifyOnly = true;
    let resp = false;
    try { resp = await queryBlockByBlockNum(nums, options); } catch (e) { }
    return resp;
};

const getTransactionByLegacyId = async (id, options) => {
    utilitas.assert(id, 'Invalid legacy id.', 400);
    return (await query({
        number: 1, query: {
            bool: {
                must: {
                    condition: { must: [...cdtTranx, { [keyActDId]: id }] },
                },
            },
        },
    }, options))?.items?.[0].payload;
};

const getTransactionById = async (id, options) => {
    options = options || {};
    utilitas.assert(
        (id = id.trim().toUpperCase()), 'Invalid transaction id.', 400
    );
    const trx = (await query({
        number: 1, query: {
            bool: {
                must: {
                    condition: { must: [...cdtTranx, { [keyTrxId]: id }] },
                },
            },
        },
    }, options))?.items?.[0];
    if (trx && !options.raw) {
        trx.block = trx?.[keyBlkNum]
            ? await queryBlockByBlockNum(trx[keyBlkNum], options) : {};
        trx.block.transactions = trx.content ? [trx.content] : [];
        delete trx.content;
    }
    return trx;
};

const getBlockNumByTransactionId = async (id, options) => {
    options = { ...options || {}, raw: true };
    return (await getTransactionById(id, options))?.[keyBlkNum];
};

const countAccounts = async (options) => {
    return utilitas.ensureInt((await query({
        option: optionCount, query: {
            bool: {
                must: {
                    condition: {
                        must: [
                            ...cdtTranx,
                            { [keyActAcc]: 'eosio' },
                            { [keyActName]: 'newaccount' },
                        ],
                    },
                },
            },
        },
    }, options))?.count, { min: 1 });
};

module.exports = {
    keyActDId,
    keyBlkNum,
    cdtBlock,
    cdtInt,
    cdtIntDesc,
    cdtTranx,
    classBlack,
    classTranx,
    cy_tenantid,
    optionCount,
    rules,
    countAccounts,
    getBlockNumByTransactionId,
    getTransactionById,
    getTransactionByLegacyId,
    query,
    queryBlockByBlockNum,
    queryLastBlock,
    queryLastBlockNum,
    verifyBlockByBlockNum,
};

const { utilitas, fetch } = require('utilitas');
const finance = require('./finance');
const config = require('./config');
