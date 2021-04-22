'use strict';

const [cy_tenantid, classBlack, classTranx]
    = ['chain.prs', 'BLOCK', 'TRANSACTION'];
const [cdtTenantid, cdtClassBlock, cdtClassTranx]
    = [{ cy_tenantid }, { class: classBlack }, { class: classTranx }];
const [cdtBlock, cdtTranx]
    = [[cdtTenantid, cdtClassBlock], [cdtTenantid, cdtClassTranx]];
const [cdtInt, cdtDesc] = [{ type: 'long' }, { order: 'desc' }];
const cdtIntDesc = { ...cdtInt, ...cdtDesc };
const optCount = { outputitems: false };
const pageDefault = 10;
const pageLimit = { min: 0, max: pageDefault * 100 };
const log = (content) => { return utilitas.modLog(content, 'chaindex'); };

const getActionExt = () => {
    return [
        'TRANSACTION_ID', 'BLOCK_NUM', 'DATA_ID', 'TIMESTAMP',
    ].map(pacman.key);
};

const sortByBlockNum = () => {
    return { field: pacman.key('BLOCK_NUM'), ...cdtInt };
};

const sortByBlockNumDesc = () => {
    return { field: pacman.key('BLOCK_NUM'), ...cdtIntDesc };
};

const query = async (body, options) => {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    body = body || {};
    body.start = utilitas.ensureInt(body.start, { min: 0 });
    body.option = body.option || {};
    body.option.explain = body.option.explain === false ? false : true;
    body.option.outputitems = body.option.outputitems === false ? false : true;
    body.number = utilitas.ensureInt(body.number ?? pageDefault, pageLimit);
    body.number = body.option.outputitems ? body.number : null;
    body.query = body.query || {};
    body = utilitas.distill(body, true);
    body.sort = body.sort || [{ field: pacman.key('CYPRESS_MATCH') }];
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
        for (let i in x) { x[i] = pacman.valueUnpack(i, x[i]); }
        switch (x.class) {
            case classBlack: delete x.content; break;
            case classTranx:
                const keyAmt = pacman.key('DATA_QUANTITY_AMT');
                x[keyAmt] = x[keyAmt] ?? finance.restoreAmount(x[keyAmt]);
                x.payload = null;
                x?.content?.trx?.transaction?.actions?.map?.(y => {
                    if (utilitas.insensitiveCompare(
                        y?.data?.id, x[pacman.key('DATA_ID')]
                    )) {
                        getActionExt().map(z => { y.data[z] = x[z]; });
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

const qry = async (must, ord, number, options) => {
    const option = options?.count ? optCount : {};
    const resp = await query({
        number, option, sort: [ord],
        query: { bool: { must: { condition: { must } } } },
    }, options);
    if (options?.raw) { return resp; }
    else if (options?.count) { return resp?.count; }
    else if (number === 1) { return resp?.items?.[0]; }
    return resp?.items;
};

const queryLastBlock = async (options) => {
    const block = await qry(cdtBlock, sortByBlockNumDesc(), 1, options);
    if (options?.blockNumOnly) {
        return utilitas.ensureInt(block?.[pacman.key('BLOCK_NUM')], { min: 0 });
    }
    utilitas.assert(block, 'Block not found.', 404);
    return block;
};

const queryLastBlockNum = async (options) => {
    return await queryLastBlock({ ...options || {}, blockNumOnly: true });
};

const queryBlockByBlockNum = async (nums, options) => {
    const [a, intNums] = [Array.isArray(nums), utilitas.ensureInt(nums)];
    const [from, to] = a ? [
        utilitas.ensureInt(nums[0]), utilitas.ensureInt(nums[1]),
    ] : [intNums, intNums];
    const number = to - from + 1;
    utilitas.assert(from, `Invalid from_${pacman.key('BLOCK_NUM')}.`, 400);
    utilitas.assert(to, `Invalid to_${pacman.key('BLOCK_NUM')}.`, 400);
    const condition = { must: cdtBlock };
    const range = [{ [pacman.key('BLOCK_NUM')]: { ...cdtInt, from, to } }];
    const res = await query({
        number, option: { outputitems: !options?.verifyOnly },
        query: { bool: { must: { condition, range: { must: range } } } },
    }, options);
    utilitas.assert(res.count === number, 'Block not found.', 404);
    return options?.verifyOnly ? res.count : (a ? res.items : res.items?.[0]);
};

const verifyBlockByBlockNum = async (nums, options) => {
    options = options || {};
    options.verifyOnly = true;
    let resp = false;
    try { resp = await queryBlockByBlockNum(nums, options); } catch (e) { }
    return resp;
};

const getTransactionByLegacyId = async (id, options) => {
    id = String(id).trim().toLowerCase();
    utilitas.assert(id, 'Invalid legacy id.', 400);
    const must = [...cdtTranx, { [pacman.key('DATA_ID')]: id }];
    console.log(must);
    return (await qry(must, null, 1, options))?.payload;
};

const getTransactionById = async (id, options) => {
    id = String(id).trim().toLowerCase();
    utilitas.assert(id, 'Invalid transaction id.', 400);
    const must = [...cdtTranx, { [pacman.key('TRANSACTION_ID')]: id }];
    const trx = await qry(must, null, 1);
    if (trx && !options?.raw) {
        const blckNum = trx?.[pacman.key('BLOCK_NUM')];
        trx.block = blckNum ? await queryBlockByBlockNum(blckNum, options) : {};
        trx.block.transactions = trx.content ? [trx.content] : [];
        delete trx.content;
    }
    return trx;
};

const getBlockNumByTransactionId = async (id, options) => {
    options = { ...options || {}, raw: true };
    return (await getTransactionById(id, options))?.[pacman.key('BLOCK_NUM')];
};

const countAccounts = async (options) => {
    return utilitas.ensureInt(await qry([
        ...cdtTranx,
        { [pacman.key('ACTION_ACCOUNT')]: 'eosio' },
        { [pacman.key('ACTION_NAME')]: 'newaccount' },
    ], null, null, { ...options || {}, count: true }), { min: 1 });
};

module.exports = {
    cdtBlock,
    cdtInt,
    cdtIntDesc,
    cdtTranx,
    classBlack,
    classTranx,
    cy_tenantid,
    optCount,
    countAccounts,
    getBlockNumByTransactionId,
    getTransactionById,
    getTransactionByLegacyId,
    qry,
    query,
    queryBlockByBlockNum,
    queryLastBlock,
    queryLastBlockNum,
    sortByBlockNum,
    sortByBlockNumDesc,
    verifyBlockByBlockNum,
};

const { utilitas, fetch } = require('utilitas');
const finance = require('./finance');
const pacman = require('./pacman');
const config = require('./config');
