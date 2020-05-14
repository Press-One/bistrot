'use strict';

const uuidV4 = require('uuid/v4');
const utility = require('./utility');

const jobs = {};

let timer = null;

const logs = (content) => {
    return console.log(`EVENT: ${content}`);
};

const sToMs = (intSec) => {
    return 1000 * ~~intSec;
};

const tryLock = (name, now, timeout) => {
    return (jobs[name].lock + timeout > now)
        ? jobs[name].lock
        : !(jobs[name].lock = now);
};

const unLock = (name) => {
    return jobs[name].lock = 0;
};

const exec = async () => {
    const now = new Date().getTime();
    for (let i in jobs) {
        if (jobs[i].lastRun + jobs[i].interval < now) {
            jobs[i].lastRun = now;
            try {
                if (tryLock(i, now, jobs[i].timeout)) {
                    // logs(`${i} is locked, skipping.`);
                    continue;
                }
                // console.log(`EVENT RUN: ${i}`);
                await jobs[i].function();
            } catch (err) {
                logs(err);
            }
            // console.log(`EVENT END: ${i}`);
            unLock(i);
        }
    }
};

const loop = async (func, interval, tout, delay, name) => {
    await utility.timeout((delay = sToMs(delay)));
    jobs[(name = name || uuidV4())] = {
        function: func,
        interval: sToMs(interval),
        timeout: sToMs(tout),
        delay: delay,
        lastRun: 0,
        lock: 0,
    };
    return (timer = timer
        || logs('initialized!')
        || (timer = setInterval(exec, 1000 * 1)));
};

const list = () => {
    return jobs;
};

module.exports = {
    loop,
    list,
};
