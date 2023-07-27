import { encryption, storage, utilitas } from 'utilitas';

const sliceFile = async (any, options) => {
    const [file, key, secret, slices] = [
        { ...await storage.sliceFile(any, options), encryption: null },
        options?.encrypt ? encryption.aesCreateKey(options) : null,
        options?.encrypt ? [] : null, [],
    ];
    for (let i in file.slices) {
        let content = file.slices[i].content;
        if (options?.encrypt) {
            const resp = encryption.aesEncrypt(
                content, { key: key.buffer, expected: 'BUFFER' }
            );
            secret.push({ iv: resp.iv, authTag: resp.authTag });
            file.encryption = resp.encryption;
            content = resp.encrypted;
        }
        slices.push(content);
        file.slices[i].url = [];
        delete file.slices[i].content;
    }
    return {
        formula: file, slices,
        private: options?.encrypt ? { ...file, keys: { key: key.base64, secret } } : null,
    };
};

const mergeFile = async (formula, slices, options) => {
    assert(
        formula?.slices?.length === slices?.length && slices.length > 0,
        'Invalid formula.'
    );
    let key = null;
    switch (utilitas.ensureString(formula?.encryption, { case: 'UP' })) {
        case '':
            break;
        case 'AES-256-GCM':
            key = encryption.aesCreateKey({ key: formula?.keys?.key });
            break;
        default:
            throw new Error('Unsupported encryption algorithm.');
    }
    for (let i in formula.slices) {
        formula?.encryption && assert(
            key && formula?.keys?.secret[i]?.iv && formula?.keys?.secret[i]?.authTag,
            'Missing key, iv or authTag to decrypt.'
        );
        formula.slices[i].content = (key ? encryption.aesDecrypt(slices[i], {
            key: key.buffer, iv: formula?.keys?.secret[i]?.iv,
            authTag: formula?.keys?.secret[i]?.authTag, expected: 'BUFFER',
        }) : slices[i]);
    }
    const x = await storage.mergeFile(formula, options);
    console.log(x);
};

export {
    sliceFile,
    mergeFile,
};
