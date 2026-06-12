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

const ORCHESTRATOR = '0xe81f5BA4181eA29061C3C229c8D6EB4cFE56639C';

const abi = [
  { name: 'agentCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'missionCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'getContractBalance', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'getAgent', type: 'function', stateMutability: 'view', inputs: [{ name: 'agentId', type: 'uint256' }], outputs: [{ type: 'uint256' }, { type: 'address' }, { type: 'string' }, { type: 'string' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint8' }] },
  { name: 'getMission', type: 'function', stateMutability: 'view', inputs: [{ name: 'missionId', type: 'uint256' }], outputs: [{ type: 'uint256' }, { type: 'address' }, { type: 'string' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint8' }, { type: 'bytes32' }] },
] as const;

const STATUS = ['Open', 'Assigned', 'In Progress', 'Completed', 'Failed'];
const AGENT_STATUS = ['Inactive', 'Active', 'Busy'];
const STATUS_COLOR: Record<string, string> = {
  'Completed': 'var(--color-text-success)',
  'Active': 'var(--color-text-success)',
  'Busy': 'var(--color-text-warning)',
  'Open': 'var(--color-text-info)',
  'Assigned': 'var(--color-text-info)',
  'In Progress': 'var(--color-text-warning)',
  'Failed': 'var(--color-text-danger)',
  'Inactive': 'var(--color-text-secondary)',
};

type Agent = { id: string; address: string; name: string; capability: string; reputation: string; missions: string; status: string };
type Mission = { id: string; creator: string; description: string; budget: string; subBudget: string; status: string };

export default function MultiAgentPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [balance, setBalance] = useState('...');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const client = createPublicClient({ chain: arcTestnet as any, transport: http() });

    async function fetchData() {
      try {
        const [agentCount, missionCount, bal] = await Promise.all([
          client.readContract({ address: ORCHESTRATOR as `0x${string}`, abi, functionName: 'agentCount' }),
          client.readContract({ address: ORCHESTRATOR as `0x${string}`, abi, functionName: 'missionCount' }),
          client.readContract({ address: ORCHESTRATOR as `0x${string}`, abi, functionName: 'getContractBalance' }),
        ]);

        setBalance(formatUnits(bal as bigint, 18));

        const agentPromises = Array.from({ length: Number(agentCount) }, (_, i) =>
          client.readContract({ address: ORCHESTRATOR as `0x${string}`, abi, functionName: 'getAgent', args: [BigInt(i)] })
        );
        const missionPromises = Array.from({ length: Number(missionCount) }, (_, i) =>
          client.readContract({ address: ORCHESTRATOR as `0x${string}`, abi, functionName: 'getMission', args: [BigInt(i)] })
        );

        const [agentResults, missionResults] = await Promise.all([
          Promise.all(agentPromises),
          Promise.all(missionPromises),
        ]);

        setAgents(agentResults.map((a: any) => ({
          id: a[0].toString(),
          address: a[1],
          name: a[2],
          capability: a[3],
          reputation: a[4].toString(),
          missions: a[5].toString(),
          status: AGENT_STATUS[Number(a[6])] || 'Unknown',
        })));

        setMissions(missionResults.map((m: any) => ({
          id: m[0].toString(),
          creator: m[1],
          description: m[2],
          budget: formatUnits(m[3] as bigint, 18),
          subBudget: formatUnits(m[4] as bigint, 18),
          status: STATUS[Number(m[5])] || 'Unknown',
        })));

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

  const completedMissions = missions.filter(m => m.status === 'Completed').length;
  const totalBudget = missions.reduce((sum, m) => sum + parseFloat(m.budget || '0'), 0);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-background-tertiary)', fontFamily: 'var(--font-mono)' }}>

      <div style={{ borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '1.25rem 2rem', background: 'var(--color-background-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            Arc Intelligence
          </Link>
          <span style={{ color: 'var(--color-border-secondary)' }}>/</span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: 500 }}>Multi-Agent Orchestrator</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-success)', display: 'inline-block' }}></span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Live · {lastUpdate || 'loading'}</span>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>Multi-Agent Orchestrator</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Autonomous agents hire sub-agents, complete missions, and split payments on Arc Testnet
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '2rem' }}>
          {[
            { label: 'Agents registered', value: loading ? '...' : agents.length.toString() },
            { label: 'Missions created', value: loading ? '...' : missions.length.toString() },
            { label: 'Missions completed', value: loading ? '...' : completedMissions.toString() },
            { label: 'Total budget (USDC)', value: loading ? '...' : totalBudget.toFixed(2) },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '1rem' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>{stat.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agents ({agents.length})</p>
            <a href={`https://testnet.arcscan.app/address/${ORCHESTRATOR}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-text-info)', textDecoration: 'none' }}>
              View contract
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loading ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Loading agents...</p>
            ) : agents.map(agent => (
              <div key={agent.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px 80px', gap: '12px', alignItems: 'center', padding: '10px 12px', background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 2px', color: 'var(--color-text-primary)' }}>{agent.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>{agent.address.slice(0, 10)}...{agent.address.slice(-6)}</p>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{agent.capability}</p>
                <p style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: 'var(--color-text-primary)', textAlign: 'center' }}>{agent.reputation}</p>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--color-text-secondary)', textAlign: 'center' }}>{agent.missions}</p>
                <p style={{ fontSize: '12px', margin: 0, color: STATUS_COLOR[agent.status] || 'var(--color-text-secondary)', textAlign: 'center' }}>{agent.status}</p>
              </div>
            ))}
            {!loading && agents.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px 80px', gap: '12px', padding: '4px 12px' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0 }}>Name / Address</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0 }}>Capability</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>Rep</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>Missions</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>Status</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission history ({missions.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loading ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>Loading missions...</p>
            ) : missions.map(mission => (
              <div key={mission.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 90px', gap: '12px', alignItems: 'center', padding: '10px 12px', background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: 'var(--color-text-secondary)', textAlign: 'center' }}>#{mission.id}</p>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--color-text-primary)' }}>{mission.description}</p>
                <p style={{ fontSize: '12px', margin: 0, color: 'var(--color-text-secondary)', textAlign: 'center' }}>{parseFloat(mission.budget).toFixed(2)} USDC</p>
                <p style={{ fontSize: '12px', margin: 0, color: 'var(--color-text-secondary)', textAlign: 'center' }}>{parseFloat(mission.subBudget).toFixed(2)} USDC</p>
                <p style={{ fontSize: '12px', margin: 0, color: STATUS_COLOR[mission.status] || 'var(--color-text-secondary)', textAlign: 'right' }}>{mission.status}</p>
              </div>
            ))}
            {!loading && missions.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 90px', gap: '12px', padding: '4px 12px' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>ID</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0 }}>Description</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>Budget</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>Sub-budget</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'right' }}>Status</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contract</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Address</p>
              <a href={`https://testnet.arcscan.app/address/${ORCHESTRATOR}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-text-info)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
                {ORCHESTRATOR.slice(0, 14)}...{ORCHESTRATOR.slice(-6)}
              </a>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Contract balance</p>
              <p style={{ fontSize: '18px', fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>{loading ? '...' : parseFloat(balance).toFixed(4)} USDC</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Network</p>
              <p style={{ fontSize: '13px', margin: 0, color: 'var(--color-text-primary)' }}>Arc Testnet · 5042002</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
