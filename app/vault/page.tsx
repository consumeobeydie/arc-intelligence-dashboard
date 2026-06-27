'use client';

import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import Link from 'next/link';

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'Arcscan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
};

const VAULT    = '0x6C13dA317B65474299F6fDee02daDd6626Eb2BFe';
const ORCH     = '0xe81f5BA4181eA29061C3C229c8D6EB4cFE56639C';
const AGENT_B  = '0xa75282Fe398A4Bf910884BDFF29AEb1a23f2E55a';
const MAIN     = '0x54b4B44749a95070560509B6Ec0be501665CcF63';

const vaultAbi = [
  { name: 'totalAssets',     type: 'function', stateMutability: 'view', inputs: [],                                          outputs: [{ type: 'uint256' }] },
  { name: 'totalSupply',     type: 'function', stateMutability: 'view', inputs: [],                                          outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf',       type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }],      outputs: [{ type: 'uint256' }] },
  { name: 'convertToAssets', type: 'function', stateMutability: 'view', inputs: [{ name: 'shares',  type: 'uint256' }],      outputs: [{ type: 'uint256' }] },
] as const;

const orchAbi = [
  { name: 'missionCount', type: 'function', stateMutability: 'view', inputs: [],                                              outputs: [{ type: 'uint256' }] },
  { name: 'getAgent',     type: 'function', stateMutability: 'view', inputs: [{ name: 'agentId', type: 'uint256' }],          outputs: [{ type: 'uint256' }, { type: 'address' }, { type: 'string' }, { type: 'string' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint8' }] },
] as const;

type VaultState = {
  totalAssets: bigint;
  totalSupply: bigint;
  agentBShares: bigint;
  mainShares: bigint;
  agentBValue: bigint;
  missionCount: bigint;
  agentARep: bigint;
  agentBRep: bigint;
  agentAMissions: bigint;
  agentBMissions: bigint;
};

export default function VaultPage() {
  const [state, setState] = useState<VaultState | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const client = createPublicClient({ chain: arcTestnet as any, transport: http() });

    async function fetchData() {
      try {
        const [assets, supply, agentBShares, mainShares, missions, agentA, agentB] = await Promise.all([
          client.readContract({ address: VAULT as `0x${string}`, abi: vaultAbi, functionName: 'totalAssets' }),
          client.readContract({ address: VAULT as `0x${string}`, abi: vaultAbi, functionName: 'totalSupply' }),
          client.readContract({ address: VAULT as `0x${string}`, abi: vaultAbi, functionName: 'balanceOf', args: [AGENT_B as `0x${string}`] }),
          client.readContract({ address: VAULT as `0x${string}`, abi: vaultAbi, functionName: 'balanceOf', args: [MAIN as `0x${string}`] }),
          client.readContract({ address: ORCH as `0x${string}`, abi: orchAbi, functionName: 'missionCount' }),
          client.readContract({ address: ORCH as `0x${string}`, abi: orchAbi, functionName: 'getAgent', args: [0n] }),
          client.readContract({ address: ORCH as `0x${string}`, abi: orchAbi, functionName: 'getAgent', args: [1n] }),
        ]);

        const agentBValue = supply > 0n
          ? (agentBShares as bigint * (assets as bigint)) / (supply as bigint)
          : 0n;

        setState({
          totalAssets: assets as bigint,
          totalSupply: supply as bigint,
          agentBShares: agentBShares as bigint,
          mainShares: mainShares as bigint,
          agentBValue,
          missionCount: missions as bigint,
          agentARep: (agentA as any[])[4] as bigint,
          agentBRep: (agentB as any[])[4] as bigint,
          agentAMissions: (agentA as any[])[5] as bigint,
          agentBMissions: (agentB as any[])[5] as bigint,
        });
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const sharePrice = state && state.totalSupply > 0n
    ? Number(state.totalAssets) / Number(state.totalSupply)
    : 1;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-background-tertiary)', fontFamily: 'var(--font-mono)' }}>

      <div style={{ borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1.25rem 2rem', background: 'var(--color-background-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Arc Intelligence</Link>
          <span style={{ color: 'var(--color-border-secondary)' }}>/</span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 500 }}>ArcUSDCVault</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-success)', display: 'inline-block' }}></span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Live · {lastUpdate || 'loading'}</span>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>ArcUSDCVault</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
            ERC-4626 tokenized vault for native USDC · avUSDC share token · Smart Economy Engine powered
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '2rem' }}>
          {[
            { label: 'Total Assets (USDC)', value: loading ? '...' : (Number(state?.totalAssets) / 1e6).toFixed(2) },
            { label: 'Total Supply (avUSDC)', value: loading ? '...' : (Number(state?.totalSupply) / 1e6).toFixed(2) + 'M' },
            { label: 'Share Price', value: loading ? '...' : sharePrice.toFixed(6) },
            { label: 'Total Missions', value: loading ? '...' : state?.missionCount.toString() },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '1rem' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>{stat.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Holders */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vault Holders</p>
            <a href={`https://testnet.arcscan.app/address/${VAULT}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-text-info)', textDecoration: 'none' }}>View contract</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Agent B (Worker)', address: AGENT_B, shares: state?.agentBShares, value: state?.agentBValue },
              { label: 'Main Wallet (Owner)', address: MAIN, shares: state?.mainShares, value: state?.mainShares && state?.totalSupply > 0n ? (state.mainShares * state.totalAssets) / state.totalSupply : 0n },
            ].map(holder => (
              <div key={holder.address} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'center', padding: '10px 12px', background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 2px', color: 'var(--color-text-primary)' }}>{holder.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>{holder.address.slice(0, 10)}...{holder.address.slice(-6)}</p>
                </div>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--color-text-primary)', textAlign: 'center' }}>
                  {loading ? '...' : (Number(holder.shares || 0n) / 1e6).toFixed(2)}M avUSDC
                </p>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--color-text-success)', textAlign: 'right' }}>
                  {loading ? '...' : (Number(holder.value || 0n) / 1e6).toFixed(4)} USDC
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Agents */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent Performance</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { name: 'Agent A (Orchestrator)', rep: state?.agentARep, missions: state?.agentAMissions, color: 'var(--color-text-info)' },
              { name: 'Agent B (Worker)', rep: state?.agentBRep, missions: state?.agentBMissions, color: 'var(--color-text-success)' },
            ].map(agent => (
              <div key={agent.name} style={{ padding: '12px', background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 8px', color: agent.color }}>{agent.name}</p>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>Reputation</p>
                    <p style={{ fontSize: '20px', fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>{loading ? '...' : agent.rep?.toString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>Missions</p>
                    <p style={{ fontSize: '20px', fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>{loading ? '...' : agent.missions?.toString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Info */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contracts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'ArcUSDCVault', address: VAULT },
              { label: 'MultiAgentOrchestrator', address: ORCH },
            ].map(c => (
              <div key={c.address} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)' }}>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--color-text-secondary)' }}>{c.label}</p>
                <a href={`https://testnet.arcscan.app/address/${c.address}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-text-info)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
                  {c.address.slice(0, 10)}...{c.address.slice(-6)}
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}