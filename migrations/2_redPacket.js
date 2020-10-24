
const SolRsaVerify = artifacts.require('SolRsaVerify.sol')
var RedPacket = artifacts.require('RedPacket.sol')

module.exports = function (deployer) {
  deployer.deploy(SolRsaVerify)
  deployer.link(SolRsaVerify, RedPacket)
  deployer.deploy(RedPacket)
}
