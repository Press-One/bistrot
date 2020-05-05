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

const assembleUrl = (url, componens) => {
    let args = [];
    for (let i in componens || []) {
        (isArray(componens[i]) ? componens[i] : [componens[i]]).map(x => {
            args.push(`${i}=${encodeURIComponent(x)}`);
        });
    }
    return `${url}${args.length ? `?${args.join('&')}` : ''}`;
};

const json = (object) => {
    return JSON.stringify(object, null, 2);
};

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const asyncTimeout = async (pms, timeout, err) => {
    let race = Promise.race([pms, new Promise((_, reject) => {
        setTimeout(() => { reject(new Error(err || 'Timed out.')); }, timeout);
    })]);
    return await race;
};

const base64Encode = (object, isBuf) => {
    return (isBuf ? object : Buffer.from(object)).toString('base64');
};

const base64Decode = (string, toBuf) => {
    const buf = Buffer.from(string, 'base64');
    return toBuf ? buf : buf.toString('utf8');
};

const base64Pack = (object) => {
    return base64Encode(JSON.stringify(object));
};

const base64Unpack = (string) => {
    return JSON.parse(base64Decode(string));
};

const getRandomInArray = (arr) => {
    return Math.floor(Math.random() * arr.length);
};

// const bufferToHex = (buffer) => {
//     return buffer.toString('hex');
// };

// const hexToBuffer = (hex) => {
//     return Buffer.from(hex, 'hex');
// };

const getShortestInArray = (arr) => {
    let [idx, len] = [0, -1];
    for (let i in arr) {
        if (len === -1 || len > arr[i].length) {
            idx = i;
            len = arr[i].length;
        }
    }
    return idx;
};

const arrayEqual = (arrA, arrB) => {
    if (!isArray(arrA) || !isArray(arrB)) {
        return false;
    }
    arrA.sort();
    arrB.sort();
    return arrA.join(',') === arrB.join(',');
};

module.exports = {
    clone,
    getRandomInt,
    isArray,
    isDate,
    verifyUuid,
    verifyEmail,
    assembleUrl,
    json,
    timeout,
    asyncTimeout,
    base64Encode,
    base64Decode,
    base64Pack,
    base64Unpack,
    getRandomInArray,
    getShortestInArray,
    arrayEqual,
};
