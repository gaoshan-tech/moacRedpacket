pragma solidity ^0.6.0;

import "./libs/SolRsaVerify.sol";
import "./libs/SafeMath.sol";


/* 
    红包合约
    发起人发送一定金额的红包，分
    墨客红包分三块功能：
    发红包端：
        1. H5形式，内嵌tp钱包中，H5跟合约通信，调用创建红包接口，用tp中的moac钱包支付费用创建红包；
        2. 用户创建红包需要选择参数是：红包金额、红包数量、红包类型（等分、随机）
        3. 创建好红包后，生成二维码，将二维码界面截图（为什么是截图，我担心tp不提供图片保存功能，也不提供分享到微信功能）发送到微信群里
    收红包端：
        1. H5形式，微信里，用户通过扫描红包发起者所发送的二维码，进入H5页面，跳转进入tb钱包
        2. 传入相应参数开始抢红包
    合约开发：
        1. 创建红包接口
        2. 抢红包接口
        3. 红包退回接口
        2. 查询用户红包记录
*/
contract RedPacket {
    using SolRsaVerify for *;
    using SafeMath for uint256;
    //红包类
    struct Packet {
        //红包id
        uint256 id;
        //红包所有者
        address owner;
        //公钥modulus 模数
        bytes pub_m;
        //公钥exponent 指数
        bytes pub_e;
        //红包发送时间
        uint256 startTime;
        //红包描述
        string description;
        //红包个数
        uint256 totalnumber;
        //红包剩余个数
        uint256 remainNumber;
        //是否是随机红
        bool isRandom;
        //红包总金额
        uint256 totalAmount;
        //红包剩余金额
        uint256 remainAmount;
        //已抢红包地址列表
        address[] addressArrary;
        //各地址所抢金额
        mapping(address => uint256) addressAmount;
    }
    //个人发送的红包数组
    mapping(address => uint256[]) private _ownedRedPacket;
    //红包id对应的红包
    mapping(uint256 => Packet) _redPacket;
    //默认的有效时间段
    uint256 validTime = 1000000;
    // 全局随机种子
    bytes32 seed;
    //创建红包事件 地址、红包id、金额、个数、红包描述、是否随机
    event CreatedRedPacketEvent(
        address,
        uint256,
        uint256,
        uint256,
        string,
        bool
    );
    //领取红包事件 地址、红包id、金额
    event ReceiveRedPacketEvent(address, uint256, uint256);
    //回收红包事件 回收的地址 、红包id、回收的金额
    event RecyclePacketEvent(address, uint256, uint256);

    //创建红包
    function createdRedPacket(
        uint256 totalnumber,
        bool isRandom,
        string memory description,
        bytes memory pub_e,
        bytes memory pub_m
    ) public payable returns (uint256 packetId) {
        //检查金额是否大于0
        require(msg.value > 0, "value must greater than 0");
        //检查红包个数大于0
        require(totalnumber > 0, "totalnumber must greater than 0");
        //检查pub_e
        require(pub_e.length > 0, "pub_e no null");
        //检查pub_m
        require(pub_m.length > 0, "pub_e no null");

        Packet memory packet;
        packet.id = uint256(
            keccak256(
                abi.encode(msg.sender, _ownedRedPacket[msg.sender].length)
            )
        );
        packet.owner = msg.sender;
        packet.description = description;
        packet.startTime = block.timestamp;
        packet.totalnumber = totalnumber;
        packet.remainNumber = totalnumber;
        packet.totalAmount = msg.value;
        packet.remainAmount = msg.value;
        packet.isRandom = isRandom;
        packet.pub_e = pub_e;
        packet.pub_m = pub_m;
        //红包存入发送者列表
        _ownedRedPacket[msg.sender].push(packet.id);
        //红包放入红包池
        _redPacket[packet.id] = packet;
        emit CreatedRedPacketEvent(
            msg.sender,
            packet.id,
            packet.totalAmount,
            totalnumber,
            description,
            isRandom
        );
        return packet.id;
    }

    //抢红包
    function receiveRedPacket(uint256 packetId, bytes memory sign)
        public
        returns (bool)
    {
        //检查红包是否存在
        require(_redPacket[packetId].id != 0, "packetId error");
        //检查红包是否抢完
        require(_redPacket[packetId].remainNumber > 0, "packet over ");
        //检查红包是否过期
        require(
            _redPacket[packetId].startTime + validTime > block.timestamp,
            " Red packet expired "
        );
        //检查红包是否抢过
        require(
            _redPacket[packetId].addressAmount[msg.sender] == 0,
            "packet have received"
        );
        //检查签名是否正确
        require(
            SolRsaVerify.pkcs1Sha256VerifyRaw(
                abi.encodePacked(msg.sender, packetId),
                sign,
                _redPacket[packetId].pub_e,
                _redPacket[packetId].pub_m
            ) == 0,
            "sign error"
        );
        uint256 amount = calculateRedPacket(packetId);
        msg.sender.transfer(amount);
        //抢红包事件
        emit ReceiveRedPacketEvent(msg.sender, packetId, amount);
        return true;
    }

    //获取红包基本信息
    function queryPacketInfo(uint256 packetId)
        public
        view
        returns (
            uint256 id,
            address owner,
            uint256 startTime,
            string memory description,
            uint256 totalnumber,
            uint256 remainNumber,
            bool isRandom,
            uint256 totalAmount,
            uint256 remainAmount
        )
    {
        Packet memory packet = _redPacket[packetId];
        //检查红包是否存在
        require(packet.id != 0, "packetId error");
        return (
            packet.id,
            packet.owner,
            packet.startTime,
            packet.description,
            packet.totalnumber,
            packet.remainNumber,
            packet.isRandom,
            packet.totalAmount,
            packet.remainAmount
        );
    }

    //获取红包领取详情
    function queryPacketDetails(uint256 packetId, uint256 addressArraryIndex)
        public
        view
        returns (address account, uint256 amount)
    {
        Packet storage packet = _redPacket[packetId];
        //检查红包是否存在
        require(packet.id != 0, "packetId error");
        return (
            packet.addressArrary[addressArraryIndex],
            packet.addressAmount[packet.addressArrary[addressArraryIndex]]
        );
    }

    //获取个人已发送的红包
    function queryOwnedRedPacket()
        public
        view
        returns (uint256[] memory packetIds)
    {
        return _ownedRedPacket[msg.sender];
    }

    //收回未领完的过期红包
    function recyclePacket(uint256 packetId) public returns (bool) {
        //检查红包是否存在
        require(_redPacket[packetId].id != 0, "packetId error");
        //检查红包是否抢完
        require(_redPacket[packetId].remainNumber > 0, "packet over ");
        //检查红包是否过期
        require(
            _redPacket[packetId].startTime + validTime <= block.timestamp,
            " Red packet no expired "
        );
        address(uint160(_redPacket[packetId].owner)).transfer(
            _redPacket[packetId].remainAmount
        );
        //回收事件
        emit RecyclePacketEvent(
            _redPacket[packetId].owner,
            packetId,
            _redPacket[packetId].remainAmount
        );
        return true;
    }

    //计算红包大小
    function calculateRedPacket(uint256 packetId) private returns (uint256) {
        Packet storage packet = _redPacket[packetId];
        uint256 amount;
        if (packet.remainNumber == 1) {
            //如果只有一个红包，则发送全部
            amount = packet.remainAmount;
        } else {
            if (packet.isRandom) {
                //如果是随机红包
                seed = keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, seed)
                );
                amount = (uint256(seed) % 100).mul(packet.remainAmount).div(
                    100
                );
            } else {
                amount = packet.remainAmount.div(packet.remainNumber);
            }
        }
        //领取地址记录
        packet.addressArrary.push(msg.sender);
        //领取金额记录
        packet.addressAmount[msg.sender] = amount;
        //数量减1
        packet.remainNumber--;
        //余额减去发送
        packet.remainAmount = packet.remainAmount.sub(amount);
        return amount;
    }

    function getAbiCode(uint256 packetId)
        public
        view
        returns (
            bytes memory abicode,
            bytes memory encodePacked,
            bytes32 ascicccode
        )
    {
        return (
            abi.encode(msg.sender, packetId),
            abi.encodePacked(msg.sender, packetId),
            keccak256(abi.encodePacked(msg.sender, packetId))
        );
    }
}

