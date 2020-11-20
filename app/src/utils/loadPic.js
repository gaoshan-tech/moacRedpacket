// export function getBase64Str(url, callback) {
//     var image = new Image();
//     var base64;
//     image.setAttribute("crossOrigin", 'Anonymous')
//     image.src = url;
//     image.onload = function () {
//         // 默认按比例压缩
//         var w = image.width,
//             h = image.height,
//             scale = w / h;
//         w = 200;
//         h = w / scale;
//         // 默认图片质量为0.7，quality值越小，所绘制出的图像越模糊
//         var quality = 0.7;
//         //生成canvas
//         var canvas = document.createElement('canvas');
//         var ctx = canvas.getContext('2d');
//         // 创建属性节点
//         var anw = document.createAttribute("width");
//         anw.nodeValue = w;
//         var anh = document.createAttribute("height");
//         anh.nodeValue = h;
//         canvas.setAttributeNode(anw);
//         canvas.setAttributeNode(anh);
//         ctx.drawImage(image, 0, 0, w, h);
//         var ext = image.src.substring(image.src.lastIndexOf(".") + 1).toLowerCase();//图片格式
//         base64 = canvas.toDataURL("image/" + ext, quality);
//         callback(base64);
//     };
// }