import { getApiUrl } from './sushibar.mjs';
import { uoid, utilitas, uuid } from 'utilitas';

import {
    defaultTransMemo, formatAmount as _formatAmount, parseAndFormat
} from './finance.mjs';

const formatAmount = number => _formatAmount(number, defaultCurrency);
const symbol2RumSymbol = symbol => `ERC20-${symbol}`;

// Asset data from: https://mixin-api.zeromesh.net/network
// The index of the assets is sensitive. DO NOT change or reuse!

const assetIds = {
    BTC: {
        index: 0, id: 'c6d0c728-2624-429b-8e0d-d9d19b6592fa', name: 'Bitcoin',
        icon: 'HvYGJsV5TGeZ-X9Ek3FEQohQZ3fE9LBEBGcOcn4c4BNHovP4fW4YB97Dg5LcXoQ1hUjMEgjbl1DPlKg1TW7kK6XP',
        rumAddress: '0x433C6b890A050bf6e856422fD0B10a7D89d81f83',
    },
    XIN: {
        index: 1, id: 'c94ac88f-4671-3976-b60a-09064f1811e8', name: 'XIN Coins',
        icon: 'UasWtBZO0TZyLTLCFQjvE_UYekjC7eHCuT_9_52ZpzmCC-X-NPioVegng7Hfx0XmIUavZgz5UL-HIgPCBECc-Ws',
        rumAddress: '0xe34E72De035dfbe256B02C6c845992F543c628CC',
    },
    ETH: {
        index: 2, id: '43d61dcd-e413-450d-80b8-101d5e903357', name: 'Ethereum',
        icon: 'zVDjOxNTQvVsA8h2B4ZVxuHoCF3DJszufYKWpd9duXUSbSapoZadC7_13cnWBqg0EmwmRcKGbJaUpA8wFfpgZA',
        rumAddress: '0xd608279aEc5EE1e12d2810F6BBa96877191f2587',
    },
    USDT: {
        index: 3, id: '4d8c508b-91c5-375b-92b0-ee702ed2dac5', name: 'Tether',
        icon: 'ndNBEpObYs7450U08oAOMnSEPzN66SL8Mh-f2pPWBDeWaKbXTPUIdrZph7yj8Z93Rl8uZ16m7Qjz-E-9JFKSsJ-F',
        chain: 'Ethereum', chainSensitive: true,
        rumAddress: '0x9540AaF888739fAa4467B40682ed6847ECb17053',
    },
    'USDT@BTC': {
        index: 4, id: '815b0b1a-2764-3736-8faa-42d694fa620a', name: 'Tether',
        icon: 'ndNBEpObYs7450U08oAOMnSEPzN66SL8Mh-f2pPWBDeWaKbXTPUIdrZph7yj8Z93Rl8uZ16m7Qjz-E-9JFKSsJ-F',
        chain: 'Bitcoin', chainSensitive: true, symbolDisplay: 'USDT',
    },
    ZEC: {
        index: 5, id: 'c996abc9-d94e-4494-b1cf-2a3fd3ac5714', name: 'Zcash',
        icon: '9QWOYgcD0H7q1cH6PaSM08FQ549epnEzqIQ2EgEfK2s82jhsIu1wDKmsR7rkPFwjIYKOILteq7mW1hIaXcy4DhI',
    },
    ONE: {
        index: 6, id: '2566bf58-c4de-3479-8c55-c137bb7fe2ae', name: 'BigONE Token',
        icon: 'CtuFhqtCKJliKCWw9-1EemlPMOnUs1b_Nh0XUjzHlVt3OmLi_vwPu01xbYC8Js9-2APTK8s4aAMree7LC8gH6FQ',
    },
    LTC: {
        index: 7, id: '76c802a2-7c88-447f-a93e-c29c9e5dd9c8', name: 'Litecoin',
        icon: 'dLK5T9I4YFA094o6nn-qZ_TWLUtIrL0xtjxOyURaLoPcl94m0JKQhXQiOrC775LS9d8apDfLXVfbpDzGmWDf0CWJ',
    },
    SC: {
        index: 8, id: '990c4c29-57e9-48f6-9819-7d986ea44985', name: 'Siacoin',
        icon: 'K1qFRFwAn2aJ-SEM4Tya7y_HBelBZsL5J1WEdZX4S3-APXHExcsZUYdyQAMRhgebcto3CF_OLoImx8U9-4-M7C4',
    },
    BCH: {
        index: 9, id: 'fd11b6e3-0b87-41f1-a41f-f0e9b49e5bf0', name: 'Bitcoin Cash',
        icon: 'tqt14x8iwkiCR_vIKIw6gAAVO8XpZH7ku7ZJYB5ArMRA6grN9M1oCI7kKt2QqBODJwr17sZxDCDTjXHOgIixzv6X',
    },
    ATOM: {
        index: 10, id: '7397e9f1-4e42-4dc8-8a3b-171daaadd436', name: 'Cosmos',
        icon: 't-HH_7zAE5Y7OG9WgC1muIeFWJee4WypzbdJ5FjakEIivRYnSz89CBR4twXH-K_wFFodURRhYulVY-PrOO35ZoQ',
    },
    VCASH: {
        index: 11, id: 'c3b9153a-7fab-4138-a3a4-99849cadc073', name: 'VCash',
        icon: 'OzfqNm0HPcHmqQOlkGGU5GoaAI3EznfbALmDBOZJdl2lDhlkNMVFDIC_CUsaeHEfyIeYT7A6vNLSR-MyqpnaBlYs128',
    },
    BSV: {
        index: 12, id: '574388fd-b93f-4034-a682-01c2bc095d17', name: 'Bitcoin SV',
        icon: '1iUl5doLjMSv-ElcVCI4YgD1uIayDbZcQP0WjFEajoY1-qQZmVEl5GgUCtsp8CP0aj96a5Rwi-weQ5YA64lyQzU',
    },
    USDC: {
        index: 13, id: '9b180ab6-6abe-3dc0-a13f-04169eb34bfa', name: 'USD Coin',
        icon: 'w3Lb-pMrgcmmrzamf7FG_0c6Dkh3w_NRbysqzpuacwdVhMYSOtnX2zedWqiSG7JuZ3jd4xfhAJduQXY1rPidmywn',
    },
    BNB: {
        index: 14, id: '17f78d7c-ed96-40ff-980c-5dc62fecbc85', name: 'Binance',
        icon: 'HCjLu6VM0XA7ouRcZJGDTOzE7zoXaA8LgESw075VW5teZ27AGUgyGrc4jnzuK5LtgT5HJQDSNSOImnU3IcUsBLoF',
    },
    'USDT@TRON': {
        index: 15, id: 'b91e18ff-a9ae-3dc7-8679-e935d9a4b34b', name: 'Tether',
        icon: 'ndNBEpObYs7450U08oAOMnSEPzN66SL8Mh-f2pPWBDeWaKbXTPUIdrZph7yj8Z93Rl8uZ16m7Qjz-E-9JFKSsJ-F',
        chain: 'TRON', chainSensitive: true, symbolDisplay: 'USDT',
    },
    XRP: {
        index: 16, id: '23dfb5a5-5d7b-48b6-905f-3970e3176e27', name: 'Ripple',
        icon: 'SyX2tH2mBbSc45IfkOysbbd8WtPEjla5R3xT9ym0tbKv_vAyzl_Jd5qEYsOhKyuFRv09w3uB4Vzs2XJuJzZeO7e_',
    },
    XMR: {
        index: 17, id: '05c5ac01-31f9-4a69-aa8a-ab796de1d041', name: 'Monero',
        icon: 'vffCzX0PPO1f1D0sRFCkpJuSRYbxEM5u-hl4FMoUeWk8g899U5eyVKnFENiEJ4AXU0s-62mx1nBR3c_pHFROuw',
    },
    PRS: {
        index: 18, id: '3edb734c-6d6f-32ff-ab03-4eb43640c758', name: 'PRESSone Token',
        icon: '1fQiAdit_Ji6_Pf4tW8uzutONh9kurHhAnN4wqEIItkDAvFTSXTMwlk3AB749keufDFVoqJb5fSbgz7K2HoOV7Q',
    },
    EOS: {
        index: 19, id: '6cfe566e-4aad-470b-8c9a-2fd35b49c68d', name: 'Entrepreneurial Operating System',
        icon: 'a5dtG-IAg2IO0Zm4HxqJoQjfz-5nf1HWZ0teCyOnReMd3pmB8oEdSAXWvFHt2AJkJj5YgfyceTACjGmXnI-VyRo',
        chain: 'EOS',
    },
    CNB: {
        index: 20, id: '965e5c6e-434c-3fa9-b780-c50f43cd955c', name: 'Chui Niu Bi',
        icon: '0sQY63dDMkWTURkJVjowWY6Le4ICjAFuu3ANVyZA4uI3UdkbuOT5fjJUT82ArNYmZvVcxDXyNjxoOv0TAYbQTNKS',
        rumAddress: '0x2A4cb8346e7abb258a91763E8eB762385d105ea0',
    },
    COB: {
        index: 21, id: 'c1197dcd-c4e9-383c-97b0-d3e3ef797305', name: 'comeonbaby',
        icon: 'yH_I5b0GiV2zDmvrXRyr3bK5xusjfy5q7FX3lw3mM2Ryx4Dfuj6Xcw8SHNRnDKm7ZVE3_LvpKlLdcLrlFQUBhds',
    },
    RUM: {
        index: 22, id: '4f2ec12c-22f4-3a9e-b757-c84b6415ea8f', name: 'Quorum Token',
        icon: 'ypHHp9tN4C9K2OlYFLRRBmWn2wYL5olLtntyupiCdsnagR9ML7p-GyT9gmNRD6ETLbBT6i-ROjN9wEj7ItibyboWAhPi9BnKNc8',
        chain: 'Ethereum', rumAddress: '0xe8aa87502AffC197c3D9e5fC31BFd78390Bd181E',
    },
    BOX: {
        index: 23, id: 'f5ef6b5d-cc5a-3d90-b2c0-a2fd386e7a3c', name: 'BOX',
        icon: 'ml7tg1ZGrQt6IJSvEusWFfthosOB98GWN7r4EkmgSP8tbJHxK7OWki9zfZFFDCDOJE0nlLBR6dc4nbUguXE3Bg4',
        chain: 'Ethereum', rumAddress: '0x6262567fb1D001726A4B05a826b586bF951DbbdB',
    },

};

