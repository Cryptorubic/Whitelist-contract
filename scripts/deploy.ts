import hre from 'hardhat';
import { ethers, upgrades, network } from 'hardhat';
import Config from '../config/onChainConfig.json';

async function main() {
    const factory = await hre.ethers.getContractFactory('RubicWhitelist');
    const onChain = Config.chains.find(_chain => _chain.id === network.config.chainId)!;

    const deploy = await upgrades.deployProxy(factory, [[], '0x0000006f0994c53C5D63E72dfA8Cf38412E874A4'], {initialize: 'initialize'});

    await deploy.deployed();

    await deploy.addDEXs(onChain.dex);

    console.log('deployed to:', deploy.address);

    await new Promise(r => setTimeout(r, 10000));

    await hre.run('verify:verify', {
        address: deploy.address,
        constructorArguments: [ ]
    });
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
