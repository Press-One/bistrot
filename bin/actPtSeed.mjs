import { torrent } from '../index.mjs';

const action = async (argv) => {
    assert(argv.path, 'Path is required.', 400);
    const options = {};
    if (argv.announce) {
        options.announce = argv.announce.split(';').map(
            tier => tier.split(',').filter(item => !!item)
        ).filter(tier => tier.length);
    }
    const { name, magnetURI: magnet } = await torrent.seed(argv.path, options);
    return { name, magnet };
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Seed or download content via RUM-PT network',
    help: [
        '    --path     Filename, .torrent or MagnetURI   [STRING  / REQUIRED]',
        '    --announce Trackers: T1_A,T1_B;T2_C,T2_D     [STRING  / OPTIONAL]',
    ],
    example: {
        args: {
            path: true,
        }
    },
    render: { table: { KeyValue: true } },
};
