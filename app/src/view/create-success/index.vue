<template>
  <div>
    <div class="success-container"
         ref="imgref">
      <div class="_top"
           id="qrCode"
           ref="qrCodeDiv"></div>
      <div class="packet"
           ref="title">{{ow|handleStr}}的红包</div>
      <div class="dc"
           ref="dc">{{dc}}</div>
      <div class="tp"
           ref="tp">请使用TP钱包扫描领取</div>
    </div>
    <div class="btns">
      <p>
        <van-button type="info"
                    @click="scanBtn">点击领取红包</van-button>
      </p>
      <p class="mt_20"
         v-if="isShow">
        <van-button type="info"
                    @click="screenShot">保存红包到相册</van-button>
      </p>

    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2';
import html2canvas from 'html2canvas'
export default {
  name: "index",
  data () {
    return {
      qrCode: {
        key: "0x0",
        packetAddr: "",
      },
      dc: "0x",
      ow: "0x",
      imgsrc: '',
      isShow: true
    }
  },
  created () {
    this.getUrlParams();
  },
  mounted () {
    this.initQRCodeView();
  },
  methods: {
    getUrlParams () {
      this.qrCode.key = this.$route.query.key;
      this.dc = this.$route.query.dc;
      // this.dc = "大方李杰了阿斯顿发了阿斯顿的李康分阿索罗地方"
      this.ow = this.$route.query.ow;
      console.log('key', this.qrCode.key);
    },
    initQRCodeView () {
      new QRCode(this.$refs.qrCodeDiv, {
        // text: 'http://192.168.100.125:8081/#/get-packet?key=' + this.qrCode.key,
        text: 'http://47.92.110.121/redPacket/#/get-packet?key=' + this.qrCode.key,
        width: 230,
        height: 230,
        // colorDark: "#E83828", //二维码颜色
        colorDark: "#333", //二维码颜色
        colorLight: "#ffffff", //二维码背景色
        correctLevel: QRCode.CorrectLevel.L//容错率，L/M/H
      })
      // this.$nextTick(() => {
      //   let qrCodedom = document.getElementById('qrCode')
      //   let img = qrCodedom.getElementsByTagName('img')[0]
      //   setTimeout(() => {
      //     this.imgsrc = img.src
      //   }, 1000)
      // })
      this.$refs.qrCodeDiv.style.top = '50%'
      this.$refs.qrCodeDiv.style.marginTop = - (this.$refs.qrCodeDiv.offsetHeight / 2) + 'px'
      this.$refs.title.style.top = this.$refs.bottom.offsetTop + 88 + 'px'
      this.$refs.tp.style.top = this.$refs.bottom.offsetTop + this.$refs.bottom.offsetHeight - 105 + 'px'

    },
    scanBtn () {
      this.$router.push({ path: '/get-packet', query: { key: this.qrCode.key } });
    },
    screenShot () {
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
      // this.isShow=false;
      html2canvas(this.$refs.imgref, {
        // width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        // height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
        // backgroundColor: null,//画出来的图片有白色的边框,不要可设置背景为透明色（null）
        useCORS: true,//支持图片跨域
        scale: 1,//设置放大的倍数
      }).then((canvas) => {// 第一个参数是需要生成截图的元素,第二个是自己需要配置的参数,宽高等
        let img = canvas.toDataURL('image/png');
        this.$tp.saveImage({
          url: img
        });
      })

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

<style lang="less">
.success-container {
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  p {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
  }
}
.box {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  img {
    width: 100%;
    height: 100%;
  }
}
._top {
  position: absolute;
  z-index: 99;
  margin-top: 10px;
  top: 225px;
  background-size: cover;
  img {
    display: block;
  }
}
._bottpm {
  position: absolute;
  z-index: 1;
  top: 50px;
}
.btns {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .mt_20 {
    margin-top: 10px;
  }
}
.tp {
  color: #ebc14c;
  position: absolute;
  z-index: 99;
  top: 450px;
  left: 80px;
  font-size: 20px;
}
.packet {
  color: #ebc14c;
  position: absolute;
  z-index: 99;
  // top: 120px;
  top: 40px;
  justify-content: center;
  font-size: 20px;
}
.dc {
  color: #ebc14c;
  position: absolute;
  z-index: 99;
  // top: 120px;
  top: 70px;
  justify-content: center;
  font-size: 18px;
  text-align: center;
  // white-space: nowrap;
  width: 216px;
  word-wrap: break-word;
  word-break: normal;
}
</style>