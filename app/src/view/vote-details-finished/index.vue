<template>
    <div class="build-container">
        <van-row class="header">
            <van-col span="24" style="position: fixed; z-index: 100">
                <van-nav-bar class="more-wrap"
                             title="投票详情"
                             @click-right="showMore"
                             left-arrow
                             @click-left="goBack"
                >
                    <van-icon name="ellipsis"  slot="right"/>
                </van-nav-bar>
                <van-popup
                        v-model="delShow"
                        position="bottom"
                        :style="{ height: '100px', background: '#ccc' }">
                    <p class="more-opt-btn" @click="deleteVotes">删除</p>
                    <p class="more-opt-btn mt-6" @click="cancelShow">取消</p>
                </van-popup>
            </van-col>
        </van-row>

        <div class="content-container">
            <van-pull-refresh v-model="isLoading" @refresh="onRefresh" style="height: 100%">
                <div class="vote-content-item">
                    <van-row>
                        <van-col span="24" class="show-vote-container">
                            <div class="base-msg-wrap">
                                <div class="avator-wrap">
                                    <img v-if="voteMsg.voteContent.createUserPic" :src="getBase64Img(voteMsg.voteContent.createUserPic) || voteMsg.voteContent.createUserPic" alt="无" @click="previewImg(getBase64Img(voteMsg.voteContent.createUserPic) || voteMsg.voteContent.createUserPic)">
                                    <img v-else src="~@/assets/images/init.png" alt="无">
                                </div>
                                <div class="name-wrap">
                                    <span class="nick-name-wrap db">{{voteMsg.voteContent.createUserName || '普通用户'}}</span>
                                    <span class="show-time-wrap db">{{offsetTime(voteMsg.voteContent.createTime)}}</span>
                                </div>
                            </div>
                            <van-tag v-if="voteMsg.voteContent.status == 3" type="primary" class="status-tag">进行中</van-tag>
                            <van-tag v-else-if="voteMsg.voteContent.status == 4" class="status-tag">已结束</van-tag>
                            <van-tag v-else-if="voteMsg.voteContent.status == 0" class="status-tag">未上链</van-tag>
                            <van-tag v-else-if="voteMsg.voteContent.status == 1" class="status-tag">交易成功</van-tag>
                            <van-tag v-else-if="voteMsg.voteContent.status == 2" class="status-tag">交易失败</van-tag>
                            <van-tag v-else-if="voteMsg.voteContent.status == 9" class="status-tag">等待交易确认</van-tag>
                            <a class="link-copy" @click="copyLink">复制链接</a>
                        </van-col>
                    </van-row>

                    <van-row class="vote-content-wrap">
                        <van-col span="24">
                            <div class="vote-title-wrap">{{voteMsg.voteContent.topic}}</div>
                            <div class="vote-title-wrap font-14">{{voteMsg.voteContent.desc}}</div>
                        </van-col>
                        <van-col span="24">
                            <img v-if="voteMsg.voteContent.picUrl" :src="getBase64Img(voteMsg.voteContent.picUrl) || voteMsg.voteContent.picUrl" alt="无" class="vote-content-image" @click="previewImg(getBase64Img(voteMsg.voteContent.picUrl) || voteMsg.voteContent.picUrl)">
                        </van-col>
                        <van-col span="24">
                            <van-cell-group :title="voteMsg.voteContent.limitNum === 1 ? '单选' : `多选，最多能选${voteMsg.voteContent.limitNum}条`">
                                <van-cell v-for="item in voteMsg.voteOpt"
                                        :icon="item.isCurUserSele ? 'success' : ''"
                                        :title="item.content"
                                        :value="item.count + '票'"
                                        :class="item.isCurUserSele ? 'options-wrap' : 'options-wrap no-icon'"
                                        :style="item.count === 0 ? '' : {background: `-webkit-linear-gradient(left, #8ec2f65c 0%, #4fa1f4 ${parseInt(item.count * 100 / voteMsg.totalCount)}%, #fff ${parseInt(item.count * 100 / voteMsg.totalCount + 1)}%)`}"
                                        @click="goDetails(item)">
                                </van-cell>
                            </van-cell-group>
                        </van-col>
                        <van-col span="24">
                            <p class="vote-msg-wrap">
                                <span>截止时间：{{offsetTime(voteMsg.voteContent.endTime)}}</span>
                                <span v-if="voteMsg.voteContent.hash && voteMsg.voteContent.hash !== ''"><a :href="'http://explorer.moac.io/tx/' + voteMsg.voteContent.hash">查看链上记录></a></span>
                            </p>
                        </van-col>
                        <van-col span="24">
                            <div class="vote-people-wrap" @click="lookPeopleDetails" v-if="voteMsg.voteUser.length">
                                <span class="img-wrap" v-for="(user, index) in voteMsg.voteUser" v-if="index < 5">
                                    <img v-if="user.picUrl != '' && user.picUrl != 'undefined'" :src="user.picUrl || require('@/assets/images/init.png')" alt="">
                                    <img v-else :src="require('@/assets/images/init.png')" alt="">
                                </span>
                                <span v-if="voteMsg.voteUser.length > 4" class="img-wrap eclipse-style">…</span>
                                <span class="img-wrap text-style">已投票</span>
                            </div>
                        </van-col>
                    </van-row>

                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script>
    import { getVoteDetail, delVote } from '@/api/buite-vote';
    import { ImagePreview } from 'vant';
    export default {
        name: "index",
        data() {
            return {
                delShow: false,
                isShow: false,
                isLoading: false,
                // address: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                address: sessionStorage.getItem('address'),
                voteMsg: {
                    voteContent: [],
                    voteOpt: [],
                    voteUser: [],
                    voteUserHash: [],
                    curUser: [],
                    totalCount: 0
                },
                baseUrl: this.baseUrl,
                voteId: ''
            }
        },
        mounted() {
            this.initView();
        },
        methods: {
            initView() {
                // console.log('现在在finish')
                let voteAddress= '';
                let _chainBlock = '';
                this.$tp.getCurrentWallet().then(res => {
                    // console.log('resdata', res.data);
                    voteAddress = res.data.address;
                    sessionStorage.removeItem("address");
                    sessionStorage.setItem('address', voteAddress);
                    _chainBlock = res.data.blockchain;
                    this.voteId = this.$route.query.id;
                    if (_chainBlock !== 'moac') {
                        this.$toast('当前钱包地址不是moac钱包地址，请切换moac钱包');
                        return false;
                    }
                    const query = {
                        voteId: Number(this.voteId),
                        address: this.address || voteAddress,
                    }
                    getVoteDetail(query).then(res => {
                        if (res) {
                            const data = res.data;
                            let total = 0;
                            this.voteMsg.voteContent = data.vote;
                            this.voteMsg.voteOpt = data.optionList;
                            this.voteMsg.voteUser = data.userList;
                            this.voteMsg.voteUserHash = data.userHashList;
                            this.voteMsg.curUser = data.voteUserList;
                            this.voteMsg.voteOpt.map(d => {
                                total += d.count;
                                this.voteMsg.curUser.map(item => {
                                    if (d.id === item.optId) {
                                        d.isCurUserSele = true;
                                    }
                                })
                            })
                            this.voteMsg.totalCount = total;
                            this.voteMsg.voteUser.map(val => {
                                // console.log(val.address);
                                this.voteMsg.voteUserHash.map(v => {
                                    if(val.address === v.address) {
                                        val.hash = v.hash;
                                        // console.log(val.address);
                                    }
                                })
                            })

                            console.log(this.voteMsg.voteUser);
                        }
                    })
                })

            },
            goBack() {
               this.$router.push({path: '/vote-list'});
            },
            onRefresh() {
                setTimeout(() => {
                    this.$toast('刷新成功');
                    this.initView();
                    this.isLoading = false;
                }, 500);
            },
            toggle(index) {
                this.$refs.checkboxes[index].toggle();
            },
            lookPeopleDetails() {
                if (!this.voteMsg.voteUser.length)  return false;
                // console.log('跳转值', this.voteMsg.voteUser);
                this.$router.push({path: '/vote-people-list', query: {str: JSON.stringify(this.voteMsg.voteUser)}});
            },
            goDetails(msg) {
                if (!msg.count) return false;
                this.$router.push({path: '/single-vote-people-list', query: {optId: msg.id, content: msg.content}});
            },
            showMore() {
                this.delShow = true;
            },
            cancelShow() {
                this.delShow = false;
            },
            deleteVotes() {
                const id = {
                    id: this.voteMsg.voteContent.id,
                    address: this.address
                }
                delVote(id).then(res => {
                    if (res) {
                        this.$toast('删除成功');
                        this.delShow = false;
                        this.$router.push({path: '/vote-list'});
                    }
                })
            },
            getBase64Img(imgUrl) {
                return sessionStorage.getItem(imgUrl);
            },
            previewImg(img) {
                ImagePreview({
                    images:[img],
                    showIndex:false,
                    loop:false
                })
            },
            copyLink() {
                const input = document.createElement("input");
                let url = window.location.href;
                url = url.replace('vote-details-finished', 'vote-details')
                input.value = url;
                // console.log('copy', input.value);
                document.body.appendChild(input);
                input.select();
                input.setSelectionRange(0, input.value.length), document.execCommand('Copy');
                document.body.removeChild(input);
                this.$toast.success("已复制")
            },
            offsetTime(time) {
                 const _time = new Date(time.replace(/-/g,'/')).getTime();
                const curOffset = new Date().getTimezoneOffset();
                // console.log(curOffset);
                const targetTime = new Date(_time - curOffset * 60 * 1000 - 8 * 60 * 60 * 1000);
                // console.log(targetTime);
                return this.$moment(targetTime).format('YYYY-MM-DD HH:mm:ss');
            }
        }
    }
