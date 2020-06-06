'use strict';

const { TextEncoder, TextDecoder } = require('util');
const { utilitas, event } = require('utilitas');
const eosNameVerify = require('eos-name-verify');
const { Serialize } = require('eosjs');
const sushitrain = require('./sushitrain');
const database = require('./database');
const finance = require('./finance');
const config = require('./config');
const zlib = require('zlib');
const ws = require('ws');

for (let i in global.chainConfig || {}) {
    config[i] = typeof global.chainConfig[i] === 'undefined'
        ? config[i] : global.chainConfig[i];
}

const loopName = 'Pac-Man';
const maxTransactionQueryCount = 100;
const fetchCurrent = 10;

let event = null;
let cusGetLatestBlockNum = null;
let blockCallback = null;
let transactionCallback = null;
let webSocket = null;
let abi = null;
let types = null;
let lastMessageAt = 0;

const chainLogs = (content) => {
    console.log(`[${loopName}] ${content}`);
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
        chainLogs(err);
        disconnect();
    }
};

const receivedAbi = async (data) => {
    chainLogs('Received ABIs');
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
            chainLogs('Received chain status: ', data);
            break;
        case 'get_blocks_result_v0':
            if (response.this_block) {
                chainLogs(`SYNC BLOCK: ${response.this_block.block_id}`
                    + ` / ${response.this_block.block_num}`);
            } else if (response.head) {
                chainLogs(`SYNC HEAD: ${response.head.block_id}`
                    + ` / ${response.head.block_num}`);
            } else {
                chainLogs(`UPTODATE!`);
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
                + `${response.this_block.block_num}.`;
            j.hex_data = j.data && utilitas.byteToHexString(j.data);
            if (!(i.trx.id = trxIds[j.hex_data])) {
                j.data && chainLogs(`Fail to match transactions in ${lTail}.`);
                return;
            }
            let contract = null;
            try {
                contract = await sushitrain.getContractByName(j.account);
            } catch (err) {
                utilitas.assert(!err.includes(
                    'ECONNREFUSED'
                ), 'Error connecting to ABI server.', 500);
                chainLogs(`Error fetching ABI for transactions in ${lTail}: `,
                    err);
            }
            try {
                j.data = contract && deserializeActionData(
                    contract, j.account, j.name, j.data
                );
            } catch (err) {
                j.data = null;
                chainLogs(err);
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
        const sql = `INSERT INTO transactions (${columns.join(', ')}) VALUES (${
            columns.map((_, x) => { return `\$${x + 1}`; }).join(', ')
            }) ON CONFLICT (${columns[0]}) DO UPDATE SET ${
            columns.map(x => { return `${x} = EXCLUDED.${x}`; }).join(', ')
            } RETURNING ${columns[0]}`;
        const j = i.trx
            && i.trx.id
            && i.trx.transaction
            && i.trx.transaction.actions
            && i.trx.transaction.actions[0];
        const k = j && j.data ? j.data : null;
        const n = k && k.unpacked_meta ? k.unpacked_meta.request : null;
        const o = k && k.unpacked_meta ? k.unpacked_meta.mixin_snapshot : null;
        const p = k && k.unpacked_data ? k.unpacked_data : k;
        const l = finance.parseAmountAndCurrency(
            k ? (k.amount || k.quantity || (n ? n.amount : null)) : null
        );
        let m = null;
        if (k && utilitas.isBoolean(k.sync_result)) {
            m = k.sync_result;
        } else if (k && utilitas.isBoolean(k.auth_result)) {
            m = k.auth_result;
        }
        const val = [
            j ? i.trx.id : '*',
            j ? j.account : null,
            j ? j.name : null,
            k && k.id ? k.id : null,
            k && k.user_address ? k.user_address : null,
            k && k.oracleservice ? k.oracleservice : null,
            k && k.type ? k.type : (n ? n.type : null),
            k ? (k.from || k.user || (n ? n.user : null)) : null,
            k ? (k.to || k.user || ((n ? n.user : null))) : null,
            l ? l[2] : null,
            l ? l[1] : null,
            k ? (k.deposit_id || k.withdraw_id || k.req_id || null) : null,
            m,
            k && k.mixin_trace_id ? k.mixin_trace_id : (o ? o.trace_id : null),
            k && k.unpacked_meta ? k.unpacked_meta : null,
            p,
            p && p.topic ? p.topic : null,
            block.block_num,
            block.block_id,
            block.timestamp,
            block.producer,
            block.previous,
            block,
        ];
        if (config.serviceTransactionArchive) {
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
        transactionCallback && await transactionCallback(i);
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

const queryTransactions = async (
    blockNum, timestamp, type, pipTopic, count, options = {}
) => {
    blockNum = parseInt(blockNum || 0);
    count = parseInt(count || 0);
    count = count < 1 ? 1 : count;
    count = count > maxTransactionQueryCount ? maxTransactionQueryCount : count;
    let i = 0;
    timestamp = assertTimestamp(timestamp);
    let [sql, val] = [
        'SELECT * FROM transactions WHERE '
        + `transactions_trx_transaction_actions_name != $${++i} `,
        ['updresult']
    ];
    if (blockNum) {
        sql += ` AND block_num > $${++i}`;
        val.push(blockNum);
    }
    if (timestamp) {
        sql += ` AND timestamp > $${++i}`;
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
    const res = await database.query(sql, val);
    utilitas.assert(res && res.rows, 'Error querying transactions.', 500);
    return options.asRaw ? res.rows : await packTransactions(res.rows, options);
};

const queryStatements = async (
    account, timestamp, type, count, options = {}
) => {
    utilitas.assert(eosNameVerify(account), 'Invalid account.', 400);
    timestamp = assertTimestamp(timestamp);
    count = parseInt(count || 10);
    count = count < 1 ? 1 : count;
    count = count > maxTransactionQueryCount ? maxTransactionQueryCount : count;
    let [sqlIncome, sqlExpense, sqlCase] = [[[
        `transactions_trx_transaction_actions_account = 'eosio.token'`,
        `transactions_trx_transaction_actions_name = 'transfer'`,
        `transactions_trx_transaction_actions_data__to_user = '${account}'`,
    ], [
        `transactions_trx_transaction_actions_account = 'prs.tproxy'`,
        `transactions_trx_transaction_actions_name = 'sync'`,
        `transactions_trx_transaction_actions_data__to_user = '${account}'`,
        `transactions_trx_transaction_actions_data_type = '1'`,
        `transactions_trx_transaction_actions_data__sync_auth__result = true`,
    ]], [[
        `transactions_trx_transaction_actions_account = 'eosio.token'`,
        `transactions_trx_transaction_actions_name = 'transfer'`,
        `transactions_trx_transaction_actions_data__from_user = '${account}'`,
    ], [
        `transactions_trx_transaction_actions_account = 'prs.tproxy'`,
        `transactions_trx_transaction_actions_name = 'sync'`,
        `transactions_trx_transaction_actions_data__from_user = '${account}'`,
        `transactions_trx_transaction_actions_data_type = '2'`,
        `transactions_trx_transaction_actions_data__sync_auth__result = true`,
    ]], [], []];
    sqlIncome = sqlIncome.map(x => {
        return `(${x.join(' AND ')})`;
    });
    sqlExpense = sqlExpense.map(x => {
        return `(${x.join(' AND ')})`;
    });
    switch (String(type || '').toUpperCase()) {
        case 'INCOME':
            sqlExpense = null;
            break;
        case 'EXPENSE':
            sqlIncome = null;
            break;
        case 'DEPOSIT':
            sqlIncome = [sqlIncome[1]];
            sqlExpense = null;
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
    const sql = `SELECT * FROM transactions WHERE (${sqlCase.join(' OR ')})${
        timestamp ? (" AND timestamp < '" + timestamp.toISOString() + "'") : ''
        } ORDER BY timestamp DESC` + (options.getAll ? '' : ` LIMIT ${count}`);
    const res = await database.query(sql);
    utilitas.assert(res && res.rows, 'Error querying statements.', 500);
    return await packTransactions(res.rows, options);
};

const queryAllDepositByAccount = async (account) => {
    return await queryStatements(account, null, 'DEPOSIT', 0, { getAll: true });
};

const queryAllDepositMixinIdByAccount = async (account) => {
    const resp = await queryAllDepositByAccount(account);
    const result = new Set();
    resp.map(x => {
        const y = x.transactions_trx_transaction_actions_data_meta;
        if (y && y.mixin_snapshot && y.mixin_snapshot.opponent_id) {
            result.add(y.mixin_snapshot.opponent_id);
        }
    });
    return [...result];
};

const connectToShp = () => {
    disconnect();
    webSocket = new ws(config.shpApi, { perMessageDeflate: false });
    webSocket.on('message', onMessage);
};

const ensureConnecting = () => {
    if ((new Date() - lastMessageAt) / 1000 > 10) {
        connectToShp();
    }
};

const init = async (latestBlockNum, blkCallback, trxCallback, options = {}) => {
    blockCallback = blkCallback;
    transactionCallback = trxCallback;
    cusGetLatestBlockNum = latestBlockNum;
    if (config.serviceStateHistoryPlugin && config.shpApi) {
        return await (options && options.event || event).loop(
            ensureConnecting, 1, 10, 3, loopName
        );
    }
};

module.exports = {
    init,
    getTransactionById,
    getBlockNumByTransactionId,
    queryTransactions,
    queryStatements,
    queryAllDepositMixinIdByAccount,
};
