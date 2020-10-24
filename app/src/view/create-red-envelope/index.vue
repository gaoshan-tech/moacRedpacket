<template>
    <div>
         <van-row type="flex" justify="center">
             <van-col span="24">
                 <van-nav-bar title="发红包"
                              left-text="取消"
                              @click-left="handleCancel"/>
             </van-col>
         </van-row>

        <van-row type="flex" justify="center" class="container mt_30">
            <van-col span="22">
                <van-field v-if="packet.isRandom" v-model="packet.amount" label="总金额"  placeholder="0.00" input-align="right"/>
                <van-field v-else v-model="packet.amount" label="单个金额"  placeholder="0.00" input-align="right"/>
                <p v-if="packet.isRandom" class="des-text-style">当前为拼手气红包，<span @click="typeChange(0)">改为普通红包</span></p>
                <p v-else class="des-text-style">当前为普通红包，<span @click="typeChange(1)">改为拼手气红包</span></p>
            </van-col>
        </van-row>

        <van-row type="flex" justify="center" class="mt_10">
            <van-col span="22">
                <van-field v-model="packet.total" label="红包个数" placeholder="填写个数" input-align="right"/>
                <p class="des-text-style">红包个数最大不能超过100</p>
            </van-col>
        </van-row>

        <van-row type="flex" justify="center" class="mt_10">
            <van-col span="22">
                <van-field
                        v-model="packet.description"
                        rows="1"
                        autosize
                        label=""
                        type="textarea"
                        placeholder="恭喜发财，大吉大利"
                />
            </van-col>
        </van-row>

        <van-row type="flex" justify="center" class="mt_30">
            <van-col span="22">
                <p v-if="packet.isRandom" class="total-amount">{{packet.amount === '' ? '0.00' :  Number(packet.amount)}}</p>
                <p v-else class="total-amount">{{packet.amount === '' ? '0.00' : Number(packet.amount) * Number(packet.total)}}</p>
            </van-col>
        </van-row>

        <van-row type="flex" justify="center" class="mt_30">
            <van-col span="22">
                <van-button type="info" style="width: 100%" @click="handleCreate">塞钱进红包</van-button>
            </van-col>
        </van-row>

    </div>
</template>