</script>

<style scoped>
    .build-container {}
    .header {
        /*position: fixed;*/
    }
    .build-vote-container {
        width: 100%;
        height: 500px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
    }
    .img-wrap {
        display: block;
        width: 200px;
        height: 200px;
    }
    .tips {
        font-size: 20px;
    }
    .content-container {
        margin-top: 55px;
        background: #efefef;
        font-size: 14px;
    }
    .avator-wrap {
        /*display: block;*/
        overflow: hidden;
        float: left;
        margin-right: 10px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
    }
    .avator-wrap img {
        width: 50px;
        height: 50px;
    }
    .vote-content-item {
        background: #fff;
        height: 100vh;
        flex: 1;
        /*margin-top: 10px;*/
    }
    .show-vote-container {
        position: relative;
    }
    .link-copy {
        position: absolute;
        bottom: 9px;
        right: 10%;
        color: #1989fa;
        font-size: 12px;
    }
    .base-msg-wrap {
        margin-top: 10px;
        margin-left: 15px;
        float: left;
    }

    .name-wrap {
        float: left;
        width: 120px;
        height: 50px;
    }
    .nick-name-wrap {
        display: block;
        line-height: 25px;
    }
    .status-tag {
        float: right;
    }
    .vote-content-wrap {
        padding: 10px 15px;
    }
    .vote-title-wrap {
        font-size: 16px;
        margin: 0 0 10px 0;
    }
    .font-14 {
        font-size: 14px;
    }
    .vote-content-image {
        width: 100%;
        height: 200px;
    }
    .vote-msg-wrap span {
        display: inline-block;
        margin: 10px 0;
    }
    .vote-msg-wrap span:nth-of-type(1) {
        float: left;
    }
    .vote-msg-wrap span:nth-of-type(2) {
        float: right;
    }
    .vote-people-wrap {
        height: 60px;
        overflow: hidden;
        border: 1px solid #efefef;
        border-left: 0;
        border-right: 0;
    }
    .img-wrap {
        display: inline-block;
        overflow: hidden;
        margin-top: 10px;
        margin-right: 8px;
        width: 40px;
        height: 40px;
        border-radius: 20px;
    }
    .img-wrap img {
        width: 100%;
        height: 100%;
    }
    .eclipse-style {
        width: 30px;
        text-align: center;
        line-height: 30px;
        font-size: 20px;
        font-weight: bolder;
    }
    .text-style {
        margin-right: 0;
        width: 50px;
        line-height: 40px;
        font-size: 12px;
    }
    .show-time-wrap {
        font-size: 12px;
        color: #666;
    }
    .more-opt-btn {
        height: 47px!important;
        font-size: 16px;
        text-align: center;
        background: #fff;
        line-height: 47px;
    }
    .mt-6 {
        margin-top: 6px;
    }
</style>
<style>
    .options-wrap.van-cell {
        /*flex-direction: row-reverse;*/
        padding-left: 0;
        padding-right: 0;
        /*background: rgba(25,137,250,0.2);*/
    }
    .options-wrap.no-icon.van-cell {
        padding-left: 0.6rem;
    }
    .options-wrap.van-cell .van-cell__left-icon {
        color: #1989fa;
    }
    .procent-color-wrap {
        /*background: rgba(25,137,250,0.2);*/
    }
   /* .checkbox-wrap.van-cell .van-cell__title {
        padding-left: 10px;
    }*/
    .options-wrap .van-cell__value span {
        margin-right: 10px;
        color: #000;
    }
    .more-wrap .van-nav-bar__right .van-icon {
        font-size: 24px;
        font-weight: bolder;
    }
</style>