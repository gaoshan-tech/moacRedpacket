// <template>
//     <div class="build-container">
//         <van-row class="header">
//             <van-col span="24" style="position: fixed; z-index: 10">
//                 <van-nav-bar class="more-wrap"
//                         title="投票详情"
//                         @click-right="showMore"
//                          left-arrow
//                          @click-left="goBack"
//                 >
//                     <van-icon name="ellipsis"  slot="right"/>
//                 </van-nav-bar>
//                 <van-popup
//                         v-model="delShow"
//                         position="bottom"
//                         :style="{ height: '100px', background: '#ccc' }">
//                     <p class="more-opt-btn" @click="deleteVotes">删除</p>
//                     <p class="more-opt-btn mt-6" @click="cancelShow">取消</p>
//                 </van-popup>
//             </van-col>
//         </van-row>

//         <div class="content-container">
//             <van-pull-refresh v-model="isLoading" @refresh="onRefresh" style="z-index: 0;">
//                 <div class="vote-content-item">
//                     <van-row>
//                         <van-col span="24" class="show-vote-container">
//                             <div class="base-msg-wrap">
//                                 <div class="avator-wrap">
//                                     <img v-if="voteMsg.voteContent.createUserPic" :src="getBase64Img(voteMsg.voteContent.createUserPic) || voteMsg.voteContent.createUserPic" alt="无" @click="previewImg(getBase64Img(voteMsg.voteContent.createUserPic) || voteMsg.voteContent.createUserPic)">
//                                     <img v-else src="~@/assets/images/init.png" alt="无">
//                                 </div>
//                                 <div class="name-wrap">
//                                     <span class="nick-name-wrap db">{{voteMsg.voteContent.createUserName || '普通用户'}}</span>
//                                     <span class="show-time-wrap db">{{offsetTime(voteMsg.voteContent.createTime)}}</span>
//                                     <!--<span class="show-time-wrap db">{{voteMsg.voteContent.updateTime}}</span>-->
//                                 </div>
//                             </div>
//                             <van-tag v-if="voteMsg.voteContent.status == 3" type="primary" class="status-tag">进行中</van-tag>
//                             <van-tag v-else-if="voteMsg.voteContent.status == 4" class="status-tag">已结束</van-tag>
//                             <van-tag v-else-if="voteMsg.voteContent.status == 0" class="status-tag">未上链</van-tag>
//                             <van-tag v-else-if="voteMsg.voteContent.status == 1" class="status-tag">交易成功</van-tag>
//                             <van-tag v-else-if="voteMsg.voteContent.status == 2" class="status-tag">交易失败</van-tag>
//                             <van-tag v-else-if="voteMsg.voteContent.status == 9" class="status-tag">等待交易确认</van-tag>
//                             <a class="link-copy" @click="copyLink">复制链接</a>
//                         </van-col>
//                     </van-row>

//                     <van-row class="vote-content-wrap">
//                         <van-col span="24">
//                             <div class="vote-title-wrap">{{voteMsg.voteContent.topic}}</div>
//                             <div class="vote-title-wrap font-14">{{voteMsg.voteContent.desc}}</div>
//                         </van-col>
//                         <van-col span="24">
//                             <img v-if="voteMsg.voteContent.picUrl" :src="getBase64Img(voteMsg.voteContent.picUrl) || voteMsg.voteContent.picUrl" alt="无" class="vote-content-image" @click="previewImg(getBase64Img(voteMsg.voteContent.picUrl) || voteMsg.voteContent.picUrl)">
//                         </van-col>
//                         <van-col span="24">
//                             <van-cell-group :title="voteMsg.voteContent.limitNum === 1 ? '单选' : `多选，最多能选${voteMsg.voteContent.limitNum}条`">
//                                 <van-checkbox-group v-if="voteMsg.voteContent.limitNum !== 1" v-model="result" :max="voteMsg.voteContent.limitNum">
//                                     <van-cell-group>
//                                         <van-cell  v-for="(item, index) in voteMsg.voteOpt"
//                                                    class="checkbox-wrap"
//                                                    clickable
//                                                   :key="item.id"
//                                                   :title="item.content"
//                                                   @click="toggle(index)"
//                                         >
//                                             <van-checkbox
//                                                     :name="item.id"
//                                                     ref="checkboxes"
//                                                     slot="right-icon"

