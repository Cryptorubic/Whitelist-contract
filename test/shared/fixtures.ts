import { TestERC20, WhitelistMock } from '../../typechain';
import { ethers } from 'hardhat';

interface TestFixture {
    whitelist: WhitelistMock;
    tokenA: TestERC20;
    tokenB: TestERC20;
}

export const testFixture = async function (): Promise<TestFixture> {
    const tokenFactory = await ethers.getContractFactory('TestERC20');
    const tokenA = (await tokenFactory.deploy()) as TestERC20;
    const tokenB = (await tokenFactory.deploy()) as TestERC20;

    const whitelistFactory = await ethers.getContractFactory('WhitelistMock');

    const whitelist = (await whitelistFactory.deploy(
        [],
        await whitelistFactory.signer.getAddress()
    )) as WhitelistMock;

    return { whitelist, tokenA, tokenB };
};
