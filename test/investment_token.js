const InvestmentToken = artifacts.require("InvestmentToken");
const AllowlistRegistry = artifacts.require("AllowlistRegistry");
const ONE_MILLION = web3.utils.toWei("1000000", "ether");
const ONE_THOUSAND = web3.utils.toWei("1000", "ether");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


async function getAccounts() {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        reject(error);
      }
      resolve(accounts);
    });
  });
}

// Get accounts and store them in variables
let accounts;
let OWNER;
let ADDR1;
let ADDR2;

// Before each test, assign accounts to variables
beforeEach(async function () {
  accounts = await getAccounts();
  OWNER = accounts[0];
  ADDR1 = accounts[1];
  ADDR2 = accounts[2];
});


contract("🟢 Initialize contracts 🟢", function (accounts) {
  // Deploy a new InvestmentToken contract before each test
  before(async function () {
    this.allowlistRegistry = await AllowlistRegistry.new();
    this.investmentToken = await InvestmentToken.new("Investment Token", "IT", this.allowlistRegistry.address);
  })

  // Investment Token should have the name Investment Token
  it("should have the name Investment Token", async function () {
    assert.equal(await this.investmentToken.name(), "Investment Token");
  })

  // Investment Token should have the symbol IT
  it("should have the symbol IT", async function () {
    assert.equal(await this.investmentToken.symbol(), "IT");
  })

  // Investment Token should have 18 decimals
  it("should have 18 decimals", async function () {
    assert.equal(await this.investmentToken.decimals(), 18);
  })

  // Investment Token should have 0 total supply
  it("should have 0 total supply", async function () {
    assert.equal(await this.investmentToken.totalSupply(), 0);
  })

  // Investment Token should have 0 balance for the deployer
  it("should have 0 balance for the deployer", async function () {
    assert.equal(await this.investmentToken.balanceOf(accounts[0]), 0);
  })
});

contract("⛏️ Minting ⛏️", function (accounts) {
  beforeEach(async function () {
    this.allowlistRegistry = await AllowlistRegistry.new();

    this.investmentToken = await InvestmentToken.new(
      "Investment Token",
      "IT",
      this.allowlistRegistry.address
    );

    // Mint 1 million tokens to the owner
    await this.investmentToken.mint(ONE_MILLION);
  });

  // Should assign the total supply of tokens to the owner
  it("should assign the total supply of tokens to the owner", async function () {
    const totalSupply = await this.investmentToken.totalSupply();
    const ownerBalance = await this.investmentToken.balanceOf(OWNER);

    assert.equal(totalSupply.toString(), ownerBalance.toString());
  });

  // Should mint tokens to the owner
  it("should mint tokens to the owner", async function () {
    // mint ONE_THOUSAND tokens to owner
    await this.investmentToken.mint(ONE_THOUSAND);
    const ownerBalance = await this.investmentToken.balanceOf(OWNER);

    // should assert that the owner balance is now 1,001,000
    assert.equal(ownerBalance.toString(), "1001000000000000000000000");
  });

  // Should fail to mint when caller is not owner
  it("should fail to mint when caller is not owner", async function () {
    try {
      // mint ONE_THOUSAND tokens to ADDR1
      await this.investmentToken.mint(ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "Ownable: caller is not the owner");
    }
  });
});

contract("🔷 Admin Transfers 🔷", function (accounts) {
  beforeEach(async function () {
    this.allowlistRegistry = await AllowlistRegistry.new();

    this.investmentToken = await InvestmentToken.new(
      "Investment Token",
      "IT",
      this.allowlistRegistry.address
    );

    // Mint 1 million tokens to the owner
    await this.investmentToken.mint(ONE_MILLION);

  });

  // Should adminTransfer when sender is the owner
  it("should adminTransfer when sender is the owner", async function () {
    // transfer 1000 tokens from OWNER to ADDR1
    await this.investmentToken.adminTransfer(OWNER, ADDR1, ONE_THOUSAND);

    // should assert that the balance of ADDR1 is now 1000
    assert.equal(await this.investmentToken.balanceOf(ADDR1), ONE_THOUSAND);
  });

  // Should fail hwne amount exceeds balance
  it("should fail when amount exceeds balance", async function () {
    try {
      // transfer 1000 tokens from ADDR1 to OWNER
      await this.investmentToken.adminTransfer(ADDR1, OWNER, ONE_THOUSAND);
    } catch (error) {
      assert.equal(error.reason, "ERC20: transfer amount exceeds balance");
    }
  })

  // Should fail when sender is not owner
  it("should fail when sender is not owner", async function () {
    try {
      // transfer 1000 tokens from ADDR1 to ADDR2
      await this.investmentToken.adminTransfer(ADDR1, ADDR2, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "Ownable: caller is not the owner");
    }
  })
});

