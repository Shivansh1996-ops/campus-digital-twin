import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Zap, Droplets, Sun, Users, CheckCircle2, Plus, Minus
} from 'lucide-react';

interface LandingPageProps {
  onEnterTwin: () => void;
  onEnterSatellite: () => void;
}

const FAQS: [string, string][] = [
  ['Is this a real-time SCADA feed?', 'When a backend is attached, yes. On the public demo it runs a sealed Dundigal simulation with the same buildings, loads, and alerts.'],
  ['Does it replace existing campus systems?', 'No. It sits above them — a model of energy, water, space, and assets your team already operates.'],
  ['Who is it for?', 'Principals, facilities, and student juries who need the campus readable in one glance.'],
];

const FLOW = [
  {
    id: 'sources',
    tab: 'Compare sources',
    title: 'Campus sources · live',
    note: 'Grid, rooftop PV, and hostel meters stay visible even when they disagree.',
    rows: [
      ['TSSPDCL 33 kV', 'Feeder draw', '2,858 kW', 'Agrees'],
      ['Rooftop PV', 'Inverters 1–48', '1,416 kW', 'Agrees'],
      ['Marri Nilayam', 'Overnight flow', '138 LPM', 'Differs'],
    ],
  },
  {
    id: 'rule',
    tab: 'Apply the rule',
    title: 'Policy for this campus',
    note: 'Configured rules decide whether an item can proceed. Models only propose.',
    rows: [
      ['Source priority', 'Prefer metered feeder over estimates', 'On', 'Rule'],
      ['Leak threshold', 'Flag hostel flow above 80 LPM overnight', 'On', 'Rule'],
      ['Thermal review', 'TR-02 above 105 °C needs sign-off', 'On', 'Rule'],
    ],
  },
  {
    id: 'review',
    tab: 'Review and approve',
    title: 'Approval · TR-02',
    note: 'Preparer and reviewer stay separate. Source records never change.',
    rows: [
      ['Working value', 'Transformer oil 118 °C', 'Review', 'Open'],
      ['Preparer', 'Facilities · simulated', 'Ready', 'Sealed'],
      ['Approver', 'Waiting for campus engineer', 'Hold', 'Required'],
    ],
  },
  {
    id: 'lineage',
    tab: 'Trace lineage',
    title: 'Lineage · CIET 610 kW',
    note: 'Every figure opens to a building, feeder, or array — with a provenance label.',
    rows: [
      ['CIET Tower', 'Block load, simulated hour 14.5', '610 kW', 'Building'],
      ['Rooftop string C-12', 'Inverter yield', '94 kW', 'Array'],
      ['Feeder TR-02', 'Thermal probe', '118 °C', 'Asset'],
    ],
  },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = el.closest('.df-page') as HTMLElement | null;
    const check = () => {
      const r = el.getBoundingClientRect();
      const b = root?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight };
      if (r.top < b.bottom - 80 && r.bottom > b.top + 40) setOn(true);
    };
    check();
    root?.addEventListener('scroll', check, { passive: true });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setOn(true);
      },
      { root, threshold: 0 }
    );
    io.observe(el);
    return () => {
      root?.removeEventListener('scroll', check);
      io.disconnect();
    };
  }, []);
  return { ref, on };
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterTwin, onEnterSatellite }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [flow, setFlow] = useState(0);
  const [heroOn, setHeroOn] = useState(false);
  const workflows = useReveal<HTMLElement>();
  const shot = useReveal<HTMLElement>();
  const check = useReveal<HTMLElement>();
  const run = useReveal<HTMLElement>();
  const faq = useReveal<HTMLElement>();
  const cta = useReveal<HTMLElement>();

  useEffect(() => {
    const t = window.setTimeout(() => setHeroOn(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFlow((i) => (i + 1) % FLOW.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const step = FLOW[flow];

  return (
    <div className="df-page">
      <header className="df-nav">
        <button type="button" className="df-brand" onClick={() => document.querySelector('.df-page')?.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="df-mark">MLR</span>
          MLRIT Twin
        </button>
        <nav className="df-links">
          {[
            ['campus', 'Campus'],
            ['workflows', 'Twin'],
            ['flow', 'Flow'],
            ['faq', 'FAQ'],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <button type="button" onClick={onEnterTwin} className="df-btn-dark">
          Enter twin
        </button>
      </header>

      <section className={`df-hero ${heroOn ? 'is-in' : ''}`}>
        <div className="df-hero-copy">
          <p className="df-eyebrow df-d1">Marri Laxman Reddy Institute of Technology · Dundigal</p>
          <h1 className="df-d2">
            Turn campus operations
            <br />
            from scattered to strategic.
          </h1>
          <p className="df-sub df-d3">
            The twin handles the plumbing — power, water, solar, occupancy.
            Your faculty does the analysis.
          </p>
          <div className="df-hero-actions df-d4">
            <button type="button" onClick={onEnterTwin} className="df-btn-dark df-btn-lg">
              Enter the 3D twin
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="df-btn-light df-btn-lg"
            >
              See the flow
            </button>
            <button type="button" onClick={onEnterSatellite} className="df-btn-ghost">
              Satellite GIS
            </button>
          </div>
        </div>

        <div className="df-hero-stage df-d5" aria-hidden>
          <div className="df-float-row">
            <div className="df-chip df-float a">
              <span className="df-chip-dot" />
              TSSPDCL
              <em>grid</em>
            </div>
            <div className="df-chip df-float b">
              <span className="df-chip-dot g" />
              Rooftop PV
              <em>inverters</em>
            </div>
            <div className="df-chip df-float c">
              <span className="df-chip-dot b2" />
              Occupancy
              <em>heads</em>
            </div>
          </div>
          <svg className="df-wires" viewBox="0 0 420 56" fill="none">
            <path d="M70 8 C70 36, 210 8, 210 52" />
            <path d="M210 8 C210 36, 210 8, 210 52" />
            <path d="M350 8 C350 36, 210 8, 210 52" />
          </svg>
          <div className="df-card df-card-lg df-float-slow">
            <div className="df-card-head">
              <span className="df-mark df-mark-sm">MLR</span>
              <span>Campus ontology</span>
              <span className="df-pill">One source of truth</span>
            </div>
            <div className="df-card-grid">
              <div>
                <div className="df-k">CIET Tower</div>
                <div className="df-v">610 kW</div>
                <div className="df-ok">Live</div>
              </div>
              <div>
                <div className="df-k">Rooftop solar</div>
                <div className="df-v">1,420 kW</div>
                <div className="df-ok">Covers 50%</div>
              </div>
              <div>
                <div className="df-k">Marri Nilayam</div>
                <div className="df-v">138 LPM</div>
                <div className="df-warn">Leak</div>
              </div>
              <div>
                <div className="df-k">TR-02</div>
                <div className="df-v">118 °C</div>
                <div className="df-warn">Review</div>
              </div>
            </div>
            <div className="df-card-foot">
              <span>Working health</span>
              <strong>82 / 100 · B+</strong>
              <span>Approval for circulation</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`df-shot reveal ${shot.on ? 'is-in' : ''}`}
        id="campus"
        ref={shot.ref}
      >
        <div className="df-shot-frame">
          <div className="df-shot-bar">
            <span /><span /><span />
            <em>mlrit.dundigal · twin</em>
          </div>
          <img src="/assets/satellite_mlrit.jpg" alt="MLRIT Dundigal campus satellite" />
        </div>
      </section>

      <section
        className={`df-workflows reveal ${workflows.on ? 'is-in' : ''}`}
        id="workflows"
        ref={workflows.ref}
      >
        <div className="df-section-head">
          <h2>One model behind every campus workflow</h2>
          <p>
            Most institutes run facilities across spreadsheets that hide context from each other.
            The twin maps those systems into one connected model — for people, dashboards, and the copilot.
          </p>
        </div>

        <div className="df-pin">
          {[
            {
              n: '01',
              icon: Zap,
              t: 'Energy & grid',
              d: 'Split TSSPDCL draw, rooftop PV, and BESS. Heatmap the blocks that actually pull load.',
              card: (
                <div className="df-mini">
                  <div className="df-mini-k">Campus load · 14:30</div>
                  <div className="df-mini-v">2,858 kW</div>
                  <ul>
                    <li><span>CIET</span><b>610</b><em className="ok">Live</em></li>
                    <li><span>Aero</span><b>231</b><em className="ok">Live</em></li>
                    <li><span>Admin</span><b>186</b><em className="ok">Live</em></li>
                  </ul>
                </div>
              ),
            },
            {
              n: '02',
              icon: Droplets,
              t: 'Water & leaks',
              d: 'Keep overnight hostel flow explicit until plumbing evidence lands — not buried in a logbook.',
              card: (
                <div className="df-mini">
                  <div className="df-mini-k">Marri Nilayam · leak</div>
                  <div className="df-mini-v">138 LPM</div>
                  <ul>
                    <li><span>Baseline</span><b>42</b><em className="ok">Night</em></li>
                    <li><span>Observed</span><b>138</b><em className="warn">Break</em></li>
                    <li><span>Delta</span><b>+96</b><em className="warn">Open</em></li>
                  </ul>
                </div>
              ),
            },
            {
              n: '03',
              icon: Sun,
              t: 'Solar & ROI',
              d: 'Trace generation back to roof arrays. Run LED, HVAC, and 6 MWp scenarios with payback.',
              card: (
                <div className="df-mini">
                  <div className="df-mini-k">Rooftop PV · now</div>
                  <div className="df-mini-v">1,416 kW</div>
                  <ul>
                    <li><span>Coverage</span><b>50%</b><em className="ok">Yield</em></li>
                    <li><span>Avoided</span><b>₹0.7L</b><em className="ok">Hour</em></li>
                    <li><span>6 MWp case</span><b>4.1 y</b><em>Payback</em></li>
                  </ul>
                </div>
              ),
            },
            {
              n: '04',
              icon: Users,
              t: 'Occupancy & space',
              d: 'CIET at 1,050 heads, auditorium at zero — idle AV still drawing 38.7 kW stays visible.',
              card: (
                <div className="df-mini">
                  <div className="df-mini-k">Space vs draw</div>
                  <div className="df-mini-v">4,820 heads</div>
                  <ul>
                    <li><span>CIET</span><b>1,050</b><em className="ok">Busy</em></li>
                    <li><span>Auditorium</span><b>0</b><em className="warn">Idle 38 kW</em></li>
                    <li><span>Library</span><b>220</b><em>Open</em></li>
                  </ul>
                </div>
              ),
            },
          ].map((w) => (
            <article key={w.n} className="df-pin-row">
              <div className="df-pin-copy">
                <div className="df-work-n">{w.n}</div>
                <w.icon className="size-5" />
                <h3>{w.t}</h3>
                <p>{w.d}</p>
                <button type="button" className="df-text-link" onClick={onEnterTwin}>
                  Explore {w.t.split(' ')[0].toLowerCase()} <ArrowRight className="size-3.5" />
                </button>
              </div>
              <div className="df-pin-stage">{w.card}</div>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`df-run reveal ${run.on ? 'is-in' : ''}`}
        id="flow"
        ref={run.ref}
      >
        <div className="df-section-head">
          <h2>See a run end to end</h2>
          <p>How one campus item moves from three sources to one recorded decision, with the rule your team chose doing the deciding.</p>
        </div>
        <div className="df-run-shell">
          <div className="df-tabs" role="tablist">
            {FLOW.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={flow === i}
                className={flow === i ? 'on' : ''}
                onClick={() => setFlow(i)}
              >
                {s.tab}
              </button>
            ))}
          </div>
          <div key={step.id} className="df-run-panel">
            <div className="df-run-head">
              <strong>{step.title}</strong>
              <span>Illustrative values</span>
            </div>
            <table>
              <tbody>
                {step.rows.map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td className={/Differs|Break|Hold|Review|Open/.test(r[3]) ? 'warn' : 'ok'}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>{step.note}</p>
          </div>
        </div>
      </section>

      <section className={`df-check reveal ${check.on ? 'is-in' : ''}`} ref={check.ref}>
        <div>
          <h2>Built to be checked</h2>
          <p>Every figure keeps a campus source. Models propose; faculty still decide.</p>
        </div>
        <ul>
          <li><CheckCircle2 className="size-4" /> Simulated telemetry labelled as simulated — never dressed up as SCADA.</li>
          <li><CheckCircle2 className="size-4" /> What-if math is deterministic: tariff, yield, payback.</li>
          <li><CheckCircle2 className="size-4" /> Copilot answers only from the Dundigal twin model.</li>
        </ul>
      </section>

      <section className={`df-faq reveal ${faq.on ? 'is-in' : ''}`} id="faq" ref={faq.ref}>
        <h2>FAQ</h2>
        <p className="df-section-p">Straight answers about what the twin is — and what it leaves to the institute.</p>
        {FAQS.map(([q, a], i) => {
          const open = openFaq === i;
          return (
            <div key={q} className={`df-acc ${open ? 'open' : ''}`}>
              <button type="button" onClick={() => setOpenFaq(open ? null : i)}>
                {q}
                {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
              </button>
              <div className="df-acc-body">
                <p>{a}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className={`df-cta reveal ${cta.on ? 'is-in' : ''}`} ref={cta.ref}>
        <h2>Show us the campus.</h2>
        <p>Open the twin. Fly CIET. Ask the copilot why TR-02 is hot.</p>
        <button type="button" onClick={onEnterTwin} className="df-btn-dark df-btn-lg">
          Enter the 3D twin
          <ArrowRight className="size-4" />
        </button>
      </section>

      <footer className="df-foot">
        <span className="df-brand"><span className="df-mark df-mark-sm">MLR</span> MLRIT Twin</span>
        <span>Dundigal · Hyderabad · JNTUH</span>
        <button type="button" onClick={onEnterTwin} className="df-btn-dark">Enter twin</button>
      </footer>
    </div>
  );
};
