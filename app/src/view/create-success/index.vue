<template>
  <div>
    <div class="success-container"
         ref="imgref">
      <div class="_top"
           id="qrCode"
           ref="qrCodeDiv"></div>
      <div class="packet"
           ref="title">墨客红包</div>
      <div class="tp"
           ref="tp">请使用TP钱包扫描领取</div>
      <div class="_bottom"
           ref="bottom">
        <svg t="1604565796713"
             class="icon"
             viewBox="0 0 1024 1024"
             version="1.1"
             xmlns="http://www.w3.org/2000/svg"
             p-id="2434"
             width="500"
             height="500">
          <path d="M183.912765 45.978191h650.262989v932.700449H183.912765z"
                fill="#E83828"
                p-id="2435"
                data-spm-anchor-id="a313x.7781069.0.i2"
                class=""></path>
          <path d="M186.54009 45.978191h651.576652L512.328416 534.003849z"
                fill="#C30D23"
                p-id="2436"
                data-spm-anchor-id="a313x.7781069.0.i1"
                class="selected"></path>
          <path d="M512.328416 507.730597m-191.137909 0a191.137909 191.137909 0 1 0 382.275818 0 191.137909 191.137909 0 1 0-382.275818 0Z"
                fill="#EBC14C"
                p-id="2437"
                data-spm-anchor-id="a313x.7781069.0.i0"
                class="selected"></path>
        </svg>
      </div>
      <!--<img src="" alt="">-->
      <!-- <p class="mt_20">截图保存</p> -->
    </div>
    <div class="btns">
      <p>
        <van-button type="info"
                    @click="scanBtn">扫一扫</van-button>
      </p>
      <p class="mt_20"
         v-if="isShow">
        <van-button type="info"
                    @click="screenShot">点击保存红包截图</van-button>
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
        packetAddr: ""
      },
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
      console.log('key', this.qrCode.key);
    },
    initQRCodeView () {
      new QRCode(this.$refs.qrCodeDiv, {
        // text: 'http://192.168.100.125:8081/#/get-packet?key=' + this.qrCode.key,
        text: 'http://47.92.110.121/redPacket/#/get-packet?key=' + this.qrCode.key,
        width: 120,
        height: 120,
        colorDark: "#333333", //二维码颜色
        colorLight: "#ffffff", //二维码背景色
        correctLevel: QRCode.CorrectLevel.L//容错率，L/M/H
      })
      this.$refs.qrCodeDiv.style.top = '50%'
      this.$refs.qrCodeDiv.style.marginTop = '-130px'
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
        backgroundColor: null,//画出来的图片有白色的边框,不要可设置背景为透明色（null）
        useCORS: true,//支持图片跨域
        scale: 1,//设置放大的倍数
      }).then((canvas) => {// 第一个参数是需要生成截图的元素,第二个是自己需要配置的参数,宽高等
        let img = canvas.toDataURL('image/png');
        this.$tp.saveImage({
          url: img
        });
      })

    }
  }
}
</script>

<style scoped lang="less">
.success-container {
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  p {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
  }
}
._top {
  position: absolute;
  z-index: 99;
  margin-top: 10px;
  top: 225px;
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
  position: absolute;
  z-index: 99;
  top: 450px;
  left: 80px;
  font-size: 20px;
}
.packet {
  position: absolute;
  z-index: 99;
  top: 120px;
  left: 150px;
  font-size: 20px;
}
</style>