const chainIds = {
    BTS: {
        id: '05891083-63d2-4f3d-bfbe-d14d7fb9b25a',
        icon: 'vPCw4G1BhBWLzFSVt8jMJxq7LhQgVRbn_IbgJif9mixgLyJfBTlrc4TbELTThAwQCdVqikJQNDDQ84nQZLVf1yGm',
    },
    Binance: {
        id: '17f78d7c-ed96-40ff-980c-5dc62fecbc85',
        icon: 'HCjLu6VM0XA7ouRcZJGDTOzE7zoXaA8LgESw075VW5teZ27AGUgyGrc4jnzuK5LtgT5HJQDSNSOImnU3IcUsBLoF',
    },
    Bitcoin: {
        id: 'c6d0c728-2624-429b-8e0d-d9d19b6592fa',
        icon: 'HvYGJsV5TGeZ-X9Ek3FEQohQZ3fE9LBEBGcOcn4c4BNHovP4fW4YB97Dg5LcXoQ1hUjMEgjbl1DPlKg1TW7kK6XP',
    },
    'Bitcoin Cash': {
        id: 'fd11b6e3-0b87-41f1-a41f-f0e9b49e5bf0',
        icon: 'tqt14x8iwkiCR_vIKIw6gAAVO8XpZH7ku7ZJYB5ArMRA6grN9M1oCI7kKt2QqBODJwr17sZxDCDTjXHOgIixzv6X',
    },
    'Bitcoin SV': {
        id: '574388fd-b93f-4034-a682-01c2bc095d17',
        icon: '1iUl5doLjMSv-ElcVCI4YgD1uIayDbZcQP0WjFEajoY1-qQZmVEl5GgUCtsp8CP0aj96a5Rwi-weQ5YA64lyQzU',
    },
    Bytom: {
        id: '443e1ef5-bc9b-47d3-be77-07f328876c50',
        icon: 'pZQ0HL075WytmDYtyVdNXfn_zvAkCMtwcv9665oXtm8h86W_5mf1ROqidtq2ByY7xBM2xxxxbHP3oKScCjnQK5GR',
    },
    Cosmos: {
        id: '7397e9f1-4e42-4dc8-8a3b-171daaadd436',
        icon: 't-HH_7zAE5Y7OG9WgC1muIeFWJee4WypzbdJ5FjakEIivRYnSz89CBR4twXH-K_wFFodURRhYulVY-PrOO35ZoQ',
    },
    Dash: {
        id: '6472e7e3-75fd-48b6-b1dc-28d294ee1476',
        icon: 'ReOP8DBeVc4VO5myA0zuURtNBJJGJCL4KB3Gj5bvBOeP4LW_ZZrwl7CesWhE3aSTm931sOGz69DcGIUmdb6RkF4',
    },
    Decred: {
        id: '8f5caf2a-283d-4c85-832a-91e83bbf290b',
        icon: 'ATSnFPH9vp6WPJ-KB9h_2JT93519YUPBbbbgAbPJBStlF3tFkP70iiZqDGi8ha-LssoqHMdRItF2_Un4FbglYMI',
    },
    Dogecoin: {
        id: '6770a1e5-6086-44d5-b60f-545f9d9e8ffd',
        icon: 'D1quwKOIaKBNIx6EL1znNS09vRnh00FP7BWwOJUtI_9CFlohJLuyG6CjcU9x4YXu9LSzGs0QqRSG54wcfsOtTMU',
    },
    EOS: {
        id: '6cfe566e-4aad-470b-8c9a-2fd35b49c68d',
        icon: 'a5dtG-IAg2IO0Zm4HxqJoQjfz-5nf1HWZ0teCyOnReMd3pmB8oEdSAXWvFHt2AJkJj5YgfyceTACjGmXnI-VyRo',
    },
    Ethereum: {
        id: '43d61dcd-e413-450d-80b8-101d5e903357',
        icon: 'zVDjOxNTQvVsA8h2B4ZVxuHoCF3DJszufYKWpd9duXUSbSapoZadC7_13cnWBqg0EmwmRcKGbJaUpA8wFfpgZA',
    },
    'Ethereum Classic': {
        id: '2204c1ee-0ea2-4add-bb9a-b3719cfff93a',
        icon: 'fM9wgyNyB3Uiopx2FRFxhr-sYrvXZtJ-uCpk975wGdpoehoA59rIU-BQ4s_6YFMDEthQ74KCPysOIWSFK4vUG_Y',
    },
    Grin: {
        id: '1351e6bd-66cf-40c1-8105-8a8fe518a222',
        icon: '0rUV7Qlq3BkRbjf9DL1gt0f2cH92-oeDmnr2SL2MBe6h0WLDqX6krEKR-IXGC6O2y2CLwyYcikLbUVc_GbwUgz4',
    },
    Handshake: {
        id: '13036886-6b83-4ced-8d44-9f69151587bf',
        icon: 'VvNrYJDwMh4HbKmnSQrzFvJbNd3pRtP1N-4cXFi09BluI2BMUAmxHsoXXXRO7y4q9cqs5qAXz-XondTANQgklzKu',
    },
    Horizen: {
        id: 'a2c5d22b-62a2-4c13-b3f0-013290dbac60',
        icon: 'CFQzgS3lZztswzt8mKVWAOWAJDhlQQw2gQZN4_-2bRAzRivObDq-KOdjGIv_vcY6FGJLFlFxN4vSrFb7t0uxsQ',
    },
    Litecoin: {
        id: '76c802a2-7c88-447f-a93e-c29c9e5dd9c8',
        icon: 'dLK5T9I4YFA094o6nn-qZ_TWLUtIrL0xtjxOyURaLoPcl94m0JKQhXQiOrC775LS9d8apDfLXVfbpDzGmWDf0CWJ',
    },
    MassGrid: {
        id: 'b207bce9-c248-4b8e-b6e3-e357146f3f4c',
        icon: 'PbftbKJkl5Fu34falXrpoaEqDRIdNonuISYlz2ripfchyCSXEafNqZYTP_4pvFXql8Hhd6GznWe2SsC_sGLDHgo',
    },
    Monero: {
        id: '05c5ac01-31f9-4a69-aa8a-ab796de1d041',
        icon: 'vffCzX0PPO1f1D0sRFCkpJuSRYbxEM5u-hl4FMoUeWk8g899U5eyVKnFENiEJ4AXU0s-62mx1nBR3c_pHFROuw',
    },
    NEM: {
        id: '27921032-f73e-434e-955f-43d55672ee31',
        icon: 'I9f9bWw457YiAGMxyrNtu4aCezzgnnIYuxnNBzkN3aGG32HeOzFl-nA4miBRnU-3qnNylyiDZqoS-JfzfstnuQ',
    },
    Namecoin: {
        id: 'f8b77dc0-46fd-4ea1-9821-587342475869',
        icon: 'UtlEMoi7t6Q9p99oJ2KNLnMjajCrxdPanUJVw7_Emq4_G7fGsFhyWBQljFTrCFe-STHq3fsyt1asO78AtrD2ci4',
    },
    Nervos: {
        id: 'd243386e-6d84-42e6-be03-175be17bf275',
        icon: '0jykqkeqXVw16MXjMxcpA-7kd0Lo55jjqoKxXgq-WdI2ln4kaDnFUB6IqfktpX_x1wXxtow5MHkCNuH8f7PFBg',
    },
    Ravencoin: {
        id: '6877d485-6b64-4225-8d7e-7333393cb243',
        icon: 'qC2t9WkMv8f3O4LolVvaXKP9cuHXklYW-3bSu4Cl3WSRHkAkIGdQlBH4qqluZxqy7lnyuP9ffIVGXMNKTFF2AFQY',
    },
    Ripple: {
        id: '23dfb5a5-5d7b-48b6-905f-3970e3176e27',
        icon: 'SyX2tH2mBbSc45IfkOysbbd8WtPEjla5R3xT9ym0tbKv_vAyzl_Jd5qEYsOhKyuFRv09w3uB4Vzs2XJuJzZeO7e_',
    },
    Siacoin: {
        id: '990c4c29-57e9-48f6-9819-7d986ea44985',
        icon: 'K1qFRFwAn2aJ-SEM4Tya7y_HBelBZsL5J1WEdZX4S3-APXHExcsZUYdyQAMRhgebcto3CF_OLoImx8U9-4-M7C4',
    },
    Stellar: {
        id: '56e63c06-b506-4ec5-885a-4a5ac17b83c1',
        icon: 'PYek3gX0bUJyYhdewmrhh0IUAlbDf-gXpVEZrkW74v0Bsk24FO0jvP71IcjTOeDOlqUdjUVK-S0jdJ4BOkXi2XY',
    },
    TRON: {
        id: '25dabac5-056a-48ff-b9f9-f67395dc407c',
        icon: 'SXfRh0WJZpHrDAbBItuwwLp_TPML7hrbAPHGIz_EQRga0fFm5yGtNd55_W0ZZv9HRj_6W6kE4O4tq8W78mutAPE',
    },
    VCash: {
        id: 'c3b9153a-7fab-4138-a3a4-99849cadc073',
        icon: 'OzfqNm0HPcHmqQOlkGGU5GoaAI3EznfbALmDBOZJdl2lDhlkNMVFDIC_CUsaeHEfyIeYT7A6vNLSR-MyqpnaBlY',
    },
    Zcash: {
        id: 'c996abc9-d94e-4494-b1cf-2a3fd3ac5714',
        icon: '9QWOYgcD0H7q1cH6PaSM08FQ549epnEzqIQ2EgEfK2s82jhsIu1wDKmsR7rkPFwjIYKOILteq7mW1hIaXcy4DhI',
    },
};

