// //公钥
// var PUBLIC_KEY =
//   'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8HMr2CBpoZPm3t9tCVlrKtTmI4jNJc7/HhxjIEiDjC8czP4PV+44LjXvLYcSV0fwi6nE4LH2c5PBPEnPfqp0g8TZeX+bYGvd70cXee9d8wHgBqi4k0J0X33c0ZnW7JruftPyvJo9OelYSofBXQTcwI+3uIl/YvrgQRv6A5mW01QIDAQAB'
// //私钥
// var PRIVATE_KEY =
//   'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBALwcyvYIGmhk+be320JWWsq1OYjiM0lzv8eHGMgSIOMLxzM/g9X7jguNe8thxJXR/CLqcTgsfZzk8E8Sc9+qnSDxNl5f5tga93vRxd5713zAeAGqLiTQnRffdzRmdbsmu5+0/K8mj056VhKh8FdBNzAj7e4iX9i+uBBG/oDmZbTVAgMBAAECgYEAmgNU5NTDkj9B+Pnt6UU8doSjw3+3j+bV2K2yS3QUOvAUus/Ax7x6ktjWxzCXvDY9IfUil2RNv9vtKEAqYLCWjc+lf8PV/yH1b7NEgyeAPBXtAJRoOnmYL2bdPW92kP9KgxJruF6Dz/C5AmMOncsvq8ABD+9Darn4p8dwj2ZC4O0CQQDf/AHmZsQokEItfCy4mHS9UbxbfIhEUv1ApPh/+Sr7NkJkHWYCtBQo+8jKO6zurAZQgWBPD1XX2UE4R+VIiZazAkEA1wAqtMvGhccyRZr+6kpkpDIa8+9jOE+nGUzqTDvgCID6as8AzOONFVVK6m/UUqkhcJ8Qu1pF36BGojy5BX2KVwJBAJSFpbji0hXXupowqfLp3RcgmNbNWAp+QUJZYhJx5cdYbmO2fssyH+AhPT6knYJR/YnqkDM8hv6vKCkqu2YDHjMCQAOA8TE5EOclM+CGghj3VWSHnIDVKdzFD4gOBNNxNlltIKeU8AJmwunSFgJ0CBXAw9a+ANvMwM7AIeaK7sj0HskCQAvxfDCq7gaNx+pfu0FHG8Gix08A/A6foggBl1fVu+L9sr9ZuOQ3HbXnl28F9ewuB9xdjnLUDjp7W7U0pB+vKoQ='
// //使用公钥加密
// var encrypt = new JSEncrypt()
// //encrypt.setPrivateKey('-----BEGIN RSA PRIVATE KEY-----'+PRIVATE_KEY+'-----END RSA PRIVATE KEY-----');
// encrypt.setPublicKey(
//   '-----BEGIN PUBLIC KEY-----' + PUBLIC_KEY + '-----END PUBLIC KEY-----'
// )
// var encrypted = encrypt.encrypt('ceshi01')
// console.log('加密后数据:%o', encrypted)
// //使用私钥解密
// var decrypt = new JSEncrypt()
// //decrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + PUBLIC_KEY + '-----END PUBLIC KEY-----');
// decrypt.setPrivateKey(
//   '-----BEGIN RSA PRIVATE KEY-----' +
//     PRIVATE_KEY +
//     '-----END RSA PRIVATE KEY-----'
// )
// var uncrypted = decrypt.decrypt(encrypted)
// console.log('解密后数据:%o', uncrypted)

var NodeRSA = require('node-rsa')
function generateKeyPair() {
  // pkcsType = pkcsType ? pkcsType : 'pkcs8' //不为空则 设置为传入参数，为空则 设置为 pkcs8
  var pkcsType = 'pkcs8' //不为空则 设置为传入参数，为空则 设置为 pkcs8
  console.log('pkcsType=' + pkcsType)

  //1.创建RSA对象，并指定 秘钥长度
  var pkcsSize = 1024
  var key = new NodeRSA({ b: pkcsSize })
  key.setOptions({ encryptionScheme: 'pkcs1' }) //指定加密格式

  //2.生成 公钥私钥，使用 pkcs8标准，pem格式
  var publicPem = key.exportKey(pkcsType + '-public-pem') //制定输出格式
  var privatePem = key.exportKey(pkcsType + '-private-pem')
  //console.log(key.$options);
  console.log(pkcsType + '公钥:\n', publicPem)
  console.log(pkcsType + '私钥:\n', privatePem)

  //---------------------测试1：服务端私钥加密公钥解密------------------------
  //3.使用 私钥 加密 数据，并指定 字符编码 和 字符集
  var encryData = key.encryptPrivate(
    '服务端测试 -> jameszou love code~~~',
    'base64',
    'utf8'
  )
  console.log('\n私钥加密后的数据：\n', encryData) //加密后数据为 base64 编码

  //4.使用 公钥 解密 数据，并指定字符集
  var decryptData = key.decryptPublic(encryData, 'utf8')
  console.log('\n公钥解密后的数据：\n', decryptData)

  //---------------------测试2：服务端加载公钥后解密------------------------
  //1.创建RSA对象，并指定 秘钥长度
  var key2 = new NodeRSA({ b: pkcsSize })
  //2.导入 公钥，并指定使用 pkcs标准，pem格式
  key2.importKey(publicPem, pkcsType + '-public-pem')

  //3.使用 公钥 解密数据
  var decrypted = key2.decryptPublic(encryData, 'utf8')
  console.log('\n使用公钥解密后的数据：\n', decrypted)
}

