'use strict';

const transactionQueryRange = { min: 1, max: 100 };
const log = (content) => { silent || utilitas.modLog(content, __filename); };

let fetchCurrent = 100;
let cusGetLatestBlockNum = null;
let blockCallback = null;
let transactionCallback = null;
let webSocket = null;
let abi = null;
let types = null;
let lastMessageAt = 0;
let silent = false;

const getShpApi = async () => {
    const url = utilitas.getConfigFromStringOrArray((await config()).shpApi);
    utilitas.assert(url, 'RPC api root has not been configured', 500);
    return url;
};

const serialize = (type, value) => {
    const buffer = new Serialize.SerialBuffer({
        textEncoder: new TextEncoder, textDecoder: new TextDecoder,
    });
    Serialize.getType(types, type).serialize(buffer, value);
    return buffer.asUint8Array();
};

const deserialize = (type, array) => {
    const buffer = new Serialize.SerialBuffer({
        textEncoder: new TextEncoder, textDecoder: new TextDecoder, array
    });
    const result = Serialize.getType(types, type).deserialize(
        buffer, new Serialize.SerializerState({ bytesAsUint8Array: true })
    );
    if (buffer.readPos !== array.length) { throw new Error('Oops: ' + type); }
    return result;
};

const deserializeActionData = (contract, account, action, data) => {
    return Serialize.deserializeActionData(
        contract, account, action, data, new TextEncoder(), new TextDecoder()
    );
};

const quickDeserializeActionData = async (account, action, data) => {
    return deserializeActionData(
        await sushitrain.getContractByName(account), account, action, data
    );
};

const assertTimestamp = (timestamp) => {
    timestamp && utilitas.assert(utilitas.isDate(
        timestamp = new Date(timestamp), true
    ), 'Invalid timestamp.', 400);
    return timestamp;
};

const send = (request) => {
    return webSocket
        && webSocket.readyState === 1
        && webSocket.send(serialize('request', request));
};

const requestBlocks = (requestArgs) => {
    return send(['get_blocks_request_v0', {
        start_block_num: 0,
        end_block_num: 0xffffffff,
        max_messages_in_flight: fetchCurrent,
        have_positions: [],
        irreversible_only: true,
        fetch_block: true,
        fetch_traces: true,
        fetch_deltas: false,
        ...requestArgs
    }]);
};

const ack = (requestArgs) => {
    return send(['get_blocks_ack_request_v0', {
        num_messages: 1,
        ...requestArgs
    }]);
};

const disconnect = () => {
    try {
        webSocket.close();
        webSocket.destroy();
    } catch (err) { }
    abi = null;
    types = null;
    webSocket = null;
};

const onMessage = async (data) => {
    lastMessageAt = new Date();
    try {
        return abi ? await receivedBlock(data) : await receivedAbi(data);
    } catch (err) {
        log(err);
        disconnect();
    }
};

const receivedAbi = async (data) => {
    log('Received ABIs');
    abi = JSON.parse(data);
    types = Serialize.getTypesFromAbi(Serialize.createInitialTypes(), abi);
    return requestBlocks({
        start_block_num: await getLatestBlockNum(),
    });
};

const receivedBlock = async (data) => {
    let [type, response] = deserialize('result', data);
    switch (type) {
        case 'get_status_result_v0':
            log('Received chain status: ', data);
            break;
        case 'get_blocks_result_v0':
            if (response.this_block) {
                log(`SYNC BLOCK: ${response.this_block.block_id}`
                    + ` / ${response.this_block.block_num}`);
            } else if (response.head) {
                log(`SYNC HEAD: ${response.head.block_id}`
                    + ` / ${response.head.block_num}`);
            } else {
                log(`UPTODATE!`);
            }
            response = await parseBlock(response);
            if (response && response.block) {
                // console.log(JSON.stringify(response.block, null, 2));
                blockCallback && await blockCallback(response.block);
                await saveTransactions(response.block);
            }
            ack();
            break;
    }
};

