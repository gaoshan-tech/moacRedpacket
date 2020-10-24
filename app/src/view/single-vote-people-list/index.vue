<template>
    <div class="build-container">
        <van-row class="header">
            <van-col span="24" style="position: fixed;">
                <van-nav-bar
                        title="查看选项"
                />
               <!-- left-arrow
                @click-left="goBack"-->
            </van-col>
        </van-row>

        <van-row class="content-container">
            <van-col span="24" class="vote-content-container">
                <div class="vote-content">{{content}}</div>
                <p class="people-num-wrap">共有{{list.length}}人选此项</p>
            </van-col>
            <van-list span="24"
                    v-model="loading"
                    :error.sync="error"
                      :finished="finished"
                    error-text="请求失败，点击重新加载"
                    @load="onLoad"
            >
                <van-cell
                        v-for="item in list"
                        :key="item.index">
                    <div class="fl list-item fl-wrap">
                        <span class="vote-img-wrap">
                            <img v-if="item.pic && item.pic !== ''" :src="getBase64Img(item.pic) || item.pic" alt="wu">
                            <img v-else src="~@/assets/images/init.png" alt="wu">
                        </span>
                        <span class="name-wrap">{{item.userName}}</span>
                    </div>
                    <div class="fr list-item fr-wrap">
                        <span class="vote-time-wrap">{{offsetTime(item.voteTime)}}</span>
                        <span v-if="item.hash && item.hash !== ''"><a :href="'http://explorer.moac.io/tx/' + item.hash">查看链上记录></a></span>
                    </div>
                </van-cell>
            </van-list>
        </van-row>

    </div>
</template>

<script>
    import { getVoteOptionDetail } from '@/api/buite-vote';
    export default {
        name: "index",
        data() {
            return {
                list: [],
                content: '',
                error: false,
                loading: false,
                finished: false,
            }
        },
        mounted() {
            // this.initView()
        },
        methods: {
            initView() {
                const optId = {
                    optionId: this.$route.query.optId
                };
                this.content = this.$route.query.content
                getVoteOptionDetail(optId).then( res => {
                    console.log(res);
                    if (res) {
                        this.list = res.data;
                        this.finished = true;
                    }
                })
            },
            goBack() {
                history.back(-1);
            },
            onLoad() {
                // 异步更新数据
                // 加载状态结束
                this.initView();
                this.loading = false;
            },
            getBase64Img(imgUrl) {
                return sessionStorage.getItem(imgUrl);
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
    .content-container {
        padding: 10px 15px;
        margin-top: 55px;
        font-size: 14px;
    }
    .vote-content {
        font-size: 16px;
        padding: 10px 0;
    }
    .people-num-wrap {
        font-size: 12px;
        line-height: 30px;
    }
    .list-item {
       margin-top: 10px;
    }
    .fl-wrap {
        display: flex;
        align-items: center;
    }
    .fr-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .list-item span {
        margin-right: 10px;
    }
    .vote-img-wrap {
        width: 40px;
        height: 40px;
        display: inline-block;
        overflow: hidden;
        border-radius: 50%;
    }
    .vote-img-wrap img {
        width: 100%;
        height: 100%;
        display: block;
    }
    .name-wrap {
    line-height: 40px;
        width: 100px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
}
    .vote-time-wrap {
        display: block;
    }
</style>