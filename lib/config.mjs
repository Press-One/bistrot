import { utilitas } from 'utilitas';

const chainApiGlobal = ['https://prs-bp2.press.one'];
const shareAtt = { p2p_port: 30303, rpc_port: 8545, rpc_https: false };
const mvmShareAtt = { p2p_port: 30305, rpc_port: 8547, rpc_https: false };
const chainConfig = () => globalThis.chainConfig || {};

const defaultConfig = {
    accounts: null,
    chainApi: null,
    debug: false,
    rpcApi: null,
    secret: false,
};

const nodes = {
    'quorum': {
        ip: '149.56.22.113', geo: { country: 'CA' }, ...shareAtt,
        id: '3cd11a5dd80a59158f0f1baea9c0ce4928815ccfc4f888b27e4aaec99fe914389'
            + '2c2c485de4f77a21442506da00473955c619374f17a26fc1d2b96ad4ace6542',
    },
};

const mvmNodes = {
    'quorum': {
        ip: '149.56.22.113', geo: { country: 'CA' }, ...mvmShareAtt,
        id: '06a2ec0637ac7d29114e82ef88d406eed165bf0b069e650e02cac08cf6fc0c4e6'
            + '5708a8a28521ea69f5639b623ba7f4c5b473df54f3a33df103792bbea04f050',
    },
};

const enrichNodes = (arr) => {
    for (let i in arr) {
        arr[i].uri = `enode://${arr[i].id}@${arr[i].ip}:${arr[i].p2p_port}`;
    }
};

enrichNodes(nodes);
enrichNodes(mvmNodes);

const get = async (options) => {
    options = options || {};
    const diff = options.config || chainConfig();
    const resp = utilitas.mergeAtoB(diff, Object.assign({ nodes }, defaultConfig));
    if (!resp.chainApi) { resp.chainApi = chainApiGlobal; }
    resp.rpcApi = utilitas.ensureArray(resp.rpcApi);
    const rpcGlobal = [];
    for (let i in nodes) {
        if (nodes[i].rpc_port && !chainConfig().rpcApi) {
            const http = `http${nodes[i].rpc_https ? 's' : ''}`;
            rpcGlobal.push(`${http}://${nodes[i].ip}:${nodes[i].rpc_port}`);
        }
    }
    resp.rpcApi = [...resp.rpcApi, ...rpcGlobal];
    assert(resp?.rpcApi?.length, 'RPC API endpoint not found.', 500);
    return resp;
};

export default get;