const parseBlock = async (response) => {
    if (!response.this_block || !response.block || !response.block.length
        || !(response.block = deserialize('signed_block', response.block))) {
        return;
    }
    if (response.traces && response.traces.length) {
        try {
            response.traces = zlib.unzipSync(response.traces);
        } catch (err) {
            // console.log(err);
        }
        response.traces = deserialize('transaction_trace[]', response.traces);
    } else {
        response.traces = [];
    }
    const trxIds = {};
    for (let i of response.traces) {
        for (let j of i[1].action_traces) {
            trxIds[utilitas.byteToHexString(j[1].act.data)] = i[1].id;
        }
    }
    response.block = JSON.parse(JSON.stringify(response.block, (k, v) => {
        if (k === 'trx' && Array.isArray(v) && v[0] === 'packed_transaction') {
            const ua = v[1].compression
                ? zlib.unzipSync(v[1].packed_trx) : v[1].packed_trx;
            return {
                ...v[1],
                packed_trx: utilitas.byteToHexString(ua),
                transaction: ua,
            };
        } else if (k === 'transaction' && v instanceof Uint8Array) {
            return deserialize('transaction', v);
        } else if (v instanceof Uint8Array) {
            const ua = [];
            for (let sv of v) {
                ua.push(sv);
            }
            return ua;
        }
        return v;
    }));
    for (let i of response.block.transactions || []) {
        if (!i.trx || !i.trx.transaction) {
            continue;
        }
        for (let j of i.trx.transaction.actions || []) {
            const lTail = `${response.this_block.block_id} / `
                + `${response.this_block.block_num}`;
            j.hex_data = j.data && utilitas.byteToHexString(j.data);
            if (!(i.trx.id = trxIds[j.hex_data])) {
                j.data && log(`Fail to match transactions in ${lTail}.`);
                return;
            }
            let contract = null;
            try {
                contract = await sushitrain.getContractByName(j.account);
            } catch (err) {
                utilitas.assert(!/ECONNREFUSED/i.test(err.message)
                    && !/Unknown Endpoint/i.test(err.message),
                    'Error connecting to ABI server.', 500);
                log(`Error fetching ABI for transactions in ${lTail}: `
                    + err.message);
            }
            try {
                j.data = contract && deserializeActionData(
                    contract, j.account, j.name, j.data
                );
            } catch (err) {
                j.data = null;
                log(err);
            }
            try {
                j.data.unpacked_meta = j.data
                    && (j.data.meta || j.data.sync_meta)
                    && JSON.parse(j.data.meta || j.data.sync_meta);
            } catch (e) {
                j.data && (j.data.unpacked_meta = null);
            }
            try {
                j.data.unpacked_data = j.data
                    && (j.data.data || j.data.auth_data)
                    && JSON.parse(j.data.data || j.data.auth_data);
            } catch (e) {
                j.data && (j.data.unpacked_data = null);
            }
            if (j.data && j.data.memo) {
                try { j.data.memo = JSON.parse(j.data.memo); } catch (e) { }
            }
        }
    }
    Object.assign(response.block, response.this_block);
    return response;
};

const columns = [
    'transactions_trx_id',
    'transactions_trx_transaction_actions_account',
    'transactions_trx_transaction_actions_name',
    'transactions_trx_transaction_actions_data_id',
    'transactions_trx_transaction_actions_data_user_address',
    'transactions_trx_transaction_actions_data_oracleservice',
    'transactions_trx_transaction_actions_data_type',
    'transactions_trx_transaction_actions_data__from_user',
    'transactions_trx_transaction_actions_data__to_user',
    'transactions_trx_transaction_actions_data__amount_quantity__amt',
    'transactions_trx_transaction_actions_data__amount_quantity__cur',
    'transactions_trx_transaction_actions_data__dp_wd_req__id',
    'transactions_trx_transaction_actions_data__sync_auth__result',
    'transactions_trx_transaction_actions_data_mixin_trace_id',
    'transactions_trx_transaction_actions_data_meta',
    'transactions_trx_transaction_actions_data_data',
    'transactions_trx_transaction_actions_data_data_topic',
    'transactions_trx_transaction_actions_data_data_profile_provider',
    'transactions_trx_transaction_actions_data_meta_uris',
    'transactions_trx_transaction_actions_data_meta_mime',
    'block_num',
    'block_id',
    'timestamp',
    'producer',
    'previous',
    'block',
];

