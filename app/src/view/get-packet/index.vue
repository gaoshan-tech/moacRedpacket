<template>
  <div class="wallet">
    <div class="content">
      <van-row v-if="packet.status!='error'"
               type="flex"
               justify="center"
               class="packet-amount-content">
        <van-col class="packet-content">{{this.packet.owner | handleStr}}的红包</van-col>
      </van-row>
      <van-row type="flex"
               justify="center"
               class="mt_20 packet-amount-msg">
        <van-col class="packet-amount">{{this.packet.description}}</van-col>
      </van-row>
      <van-row v-if="packet.status=='expired'"
               type="flex"
               justify="center"
               class="mt_100 packet-amount-msg">
        <van-col class="packet-amount-text">红包已过期</van-col>
      </van-row>
      <van-row v-else-if="packet.status=='error'"
               type="flex"
               justify="center"
               class="mt_40 packet-amount-msg packet-query-text">
        <!-- <van-col class="packet-amount-text">链上查询中...</van-col> -->
        <van-loading class="packet-query-text"
                     color="#fff">链上查询中....</van-loading>
      </van-row>
      <van-row v-else-if="packet.status=='over'"
               type="flex"
               justify="center"
               class="mt_40 packet-amount-msg">
        <van-col class="packet-amount-text">红包已抢完</van-col>
      </van-row>
      <van-row v-else-if="packet.status=='received'"
               type="flex"
               justify="center"
               class="mt_40 packet-amount-msg">
        <van-col class="packet-amount-text">红包已领取</van-col>

      </van-row>
      <van-row v-else-if="packet.status=='normal'"
               type="flex"
               justify="center"
               class="packet-amount-msg"
               @click="receivePacket">
        <van-col span="22"
                 class="container packet-image"></van-col>
        <van-col span="22"
                 style="text-align: center"
                 class="packet-get-text">
          开
        </van-col>
      </van-row>
      <van-row v-else
               type="flex"
               justify="center"
               class="mt_40 packet-amount-msg">
        <van-col class="packet-amount-text">查询领取情况中...</van-col>
      </van-row>
      <van-row v-if="packet.status!='error'"
               type="flex"
               justify="center"
               class="packet-amount-msg"
               @click="getPacketDetails">
        <van-col :span="24"
                 class="mt_40 packet-details-text"
                 justify="center"
                 style="text-align: center">查看详情</van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
