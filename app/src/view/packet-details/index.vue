<template>
  <div>
    <van-row type="flex"
             justify="center"
             class="container">
      <van-col span="24"
               class="packet-image"></van-col>
    </van-row>

    <van-row type="flex"
             justify="center"
             class="packet-amount-content">
      <van-col class="packet-content">{{packet.owner | handleStr}}的红包</van-col>
      <!--<van-col class="packet-content">{{msg.amount}}</van-col>-->
    </van-row>

    <van-row type="flex"
             justify="center"
             class="mt_20 packet-amount-msg">
      <van-col class="packet-amount">{{packet.amount|handleAmount|parseNum}} </van-col>
    </van-row>
    <van-row type="flex"
             justify="center"
             class="packet-amount-msg">
      <van-col v-if="packet.amount==0&&packet.remainNumber!=0"
               class="packet-amount-text">
        <van-loading>链上查询中....</van-loading>
      </van-col>

      <van-col v-else
               class="packet-amount-text">已存入钱包</van-col>
      <!-- <van-col :span="24" class="packet-amount-text" style="text-align: center" @click="recyclePacket">收回过期红包</van-col> -->
    </van-row>
    <!--<van-divider />-->
    <van-row type="flex"
             justify="center"
             class="packet-amount-msg">
      <van-col :span="24"
               class="gap-style mt_10"></van-col>
    </van-row>
    <van-row type="flex"
             class="count-wrap">
      <van-list :span="24"
                class="van-list-container">
        <van-cell>
          <span class="fl">已领取 {{this.packet.totalNumber - this.packet.remainNumber}} / {{packet.totalNumber}}个，共{{(this.packet.totalAmount - this.packet.remainAmount)|handleAmount2}}/{{this.packet.totalAmount|handleAmount2}}moac</span>
        </van-cell>
        <van-cell v-for="item in packet.list"
                  :key="item.index">
          <div class="fl list-item fl-wrap">
            <span class="vote-img-wrap">
              <!--<img v-if="item.pic && item.pic !== ''" :src="item.pic">-->
              <img src="~@/assets/images/init.png"
                   alt="">
            </span>
            <span class="name-wrap">
              <span class="db font_14">{{item.account | handleStr}}</span>
              <span class="db font_12 color_666">{{item.timeStr}}</span>
            </span>

          </div>
          <div class="fr list-item fr-wrap">
            <span class="vote-time-wrap font_14">{{item.amount|handleAmount}} moac</span>
          </div>
        </van-cell>
      </van-list>
    </van-row>

  </div>
</template>

