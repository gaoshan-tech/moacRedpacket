<template>
    <div>
       <!-- <van-row type="flex" justify="center">
            <van-col span="24">
                <van-nav-bar title="领取详情"
                             right-text="我的红包记录"
                             @click-right="getPersonalPacket"/>
            </van-col>
        </van-row>-->

        <van-row type="flex" justify="center" class="container">
            <van-col span="24" class="packet-image"></van-col>
        </van-row>

        <van-row type="flex" justify="center" class="packet-amount-content">
            <van-col class="packet-content">{{msg.formAddress | handleStr}}的红包</van-col>
            <!--<van-col class="packet-content">{{msg.amount}}</van-col>-->
        </van-row>

        <van-row type="flex" justify="center" class="mt_20 packet-amount-msg">
            <van-col class="packet-amount">{{msg.amount}}</van-col>
        </van-row>

        <van-row type="flex" justify="center" class="packet-amount-msg">
            <van-col class="packet-amount-text">已存入钱包</van-col>
            <van-col :span="24" class="packet-amount-text" style="text-align: center" @click="recyclePacket">收回过期红包</van-col>
        </van-row>
        <!--<van-divider />-->
        <van-row type="flex" justify="center" class="packet-amount-msg">
            <van-col :span="24" class="gap-style mt_10"></van-col>
        </van-row>
        <van-row type="flex" class="count-wrap">
            <van-list :span="24" class="van-list-container">
                <van-cell>
                    <span class="fl">已领取 {{msg.ReceivedNumber}} / {{msg.totalNumber}}</span>
                    <span class="fr" style="color:dodgerblue;" @click="getPersonalPacket">我的红包记录</span>
                </van-cell>
                <van-cell
                        v-for="item in msg.list"
                        :key="item.index">
                    <div class="fl list-item fl-wrap">
                        <span class="vote-img-wrap">
                            <!--<img v-if="item.pic && item.pic !== ''" :src="item.pic">-->
                            <img src="~@/assets/images/init.png" alt="">
                        </span>
                        <span class="name-wrap">
                            <span class="db font_14">{{item.account | handleStr}}</span>
                            <span class="db font_12 color_666">{{item.time}}</span>
                        </span>

                    </div>
                    <div class="fr list-item fr-wrap">
                        <span class="vote-time-wrap font_14">{{item.amount}}</span>
                    </div>
                </van-cell>
            </van-list>
        </van-row>

    </div>
</template>