import { DropdownMenu, DropdownItem, NavBar, Dialog } from 'vant';
import { debounceHign } from '@/utils/request-limit'
import Vue from 'vue';
export default {
  name: "index",
  components: {
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [NavBar.name]: NavBar,
  },
  data () {
    return {
      account: this.$account,
      addOpt: [

      ],
      packet: {
        key: "0x0",
        packetAccount: "",
        addr: "",
        description: "",
        isRandom: null,
        owner: "",
        remainAmount: 0,
        remainNumber: 0,
        startTime: 0,
        totalAmount: 0,
        totalNumber: 0,
        status: 'error'
      },
      contract: {
        address: this.$contract_address,
        instance: null
      }
    }
  },
  created () {
    this.initInstance();
    this.getkey();
    // this.getWalletAddress();
  },
  mounted () {
    this.getPacketInfo(this.packet.packetAccount.address);
    this.perReceiveRedPacket(this);
    this.watchReceiveEvent();
    // this.receivePacket();
    // this.queryOwnedRedPacket();
  },
  methods: {
    // 获取钱包地址
    getWalletAddress () {
      this.$tp.getWalletList(3).then(res => {
        console.log('resdata', res);
        // localStorage.clear();
        const optData = res.wallets.moac;
        // this._blockchain = optData.blockchain;
        for (let index in optData) {
          // console.info("address"+optData[index].address);
          // console.info(optData[index].name);
          let item = {
            text: optData[index].name + ":" + optData[index].address,
            value: optData[index].address
          }
          this.addOpt.push(item);
          // this.value = this.addOpt[0].value;
        }
        // this.handleCreateRedEnvelope();
      })
    },
    async initInstance () {
      this.contract.instance = this.$chain3.mc.contract(
        this.$RedPacketArtifact.abi
      ).at(this.contract.address);
      window.instance = this.contract.instance
    },
    getkey () {
      this.packet.key = this.$route.query.key;
      this.packet.packetAccount = this.$Web3.eth.accounts.privateKeyToAccount(this.packet.key)
    },
    //预请求抢红包
    async perReceiveRedPacket (that) {
      // Vue.prototype.$account = this.account;
      // while (true) {
      console.log("perReceiveRedPacket")
      that.contract.instance.receiveRedPacket.call(that.packet.packetAccount.address, "0x226ec1f7c89b13b9c8c8cdcf7dca1b5d0d7b8f944411328c9618f73a7a95f378730cdc716d99cde36f6a5217e098b2074cc90445d1cc4e22a06cc9b7eb843c751b", { from: that.account }, function (err, res) {
      // that.contract.instance.receiveRedPacket.call(that.packet.packetAccount.address, "0x226ec1f7c89b13b9c8c8cdcf7dca1b5d0d7b8f944411328c9618f73a7a95f378730cdc716d99cde36f6a5217e098b2074cc90445d1cc4e22a06cc9b7eb843c751b", { from: "0xd3c4372227b81903993767213e5b386567f67e38" }, function (err, res) {
      // that.contract.instance.receiveRedPacket.call(that.packet.packetAccount.address, "0x0", { from: "0xd3c4372227b81903993767213e5b386567f67e38" }, function (err, res) {
        if (err) {
          console.log("err")
          console.log(err)
        } else {
          let str = res.toString()
          console.log("str " + str)
          let strSlice = "0x" + str.slice(10);
          if (str.indexOf("0x08c379a0") == 0) {
            let resStr = that.$Web3.eth.abi.decodeParameter("string", strSlice)
            console.log("resStr")
            console.log(resStr)
            if ("packetAddr error" == resStr) {
              that.packet.status = "error"
              that.getPacketInfo(that.packet.packetAccount.address)
              // setTimeout(() => {
              //   that.perReceiveRedPacket(that)
              // }, 3000)
              // that.$toast("红包不存在或未上链")
              // that.$router.push({ path: '/homepage' });
            } else if ("packet over" == resStr) {
              that.packet.status = "over"
            } else if ("Red packet expired" == resStr) {
              that.packet.status = "expired"
            } else if ("packet have received" == resStr) {
              that.packet.status = "received"
              // that.$toast("已领取")
              // that.$router.push({ path: '/packet-details' });
            } else {
              that.packet.status = "normal"
            }
          } 


        }

      });
    },

    //获取红包基本信息
    async getPacketInfo (packetAddr) {
      let that = this;
      this.contract.instance.queryPacketInfo.call(packetAddr, function (err, res) {
        if (err) {
          console.log("err")
          console.log(err)
        } else {
          let str = res.toString()
          let strSlice = "0x" + str.slice(10);
          if (str.indexOf("0x08c379a0") == 0) {
            let resStr = that.$Web3.eth.abi.decodeParameter("string", strSlice)
            console.log(resStr)
            // that.$toast("红包不存在")
          } else {
            // console.log(that.$Web3.eth.abi.decodeParameter("string", str))
            let packetInfo = that.$Web3.eth.abi.decodeParameters(that.contract.instance.abi[9].outputs, res)
            // console.log(packetInfo)
            that.packet.addr = packetInfo.addr;
            that.packet.description = packetInfo.description;
            // that.packet.description = "大方李杰了阿斯顿发了阿斯顿的李康分阿索罗地方"
            that.packet.isRandom = packetInfo.isRandom;
            that.packet.owner = packetInfo.owner;
            that.packet.remainAmount = that.$Web3.utils.fromWei(packetInfo.remainAmount.toString(10)),
              that.packet.remainNumber = packetInfo.remainNumber;
            that.packet.startTime = new Date(packetInfo.startTime * 1000);//startTime.toLocaleDateString()+" "+startTime.toTimeString().split(" ")[0]
            // (new Date()).getTime() / 1000 - packetInfo.startTime > 24 * 3600;
            that.packet.totalAmount = that.$Web3.utils.fromWei(packetInfo.totalAmount.toString(10));
            that.packet.totalNumber = packetInfo.totalNumber;
            // that.packet.status = "normol";
            console.log(that.packet);
            return
          }
          // that.$toast("未查询红包信息")
        }
      });
    },
    /**
     * 领取红包
     * @returns {Promise<void>}
     */
     receivePacket:debounceHign(function() {
      if (this.account == "0x0" || this.account == undefined) {
        Dialog.alert({
          message: '请使用moac钱包地址',
        }).then(() => {
          // on close
        });
        //调用聊天
        // this.$tp.startChat({
        //   account: '1582661740',
        //   sessionType: 1,
        //   blockchain: 'eos'
        // });
        //调用保存照片
        // this.$tp.saveImage({
        //   url: 'https://dapp.mytokenpocket.vip/tokenpocket_logo.png'
        // });
        //全屏
        // this.$tp.fullScreen({
        //   fullScreen: 0
        // })
        return;
      }
      const that = this;
      const { receiveRedPacket } = this.contract.instance;
      console.log(this.account)
      const signStr = this.packet.packetAccount.sign(this.$Web3.utils.sha3(this.account)).signature
      console.log(signStr);
      console.log(this.$Web3.utils.hexToBytes(signStr));
      // console.log(this.$Web3.utils.hexToBytes(signStr.toString().slice(2)));
      // const inputData = receiveRedPacket.getData(this.packet.packetAccount.address, this.$Web3.utils.hexToBytes(signStr));
      const inputData = receiveRedPacket.getData(this.packet.packetAccount.address, signStr);
      console.log(inputData);
      // const gasLimit = this.$chain3.mc.estimateGas({ to: this.contract.address, data: inputData }) + 210000;
      const gasLimit =  220000;
      console.log('gasLimit', gasLimit);
      const query = {
        from: this.account,
        to: this.contract.address,
        gasPrice: this.$system == "ios" ? this.getGasPrice() : this.$Web3.utils.toHex(this.getGasPrice()),
        // gasPrice: 1000000000,
        gasLimit: this.$system == "ios" ? gasLimit : this.$Web3.utils.toHex(gasLimit),
        data: inputData,
        value: "0x0",
        chainId: '0x63',
        via: '0x',
        shardingFlag: '0x0',
      };
      console.log('query', query);
      // console.log('sendMoacTransaction--');
      this.$tp.sendMoacTransaction(query).then(res => {
        console.log('sendMoacTransaction', res);
        if (res.result) {
          console.log('sendMoacTransaction', res);
          const hash = res.data;
          let receipt = this.$chain3.mc.getTransactionReceipt(hash);
          if (receipt) {
            console.log('receipt:', receipt);
          }
          this.$toast('操作成功');
          this.getPacketDetails();
        }
        if (!res.result) {
          if ("replacement transaction underpriced" == res.data) {
            this.$toast("其他交易正在确认中，请稍后！");
            return false;
          }
          this.$toast(res.data);
          return false;
        }
      }).catch((error) => {
        console.log("error");
        console.log(error);
      });


    },2000),
    getGasPrice () {
      const gasPrice = this.$chain3.mc.gasPrice;
      return gasPrice.toString();
      // console.log(gasPrice.toString()); // "10000000000000"
    },
    /**
     * 查看红包领取详情
     * @returns {Promise<void>}
     */
    async getPacketDetails () {
      this.$router.push({ path: '/packet-details', query: { addr: this.packet.addr, account: this.account } });
    },
    //监控链上创建详情
    watchReceiveEvent () {
      let that = this;
      this.contract.instance.CreateRedPacketEvent({ packetAddr: this.packet.addr }, { fromBlock: "latest", toBlock: "latest" }, function (err, res) {
        if (err) {
          //   console.log("err")
          //   console.log(err)
        } else {
          console.log("res");
          console.log(res);
          setTimeout(() => { that.getPacketInfo(that.packet.packetAccount.address); that.perReceiveRedPacket(that); }, 3000)
        }
      })
    },
  },
  filters: {
    handleStr (str) {
      if (str.length > 12) {
        const str1 = str.substring(0, 8);
        const str2 = str.substr(str.length - 4, 4);
        const _subStr = str1 + '...' + str2;
        return _subStr;
      } else {
        return str;
      }
    }
  }
}
</script>

