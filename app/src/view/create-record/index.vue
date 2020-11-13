<template>
  <div>
    <van-row type="flex"
             justify="center">
      <van-col span="24">
        <van-nav-bar title="发送详情"
                     left-text="返回"
                     @click-left="goBack" />
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
          <!-- address packetAddr,
            uint256 startTime,
            string memory description,
            uint256 totalNumber,
            uint256 remainNumber,
            bool isRandom,
            uint256 totalAmount,
            uint256 remainAmount,
            uint256 totalNum -->
          <span class="fl"
                style="width: 45%;">红包名称</span>
          <span class="fl"
                style="width: 20%;">余额/总额</span>
          <span class="fl"
                style="width: 20%;">余数/总数</span>
          <span class="fl"
                style="width: 15%;">状态</span>
        </van-cell>
        <van-cell v-for="item in packetList"
                  :key="item.index">
          <!-- <span class="fl font_14" style="width: 25%;">{{item.isRandom ? '随机红包' : '普通红包'}}</span> -->
          <span class="fl name-wrap"
                style="width: 45%;">
            <span class="db font_14">{{item.description}}</span>
            <span class="db font_12 color_666">{{item.startTimeStr}}</span>
          </span>
          <span class="fl name-wrap"
                style="width: 20%;">
            <span class="db font_14">{{item.remainAmount|handleAmount}}</span>
            <span class="db font_14">{{item.totalAmount|handleAmount}}</span>
          </span>
          <span class="fl name-wrap"
                style="width: 15%;text-align:right">
            <span class="db font_14">{{item.remainNumber}}</span>
            <span class="db font_14"> {{item.totalNumber}}</span>
          </span>
          <span class="fl name-wrap"
                style="width: 20%;text-align:center;color:dodgerblue;">

            <span v-if="item.expired&&(item.remainAmount>0)"
                  class="db font_14 "
                  style="color:dodgerblue;"
                  @click="recyclePacket(item.packetAddr)">回收</span>
            <span if-else
                  class="db font_14 "></span>
          </span>
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
      loading: false,
      finished: false,
      account: "0x0",
      packetList: [],
      createTotalNumber: 3,
      currentNum: 3,
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
    async recyclePacket (packetAddr) {
      //   console.log(packetAddr);
      //   const { recyclePacket } = this.contract.instance;
      //   const that = this;
      //   await recyclePacket(packetAddr).send({ from: address }).on('receipt', function (receipt) {
      //     console.log('收回未领完的过期红包', receipt);
      //   }).on('error', function (error) {
      //     that.$toast(error.message);
      //   })
    },
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
          }
        }
        that.createTotalNumber = 0;
      });
    },
    /**
        * 获取红包领取详情
        */
    async queryReceiveRecord (startIndex) {
      const that = this;
      console.log("queryReceiveRecord-----------")
      for (let i = startIndex; i >= (startIndex - 1 > 0 ? startIndex - 1 : 0); i--) {
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
              record.remainAmount = that.$Web3.utils.fromWei(packetInfo.remainAmount);
              record.remainNumber = packetInfo.remainNumber
              record.totalAmount = that.$Web3.utils.fromWei(packetInfo.totalAmount);
              record.totalNumber = packetInfo.totalNumber
              record.description = packetInfo.description
              record.expired = Number(packetInfo.startTime) + 3600 * 24 < new Date().getTime() / 1000
              record.startTime = new Date(packetInfo.startTime * 1000);//startTime.toLocaleDateString()+" "+startTime.toTimeString().split(" ")[0]
              record.startTimeStr = record.startTime.toLocaleDateString() + " " + record.startTime.toTimeString().split(" ")[0].slice(0, 5)
              that.createTotalNumber = packetInfo.totalNum
            //   console.log(that.createTotalNumber)
              that.pushList(record);

            }
          }
        });
      }
      // 加载状态结束
      this.loading = false;
    },
    goBack () {
      history.go(-1);
      //   this.$router.push({ path: '/homepage', query: { account: this.account } })
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
      this.packetList.sort((a, b) => { return b.time - a.time });
      //当前加载位置
      this.currentNum = this.createTotalNumber - this.packetList.length
      console.log(this.currentNum +"------------")
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
      return Number(amount).toFixed(6);
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