//                                             />
//                                         </van-cell>
//                                     </van-cell-group>
//                                 </van-checkbox-group>
//                                 <van-radio-group v-else v-model="result">
//                                     <van-cell-group>
//                                         <van-cell  v-for="(item, index) in voteMsg.voteOpt"
//                                                    class="checkbox-wrap"
//                                                    :title="item.content"
//                                                    lickable
//                                                    @click="result = item.id">
//                                             <van-radio slot="right-icon" :name="item.id" />
//                                         </van-cell>
//                                     </van-cell-group>
//                                 </van-radio-group>

//                             </van-cell-group>

//                         </van-col>
//                         <van-col span="24">
//                             <p class="vote-msg-wrap">
//                                 <span>截止时间：{{offsetTime(voteMsg.voteContent.endTime)}}</span>
//                                 <span v-if="voteMsg.voteContent.hash && voteMsg.voteContent.hash !== ''"><a :href="'http://explorer.moac.io/tx/' + voteMsg.voteContent.hash">查看链上记录></a></span>
//                             </p>
//                         </van-col>
//                     </van-row>

//                 </div>
//             </van-pull-refresh>
//         </div>

//         <van-row class="footer-container">
//             <van-col span="24" style="height: 100%;">
//                 <van-button type="info" style="width: 90%;" @click="handleUserVote(voteMsg.voteContent.status)" :disabled="isVote">{{voteMsg.voteContent.status == '0' ? '支付' : '投票'}}</van-button>
//             </van-col>
//         </van-row>

//     </div>
// </template>

// <script>
//     import { getVoteDetail, doVote, updateAppVoteHash, delVote, updateVoteHash } from '@/api/buite-vote';
//     import { ImagePreview } from 'vant';
//     import { debounceHign } from '@/utils/request-limit'
//     export default {
//         name: "index",
//         data() {
//             return {
//                 delShow: false,
//                 isShow: false,
//                 isLoading: false,
//                 result: [],
//                 show: false,
//                 baseUrl: this.baseUrl,
//                 // address: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
//                 address: sessionStorage.getItem('address'),
//                 voteMsg: {
//                     voteContent: [],
//                     voteOpt: [],
//                     voteUser: [],
//                     curUser: [],
//                     totalCount: 0
//                 },
//                 moacData: {
//                     gasPrice: null,
//                     gasLimit: null,
//                     toAddress: '0xabff2ebaa8a7cd5b52b4a9f444a91a8f3f033fb1'
//                 },
//                 isVote: false,
//                 isSuccess: true
//             }
//         },
//          created() {
//             if (this.$tp) {
//                 // this.initView();
//             }
//          },
//         mounted() {
//             this.initView();
//         },
//         methods: {
//             initView() {
//                 let voteAddress= '';
//                 let _chainBlock = '';
//                 this.$tp.getCurrentWallet().then(res => {
//                     if (res) {
//                         // console.log(res);
//                         voteAddress = res.data.address;
//                         this.address = voteAddress;
//                         sessionStorage.removeItem("address");
//                         sessionStorage.setItem('address', voteAddress);
//                         _chainBlock = res.data.blockchain;
//                         // console.log(voteAddress);
//                         if (_chainBlock !== 'moac') {
//                             this.$toast('当前钱包地址不是moac钱包地址，请切换moac钱包');
//                             return false;
//                         }
//                         const voteId = this.$route.query.id;
//                         // console.log(voteId);
//                         const query = {
//                             voteId: Number(voteId),
//                             address: voteAddress,
//                         }
//                         console.log(query);
//                         getVoteDetail(query).then(res => {
//                             if (res) {
//                                 const data = res.data;
//                                 if (data.vote.status == '3' && data.voteUserList.length === 0) {
//                                     this.voteMsg.voteContent = data.vote;
//                                     this.voteMsg.voteOpt = data.optionList;
//                                     this.voteMsg.voteUser = data.userList;
//                                     this.voteMsg.curUser = data.voteUserList;
//                                 } else if (data.vote.status == '4' || data.voteUserList.length || data.vote.status == '9') {
//                                     console.log('跳转到finished');
//                                     this.$router.push({path: '/vote-details-finished', query: {id: data.vote.id}})
//                                 } else if (data.vote.status == '1' || data.vote.status == '2') {
//                                     this.voteMsg.voteContent = data.vote;
//                                     this.voteMsg.voteOpt = data.optionList;
//                                     this.voteMsg.voteUser = data.userList;
//                                     this.voteMsg.curUser = data.voteUserList;
//                                     this.isVote = true;
//                                 } else if (data.vote.status == '0') {
//                                     this.voteMsg.voteContent = data.vote;
//                                     this.voteMsg.voteOpt = data.optionList;
//                                     this.voteMsg.voteUser = data.userList;
//                                     this.voteMsg.curUser = data.voteUserList;
//                                     this.isVote = false;
//                                 }
//                             }
//                         })
//                     }
//                 })

