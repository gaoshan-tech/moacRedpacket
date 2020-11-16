// <template>
//     <div class="build-container">
//         <van-row>
//             <van-col span="24" style="position: fixed; z-index: 10">
//                 <van-nav-bar
//                         title="发布投票"
//                         right-text="发布"
//                         @click-right="handleBuildVote"
//                 />
//                 <!--left-arrow
//                 @click-left="goBack"-->
//             </van-col>
//         </van-row>

//         <div class="content-container">
//             <div class="vote-content-item">
//                 <van-row>
//                     <van-col span="24" class="vote-content-container">
//                         <van-cell-group>
//                             <van-field maxlength="80" size="large" clearable rows="1"
//                                        autosize type="textarea"
//                                        :error="error.topicError"
//                                        @focus="error.topicError = false"
//                                        v-model="formData.topic" placeholder="请输入投票主题，2-80字" />
//                             <van-field maxlength="80" size="large" clearable rows="1"
//                                        autosize type="textarea"
//                                        :error="error.descError"
//                                        @focus="error.descError = false"
//                                        v-model="formData.desc" placeholder="请输入描述信息，2-80字" />
//                         </van-cell-group>
//                     </van-col>
//                 </van-row>

//                 <van-row class="vote-options-wrap">
//                     <van-col span="24">
//                         <van-cell-group ref="cellGroup">
//                             <van-field maxlength="40" :error="error.opt1"  @focus="error.opt1 = false"
//                                        clearable class="basic-opt-style" v-model="voteContent1" placeholder="请输入选项1" />
//                             <van-field maxlength="40" :error="error.opt2" @focus="error.opt2 = false"
//                                        clearable class="basic-opt-style" v-model="voteContent2" placeholder="请输入选项2" />
//                             <van-swipe-cell ref="switchBlock" v-for="item in fieldArray" class="swipe-container-style">
//                                 <van-field maxlength="40" clearable
//                                            left-icon="delete"
//                                            v-model="voteContent.peers[item.index - 3]"
//                                            @click-left-icon="deleteOption(item.index)"
//                                            :placeholder="`请输入选项${item.index}`"/>
//                                 <template slot="right">
//                                     <van-button square
//                                                 type="danger"
//                                                 text="删除"
//                                                 @click="deleteOption(item.index)"/>
//                                 </template>
//                             </van-swipe-cell>
//                             <van-field disabled
//                                        left-icon="add"
//                                        placeholder="添加选项"
//                                        @click-left-icon="addOptions"/>
//                         </van-cell-group>
//                     </van-col>
//                 </van-row>
//             </div>
//             <van-row>
//                 <p class="option-tips">最多支持99个选项，每个选项不超过40字</p>
//             </van-row>

//             <div class="option-setting-container">
//                 <van-cell-group>
//                     <van-cell title="投票类型" :value="numLimit" is-link @click="setVoteMethod"/>
//                     <van-cell title="结束时间" :value="$moment(initEndTime).format('YYYY-MM-DD HH:mm')" is-link @click="setVoteDate"/>
//                 </van-cell-group>
//                <!-- <van-row>
//                     <p class="option-tips">结束时间为n个时间区块截止的预计时间</p>
//                 </van-row>-->
//                 <van-popup
//                         v-model="showSeleDate"
//                         :overlay="false"
//                         position="bottom"
//                         safe-area-inset-bottom
//                         class="popup-wrap"
//                         :style="{ background: '#ccc' }"
//                 >
//                     <van-datetime-picker
//                             v-model="initEndTime"
//                             type="datetime"
//                             :min-date="minDate"
//                             :formatter="formatter"
//                             @change="getColumnValue"
//                             @confirm="confirmVoteTimeWrap"
//                             @cancel="closeVoteTimeWrap"
//                     />
//                 </van-popup>
//                 <van-popup
//                         v-model="showSele"
//                         :overlay="false"
//                         position="bottom"
//                         safe-area-inset-bottom
//                         class="popup-wrap"
//                         :style="{ background: '#ccc' }"
//                 >
//                     <van-picker
//                             show-toolbar
//                             :columns="columns"
//                             @change="onChange"
//                             @confirm="confirmVoteTypeWrap"
//                             @cancel="closeVoteTypeWrap"
//                             style="background: #efefef"/>
//                 </van-popup>
//             </div>

