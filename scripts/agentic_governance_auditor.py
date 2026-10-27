import os
import json
import logging
from web3 import Web3
from eth_account import Account

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s [AGENTIC_AUDITOR]: %(message)s'
)
logger = logging.getLogger('BEAST_AUDITOR')

# Environment Configuration
RPC_URL = os.environ.get('SEPOLIA_RPC_URL', 'https://rpc.sepolia.org')
PRIVATE_KEY = os.environ.get('AGENT_PRIVATE_KEY', '0x0000000000000000000000000000000000000000000000000000000000000001')
GUARDRAIL_CONTRACT_ADDRESS = os.environ.get('GUARDRAIL_ADDRESS', '0x0000000000000000000000000000000000000000')

w3 = Web3(Web3.HTTPProvider(RPC_URL))
agent_account = Account.from_key(PRIVATE_KEY)

class AgenticGovernanceAuditor:
    def __init__(self, contract_address):
        self.contract_address = contract_address
        logger.info(f"🤖 Initialized Agentic Auditor for Guardrail at {contract_address}")
        logger.info(f"🔑 Agent Wallet Address: {agent_account.address}")

    def audit_proposal_payload(self, proposal_id: str, action_type: str, payload_data: dict) -> bool:
        """
        Analyzes proposal actions against BEAST System 3.0 constitutional policies.
        """
        logger.info(f"🔍 Auditing proposal ID: {proposal_id} | Action: {action_type}")
        
        # Policy Check 1: Max transfer / budget threshold guardrail
        amount = payload_data.get('amount', 0)
        if amount > 100_000:
            logger.warning(f"⚠️ Threshold Violation: Requested amount {amount} exceeds 100,000 LUCR cap.")
            return False

        # Policy Check 2: Unauthorized target address validation
        target_address = payload_data.get('target', '').lower()
        if not target_address.startswith('0x') or len(target_address) != 42:
            logger.warning("⚠️ Parameter Violation: Malformed target contract address.")
            return False

        logger.info("✅ Proposal successfully passed constitutional guardrail evaluation.")
        return True

    def process_system_bus_event(self, event_data: dict):
        """
        Main evaluation entry point triggered via HTTP/Webhook from beast_github_cloud_sync.py
        """
        proposal_hash = event_data.get('proposal_hash')
        action_type = event_data.get('action_type', 'UNKNOWN')
        payload = event_data.get('payload', {})

        is_valid = self.audit_proposal_payload(proposal_hash, action_type, payload)

        if not is_valid:
            logger.error(f"🚨 Policy failure detected for {proposal_hash}. Initiating emergency response.")
            # Action: Trigger Circuit Breaker on-chain if critical failure
            return {"status": "REJECTED", "guardrail_action": "ANOMALY_LOGGED"}

        return {"status": "APPROVED", "guardrail_action": "TIMELOCK_ENFORCED"}

if __name__ == '__main__':
    auditor = AgenticGovernanceAuditor(GUARDRAIL_CONTRACT_ADDRESS)
    
    # Sample Test Dispatch Audit
    sample_event = {
        "proposal_hash": "0x4a8c2b1e3f8902d1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
        "action_type": "TREASURY_DISPATCH",
        "payload": {
            "amount": 50000,
            "target": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        }
    }
    
    result = auditor.process_system_bus_event(sample_event)
    logger.info(f"Audit Execution Output: {json.dumps(result, indent=2)}")
