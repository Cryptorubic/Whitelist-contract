/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
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
            const deploy = await upgrades.deployProxy(
                factory,
                [
                    [
                        '0xaE6FAf6C1c0006b81ce04308E225B01D9b667A6E',
                        '0xE19474aC8136349b568bbB7C0e9FFd90EC09Eeb9' // deployer
                    ],
                    admin
                ],
                {
                    initialize: 'initialize',
                    timeout: 0 // wait infinietly
                }
            );

            console.log(`waiting on ${clc.blue(blockchain)}`);
            await deploy.deployed();

            await deploy.addDEXs(onChain.dex);

            await new Promise(r => setTimeout(r, 15000));

            console.log(`waiting for verification on ${clc.blue(blockchain)} at ${deploy.address}`);

            await hre.run('verify:verify', {
                address: deploy.address,
                constructorArguments: []
            });

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