//               /*  const voteId = this.$route.query.id;
//                 console.log(voteId);
//                 const query = {
//                     voteId: Number(voteId),
//                     address: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
//                 }
//                 console.log(query);
//                 getVoteDetail(query).then(res => {
//                     if (res) {
//                         const data = res.data;
//                         if (data.vote.status == '3' && data.voteUserList.length === 0) {
//                             this.voteMsg.voteContent = data.vote;
//                             this.voteMsg.voteOpt = data.optionList;
//                             this.voteMsg.voteUser = data.userList;
//                             this.voteMsg.curUser = data.voteUserList;
//                         } else if (data.vote.status == '4' || data.voteUserList.length || data.vote.status == '9') {
//                             console.log('跳转到finished');
//                             this.$router.push({path: '/vote-details-finished', query: {id: data.vote.id}})
//                         } else if (data.vote.status == '1' || data.vote.status == '2') {
//                             this.voteMsg.voteContent = data.vote;
//                             this.voteMsg.voteOpt = data.optionList;
//                             this.voteMsg.voteUser = data.userList;
//                             this.voteMsg.curUser = data.voteUserList;
//                             this.isVote = true;
//                         } else if (data.vote.status == '0') {
//                             this.voteMsg.voteContent = data.vote;
//                             this.voteMsg.voteOpt = data.optionList;
//                             this.voteMsg.voteUser = data.userList;
//                             this.voteMsg.curUser = data.voteUserList;
//                             this.isVote = false;
//                         }
//                     }
//                 })*/
//             },
//             handleUserVote: debounceHign(function(status){
//                 console.log('status', status);
//                 if (status == '0') {
//                     const optArr = []
//                     this.voteMsg.voteOpt.map(d => {
//                         delete d.count;
//                         optArr.push(d);
//                     });
//                     let _inputData = {
//                         id: this.voteMsg.voteContent.id,
//                         topic: this.voteMsg.voteContent.topic,
//                         desc: this.voteMsg.voteContent.desc,
//                         picUrl: this.voteMsg.voteContent.picUrl,
//                         status: this.voteMsg.voteContent.status,
//                         limitNum: this.voteMsg.voteContent.limitNum,
//                         endTime: this.voteMsg.voteContent.endTime,
//                         createUser: this.voteMsg.voteContent.createUser,
//                         updateUser: this.voteMsg.voteContent.updateUser,
//                         optionList: optArr
//                     };
//                     console.log('_inputData', _inputData);
//                     let inputData = this.$chain3.toHex(JSON.stringify(_inputData)); // 字符串转成16进制
//                     const gasLimit = this.$chain3.mc.estimateGas({from: this.address, to: this.moacData.toAddress,data: inputData}) + 2100;
//                     console.log('inputData', inputData);
//                     console.log('gasLimit', gasLimit);
//                     const query = {
//                         from: this.address,
//                         to: this.moacData.toAddress,
//                         gasPrice: '0x'+ this.getGasPrice(),
//                         gasLimit: '0x'+gasLimit.toString(16),
//                         data: inputData,
//                         value: '0x0',
//                         chainId: '0x63',
//                         via: '0x',
//                         shardingFlag: '0x0',
//                     };
//                     console.log('query', query);
//                     this.$tp.sendMoacTransaction(query).then(res => {
//                         if (res) {
//                             console.log('sendMoacTransaction', res);
//                             const hash = res.data;
//                             // this.voteData.hash = hash;
//                             console.log('hash', hash);
//                             const params = {
//                                 address: this.address,
//                                 voteId: this.voteMsg.voteContent.id,
//                                 hash: hash
//                             }
//                             updateVoteHash(params).then(res => {
//                                 console.log(res);
//                                 if (res) {
//                                     this.$toast('发布成功');
//                                     this.$router.push({path: '/vote-list'});
//                                 }
//                             })
//                         }
//                     })
//                     return false;
//                 }

