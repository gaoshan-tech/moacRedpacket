import 'amfe-flexible';
// import '../../base/src/main';
import '@/styles/index.css' // global css
import Vue from 'vue';
import App from './App';
import { router } from './router';
import moment from 'moment';
import Web3 from "web3";
import RedPacketArtifact from "../../build/contracts/RedPacket.json";
// import VeeValidate, { Validator } from 'vee-validate';
// import zh_CN from 'vee-validate/dist/locale/zh_CN';



const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
Vue.prototype.$Web3 = web3;
Vue.prototype.$RedPacketArtifact = RedPacketArtifact;


import {
    Row,
    Col,
    Toast,
    Field,
    PullRefresh,
    Tag,
    Button,
    NavBar,
    CellGroup,
    SwipeCell,
    Cell,
    Popup,
    Picker,
    DatetimePicker,
    Uploader, Icon, Divider,
    Checkbox, CheckboxGroup, List, ImagePreview, RadioGroup, Radio, Image
} from 'vant';

import axios from 'axios'
Vue.prototype.$axios = axios;
Vue.prototype.$moment = moment;

import VConsole from 'vconsole/dist/vconsole.min.js' //import vconsole
// todo
let vConsole = new VConsole() // 初始化

Vue.use(Row).use(Col).use(CellGroup);
Vue.use(List);
Vue.use(Button);
Vue.use(NavBar);
Vue.use(Tag);
Vue.use(PullRefresh);
Vue.use(Toast);
Vue.use(Field);
Vue.use(Popup);
Vue.use(Picker);
Vue.use(RadioGroup);
Vue.use(DatetimePicker);
Vue.use(Uploader);
Vue.use(ImagePreview);
Vue.use(Icon);
Vue.use(Radio);
Vue.use(Image);
Vue.use(Cell).use(SwipeCell);
Vue.use(Checkbox).use(CheckboxGroup);
Vue.use(Divider);

// 引入tp-js-sdk
const tp = require('tp-js-sdk');
Vue.prototype.$tp = tp;
// 引入chain3
const Chain3 = require('chain3');
// const chain3 = new Chain3(new Chain3.providers.HttpProvider('http://127.0.0.1:7545'));
const chain3 = new Chain3(new Chain3.providers.HttpProvider('https://chain3.mytokenpocket.vip'));
Vue.prototype.$chain3 = chain3;
// console.log(chain3);

/*import IndexDBWrapper from "indexdbwrapper";
const db = new IndexDBWrapper("sunshineData", 1, {
    onupgradeneeded: e => {
        const db = e.target.result;
        const objStore = db.createObjectStore("t1", {
            autoIncrement: true,
            keyPath: "id"
        });
        objStore.createIndex("name", "name" );
        objStore.createIndex("key", "key");
    }
})
Vue.prototype.$db = db;
console.log(db);*/

function getServerConfig () {
    return new Promise ((resolve, reject) => {
        axios.get('./serverConfig.json').then((result) => {
            // console.log(result)  // 看打印出来的结果
            let config = result.data;
            // console.log(config);
            for (let key in config) {
                Vue.prototype[key] = config[key];
            }
            // console.log(Vue.prototype.baseUrl)  // 验证是否已经把属性挂在了Vue上
            resolve();
        }).catch((error) => {
            console.log(error);
            reject()
        })
    })
}
// getServerConfig();

import { URLDATA }from '@/utils/url'
Vue.prototype.baseUrl = URLDATA.baseUrl;

new Vue({
    router,
    el: '#app',
    render: h => h(App)
});

