<template>
  <div>
    <van-row type="flex"
             justify="center">
      <van-col span="24">
        <van-nav-bar title="领取详情"
                     left-text="返回"
                     @click-left="goBack" />
      </van-col>
    </van-row>
    <van-row type="flex"
             class="count-wrap">
      <van-list :span="24"
                class="van-list-container">
        <van-cell>
          <span class="fl"
                style="width: 45%;">红包名称</span>
          <span class="fl"
                style="width: 20%;">金额</span>
          <span class="fl"
                style="width: 35%;">时间</span>
          <!-- <span class="fl"
                style="width: 25%;"></span> -->
        </van-cell>
        <van-cell v-for="item in packetList"
                  :key="item.index">
          <span class="fl vote-time-wrap font_14"
                style="width: 45%;">{{item.description}}</span>
          <span class="fl vote-time-wrap font_14"
                style="width: 20%;">{{item.amount|handleAmount|parseNum}}</span>
          <span class="fl vote-time-wrap font_14"
                style="width: 35%;">{{item.timeStr}}</span>
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
      packetList: [],
      receiveTotalNumber: 1,
      contract: {
        address: this.$contract_address,
        instance: null
      }
    }
  },
  created () {
    this.initInstance();
    this.getUrlQuery();
  },
  mounted () {
    this.queryReceiveRecord();
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
      this.account = this.$route.query.account;
    },
    /**
        * 获取红包领取详情
        */
    async queryReceiveRecord () {
      const that = this;
      //   console.log("queryReceiveRecord  ")
      this.contract.instance.queryReceiveRecord.call(this.account, 0, function (err, res) {
        if (err) {
          console.log(err)
        } else {
          let str = res.toString()
          let strSlice = "0x" + str.slice(10);
          if (str.indexOf("0x08c379a0") == 0) {
            let resStr = that.$Web3.eth.abi.decodeParameter("string", strSlice)
            console.log(resStr)
          } else {
            let packetInfoTmp = that.$Web3.eth.abi.decodeParameters(that.contract.instance.abi[12].outputs, res)
            for (let i = 0; i < packetInfoTmp.totalNum; i++) {
              console.log("queryReceiveRecord  " + i)
              console.log(that.account)
              that.contract.instance.queryReceiveRecord.call(that.account, i, function (err, res) {
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
                    let packetInfo = that.$Web3.eth.abi.decodeParameters(that.contract.instance.abi[12].outputs, res)
                    console.log(packetInfo)
                    let record = {};
                    record.packetAddr = packetInfo.packetAddr
                    record.account = packetInfo.account
                    record.description = packetInfo.description
                    record.amount = that.$Web3.utils.fromWei(packetInfo.amount);
                    record.time = new Date(packetInfo.time * 1000);//startTime.toLocaleDateString()+" "+startTime.toTimeString().split(" ")[0]
                    record.timeStr = record.time.toLocaleDateString() + " " + record.time.toTimeString().split(" ")[0].slice(0, 5)
                    that.pushList(record);
                  }
                }
              });
            }
          }
        }
      })
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
.font_14 {
  font-size: 14px;
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