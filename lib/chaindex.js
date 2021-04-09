'use strict';

const cdtTenantid = { cy_tenantid: 'chain.prs' };
const cdtClasBlock = { class: 'BLOCK' };
const cdtBlock = [cdtTenantid, cdtClasBlock];
const cdtInt = { type: 'long' };
const cdtDesc = { order: 'desc' };
const cdtIntDesc = { ...cdtInt, ...cdtDesc };
const defaultSort = { field: 'cypress.match', weight: 1 };
const pageSize = 10;
const pageLimit = { min: 0, max: pageSize * 10 };
const log = (content) => { return utilitas.modLog(content, 'chain'); };

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
    return resp.result;
};

const queryLastBlock = async (options) => {
    options = options || {};
    const resp = await query({
        number: 1,
        sort: [{ field: 'block_num', weight: 1, ...cdtIntDesc }],
        query: { bool: { must: { condition: { must: cdtBlock } } } },
    }, options);
    const block = resp?.items?.[0];
    if (options.blockNumOnly) {
        return utilitas.ensureInt(block?.block_num, { min: 0 });
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
    utilitas.assert(from, 'Invalid from_block_num.', 400);
    utilitas.assert(to, 'Invalid to_block_num.', 400);
    const resp = await query({
        number, option: { outputitems: !options.verifyOnly }, query: {
            bool: {
                must: {
                    condition: { must: cdtBlock },
                    range: { must: [{ block_num: { ...cdtInt, from, to } }] },
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
    try { resp = await queryBlockByBlockNum(nums, options); } catch (e) { console.log(e); }
    return resp;
};

module.exports = {
    query,
    queryLastBlock,
    queryLastBlockNum,
    queryBlockByBlockNum,
    verifyBlockByBlockNum,
};

const { utilitas, fetch } = require('utilitas');
const config = require('./config'); const { requestApi } = require('./sushibar');
