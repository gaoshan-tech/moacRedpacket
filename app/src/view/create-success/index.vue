<template>
    <div class="success-container">
        <div class="qrcode-wrap" id="qrCode" ref="qrCodeDiv"></div>
        <!--<img src="" alt="">-->
        <p class="mt_20">截图保存</p>
        <p class="mt_20">
            <van-button type="info" @click="scanBtn">模拟扫一扫</van-button>
        </p>
    </div>
</template>

<script>
    import QRCode from 'qrcodejs2';
    export default {
        name: "index",
        data() {
            return {
                qrCode: {
                    packetId: null,
                    // key: null,
                    sign: null
                }
            }
        },
        created() {
            this.getUrlParams();
        },
        mounted() {
            this.initQRCodeView();
        },
        methods: {
            getUrlParams() {
                this.qrCode.packetId = this.$route.query.packetId;
                this.qrCode.sign = this.$route.query.sign;
                // this.qrCode.key = this.$route.query.key;
                console.log('packetId', this.qrCode.packetId);
                console.log('sign', this.qrCode.sign);
            },
            initQRCodeView() {
                new QRCode(this.$refs.qrCodeDiv, {
                    text: 'http://dapp.tokenpocket.pro/share/index.html?url=http://http://192.168.19.195:8081/&from=singlemessage&isappinstalled=0#/packet-details',
                    width: 200,
                    height: 200,
                    colorDark: "#333333", //二维码颜色
                    colorLight: "#ffffff", //二维码背景色
                    correctLevel: QRCode.CorrectLevel.L//容错率，L/M/H
                })
            },
            scanBtn() {
                this.$router.push({path: '/packet-details', query: {packetId: this.qrCode.packetId, sign: this.qrCode.sign}});
            }
        }
    }
</script>

<style scoped lang="less">
.success-container {
    height: 100vh;
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
</style>