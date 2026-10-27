import { expect } from "chai";
import { ethers } from "hardhat";
import { BEASTGovernanceGuardrail } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BEASTGovernanceGuardrail", function () {
  let guardrail: BEASTGovernanceGuardrail;
  let owner: SignerWithAddress;
  let agentAuditor: SignerWithAddress;
  let unauthorizedUser: SignerWithAddress;

  const sampleProposalHash = ethers.keccak256(ethers.toUtf8Bytes("PROPOSAL_BEAST_3_0_INIT"));

  beforeEach(async function () {
    [owner, agentAuditor, unauthorizedUser] = await ethers.getSigners();

    const GuardrailFactory = await ethers.getContractFactory("BEASTGovernanceGuardrail");
    guardrail = await GuardrailFactory.deploy(agentAuditor.address);
    await guardrail.waitForDeployment();
  });

  describe("Deployment & Configuration", function () {
    it("Should set the correct owner and agentic auditor addresses", async function () {
      expect(await guardrail.owner()).to.equal(owner.address);
      expect(await guardrail.agenticAuditor()).to.equal(agentAuditor.address);
      expect(await guardrail.systemPaused()).to.be.false;
    });

    it("Should allow owner to update the agentic auditor address", async function () {
      await expect(guardrail.connect(owner).setAgenticAuditor(unauthorizedUser.address))
        .to.emit(guardrail, "AuditorUpdated")
        .withArgs(unauthorizedUser.address);

      expect(await guardrail.agenticAuditor()).to.equal(unauthorizedUser.address);
    });
  });

  describe("Proposal Policy Validation", function () {
    it("Should allow designated agentic auditor to validate proposals", async function () {
      await expect(guardrail.connect(agentAuditor).validateProposalPolicy(sampleProposalHash, true))
        .to.emit(guardrail, "ProposalValidated")
        .withArgs(sampleProposalHash, true);

      expect(await guardrail.approvedProposals(sampleProposalHash)).to.be.true;
    });

    it("Should reject policy validation calls from unauthorized users", async function () {
      await expect(
        guardrail.connect(unauthorizedUser).validateProposalPolicy(sampleProposalHash, true)
      ).to.be.revertedWith("BEASTGuardrail: Unauthorized agentic auditor");
    });
  });

  describe("Emergency Circuit Breaker", function () {
    it("Should trigger emergency pause when requested by auditor", async function () {
      await expect(guardrail.connect(agentAuditor).triggerEmergencyPause("ANOMALY_DETECTED"))
        .to.emit(guardrail, "GuardrailTriggered")
        .withArgs("ANOMALY_DETECTED", agentAuditor.address);

      expect(await guardrail.systemPaused()).to.be.true;
    });

    it("Should deny execution permission when system is emergency paused", async function () {
      await guardrail.connect(agentAuditor).validateProposalPolicy(sampleProposalHash, true);
      await guardrail.connect(owner).triggerEmergencyPause("SECURITY_AUDIT");

      expect(await guardrail.verifyExecutionPermission(sampleProposalHash)).to.be.false;
    });
  });
});