//             <div class="upload-img">
//                 <van-cell-group>
//                     <van-cell title="图片" class="upload-img-wrap">
//                         <!--<van-uploader v-model="fileList" :max-count="1"-->
//                                       <!--capture-->
//                                       <!--:after-read="afterRead"/>-->
//                         <div class="uploader_box">
//                             <van-icon name="plus" class="icon-style"/>
//                             <input type="file" id="logimg"  accept="image/*"  @change="onRead"  icon="plus"/>
//                             <img class='camera-icon' :src="imgUrl" v-if="imgUrl && imgUrl !== ''"/>
//                             <van-icon name="clear"  class="clear-style" v-if="imgUrl && imgUrl !== ''" @click="clearImg"/>
//                         </div>
//                     </van-cell>
//                 </van-cell-group>
//                 <van-row>
//                     <p class="option-tips">可上传一张和图片主题相关的图片</p>
//                 </van-row>
//             </div>
//         </div>

//     </div>
// </template>

// <script>
//     import { createVote, updateVoteHash } from '@/api/buite-vote';
//     import axios from 'axios';
//     import { debounceHign } from '@/utils/request-limit'
//     export default {
//         name: "index",
//         data() {
//             return {
//                 formData: {
//                     // address: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
//                     address: sessionStorage.getItem('address'),
//                     optionJson : '',
//                     desc: '',  //投票描述
//                     topic: '', // 投票主题
//                     picUrl : '', // 投票图片url
//                     limitNum: '1', // 投票限制多选数量，单选则为1
//                     endTime: new Date() , // 投票结束时间
//                 },
//                 initEndTime: (new Date()).setTime((new Date()).getTime()+24*60*60*1000),
//                 initSeleValue: '单选',
//                 numLimit: '单选',
//                 initSeleTime: (new Date()).setTime((new Date()).getTime()+24*60*60*1000).toString(),
//                 fieldArray: [],
//                 showSele: false,
//                 showSeleDate: false,
//                 initColumns: ['单选', '多选，最多2项'],
//                 columnsArr: [],
//                 columns: ['单选', '多选，最多2项'],
//                 minHour: 10,
//                 maxHour: 20,
//                 minDate: new Date(),
//                 // maxDate: new Date(2019, 10, 1),
//                 currentDate: new Date(),
//                 fileList: [],
//                 voteContent1: '',
//                 voteContent2: '',
//                 voteContent: {
//                     peers: []
//                 },
//                 moacData: {
//                     gasPrice: null,
//                     gasLimit: null,
//                     toAddress: '0xabff2ebaa8a7cd5b52b4a9f444a91a8f3f033fb1'
//                 },
//                 voteData: {
//                     voteId: '',
//                     hash: ''
//                 },
//                 error: {
//                     topicError: false,
//                     descError: false,
//                     opt1: false,
//                     opt2: false
//                 },
//                 isSuccess: true,
//                 imgUrl: ''
//             }
//         },
//         mounted() {
//             this.getGasPrice();
//             this.getSystem();
//         },
//         methods: {
//             getSystem() {
//                 this.$tp.getAppInfo().then(res => {
//                     if (res) {
//                         // console.log(res.data.system);
//                         const sys = res.data.system;
//                         return sys;
//                     }
//                 })
//             },
//             getGasPrice() {
//                 const gasPrice = this.$chain3.mc.gasPrice;
//                 this.moacData.gasPrice = gasPrice;
//                 return gasPrice.toString();
//                 // console.log(gasPrice.toString()); // "10000000000000"
//             },
//             onChange(picker, value, index) {
//                 // this.$toast(`当前值：${value}, 当前索引：${index}`);
//                 this.numLimit = value;
//                 this.formData.limitNum = index + 1
//             },
//             getColumnValue(index) {
//                 // console.log(index);
//             },
//             formatter(type, value) {
//                 if (type === 'year') {
//                     return `${value}年`;
//                 } else if (type === 'month') {
//                     return `${value}月`
//                 } else if (type === 'day') {
//                     return `${value}日`
//                 }else if (type === 'hour') {
//                     return `${value}时`
//                 }else if (type === 'minute') {
//                     return `${value}分`
//                 }
//                 return value;
//             },
//             goBack() {
//                 history.back(-1);
//             },
//             // todo 发布投票
//             handleBuildVote: debounceHign(function(){
//                 // console.log(this.formData);
//                 let flag = true;
//                 if (this.formData.topic.trim() === '' || this.formData.topic.trim().length === 1) {
//                     this.error.topicError = true;
//                     this.$toast('主题或描述不得少于2个字');
//                     flag = false;
//                 }
//                 if (this.formData.desc.trim() === '' || this.formData.desc.trim().length === 1) {
//                     this.error.descError = true;
//                     this.$toast('主题或描述不得少于2个字');
//                     flag = false;
//                 }
//                 if (this.voteContent1.trim() === '') {
//                     this.error.opt1 = true;
//                     flag = false;
//                 }
//                 if (this.voteContent2.trim() === '') {
//                     this.error.opt2 = true;
//                     flag = false;
//                 }
//                 if (!flag) return false;
//                 let _arr = _arr = [
//                     {
//                         index: 1,
//                         content: this.voteContent1
//                     },
//                     {
//                         index: 2,
//                         content: this.voteContent2
//                     },
//                 ];
//                 this.voteContent.peers.forEach((d, index) => {
//                     if (d.trim() !== '') {
//                         let item = {
//                             index: index + 3,
//                             content: d
//                         }
//                         _arr.push(item);
//                     }
//                 });
//                 this.formData.optionJson = JSON.stringify(_arr);
//                 // 不管在什么时区，都转成东八区
//                 const timezone = 8; //目标时区时间，东八区
//                 // console.log(this.initEndTime);
//                 const offset = new Date(this.initEndTime).getTimezoneOffset();
//                 const nowDate = new Date(this.initEndTime).getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
//                 const targetDate = new Date(nowDate + offset * 60 * 1000 + timezone * 60 * 60 * 1000);