const officialUrlNamespace = 'https://rumsystem.net/';
const paymentUrlRoot = 'https://mixin.one/pay';
const officialAccountId = 'beb05804-f083-498e-ac0f-af6d7fbcd694';
const defaultCurrency = 'RUM';
const defaultAssetId = assetIds[defaultCurrency].id;
const maxExtraLength = 98;
const verifyId = (mixinId) => /^[0-9]{1,}$/.test(mixinId);

const completeAssetIcon = (icon) => icon.startsWith('http')
    ? icon : `https://mixin-images.zeromesh.net/${icon}=s128`;

const queryAssetOrChain = (id, lib, index) => {
    let [type, catched, result] = [null, false, null];
    if (utilitas.isSet(index)) {
        index = parseInt(index);
        type = 'INDEX';
    } else {
        assert((id = String(id || '')), 'Invalid asset/chain name or id.', 400);
        if (uuid.validate(id)) {
            id = String(id).toLowerCase();
            type = 'UUID';
        } else {
            id = String(id).toUpperCase();
            type = 'SYMBOL';
        }
    }
    for (let i in lib) {
        switch (type) {
            case 'INDEX': catched = index === lib[i].index; break;
            case 'UUID': catched = id === lib[i].id.toLowerCase(); break;
            case 'SYMBOL': catched = id === i.toUpperCase();
        }
        if (catched) {
            result = lib[i];
            result.symbol = result.symbol || i;
            result.name = result.name || result.symbol;
            result.icon = completeAssetIcon(result.icon);
            break;
        }
    }
    return result;
};

