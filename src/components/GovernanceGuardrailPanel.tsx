'use client';

import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Lock, Unlock, Cpu } from 'lucide-react';

interface GuardrailState {
  isPaused: boolean;
  agenticAuditorAddress: string;
  lastProposalStatus: 'APPROVED' | 'REJECTED' | 'IDLE';
  lastAuditReason: string;
  minDelayHours: number;
}

export default function GovernanceGuardrailPanel() {
  const [guardrail, setGuardrail] = useState<GuardrailState>({
    isPaused: false,
    agenticAuditorAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    lastProposalStatus: 'APPROVED',
    lastAuditReason: 'Passed constitutional parameter evaluation',
    minDelayHours: 1,
  });

  const [loading, setLoading] = useState(false);

  const toggleEmergencyPause = async () => {
    setLoading(true);
    // Simulate transaction dispatch to BEASTGovernanceGuardrail contract
    setTimeout(() => {
      setGuardrail((prev) => ({
        ...prev,
        isPaused: !prev.isPaused,
        lastAuditReason: prev.isPaused
          ? 'Emergency pause lifted by Governing Officer'
          : 'Manual circuit-breaker triggered by Governing Officer',
      }));
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg p-2.5 ${
              guardrail.isPaused
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {guardrail.isPaused ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">BEAST Governance Guardrail</h3>
            <p className="text-xs text-slate-400 font-mono">Contract: BEASTGovernanceGuardrail.sol</p>
          </div>
        </div>

        {/* System Status Badge */}
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            guardrail.isPaused
              ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${guardrail.isPaused ? 'bg-red-500' : 'bg-emerald-500'}`}
          />
          {guardrail.isPaused ? 'SYSTEM EMERGENCY PAUSED' : 'GUARDRAILS ACTIVE'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Metric 1: AI Auditor */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Agentic Auditor
          </div>
          <p className="mt-2 text-xs font-mono text-slate-200 truncate">
            {guardrail.agenticAuditorAddress}
          </p>
          <span className="mt-1 inline-block text-[10px] text-emerald-400 font-sans font-medium">
            ● Active Monitoring
          </span>
        </div>

        {/* Metric 2: Policy Status */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Shield className="h-4 w-4 text-amber-400" />
            Last Audit Result
          </div>
          <p
            className={`mt-2 text-sm font-bold ${
              guardrail.lastProposalStatus === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {guardrail.lastProposalStatus}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 truncate">{guardrail.lastAuditReason}</p>
        </div>

        {/* Metric 3: Execution Delay */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Lock className="h-4 w-4 text-indigo-400" />
            Policy Timelock
          </div>
          <p className="mt-2 text-sm font-bold text-slate-100">{guardrail.minDelayHours} Hour Delay</p>
          <p className="mt-1 text-[11px] text-slate-400">Required before execution</p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            Circuit-breaker controls instantly halt execution across all 1,200+ connected system submodules and governance dispatch queues.
          </p>
        </div>

        <button
          onClick={toggleEmergencyPause}
          disabled={loading}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all shrink-0 ${
            guardrail.isPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950'
          }`}
        >
          {guardrail.isPaused ? (
            <>
              <Unlock className="h-4 w-4" />
              {loading ? 'Lifting Pause...' : 'Resume System Execution'}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              {loading ? 'Triggering...' : 'Trigger Emergency Pause'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
