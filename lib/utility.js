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

module.exports = {
    getRandomInt,
    isArray,
    isDate,
};