function rastest() {
  const a_public_key_data = `-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDfPt3gCblrxbA7SL1z/nCjrSDq
    9iTQ3BuhIaRcxzmJN0G3z4Ks8ckVc+yCZlOJl8Zpl2AUjeV+VJgxkeygF29RjlR7
    hf4Lt9nhUN8Z7uc0z1M4IZx/j3sTs59ThBefYsE15UTLcL51BXUfNFaOBpgQla7s
    TzqIdjlxij4R1IwkDQIDAQAB
    -----END PUBLIC KEY-----`
  const a_private_key_data = `-----BEGIN RSA PRIVATE KEY-----
  MIICXAIBAAKBgQDfPt3gCblrxbA7SL1z/nCjrSDq9iTQ3BuhIaRcxzmJN0G3z4Ks
  8ckVc+yCZlOJl8Zpl2AUjeV+VJgxkeygF29RjlR7hf4Lt9nhUN8Z7uc0z1M4IZx/
  j3sTs59ThBefYsE15UTLcL51BXUfNFaOBpgQla7sTzqIdjlxij4R1IwkDQIDAQAB
  AoGAQEoBaThDrnaSpq/u5w158Ji15xQVTBRm3IMsqw8wUYSZJ07Z6eYDK2tjy7We
  DvynRdcy8xhd44CHB5dnVj8JbiBX26i05fkOy3vtWtWWPQi+lIBLPOYiJA3Jeu01
  KrRUKpDjDx9jz5bV3RQNIKhy6oWAmzqZw84w2H5Yu1GeNl0CQQD2NzMllvxh1b03
  2CF0KNvEJo83VmpGoNNnljKaMwuDXeog+NGEkOL89iBZLmaErdaUIKXMi7rKBHTe
  zc4KoeMrAkEA6B388AOtofBiS0kLumLxW6S27cbjOiJ6kgi2QuoZeYjwP1Sd2vBJ
  d/0ooqwO2m2ZBMhHvfWJNsj97bX9d2VZpwJBAK9Ruv/HNUtM8QF0ys110pcnhc83
  n1FPb3lRQBMAye/uzapQwpAMwzSw5XPbUHClgCfV33l4/baf2cBU96QmhiUCQAqq
  9ikBwkUjCyFypftW+MjBdTbQYTkWxJNZmybQI4OWa5Q9i1O4n2fIVsnDJpubVeEG
  Y2Wzly7RZfo61v9ZxRkCQDwTiiLUD7w6IE9CHhz6j1yI6P1Nn+wuymu7YMXG0zjs
  H6knPQhmeq6EXguCWPVvCIGbHZn16g+s9jkUEq48V+Y=
  -----END RSA PRIVATE KEY-----`

  const b_public_key_data =
    '-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----'
  const b_private_key_data =
    '-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----'

  // 生成 A 的公私钥对象
  const a_public_key = new NodeRSA(a_public_key_data)
  const a_private_key = new NodeRSA(a_private_key_data)
  // console.log('a_public_key', a_public_key);
  // console.log('a_private_key', a_private_key);
  // const a_private_key = new NodeRSA({ b: 1024 })
  // var privateDer = a_private_key.exportKey('pkcs1-private-pem') //私钥
  //导入私钥
  //key.importKey(privateDer, “pkcs1-private-pem”);
  // a_private_key.importKey(a_private_key_data, 'pkcs1-private-pem')
  //  a_private_key = new NodeRSA(a_private_key_data,'pkcs1-private-pem')

  var publicPem = a_private_key.exportKey('public') //制定输出格式
  // console.log('publicPem', publicPem)

  // var publicPem1 = a_public_key.exportKey('public') //制定输出格式
  // console.log(publicPem1)
  // console.log(a_private_key.getKeySize())

  // 生成 B 的公私钥对象
  // const b_public_key = new NodeRSA(b_public_key_data)
  // const b_private_key = new NodeRSA(b_private_key_data)

  const text = 'hello world'
  const test2='5ec1a3441a1c49387fff9876ab8c5ae69101f02729b1cea7ce2615c0a1ef849b7d530d03e39c14bfa8a9229786bffe889f09547b';
  // const test2='f140e26f544c05e0be759dcec350364fa6df237a02f1ed14263fde3bc5ee3c769724b41e05f408a1f407d40a1fd5aaae068d6929'
  /*
  https://github.com/rzcoder/node-rsa/blob/master/README.md
    Encrypting/decrypting
  key.encrypt(buffer, [encoding], [source_encoding]);
  key.encryptPrivate(buffer, [encoding], [source_encoding]); // use private key for encryption
    Return encrypted data.
  buffer — {buffer} — data for encrypting, may be string, Buffer, or any object/array. Arrays and objects will encoded to JSON string first.
  ncoding — {string} — encoding for output result, may be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
  source_encoding — {string} — source encoding, works only with string buffer. Can take standard Node.js Buffer encodings (hex, utf8, base64, etc). 'utf8' by default.
  key.decrypt(buffer, [encoding]);
  key.decryptPublic(buffer, [encoding]); // use public key for decryption
  */
   // 加签并验签
   const sign1 = a_private_key.sign(test2, 'hex', 'hex')
   console.log('A 私钥加签:', sign1)

   const verify1 = a_public_key.verify(test2, sign1, 'hex', 'hex')
   console.log('A 公钥验签:', verify1)

  // 加签并加密
  const sign = a_private_key.sign(text, 'base64', 'utf8')
  console.log('A 私钥加签:', sign)

  const encrypted = a_public_key.encrypt(sign, 'base64')
  console.log('B 公钥加密:', encrypted)

  // 解密并验签
  const decrypted = a_private_key.decrypt(encrypted, 'utf8')
  console.log('B 私钥解密:', decrypted)

  const verify = a_public_key.verify(text, decrypted, 'utf8', 'base64')
  console.log('A 公钥验签:', verify)
}
rastest()