//                 this.formData.endTime = this.$moment(targetDate).format('YYYY-MM-DD HH:mm:ss');
//                 console.log('create-params', this.formData);
//                 createVote(this.formData).then(res => {
//                     if (res) {
//                         // console.log(res);
//                         const resData = res.data;
//                         const inputData = this.$chain3.toHex(JSON.stringify(resData)); // 字符串转成16进制
//                         const gasLimit = this.$chain3.mc.estimateGas({from: this.formData.address,to: this.moacData.toAddress,data: inputData}) + 2100;
//                         this.moacData.gasLimit = gasLimit;
//                         this.voteData.voteId = resData.id;
//                         const query = {
//                             from: this.formData.address,
//                             to: this.moacData.toAddress,
//                             gasPrice: '0x'+this.moacData.gasPrice.toString(16),
//                             gasLimit: '0x'+gasLimit.toString(16),
//                             data: inputData,
//                             value: '0x0',
//                             // value: '0x01',
//                             chainId: '0x63',
//                             via: '0x',
//                             shardingFlag: '0x0',
//                         };
//                         // console.log('query', query);
//                         this.$tp.sendMoacTransaction(query).then(res => {
//                             if (res) {
//                                 // console.log('sendMoacTransaction', res);
//                                 const hash = res.data;
//                                 this.voteData.hash = hash;
//                                 // console.log('hash', hash);
//                                 const params = {
//                                     address: this.formData.address,
//                                     voteId: this.voteData.voteId,
//                                     hash: this.voteData.hash
//                                 }
//                                 updateVoteHash(params).then(res => {
//                                     // console.log(res);
//                                     if (res) {
//                                         this.$toast('发布成功');
//                                         this.$router.push({path: '/vote-list'});
//                                     }
//                                 })
//                             }
//                         })
//                     }
//                 }).then(() => {
//                 })
//             }, 1000),
//             updateVoteHash() {

//             },
//             addOptions() {
//                 if (this.fieldArray.length === 97) {
//                     this.$toast('最多不能超过99个选项')
//                     return false;
//                 }
//                 const item = {
//                     index: this.fieldArray.length + 3
//                 }
//                 this.voteContent.peers.push('');
//                 const columnsItem = `多选，最多${item.index}项`;
//                 this.fieldArray.push(item);
//                 this.columnsArr.push(columnsItem);
//                 this.columns = [...this.initColumns, ...this.columnsArr];
//             },
//             deleteOption(index) {
//                 // console.log('index', index);
//                 this.voteContent.peers.splice(index - 3, 1);
//                 let newData = [];
//                 let i = 2;
//                 this.columnsArr = [];
//                 this.fieldArray.map(d => {
//                     if (d.index !== index) {
//                         ++i;
//                         const item = {
//                             index: i
//                         };
//                         const columnsItem = `多选，最多${item.index}项`;
//                         newData.push(item);
//                         this.columnsArr.push(columnsItem);
//                     }
//                 })
//                 this.fieldArray = newData;
//                 this.columns = [...this.initColumns, ...this.columnsArr];
//             },
//             setVoteMethod() {
//                 this.showSele = true;
//             },
//             closeVoteTypeWrap() {
//                 this.numLimit= this.initSeleValue;
//                 this.formData.limitNum= 1;
//                 this.showSele = false;
//             },
//             confirmVoteTypeWrap() {
//                 this.showSele = false;
//             },
//             setVoteDate() {
//                 this.showSeleDate = true;
//             },
//             confirmVoteTimeWrap() {
//                 this.showSeleDate = false;
//             },
//             closeVoteTimeWrap() {
//                 this.formData.endTime = this.initSeleTime;
//                 this.showSeleDate = false;
//             },
//             afterRead(file) {
//                 // 此时可以自行将文件上传至服务器
//                 let params = new FormData(); //创建form对象
//                 params.append("img", file.file); //通过append向form对象添加数据//第一个参数字符串可以填任意命名，第二个根据对象属性来找到file
//                 let config = {
//                     headers: { //添加请求头
//                         "Content-Type": "multipart/form-data"
//                     }
//                 };
//                 let url = `${this.baseUrl}/vote/app/uploadImage`;
//                 axios.post(url, params, config).then(res => {
//                     if (res) {
//                         this.formData.picUrl = res.data.data;
//                     }
//                 }).catch(err => {
//                     console.log(err)
//                 });
//             },
//             onRead:function () {
//                 let that = this;
//                 let file = document.getElementById('logimg').files[0];
//                 let reader = new FileReader();
//                 reader.readAsDataURL(file);
//                 reader.onload = function () {
//                     let content = this.result; //图片的src
//                     let img = new Image();
//                     img.src = content;
//                     img.setAttribute('crossOrigin', 'Anonymous');