contract("🔥 Admin Burning 🔥", function (accounts) { 

  beforeEach(async function () {
    this.allowlistRegistry = await AllowlistRegistry.new();

    this.investmentToken = await InvestmentToken.new(
      "Investment Token",
      "IT",
      this.allowlistRegistry.address
    );

    // Mint 1 million tokens to the owner
    await this.investmentToken.mint(ONE_MILLION);
  });


  // Should admin burn when sender is the owner
  it("should admin burn when sender is the owner", async function () { 
    // admin transfer ONE_THOUSAND from owner to addr1
    await this.investmentToken.adminTransfer(OWNER, ADDR1, ONE_THOUSAND);

    // assert that the balance of addr1 is now ONE_THOUSAND
    assert.equal(await this.investmentToken.balanceOf(ADDR1), ONE_THOUSAND);

    // admin burn ONE_THOUSAND from addr1
    await this.investmentToken.adminBurn(ADDR1, ONE_THOUSAND);

    // assert that the balance of addr1 is now 0
    assert.equal(await this.investmentToken.balanceOf(ADDR1), 0);
  })

  // Should fail when amount exceeds balance
  it("should fail when amount exceeds balance", async function () {
    try {
      // admin burn ONE_THOUSAND from addr1
      await this.investmentToken.adminBurn(ADDR1, ONE_THOUSAND);
    } catch (error) {
      assert.equal(error.reason, "ERC20: burn amount exceeds balance");
    }
  })

  // Should fail when sender is not owner
  it("should fail when sender is not owner", async function () {
    try {
      // admin burn ONE_THOUSAND from addr1
      await this.investmentToken.adminBurn(ADDR1, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "Ownable: caller is not the owner");
    }
  })
})

