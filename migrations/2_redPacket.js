
var RedPacket = artifacts.require('RedPacket.sol')

module.exports = function (deployer) {
  deployer.deploy(RedPacket,24*3600,10*10000*10000*10000,100)
}
