<template>
  <div>
    <van-row type="flex"
             justify="center">
      <van-col span="24">
        <van-nav-bar title="发送记录" />
      </van-col>
    </van-row>
    <van-row type="flex"
             class="count-wrap">
      <van-list v-model="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="queryReceiveRecord(currentNum-1)"
                :span="24"
                class="van-list-container">
        <van-cell>
          <span class="fl"
                style="width: 45%;">发送时间</span>
          <span class="fl"
                style="width: 20%;">总额</span>
          <span class="fl"
                style="width: 20%;">总数</span>
          <span class="fr"
                style="width: 15%;text-align:right;">状态</span>
        </van-cell>
        <van-cell v-for="item in packetList"
                  :key="item.index">
          <span @click="getPacketDetails(item.packetAddr)">
            <span class="fl name-wrap"
                  style="width: 45%;">
              <span class="db font_14 ">{{item.startTimeStr}}</span>
            </span>
            <span class="fl name-wrap"
                  style="width: 20%;">
              <span class="db font_14">{{item.totalAmount|handleAmount}}</span>
            </span>
            <span class="fl name-wrap"
                  style="width: 15%;">
              <span class="db font_14"> {{item.totalNumber}}</span>
            </span>
          </span>
          <span class="fr name-wrap"
                style="width: 20%;text-align:right;">
            <span v-if="item.expired&&(item.remainAmount>0)"
                  class="db font_14 "
                  style="color:dodgerblue;"
                  @click="recyclePacket(item.packetAddr)">待回收</span>
            <span v-else-if="!item.expired&&(item.remainAmount>0)"
                  class="db font_14 ">领取中</span>
            <span v-else-if="item.remainAmount==0"
                  class="db font_14 ">已领完</span>
          </span>

        </van-cell>
      </van-list>
    </van-row>
  </div>
</template>

<script>
import { Dialog } from 'vant';
import { debounceHign } from '@/utils/request-limit'
export default {
  name: "index",
  data () {
    return {
      loading: false,
      finished: false,
      account: "0x0",
      packetList: [],
      createTotalNumber: 0,
      currentNum: 0,
      contract: {
        address: this.$contract_address,
        instance: null
      }
    }
  },
  created () {
    this.initInstance();
    this.getUrlQuery();
    this.perQueryReceiveRecord();
  },
  mounted () {
    // this.queryReceiveRecord(this.createTotalNumber - 1);
  },
  methods: {
    /**
     * 收回未领完的过期红包
     */
    recyclePacket: debounceHign(function (packetAddr) {
      const that = this;
      const { recyclePacket } = this.contract.instance;
      console.log(this.account)
      const inputData = recyclePacket.getData(packetAddr);
      console.log(inputData);
      const gasLimit = this.$chain3.mc.estimateGas({ to: this.contract.address, data: inputData }) + 20000;
      console.log('gasLimit', gasLimit);
      console.log('system', this.$system);
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
          this.$toast('操作成功,请等待链上确认！');
          // this.getPacketDetails();
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

    }, 2000),
    //初始化合约
    async initInstance () {
      this.contract.instance = this.$chain3.mc.contract(
        this.$RedPacketArtifact.abi
      ).at(this.contract.address);
      window.instance = this.contract.instance
    },
    //获取参数
    getUrlQuery () {
      this.account = this.$route.query.account;
      if (this.account.indexOf("0x") < 0) {
        console.log(this.account.indexOf("0x"))
        Dialog.alert({
          message: '请选择钱包地址',
        }).then(() => {
          // on close
          this.goBack()
        });
      }
    },
    //预请求获得创建红包个数
    async perQueryReceiveRecord () {
      const that = this;
      //   console.log("queryReceiveRecord  ")
      this.contract.instance.queryCreatedRecord.call(this.account, 0, function (err, res) {
        if (err) {
          console.log(err)
        } else {
          let str = res.toString()
          let strSlice = "0x" + str.slice(10);
          if (str.indexOf("0x08c379a0") == 0) {
            let resStr = that.$Web3.eth.abi.decodeParameter("string", strSlice)
            console.log(resStr)
          } else {
            let packetInfoTmp = that.$Web3.eth.abi.decodeParameters(that.contract.instance.abi[10].outputs, res);
            that.createTotalNumber = packetInfoTmp.totalNum;
            that.currentNum = packetInfoTmp.totalNum;
            console.log("that.createTotalNumber = " + that.createTotalNumber)
            console.log("that.currentNum = " + that.currentNum)
            that.queryReceiveRecord(that.currentNum - 1);
            return
          }
        }
        console.log("that.createTotalNumber = 0;")
        that.createTotalNumber = 0;
        that.finished = true;
      });
    },
    /**
     * 获取红包领取详情
     */
    async queryReceiveRecord (startIndex) {
      const that = this;
      console.log("queryReceiveRecord-----------")
      for (let i = startIndex; i >= (startIndex - 10 > 0 ? startIndex - 10 : 0); i--) {
        console.log("queryCreatedRecord  " + i)
        that.contract.instance.queryCreatedRecord.call(that.account, i, function (err, res) {
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
              let packetInfo = that.$Web3.eth.abi.decodeParameters(that.contract.instance.abi[10].outputs, res)
              console.log(packetInfo)
              let record = {};
              record.packetAddr = packetInfo.packetAddr
              record.totalAmount = that.$Web3.utils.fromWei(packetInfo.totalAmount);
              record.totalNumber = packetInfo.totalNumber
              record.remainAmount = that.$Web3.utils.fromWei(packetInfo.remainAmount);
              record.remainNumber = packetInfo.remainNumber
              record.description = packetInfo.description
              record.expired = Number(packetInfo.startTime) + 3600 * 24 < new Date().getTime() / 1000
              record.startTime = new Date(packetInfo.startTime * 1000);//startTime.toLocaleDateString()+" "+startTime.toTimeString().split(" ")[0]
              record.startTimeStr = record.startTime.toLocaleDateString() + " " + record.startTime.toTimeString().split(" ")[0].slice(0, 5)
              that.createTotalNumber = packetInfo.totalNum
              // that.currentNum = packetInfo.totalNum
              //   console.log(that.createTotalNumber)
              that.pushList(record);
            }
          }
        });
      }
      // 加载状态结束
      this.loading = false;
    },
    /**
     * 查看红包领取详情
    * @returns {Promise<void>}
    */
    async getPacketDetails (addr) {
      this.$router.push({ path: '/packet-details', query: { addr: addr, account: this.account } });
    },
    goBack () {
      history.go(-1);
      //   this.$router.push({ path: '/homepage', query: { account: this.account } })
    },
    getGasPrice () {
      const gasPrice = this.$chain3.mc.gasPrice;
      return gasPrice.toString();
      // console.log(gasPrice.toString()); // "10000000000000"
    },
    //给添加抢记录并排序去重
    pushList (record) {
      this.packetList.push(record);
      //去重
      var obj = {};
      this.packetList = this.packetList.reduce(function (item, next) {
        obj[next.packetAddr] ? '' : obj[next.packetAddr] = true && item.push(next);
        return item;
      }, []);
      //排序
      this.packetList.sort((a, b) => { return b.startTime - a.startTime });
      //当前加载位置
      this.currentNum = this.createTotalNumber - this.packetList.length
      console.log(this.currentNum + "------------")
      // 数据全部加载完成
      if (this.packetList.length >= this.createTotalNumber) {
        this.finished = true;
        console.log("finished")
      }
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
      return Number(amount).toFixed(3);
    },
    parseNum (amount) {
      return parseFloat(amount);
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