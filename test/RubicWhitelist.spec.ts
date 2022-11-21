import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { Wallet } from '@ethersproject/wallet';
import { TestERC20, WhitelistMock } from '../typechain';
import { expect } from 'chai';
import { BigNumber as BN } from 'ethers';
import * as consts from './shared/consts';
import { testFixture } from './shared/fixtures';

describe('TestOnlySource', () => {
    let owner: Wallet;
    let other: Wallet;
    let tokenA: TestERC20;
    let tokenB: TestERC20;

    let whitelist: WhitelistMock;

    before('initialize', async () => {
        [owner, other] = await (ethers as any).getSigners();
    });

    beforeEach('deploy proxy', async () => {
        ({ whitelist, tokenA, tokenB } = await loadFixture(testFixture));
    });

    describe('check opperators', () => {
        it('check operator view', async () => {
            await expect(await whitelist.getAvailableOperators()).to.be.deep.eq([owner.address]);
        });
    });
});
