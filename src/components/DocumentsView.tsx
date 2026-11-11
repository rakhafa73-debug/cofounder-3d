import React, { useState } from 'react';
import { FileText, Download, Copy, Check, Eye, Clock, ShieldCheck, User } from 'lucide-react';
import { DocumentItem, AIAgent } from '../types';
import { playSound } from '../three/audio';

interface DocumentsViewProps {
  documents: DocumentItem[];
  agents: Record<string, AIAgent>;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  agents,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(documents[0] || null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(selectedDoc.content);
    setCopied(true);
    playSound.click();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedDoc) return;
    const blob = new Blob([selectedDoc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc.title.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    playSound.success();
  };

  return (
    <div className="flex h-full bg-[#080B14] overflow-hidden">
      {/* Left Documents List */}
      <div className="w-80 bg-[#0A0E1A] border-r border-white/10 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Deliverables Vault</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Executive blueprints & signed specs ({documents.length})
          </p>
        </div>

        <div className="p-2 space-y-1.5 overflow-y-auto flex-1 scrollbar-none">
          {documents.map((doc) => {
            const active = selectedDoc?.id === doc.id;
            const author = agents[doc.authorAgentId];
            return (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  playSound.click();
                }}
                className={`w-full p-3.5 rounded-xl text-left transition space-y-2 border ${
                  active
                    ? 'bg-blue-600/15 border-cyan-500/40 text-white shadow-sm'
                    : 'bg-slate-900/40 hover:bg-slate-800/60 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {doc.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {doc.version}
                  </span>
                </div>

                <h4 className="text-xs font-bold line-clamp-2">
                  {doc.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span className="uppercase text-slate-400 font-mono">
                    By {author ? author.name : doc.authorAgentId}
                  </span>
                  <span>{doc.wordCount} words</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Document Preview */}
      <div className="flex-1 flex flex-col h-full bg-[#070A14] overflow-hidden">
        {selectedDoc ? (
          <>
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center space-x-2 text-[10px] uppercase font-mono text-cyan-400">
                  <span>Version {selectedDoc.version}</span>
                  <span>·</span>
                  <span>Author: {agents[selectedDoc.authorAgentId]?.name || selectedDoc.authorAgentId}</span>
                  <span>·</span>
                  <span>Updated: {selectedDoc.lastUpdated}</span>
                </div>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedDoc.title}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 flex items-center space-x-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .MD</span>
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 p-8 overflow-y-auto max-w-4xl">
              <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedDoc.content}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            Select a deliverable on the left to inspect
          </div>
        )}
      </div>
    </div>
  );
};
