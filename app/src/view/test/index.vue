// <template>
//     <div style="background: #cccccc">
//         <div style="width: 100%; height: 200px; margin-bottom: 20px" v-for="item in imgData">
//             <img :src="getBase64Img(item.url) || item.url" alt="" style="width: 100%; height: 100%;">
//         </div>
//     </div>
// </template>

// <script>
//     import { getBase64Str } from '@/utils/loadPic'
//     export default {
//         name: "index",
//         data() {
//             return {
//                 imgData: []
//             }
//         },
//         mounted() {
//             this.imgData = [
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=169'
//                 },
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=168'
//                 },
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=167'
//                 },
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=166'
//                 },
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=165'
//                 },
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=164'
//                 },
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=163'
//                 },  {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=165'
//                 },
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=164'
//                 },
//                 {
//                     url: 'http://47.92.110.121:18080/moac-vote/vote/showPic?fileId=163'
//                 }
//             ];
//             const that = this;
//             this.imgData.map(d => {
//                 getBase64Str(d.url, function(res) {
//                     sessionStorage.setItem(d.url, res);
//                     // that.$db.add('imgUrl', {name: d.url, key: res});
//                     that.$db.add('t1', {name: d.url, key: res});
//                 })
//             })
//             // this.$db.add('t1', {name: '张三', key: 18});
//         },
//         methods: {
//             getBase64Img(imgUrl) {
//                 return sessionStorage.getItem(imgUrl);
//             },
//         }
//     }
// </script>

// <style scoped>

// </style>