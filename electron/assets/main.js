'use strict';

const prsAtm = Object.assign(
    nodeRequire('../'), {
    app: null,
    views: [],
    initVue: () => {
        prsAtm.router = VueRouter.createRouter({
            history: VueRouter.createWebHashHistory(),
            routes: prsAtm.views,
        });
        prsAtm.app = Vue.createApp({
            data() {
                return prsAtm;
            },
            computed: {
                getRouteName() { return this.$route.name; }
            },
            watch: {
                '$route': (to, from) => {
                    prsAtm.views.map(x => {
                        x.name === to.name && x.init && x.init();
                    });
                }
            }
        });
        prsAtm.app.use(prsAtm.router);
        prsAtm.app.mount('#app');
    },
});

$(prsAtm.initVue);



// const { ipcRenderer } = require('electron')

// // Synchronous message emmiter and handler
// console.log(ipcRenderer.sendSync('synchronous-message', 'sync ping'))

// // Async message handler
// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//     console.log(arg)
// })

// // Async message sender
// ipcRenderer.send('asynchronous-message', 'async ping')
