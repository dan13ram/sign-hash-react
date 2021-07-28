const Web3 = require('web3');
let web3 = new Web3('wss://rinkeby.infura.io/ws/v3/8d86f4ed08864be4ada01d8b450a0abc');
var namehash = require('eth-ens-namehash');

const decode = async () => {
	console.log(
		web3.eth.abi.decodeParameters(
			['uint256', 'address', 'uint', 'bool'],
			'fca247acfb0f8e11dfd5c998e337bdacfc00c136c7743264f69e0d58bfe0016f1e3c852200000000000000000000000064473eb325925ea85aee1eb2d7aefa4ac3f8298b0000000000000000000000000000000000000000000000000000000009660180'
		)
	);
};
const encode = async () => {
	const data = await web3.eth.abi.encodeParameters(
		['uint256', 'bytes32[]', 'bytes32[]', 'uint256[]', 'address[]', 'uint256', 'address'],
		["1",["0x"],["0x"],["100000000000000000"],["0xb988b949aeeCd7197DBf134Bbf59b9F5660c8781"],0, "0x49607CC244E1230bD40ADBC9c40a24eCF4dc7220"]
	);
	const hash = await web3.utils.sha3(data);
	console.log(data);
	console.log(hash);
};

encode();
