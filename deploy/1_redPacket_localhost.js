var fs = require('fs')
var path = require('path')
var Chain3 = require('chain3')
var networkFile = fs.readFileSync(path.join(__dirname, 'network.txt'), 'utf-8')
var network = JSON.parse(networkFile)
var chain3 = new Chain3(new Chain3.providers.HttpProvider(network.url))
chain3.personal.unlockAccount(chain3.mc.accounts[1], network.password, 300)
var name = 'RedPacket'
var addressFile = fs.readFileSync(path.join(__dirname, 'address.txt'), 'utf-8')
var address = JSON.parse(addressFile)

var data = fs.readFileSync(
  path.join(__dirname, '../build/contracts/' + name + '.json'),
  'utf-8'
)
var build = JSON.parse(data)
var abi = build.abi
// console.log(abi);
var cdata = build.bytecode
// console.log(cdata);
var contract = chain3.mc.contract(abi)
var deployedContract = contract.new(
  60,
  10000000000,
  100,
  {
    from: chain3.mc.accounts[1],
    data: cdata,
    gasPrice: network.gasPrice,
    gas: '9000000',
  },
  function (e, contract) {
    if (e) {
      console.log(e)
    }
    if (contract && typeof contract.address !== 'undefined') {
      console.log(
        'Contract mined! address: ' +
          contract.address +
          ' transactionHash: ' +
          contract.transactionHash
      )
      address[name] = contract.address
      fs.writeFileSync(
        path.join(__dirname, 'address.txt'),
        JSON.stringify(address, null, '\t')
      )
    }
  }
)