contract(`🔶 Transfer 🔶`, function (accounts) {
  beforeEach(async function () {
    this.allowlistRegistry = await AllowlistRegistry.new();

    this.investmentToken = await InvestmentToken.new(
      "Investment Token",
      "IT",
      this.allowlistRegistry.address
    );

    // Mint 1 million tokens to the owner
    await this.investmentToken.mint(ONE_MILLION);
  })

  // Should transfer when sender is the owner and receiver is not allowlisted
  it("should transfer when sender is the owner and receiver is not allowlisted", async function () {
    // transfer ONE_THOUSAND from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // assert that the balance of addr1 is now ONE_THOUSAND
    assert.equal(await this.investmentToken.balanceOf(ADDR1), ONE_THOUSAND);
  })

  // Should transfer when sender and receiver are allowlisted
  it("should transfer when sender and receiver are allowlisted", async function () {
    // Transfer ONE_THOUSAND from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // allowlist addr1 and addr2
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // transfer ONE_THOUSAND from addr1 to addr2
    await this.investmentToken.transfer(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // assert that the balance of addr2 is now ONE_THOUSAND
    assert.equal(await this.investmentToken.balanceOf(ADDR2), ONE_THOUSAND);

    // assert that the balance of addr1 is now 0
    assert.equal(await this.investmentToken.balanceOf(ADDR1), 0);
  })

  // Should fail when sender is not allowlisted
  it("should fail when sender is not allowlisted", async function () { 
    try {
      // transfer ONE_THOUSAND from addr1 to owner 
      await this.investmentToken.transfer(OWNER, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should fail when receiver is not allowlisted
  it("should fail when receiver is not allowlisted", async function () {
    try {
      // transfer ONE_THOUSAND from owner to addr1
      await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

      // Add addr1 to allowlist
      await this.allowlistRegistry.addAllowlist(ADDR1);

      // transfer ONE_THOUSAND from addr1 to addr2
      await this.investmentToken.transfer(ADDR2, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should transferFrom when owner and spender are allowlisted
  it("should transferFrom when owner and spender are allowlisted", async function () {
    // Transfer ONE_THOUSAND from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // allowlist addr1 and addr2
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // transferFrom ONE_THOUSAND from addr1 to addr2
    await this.investmentToken.transferFrom(ADDR1, ADDR2, ONE_THOUSAND, { from: ADDR2 });

    // assert that the balance of addr2 is now ONE_THOUSAND
    assert.equal(await this.investmentToken.balanceOf(ADDR2), ONE_THOUSAND);

    // assert that the balance of addr1 is now 0
    assert.equal(await this.investmentToken.balanceOf(ADDR1), 0);
  })

  // Should fail transferFrom when owner is not allowlisted
  it("should fail transferFrom when owner is not allowlisted", async function () {
    // transfer ONE_THOUSAND from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // allowlist addr1 and addr2
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // remove addr1 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR1);

    try {
      // transferFrom ONE_THOUSAND from addr1 to addr2
      await this.investmentToken.transferFrom(ADDR1, ADDR2, ONE_THOUSAND, { from: ADDR2 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // should fail transferFrom when spender is not allowlisted
  it("should fail transferFrom when spender is not allowlisted", async function () {
    // transfer ONE_THOUSAND from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // allowlist addr1 and addr2
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // remove addr2 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR2);

    try {
      // transferFrom ONE_THOUSAND from addr1 to addr2
      await this.investmentToken.transferFrom(ADDR1, ADDR2, ONE_THOUSAND, { from: ADDR2 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })
})

contract(`🫴  Allowance 🫴`, function (accounts) {
  beforeEach(async function () {
    this.allowlistRegistry = await AllowlistRegistry.new();

    this.investmentToken = await InvestmentToken.new(
      "Investment Token",
      "IT",
      this.allowlistRegistry.address
    );

    // Mint 1 million tokens to the owner
    await this.investmentToken.mint(ONE_MILLION);
  })

  // Should approve when owner and spender are allowlisted
  it("should approve when owner and spender are allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // assert that the allowance of addr1 to spend from addr2 is ONE_THOUSAND
    assert.equal(await this.investmentToken.allowance(ADDR1, ADDR2), ONE_THOUSAND);
  })

  // Should fail approve when owner is not allowlisted
  it("should fail approve when owner is not allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // remove addr1 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR1);

    try {
      // approve addr2 to spend ONE_THOUSAND from addr1
      await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should fail approve when spender is not allowlisted
  it("should fail approve when spender is not allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // remove addr2 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR2);

    try {
      // approve addr2 to spend ONE_THOUSAND from addr1
      await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should increaseAllowance when owner and spender are allowlisted
  it("should increaseAllowance when owner and spender are allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // increase allowance of addr2 to spend from addr1 by ONE_THOUSAND
    await this.investmentToken.increaseAllowance(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // assert that the allowance of addr1 to spend from addr2 is now ONE_THOUSAND * 2
    assert.equal(await this.investmentToken.allowance(ADDR1, ADDR2), ONE_THOUSAND * 2);
  })

  // Should fail increaseAllowance when owner is not allowlisted
  it("should fail increaseAllowance when owner is not allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // remove addr1 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR1);

    try {
      // increase allowance of addr2 to spend from addr1 by ONE_THOUSAND
      await this.investmentToken.increaseAllowance(ADDR2, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should fail increaseAllowance when spender is not allowlisted
  it("should fail increaseAllowance when spender is not allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // remove addr2 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR2);

    try {
      // increase allowance of addr2 to spend from addr1 by ONE_THOUSAND
      await this.investmentToken.increaseAllowance(ADDR2, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should decreaseAllowance when owner and spender are allowlisted
  it("should decreaseAllowance when owner and spender are allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });
    // increase allowance of addr2 to spend from addr1 by ONE_THOUSAND
    await this.investmentToken.increaseAllowance(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // decrease allowance of addr2 to spend from addr1 by ONE_THOUSAND
    await this.investmentToken.decreaseAllowance(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // assert that the allowance of addr1 to spend from addr2 is now ONE_THOUSAND
    assert.equal(await this.investmentToken.allowance(ADDR1, ADDR2), ONE_THOUSAND);
  })

  // should fail decreaseAllowance when owner is not allowlisted
  it("should fail decreaseAllowance when owner is not allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // remove addr1 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR1);

    try {
      // decrease allowance of addr2 to spend from addr1 by ONE_THOUSAND
      await this.investmentToken.decreaseAllowance(ADDR2, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should fail decreaseAllowance when spender is not allowlisted
  it("should fail decreaseAllowance when spender is not allowlisted", async function () {
    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // remove addr2 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR2);

    try {
      // decrease allowance of addr2 to spend from addr1 by ONE_THOUSAND
      await this.investmentToken.decreaseAllowance(ADDR2, ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })
})

contract(`🔥 Burnable 🔥`, function (accounts) {
  beforeEach(async function () {
    this.allowlistRegistry = await AllowlistRegistry.new();

    this.investmentToken = await InvestmentToken.new(
      "Investment Token",
      "IT",
      this.allowlistRegistry.address
    );

    // Mint 1 million tokens to the owner
    await this.investmentToken.mint(ONE_MILLION);
  })

  // Should burn tokens on the owner account
  it("should burn tokens on the owner account", async function () {
    // burn 0 tokens from owner
    await this.investmentToken.burn(0);

    // assert that the balance of owner is still ONE_MILLION
    assert.equal(await this.investmentToken.balanceOf(OWNER), ONE_MILLION);

    // burn ONE_MILLION tokens from owner
    await this.investmentToken.burn(ONE_MILLION);

    // assert that the balance of owner is now 0
    assert.equal(await this.investmentToken.balanceOf(OWNER), 0);
  })

  // Should burn tokens on allowlisted account
  it("should burn tokens on allowlisted account", async function () {
    // transfer ONE_THOUSAND tokens from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // add addr1 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);

    // burn ONE_THOUSAND tokens from addr1
    await this.investmentToken.burn(ONE_THOUSAND, { from: ADDR1 });

    // assert that the balance of addr1 is now 0
    assert.equal(await this.investmentToken.balanceOf(ADDR1), 0);
  })

  // Should fail to burn tokens on non-allowlisted account
  it("should fail to burn tokens on non-allowlisted account", async function () {
    // transfer ONE_THOUSAND tokens from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    try {
      // burn ONE_THOUSAND tokens from addr1
      await this.investmentToken.burn(ONE_THOUSAND, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should fail to burn when amount is greater than balance
  it("should fail to burn when amount is greater than balance", async function () {
    // add addr1 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);

    try {
      // burn ONE_MILLION tokens from addr1
      await this.investmentToken.burn(ONE_MILLION, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "ERC20: burn amount exceeds balance");
    }
  })

  // Should burnFrom tokens from given allowance
  it("should burnFrom tokens from given allowance", async function () {
    // transfer ONE_THOUSAND tokens from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // burnFrom ONE_THOUSAND tokens from addr1
    await this.investmentToken.burnFrom(ADDR1, ONE_THOUSAND, { from: ADDR2 });

    // assert that the balance of addr1 is now 0
    assert.equal(await this.investmentToken.balanceOf(ADDR1), 0);
  })

  // Should fail to burnFrom when allowance is less than burn amount
  it("should fail to burnFrom when allowance is less than burn amount", async function () {
    // transfer ONE_THOUSAND tokens from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // add addr1 and addr2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    try {
      // burnFrom ONE_MILLION tokens from addr1
      await this.investmentToken.burnFrom(ADDR1, ONE_MILLION, { from: ADDR2 });
    } catch (error) {
      assert.equal(error.reason, "ERC20: insufficient allowance");
    }
  })

  // Should fail to burnFrom when spender is not allowlisted
  it("should fail to burnFrom when spender is not allowlisted", async function () {
    // transfer ONE_THOUSAND tokens from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // add addr1 and 2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // remove addr2 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR2);

    try {
      // burnFrom ONE_THOUSAND tokens from addr1
      await this.investmentToken.burnFrom(ADDR1, ONE_THOUSAND, { from: ADDR2 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })

  // Should fail to burnFrom when owner is not allowlisted
  it("should fail to burnFrom when owner is not allowlisted", async function () {
    // transfer ONE_THOUSAND tokens from owner to addr1
    await this.investmentToken.transfer(ADDR1, ONE_THOUSAND);

    // add addr1 and 2 to allowlist
    await this.allowlistRegistry.addAllowlist(ADDR1);
    await this.allowlistRegistry.addAllowlist(ADDR2);

    // approve addr2 to spend ONE_THOUSAND from addr1
    await this.investmentToken.approve(ADDR2, ONE_THOUSAND, { from: ADDR1 });

    // remove addr1 from allowlist
    await this.allowlistRegistry.removeAllowlist(ADDR1);

    try {
      // burnFrom ONE_THOUSAND tokens from addr1
      await this.investmentToken.burnFrom(ADDR1, ONE_THOUSAND, { from: ADDR2 });
    } catch (error) {
      assert.equal(error.reason, "InvestmentToken: accounts are not allowlisted");
    }
  })
})

contract("📃 Set Allowlist Registry 📃", function (accounts) { 
    beforeEach(async function () {
    this.allowlistRegistry = await AllowlistRegistry.new();

    this.investmentToken = await InvestmentToken.new(
      "Investment Token",
      "IT",
      this.allowlistRegistry.address
    );
  })
  // should setAllowlistRegistry 
  it("should setAllowlistRegistry", async function () {
    const registry = await AllowlistRegistry.new();

    // set the investmentToken's allowlistRegistry to registry
    await this.investmentToken.setAllowlistRegistry(registry.address);

    // assert that the investmentToken's allowlistRegistry is registry
    assert.equal(await this.investmentToken.allowlistRegistry(), registry.address);
  })

  // should fail to setAllowlistRegistry when caller is not owner
  it("should fail to setAllowlistRegistry when caller is not owner", async function () {
    const registry = await AllowlistRegistry.new();

    try {
      // set the investmentToken's allowlistRegistry to registry
      await this.investmentToken.setAllowlistRegistry(registry.address, { from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "Ownable: caller is not the owner");
    }
  })
})

contract(`⏸️  Pausable ⏸️`, function (accounts) { 
  beforeEach(async function () { 
    this.allowlistRegistry = await AllowlistRegistry.new();

    this.investmentToken = await InvestmentToken.new(
      "Investment Token",
      "IT",
      this.allowlistRegistry.address
    );
  })

  // should pause contract
  it("should pause contract", async function () {
    // pause contract
    await this.investmentToken.pause();

    // assert that contract is paused
    assert.equal(await this.investmentToken.paused(), true);
  })

  // should unpause contract
  it("should unpause contract", async function () {
    // pause contract
    await this.investmentToken.pause();

    // assert that contract is paused
    assert.equal(await this.investmentToken.paused(), true);

    // unpause contract
    await this.investmentToken.unpause();

    // assert that contract is unpaused
    assert.equal(await this.investmentToken.paused(), false);
  })

  // should fail to unpause contract when contract is not paused
  it("should fail to unpause contract when contract is not paused", async function () {
    try {
      // unpause contract
      await this.investmentToken.unpause();
    } catch (error) {
      assert.equal(error.reason, "Pausable: not paused");
    }
  })

  // Should fail to pause contract when contract is paused
  it("should fail to pause contract when contract is paused", async function () {
    // pause contract
    await this.investmentToken.pause();

    try {
      // pause contract
      await this.investmentToken.pause();
    } catch (error) {
      assert.equal(error.reason, "Pausable: paused");
    }
  })

  // Should fail to pause contract when caller is not owner
  it("should fail to pause contract when caller is not owner", async function () {
    try {
      // pause contract
      await this.investmentToken.pause({ from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "Ownable: caller is not the owner");
    }
  })

  // Should fail to unpause contract when caller is not owner
  it("should fail to unpause contract when caller is not owner", async function () {
    // pause contract
    await this.investmentToken.pause();

    try {
      // unpause contract
      await this.investmentToken.unpause({ from: ADDR1 });
    } catch (error) {
      assert.equal(error.reason, "Ownable: caller is not the owner");
    }
  })
})