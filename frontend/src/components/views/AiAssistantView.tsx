import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, User, Sparkles, ArrowRight } from 'lucide-react';
import { queryAIAssistant } from '../../services/api';
import { ActiveTab } from '../layout/SidebarNav';

interface Message {
  sender: 'USER' | 'AI';
  text: string;
  citations?: string[];
  suggestedActions?: string[];
}

interface AiAssistantViewProps {
  onNavigate?: (tab: ActiveTab, extra?: { buildingId?: string; cameraPreset?: string; gpsPin?: boolean; enter?: boolean }) => void;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} className="text-[#9fe0d2] font-bold">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

const NAV_CHIPS = new Set([
  'Open Wastage Detector',
  'Open Energy view',
  'Open Solar PV view',
  'Open What-If Studio',
  'Open Assets inventory',
  'Open Water view',
  'Open Occupancy view',
  'Open Executive Report',
  'Open Command Center',
  'Show Net-Zero timeline',
  'View Optimization',
  'Fly to CIET Tower',
  'Fly to Substation',
  'Fly to selected building',
  'Show Marri Nilayam on 3D Twin',
  'Drop GPS pin at hostel',
  'Enter building floors',
  'Apply Net-Zero blueprint',
  'Acknowledge TR-02 alert',
  'Run What-If: leak remediation',
  'Run Solar Expansion preset',
]);

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'AI',
      text:
        'Hello — I am the **MLRIT Campus Intelligence Copilot**.\n\n' +
        'I read the Dundigal digital twin: energy, water, HVAC, solar, occupancy, and asset health. ' +
        'Ask a facilities question or tap a chip below.',
      citations: [
        'MLRIT Digital Twin telemetry bus (live simulation)',
        'Campus energy & water physics model',
      ],
      suggestedActions: [
        'Which building wastes the most electricity?',
        'Why is the CSE CIET Tower consuming so much power?',
        'Which assets require maintenance?',
        'How much electricity could we save by reducing HVAC usage by 15%?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const routeChip = (act: string) => {
    if (!onNavigate) return false;
    if (act === 'Open Wastage Detector') { onNavigate('WASTAGE'); return true; }
    if (act === 'Open Energy view') { onNavigate('ENERGY'); return true; }
    if (act === 'Open Solar PV view') { onNavigate('SOLAR'); return true; }
    if (act === 'Open What-If Studio' || act === 'Apply Net-Zero blueprint' || act.includes('What-If') || act.includes('Solar Expansion')) {
      onNavigate('WHAT_IF'); return true;
    }
    if (act === 'Open Assets inventory' || act === 'Acknowledge TR-02 alert') { onNavigate('ASSETS'); return true; }
    if (act === 'Open Water view') { onNavigate('WATER'); return true; }
    if (act === 'Open Occupancy view') { onNavigate('OCCUPANCY'); return true; }
    if (act === 'Open Executive Report') { onNavigate('REPORT'); return true; }
    if (act === 'Open Command Center') { onNavigate('OVERVIEW'); return true; }
    if (act === 'Show Net-Zero timeline') { onNavigate('TIMELINE'); return true; }
    if (act === 'View Optimization') { onNavigate('OPTIMIZATION'); return true; }
    if (act === 'Fly to CIET Tower') { onNavigate('3D_TWIN', { buildingId: 'ciet', cameraPreset: 'CIET' }); return true; }
    if (act === 'Fly to Substation') { onNavigate('3D_TWIN', { buildingId: 'sub' }); return true; }
    if (act === 'Fly to selected building') { onNavigate('3D_TWIN'); return true; }
    if (act === 'Show Marri Nilayam on 3D Twin' || act === 'Drop GPS pin at hostel') {
      onNavigate('3D_TWIN', { buildingId: 'hostelb', gpsPin: act.includes('GPS') }); return true;
    }
    if (act === 'Enter building floors') { onNavigate('3D_TWIN', { enter: true }); return true; }
    return false;
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText ?? input).trim();
    if (!q || loading) return;

    if (queryText && NAV_CHIPS.has(queryText) && routeChip(queryText)) return;

    setMessages(prev => [...prev, { sender: 'USER', text: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await queryAIAssistant(q);
      setMessages(prev => [...prev, {
        sender: 'AI',
        text: res.answer || 'I could not compose an answer. Try another campus question.',
        citations: res.citations,
        suggestedActions: res.suggested_actions,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        sender: 'AI',
        text: 'Telemetry query failed. Retry — the copilot still has a local campus model.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col select-text">
      <div className="p-4 rounded-2xl glass-panel-glow mb-4 shrink-0">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-[#7dd3c0]" />
          <span className="text-xs font-mono font-bold text-[#7dd3c0] uppercase tracking-widest">
            MLRIT Copilot · grounded in the digital twin
          </span>
        </div>
        <p className="text-xs text-[var(--muted)] font-mono mt-1">
          Energy · water · HVAC · solar · assets · ROI. Chips in teal navigate; others ask a question.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-sans text-sm min-h-0">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex space-x-3 ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'AI' && (
              <div className="w-8 h-8 rounded-lg bg-[#5eb8a8]/20 border border-[#5eb8a8]/40 flex items-center justify-center text-[#7dd3c0] shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl p-4 rounded-2xl leading-relaxed ${
                m.sender === 'USER'
                  ? 'bg-[#2a8f7f] text-white font-medium rounded-tr-none'
                  : 'glass-panel text-[#e8eef2] rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line"><RichText text={m.text} /></div>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-[var(--muted)] space-y-0.5 font-mono">
                  <div className="text-[#7dd3c0] font-bold uppercase">Sources</div>
                  {m.citations.map((c, cIdx) => <div key={cIdx}>{c}</div>)}
                </div>
              )}

              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                  {m.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(act)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-[#5eb8a8]/10 hover:bg-[#5eb8a8]/20 text-[#7dd3c0] border border-[#5eb8a8]/30 transition-colors flex items-center gap-1"
                    >
                      <span>{act}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'USER' && (
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-[#c5d4dc] shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex space-x-3 items-center text-[var(--muted)] font-mono text-xs">
            <div className="w-8 h-8 rounded-lg bg-[#5eb8a8]/20 border border-[#5eb8a8]/40 flex items-center justify-center text-[#7dd3c0] animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Reading campus telemetry…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center space-x-2 bg-black/30 border border-[#5eb8a8]/30 rounded-xl p-2 focus-within:border-[#7dd3c0] mt-3 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask about MLRIT energy, water, HVAC, solar, leaks, TR-02…"
          className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none px-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 rounded-lg bg-[#2a8f7f] hover:brightness-110 text-white font-bold transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
