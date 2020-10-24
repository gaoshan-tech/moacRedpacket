<template>
    <div>
        <van-row type="flex" justify="center">
            <van-col span="24">
                <van-nav-bar title="领取详情"
                             left-text="返回"
                             @click-left="goBack"/>
            </van-col>
        </van-row>
        <van-row type="flex" class="count-wrap">
            <van-list :span="24" class="van-list-container">
                <van-cell>
                    <span class="fl" style="width: 25%;">红包类型</span>
                    <span class="fl" style="width: 25%;">总额</span>
                    <span class="fl" style="width: 25%;">余额</span>
                    <span class="fl" style="width: 25%;"></span>
                </van-cell>
                <van-cell
                        v-for="item in packetMsg"
                        :key="item.index">
                  <!--  <div class="fl list-item fl-wrap">
                        <span class="name-wrap">
                            <span class="db font_14">{{item.isRandom ? '随机红包' : '普通红包'}}</span>
                            <span class="db font_12 color_666">{{item.time}}</span>
                        </span>
                    </div>-->
                    <span class="fl font_14" style="width: 25%;">{{item.isRandom ? '随机红包' : '普通红包'}}</span>
                    <span class="fl vote-time-wrap font_14" style="width: 25%;">{{item.totalAmount}}</span>
                    <span class="fl vote-time-wrap font_14" style="width: 25%;">{{item.remainAmount}}</span>
                    <span class="fl vote-time-wrap font_14" style="width: 25%;color:dodgerblue;" @click="recyclePacket(item.id, item.owner)">收回余额</span>
                </van-cell>
            </van-list>
        </van-row>
    </div>
</template>

<script>
    export default {
        name: "index",
        data() {
            return {
                packetIds: [],
                contract: {
                    account: null,
                    instance: null,
                },
                packetMsg: []
            }
        },
        mounted() {
            this.initView();
        },
        methods: {
            /**
             * 收回未领完的过期红包
             * @returns {Promise<void>}
             */
            async recyclePacket(packetId, address) {
                console.log(packetId);
                console.log(address);
                const { recyclePacket } = this.contract.instance.methods;
                const that = this;
                await recyclePacket(packetId).send({from: address}).on('receipt', function (receipt) {
                    console.log('收回未领完的过期红包', receipt);
                }).on('error', function(error) {
                    that.$toast(error.message);
                })
            },
            async getPacketMsg(packetId) {
                const networkId = await this.$Web3.eth.net.getId();
                const deployedNetwork = this.$RedPacketArtifact.networks[networkId];
                const account = await this.$Web3.eth.getAccounts();
                this.contract.account = account[0];
                this.contract.instance = new this.$Web3.eth.Contract(
                    this.$RedPacketArtifact.abi,
                    deployedNetwork.address,
                );
                const {queryPacketInfo} = this.contract.instance.methods;
                const that = this;
                await queryPacketInfo(packetId).call().then(res => {
                    // console.log('获取红包基本信息', res);
                    let item = {
                        isRandom: res.isRandom,
                        description: res.description,
                        startTime: res.startTime,
                        remainAmount: res.remainAmount,
                        totalAmount: res.totalAmount,
                        owner: res.owner,
                        id: res.id,
                        remainNumber: res.remainNumber,
                        totalnumber: res.totalnumber
                    }
                    that.packetMsg.push(item)
                })
            },
            initView() {
                this.packetIds = this.$route.query.packetIds.split(',');
                for (let i = 0; i < this.packetIds.length; i++) {
                    this.getPacketMsg(this.packetIds[i]);
                }
                console.log(this.packetMsg);
            },
            goBack() {
                history.go(-1);
            }
        }
    }
</script>

<style scoped lang="less">
    .count-wrap {
        font-size: 14px;
        flex-wrap: wrap;
    .van-list-container {
        width: 100%;
    }
    }
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

    .name-wrap {
        line-height: 20px;
        /*width: 100px;*/
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .vote-time-wrap {
        display: block;
    }
</style>