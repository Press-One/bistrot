'use strict';

const clone = (variable) => {
    let variableNew = variable;           // typeof Object === 'function' || etc
    switch (Object.prototype.toString.call(variable)) {
        case '[object Object]':           // Object instance of Object
            variableNew = {};
            for (let i in variable) {
                variableNew[i] = clone(variable[i]);
            }
            break;
        case '[object Array]':            // Object instance of Array
            variableNew = [];
            for (i in variable) {
                variableNew.push(clone(variable[i]));
            }
    }
    return variableNew;
};

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

const base64Encode = (string) => {
    return Buffer.from(string).toString('base64');
};

const base64Decode = (string) => {
    return Buffer.from(string, 'base64').toString('utf8');
};

const base64Pack = (object) => {
    return base64Encode(JSON.stringify(object));
};

const base64Unpack = (string) => {
    return JSON.parse(base64Decode(string));
};

module.exports = {
    clone,
    getRandomInt,
    isArray,
    isDate,
    verifyUuid,
    verifyEmail,
    assemblyUrl,
    json,
    timeout,
    base64Encode,
    base64Decode,
    base64Pack,
    base64Unpack,
};
