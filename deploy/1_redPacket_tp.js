var Chain3 = require('chain3');
var chain3 = new Chain3(new Chain3.providers.HttpProvider("https://chain3.mytokenpocket.vip"));
 
// var abiString = '[{"constant":true,"inputs":[],"name":"name",......"type":"event"}]';     //编译结果的abi
var bytecodeString = '606060405234801561001057600080fd5b5060......75fd0029';              //编译结果的bytecode
// var account = {address:"0x745c57ca5318093115d61bbca368XXXXXXXXXXXX",secret:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"};
 
createContract(chain3, account, abiString, bytecodeString);
 
function createContract(chain3, account, abiString, bytecodeString){
    var bytecode = "0x" + bytecodeString;
    var abi = JSON.parse(abiString);
 
    console.log('bytecode', bytecode);
    console.log('abi', abiString);
 
    var gasValue = chain3.mc.estimateGas({data: bytecode});
    console.log("gas estimate on contract:", gasValue);
 
    var address = account.address;
    var secret = account.secret;
 
    var txCount = chain3.mc.getTransactionCount(address);
    console.log("get tx account", txCount)
    
    var rawTx = {
        from: address,
        nonce: chain3.intToHex(txCount),
        gasPrice: chain3.intToHex(25000000000),
        gasLimit: chain3.intToHex(400000),
        data: bytecode,
        chainId: chain3.version.network,
    };
 
    var signedTx = chain3.signTransaction(rawTx, account.secret);
 
    console.log("send signed tx:", signedTx);
    console.log("len", signedTx.length);
 
    chain3.mc.sendRawTransaction(signedTx, function(err, hash) {
        if (!err){
            console.log("succeed: ", hash);
        }else{
            console.log("error:", err.message);
        }
    });
}