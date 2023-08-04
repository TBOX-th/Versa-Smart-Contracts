const AllowlistRegistry = artifacts.require("AllowlistRegistry");
const InvestmentToken = artifacts.require("InvestmentToken");

module.exports = async function (deployer) {

  console.log(`🚀 Deploying contracts`);

  await deployer.deploy(AllowlistRegistry).then(async () => {
    const allowlistRegistry = await AllowlistRegistry.deployed();
    await deployer.deploy(InvestmentToken, "Investment Token", "IT", allowlistRegistry.address).then(async () => {
      const investmentToken = await InvestmentToken.deployed();
      // console.log(`Investment Token address: ${investmentToken.address}`);
    });
  });
}