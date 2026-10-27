import { ethers, run, network } from "hardhat";

async function main() {
  console.log("==================================================");
  console.log(`🚀 Deploying BEAST System 3.0 Stack to Network: ${network.name}`);
  console.log("==================================================");

  const [deployer] = await ethers.getSigners();
  console.log(`🔑 Deploying Account: ${deployer.address}`);
  console.log(`💰 Account Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

  // 1. Deploy BEASTSystemBus
  console.log("\n1️⃣ Deploying BEASTSystemBus...");
  const SystemBus = await ethers.getContractFactory("BEASTSystemBus");
  const systemBus = await SystemBus.deploy();
  await systemBus.waitForDeployment();
  const systemBusAddress = await systemBus.getAddress();
  console.log(`✅ BEASTSystemBus deployed to: ${systemBusAddress}`);

  // 2. Deploy LUCRToken
  console.log("\n2️⃣ Deploying LUCRToken...");
  const LUCRToken = await ethers.getContractFactory("LUCRToken");
  const lucrToken = await LUCRToken.deploy(deployer.address);
  await lucrToken.waitForDeployment();
  const lucrTokenAddress = await lucrToken.getAddress();
  console.log(`✅ LUCRToken deployed to: ${lucrTokenAddress}`);

  // 3. Deploy LucricityGovernor
  console.log("\n3️⃣ Deploying LucricityGovernor...");
  const LucricityGovernor = await ethers.getContractFactory("LucricityGovernor");
  const governor = await LucricityGovernor.deploy(lucrTokenAddress);
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log(`✅ LucricityGovernor deployed to: ${governorAddress}`);

  // 4. Deploy BEASTGovernanceGuardrail
  console.log("\n4️⃣ Deploying BEASTGovernanceGuardrail...");
  const Guardrail = await ethers.getContractFactory("BEASTGovernanceGuardrail");
  const guardrail = await Guardrail.deploy(deployer.address);
  await guardrail.waitForDeployment();
  const guardrailAddress = await guardrail.getAddress();
  console.log(`✅ BEASTGovernanceGuardrail deployed to: ${guardrailAddress}`);

  // Summary Deployment Output
  console.log("\n==================================================");
  console.log("🎉 DEPLOYMENT SUMMARY & CONTRACT ADDRESSES");
  console.log("==================================================");
  console.log(`BEASTSystemBus:             ${systemBusAddress}`);
  console.log(`LUCRToken:                  ${lucrTokenAddress}`);
  console.log(`LucricityGovernor:          ${governorAddress}`);
  console.log(`BEASTGovernanceGuardrail:   ${guardrailAddress}`);
  console.log("==================================================");

  // Etherscan verification for Sepolia live deployments
  if (network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("\n⏳ Waiting for 6 block confirmations before Etherscan verification...");
    await systemBus.deploymentTransaction()?.wait(6);

    try {
      await run("verify:verify", { address: systemBusAddress, constructorArguments: [] });
      await run("verify:verify", { address: lucrTokenAddress, constructorArguments: [deployer.address] });
      await run("verify:verify", { address: governorAddress, constructorArguments: [lucrTokenAddress] });
      await run("verify:verify", { address: guardrailAddress, constructorArguments: [deployer.address] });
      console.log("✅ All smart contracts verified on Etherscan successfully.");
    } catch (error) {
      console.error("⚠️ Etherscan verification error:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