//                     img.onload = function () {
//                         let formData = new FormData();
//                         formData.append("img", file, file.name);
//                         that.uploadImg(formData);
//                     }
//                 }
//             },
//             uploadImg:function(formData){
//                 let that=this;
//                 const instance=axios.create({ withCredentials: true})
//                 let config = { headers: { "Content-Type": "multipart/form-data" }};
//                 instance.post(`${this.baseUrl}/vote/app/uploadImage`,formData,config).then(res => {
//                     //后续其他操作
//                     if (res) {
//                         this.imgUrl = res.data.data;
//                         this.formData.picUrl = res.data.data;
//                     }
//                 });
//             },
//             clearImg() {
//                 this.imgUrl = '';
//                 this.formData.picUrl = '';
//             }
//         }
//     }
// </script>

// <style scoped>
//     .content-container {
//         margin-top: 55px;
//         background: #efefef;
//         font-size: 14px;
//     }
//     .avator-wrap {
//         overflow: hidden;
//         float: left;
//         margin-right: 10px;
//         width: 50px;
//         height: 50px;
//         border-radius: 50%;
//     }
//     .avator-wrap img {
//         width: 50px;
//         height: 50px;
//     }
//     .vote-content-item {
//         background: #fff;
//         /*margin-top: 10px;*/
//     }
//     .show-vote-container {
//     }
//     .base-msg-wrap {
//         margin-top: 10px;
//         margin-left: 15px;
//         float: left;
//     }

//     .name-wrap {
//         float: left;
//         width: 100px;
//         height: 50px;
//     }
//     .nick-name-wrap {
//         display: block;
//         line-height: 25px;
//     }
//     .status-tag {
//         float: right;
//     }
//     .vote-options-wrap {
//         padding: 10px 15px;
//     }
//     .vote-title-wrap {
//         font-size: 20px;
//         margin: 0 0 10px 0;
//     }
//     .vote-content-image {
//         width: 100%;
//     }
//     .opt-btn {
//         height: 40px;
//         color: #1989fa;
//         font-size: 18px;
//         text-align: center;
//         line-height: 50px;
//     }
//     .option-tips {
//         padding-left: 20px;
//         height: 40px;
//         line-height: 30px;
//         background: #efefef;
//         color: #565656;
//     }
//     .popup-wrap {
//         height: 245px;
//     }
//     .close-opt-style {
//         padding: 2px 10px;
//         height: 40px;
//         line-height: 40px;
//         text-align: right;
//     }
//     .uploader_box{
//         /*width:100%;*/
//         margin-top: 10px;
//         height: auto;
//         overflow: hidden;
//         position: relative;
//         border: 1px dotted #ccc;
//         width: 60px;
//         height: 60px;
//         margin-left: 80px;
//         display: flex;
//         align-items: center;
//     }
//     .icon-style {
//         font-size: 30px;
//         text-align: center;
//         margin-left: 14px;
//     }
//     #logimg{
//         position: absolute;
//         top:0;
//         left:0;
//         width:100%;
//         height:100%;
//         opacity:0;
//         z-index: 100;
//     }
//     .camera-icon{
//         /*width:100%;*/
//         /*height:auto;*/
//         width: 60px;
//         height: 60px;
//         position: absolute;
//         z-index: 0;
//     }
//     .clear-style {
//         position: absolute;
//         right: 0px;
//         top: 0px;
//         z-index: 999;
//         color: red;
//     }
// </style>
// <style>
//     .basic-opt-style input {
//         padding-left: 20px;
//     }
//     .swipe-container-style{
//         /*border-bottom: 0;*/
//     }
//     .van-picker {
//         background: #efefef;
//     }
//     .upload-img-wrap .van-cell__title span{
//         line-height: 6;
//     }
//     .van-icon-delete:before {
//         color: red;
//     }
// </style>