const saveTransactions = async (block) => {
    utilitas.assert(block, 'Error EOS block.', 500);
    const result = [];
    for (let i of block.transactions
        && block.transactions.length
        ? block.transactions : [{}]) {
        const sql = `INSERT INTO transactions (${columns.join(
            ', '
        )}) VALUES (${columns.map((_, x) => {
            return `\$${x + 1}`;
        }).join(', ')}) ON CONFLICT (${columns[0]}) DO UPDATE SET ${columns.map(
            x => { return `${x} = EXCLUDED.${x}`; }
        ).join(', ')} RETURNING ${columns[0]}`;
        const j = i.trx
            && i.trx.id
            && i.trx.transaction
            && i.trx.transaction.actions
            && i.trx.transaction.actions[0];
        const k = j && j.data ? j.data : null;
        const s = k && k.unpacked_meta ? k.unpacked_meta : null;
        const n = s ? s.request : null;
        const o = s ? s.mixin_snapshot : null;
        const p = k && k.unpacked_data ? k.unpacked_data : k;
        let l = finance.parseAmountAndCurrency(
            k ? (k.amount || k.quantity || (n ? n.amount : null)) : null
        );
        let m = null;
        if (k && utilitas.isBoolean(k.sync_result)) {
            m = k.sync_result;
        } else if (k && utilitas.isBoolean(k.auth_result)) {
            m = k.auth_result;
        }
        let q = k ? (k.from || k.user || (n ? n.user : null)) : null;
        let r = k ? (k.to || k.user || ((n ? n.user : null))) : null;
        if (!l && k && k.memo && k.memo.bp_name
            && k.memo.bpay_amount && k.memo.vpay_amount) {
            const bm = finance.parseAmountAndCurrency(k.memo.bpay_amount);
            const vm = finance.parseAmountAndCurrency(k.memo.vpay_amount);
            const sm = bm && vm && parseInt(
                finance.bignumberSum(bm[2], vm[2]).toString()
            );
            l = bm && vm ? [finance.restoreAmount(sm), bm[1], sm] : null;
            q = 'eosio.vpay';
            r = k.memo.bp_name;
        } else if (!l && k && k.memo
            && ['SWAP', 'RM_LIQUID', 'ADD_LIQUID'].includes(k.memo.type)) {
            l = finance.parseAmountAndCurrency(k.memo.pool_token) || null;
            q = k.memo.from_user;
            r = k.memo.to_user;
        }
        const val = [
            j ? i.trx.id : '*',
            j ? j.account : null,
            j ? j.name : null,
            k && k.id ? k.id : null,
            k && k.user_address ? k.user_address : null,
            k && k.oracleservice ? k.oracleservice : null,
            k && k.type ? k.type : (n ? n.type : null),
            q,
            r,
            l ? l[2] : null,
            l ? l[1] : null,
            k ? (k.deposit_id || k.withdraw_id || k.req_id || null) : null,
            m,
            k && k.mixin_trace_id ? k.mixin_trace_id : (o ? o.trace_id : null),
            s,
            p,
            p && p.topic ? p.topic : null,
            p && p.profile_provider ? p.profile_provider : null,
            s && s.uris ? s.uris : null,
            s && s.mime ? s.mime : null,
            block.block_num,
            block.block_id,
            block.timestamp,
            block.producer,
            block.previous,
            block,
        ];
        if ((await config()).serviceTransactionArchive) {
            try {
                // console.log(sql, val);
                result.push(await database.query(sql, val));
            } catch (err) {
                if (err.code !== '23505') {
                    utilitas.assert(
                        false, `Error saving EOS transaction: ${err}`, 500
                    );
                }
            }
        }
        const enriched = {};
        for (let cI in columns) { enriched[columns[cI]] = val[cI]; }
        transactionCallback && await transactionCallback(i, enriched);
    }
    return result;
};

