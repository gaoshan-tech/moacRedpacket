pragma solidity ^0.5.0;

import "./libs/SafeMath.sol";

contract RedPacket {
    using SafeMath for uint256;
    //红包领取详情
    struct ReceivePacketDetail {
        //领取时间
        uint256 time;
        //领取金额
        uint256 amount;
    }
    //红包类
    struct Packet {
        //红包id/红包公钥地址
        address addr;
        //红包所有者
        address owner;
        //红包发送时间
        uint256 startTime;
        //红包描述
        string description;
        //红包个数
        uint256 totalNumber;
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
        mapping(address => ReceivePacketDetail) receivePacketDetailMap;
    }

    //个人最后一次创建红包的区块高度
    mapping(address => uint256) private createLastBlockNum;
    //个人最后一次抢红包的区块高度
    mapping(address => uint256) private receiveLastBlockNum;
    //红包id对应的红包
    mapping(address => Packet) _redPacket;
    //用户创建的红包id列表
    mapping(address => address[]) createRedPacketList;
    //用户领取的红包id列表
    mapping(address => address[]) receiveRedPacketList;
    //红包默认的有效时间(s)
    uint256 public validTime = 60 * 60 * 24;
    //红包平均的最低金额
    uint256 public minAmount = 10 * 1000 * 1000 * 1000 * 1000 * 1000;
    //红包最大个数
    uint256 public maxNum = 100;
    //创建红包事件 地址、红包id、金额、个数、红包描述、是否随机、上一次创建红包的区块高度
    event CreateRedPacketEvent(
        address indexed createAddr,
        address indexed packetAddr,
        uint256 totalNumber,
        uint256 num,
        string description,
        bool isRandom,
        uint256 time,
        uint256 createLastBlockNum
    );
    //领取红包事件 领取的地址、红包addr、金额、上一次抢红包的区块高度
    event ReceiveRedPacketEvent(
        address indexed receiveAddr,
        address indexed packetAddr,
        uint256 amount,
        uint256 time,
        uint256 receiveLastBlockNum
    );
    //回收红包事件 回收的地址 、红包addr、回收的金额
    event RecyclePacketEvent(
        address indexed recycleAddr,
        address indexed packetAddr,
        uint256 amount,
        uint256 time
    );

    constructor(
        uint256 _validTime,
        uint256 _minAmount,
        uint256 _maxNum
    ) public {
        validTime = _validTime;
        minAmount = _minAmount;
        maxNum = _maxNum;
    }

    //创建红包
    function createRedPacket(
        uint256 totalNumber,
        bool isRandom,
        string memory description,
        address redPacketAddr
    ) public payable returns (bool result) {
        //检查金额是否大于0
        // require(msg.value > 0, "amount must greater than 0");
        // 检查红包个数大于0
        require(totalNumber <= maxNum, "totalNumber too many");
        //检查redPacketAddr
        require(uint256(redPacketAddr) != 0, "redPacketAddr no null");
        //检查redPacketAdd是否重复
        require(
            _redPacket[redPacketAddr].addr == address(0),
            "redPacketAddr is exist"
        );
        //检查平均金额
        require(
            ((msg.value).div(totalNumber)) > minAmount,
            "The average amount of redPacket too low "
        );
        Packet memory packet;
        packet.addr = redPacketAddr;
        packet.owner = msg.sender;
        packet.description = description;
        packet.startTime = block.timestamp;
        packet.totalNumber = totalNumber;
        packet.remainNumber = totalNumber;
        packet.totalAmount = msg.value;
        packet.remainAmount = msg.value;
        packet.isRandom = isRandom;
        //红包放入红包池
        _redPacket[packet.addr] = packet;
        //最后一次发红包的区块高度
        createLastBlockNum[msg.sender] = block.number;
        //记录红包创建
        createRedPacketList[msg.sender].push(redPacketAddr);
        //创建红包事件
        emit CreateRedPacketEvent(
            msg.sender,
            packet.addr,
            packet.totalAmount,
            totalNumber,
            description,
            isRandom,
            block.timestamp,
            createLastBlockNum[msg.sender]
        );

        return true;
    }

    //抢红包
    function receiveRedPacket(address packetAddr, bytes memory signedMessage)
        public
        returns (uint256)
    {
        //检查红包是否存在
        require(_redPacket[packetAddr].addr != address(0), "packetAddr error");
        //检查红包是否抢过
        require(
            (_redPacket[packetAddr].receivePacketDetailMap)[msg.sender]
                .amount == 0,
            "packet have received"
        );
        //检查红包是否抢完
        require(_redPacket[packetAddr].remainNumber > 0, "packet over");
        //检查红包是否过期
        require(
            _redPacket[packetAddr].startTime + validTime > block.timestamp,
            "Red packet expired"
        );
        //检查签名是否正确
        require(decode(signedMessage) == packetAddr, "signMessage error");
        //最后一次抢红包的区块高度
        receiveLastBlockNum[msg.sender] = block.number;
        //记录红包领取
        receiveRedPacketList[msg.sender].push(packetAddr);
        //计算并修改红包余额余数
        uint256 amount = calculateRedPacket(packetAddr);
        msg.sender.transfer(amount);
        //抢红包事件
        emit ReceiveRedPacketEvent(
            msg.sender,
            packetAddr,
            amount,
            block.timestamp,
            receiveLastBlockNum[msg.sender]
        );
        return amount;
    }

    //获取红包基本信息
    function queryPacketInfo(address packetAddr)
        public
        view
        returns (
            address addr,
            address owner,
            uint256 startTime,
            string memory description,
            uint256 totalNumber,
            uint256 remainNumber,
            bool isRandom,
            uint256 totalAmount,
            uint256 remainAmount
        )
    {
        Packet memory packet = _redPacket[packetAddr];
        //检查红包是否存在
        require(packet.addr != address(0), "packetAddr error");
        return (
            packet.addr,
            packet.owner,
            packet.startTime,
            packet.description,
            packet.totalNumber,
            packet.remainNumber,
            packet.isRandom,
            packet.totalAmount,
            packet.remainAmount
        );
    }

    //根据索引和地址查询个人已创建的红包
    function queryCreatedRecord(address account, uint256 index)
        public
        view
        returns (
            address packetAddr,
            uint256 startTime,
            string memory description,
            uint256 totalNumber,
            uint256 remainNumber,
            bool isRandom,
            uint256 totalAmount,
            uint256 remainAmount,
            uint256 totalNum
        )
    {
        //检查红包是否存在
        uint256 total = createRedPacketList[account].length;
        require(total > index, "packetindex error");
        address redPacketAddr = createRedPacketList[account][index];
        Packet storage packet = _redPacket[redPacketAddr];
        return (
            packet.addr,
            packet.startTime,
            packet.description,
            packet.totalNumber,
            packet.remainNumber,
            packet.isRandom,
            packet.totalAmount,
            packet.remainAmount,
            total
        );
    }

    //获取红包某个用户领取详情
    function queryReceiveDetails(address packetAddr, uint256 index)
        public
        view
        returns (
            address account,
            uint256 amount,
            uint256 time
        )
    {
        Packet storage packet = _redPacket[packetAddr];
        //检查红包是否存在
        require(packet.addr != address(0), "packetAddr error");
        //检查红包是否存在
        require(packet.addressArrary[index] != address(0), "index error");
        return (
            packet.addressArrary[index],
            packet.receivePacketDetailMap[packet.addressArrary[index]].amount,
            packet.receivePacketDetailMap[packet.addressArrary[index]].time
        );
    }

    //根据索引和地址查询个人领取的记录
    function queryReceiveRecord(address account, uint256 index)
        public
        view
        returns (
            address packetAddr,
            string memory description,
            bool isRandom,
            uint256 amount,
            uint256 time,
            uint256 totalNum
        )
    {
        //检查红包是否存在
        uint256 total = receiveRedPacketList[account].length;
        require(total > index, "packetindex error");
        address redPacketAddr = receiveRedPacketList[account][index];
        Packet storage packet = _redPacket[redPacketAddr];
        uint256 amountTmp = packet.receivePacketDetailMap[account].amount;
        uint256 timeTmp = packet.receivePacketDetailMap[account].time;
        return (
            packet.addr,
            packet.description,
            packet.isRandom,
            amountTmp,
            timeTmp,
            total
        );
    }

    //收回未领完的过期红包
    function recyclePacket(address packetAddr) public returns (uint256) {
        //检查红包是否存在
        require(_redPacket[packetAddr].addr != address(0), "packetAddr error");
        //检查红包是否抢完
        require(_redPacket[packetAddr].remainNumber > 0, "packet over ");
        //检查红包是否过期
        require(
            _redPacket[packetAddr].startTime + validTime <= block.timestamp,
            " Red packet no expired "
        );
        uint256 remainAmount = _redPacket[packetAddr].remainAmount;
        _redPacket[packetAddr].remainAmount = 0;
        address(uint160(_redPacket[packetAddr].owner)).transfer(remainAmount);
        //回收事件
        emit RecyclePacketEvent(
            _redPacket[packetAddr].owner,
            packetAddr,
            remainAmount,
            block.timestamp
        );
        return remainAmount;
    }

    //计算红包大小
    function calculateRedPacket(address packetAddr) private returns (uint256) {
        Packet storage packet = _redPacket[packetAddr];
        uint256 amount;
        if (packet.remainNumber == 1) {
            //如果只有一个红包，则发送全部
            amount = packet.remainAmount;
        } else {
            if (packet.isRandom) {
                //如果是随机红包
                uint256 pct = uint256(
                    keccak256(abi.encodePacked(block.timestamp, msg.sender))
                ) % 100;
                amount = (
                    packet
                        .remainAmount
                        .sub(packet.remainNumber.sub(1).mul(minAmount))
                        .div(3)
                )
                    .getPercent(pct);
                amount = amount < minAmount ? minAmount : amount;
            } else {
                amount = packet.remainAmount.div(packet.remainNumber);
            }
        }
        //领取地址记录
        packet.addressArrary.push(msg.sender);
        //数量减1
        packet.remainNumber--;
        //余额减去发送
        packet.remainAmount = packet.remainAmount.sub(amount);
        //记录领取详情
        ReceivePacketDetail memory receivePacketDetail;
        receivePacketDetail.amount = amount;
        receivePacketDetail.time = block.timestamp;
        packet.receivePacketDetailMap[msg.sender] = receivePacketDetail;
        return amount;
    }

    //验证签名入口函数
    function decode(bytes memory signedMessage) private view returns (address) {
        //这是一个已经签名的数据
        //   bytes memory signedMessage =hex"f4128988cbe7df8315440adde412a8955f7f5ff9a5468a791433727f82717a6753bd71882079522207060b681fbd3f5623ee7ed66e33fc8e581f442acbcf6ab800";

        bytes32 r = bytesToBytes32(slice(signedMessage, 0, 32));
        bytes32 s = bytesToBytes32(slice(signedMessage, 32, 32));
        bytes1 v = slice(signedMessage, 64, 1)[0];
        return ecrecoverDecode(r, s, v);
    }

    //切片函数
    function slice(
        bytes memory data,
        uint256 start,
        uint256 len
    ) private pure returns (bytes memory) {
        bytes memory b = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            b[i] = data[i + start];
        }
        return b;
    }

    //使用ecrecover恢复出公钥，后对比
    function ecrecoverDecode(
        bytes32 r,
        bytes32 s,
        bytes1 v1
    ) private view returns (address addr) {
        //此处有坑
        //web3.eth.sign(msghash,address)生成的签名v值是没有加上27的，msghash=web3.sha3(msg)
        //web3.eth.accounts.create().sign(msghash)生成的签名v值是加过27的
        //如果要用ecrecover()算法来验签，需对v值加27来组成27，28这两个值中的一个2。
        uint8 v = uint8(v1);
        // uint8 v=uint8(v1)+27;
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(
            abi.encodePacked(prefix, keccak256(abi.encodePacked(msg.sender)))
        );
        addr = ecrecover(prefixedHash, v, r, s);
    }

    //bytes转换为bytes32
    function bytesToBytes32(bytes memory source)
        private
        pure
        returns (bytes32 result)
    {
        assembly {
            result := mload(add(source, 32))
        }
    }
}
