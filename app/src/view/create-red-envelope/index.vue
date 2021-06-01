<template>
  <div>
    <van-row type="flex"
             justify="center">
      <van-col span="24">
        <!-- <van-nav-bar title="发红包"
                     right-text="设置"
                     @click-right="goSetting" /> -->
        <van-nav-bar title="发红包" />
      </van-col>
    </van-row>

    <van-row type="flex"
             justify="center"
             class="container mt_30">
      <van-col span="22">
        <van-field v-if="packet.isRandom"
                   v-model="packet.amount"
                   label="总金额"
                   placeholder="0.00"
                   required
                   maxlength=10
                   type="number"
                   input-align="right" />
        <van-field v-else
                   v-model="packet.amount"
                   label="单个金额"
                   placeholder="0.00"
                   maxlength=10
                   required
                   type="number"
                   input-align="right" />
        <p v-if="packet.isRandom"
           class="des-text-style">余额:{{balance|handleAmount3}}，当前为拼手气红包，<span @click="typeChange(0)">改为普通红包</span></p>
        <p v-else
           class="des-text-style">余额:{{balance|handleAmount3}}，当前为普通红包，<span @click="typeChange(1)">改为拼手气红包</span></p>
      </van-col>
    </van-row>

    <van-row type="flex"
             justify="center"
             class="mt_10">
      <van-col span="22">
        <van-field v-model="packet.total"
                   label="红包个数"
                   placeholder="填写个数"
                   required
                   maxlength=3
                   type="number"
                   :rules="[{ required: true, message: '红包个数最大不能超过100' }]"
                   input-align="right" />
        <p class="des-text-style">红包个数最大不能超过100</p>
      </van-col>
    </van-row>

    <van-row type="flex"
             justify="center"
             class="mt_10">
      <van-col span="22">
        <van-field v-model="packet.description"
                   rows="1"
                   autosize
                   label=""
                   type="textarea"
                   maxlength="22"
                   show-word-limit
                   placeholder="恭喜发财，大吉大利" />
      </van-col>
    </van-row>

    <van-row type="flex"
             justify="center"
             class="mt_30">
      <van-col span="22">
        <p v-if="packet.isRandom"
           class="total-amount">{{packet.amount === ''||packet.amount === '.' ? '0.00' :  Number(packet.amount)}}</p>
        <p v-else
           class="total-amount">{{packet.amount === ''||packet.amount === '.' ? '0.00' : Number(packet.amount) * Number(packet.total)}}</p>
      </van-col>
    </van-row>

    <van-row type="flex"
             justify="center"
             class="mt_30">
      <van-col span="22">
        <van-button type="info"
                    style="width: 100%"
                    @click="handleCreate">塞币进红包</van-button>
      </van-col>
    </van-row>
    <!-- <van-row type="flex"
             justify="center"
             class="mt_30">
      <van-col span="22"> -->

    <!-- <van-button type="info"
                    style="width: 100%"
                    @click="create_key2">发合约</van-button>
      </van-col> -->
    <!-- </van-row> -->
    <van-row type="flex"
             justify="center"
             class="des-text-style recycle-text">
      <van-col span="22">
        未领取的红包，可在24小时后收回。
      </van-col>
    </van-row>
  </div>
</template>

