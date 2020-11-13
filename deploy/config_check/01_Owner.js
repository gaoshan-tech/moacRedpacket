var fs = require('fs');
var path = require('path');
var Chain3 = require('chain3');
var chain3 = new Chain3(new Chain3.providers.HttpProvider('http://localhost:8545'));
chain3.personal.unlockAccount(chain3.mc.accounts[0], 'ZaneYork1993',0);

var addressFile = fs.readFileSync(path.join(__dirname, '../address.txt'), 'utf-8')
var address = JSON.parse(addressFile);

for(let name in address){
	let data = fs.readFileSync(path.join(__dirname, '../../build/contracts/' + name + '.json'), 'utf-8')
	let build = JSON.parse(data);
	let abi = build.abi;
	let contract = chain3.mc.contract(abi);
	let instance = contract.at(address[name]);
	instance.owner.call(function(err, data){
		if(data){
			console.log(name + ' Owner: ' + data);
		}
	});
}
