import { utilitas } from 'utilitas';
import os from 'os';
import path from 'path';

const chainApiGlobal = ['https://prs-bp2.press.one'];
const chainApiChina = chainApiGlobal; // 'https://prs-bp-cn1.xue.cn'
const shareAtt = { p2p_port: 30303, rpc_port: 8545, rpc_https: false };
const chainConfig = () => { return globalThis.chainConfig || {} };
const inChina = async (o) => { return (o || await getGeo())?.country === 'CN'; };

const defaultConfig = {
    accounts: null,
    chainApi: null,
    debug: false,
    rpcApi: null,
    secret: false,
    speedTest: false,
    rumTcpPort: 7009,
    rumWsPort: 7010,
    rumApiPort: 8009,
    rumBootstrap: [],
};

const nodes = {
    'quorum': {
        ip: '149.56.22.113', geo: { country: 'CA' }, ...shareAtt,
        id: '3cd11a5dd80a59158f0f1baea9c0ce4928815ccfc4f888b27e4aaec99fe914389'
            + '2c2c485de4f77a21442506da00473955c619374f17a26fc1d2b96ad4ace6542',
    },
};

for (let i in nodes) {
    nodes[i].uri = `enode://${nodes[i].id}@${nodes[i].ip}:${nodes[i].p2p_port}`;
}

let geo = null;

const rawGetGeo = async (server) => {
    let resp;
    try {
        resp = await fetch(
            utilitas.assembleApiUrl(server, `api/system`)
        ).then(res => res.json());
    } catch (e) { }
    return resp?.data?.client?.geolocation;
};

const getGeo = async () => {
    return (geo = geo || await Promise.race(
        [...chainApiGlobal, ...chainApiChina].map(rawGetGeo)
    ));
};

const get = async (options) => {
    options = options || {};
    const diff = options.config || chainConfig();
    const resp = utilitas.mergeAtoB(diff, Object.assign({
        nodes, rumStore: globalThis._bistrot.runningInBrowser
            ? null : path.join(os.homedir(), '.quorum'),
    }, defaultConfig));
    if (!options.authority && !diff.chainApi && (await inChina() || options.safe)) {
        resp.chainApi = chainApiChina;
    }
    if (options.authority || !resp.chainApi) {
        resp.chainApi = chainApiGlobal;
    }
    resp.rpcApi = utilitas.ensureArray(resp.rpcApi);
    const [rpcChina, rpcGlobal] = [[], []];
    for (let i in nodes) {
        if (nodes[i].rpc_port && !chainConfig().rpcApi) {
            const http = `http${nodes[i].rpc_https ? 's' : ''}`;
            (await inChina(nodes[i].geo) ? rpcChina : rpcGlobal).push(
                `${http}://${nodes[i].ip}:${nodes[i].rpc_port}`
            );
        }
    }
    resp.rpcApi = [...resp.rpcApi, ...(
        await inChina() && rpcChina.length ? rpcChina : rpcGlobal
    )];
    assert(resp?.rpcApi?.length, 'RPC API endpoint not found.', 500);
    return resp;
};

export default get;
