
var RedPacket = artifacts.require('RedPacket.sol')

module.exports = function (deployer) {
  deployer.deploy(RedPacket,60,100000)
}