//                 let result = ''
//                 if(typeof this.result !== Object) {
//                     result = this.result;
//                 } else {
//                     result = this.result.join(',');
//                 }
//                 if (this.result.length === 0) return false;
//                 const query = {
//                     address: this.address,
//                     options: result,
//                     voteId: this.voteMsg.voteContent.id,
//                 };
//                 doVote(query).then(res => {
//                     console.log(res);
//                     if (res) {
//                         const resData = res.data;
//                         let inputData = this.$chain3.toHex(JSON.stringify(resData)); // 字符串转成16进制
//                         const gasLimit = this.$chain3.mc.estimateGas({from: this.address, to: this.moacData.toAddress,data: inputData}) + 2100;
//                         console.log('inputData', inputData);
//                         console.log('gasLimit', gasLimit);
//                         const query = {
//                             from: this.address,
//                             to: this.moacData.toAddress,
//                             gasPrice: '0x'+ this.getGasPrice(),
//                             gasLimit: '0x'+gasLimit.toString(16),
//                             data: inputData,
//                             value: '0x0',
//                             chainId: '0x63',
//                             via: '0x',
//                             shardingFlag: '0x0',
//                         };
//                         console.log('query', query);
//                         this.$tp.sendMoacTransaction(query).then(res => {
//                             if (res) {
//                                 // console.log('sendMoacTransaction', res);
//                                 const hash = res.data;
//                                 // this.voteData.hash = hash;
//                                 // console.log('hash', hash);
//                                 if (!res.result) {
//                                     this.$toast('上链失败，请检查余额');
//                                     return false;
//                                 }
//                                 const params = {
//                                     address: this.address,
//                                     voteId: this.voteMsg.voteContent.id,
//                                     hash: hash
//                                 }
//                                 updateAppVoteHash(params).then(res => {
//                                     if (res) {
//                                         this.$toast('投票成功，等待确认中，请稍后刷新');
//                                         this.isVote = true;
//                                     }
//                                 })
//                             }
//                         })
//                     }
//                 })
//             }, 1000),
//             goBack() {
//                 this.$router.push({path: '/vote-list'});
//             },
//             deleteVotes() {
//                 const id = {
//                     id: this.voteMsg.voteContent.id,
//                     address: this.address
//                 }
//                 delVote(id).then(res => {
//                     if (res) {
//                         this.$toast('删除成功');
//                         this.delShow = false;
//                         this.$router.push({path: '/vote-list'});
//                     }
//                 })
//             },
//             showMore() {
//                 this.delShow = true;
//             },
//             cancelShow() {
//                 this.delShow = false;
//             },
//             onRefresh() {
//                 setTimeout(() => {
//                     this.$toast('刷新成功');
//                     this.isLoading = false;
//                     this.initView();
//                 }, 500);
//             },
//             toggle(index) {
//                 this.$refs.checkboxes[index].toggle();
//             },
//             getGasPrice() {
//                 const gasPrice = this.$chain3.mc.gasPrice;
//                 return gasPrice.toString(16);
//             },
//             getBase64Img(imgUrl) {
//                 return sessionStorage.getItem(imgUrl);
//             },
//             previewImg(img) {
//                 ImagePreview({
//                     images:[img],
//                     showIndex:false,
//                     loop:false
//                 })
//             },
//             copyLink() {
//                 const input = document.createElement("input");
//                 input.value = window.location.href;
//                 document.body.appendChild(input);
//                 input.select();
//                 input.setSelectionRange(0, input.value.length), document.execCommand('Copy');
//                 document.body.removeChild(input);
//                 this.$toast.success("已复制")
//             },
//             offsetTime(time) {
//                 time = time.replace(/-/g,'/');
//                 const _time = new Date(time).getTime();
//                 const curOffset = new Date().getTimezoneOffset();
//                 const targetTime = new Date(_time - curOffset * 60 * 1000 - 8 * 60 * 60 * 1000);
//                 return this.$moment(targetTime).format('YYYY-MM-DD HH:mm:ss');
//             }
//         }
//     }
// </script>

