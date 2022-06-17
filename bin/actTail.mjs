import { pacman, pacmvm, utilitas } from '../index.mjs';

const rawRender = (content, argv) => {
    if (!Object.keys(content).length) { return; };
    const compactJson = JSON.stringify(content);
    if (argv.grep && !/^\/|\/$/.test(argv.grep)) {
        if (compactJson.toLowerCase().indexOf(argv.grep.toLowerCase()) === -1) {
            return;
        }
    } else if (argv.grep && /^\/|\/$/.test(argv.grep)) {
        const regExp = new RegExp(argv.grep.replace(/^\/|\/$/g, ''), 'i');
        if (!regExp.test(compactJson)) { return; }
    }
    console.log(
        (argv.json ? utilitas.prettyJson(content) : compactJson) + '\n'
    );
};

const action = async (argv) => {
    argv.blocknum = utilitas.ensureInt(argv.blocknum, { min: 0 });
    await (argv.mvm ? pacmvm : pacman).init({
        callbacks: {
            newBlock: (content) => { return rawRender(content, argv); },
            initIdGet: argv.blocknum && (async () => { return argv.blocknum; }),
        },
        silent: !argv.detail,
    });
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Trace the lastest block of the chain',
    help: [
        '    --blocknum Initial block num                 [NUMBER  / OPTIONAL]',
        '    --grep     Match keyword or RegExp           [STRING  / OPTIONAL]',
        '    --detail   Show socket channel status        [WITH  OR  WITHOUT ]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Start from the latest block while `blocknum` is missing.   |',
        '    └---------------------------------------------------------------┘',
    ],
    example: [
        {
            args: {
                blocknum: true,
                json: null,
            },
        },
        {
            args: {
                blocknum: true,
                json: null,
                grep: 'PIP:2001',
            },
        },
    ],
};