<script>
import { debounceHign } from '@/utils/request-limit'
export default {
  name: "index",
  data () {
    return {
      balance: 0,
      packet: {
        amount: '',
        description: '',
        isRandom: true,
        total: 1,
        owner: '',
        redPacketAccount: ''
        // address: sessionStorage.getItem('address')
      },
      contract: {
        instance: null,
        // address: "0xFFca4D048Ff11101bb3B5Ba26AEbad2504BE4705",
        address: this.$contract_address,
      },
    }
  },
  created () {
    this.create_key();
  },
  mounted () {
    this.initInstance();
    this.getBalance();
  },
  methods: {
    /**
     * 获取合约实例
     * @returns {Promise<void>}
     */
    async initInstance () {
      //初始化红包公私钥
      const redPacketAccount = this.$Web3.eth.accounts.create();
      this.$Web3.eth.accounts.privateKeyToAccount(redPacketAccount.privateKey)
      window.redPacketAccount = redPacketAccount;
      console.log(redPacketAccount)
      console.log(redPacketAccount.address)
      // web3获取合约实例
      console.log("account");
      const gasPrice = this.$chain3.mc.gasPrice;
      console.log(gasPrice.toString(10));
      const networkId = this.$chain3.version.network
      const deployedNetwork = this.$RedPacketArtifact.networks[networkId];

      this.contract.instance = this.$chain3.mc.contract(
        this.$RedPacketArtifact.abi
        // deployedNetwork.address,
      ).at(this.contract.address);
      window.instance = this.contract.instance;
     
    },
    handleCancel () {
      // this.$router.push({path: '/packet-details'});
      this.$router.push({ path: '/homepage' });
    },
    // async handleCreate :handleUserVote {
    handleCreate: debounceHign(function () {

      // setTimeout(function () { alert("Hello"); }, 3000);
      console.log(Number(this.packet.total))
      if (this.packet.total === '' || Number(this.packet.total) < 1 || parseInt(this.packet.total) != Number(this.packet.total)) {
        this.$toast('请填写正确的红包个数');
        return false;
      }
      if (Number(this.packet.total) > 100) {
        this.$toast('红包个数最大不能超过100个');
        return false;
      }
      let totalValue = this.packet.isRandom ? Number(this.packet.amount) : Number(this.packet.amount) * Number(this.packet.total);
      if (this.packet.amount === '' || this.packet.amount === '.' || totalValue / Number(this.packet.total) < 0.01) {
        this.$toast('单个红包的金额至少0.01moac');
        return false;
      }
      if (totalValue > this.balance) {
        console.log(new Date())
        this.$toast('红包金额大于钱包余额');
        return false;
      }
      if (this.packet.description === '') this.packet.description = '恭喜发财，大吉大利';

      const { createRedPacket } = this.contract.instance;
      const that = this;
      // web3调用合约 估算合约方法gas用量

      // window.createRedPacket = createRedPacket
      //初始化红包公私钥
      this.packet.redPacketAccount = this.$Web3.eth.accounts.create();
      console.log("this.packet.redPacketAccount.privateKey");
      console.log(this.packet.redPacketAccount.privateKey);
      const inputData = createRedPacket.getData(this.packet.total, this.packet.isRandom, this.packet.description, this.packet.redPacketAccount.address);
      console.log(inputData);
      console.log(this.packet.owner);
      // const gasLimit = this.$chain3.mc.estimateGas({ to: this.contract.address, data: inputData }) + 350000;
      const gasLimit =  360000;
      console.log('gasLimit', gasLimit);
      console.log('system', this.$system);
      const query = {
        from: this.packet.owner,
        to: this.contract.address,
        gasPrice: this.$system == "ios" ? this.getGasPrice() : this.$Web3.utils.toHex(this.getGasPrice()),
        // gasPrice: 1000000000,
        gasLimit: this.$system == "ios" ? gasLimit : this.$Web3.utils.toHex(gasLimit),
        data: inputData,
        value: this.$system == "ios" ? this.$chain3.toSha(totalValue, "mc") : this.$Web3.utils.toHex(this.$chain3.toSha(totalValue, "mc")),
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
          const qrCodeMsg = this.packet.redPacketAccount.privateKey;
          // this.$toast('操作成功')
          this.$router.push({ path: '/create-success', query: { key: this.packet.redPacketAccount.privateKey, dc: this.packet.description, ow: this.packet.owner } });
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
        console.log(error);
      });
      // this.$router.push({ path: '/create-success', query: { key: this.packet.redPacketAccount.privateKey } });
    }, 2000),
    typeChange (type) {
      type === 1 ? this.packet.isRandom = true : this.packet.isRandom = false;
    },
    getGasPrice () {
      const gasPrice = this.$chain3.mc.gasPrice;
      console.log("gasPrice.toString():" + gasPrice.toString())
      return gasPrice.toString();
    },
    //初始化钱包地址和红包公私钥
    create_key () {
      let account = this.$route.query.account;
      console.log("create_key" + account)
      this.packet.owner = account;

    },
    //初始化钱包地址和红包公私钥
    getBalance () {
      this.balance = this.$Web3.utils.fromWei(this.$chain3.mc.getBalance(this.packet.owner).toString(10))
      // this.balance=5511.248
    },
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
    handleAmount3 (amount) {
      return Math.floor(Number(amount * 100)) / 100;
    },
    parseNum (amount) {
      return parseFloat(amount);
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
  color: #8e8b8b;
  font-size: 12px;
  line-height: 25px;
  span {
    color: #cc8b21;
  }
}
.total-amount {
  text-align: center;
  font-size: 40px;
  font-weight: bold;
}
.recycle-text {
  text-align: center;
  font-size: 12px;
  bottom: 0px;
  margin-top: 10px;
}
</style>