// <style scoped>
//     .build-container {}
//     .header {
//         /*position: fixed;*/
//     }
//     .build-vote-container {
//         width: 100%;
//         height: 500px;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//         flex-wrap: wrap;
//     }
//     .img-wrap {
//         display: block;
//         width: 200px;
//         height: 200px;
//     }
//     .tips {
//         font-size: 20px;
//     }
//     .content-container {
//         margin-top: 55px;
//         margin-bottom: 70px;
//         background: #efefef;
//         font-size: 14px;
//         height: 100vh;
//     }
//     .avator-wrap {
//         /*display: block;*/
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
//         /*height: 100vh;*/
//         background: #fff;
//         margin-bottom: 70px;
//     }
//     .show-vote-container {
//         position: relative;
//     }
//     .link-copy {
//         position: absolute;
//         bottom: 9px;
//         right: 10%;
//         color: #1989fa;
//         font-size: 12px;
//     }
//     .base-msg-wrap {
//         margin-top: 10px;
//         margin-left: 15px;
//         float: left;
//     }

//     .name-wrap {
//         float: left;
//         width: 120px;
//         height: 50px;
//     }
//     .nick-name-wrap {
//         display: block;
//         line-height: 25px;
//     }
//     .status-tag {
//         float: right;
//     }
//     .vote-content-wrap {
//         padding: 10px 15px;
//     }
//     .vote-title-wrap {
//         font-size: 16px;
//         margin: 0 0 10px 0;
//     }
//     .font-14 {
//         font-size: 14px;
//     }
//     .vote-content-image {
//         width: 100%;
//         height: 200px;
//     }
//     .opt-btn {
//         height: 40px;
//         color: #1989fa;
//         font-size: 16px;
//         text-align: center;
//         line-height: 50px;
//     }
//     .footer-container {
//         position: fixed;
//         bottom: 0;
//         width: 100%;
//         height: 60px;
//         text-align: center;
//         line-height: 55px;
//     }
//     .vote-msg-wrap span {
//         display: inline-block;
//     }
//     .vote-msg-wrap span:nth-of-type(1) {
//         float: left;
//     }
//     .vote-msg-wrap span:nth-of-type(2) {
//         float: right;
//     }
//     .show-time-wrap {
//         font-size: 12px;
//         color: #666;
//     }
//     .more-opt-btn {
//         height: 47px!important;
//         font-size: 16px;
//         text-align: center;
//         background: #fff;
//         line-height: 47px;
//     }
//     .mt-6 {
//         margin-top: 6px;
//     }
// </style>
// <style>
//     .checkbox-wrap.van-cell {
//         flex-direction: row-reverse;
//         padding-left: 0;
//         padding-right: 0;
//     }
//     .checkbox-wrap.van-cell .van-cell__title {
//         padding-left: 10px;
//     }
//     .more-wrap .van-nav-bar__right .van-icon {
//         font-size: 24px;
//         font-weight: bolder;
//     }

// </style>