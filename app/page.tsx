'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Link from 'next/link';
import Image from 'next/image';
import CliShowcaseSection from '../components/CliShowcaseSection';
import WorkflowShowcaseSection from '../components/WorkflowShowcaseSection';
import VideoShowcaseSection from '../components/VideoShowcaseSection';

// Features for the outline
const FEATURE_SPEC = [
  {
    title: 'Execution Manager',
    subtitle: 'Soroban-native smart contract',
    description: 'Binds execution requests, active states, proof generation, and isolated resource bounds into a decentralized audit trial.',
    color: 'rgba(46,242,142,0.95)'
  },
  {
    title: 'Payment Router',
    subtitle: '0x402 Settlement standard',
    description: 'Implements native token settlement, protocol execution tariffs, workflow fee routing, and secure treasury accounting.',
    color: '#00FFE5'
  },
  {
    title: 'Programmable Agent Wallet',
    subtitle: 'Self-custodial agent-owned accounts',
    description: 'Programmable payment policies, daily spend thresholds, whitelisting for Soroswap/Blend pools, and strict multisig checks.',
    color: '#7b61ff'
  }
];

// CLI simulator contents
const CLI_COMMANDS = {
  'forge init': [
    'Creating local workspace...',
    '  ├── workspace/main.py',
    '  ├── workspace/agent.yaml',
    '  ├── workspace/requirements.txt',
    '  └── config/keys.json (linked to sandbox)',
    '✔ Initialized AgentForge project under python-3.11-stellar runtime.'
  ],
  'forge run': [
    '🔄 Compiling agent.yaml configuration to DAG...',
    '✔ DAG compiled: fetch_prices → analyze → simulate → execute → report',
    '📦 Spinning up PRoot sandboxed runtime environment...',
    '🔒 Mounting isolated namespaces, cgroups, and seccomp system-call filter...',
    '🚀 Booting agent process inside node-20-stellar runtime image...',
    '⏳ Executing step 1/5: fetch_prices (Soroswap liquidity query)...',
    '⏳ Executing step 2/5: analyze (Calculated slippage: 0.18% on AQUARIUS)...',
    '⏳ Executing step 3/5: simulate (Paper trade simulation: BUY 1,500 XLM)...',
    '⏳ Executing step 4/5: execute (Requesting signature via Agent Wallet Contract)...',
    '✔ Soroswap swap transaction succeeded: Hash [0x7f23a...f12c]',
    '⏳ Executing step 5/5: report (Sending audit proof to Agent Validator)...',
    '✨ Workflow completed successfully. Sandboxed container destroyed.'
  ],
  'forge deploy': [
    '🔑 Compiling agent source and verifying runtime checksums...',
    '📡 Pushing agent metadata to IPFS...',
    '   ↳ IPFS Hash: QmP9r2GgX...7y8z',
    '✍ Requesting signature from your Stellar Wallet...',
    '📡 Broadcasting to Stellar Testnet...',
    '✔ Deployed successfully to AgentRegistry Contract!',
    '   ↳ Registry Contract ID: CAS3...FORG',
    '   ↳ Validation Contract ID: CBB2...VALD'
  ],
  'forge monitor': [
    '📡 Connected to /ws/runtime gateway...',
    '── AGENT MONITORING CONSOLE ─────────────────────────',
    '● Runtime Status: ACTIVE (RUNNING)',
    '● CPU Limit: 2 Cores | Memory: 512MB',
    '● Network policy: WHITELIST (Soroswap API, Stellar RPC)',
    '● Current PnL: +$148.50 USD (Virtual balance)',
    '● Logs streaming: active... press Ctrl+C to close'
  ]
};

// Filesystems simulator
const DIRECTORY_STRUCTURE = {
  '/workspace': {
    description: 'Your primary agent logic directory. Read-write permitted only inside sandbox process.',
    file: 'main.py',
    content: `import sys\nfrom stellar_sdk import Server\nfrom agentforge import AgentWallet\n\ndef execute_logic():\n    print("Initiating market observation...")\n    # Agent-owned wallet interacts with Soroban SDK\n    wallet = AgentWallet.connect()\n    balance = wallet.get_balance()\n    print(f"Agent Balance: {balance} XLM")\n    \n    if balance > 100:\n        wallet.execute_swap("AQUARIUS", "XLM", "USDC", 50)\n\nif __name__ == "__main__":\n    execute_logic()`
  },
  '/config': {
    description: 'Secure, sandboxed configuration containing credentials and agent identity rules.',
    file: 'agent.yaml',
    content: `agent:\n  name: "ArbitrageStrike-V1"\n  version: "1.0.0"\n  model: "openai-gpt4o-mini"\n  payout_policy:\n    treasury: "GD23...AF89"\n    split_ratio: 0.85 # 85% to builder, 15% to protocol\n\nworkflow:\n  steps:\n    - name: fetch_prices\n      timeout: 30\n    - name: swap_dex\n      dependencies: [fetch_prices]`
  },
  '/logs': {
    description: 'Dynamic output logs streaming straight from the sandboxed container.',
    file: 'execution.log',
    content: `[2026-05-31 03:52:12] INFO: Booting PRoot filesystem layer...\n[2026-05-31 03:52:14] INFO: Sandboxed runtime allocated successfully.\n[2026-05-31 03:52:15] DEBUG: Network namespace locked. Only whitelisted endpoints allowed.\n[2026-05-31 03:52:16] SUCCESS: Agent identity contract verified [CAS3...FORG].`
  },
  '/artifacts': {
    description: 'Folder containing immutable trade proofs, CSV outputs, and performance reports.',
    file: 'pnl_report.json',
    content: `{\n  "agent_id": "arbitrage-strike-v1",\n  "timestamp": 1780182732,\n  "simulated_trades": 18,\n  "successful_swaps": 14,\n  "virtual_pnl_usd": 148.50,\n  "gas_spent_xlm": 0.082,\n  "audit_proof_ready": true\n}`
  },
  '/runtime': {
    description: 'System folder detailing isolation thresholds: CPU limits, cgroup properties, and seccomp filters.',
    file: 'sandbox.status',
    content: `sandbox_isolation_profile:\n  runtime: "pr-cgroups-v2"\n  namespaces:\n    - mount\n    - pid\n    - net\n    - ipc\n  seccomp_policy: "strict-block-syscalls"\n  allow_host_filesystem: false\n  signing_service_url: "http://signing-service.internal"`
  }
};