const getChainByNameOrId = (id) => {
    const resp = queryAssetOrChain(id, chainIds);
    if (resp) {
        delete resp.symbol;
        delete resp.symbolDisplay;
    }
    return resp;
};

const getAssetByNameOrId = (id, options) => {
    options = options || {};
    const resp = queryAssetOrChain(id, assetIds, options.index);
    if (resp) {
        resp.symbolDisplay = resp.symbolDisplay || resp.symbol;
        resp.rumAddress
            && (resp.rumSymbol = symbol2RumSymbol(resp.symbolDisplay));
        if (!options.noChain) {
            const chainId = resp.chain || resp.name || resp.symbol;
            resp.chain = getChainByNameOrId(chainId);
            if (!resp.chain) { delete resp.chain };
        }
    }
    return resp;
};

const getMirroredAsset = (rmSbl, options) => {
    const result = {};
    for (let i in assetIds) {
        if (rmSbl && !utilitas.insensitiveCompare(rmSbl, symbol2RumSymbol(i))) {
            continue;
        }
        assetIds[i].rumAddress && (result[i] = getAssetByNameOrId(i, options));
    }
    return rmSbl ? result[Object.keys(result)?.[0]] : result;
};

const getMirroredAssetByAddress = (address, options) => {
    for (let i in assetIds) {
        if (utilitas.insensitiveCompare(address, assetIds[i].rumAddress)) {
            return getAssetByNameOrId(i, options);
        }
    }
};