<script>
    import NodeRSA from 'node-rsa';
    import { Base64 } from 'js-base64';
    export default {
        name: "index",
        data() {
            return {
                packet: {
                    amount: '',
                    description: '',
                    isRandom: true,
                    total: 1,
                    address: '0xb7bc89ba2e49f52782da4f926be5a7a7ac1f1a94',
                    // address: sessionStorage.getItem('address')
                },
                contract: {
                    instance: null,
                    account: null,
                    gasAmount: 0,
                    packetId: null,
                    pub_e: null,
                    pub_m: null
                },
                key: {
                    public_key: null,
                    private_key: null
                }
            }
        },
        created() {
            this.create_key();
        },
        mounted() {
            this.initInstance();
        },
        methods: {
            /**
             * 获取合约实例
             * @returns {Promise<void>}
             */
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
            },
            handleCancel() {
                // this.$router.push({path: '/packet-details'});
                this.$router.push({path: '/select-wallet'});
            },
            async handleCreate() {
                if (this.packet.amount === '') return false;
                if (this.packet.total === '') return false;
                if (Number(this.packet.total) > 100) {
                    this.$toast('红包个数最大不能超过100个');
                    return false;
                }
                if (this.packet.description === '') this.packet.description = '恭喜发财，大吉大利';

                const { createdRedPacket } = this.contract.instance.methods;
                const m = '0xDF3EDDE009B96BC5B03B48BD73FE70A3AD20EAF624D0DC1BA121A45CC739893741B7CF82ACF1C91573EC8266538997C6699760148DE57E54983191ECA0176F518E547B85FE0BB7D9E150DF19EEE734CF5338219C7F8F7B13B39F5384179F62C135E544CB70BE7505751F34568E06981095AEEC4F3A887639718A3E11D48C240D'
                const e = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010001'

                const that = this;
                /** uint256 totalnumber,
                   bool isRandom,
                   string memory description,
                   bytes memory pub_e,
                   bytes memory pub_m
                 */
                // web3调用合约 估算合约方法gas用量
                let totalValue = 0;
                this.packet.isRandom ? totalValue = Number(this.packet.amount) : totalValue = Number(this.packet.amount) * Number(this.packet.total);
                await createdRedPacket(this.packet.total, this.packet.isRandom, this.packet.description, e, m).estimateGas({from: this.contract.account, value: totalValue})
                    .then(function(gasAmount){
                        that.contract.gasAmount = gasAmount + 2100;
                    })
                    .catch(function(error){

                    })

                const redPacket = await createdRedPacket(this.packet.total, this.packet.isRandom, this.packet.description, e, m).send({from: this.contract.account, value: totalValue, gas: this.contract.gasAmount}).then(function (receipt) {
                    console.log(receipt);
                    const resData = receipt;
                    that.contract.packetId = resData.events.CreatedRedPacketEvent.returnValues[1];
                })
                // 加签并验签
                const a_private_key = new NodeRSA(this.key.private_key);
                const { getAbiCode } = this.contract.instance.methods;
                const codeStr = await getAbiCode(this.contract.packetId).call().then(res => {
                    return res.encodePacked;
                })
                const _codeStr = codeStr.substr(2, codeStr.length - 2)
                console.log('codeStr', codeStr);
                console.log('_codeStr', _codeStr);
                const sign = a_private_key.sign(_codeStr, 'hex', 'hex')
                console.log('A 私钥加签:', sign)
                const qrCodeMsg = {
                    packetId: this.contract.packetId,
                    sign: sign
                }
                this.$toast('操作成功')
                this.$router.push({path: '/create-success', query: {packetId: qrCodeMsg.packetId, sign: qrCodeMsg.sign, key: this.key.private_key}});
            },
            typeChange(type) {
                type === 1 ? this.packet.isRandom = true : this.packet.isRandom = false;
            },
            create_key(){
                const key = new NodeRSA({ b: 1024 }); //生成1024位的密钥
                let publicDer = key.exportKey("pkcs8-public-pem");  //公钥
                let privateDer = key.exportKey("pkcs1-private-pem");//私钥
                // this.key.public_key = publicDer;
                // this.key.private_key = privateDer;
                this.key.public_key = `-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDfPt3gCblrxbA7SL1z/nCjrSDq
    9iTQ3BuhIaRcxzmJN0G3z4Ks8ckVc+yCZlOJl8Zpl2AUjeV+VJgxkeygF29RjlR7
    hf4Lt9nhUN8Z7uc0z1M4IZx/j3sTs59ThBefYsE15UTLcL51BXUfNFaOBpgQla7s
    TzqIdjlxij4R1IwkDQIDAQAB
    -----END PUBLIC KEY-----`;
                this.key.private_key = `-----BEGIN RSA PRIVATE KEY-----
  MIICXAIBAAKBgQDfPt3gCblrxbA7SL1z/nCjrSDq9iTQ3BuhIaRcxzmJN0G3z4Ks
  8ckVc+yCZlOJl8Zpl2AUjeV+VJgxkeygF29RjlR7hf4Lt9nhUN8Z7uc0z1M4IZx/
  j3sTs59ThBefYsE15UTLcL51BXUfNFaOBpgQla7sTzqIdjlxij4R1IwkDQIDAQAB
  AoGAQEoBaThDrnaSpq/u5w158Ji15xQVTBRm3IMsqw8wUYSZJ07Z6eYDK2tjy7We
  DvynRdcy8xhd44CHB5dnVj8JbiBX26i05fkOy3vtWtWWPQi+lIBLPOYiJA3Jeu01
  KrRUKpDjDx9jz5bV3RQNIKhy6oWAmzqZw84w2H5Yu1GeNl0CQQD2NzMllvxh1b03
  2CF0KNvEJo83VmpGoNNnljKaMwuDXeog+NGEkOL89iBZLmaErdaUIKXMi7rKBHTe
  zc4KoeMrAkEA6B388AOtofBiS0kLumLxW6S27cbjOiJ6kgi2QuoZeYjwP1Sd2vBJ
  d/0ooqwO2m2ZBMhHvfWJNsj97bX9d2VZpwJBAK9Ruv/HNUtM8QF0ys110pcnhc83
  n1FPb3lRQBMAye/uzapQwpAMwzSw5XPbUHClgCfV33l4/baf2cBU96QmhiUCQAqq
  9ikBwkUjCyFypftW+MjBdTbQYTkWxJNZmybQI4OWa5Q9i1O4n2fIVsnDJpubVeEG
  Y2Wzly7RZfo61v9ZxRkCQDwTiiLUD7w6IE9CHhz6j1yI6P1Nn+wuymu7YMXG0zjs
  H6knPQhmeq6EXguCWPVvCIGbHZn16g+s9jkUEq48V+Y=
  -----END RSA PRIVATE KEY-----`;
                // console.log('公钥',publicDer)
                let pubStr = publicDer.replace('-----BEGIN PUBLIC KEY-----', '');
                pubStr = pubStr.replace('-----END PUBLIC KEY-----', '');
                // console.log(pubStr);

                // 对 pubStr 进行解码
                // pubStr = 'MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAMJjauXD2OQ/+5erCQKPGqxsC/bNPXDr\n' +
                //     'yigb/+l/vjDdAgMBAAE=';
                pubStr = Base64.decode(pubStr);
                // console.log('解码', pubStr);
                // pubStr = strToHexCharCode(pubStr);

                pubStr = this.$Web3.utils.toHex(pubStr);
                // console.log(pubStr);
                // # 找到模数和指数的开头结束位置
                const m_start = 29 * 2
                const e_start = 159 * 2
                const m_len = 128 * 2
                const e_len = 3 * 2
                // console.log(m_start);
                // console.log(e_start);
                // console.log(m_len);
                // console.log(e_len);
                const modulus = pubStr.substring(m_start,m_len);
                // const modulus = pubStr.substr(m_start, m_len);
                const exponent = pubStr.substr(e_start, e_len);
                // const exponent = pubStr.substring(e_start, e_len);
                console.log(modulus);
                console.log(exponent);
                // const exponent = hex_str[e_start:e_start + e_len]
                // console.log('公钥',publicDer.replace('-----BEGIN PUBLIC KEY-----', ''))
                // console.log('公钥',publicDer.replace('-----END PUBLIC KEY-----', ''))
                // console.log('================')
                // console.log('私钥',privateDer)
            }
        }
    }
</script>

<style scoped lang="less">
    .mt_30 {
        margin-top: 30px;
    }
    .mt_10 {
        margin-top: 10px;
    }
    .des-text-style {
        color: #8E8B8B;
        font-size: 12px;
        line-height: 25px;
        span {
            color: #CC8B21;
        }
    }
    .total-amount {
        text-align: center;
        font-size: 48px;
        font-weight: bold;
    }
</style>