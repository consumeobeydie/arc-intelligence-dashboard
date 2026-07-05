export default function PitchPage() {
  const projects = [
    { name: "ArcDEX", desc: "Uniswap v2 AMM — USDC/EURC pool", addr: "0x1A142DF560a671c66c361A29a48Ab839Bc9F890E", tag: "DeFi" },
    { name: "AgentIdentity", desc: "ERC-8004 on-chain identity & reputation", addr: "0x5275783cD74eC21739Af8f3be9c42C024F671cFb", tag: "ERC-8004" },
    { name: "SpendingLimits", desc: "Programmable daily/weekly budget caps", addr: "0x615a4B25448980a6b518f9F9088C206387535192", tag: "Agent" },
    { name: "SplitPayment", desc: "Multi-recipient revenue distribution", addr: "0x775D4DF117f0B63a16ade4185bDa221Adcb4AEA3", tag: "Payments" },
    { name: "ArcUSDCVault", desc: "ERC-4626 yield vault", addr: "0x6C13dA317B65474299F6fDee02daDd6626Eb2BFe", tag: "Vault" },
    { name: "MultiAgent", desc: "Multi-agent orchestrator", addr: "0xe81f5BA4181eA29061C3C229c8D6EB4cFE56639C", tag: "Agent" },
  ];

  const stats = [
    { label: "Contracts Deployed", value: "27+" },
    { label: "GitHub PRs", value: "20+" },
    { label: "npm Package", value: "@consumeobeydie/arc-agent-sdk" },
    { label: "Forge Tests", value: "100% Pass" },
    { label: "On-chain TXs", value: "500+" },
    { label: "Articles", value: "80+ TR+EN" },
  ];

  const comparison = [
    { feature: "Gas token", ethereum: "ETH (volatile)", arc: "USDC (stable)" },
    { feature: "Gas cost per TX", ethereum: "$0.50 - $63", arc: "$0.0001" },
    { feature: "Finality", ethereum: "~12 seconds", arc: "<1 second" },
    { feature: "AMM feasibility", ethereum: "Expensive", arc: "Practically free" },
    { feature: "Agent micropayments", ethereum: "Impossible", arc: "Native" },
    { feature: "Privacy", ethereum: "Public", arc: "Opt-in" },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white font-mono p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-green-400 mb-4">Arc Testnet Builder</h1>
          <p className="text-xl text-gray-400 mb-2">consumeobeydie</p>
          <p className="text-gray-500">Building the Agentic Economy — one contract at a time</p>
          <div className="flex justify-center gap-4 mt-6">
            <a href="https://github.com/consumeobeydie" target="_blank" className="text-green-400 text-sm border border-green-800 px-4 py-2 rounded hover:bg-green-900/20">GitHub</a>
            <a href="https://www.npmjs.com/package/@consumeobeydie/arc-agent-sdk" target="_blank" className="text-green-400 text-sm border border-green-800 px-4 py-2 rounded hover:bg-green-900/20">npm SDK</a>
            <a href="https://testnet.arcscan.app" target="_blank" className="text-green-400 text-sm border border-green-800 px-4 py-2 rounded hover:bg-green-900/20">Explorer</a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
              <p className="text-2xl font-bold text-green-400">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Why Arc */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-green-400 mb-6">Why Arc?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 text-gray-500">Feature</th>
                  <th className="text-left py-3 text-red-400">Ethereum</th>
                  <th className="text-left py-3 text-green-400">Arc</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-900">
                    <td className="py-3 text-gray-400">{row.feature}</td>
                    <td className="py-3 text-red-400">{row.ethereum}</td>
                    <td className="py-3 text-green-400">{row.arc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-green-400 mb-6">Deployed Contracts</h2>
          <div className="grid grid-cols-2 gap-4">
            {projects.map((p) => (
              
                <a key={p.name}
                href={`https://testnet.arcscan.app/address/${p.addr}`}
                target="_blank"
                className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-green-800 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white">{p.name}</h3>
                  <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded">{p.tag}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{p.desc}</p>
                <p className="text-xs text-gray-700 font-mono">{p.addr.slice(0, 20)}...</p>
              </a>
            ))}
          </div>
        </div>

        {/* Vision */}
        <div className="bg-gray-900 border border-green-900 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold text-green-400 mb-4">The Agentic Economy</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
            {"The next users of money are not human."} — Rachel Mayer, Arc
          </p>
          <p className="text-gray-500 text-sm mt-4 leading-relaxed max-w-2xl mx-auto">
            This project builds the full stack: identity (ERC-8004), spending controls, revenue splits, DEX liquidity, and an SDK — all on Arc Testnet with USDC as gas.
          </p>
        </div>

      </div>
    </main>
  );
}