<script>
    import {BigNumber} from 'bignumber.js';
    export default {
        name: "index",
        data() {
            return {
                msg: {
                    formAddress: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                    amount: '0.01',
                    totalNumber: null,
                    ReceivedNumber: null,
                    remainNumber: null,
                   /* list: [
                        {
                            toAddress: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                            amount: '100',
                            time: '10:00'
                        },
                        {
                            toAddress: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                            amount: '100',
                            time: '10:00'
                        },
                        {
                            toAddress: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                            amount: '100',
                            time: '10:00'
                        },
                        {
                            toAddress: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                            amount: '100',
                            time: '10:00'
                        },
                        {
                            toAddress: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                            amount: '100',
                            time: '10:00'
                        },
                        {
                            toAddress: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                            amount: '100',
                            time: '10:00'
                        },
                        {
                            toAddress: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                            amount: '100',
                            time: '10:00'
                        }
                    ],*/
                   list: [],
                    packetIds: []
                },
                showFormAddress: '',
                qrCode: {
                    packetId: null,
                    key: null,
                    sign: null
                },
                contract: {
                    account: null,
                    instance: null
                }

            }
        },
        created() {
            this.initInstance();
            this.getPacketId();
        },
        mounted() {
            this.initView();
            this.receivePacket();
            this.queryOwnedRedPacket();
        },
        methods: {
            async initInstance() {
                // web3获取合约实例
                const networkId = await this.$Web3.eth.net.getId();
                const deployedNetwork = this.$RedPacketArtifact.networks[networkId];
                const account = await this.$Web3.eth.getAccounts()
                this.contract.account = account[0]
                this.contract.instance = new this.$Web3.eth.Contract(
                    this.$RedPacketArtifact.abi,
                    deployedNetwork.address,
                );
                console.log(this.contract.instance);
            },
            initView() {
                if (this.msg.formAddress.length > 12) {
                    const str1 = this.msg.formAddress.substring(0, 6)
                    const str2 = this.msg.formAddress.substr(this.msg.formAddress.length - 6, 6);
                    const subStr = str1 + '****' + str2
                    this.showFormAddress = subStr;
                } else {
                    this.showFormAddress = this.msg.formAddress
                }
            },
            getPacketId() {
                this.qrCode.packetId = this.$route.query.packetId;
                this.qrCode.sign = this.$route.query.sign;
                // this.qrCode.key = this.$route.query.key;
                this.getPacketMsg(this.qrCode.packetId);

            },
            /**
             * 领取红包
             * @returns {Promise<void>}
             */
            async receivePacket() {
                /**
                 *  uint256 packetId,
                 *  bytes memory sign
                 */
                    // web3获取合约实例
                const networkId = await this.$Web3.eth.net.getId();
                const deployedNetwork = this.$RedPacketArtifact.networks[networkId];
                const account = await this.$Web3.eth.getAccounts()
                this.contract.account = account[0]
                this.contract.instance = new this.$Web3.eth.Contract(
                    this.$RedPacketArtifact.abi,
                    deployedNetwork.address,
                );
                const that = this;
                const { receiveRedPacket } = this.contract.instance.methods;
                this.qrCode.sign = '0x' + this.qrCode.sign;
                const big_packetId = new BigNumber(this.qrCode.packetId);
                console.log('领取红包big_packetId', big_packetId);
                console.log('领取红包sign', this.qrCode.sign);
                await receiveRedPacket(big_packetId, this.qrCode.sign).send({from: this.contract.account}).then(function(receipt){
                    console.log('领取红包', receipt);
                }) .catch(function(error){
                    console.log(error);
                })
            },
            /**
             * 获取红包领取详情
             * uint256 packetId, uint256 addressArraryIndex
             * @returns {Promise<void>}
             */
            async getPacketDetails(addressArraryIndex) {
                // web3获取合约实例
                const networkId = await this.$Web3.eth.net.getId();
                const deployedNetwork = this.$RedPacketArtifact.networks[networkId];
                const account = await this.$Web3.eth.getAccounts()
                this.contract.account = account[0]
                this.contract.instance = new this.$Web3.eth.Contract(
                    this.$RedPacketArtifact.abi,
                    deployedNetwork.address,
                );
                const that = this;
                const { queryPacketDetails } = this.contract.instance.methods;
                await queryPacketDetails(this.qrCode.packetId, addressArraryIndex).call().then(function(res) {
                    console.log('获取红包领取详情', res);
                    that.msg.list.push({
                        amount: res.amount,
                        account: res.account
                    })

                })
            },
            /**
             * 获取红包基本信息
             * @returns {Promise<void>}
             */
            async getPacketMsg(packetId) {
                const networkId = await this.$Web3.eth.net.getId();
                const deployedNetwork = this.$RedPacketArtifact.networks[networkId];
                const account = await this.$Web3.eth.getAccounts()
                this.contract.account = account[0]
                this.contract.instance = new this.$Web3.eth.Contract(
                    this.$RedPacketArtifact.abi,
                    deployedNetwork.address,
                );
                const { queryPacketInfo } = this.contract.instance.methods;
                const that = this;
                await queryPacketInfo(packetId).call().then(res => {
                    console.log('获取红包基本信息', res);
                    that.msg.formAddress = res.owner;
                    that.msg.remainNumber = res.remainNumber;
                    that.msg.totalNumber = res.totalnumber;
                    that.msg.ReceivedNumber = Number(that.msg.totalNumber) - Number(that.msg.remainNumber);
                })
                // 遍历获取领取详情
                if (this.msg.ReceivedNumber > 0) {
                    for (let i = 0; i < this.msg.ReceivedNumber; i++) {
                        this.getPacketDetails(i);
                    }
                }
            },
            /**
             * 收回未领完的过期红包
             * @returns {Promise<void>}
             */
            async recyclePacket() {
                const { recyclePacket } = this.contract.instance.methods;
                const that = this;
                await recyclePacket(this.qrCode.packetId).send({from: this.msg.formAddress}).on('receipt', function (receipt) {
                    console.log('收回未领完的过期红包', receipt);
                }).on('error', function(error) {
                    that.$toast(error.message);
                })
            },
            /**
             * 获取个人已发送的红包
             * @returns {Promise<void>}
             */
            async queryOwnedRedPacket() {
                // web3获取合约实例
                const networkId = await this.$Web3.eth.net.getId();
                const deployedNetwork = this.$RedPacketArtifact.networks[networkId];
                const account = await this.$Web3.eth.getAccounts()
                this.contract.account = account[0]
                this.contract.instance = new this.$Web3.eth.Contract(
                    this.$RedPacketArtifact.abi,
                    deployedNetwork.address,
                );
                const that = this;
                const { queryOwnedRedPacket } = this.contract.instance.methods;
                await queryOwnedRedPacket().call().then(function (receipt) {
                    // console.log('获取个人已发送的红包', receipt);
                    that.msg.packetIds = receipt;
                }).catch(function (error) {
                    console.log(error);
                })
            },
            getPersonalPacket() {
               /* for(let i = 0; i < this.msg.packetIds.length; i++) {
                    this.getPacketMsg(this.msg.packetIds[i], true);
                }*/
                this.$router.push({path: '/personal-packets', query: {packetIds: this.msg.packetIds.join(',')}});
            }
        },
        filters: {
            handleStr(str) {
                if (str.length > 12) {
                    const str1 = str.substring(0, 4);
                    const str2 = str.substr(str.length - 4, 4);
                    const _subStr = str1 + '****' + str2;
                    return _subStr;
                } else {
                    return str;
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .bg-style {
        background: #efefef;
    }
    .color_fff {
        background: #fff;
    }
    .mt_30 {
        margin-top: 30px;
    }
    .mt_20 {
        margin-top: 20px;
    }
    .mt_10 {
        margin-top: 10px;
    }
    .container {
        position: relative;
        background: #fff;
        .packet-image {
            z-index: 99;
            position: fixed;
            top: -66px;
            width: 107%;
            height: 200px;
            border-radius: 0 0 220px 220px;
            background: #E80B0B;
        }
    }
    .packet-amount-content {
        margin-top: 180px;
        flex-wrap: wrap;
        .packet-content {
            font-size: 14px;
        }
    }
    .packet-amount-msg {
        color: #CC8B21;
        flex-wrap: wrap;
        .packet-amount {
            font-size: 48px;
            font-weight: bold;
        }
        .packet-amount-text {
            font-size: 14px;
        }
        .gap-style {
            height: 10px;
            background: #efefef;
        }
    }
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
        line-height: 20px;
        width: 100px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .vote-time-wrap {
        display: block;
    }
</style>