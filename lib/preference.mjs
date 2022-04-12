import { storage, utilitas } from 'utilitas';

const pOpt = (opts) => { return { ...opts || {}, pack: globalThis._bistrot }; };
const getUserConfig = async (options) => await storage.getConfig(pOpt(options));
const allowed = ['debug', 'secret', 'speedTest', 'email'];
const defaultConfig = { debug: false, secret: false, speedTest: false };

const get = async (args) => {
    const { config } = await getUserConfig();
    const result = utilitas.mergeAtoB(utilitas.mergeAtoB(
        args || globalThis.chainConfig || {}, config), defaultConfig);
    return result;
};

const set = async (input, options) => {
    options = options || {};
    const data = {};
    for (let i in input || {}) {
        assert([...allowed, ...(options.allowed || [])].includes(i),
            `'${i}' is not allowed to configure.`, 400);
        data[i] = input[i];
    }
    return storage.setConfig(data, pOpt(options));
};

export default get;
export { get, allowed, getUserConfig, set };