const createPaymentUrl = (
    mixinAccount, currency, amount, trace, memo, options = {}
) => {
    options.mixinAccountRequired = true;
    var { mixinAccount, currencyId, amount, trace, memo } = verifyPaymentArgs(
        mixinAccount, null, null, currency, amount, trace, memo, options
    );
    return utilitas.assembleUrl(paymentUrlRoot, {
        recipient: mixinAccount, asset: currencyId, amount, trace, memo
    });
};

const createPaymentUrlToOfficialAccount = (amount, trace, memo, options) => {
    options = options || {};
    return createPaymentUrl(
        options.account || officialAccountId,
        options.currency || defaultCurrency, amount, trace, memo, options
    );
};

const verifyPaymentArgs = (
    strMxAccount, strMixinId, strEmail, currency, amount, trace, memo, opt = {}
) => {
    strMxAccount = utilitas.trim(strMxAccount);
    strMixinId = utilitas.trim(strMixinId);
    strEmail = utilitas.trim(strEmail);
    currency = utilitas.trim(currency, { case: 'UP' });
    amount = parseAndFormat(amount);
    trace = utilitas.trim(trace) || uuid.v1();
    memo = memo || defaultTransMemo;
    memo = Object.isObject(memo) ? JSON.stringify(memo) : memo;
    const mixinAccount = uuid.validate(strMxAccount) ? strMxAccount : '';
    const mixinId = verifyId(strMixinId) ? strMixinId : '';
    const email = utilitas.verifyEmail(strEmail) ? strEmail : '';
    const currencyId = assetIds[currency] && assetIds[currency].id;
    assert((opt.mixinAccountRequired || strMxAccount ? mixinAccount : true)
        && (strMixinId ? mixinId : true)
        && (opt.mixinAccountOrIdRequired ? mixinAccount || mixinId : true),
        'Invalid Mixin account.', 400);
    strEmail && assert(email, 'Invalid email.', 400);
    assert(opt.ignoreCurrency || currencyId, 'Invalid currency.', 400);
    assert(amount, 'Invalid amount.', 400);
    assert(uuid.validate(trace), 'Invalid trace.', 400);
    assert(memo.length <= 140, 'Memo too long.', 400);
    return {
        mixinAccount, mixinId, email, currency, currencyId,
        amount, trace, requestId: uoid.getTimestampFromUuid(trace), memo,
    };
};

