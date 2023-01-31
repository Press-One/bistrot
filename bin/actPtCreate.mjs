import { bitBorrent } from '../index.mjs';
import { etc } from '../index.mjs';

const action = async (argv) => {
    assert(argv.path, 'Path is required.', 400);
    const options = {};
    if (argv.announce) {
        options.announce = argv.announce.split(';').map(
            tier => tier.split(',').filter(item => !!item)
        ).filter(tier => tier.length);
    }
    const resp = await bitBorrent.createTorrent(argv.path, options);
    if (argv.out) {
        await etc.dumpFile(argv.out, resp.torrent, {
            overwrite: argv.force,
            encoding: 'binary',
        });
    }
    delete resp.details.info;
    delete resp.details.infoHashBuffer;
    delete resp.details.infoBuffer;
    delete resp.details.pieces;
    delete resp.torrent;
    return { ...resp.details, magnet: resp.magnet };
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Create a torrent file for RUM-PT',
    help: [
        '    --path     Dir or file to seed               [STRING  / REQUIRED]',
        '    --announce Trackers: T1_A,T1_B;T2_C,T2_D     [STRING  / OPTIONAL]',
        '    --out      Output file                       [STRING  / OPTIONAL]',

    ],
    example: {
        args: {
            path: true,
        }
    },
    render: { table: { KeyValue: true } },
};