const getLatestBlockNum = async () => {
    if (cusGetLatestBlockNum) {
        return await cusGetLatestBlockNum();
    }
    const res = await database.query('SELECT MAX(block_num) FROM transactions');
    utilitas.assert(
        res && res.rows && res.rows[0],
        'Error checking latest transaction.', 500
    );
    res.rows[0].max = (res.rows[0].max = ~~res.rows[0].max - 10) < 0
        ? 0 : res.rows[0].max;
    return res.rows[0].max;
};

const getTransactionById = async (id) => {
    utilitas.assert(
        (id = id.trim().toUpperCase()), 'Invalid transaction id.', 400
    );
    const res = await database.query(
        `SELECT * FROM transactions WHERE transactions_trx_id = $1`, [id]
    );
    utilitas.assert(res && res.rows, 'Error fetching transaction.', 500);
    return res.rows[0];
};

const getBlockNumByTransactionId = async (id) => {
    const res = await getTransactionById(id);
    return res && res.block_num;
};

const packTransaction = async (transaction, options = {}) => {
    if (transaction) {
        if (transaction.timestamp) {
            transaction.timestamp = transaction.timestamp.toISOString();
        }
        let amtKey
            = 'transactions_trx_transaction_actions_data__amount_quantity__amt';
        if (transaction[amtKey]) {
            transaction[amtKey] = finance.restoreAmount(transaction[amtKey]);
        }
    }
    return transaction;
};

const packTransactions = async (transactions, options = {}) => {
    for (let i in transactions || []) {
        transactions[i] = await packTransaction(transactions[i], options);
    }
    return transactions;
};

const queryBoundByAccount = async (acc, provider, options) => {
    account.assertName(acc);
    const reqProvider = utilitas.ensureArray(provider || 'MIXIN').map((x) => {
        return utilitas.ensureString(x, { case: 'UP' });
    });
    const sql = 'SELECT DISTINCT '
        + 'ON ( transactions_trx_transaction_actions_data_type ) '
        + 'transactions_trx_transaction_actions_data_type, * '
        + 'FROM transactions '
        + "WHERE transactions_trx_transaction_actions_name = 'bind' "
        + 'AND transactions_trx_transaction_actions_data__from_user = $1 '
        + 'AND transactions_trx_transaction_actions_data_type = ANY ($2::varchar[]) '
        + 'ORDER BY transactions_trx_transaction_actions_data_type, '
        + 'block_num DESC';
    const val = [acc, reqProvider];
    const resp = await rawQueryTransactions(sql, val, options);
    return provider ? (resp.length ? resp[0] : null) : resp;
};

const rawQueryTransactions = async (sql, val, options) => {
    options = options || {};
    const res = await database.query(sql, val);
    utilitas.assert(res && res.rows, 'Error querying transactions.', 500);
    return options.asRaw ? res.rows : await packTransactions(res.rows, options);
};

const queryTransactions = async (
    blockNum, timestamp, type, pipTopic, count, options = {}
) => {
    blockNum = utilitas.ensureInt(blockNum);
    count = utilitas.ensureInt(count, transactionQueryRange);
    let i = 0;
    timestamp = assertTimestamp(timestamp);
    let [sql, val] = [
        'SELECT * FROM transactions WHERE '
        + `transactions_trx_transaction_actions_name != $${++i} `,
        ['updresult']
    ];
    if (blockNum) {
        sql += ` AND block_num >= $${++i}`;
        val.push(blockNum);
    }
    if (timestamp) {
        sql += ` AND timestamp >= $${++i}`;
        val.push(timestamp);
    }
    if (type) {
        sql += ` AND transactions_trx_transaction_actions_data_type = $${++i}`;
        val.push(type);
    }
    if (pipTopic) {
        sql += ' AND transactions_trx_transaction_actions_data_data_topic'
            + ` = $${++i}`;
        val.push(pipTopic);
    }
    sql += ` ORDER BY timestamp, block_num LIMIT $${++i} `;
    val.push(count);
    return await rawQueryTransactions(sql, val, options);
};