export default function HomePage() {
  // States for interactive components
  const [activeStep, setActiveStep] = useState<'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED'>('RUNNING');
  const [selectedFolder, setSelectedFolder] = useState<keyof typeof DIRECTORY_STRUCTURE>('/workspace');
  const [cliCommand, setCliCommand] = useState<keyof typeof CLI_COMMANDS>('forge run');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'contracts' | 'sandbox' | 'cli' | 'trading'>('contracts');

  // Paper trading mock state
  const [usdBalance, setUsdBalance] = useState(10000);
  const [xlmBalance, setXlmBalance] = useState(50000);
  const [tradeQuantity, setTradeQuantity] = useState('1000');
  const [tradeAsset, setTradeAsset] = useState('XLM');
  const [paperTrades, setPaperTrades] = useState([
    { id: '1', time: '10:42 AM', type: 'BUY', pair: 'XLM/USDC', size: '5,000 XLM', entry: '0.124', status: 'COMPLETED', pnl: '+4.2%' },
    { id: '2', time: '11:15 AM', type: 'SELL', pair: 'AQUARIUS/XLM', size: '10,000 AQUA', entry: '0.008', status: 'COMPLETED', pnl: '+2.8%' },
  ]);
  const [newOrderSuccess, setNewOrderSuccess] = useState(false);

  // Cryptographic verifier state
  const [auditHashes, setAuditHashes] = useState({
    execution: 'ea9e0ef7343e06180c4...7f92b49c',
    runtime: '8a2b109e230cbda109f...c28901ba',
    workflow: '6fb910e1189acbe09c7...a238fd19',
    agent: '98e1b20f01ba879cda8...28b9d0ea',
    validated: false,
    verifying: false
  });

  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const showcaseSectionRef = useRef<HTMLElement | null>(null);
  const showcaseHeaderRef = useRef<HTMLDivElement | null>(null);
  const showcaseTabsRef = useRef<HTMLDivElement | null>(null);
  const showcaseFeatureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const showcaseMonitorRef = useRef<HTMLDivElement | null>(null);

  const animateGlassCard = (element: HTMLElement | null, hovered: boolean) => {
    if (!element) return;
    // kill any existing tweens for this element first
    gsap.killTweensOf(element);

    const isMonitor = element.dataset.role === 'monitor';

    if (hovered) {
      if (isMonitor) {
        // subtle lift + greenish glow pulse for monitor nodes
        gsap.to(element, {
          y: -6,
          scale: 1.015,
          borderColor: 'rgba(46,242,142,0.34)',
          backgroundColor: 'rgba(46,242,142,0.04)',
          boxShadow: '0 26px 70px rgba(46,242,142,0.08)',
          duration: 0.28,
          ease: 'power2.out',
          overwrite: false
        });

        // gentle pulsing glow
        gsap.to(element, {
          boxShadow: '0 30px 90px rgba(46,242,142,0.12)',
          duration: 0.9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          overwrite: false
        });
      } else {
        gsap.to(element, {
          y: -8,
          scale: 1.02,
          backgroundColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.34)',
          duration: 0.28,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    } else {
      // revert state
      if (isMonitor) {
        gsap.to(element, {
          y: 0,
          scale: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(8,8,15,0.56)',
          boxShadow: '0 14px 30px rgba(0,0,0,0.16)',
          duration: 0.45,
          ease: 'elastic.out(1, 0.6)'
        });
        // clear any repeating pulsing tweens
        gsap.killTweensOf(element, { properties: 'boxShadow' });
      } else {
        gsap.to(element, {
          y: 0,
          scale: 1,
          backgroundColor: 'rgba(8,8,15,0.56)',
          boxShadow: '0 14px 30px rgba(0,0,0,0.16)',
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    }
  };

  useLayoutEffect(() => {
    const section = showcaseSectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(showcaseHeaderRef.current, { opacity: 0, y: 30, scale: 0.995 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power4.out' });
      gsap.fromTo(showcaseTabsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.06, ease: 'power3.out' });
      gsap.fromTo(showcaseFeatureRefs.current.filter(Boolean), { opacity: 0, y: 36, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.09, delay: 0.12, ease: 'power3.out' });
      gsap.fromTo(showcaseMonitorRef.current, { opacity: 0, x: 28, scale: 0.995 }, { opacity: 1, x: 0, scale: 1, duration: 0.9, delay: 0.2, ease: 'power3.out' });
    }, section);

    return () => ctx.revert();
  }, []);

  // CLI log typing simulator
  useEffect(() => {
    setIsTyping(true);
    setTerminalLines([]);
    let currentLine = 0;
    const lines = CLI_COMMANDS[cliCommand];

    const timer = setInterval(() => {
      if (currentLine < lines.length) {
        setTerminalLines((prev) => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 450);

    return () => clearInterval(timer);
  }, [cliCommand]);

  // Terminal scroll to bottom without pulling the entire window down
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Simulated live execution loop
  useEffect(() => {
    const steps: ('PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED')[] = ['PENDING', 'QUEUED', 'RUNNING', 'COMPLETED'];
    let index = steps.indexOf(activeStep);

    const interval = setInterval(() => {
      index = (index + 1) % steps.length;
      setActiveStep(steps[index]);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeStep]);

  // Submit mock paper order
  const handlePaperOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(tradeQuantity);
    if (isNaN(qty) || qty <= 0) return;

    const rate = 0.125; // mock XLM price in USD
    const totalCost = qty * rate;

    if (tradeAsset === 'XLM') {
      if (usdBalance < totalCost) {
        alert('Insufficient mock USDC balance!');
        return;
      }
      setUsdBalance((prev) => prev - totalCost);
      setXlmBalance((prev) => prev + qty);
    } else {
      if (xlmBalance < qty) {
        alert('Insufficient mock XLM balance!');
        return;
      }
      setXlmBalance((prev) => prev - qty);
      setUsdBalance((prev) => prev + totalCost);
    }

    const newTrade = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: tradeAsset === 'XLM' ? 'BUY' : 'SELL',
      pair: 'XLM/USDC',
      size: `${qty.toLocaleString()} XLM`,
      entry: rate.toString(),
      status: 'COMPLETED',
      pnl: '0.0%'
    };

    setPaperTrades((prev) => [newTrade, ...prev]);
    setNewOrderSuccess(true);
    setTimeout(() => setNewOrderSuccess(false), 2000);
  };

  // Run mock cryptographic verification
  const handleVerifyAudit = () => {
    setAuditHashes(prev => ({ ...prev, verifying: true }));
    setTimeout(() => {
      setAuditHashes(prev => ({
        ...prev,
        verifying: false,
        validated: true,
        execution: 'ea9e0ef7343e06180c439129841804f981297e298109d9f123d47f92b49c',
        runtime: '8a2b109e230cbda109f283d10294e1e812d8a0f28b0cb1c28901ba28d9c28901',
        workflow: '6fb910e1189acbe09c73d2746f3918237912e8b23c91b7d8d238fd19bc9e10ab',
        agent: '98e1b20f01ba879cda812b109e02ef29b8c0df12d312bc80cb28b9d0ea01c29e'
      }));
    }, 1500);
  };

  return (
    <div className="page-theme min-h-screen overflow-x-hidden text-white font-sans">

      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden border-b border-white/5 bg-[#050508] px-4 py-6 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(46,242,142,0.12),transparent_22%),radial-gradient(circle_at_20%_18%,rgba(0,255,229,0.05),transparent_18%),radial-gradient(circle_at_80%_14%,rgba(123,97,255,0.04),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:8px_8px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.95),transparent_88%)]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src="/hands_creation.png"
            alt="Emergent 3D Hands Silhouette"
            fill
            className="object-cover object-center invert brightness-[0.98] contrast-[1.02] opacity-22 scale-[1.06] blur-[1.5px] sm:blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(5,5,8,0.14)_0%,rgba(5,5,8,0.5)_50%,rgba(5,5,8,0.94)_92%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508]" />
        </div>

        <div className="relative z-10 page-shell w-full py-0">
          <div className="mx-auto max-w-4xl text-center select-text">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="flex flex-col items-center font-serif text-[clamp(2.9rem,7vw,6.2rem)] font-semibold leading-none tracking-[-0.08em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.72)]"
            >
              <span className="block text-white leading-none">Agentic OS.</span>
              <span className="mt-[0.04em] block text-white leading-none">
                Built on{' '}
                <span className="inline-grid items-end align-bottom">
                  <span className="col-start-1 row-start-1 invisible pointer-events-none pr-[2px] border-r-[0.08em] border-transparent">
                    Stellar.
                  </span>
                  <span className="col-start-1 row-start-1 typewriter-text">
                    <span className="bg-gradient-to-r from-white to-[var(--color-green-strong)] bg-clip-text text-transparent">
                      Stellar.
                    </span>
                  </span>
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="mx-auto mt-4 max-w-2xl text-balance font-sans text-[13px] font-medium leading-[1.72] tracking-[-0.01em] text-white/72 sm:text-[14px] md:text-[15px]"
            >
              Build portable, PRoot-sandboxed agents with deterministic workflows, secure Stellar wallets, programmable payments, and auditable Soroban runtimes.
            </motion.p>
          </div>

          <div className="absolute inset-x-0 bottom-2 sm:bottom-3">
            <div className="relative mx-auto max-w-[100vw] overflow-hidden px-0">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050508] to-transparent sm:w-32" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050508] to-transparent sm:w-32" />
              <div className="flex w-[200%] marquee-track items-center will-change-transform">
                <div className="flex w-1/2 items-center justify-around gap-8 whitespace-nowrap px-6 font-serif text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-white/60 sm:text-[0.78rem]">
                  <span className="text-white/45">SOROSWAP</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/70">BLEND POOLS</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/50">AQUARIUS DEX</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/65">PHOENIX FI</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/55">STELLAR CORE</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/70">0x402 ROUTER</span>
                </div>
                <div className="flex w-1/2 items-center justify-around gap-8 whitespace-nowrap px-6 font-serif text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-white/60 sm:text-[0.78rem]">
                  <span className="text-white/45">SOROSWAP</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/70">BLEND POOLS</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/50">AQUARIUS DEX</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/65">PHOENIX FI</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/55">STELLAR CORE</span>
                  <span className="h-px w-10 bg-white/12" />
                  <span className="text-white/70">0x402 ROUTER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE CORE SPECIFICATION SHOWCASE ──────────────────────────── */}
      <section className="py-20 px-4 bg-[#050508]/90 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center max-w-5xl mx-auto mb-16"
        >
          <h2 className="mx-auto inline-flex flex-col items-center font-serif text-[clamp(2.9rem,7vw,6.2rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]">
            <span className="block whitespace-nowrap">Architecture built for</span>
            <span className="block whitespace-nowrap">ironclad orchestration.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base leading-[1.7] text-gray-400">
            Every layer from contracts to execution runtimes is decoupled, isolated, and auditable. Switch between architectural layers below.
          </p>
        </motion.div>

        {/* Dynamic Selector Tabs (glass shell) */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-[1.25rem] p-4 bg-[rgba(8,8,15,0.48)] border border-white/6 backdrop-blur-md shadow-lg mb-10">
            <div ref={showcaseTabsRef} className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
              {[
                { id: 'contracts', label: 'Soroban Contracts', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                { id: 'sandbox', label: 'Sandboxed Filesystem', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> },
                { id: 'cli', label: 'CLI Developer DX', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                { id: 'trading', label: 'Paper Trading Engine', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-xs font-semibold transition-all duration-300 ${activeTab === tab.id
                      ? 'bg-[rgba(46,242,142,0.12)] border border-[rgba(46,242,142,0.24)] text-[var(--color-green-strong)] shadow-[0_10px_24px_rgba(46,242,142,0.06)]'
                      : 'border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                    }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab 1: Soroban Contracts */}
        <AnimatePresence mode="wait">
          {activeTab === 'contracts' && (
            <motion.div
              key="contracts"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_1.1fr] max-w-7xl mx-auto w-full items-center"
            >
              <div className="space-y-8 flex flex-col justify-center">
                <div>
                  <div className="page-kicker text-sm text-[#00FFE5] tracking-widest font-mono mb-3">Soroban Contract Core</div>
                  <h3 className="font-syne text-3xl md:text-4xl font-extrabold text-white leading-tight">
                    Decentralized governance of agent life cycles.
                  </h3>
                  <p className="text-gray-400 text-[15px] mt-4 leading-relaxed max-w-lg">
                    Three native smart contracts manage registration, security assertions, token billing, and spend restrictions directly on the Stellar ledger.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  {FEATURE_SPEC.map((spec, idx) => (
                    <div
                      key={spec.title}
                      ref={(el) => void (showcaseFeatureRefs.current[idx] = el)}
                      onMouseEnter={() => animateGlassCard(showcaseFeatureRefs.current[idx], true)}
                      onMouseLeave={() => animateGlassCard(showcaseFeatureRefs.current[idx], false)}
                      className="group relative rounded-2xl p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md shadow-md transition-all duration-400 overflow-hidden cursor-default"
                    >
                      <div className="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl z-0 pointer-events-none" style={{ backgroundColor: spec.color }} />
                      <div className="relative z-10 flex gap-5 items-start">
                        <div className="mt-1 shrink-0 p-3 rounded-xl bg-[#0b0b11] border border-white/5 shadow-inner flex items-center justify-center w-14 h-14">
                          <div className="w-6 h-6 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: spec.color, color: spec.color }} />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-[16px] font-bold text-white tracking-wide">{spec.title}</h4>
                          <span className="text-[11px] font-mono mt-1 mb-2 uppercase tracking-widest" style={{ color: spec.color }}>{spec.subtitle}</span>
                          <p className="text-[13px] text-gray-400 leading-relaxed">{spec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution State Interactive Widget */}
              <div ref={showcaseMonitorRef} className="page-panel p-6 sm:p-8 flex flex-col justify-between border-white/10 bg-[#08080f]/70 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[var(--color-green-strong)] opacity-[0.02] blur-[80px] pointer-events-none group-hover:opacity-[0.04] transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <span className="font-mono text-xs text-gray-500">CONTRACT LOGIC: ExecutionManager.soroban</span>
                    <span className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                      Ledger Verified
                    </span>
                  </div>

                  <h4 className="font-syne text-lg font-bold text-white mb-2">Interactive Pipeline State Monitor</h4>
                  <p className="text-xs text-gray-400 mb-8">
                    Watch the Soroban contract dynamically cycle agent states based on execution proofs and payments. Click a state node to force a manual pipeline jump.
                  </p>

                  <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Pipeline connecting line removed per request (no divider between cards) */}

                    {[
                      { id: 'PENDING', desc: 'Verifying keys & AF gas tokens' },
                      { id: 'QUEUED', desc: 'Acquiring sandbox container' },
                      { id: 'RUNNING', desc: 'Executing sandboxed DAG' },
                      { id: 'COMPLETED', desc: 'Publishing proof & audits' }
                    ].map((step, idx) => {
                      const isActive = activeStep === step.id;
                      return (
                        <button
                            key={step.id}
                            data-role="monitor"
                            onClick={() => setActiveStep(step.id as typeof activeStep)}
                            onMouseEnter={(e) => animateGlassCard(e.currentTarget as HTMLElement, true)}
                            onMouseLeave={(e) => animateGlassCard(e.currentTarget as HTMLElement, false)}
                            className={`relative z-10 p-4 rounded-xl border text-left transition-all duration-300 ${isActive
                              ? 'border-[var(--color-green-strong)] bg-gradient-to-br from-[rgba(46,242,142,0.08)] to-transparent shadow-[0_0_20px_rgba(46,242,142,0.05)]'
                              : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                            }`}
                          >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-[var(--color-green-strong)]' : 'text-gray-600'}`}>
                              0{idx + 1}
                            </span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green-strong)] animate-ping" />
                            )}
                          </div>
                          <div className={`font-mono text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {step.id}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 leading-normal">{step.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* State explanations or output logs */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-gray-400 min-h-[90px] flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[var(--color-green-strong)] font-bold mb-1.5">
                    <span>🗲</span>
                    <span>State Active: {activeStep}</span>
                  </div>
                  {activeStep === 'PENDING' && (
                    <p>Executing signature checks. The Payment Router verified a gas deposit of 2.50 AF Tokens from account GD42...12A8. Validation pending signature checks...</p>
                  )}
                  {activeStep === 'QUEUED' && (
                    <p>Soroban contract approved execution request. Allocating CPU limits inside NATS broker. Dispatching runner agent code to standard Docker-isolated PRoot sandbox...</p>
                  )}
                  {activeStep === 'RUNNING' && (
                    <p>Sandbox isolated. DAG workflow running: main.py executes Soroswap slippage estimation. System calls verified by seccomp policy filter.</p>
                  )}
                  {activeStep === 'COMPLETED' && (
                    <p>Execution completed successfully. Cryptographic audit hashes generated and anchored to Stellar block. Host container destroyed and locked.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Sandboxed Filesystem */}
          {activeTab === 'sandbox' && (
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_1.1fr] max-w-7xl mx-auto w-full items-center"
            >
              <div className="space-y-8 flex flex-col justify-center">
                <div>
                  <div className="page-kicker text-sm text-[#00FFE5] tracking-widest font-mono mb-3">Sandbox Isolation</div>
                  <h3 className="font-syne text-3xl md:text-4xl font-extrabold text-white leading-tight">
                    Strictly sandboxed agent environments.
                  </h3>
                  <p className="text-gray-400 text-[15px] mt-4 leading-relaxed max-w-lg">
                    Agents operate inside a lightweight **PRoot** sandbox wrapped with namespaces, strict cgroups, and strict seccomp restrictions. They can never escape to the host filesystem, and all signing must pass through the Soroban Policy contract.
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  {[
                    { title: '/workspace', size: 'Active logic code' },
                    { title: '/config', size: 'YAML DAG definitions' },
                    { title: '/logs', size: 'Real-time output stream' },
                    { title: '/artifacts', size: 'JSON performance audits' },
                    { title: '/runtime', size: 'Isolation system rules' }
                  ].map((folder) => {
                    const isSelected = selectedFolder === folder.title;
                    return (
                      <div
                        key={folder.title}
                        onClick={() => setSelectedFolder(folder.title as typeof selectedFolder)}
                        className={`group relative py-3 px-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between cursor-pointer border border-transparent ${isSelected
                            ? 'bg-[#00FFE5]/5 border-[#00FFE5]/20 text-white shadow-[0_0_15px_rgba(0,255,229,0.05)]'
                            : 'hover:bg-white/[0.02] text-gray-400'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <svg className={`w-4 h-4 transition-colors ${isSelected ? 'text-[#00FFE5]' : 'text-gray-600 group-hover:text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                          <div className="flex flex-col">
                            <div className={`font-mono text-[13px] tracking-wide ${isSelected ? 'font-bold' : ''}`}>{folder.title}</div>
                            <div className={`text-[10px] font-mono mt-0.5 transition-colors ${isSelected ? 'text-[#00FFE5]/80' : 'text-gray-600'}`}>{folder.size}</div>
                          </div>
                        </div>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#00FFE5] animate-pulse" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sandboxed Code and Explorer Widget */}
              <div className="page-panel p-6 border-white/10 bg-[#08080f]/70 font-mono flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00FFE5]" />
                      PRoot Sandbox Filesystem Viewer
                    </span>
                    <span>Active Folder: {selectedFolder}</span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {DIRECTORY_STRUCTURE[selectedFolder].description}
                  </p>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-400 mb-4">
                    <span className="text-gray-600">📄 File:</span>
                    <span className="font-bold text-[#00FFE5]">{DIRECTORY_STRUCTURE[selectedFolder].file}</span>
                  </div>

                  <div className="relative rounded-xl border border-white/5 bg-black/50 p-4 max-h-[220px] overflow-y-auto overflow-x-auto text-[11px] leading-relaxed text-gray-300">
                    <pre>{DIRECTORY_STRUCTURE[selectedFolder].content}</pre>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-gray-500 uppercase tracking-wider">
                  <span>Isolated Runtime:</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded border border-[#00FFE5]/30 bg-[#00FFE5]/5 text-[#00FFE5] font-bold">Python-3.11</span>
                    <span className="px-2 py-0.5 rounded border border-white/10 text-gray-500 font-bold">Node-20</span>
                    <span className="px-2 py-0.5 rounded border border-white/10 text-gray-500 font-bold">Rust-Soroban</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: CLI Developer DX */}
          {activeTab === 'cli' && (
            <motion.div
              key="cli"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] max-w-7xl mx-auto w-full items-center"
            >
              {/* Simulated Terminal Widget */}
              <div className="page-panel p-6 border-white/10 bg-[#040407] font-mono flex flex-col min-h-[360px] justify-between relative group overflow-hidden">
                <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[var(--color-green-strong)] opacity-[0.02] blur-[80px] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700" />
                <div className="relative z-10">
                  {/* Top terminal bar */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500/60" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                      <span className="ml-2 text-white/50 text-[10px]">forge-cli-v1.0.0-stable</span>
                    </div>
                    <span>PowerShell (Sandbox Host)</span>
                  </div>

                  {/* Terminal stdout logs */}
                  <div ref={terminalScrollRef} className="space-y-1.5 text-[11px] leading-relaxed text-gray-300 min-h-[220px] max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="text-gray-500 font-bold mb-3">C:\Users\Developer\AgentForge&gt; {cliCommand}</div>
                    {terminalLines.map((line, idx) => {
                      if (!line) return null;
                      const isError = line.includes('❌') || line.includes('Failed');
                      const isSuccess = line.includes('✔') || line.includes('succeeded') || line.includes('successfully') || line.includes('Completed');
                      return (
                        <div
                          key={idx}
                          className={`${isError ? 'text-red-400' : isSuccess ? 'text-[var(--color-green-strong)]' : 'text-gray-300'}`}
                        >
                          {line}
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="w-1.5 h-3.5 bg-white/70 animate-pulse inline-block" />
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest italic animate-pulse">Running process...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between text-[10px] text-gray-500">
                  <span>CLI Commands available. Click on the sidebar options to run.</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-green-strong)] animate-pulse" />
                </div>
              </div>

              {/* Developer Command Selector */}
              <div className="space-y-8 flex flex-col justify-center">
                <div>
                  <div className="page-kicker text-sm text-[var(--color-green-strong)] tracking-widest font-mono mb-3">Developer DX</div>
                  <h3 className="font-syne text-3xl md:text-4xl font-extrabold text-white leading-tight">
                    CLI-first agent orchestration.
                  </h3>
                  <p className="text-gray-400 text-[15px] mt-4 leading-relaxed max-w-lg">
                    Developers can manage, validate, simulate, and launch agents using the modular `forge` CLI utility. Click on the commands below to simulate execution in the terminal.
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-2 font-mono">
                  {[
                    { cmd: 'forge init', desc: 'Initialize an agent workspace template.' },
                    { cmd: 'forge run', desc: 'Compile YAML, spin up PRoot sandbox.' },
                    { cmd: 'forge deploy', desc: 'Deploy compiled agent to Soroban Ledger.' },
                    { cmd: 'forge monitor', desc: 'Stream real-time sandbox logs and PnL.' }
                  ].map((item) => {
                    const isSelected = cliCommand === item.cmd;
                    return (
                      <div
                        key={item.cmd}
                        onClick={() => {
                          if (!isTyping) setCliCommand(item.cmd as typeof cliCommand);
                        }}
                        className={`group relative py-3 px-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between cursor-pointer border border-transparent ${isTyping ? 'opacity-50 pointer-events-none' : ''} ${isSelected
                            ? 'bg-[var(--color-green-strong)]/10 border-[var(--color-green-strong)]/20 text-white shadow-[0_0_15px_rgba(46,242,142,0.05)]'
                            : 'hover:bg-white/[0.02] text-gray-400'
                          }`}
                      >
                        <div className="flex flex-col">
                          <div className={`text-[13px] font-bold tracking-wide ${isSelected ? 'text-[var(--color-green-strong)]' : ''}`}>{item.cmd}</div>
                          <div className={`text-[10px] mt-1 ${isSelected ? 'text-[var(--color-green-strong)]/80' : 'text-gray-500'}`}>{item.desc}</div>
                        </div>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-green-strong)] animate-pulse shrink-0 ml-4" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 4: Paper Trading & DEX Adapters */}
          {activeTab === 'trading' && (
            <motion.div
              key="trading"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_1.1fr] max-w-7xl mx-auto w-full items-center"
            >
              <div className="space-y-8 flex flex-col justify-center">
                <div>
                  <div className="page-kicker text-sm text-gray-400 tracking-widest font-mono mb-3">Risk Simulation Engine</div>
                  <h3 className="font-syne text-3xl md:text-4xl font-extrabold text-white leading-tight">
                    Paper trade risk-free before deploying.
                  </h3>
                  <p className="text-gray-400 text-[15px] mt-4 leading-relaxed max-w-lg">
                    Before linking capital to smart contracts, AgentForge runtimes simulate swaps on the Stellar DEX. The Paper Trading Engine manages virtual balances, tracks positions, and monitors risk autonomously.
                  </p>
                </div>

                {/* Simulated balances card */}
                <div className="relative p-6 rounded-2xl border border-white/5 bg-[#08080f] shadow-inner font-mono overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#00FFE5] opacity-[0.03] blur-[40px] pointer-events-none" />
                  <div className="relative z-10 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Simulated Balance (USDC)</span>
                      <span className="text-xl font-bold text-white">${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Simulated Balance (XLM)</span>
                      <span className="text-xl font-bold text-[#00FFE5]">{xlmBalance.toLocaleString()} XLM</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500 font-mono text-[11px] uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>Automated DEX strategies are currently active in simulation mode.</span>
                </div>
              </div>

              {/* Live paper trades list */}
              <div className="page-panel p-6 border-white/10 bg-[#08080f]/70 font-mono flex flex-col justify-between relative group overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500 opacity-[0.02] blur-[80px] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Paper Trading Ledger — Active Positions
                    </span>
                    <span className="px-2 py-0.5 rounded border border-amber-500/30 bg-amber-950/20 text-amber-400 text-[9px] uppercase tracking-wider font-bold">
                      Risk Locked
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500">
                          <th className="py-2.5">Time</th>
                          <th className="py-2.5">Type</th>
                          <th className="py-2.5">Pair</th>
                          <th className="py-2.5 text-right">Size</th>
                          <th className="py-2.5 text-right">Rate</th>
                          <th className="py-2.5 text-right text-emerald-400">PnL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paperTrades.map((trade) => (
                          <tr key={trade.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                            <td className="py-2.5 text-gray-500">{trade.time}</td>
                            <td className="py-2.5 font-bold">
                              <span className={trade.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>
                                {trade.type}
                              </span>
                            </td>
                            <td className="py-2.5 text-gray-300">{trade.pair}</td>
                            <td className="py-2.5 text-right text-gray-300">{trade.size}</td>
                            <td className="py-2.5 text-right text-gray-300">${trade.entry}</td>
                            <td className="py-2.5 text-right text-emerald-400 font-bold">{trade.pnl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">
                  <span>Stellar DEX adapters loaded:</span>
                  <div className="flex gap-2">
                    <span className="text-[#00FFE5] font-bold">Soroswap</span>
                    <span>•</span>
                    <span className="text-amber-500 font-bold">Aquarius</span>
                    <span>•</span>
                    <span className="text-purple-400 font-bold">Phoenix</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">Blend</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      {/* ── ABOUT AGENTFORGE VIDEO SECTION ────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 xl:px-20 w-full bg-[#050508] relative border-t border-white/5">
        <div className="max-w-[1600px] mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,255,229,0.03)_0%,transparent_60%)] blur-[80px] pointer-events-none" />
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="font-syne text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              About AgentForge
            </h2>
          <p className="text-[#8b8b93] text-[14px] md:text-[15px] max-w-2xl mx-auto">
            Discover how we are reshaping the future of decentralized AI execution with sandboxed environments and Stellar-native settlement.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8 relative z-10">
          {/* Top Row: Video + 2 Side Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2 rounded-[1rem] overflow-hidden border border-white/5 shadow-xl bg-[#050508] relative aspect-video self-start group">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/3Vh_In2wXic?si=O71bpCFLjf8YSCbE" 
                title="AgentForge Introduction" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>

            {/* Side Cards */}
            <div className="flex flex-col gap-5">
              <div className="p-6 border border-white/5 bg-[#0b0b11]/60 rounded-[1rem] hover:bg-white/[0.02] transition-colors flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded bg-[rgba(0,255,229,0.06)] flex items-center justify-center border border-[#00FFE5]/10 shrink-0">
                    <svg className="w-4 h-4 text-[#00FFE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-white text-[15px] font-medium tracking-wide">Decentralized Orchestration</h3>
                </div>
                <p className="text-[#8b8b93] text-[13px] leading-[1.6]">
                  Design workflows that integrate multiple specialized agents. Pass context seamlessly across execution layers with absolute determinism.
                </p>
              </div>

              <div className="p-6 border border-white/5 bg-[#0b0b11]/60 rounded-[1rem] hover:bg-white/[0.02] transition-colors flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded bg-[rgba(0,255,229,0.06)] flex items-center justify-center border border-[#00FFE5]/10 shrink-0">
                    <svg className="w-4 h-4 text-[#00FFE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-[15px] font-medium tracking-wide">Stellar-Native Settlement</h3>
                </div>
                <p className="text-[#8b8b93] text-[13px] leading-[1.6]">
                  Every agent gets a programmable wallet. Settle execution fees, invoke smart contracts, and stream payments instantly via the Stellar network.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row: 3 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="p-6 border border-white/5 bg-[#0b0b11]/60 rounded-[1rem] hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded bg-[rgba(0,255,229,0.06)] flex items-center justify-center border border-[#00FFE5]/10 shrink-0">
                  <svg className="w-4 h-4 text-[#00FFE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-white text-[15px] font-medium tracking-wide">Strict PRoot Sandboxing</h3>
              </div>
              <p className="text-[#8b8b93] text-[13px] leading-[1.6]">
                Run untrusted code securely. Our PRoot sandboxes provide strict filesystem isolation and precise resource bounding for every workflow.
              </p>
            </div>

            <div className="p-6 border border-white/5 bg-[#0b0b11]/60 rounded-[1rem] hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded bg-[rgba(0,255,229,0.06)] flex items-center justify-center border border-[#00FFE5]/10 shrink-0">
                  <svg className="w-4 h-4 text-[#00FFE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-white text-[15px] font-medium tracking-wide">Immutable Audit Trails</h3>
              </div>
              <p className="text-[#8b8b93] text-[13px] leading-[1.6]">
                Track execution hashes in real-time. Every decision and API call is cryptographically signed and anchored to the ledger.
              </p>
            </div>

            <div className="p-6 border border-white/5 bg-[#0b0b11]/60 rounded-[1rem] hover:bg-white/[0.02] transition-colors sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded bg-[rgba(0,255,229,0.06)] flex items-center justify-center border border-[#00FFE5]/10 shrink-0">
                  <svg className="w-4 h-4 text-[#00FFE5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white text-[15px] font-medium tracking-wide">Token-Based Billing</h3>
              </div>
              <p className="text-[#8b8b93] text-[13px] leading-[1.6]">
                Monetize your agentic workflows effortlessly. Setup custom pricing tiers and automated billing cycles powered by Soroban smart contracts.
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── CRYPTOGRAPHIC AUDIT AND VERIFIER SECTION ───────────────────────── */}
      <section className="py-32 w-full relative overflow-hidden flex flex-col justify-center min-h-[700px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-[length:100%_100%] bg-center bg-no-repeat opacity-80 blur-[8px] pointer-events-none"
          style={{ backgroundImage: 'url("/bg1.2.png")' }}
        />
        
        {/* Strong gradient fades at the edges to blend seamlessly into the site background */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#050508] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />

        <div className="px-6 lg:px-12 xl:px-20 w-full max-w-[1500px] mx-auto relative z-10">
          <div className="grid gap-12 xl:gap-20 lg:grid-cols-2 items-center">

          <div className="space-y-8">
            <div>
              <div className="inline-block px-3 py-1 mb-4 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono tracking-widest text-[#00D0B6] uppercase">
                Zero-Trust Audit Framework
              </div>
              <h2 className="font-syne text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
                Cryptographically verified decision trails.
              </h2>
              <p className="mt-5 text-[#8b8b93] text-[14px] md:text-[15px] leading-[1.6] max-w-lg">
                Every workflow compilation, container initialization, transaction invocation, and paper trade logs a secure cryptographic fingerprint. These fingerprints are signed by the <strong className="text-white font-medium">Agent Validator</strong> contract on Stellar to construct a tamper-proof auditing log.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 border border-white/5 bg-[#0b0b11]/60 rounded-[1rem] hover:bg-white/[0.02] transition-colors flex flex-col justify-center group">
                <div className="w-10 h-10 rounded-lg bg-[rgba(0,208,182,0.06)] flex items-center justify-center border border-[#00D0B6]/10 shrink-0 mb-4 group-hover:bg-[rgba(0,208,182,0.1)] transition-colors">
                  <svg className="w-5 h-5 text-[#00D0B6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium text-[15px] mb-2">PRoot Container Seal</h4>
                <p className="text-[#8b8b93] text-[13px] leading-[1.6]">Runtimes generate verification hashes upon spinup to seal container filesystem authenticity.</p>
              </div>
              <div className="p-6 border border-white/5 bg-[#0b0b11]/60 rounded-[1rem] hover:bg-white/[0.02] transition-colors flex flex-col justify-center group">
                <div className="w-10 h-10 rounded-lg bg-[rgba(0,208,182,0.06)] flex items-center justify-center border border-[#00D0B6]/10 shrink-0 mb-4 group-hover:bg-[rgba(0,208,182,0.1)] transition-colors">
                  <svg className="w-5 h-5 text-[#00D0B6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h4 className="text-white font-medium text-[15px] mb-2">DAG Compilation Hash</h4>
                <p className="text-[#8b8b93] text-[13px] leading-[1.6]">Workflow files compile into an immutable execution graph to prevent dynamic pipeline hijacking.</p>
              </div>
            </div>
          </div>

          {/* Hashing Terminal Visual Widget */}
          <div className="rounded-[1.25rem] border border-white/5 bg-[#050508] shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 relative z-10 bg-[#08080c]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00D0B6] animate-pulse shadow-[0_0_8px_rgba(0,208,182,0.8)]" />
                <span className="text-[11px] font-mono text-gray-400 tracking-widest uppercase">Audit Proof Generator</span>
              </div>
              <span className="px-3 py-1 rounded-md bg-[#00D0B6]/10 border border-[#00D0B6]/20 text-[10px] text-[#00D0B6] font-mono tracking-widest font-bold">
                SECURE SHA-256
              </span>
            </div>

            {/* List */}
            <div className="p-6 relative z-10 flex flex-col gap-5">
              {[
                { label: 'EXECUTION HASH', value: auditHashes.execution, desc: 'Logs isolated sandboxed inputs/outputs' },
                { label: 'RUNTIME HASH', value: auditHashes.runtime, desc: 'Calculates PRoot filesystem integrity check' },
                { label: 'WORKFLOW HASH', value: auditHashes.workflow, desc: 'Seals YAML dependency DAG integrity' },
                { label: 'AGENT HASH', value: auditHashes.agent, desc: 'Identifies registry contract profile' }
              ].map((hash) => (
                <div key={hash.label} className="relative group">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-1 xl:gap-4 mb-2">
                    <span className="font-mono text-[12px] font-bold text-white tracking-wider">{hash.label}</span>
                    <span className="font-sans text-[12px] text-[#8b8b93]">{hash.desc}</span>
                  </div>
                  <div className="font-mono text-[12px] md:text-[13px] text-[#00D0B6] truncate tracking-widest bg-white/[0.02] p-3 rounded-lg border border-white/5 group-hover:bg-[#00D0B6]/5 group-hover:border-[#00D0B6]/20 transition-colors cursor-default">
                    {hash.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-white/5 bg-[#08080c] relative z-10 flex items-start gap-4">
              <div className="w-8 h-8 rounded bg-[rgba(0,208,182,0.06)] flex items-center justify-center border border-[#00D0B6]/10 shrink-0 mt-1">
                <svg className="w-4 h-4 text-[#00D0B6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-white text-[14px] font-medium tracking-wide mb-1.5">Verifiable On-Chain Checksums</h4>
                <p className="text-[#8b8b93] text-[12px] leading-relaxed">
                  Cryptographic verification audit matches local outputs against the deployed <code className="font-mono text-[11px] text-[#00D0B6] bg-[#00D0B6]/10 px-1.5 py-0.5 rounded ml-0.5">AgentValidator</code> contract on Stellar mainnet.
                </p>
              </div>
            </div>
          </div>

        </div>
        </div>
      </section>

      {/* ── SYSTEM ARCHITECTURE HEADLINE ──────────────────────────────────────── */}
      <section className="w-full bg-[#050508] pt-32 pb-16 relative overflow-hidden flex flex-col items-center justify-center z-50 shadow-[0_-20px_50px_rgba(5,5,8,1)]">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--color-green-strong)]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <h2 className="font-syne text-5xl md:text-7xl lg:text-[5rem] font-black text-white text-center leading-[1.1] tracking-tight drop-shadow-2xl z-10">
          System Architecture
        </h2>
        <p className="text-[#8b8b93] text-[15px] md:text-lg max-w-2xl text-center mt-6 z-10 px-4">
          Explore the internal pipeline diagrams and architectural blueprints of the AgentForge engine.
        </p>
      </section>

      {/* ── PIPELINE DIAGRAMS SHOWCASE ────────────────────────────────────────── */}
      <WorkflowShowcaseSection />

      {/* ── CLI PREVIEW HEADLINE ────────────────────────────────────────────── */}
      <section className="w-full bg-[#050508] pt-32 pb-16 relative overflow-hidden flex flex-col items-center justify-center border-t border-white/5 z-50 shadow-[0_-20px_50px_rgba(5,5,8,1)]">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--color-green-strong)]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-6 rounded-full border border-[var(--color-green-strong)]/30 bg-[var(--color-green-strong)]/10 text-[11px] font-mono tracking-widest text-[var(--color-green-strong)] uppercase">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Developer Experience
          </div>
          <h2 className="font-syne text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Command Line Interface.
          </h2>
          <p className="text-[#8b8b93] text-[15px] leading-[1.6] max-w-2xl mx-auto">
            Experience complete control over your sandboxed agents, smart wallets, and decentralized pipelines directly from the terminal. The AgentForge CLI provides raw access to the protocol's core capabilities.
          </p>
        </div>
      </section>

      {/* ── CLI SHOWCASE SECTION ────────────────────────────────────────────── */}
      <CliShowcaseSection />

      {/* ── VIDEO SHOWCASE SECTION ──────────────────────────────────────────── */}
      <VideoShowcaseSection />

      {/* ── FOOTER CORE VISION BANNER ────────────────────────────────────────── */}
      <section className="py-32 px-4 w-full text-center relative overflow-hidden flex flex-col justify-center min-h-[500px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 pointer-events-none"
          style={{ backgroundImage: 'url("/bg1.1.png")' }}
        />
        
        {/* Strong gradient fades at the edges to blend seamlessly into the site background */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#050508] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#00D0B6] mb-6">
            Core System Architecture
          </div>
          <h2 className="font-syne text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Designed for modularity.<br />
            Evolving for decentralization.
          </h2>
          <p className="text-[#8b8b93] text-sm md:text-[15px] leading-relaxed max-w-3xl mx-auto mb-10">
            AgentForge starts centralized for rapid iteration, but its components are completely modular.<br className="hidden md:block"/> Future upgrades will support remote runners, zero-knowledge proofs of execution,<br className="hidden md:block"/> decentralized nodes, staking, and SLA slashing policies.
          </p>
          <div className="flex items-center justify-center">
            <Link href="/docs" className="bg-[#0b0b11]/80 hover:bg-[#00D0B6]/10 border border-white/10 hover:border-[#00D0B6]/40 backdrop-blur-md transition-all text-[11px] px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-white hover:text-[#00D0B6]">
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
