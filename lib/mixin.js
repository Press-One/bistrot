'use strict';

const account = require('./account');
const finance = require('./finance');
const uuidv1 = require('uuid').v1;

const officialAccountId = '14da6c0c-0cbf-483c-987a-c44477dcad1b';
const errMxId = 'Invalid Mixin account.';
const assetIds = {
    CNB: '965e5c6e-434c-3fa9-b780-c50f43cd955c',
    PRS: '3edb734c-6d6f-32ff-ab03-4eb43640c758',
    EOS: '6cfe566e-4aad-470b-8c9a-2fd35b49c68d',
};
const defaultCurrency = 'PRS'; // config.debug ? 'CNB' : 'PRS';
const defaultAssetId = assetIds[defaultCurrency];

const verifyId = (mixinId) => {
    return /^[0-9]{1,}$/.test(mixinId);
};

const getTimestampFromUuid = (uuid) => {
    return uuid ? Math.ceil((utilitas.convertFrom16to10(
        String(uuid).replace(/^(.{8})-(.{4})-.(.{3})-.{4}-.{12}$/, '$3$2$1')
    ) - 122192928000000000) / 10000) : 0;
};

const createPaymentUrl = (
    mixinAccount, currency, amount, trace, memo, options = {}
) => {
    options.mixinAccountRequired = true;
    var { mixinAccount, currencyId, amount, trace, memo } = verifyPaymentArgs(
        null, mixinAccount, null, null, currency, amount, trace, memo, options
    );
    return utilitas.assembleUrl('https://mixin.one/pay', {
        recipient: mixinAccount, asset: currencyId, amount, trace, memo
    });
    // return helper.assembleMixinApiUrl('pay', {
    //     recipient: mixinAccount, asset: currencyId, amount, trace, memo
    // });
};

const createPaymentUrlToOfficialAccount = (
    amount, trace, memo, options = {}
) => {
    return createMixinPaymentUrl(
        officialAccountId, defaultCurrency, amount, trace, memo, options
    );
};

const verifyPaymentArgs = (
    chainAccount, mixinAccount, mixinId, email,
    currency, amount, trace, memo, options = {}
) => {
    let currencyId = currencies[currency];
    mixinAccount = String(mixinAccount || '').trim();
    mixinId = String(mixinId || '').trim();
    email = String(email || '').trim();
    amount = finance.parseAndFormat(amount);
    trace = String(trace || '').trim() || uuidv1();
    options.chainAccountRequired && account.assertName(chainAccount);
    options.mixinAccountRequired && utilitas.assert(
        utilitas.verifyUuid(mixinAccount), errMxId, 400
    );
    options.mixinAccountOrIdRequired && utilitas.assert(
        utilitas.verifyUuid(mixinAccount) || verifyId(mixinId), errMxId, 400
    );
    email && utilitas.assert(utilitas.verifyEmail(email),
        'Invalid email.', 400
    );
    utilitas.assert(currencyId, 'Invalid currency.', 400);
    utilitas.assert(amount, 'Invalid amount.', 400);
    utilitas.assert(utilitas.verifyUuid(trace), 'Invalid trace.', 400);
    return {
        chainAccount, mixinAccount, mixinId, email,
        currency, currencyId, amount, trace,
        requestId: getTimestampFromUuid(trace),
        memo: memo || finance.defaultTransMemo,
    };
};

module.exports = {
    defaultAssetId,
    createPaymentUrl,
    createPaymentUrlToOfficialAccount,
    getTimestampFromUuid,
    verifyPaymentArgs,
};