<style scoped lang="less">
.select-title {
  font-size: 14px;
  text-align: left;
  /*text-indent: 10px;*/
}
.wallet {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .content {
    background: #e80b0bbe;
    padding: 100px 50px;
    border-radius: 10px;
  }
}
.bg-style {
  background: #efefef;
}
.color_fff {
  background: #fff;
}
.mt_100 {
  margin-top: 100px;
}
.mt_40 {
  margin-top: 40px;
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

.packet-image {
  position: relative;
  top: 45px;
  z-index: 1;
  width: 80px;
  height: 80px;
  border-radius: 40px 40px 40px 40px;
  background: #d14343ec;
}
.packet-amount-content {
  // margin-top: 100px;
  flex-wrap: wrap;
  .packet-content {
    font-size: 14px;
  }
}
.packet-get-content {
  margin-top: 180px;
  flex-wrap: wrap;
  .packet-content {
    font-size: 14px;
  }
}

.packet-amount-msg {
  color: #cc8b21;
  flex-wrap: wrap;
  .packet-get-text {
    position: relative;
    top: -12px;
    z-index: 2;
    font-size: 24px;
    color: #f5f0f0;
  }
  .packet-amount {
    font-size: 18px;
    font-weight: bold;
      text-align: center;
  // white-space: nowrap;
  width: 216px;
  word-wrap: break-word;
  word-break: normal;
  }
  .packet-amount-text {
    font-size: 18px;
  }
  .packet-query-text {
    font-size: 18px;
    padding: 50px 30px;
    .van-loading__text {
      color: #fff;
    }
  }
  .packet-details-text {
    font-size: 14px;
    color: #2140cc;
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