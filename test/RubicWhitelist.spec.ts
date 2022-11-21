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
        it('check operator view after deploy', async () => {
            await expect(await whitelist.getAvailableOperators()).to.be.deep.eq([]);
        });

        it('should not add operator without any role', async () => {
            await expect(
                whitelist.connect(other).addOperators([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnAdmin');
        });
        it('should not add operator with operator role', async () => {
            await whitelist.addOperators([other.address]);
            await expect(
                whitelist.connect(other).addOperators([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnAdmin');
        });
        it('should return is whitelisted operator', async () => {
            await expect(await whitelist.isOperator(owner.address)).to.be.eq(false);

            await whitelist.addOperators([owner.address]);

            await expect(await whitelist.isOperator(owner.address)).to.be.eq(true);
        });
        it('should not remove operators without operator role', async () => {
            await whitelist.addOperators([owner.address]);
            await expect(
                whitelist.connect(other).removeOperators([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnAdmin');
        });
        it('possible to add multiple operators', async () => {
            await whitelist.addOperators([other.address, owner.address]);
            await expect(await whitelist.getAvailableOperators()).to.be.deep.eq([
                other.address,
                owner.address
            ]);
        });
        it('possible to remove multiple operators', async () => {
            await whitelist.addOperators([other.address, owner.address]);
            await whitelist.removeOperators([other.address, owner.address]);

            await expect(await whitelist.getAvailableOperators()).to.be.deep.eq([]);
        });
        it('сheck zero address', async () => {
            await expect(
                whitelist.addOperators([ethers.constants.AddressZero])
            ).to.be.revertedWithCustomError(whitelist, 'ZeroAddress');
        });
    });

    describe('check DEX', () => {
        it('should not add DEXs without operator role', async () => {
            await expect(
                whitelist.connect(other).addDEXs([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
        it('should not remove DEXs without operator role', async () => {
            await whitelist.addDEXs([owner.address]);
            await expect(
                whitelist.connect(other).removeDEXs([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
        it('admin should add DEXs without Operators', async () => {
            await whitelist.addDEXs([owner.address]);

            await expect(await whitelist.getAvailableDEXs()).to.be.deep.eq([owner.address]);
        });
        it('admin should add DEXs with Operators', async () => {
            await whitelist.addOperators([other.address]);
            await whitelist.addDEXs([owner.address]);

            await expect(await whitelist.getAvailableDEXs()).to.be.deep.eq([owner.address]);
        });
        it('operator should add DEXs', async () => {
            await whitelist.addOperators([other.address]);
            await whitelist.connect(other).addDEXs([owner.address]);

            await expect(await whitelist.getAvailableDEXs()).to.be.deep.eq([owner.address]);
        });
        it('possible to add multiple routers', async () => {
            await whitelist.addDEXs([other.address, owner.address]);
            await expect(await whitelist.getAvailableDEXs()).to.be.deep.eq([
                other.address,
                owner.address
            ]);
        });
        it('possible to remove multiple routers', async () => {
            await whitelist.addDEXs([other.address, owner.address]);
            await whitelist.removeDEXs([other.address, owner.address]);

            await expect(await whitelist.getAvailableDEXs()).to.be.deep.eq([]);
        });
        it('should return is whitelisted DEXs', async () => {
            await expect(await whitelist.isWhitelistedDEX(owner.address)).to.be.eq(false);

            await whitelist.addDEXs([owner.address]);

            await expect(await whitelist.isWhitelistedDEX(owner.address)).to.be.eq(true);
        });
        it('сheck zero address', async () => {
            await expect(
                whitelist.addDEXs([ethers.constants.AddressZero])
            ).to.be.revertedWithCustomError(whitelist, 'ZeroAddress');
        });
        it('shoukd revert with Blacklisted address', async () => {
            await whitelist.addToBlackList([other.address]);

            await expect(whitelist.addDEXs([other.address])).to.be.revertedWithCustomError(
                whitelist,
                'Blacklisted'
            );
        });
    });

    describe('check Cross chains', () => {
        it('should not add Cross chain without operator role', async () => {
            await expect(
                whitelist.connect(other).addCrossChains([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
        it('should not remove Cross chain without operator role', async () => {
            await whitelist.addCrossChains([owner.address]);
            await expect(
                whitelist.connect(other).removeCrossChains([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
        it('admin should add Cross chain without Operators', async () => {
            await whitelist.addCrossChains([owner.address]);

            await expect(await whitelist.getAvailableCrossChains()).to.be.deep.eq([owner.address]);
        });
        it('admin should add Cross chain with Operators', async () => {
            await whitelist.addOperators([other.address]);
            await whitelist.addCrossChains([owner.address]);

            await expect(await whitelist.getAvailableCrossChains()).to.be.deep.eq([owner.address]);
        });
        it('should return is whitelisted cross chain', async () => {
            await expect(await whitelist.isWhitelistedCrossChain(owner.address)).to.be.eq(false);

            await whitelist.addCrossChains([owner.address]);

            await expect(await whitelist.isWhitelistedCrossChain(owner.address)).to.be.eq(true);
        });
        it('operator should add Cross chain', async () => {
            await whitelist.addOperators([other.address]);
            await whitelist.connect(other).addCrossChains([owner.address]);

            await expect(await whitelist.getAvailableCrossChains()).to.be.deep.eq([owner.address]);
        });
        it('possible to add multiple routers', async () => {
            await whitelist.addCrossChains([other.address, owner.address]);
            await expect(await whitelist.getAvailableCrossChains()).to.be.deep.eq([
                other.address,
                owner.address
            ]);
        });
        it('possible to remove multiple routers', async () => {
            await whitelist.addCrossChains([other.address, owner.address]);
            await whitelist.removeCrossChains([other.address, owner.address]);

            await expect(await whitelist.getAvailableCrossChains()).to.be.deep.eq([]);
        });
        it('сheck zero address', async () => {
            await expect(
                whitelist.addCrossChains([ethers.constants.AddressZero])
            ).to.be.revertedWithCustomError(whitelist, 'ZeroAddress');
        });
        it('shoukd revert with Blacklisted address', async () => {
            await whitelist.addToBlackList([other.address]);

            await expect(whitelist.addCrossChains([other.address])).to.be.revertedWithCustomError(
                whitelist,
                'Blacklisted'
            );
        });
    });

    describe('check multichain routers', () => {
        it('should not add Cross chain without operator role', async () => {
            await expect(
                whitelist.connect(other).addAnyRouters([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
        it('should not remove Cross chain without operator role', async () => {
            await whitelist.addAnyRouters([owner.address]);
            await expect(
                whitelist.connect(other).removeAnyRouters([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
        it('admin should add Cross chain without Operators', async () => {
            await whitelist.addAnyRouters([owner.address]);

            await expect(await whitelist.getAvailableAnyRouters()).to.be.deep.eq([owner.address]);
        });
        it('admin should add Cross chain with Operators', async () => {
            await whitelist.addOperators([other.address]);
            await whitelist.addAnyRouters([owner.address]);

            await expect(await whitelist.getAvailableAnyRouters()).to.be.deep.eq([owner.address]);
        });
        it('should return is whitelisted cross chain', async () => {
            await expect(await whitelist.isWhitelistedAnyRouter(owner.address)).to.be.eq(false);

            await whitelist.addAnyRouters([owner.address]);

            await expect(await whitelist.isWhitelistedAnyRouter(owner.address)).to.be.eq(true);
        });
        it('operator should add Cross chain', async () => {
            await whitelist.addOperators([other.address]);
            await whitelist.connect(other).addAnyRouters([owner.address]);

            await expect(await whitelist.getAvailableAnyRouters()).to.be.deep.eq([owner.address]);
        });
        it('possible to add multiple routers', async () => {
            await whitelist.addAnyRouters([other.address, owner.address]);
            await expect(await whitelist.getAvailableAnyRouters()).to.be.deep.eq([
                other.address,
                owner.address
            ]);
        });
        it('possible to remove multiple routers', async () => {
            await whitelist.addAnyRouters([other.address, owner.address]);
            await whitelist.removeAnyRouters([other.address, owner.address]);

            await expect(await whitelist.getAvailableAnyRouters()).to.be.deep.eq([]);
        });
        it('сheck zero address', async () => {
            await expect(
                whitelist.addAnyRouters([ethers.constants.AddressZero])
            ).to.be.revertedWithCustomError(whitelist, 'ZeroAddress');
        });
        it('shoukd revert with Blacklisted address', async () => {
            await whitelist.addToBlackList([other.address]);

            await expect(whitelist.addAnyRouters([other.address])).to.be.revertedWithCustomError(
                whitelist,
                'Blacklisted'
            );
        });
    });

    describe('check blacklist', () => {
        it('should not add blacklist without operator role', async () => {
            await expect(
                whitelist.connect(other).addToBlackList([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
        it('should not remove Cross chain without operator role', async () => {
            await whitelist.addAnyRouters([owner.address]);
            await expect(
                whitelist.connect(other).removeFromBlackList([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
        it('admin should add to blacklist without Operators', async () => {
            await whitelist.addToBlackList([owner.address]);

            await expect(await whitelist.getBlackList()).to.be.deep.eq([owner.address]);
        });
        it('admin should add to black list with Operators', async () => {
            await whitelist.addOperators([other.address]);
            await whitelist.addToBlackList([owner.address]);

            await expect(await whitelist.getBlackList()).to.be.deep.eq([owner.address]);
        });
        it('should return is blacklisted address', async () => {
            await expect(await whitelist.isBlacklisted(owner.address)).to.be.eq(false);

            await whitelist.addToBlackList([owner.address]);

            await expect(await whitelist.isBlacklisted(owner.address)).to.be.eq(true);
        });
        it('blacklist should remove Any Router', async () => {
            await whitelist.addAnyRouters([owner.address]);
            await whitelist.addToBlackList([owner.address]);

            await expect(await whitelist.getAvailableAnyRouters()).to.be.deep.eq([]);
        });
        it('blacklist should remove DEX', async () => {
            await whitelist.addDEXs([owner.address]);
            await whitelist.addToBlackList([owner.address]);

            await expect(await whitelist.getAvailableDEXs()).to.be.deep.eq([]);
        });
        it('blacklist should remove Cross chain', async () => {
            await whitelist.addCrossChains([owner.address]);
            await whitelist.addToBlackList([owner.address]);

            await expect(await whitelist.getAvailableCrossChains()).to.be.deep.eq([]);
        });
        it('should remove router from blacklist', async () => {
            await whitelist.addToBlackList([owner.address]);

            await whitelist.removeFromBlackList([owner.address]);

            await expect(await whitelist.getBlackList()).to.be.deep.eq([]);
        });
        it('should not remove router from blacklist without role', async () => {
            await whitelist.addToBlackList([owner.address]);

            await expect(
                whitelist.connect(other).removeFromBlackList([owner.address])
            ).to.be.revertedWithCustomError(whitelist, 'NotAnOperatorOrAdmin');
        });
    });

    describe('transfer admin', () => {
        it('revert transfer admin without role', async () => {
            await expect(
                whitelist.connect(other).transferAdmin(owner.address)
            ).to.be.revertedWithCustomError(whitelist, 'NotAnAdmin');
        });
        it('should not remove Cross chain without operator role', async () => {
            await whitelist.transferAdmin(owner.address);
            await expect(whitelist.connect(other).acceptAdmin()).to.be.revertedWithCustomError(
                whitelist,
                'NotPendingAdmin'
            );
        });
        it('should transfer admin', async () => {
            await whitelist.transferAdmin(other.address);

            await expect(await whitelist.pendingAdmin()).to.be.deep.eq(other.address);
        });
        it('should accept after transfer admin', async () => {
            await whitelist.transferAdmin(other.address);
            await whitelist.connect(other).acceptAdmin();
        });
    });
});
