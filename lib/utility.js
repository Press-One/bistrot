'use strict';

const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
};

const getType = (object) => {
    return typeof object === 'undefined' ? 'Undefined'
        : Object.prototype.toString.call(object).replace(
            /^\[[^\ ]*\ (.*)\]$/, '$1'
        );
};

const is = (object, type) => {
    return getType(object) === type;
};

const isArray = (object) => {
    return is(object, 'Array');
};

const isDate = (object, strict) => {
    return is(object, 'Date') ? (
        strict ? object.toTimeString().toLowerCase() !== 'invalid date' : true
    ) : false;
};

const verifyUuid = (uuid) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        uuid
    );
};

const verifyEmail = (email) => {
    return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(
        email
    );
};

const assemblyUrl = (url, componens) => {
    let args = [];
    for (let i in componens || []) {
        args.push(`${i}=${encodeURIComponent(componens[i])}`);
    }
    return `${url}${args.length ? `?${args.join('&')}` : ''}`;
};

const json = (object) => {
    return JSON.stringify(object, null, 2);
};

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
    getRandomInt,
    isArray,
    isDate,
    verifyUuid,
    verifyEmail,
    assemblyUrl,
    json,
    timeout,
};
