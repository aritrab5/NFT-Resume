"use client";

import { useState, useCallback } from "react";
import {
  mintResume,
  getResume,
  ownerOf,
  transferResume,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

function TextArea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <textarea
          {...props}
          rows={3}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none resize-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "view" | "mint" | "transfer";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

interface ResumeData {
  name: string;
  skills: string;
  experience: string;
  portfolio: string;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Mint form state
  const [mintName, setMintName] = useState("");
  const [mintSkills, setMintSkills] = useState("");
  const [mintExperience, setMintExperience] = useState("");
  const [mintPortfolio, setMintPortfolio] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  // View/Transfer form state
  const [viewId, setViewId] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeOwner, setResumeOwner] = useState<string | null>(null);

  // Transfer form state
  const [transferId, setTransferId] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const truncate = (addr: string) => addr.length > 0 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const handleMint = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!mintName.trim() || !mintSkills.trim()) return setError("Name and skills are required");
    setError(null);
    setIsMinting(true);
    setTxStatus("Minting NFT Resume...");
    try {
      const id = await mintResume(
        walletAddress,
        mintName.trim(),
        mintSkills.trim(),
        mintExperience.trim(),
        mintPortfolio.trim()
      );
      setTxStatus(`Resume minted! ID: ${id}`);
      setMintName("");
      setMintSkills("");
      setMintExperience("");
      setMintPortfolio("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsMinting(false);
    }
  }, [walletAddress, mintName, mintSkills, mintExperience, mintPortfolio]);

  const handleViewResume = useCallback(async () => {
    const idNum = parseInt(viewId.trim(), 10);
    if (!viewId.trim() || isNaN(idNum)) return setError("Enter a valid resume ID");
    setError(null);
    setIsViewing(true);
    setResumeData(null);
    setResumeOwner(null);
    try {
      const [data, owner] = await Promise.all([
        getResume(idNum),
        ownerOf(idNum),
      ]);
      if (data) {
        setResumeData(data as ResumeData);
        setResumeOwner(owner as string | null);
      } else {
        setError("Resume not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [viewId]);

  const handleTransfer = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    const idNum = parseInt(transferId.trim(), 10);
    if (!transferId.trim() || isNaN(idNum) || !transferTo.trim()) return setError("Enter valid ID and recipient");
    setError(null);
    setIsTransferring(true);
    setTxStatus("Transferring ownership...");
    try {
      await transferResume(walletAddress, transferTo.trim(), idNum);
      setTxStatus("Resume transferred!");
      setTransferId("");
      setTransferTo("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsTransferring(false);
    }
  }, [walletAddress, transferId, transferTo]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "view", label: "View", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "mint", label: "Create", icon: <BriefcaseIcon />, color: "#7c6cf0" },
    { key: "transfer", label: "Transfer", icon: <TransferIcon />, color: "#fbbf24" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("minted") || txStatus.includes("transferred") || txStatus.includes("created") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c6cf0]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">NFT Resume</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setResumeData(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* View Resume */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <MethodSignature name="get_resume" params="(id: u64)" returns="-> Option<Resume>" color="#4fc3f7" />
                <Input label="Resume ID" value={viewId} onChange={(e) => setViewId(e.target.value)} placeholder="e.g. 1" type="number" />
                <ShimmerButton onClick={handleViewResume} disabled={isViewing} shimmerColor="#4fc3f7" className="w-full">
                  {isViewing ? <><SpinnerIcon /> Loading...</> : <><SearchIcon /> View Resume</>}
                </ShimmerButton>

                {resumeData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Resume Details</span>
                      {resumeOwner && (
                        <Badge variant="success">
                          <UserIcon />
                          Owner
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Resume ID</span>
                        <span className="font-mono text-sm text-white/80">{viewId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Name</span>
                        <span className="font-mono text-sm text-white/80">{resumeData.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Skills</span>
                        <span className="font-mono text-sm text-white/80">{resumeData.skills}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-white/35">Experience</span>
                        <span className="font-mono text-sm text-white/80 whitespace-pre-wrap">{resumeData.experience}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-white/35">Portfolio</span>
                        <span className="font-mono text-sm text-[#4fc3f7]/80 whitespace-pre-wrap">{resumeData.portfolio}</span>
                      </div>
                      {resumeOwner && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                          <span className="text-xs text-white/35">Owner</span>
                          <span className="font-mono text-sm text-white/60">{truncate(resumeOwner)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mint Resume */}
            {activeTab === "mint" && (
              <div className="space-y-5">
                <MethodSignature name="mint" params="(user: Address, resume: Resume)" color="#7c6cf0" />
                <Input label="Full Name" value={mintName} onChange={(e) => setMintName(e.target.value)} placeholder="e.g. John Doe" />
                <Input label="Skills" value={mintSkills} onChange={(e) => setMintSkills(e.target.value)} placeholder="e.g. Rust, React, TypeScript" />
                <TextArea label="Experience" value={mintExperience} onChange={(e) => setMintExperience(e.target.value)} placeholder="e.g. Senior Developer at Tech Corp (2020-2024)..." />
                <Input label="Portfolio URL" value={mintPortfolio} onChange={(e) => setMintPortfolio(e.target.value)} placeholder="e.g. https://myportfolio.com" />

                {walletAddress ? (
                  <ShimmerButton onClick={handleMint} disabled={isMinting} shimmerColor="#7c6cf0" className="w-full">
                    {isMinting ? <><SpinnerIcon /> Minting...</> : <><BriefcaseIcon /> Create NFT Resume</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to create resume
                  </button>
                )}
              </div>
            )}

            {/* Transfer */}
            {activeTab === "transfer" && (
              <div className="space-y-5">
                <MethodSignature name="transfer" params="(from: Address, to: Address, id: u64)" color="#fbbf24" />
                <Input label="Resume ID" value={transferId} onChange={(e) => setTransferId(e.target.value)} placeholder="e.g. 1" type="number" />
                <Input label="Recipient Address" value={transferTo} onChange={(e) => setTransferTo(e.target.value)} placeholder="e.g. G... (recipient wallet)" />

                {walletAddress ? (
                  <ShimmerButton onClick={handleTransfer} disabled={isTransferring} shimmerColor="#fbbf24" className="w-full">
                    {isTransferring ? <><SpinnerIcon /> Transferring...</> : <><TransferIcon /> Transfer Ownership</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to transfer ownership
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">NFT Resume &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/20">Powered by</span>
              <span className="font-mono text-[9px] text-white/40">Stellar</span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}