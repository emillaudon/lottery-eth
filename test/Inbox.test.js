const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { utils } = require('mocha');
const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('Adds the players address', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('Allows multiple players to join', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200
            });
            assert(false);
        } catch (error) {
            assert(error);
        }
    });

    it('only manager can call pickwinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false)
        } catch (err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('2', 'ether')
            });
            const initialBalance = await web3.eth.getBalance(accounts[0]);

            await lottery.methods.pickWinner().send({ from: accounts[0] });

            const newBalance = await web3.eth.getBalance(accounts[0]);
            const difference = newBalance - initialBalance;
            console.log(difference);

            assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});