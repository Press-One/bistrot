import { utilitas } from 'utilitas';

const maxExtraLength = 98;

const assertExtraLength = (extra) => {
    extra = utilitas.ensureString(extra).replace(/^0x/ig, '');
    utilitas.assert(extra.length <= maxExtraLength, 'Invalid extra data.', 400);
    return extra;
};

export {
    assertExtraLength,
};
