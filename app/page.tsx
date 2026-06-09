'use client';

import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'Arcscan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
};

const MAIN_AGENT = '0x54b4B44749a95070560509B6Ec0be501665CcF63';
const USDC_CONTRACT = '0x3600000000000000000000000000000000000000';

const erc20Abi = [
  { name: 'balanceOf', type: 'function' as const, stateMutability: 'view' as const, inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
];

const contracts = [
  { name: 'HelloArchitect', address: '0xD19CC6F46740b49D8fA5146725609CeB7A6ee86b' },
  { name: 'SimpleStorage', address: '0x0BCBE7579897cF25C846aFf614feC3666AFBe116' },
  { name: 'EventLogger', address: '0x9C50765e591663ED541B2fB863626f39fC6C12e0' },
  { name: 'Counter', address: '0x5CE58ee895F4c0FDFA774E4795c9eDa9c5930c8f' },
  { name: 'Whitelist', address: '0x331344f3dbd6fb654d4CB25db6Ce5B4D2949AE7E' },
  { name: 'ERC721 NFT', address: '0x52C457C9BC8C6f4d7B7Bb5adE4D7FEfA4aE5Cf76' },
  { name: 'ERC20 Token', address: '0xEC1D5372368a1b865aFA984FBF87E09CB2116768' },
  { name: 'Voting', address: '0xccEDE5e65e29616a5F6E3b93B71011896a8C66F2' },
  { name: 'TimeLock', address: '0x13EDC06FC938dF2ca8225474221BeB5e3Ee15Ec4' },
  { name: 'Escrow', address: '0x4937B993530817debe2A9ed3105A9BBF969b17a9' },
  { name: 'MultiSig', address: '0x5b9c9E0f2a57981F5315E7bA95bc830E9e00A2DD' },
  { name: 'Staking', address: '0xaDD109D81eBb3B59b58e4fb3d78bb9497917193d' },
  { name: 'Lottery', address: '0xB80dc31CE5da607051E37f005D44990b51D468F6' },
  { name: 'Vesting', address: '0x240365eAD3de331268d18B4E0c50C33f337Db86a' },
  { name: 'DAO', address: '0x3f94600877D990dd966dd83493b454A726A73d95' },
];

const prs = [
  'docs/foundry-smart-contract-deploy-guide',
  'docs/x402-arc-agent-example',
  'docs/erc8004-agent-registration-example',
  'docs/erc8183-job-lifecycle-example',
  'docs/unified-agentic-flow-example',
  'docs/arc-intelligence-dashboard-example',
  'docs/arc-mcp-server-example',
];

const projects = [
  { name: 'Arc Agent API', desc: 'X402 + ERC-8004 + ERC-8183', url: 'https://github.com/consumeobeydie/arc-agent-api', status: 'LIVE' },
  { name: 'Arc MCP Server', desc: 'Claude Code blockchain tools', url: 'https://github.com/consumeobeydie/arc-mcp-server', status: 'LIVE' },
  { name: 'Arc Intelligence Dashboard', desc: 'Real-time testnet dashboard', url: 'https://arc-intelligence-dashboard.vercel.app', status: 'LIVE' },
  { name: 'Hermes Arc X402', desc: 'Nous Research skill', url: 'https://github.com/consumeobeydie/hermes-arc-x402', status: 'LIVE' },
];

export default function Dashboard() {
  const [balance, setBalance] = useState('...');
  const [blockNumber, setBlockNumber] = useState('...');
  const [txCount, setTxCount] = useState('...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = createPublicClient({ chain: arcTestnet as any, transport: http() });

    async function fetchData() {
      try {
        const bal = await client.readContract({
          address: USDC_CONTRACT as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [MAIN_AGENT as `0x${string}`],
        });
        const block = await client.getBlockNumber();
        const txs = await client.getTransactionCount({ address: MAIN_AGENT as `0x${string}` });
        setBalance(formatUnits(bal as bigint, 6));
        setBlockNumber(block.toString());
        setTxCount(txs.toString());
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

  return (
    <main className="min-h-screen bg-black text-white font-mono">
      <div className="border-b border-green-500/30 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-400 tracking-widest uppercase">Arc Intelligence</h1>
            <p className="text-green-600 text-xs mt-1 tracking-widest">TESTNET DASHBOARD v2.0</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-green-600 tracking-widest">CHAIN ID</div>
            <div className="text-green-400 font-bold">5042002</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="border border-green-500/30 p-4 rounded">
          <div className="text-xs text-green-600 tracking-widest mb-2">MAIN AGENT ADDRESS</div>
          <a href={`https://testnet.arcscan.app/address/${MAIN_AGENT}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-sm break-all">
            {MAIN_AGENT}
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-green-500/30 p-4 rounded">
            <div className="text-xs text-green-600 tracking-widest mb-2">USDC BALANCE</div>
            <div className="text-3xl font-bold text-green-400">{loading ? '...' : balance}</div>
            <div className="text-xs text-green-700 mt-1">ERC-20 USDC</div>
          </div>
          <div className="border border-green-500/30 p-4 rounded">
            <div className="text-xs text-green-600 tracking-widest mb-2">LATEST BLOCK</div>
            <div className="text-3xl font-bold text-green-400">{loading ? '...' : Number(blockNumber).toLocaleString()}</div>
            <div className="text-xs text-green-700 mt-1">ARC TESTNET</div>
          </div>
          <div className="border border-green-500/30 p-4 rounded">
            <div className="text-xs text-green-600 tracking-widest mb-2">TX COUNT</div>
            <div className="text-3xl font-bold text-green-400">{loading ? '...' : txCount}</div>
            <div className="text-xs text-green-700 mt-1">TOTAL TRANSACTIONS</div>
          </div>
        </div>

        <div className="border border-green-500/30 p-4 rounded">
          <div className="text-xs text-green-600 tracking-widest mb-4">AGENTIC STACK</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-green-500/20 p-3 rounded">
              <div className="text-green-400 font-bold text-sm mb-1">X402 PAYMENT</div>
              <div className="text-xs text-green-700">Protocol: x402-express</div>
              <div className="text-xs text-green-700">Network: Base Sepolia</div>
              <div className="text-xs text-green-700">Price: $0.001 USDC/req</div>
              <div className="mt-2 text-xs text-green-500">ACTIVE</div>
            </div>
            <div className="border border-green-500/20 p-3 rounded">
              <div className="text-green-400 font-bold text-sm mb-1">ERC-8004 IDENTITY</div>
              <div className="text-xs text-green-700">Agent ID: 69828</div>
              <div className="text-xs text-green-700">Reputation: 95</div>
              <div className="text-xs text-green-700">Tag: x402_payment_verified</div>
              <div className="mt-2 text-xs text-green-500">REGISTERED</div>
            </div>
            <div className="border border-green-500/20 p-3 rounded">
              <div className="text-green-400 font-bold text-sm mb-1">ERC-8183 JOB</div>
              <div className="text-xs text-green-700">Job ID: 110935</div>
              <div className="text-xs text-green-700">Budget: 1 USDC</div>
              <div className="text-xs text-green-700">Status: Completed</div>
              <div className="mt-2 text-xs text-green-500">COMPLETED</div>
            </div>
          </div>
        </div>

        <div className="border border-green-500/30 p-4 rounded">
          <div className="text-xs text-green-600 tracking-widest mb-4">PROJECTS</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between border border-green-500/20 p-3 rounded hover:border-green-500/50 transition-colors group">
                <div>
                  <div className="text-xs text-green-400 group-hover:text-green-300 font-bold">{p.name}</div>
                  <div className="text-xs text-green-700 mt-1">{p.desc}</div>
                </div>
                <div className="text-xs text-green-500">{p.status}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="border border-green-500/30 p-4 rounded">
          <div className="text-xs text-green-600 tracking-widest mb-4">DEPLOYED CONTRACTS ({contracts.length})</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {contracts.map((c) => (
              <a key={c.address} href={`https://testnet.arcscan.app/address/${c.address}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between border border-green-500/20 p-2 rounded hover:border-green-500/50 transition-colors group">
                <span className="text-xs text-green-400 group-hover:text-green-300">{c.name}</span>
                <span className="text-xs text-green-700 group-hover:text-green-600">{c.address.slice(0, 6)}...{c.address.slice(-4)}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="border border-green-500/30 p-4 rounded">
          <div className="text-xs text-green-600 tracking-widest mb-4">CIRCLEFIN/ARC-NODE CONTRIBUTIONS ({prs.length} PRs)</div>
          <div className="space-y-2">
            {prs.map((pr) => (
              <div key={pr} className="flex items-center gap-2 text-xs">
                <span className="text-green-500">→</span>
                <span className="text-green-400">{pr}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-green-500/30 p-4 rounded">
          <div className="text-xs text-green-600 tracking-widest mb-4">NOUS RESEARCH / HERMES-AGENT CONTRIBUTIONS</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-500">→</span>
              <span className="text-green-400">PR #41233 — feat: add x402-payment skill for autonomous USDC micropayments</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-500">→</span>
              <span className="text-green-400">PR #42968 — feat: add ERC-8183 agentic commerce job skill</span>
            </div>
          </div>
        </div>

        <div className="border-t border-green-500/30 pt-4 flex justify-between text-xs text-green-700">
          <span>Arc Testnet | Chain ID: 5042002</span>
          <a href="https://github.com/consumeobeydie" target="_blank" rel="noopener noreferrer" className="hover:text-green-500">
            github.com/consumeobeydie
          </a>
        </div>
      </div>
    </main>
  );
}
