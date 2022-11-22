import hre, { ethers, network, upgrades } from 'hardhat';
import { RubicWhitelist } from '../typechain';
const clc = require('cli-color');
import Config from '../config/onChainConfig.json';

async function main() {
    const skipChains = [
        'hardhat',
        'ropsten',
        'rinkeby',
        'goerli',
        'kovan',
        'bscTest',
        'polygonMumbai',
        'defiKingdom'
    ];

    const networks = hre.userConfig.networks;

    const blockchainNames = Object.keys(<{ [networkName: string]: any }>networks).filter(name => {
        return !skipChains.includes(name);
    });

    for (let blockchain of blockchainNames) {
        try {
            console.log(`deploying to ${clc.blue(blockchain)}`);
            hre.changeNetwork(blockchain);

            const factory = await hre.ethers.getContractFactory('RubicWhitelist');
            const onChain = Config.chains.find(_chain => _chain.id === network.config.chainId)!;
            const admin = onChain.admin
                ? onChain.admin
                : '0x00009cc27c811a3e0FdD2Fd737afCc721B67eE8e';

            console.log(`start deploy on ${clc.blue(blockchain)}`);
            const deploy = await upgrades.deployProxy(factory, [[], admin], {
                initialize: 'initialize',
                timeout: 0
            });

            console.log(`waiting on ${clc.blue(blockchain)}`);
            await deploy.deployed();

            console.log(`deployed in ${clc.blue(blockchain)} to:`, deploy.address);
        } catch (e) {
            console.log(e);
        }
    }
}

main()
    .then(() => {
        console.log('Finished');
    })
    .catch(err => {
        console.log('Error = ', err);
    });
