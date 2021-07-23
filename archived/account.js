
const getBalance = async (account, currency) => {
    assertName(account);
    currency = currency ? finance.mapCurrency(
        currency, mixin.defaultCurrency, finance.chainCurrency
    ) : undefined;
    let balance = await (await sushitrain.getClient(
    )).api.rpc.get_currency_balance(
        'eosio.token', account, currency
    );
    balance = finance.parseBalance(balance);
    utilitas.assert(balance, 'Error requesting balance.', 500);
    const result = {};
    for (let i in balance) {
        result[finance.mapCurrency(
            i, finance.chainCurrency, mixin.defaultCurrency
        )] = balance[i];
    }
    result[mixin.defaultCurrency] = result[mixin.defaultCurrency] || 0;
    return result;
};

module.exports = {
    getBalance,
};

const { utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
const finance = require('../lib/finance');
const mixin = require('./mixin');

// const getAccount = async (acc) => {
//     const [accResp, accBound] = await Promise.all([
//         account.getByName(acc),
//         queryBoundByAccount(acc),
//     ]);
//     utilitas.assert(accResp, `Account Not Found (${acc}).`, 404);
//     (accBound || []).map(b => {
//         const { payment_provider, payment_account } = utilitas.extract(
//             b, 'transactions_trx_transaction_actions_data_data'
//         ) || {};
//         if (!payment_provider || !payment_account) { return; }
//         const lp = utilitas.ensureString(payment_provider, { case: 'LOW' });
//         Object.assign(accResp, {
//             [`bound_${lp}_account`]: payment_account,
//             [`bound_${lp}_profile`]: utilitas.extract(b, `bound_${lp}_profile`),
//         });
//     });
//     return accResp;
// };

// const bindMixinIdentity = async (acc, privateKey, options = {}) => {
//     await account.getByName(acc);
//     const [trace, amount] = [uuid.v1(), account.bindingPrice];
//     const memo = {
//         a: 'b', c: acc, s: crypto.signData({ trace }, privateKey).signature,
//     };
//     const paymentUrl = await system.magicPayment(
//         mixin.createPaymentUrlToOfficialAccount(amount, trace, memo, options),
//         { cnb: true }
//     );
//     return { trace, memo, paymentUrl, amount: mixin.formatAmount(amount) };
// };

// const queryBoundByAccount = async (acc, options) => {
//     options = options || {};
//     account.assertName(acc, 'Invalid account.');
//     const args = {};
//     if (options.provider) { args.provider = options.provider; }
//     return await sushibar.requestApi('GET', `chain/bounds/${acc}`, args);
// };

// const accountEvolution = async (prevKey, account, publicKey, privateKey) => {
//     prsc.assertString(account, 'Invalid evolved user account.');
//     prsc.assertString(publicKey, 'Invalid evolved public key.');
//     const userAddress = crypto.privateKeyToAddress(prevKey);
//     const data = {
//         account, userAddress, publicKey, provider: 'PRSLEGACY',
//         time: Date.now(), action: 'BINDIDENTITY',
//     };
//     const postData = {
//         data, evolvedSignature: crypto.signData(data, privateKey),
//         legacySignature: crypto.signData(data, prevKey),
//     };
//     return await sushibar.requestApi('POST', `chain/bounds`, null, postData);
// };