const rawQueryStatements = async (acc, sqlCase, timestamp, count, options) => {
    account.assertName(acc);
    timestamp = assertTimestamp(timestamp);
    count = utilitas.ensureInt(count || 10, transactionQueryRange);
    sqlCase = ` WHERE (${sqlCase.join(' OR ')})`;
    let [tC, od] = options.aec ? ['>', 'ASC'] : ['<', 'DESC'];
    tC = timestamp ? ` AND timestamp ${tC} '${timestamp.toISOString()}'` : '';
    od = ` ORDER BY timestamp ${od}`;
    const limit = options.getAll ? '' : ` LIMIT ${count}`;
    const sql = `SELECT * FROM transactions${sqlCase}${tC}${od}${limit}`;
    return await rawQueryTransactions(sql, undefined, options);
};

const queryStatements = async (acc, timestamp, type, count, options = {}) => {
    let [sqlIncome, sqlExpense, sqlCase, cdtAmt, cdtRst] = [[[
        `transactions_trx_transaction_actions_account = 'eosio.token'`,
        `transactions_trx_transaction_actions_name = 'transfer'`,
        `transactions_trx_transaction_actions_data__to_user = '${acc}'`,
    ], [
        `transactions_trx_transaction_actions_account = 'prs.tproxy'`,
        `transactions_trx_transaction_actions_name = 'sync'`,
        `transactions_trx_transaction_actions_data__to_user = '${acc}'`,
        `transactions_trx_transaction_actions_data_type = '1'`,
    ], [
        `transactions_trx_transaction_actions_account = 'tprxy.oracle'`,
        `transactions_trx_transaction_actions_name = 'cnfmpaymt'`,
        `transactions_trx_transaction_actions_data__to_user = '${acc}'`,
    ]], [[
        `transactions_trx_transaction_actions_account = 'eosio.token'`,
        `transactions_trx_transaction_actions_name = 'transfer'`,
        `transactions_trx_transaction_actions_data__from_user = '${acc}'`,
    ], [
        `transactions_trx_transaction_actions_account = 'prs.tproxy'`,
        `transactions_trx_transaction_actions_name = 'sync'`,
        `transactions_trx_transaction_actions_data__from_user = '${acc}'`,
        `transactions_trx_transaction_actions_data_type = '2'`,
    ], [
        `transactions_trx_transaction_actions_account = 'tprxy.oracle'`,
        `transactions_trx_transaction_actions_name = 'cnfmpaymt'`,
        `transactions_trx_transaction_actions_data__from_user = '${acc}'`,
    ]], [],
        'transactions_trx_transaction_actions_data__amount_quantity__amt > 0',
        'transactions_trx_transaction_actions_data__sync_auth__result = true',
    ];
    if (!options.detail) {
        sqlIncome[0].push(cdtAmt);
        sqlIncome[1].push(cdtAmt, cdtRst);
        sqlIncome[2].push(cdtAmt);
        sqlExpense[0].push(cdtAmt);
        sqlExpense[1].push(cdtAmt, cdtRst);
        sqlExpense[2].push(cdtAmt);
    }
    sqlIncome = sqlIncome.map(x => {
        return `(${x.join(' AND ')})`;
    });
    sqlExpense = sqlExpense.map(x => {
        return `(${x.join(' AND ')})`;
    });
    switch (utilitas.ensureString(type, { case: 'UP' })) {
        case 'INCOME':
            sqlExpense = null;
            break;
        case 'EXPENSE':
            sqlIncome = null;
            break;
        case 'TRANSFER':
            sqlIncome = [sqlIncome[0]];
            sqlExpense = [sqlExpense[0]];
            break;
        case 'DEPOSIT':
            sqlIncome = [sqlIncome[1]];
            sqlExpense = null;
            break;
        case 'WITHDRAW':
            sqlIncome = null;
            sqlExpense = [sqlExpense[1]];
            break;
        case 'REWARD':
            sqlIncome = [sqlIncome[2]];
            sqlExpense = [sqlExpense[2]];
            break;
        case '':
        case 'ALL':
            break;
        default:
            utilitas.throwError('Invalid statement type.', 400);
    }
    for (let item of sqlIncome || []) {
        sqlCase.push(item);
    }
    for (let item of sqlExpense || []) {
        sqlCase.push(item);
    }
    return await rawQueryStatements(acc, sqlCase, timestamp, count, options);
};