<script>
export default {
  name: "index",
  data () {
    return {
      account: "0x0",
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
        amount: 0,
        status: 'normal',
        list: [],
      },
      contract: {
        address: this.$contract_address,
        instance: null
      }

    }
  },
  created () {
    this.getUrlQuery();
    this.initInstance();
  },
  mounted () {
    this.getPacketInfo(this.packet.addr);
    // this.queryReceiveDetails();
    this.watchReceiveEvent();
    // this.receivePacket();
    // this.queryOwnedRedPacket();
  },
  methods: {
    //初始化合约
    async initInstance () {
      this.contract.instance = this.$chain3.mc.contract(
        this.$RedPacketArtifact.abi
      ).at(this.contract.address);
      window.instance = this.contract.instance
    },
    //获取参数
    getUrlQuery () {
      this.packet.addr = this.$route.query.addr;
      this.account = this.$route.query.account;
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
            that.$toast("红包不存在")
          } else {
            // console.log(that.$Web3.eth.abi.decodeParameter("string", str))
            let packetInfo = that.$Web3.eth.abi.decodeParameters(that.contract.instance.abi[9].outputs, res)
            // console.log(packetInfo)
            that.packet.addr = packetInfo.addr;
            that.packet.description = packetInfo.description;
            that.packet.isRandom = packetInfo.isRandom;
            that.packet.owner = packetInfo.owner;
            that.packet.totalAmount = that.$Web3.utils.fromWei(packetInfo.totalAmount.toString(10));
            that.packet.totalNumber = packetInfo.totalNumber;
            that.packet.remainAmount = that.$Web3.utils.fromWei(packetInfo.remainAmount.toString(10)),
              that.packet.remainNumber = packetInfo.remainNumber;
            that.packet.startTime = new Date(packetInfo.startTime * 1000);//startTime.toLocaleDateString()+" "+startTime.toTimeString().split(" ")[0]
            // (new Date()).getTime() / 1000 - packetInfo.startTime > 24 * 3600;

            console.log(that.packet);
            that.queryReceiveDetails();
            return
          }
          //   that.$toast("未查询红包信息")
        }
      });
    },
    /**
    * 获取红包领取详情
    */
    async queryReceiveDetails () {
      const that = this;
      for (let i = 0; i < this.packet.totalNumber - this.packet.remainNumber; i++) {
        console.log("queryReceiveDetails  " + i)
        this.contract.instance.queryReceiveDetails.call(this.packet.addr, i, function (err, res) {
          if (err) {
            console.log("err")
            console.log(err)
          } else {
            let str = res.toString()
            let strSlice = "0x" + str.slice(10);
            if (str.indexOf("0x08c379a0") == 0) {
              let resStr = that.$Web3.eth.abi.decodeParameter("string", strSlice)
              console.log(resStr)
            } else {
              //   console.log(str)
              let packetInfo = that.$Web3.eth.abi.decodeParameters(that.contract.instance.abi[11].outputs, res)
              console.log(packetInfo)
              let record = {};
              record.account = packetInfo.account
              record.amount = that.$Web3.utils.fromWei(packetInfo.amount);
              record.time = new Date(packetInfo.time * 1000);//startTime.toLocaleDateString()+" "+startTime.toTimeString().split(" ")[0]
              record.timeStr = record.time.toLocaleDateString() + " " + record.time.toTimeString().split(" ")[0]
              //修改领取的余额
              if (that.account != undefined && record.account.toLowerCase() == that.account.toLowerCase()) {
                that.packet.amount = record.amount;
              }
              that.pushList(record);
            }
          }
        });
      }
    },
    //监控链上领取详情
    watchReceiveEvent () {
      let that = this;
      this.contract.instance.ReceiveRedPacketEvent({ packetAddr: this.packet.addr }, { fromBlock: "latest", toBlock: "latest" }, function (err, res) {
        if (err) {
        } else {
          console.log("res");
          console.log(res);
          let record = {};
          record.account = res.args.receiveAddr;
          record.amount = that.$Web3.utils.fromWei(res.args.amount.toString());
          record.time = new Date(res.args.time * 1000);//startTime.toLocaleDateString()+" "+startTime.toTimeString().split(" ")[0]
          record.timeStr = record.time.toLocaleDateString() + " " + record.time.toTimeString().split(" ")[0]
          if (record.account.toLowerCase() == that.account.toLowerCase()) {
            that.packet.amount = record.amount;
          }
          that.pushList(record);
        }
      })
    },

    getPersonalPacket () {

      this.$router.push({ path: '/personal-packets', query: { packetIds: this.msg.packetIds.join(',') } });
    },
    //给添加抢记录并排序去重
    pushList (record) {
      this.packet.list.push(record);
      //去重
      var obj = {};
      this.packet.list = this.packet.list.reduce(function (item, next) {
        obj[next.account] ? '' : obj[next.account] = true && item.push(next);
        return item;
      }, []);
      //排序
      this.packet.list.sort((a, b) => { return b.time - a.time });
      //修改已领取数量
      this.packet.remainNumber = this.packet.totalNumber - this.packet.list.length;
      this.packet.remainNumber > 0 ? this.packet.remainNumber : this.packet.remainNumber = 0
    }
  },
  filters: {
    handleStr (str) {
      if (str.length > 12) {
        const str1 = str.substring(0, 8);
        const str2 = str.substr(str.length - 4, 4);
        const _subStr = str1 + '...' + str2;
        return _subStr.toLowerCase();
      } else {
        return str;
      }
    },
    handleAmount (amount) {
      return Number(amount).toFixed(6);
    },
    handleAmount2 (amount) {
      return Number(amount).toFixed(2);
    },
    parseNum (amount) {
      return parseFloat(amount);
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
    background: #e80b0bbe;
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
  color: #cc8b21;
  flex-wrap: wrap;
  .packet-amount {
    font-size: 32px;
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
  width: 130px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.vote-time-wrap {
  display: block;
}
</style>