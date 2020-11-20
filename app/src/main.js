import 'amfe-flexible'
// import '../../base/src/main';
import '@/styles/index.css' // global css
import Vue from 'vue'
import App from './App'
import { router } from './router'
import moment from 'moment'
import Web3 from 'web3'
import RedPacketArtifact from '../../build/contracts/RedPacket.json'
// import VeeValidate, { Validator } from 'vee-validate';
// import zh_CN from 'vee-validate/dist/locale/zh_CN';

// const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
const web3 = new Web3(
  new Web3.providers.HttpProvider('https://chain3.mytokenpocket.vip')
)
Vue.prototype.$Web3 = web3
Vue.prototype.$RedPacketArtifact = RedPacketArtifact

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
  Uploader,
  Icon,
  Divider,
  Checkbox,
  CheckboxGroup,
  List,
  ImagePreview,
  RadioGroup,
  Radio,
  Image,
  Dialog,
  Tabbar,
  TabbarItem,
  Loading,
} from 'vant'

import axios from 'axios'
Vue.prototype.$axios = axios
Vue.prototype.$moment = moment

// import VConsole from 'vconsole/dist/vconsole.min.js' //import vconsole
// // todo
// let vConsole = new VConsole() // 初始化

Vue.use(Row)
  .use(Col)
  .use(CellGroup)
Vue.use(List)
Vue.use(Button)
Vue.use(NavBar)
Vue.use(Tag)
Vue.use(PullRefresh)
Vue.use(Toast)
Vue.use(Field)
Vue.use(Popup)
Vue.use(Picker)
Vue.use(RadioGroup)
Vue.use(DatetimePicker)
Vue.use(Uploader)
Vue.use(ImagePreview)
Vue.use(Icon)
Vue.use(Radio)
Vue.use(Image)
Vue.use(Cell).use(SwipeCell)
Vue.use(Checkbox).use(CheckboxGroup)
Vue.use(Divider)
Vue.use(Dialog)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Loading);

// 引入tp-js-sdk
const tp = require('tp-js-sdk')
Vue.prototype.$tp = tp
window.tp = tp
// 引入chain3
const Chain3 = require('chain3')
// const chain3 = new Chain3(new Chain3.providers.HttpProvider('http://127.0.0.1:8545'));
const chain3 = new Chain3(
  new Chain3.providers.HttpProvider('https://chain3.mytokenpocket.vip')
)
window.chain3 = chain3
window.web3 = web3
Vue.prototype.$chain3 = chain3
Vue.prototype.$contract_address = '0xe05cdda8e6ca466738d6ac51fe11ee648e3a70d4'
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

function getServerConfig() {
  return new Promise((resolve, reject) => {
    axios
      .get('./serverConfig.json')
      .then((result) => {
        // console.log(result)  // 看打印出来的结果
        let config = result.data
        // console.log(config);
        for (let key in config) {
          Vue.prototype[key] = config[key]
        }
        // console.log(Vue.prototype.baseUrl)  // 验证是否已经把属性挂在了Vue上
        resolve()
      })
      .catch((error) => {
        console.log(error)
        reject()
      })
  })
}

function isConnected() {
  console.log('tp.isConnected()=' + tp.isConnected())
  if (!tp.isConnected()) {
    Dialog.confirm({
    //   title: '提示',
      message: '请使用TokenPocket打开红包链接。',
      confirmButtonText: '前往下载',
      beforeClose,
    })
  }
  tp.getAppInfo().then(res=>{
    console.log(res);
    if(res.result){
      Vue.prototype.$system=res.data.system
    }
})
  tp.getCurrentWallet().then((res) => {
    if (res.data.blockchain != 'moac') {
      Dialog.confirm({
        // title: '提示',
        message: '请切换到moac钱包。',
        showCancelButton:false,
        confirmButtonText: '确定',
        beforeClose,
      })
    }else{
        Vue.prototype.$account = res.data.address
    }
  })
  // Dialog.confirm({
  //     title: '提示',
  //     message: '请切换moac钱包。',
  //     confirmButtonText: '确定',
  //     beforeClose,
  //   })
}
function beforeClose(action, done) {
  if (action === 'confirm') {
    setTimeout(done, 500)
    //   this.$router.push({path: })
    if (!tp.isConnected()) {
      window.open('https://www.tokenpocket.pro/', '_self')
    } else {
      tp.close()
    }
  } else {
    done()
    //   this.close();
  }
}

// getServerConfig();
isConnected()

import { URLDATA } from '@/utils/url'
Vue.prototype.baseUrl = URLDATA.baseUrl

new Vue({
  router,
  el: '#app',
  render: (h) => h(App),
})
