const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    'few label weasel junk saddle near stage rebuild orchard rebel control team',
    'https://rinkeby.infura.io/v3/941246d7df7947e58393691a1be5455e'
);
const web3 = new Web3(provider)

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    
    console.log('Attempting to deplot from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: '1000000', from: accounts[0] });

        console.log('Contract deployed to ', result.options.address);
};
deploy();