const getTraceByTransactionId = (transactionId, rotate) => uoid.rotateUuid(
    transactionId, rotate, { url: officialUrlNamespace }
);

const assetAssetSymbol = (s) => {
    s = utilitas.ensureString(s, { case: 'UP' });
    assert(assetIds[s] && assetIds[s].id,
        `${s ? 'Unsupported' : 'Invalid'} asset symbol${s ? `: ${s}` : ''}.`,
        400);
    return s;
};

const maskPaymentUrl = async (url) =>
    url.replace(paymentUrlRoot, await getApiUrl('finance/pay'));

const assertMvmExtraLength = (extra) => {
    extra = utilitas.ensureString(extra).replace(/^0x/ig, '');
    assert(extra.length <= maxExtraLength, 'Invalid extra data.', 400);
    return extra;
};

export {
    assertMvmExtraLength,
    assetAssetSymbol,
    assetIds,
    createPaymentUrl,
    createPaymentUrlToOfficialAccount,
    defaultAssetId,
    defaultCurrency,
    formatAmount,
    getAssetByNameOrId,
    getMirroredAsset,
    getMirroredAssetByAddress,
    getTraceByTransactionId,
    maskPaymentUrl,
    paymentUrlRoot,
    verifyId,
    verifyPaymentArgs,
};