const querySwapStatements = async (acc, timestamp, count, options = {}) => {
    const [sqlBase, sqlUser] = [[
        `transactions_trx_transaction_actions_account = 'swap.oracle'`,
        `transactions_trx_transaction_actions_name = 'cnfmstatmnt'`,
    ], 'transactions_trx_transaction_actions_data__'];
    const sqlCase = [
        [...sqlBase, `${sqlUser}from_user = '${acc}'`],
        [...sqlBase, `${sqlUser}to_user = '${acc}'`],
    ].map(x => { return `(${x.join(' AND ')})`; });
    return await rawQueryStatements(acc, sqlCase, timestamp, count, options);
};

const queryAllDepositByAccount = async (account) => {
    return await queryStatements(account, null, 'DEPOSIT', 0, { getAll: true });
};

const queryWithdrawByAccountInLast24H = async (account) => {
    return await queryStatements(account, new Date(
        new Date().getTime() - 1000 * 60 * 60 * 24
    ), 'WITHDRAW', 0, { aec: true, getAll: true });
};

// const queryAllDepositMixinIdByAccount = async (account) => {
//     const resp = await queryAllDepositByAccount(account);
//     const result = new Set();
//     resp.map(x => {
//         const y = x.transactions_trx_transaction_actions_data_meta;
//         if (y && y.mixin_snapshot && y.mixin_snapshot.opponent_id) {
//             result.add(y.mixin_snapshot.opponent_id);
//         }
//     });
//     return [...result];
// };

const connectToShp = async () => {
    disconnect();
    webSocket = new ws(await getShpApi(), { perMessageDeflate: false });
    webSocket.on('message', onMessage);
};

const ensureConnecting = async () => {
    if ((new Date() - lastMessageAt) / 1000 > fetchCurrent) {
        await connectToShp();
    }
};

const init = async (latestBlockNum, blkCallback, trxCallback, options) => {
    options = options || {};
    blockCallback = blkCallback;
    transactionCallback = trxCallback;
    cusGetLatestBlockNum = latestBlockNum;
    fetchCurrent = ~~options.current ? ~~options.current : fetchCurrent;
    silent = !!options.silent;
    if ((await config()).serviceStateHistoryPlugin) {
        return await (options && options.event || event).loop(
            ensureConnecting, 1, fetchCurrent, 3, null, options
        );
    }
};

module.exports = {
    getBlockNumByTransactionId,
    getTransactionById,
    init,
    // queryAllDepositMixinIdByAccount,
    queryBoundByAccount,
    queryStatements,
    querySwapStatements,
    queryTransactions,
    queryWithdrawByAccountInLast24H,
    quickDeserializeActionData,
};

const { TextEncoder, TextDecoder } = require('util');
const { utilitas, event } = require('utilitas');
const { Serialize } = require('eosjs');
const sushitrain = require('./sushitrain');
const database = require('./database');
const account = require('./account');
const finance = require('./finance');
const config = require('./config');
const zlib = require('zlib');
const ws = require('ws');
