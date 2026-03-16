import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function EmbroiderySpec() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};
  const [patterns, setPatterns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showGallery, setShowGallery] = useState(false);
  const [query, setQuery] = useState('');
  const threadPalette = [
    { name: 'Vibrant Pink', hex: '#ee3a6a', code: 'Silk #402' },
    { name: 'Blush Rose', hex: '#ff9eb5', code: 'Silk #118' },
    { name: 'Royal Gold', hex: '#d4af37', code: 'Metallic #G' },
    { name: 'Ivory Silk', hex: '#f5f5dc', code: 'Silk #021' },
    { name: 'Emerald', hex: '#2ecc71', code: 'Silk #310' },
    { name: 'Sapphire', hex: '#1e3a8a', code: 'Silk #240' },
    { name: 'Onyx', hex: '#111827', code: 'Cotton #001' },
    { name: 'Silver', hex: '#c0c0c0', code: 'Metallic #S' }
  ];
  const [selectedColors, setSelectedColors] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL !== undefined 
    ? process.env.REACT_APP_API_URL 
    : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
  const api = axios.create({ baseURL: API_URL });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    const font1 = document.createElement('link');
    font1.rel = 'stylesheet';
    font1.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap';
    document.head.appendChild(font1);

    const font2 = document.createElement('link');
    font2.rel = 'stylesheet';
    font2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(font2);

    const cfg = document.createElement('script');
    cfg.innerHTML = `
      window.tailwind = window.tailwind || {};
      window.tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#ee3a6a",
              "background-light": "#f8f6f6",
              "background-dark": "#221015"
            },
            fontFamily: {
              display: ["Manrope", "sans-serif"]
            },
            borderRadius: {
              DEFAULT: "0.25rem",
              lg: "0.5rem",
              xl: "0.75rem",
              full: "9999px"
            }
          }
        }
      };
    `;
    document.head.appendChild(cfg);

    const tw = document.createElement('script');
    tw.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    document.head.appendChild(tw);

    return () => {
      [font1, font2, cfg, tw].forEach(el => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, []);

  const orderRef = data.orderRef || 'ORD-7721';
  const patternId = data.patternId || 'EB-2024-Vibrant';
  const activeDesign = data.activeDesign || 'Floral Cuff';

  useEffect(() => {
    const loadPatterns = async () => {
      try {
        const res = await api.get('/api/embroidery');
        const list = res.data.patterns || [];
        setPatterns(list);
        if (!selected && list.length) {
          setSelected(list[0]);
        }
      } catch (e) {
        setPatterns([]);
      }
    };
    loadPatterns();
  }, []);

  const onApprove = () => {
    if (selected) {
      try {
        localStorage.setItem('selectedEmbroideryPattern', JSON.stringify({
          id: selected._id,
          name: selected.name,
          imageUrl: selected.image?.url || '',
          colors: selectedColors.map(c => c.name)
        }));
      } catch {}
    }
    navigate(-1);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-6 lg:p-8">
        <div className="bg-white dark:bg-background-dark w-full max-w-7xl h-full max-h-[98vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <header className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">architecture</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Embroidery Specification</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Order Ref: {orderRef} • Pattern ID: {patternId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm" onClick={() => window.print()}>
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print Detail</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-primary transition-colors" onClick={() => navigate(-1)}>
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>
          </header>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
              <div className="flex-1 p-6 flex items-center justify-center relative min-h-0">
                <div className="absolute top-4 left-6 z-10 flex gap-2">
                  <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20 shadow-sm">Active Design: {activeDesign}</span>
                </div>
                <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                  <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in"
                    style={{
                      backgroundImage: `url('${selected?.image?.url || "https://lh3.googleusercontent.com/aida-public/AB6AXuARq082NQG8bVv-3ERjK_MN98IQlzuwsL8FtLvpJhXhsrsDg1t87fbpEcbw9BvLe0ipDIOj3Hjp-LhH6nrtcbPuck2PGr-wIIbiDW-KD5D2CsSYYdTA2ZQ3J8WGEP0gJycoE5v373w6nKDKTcBCtzvZ-no7v_-txAg8oQbvYnNsivlKslttl_mpYlS6klGQsNSuIAs8IgO8eaqGppwIUOvZ-0Ge4zK8mFZ6OZZmOJPqCWHnxEPU-qctvJsGgdPOqHzzQ65w9FDNvaE"}')`,
                      transform: `scale(${zoom})`
                    }}
                  />
                </div>
                <div className="absolute bottom-6 flex gap-2">
                  <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="size-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:text-primary transition-colors border border-slate-100 dark:border-slate-700">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                  <button onClick={() => setZoom(z => Math.max(1, z - 0.1))} className="size-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:text-primary transition-colors border border-slate-100 dark:border-slate-700">
                    <span className="material-symbols-outlined">zoom_out</span>
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Pattern Library</h3>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">{String(patterns.length).padStart(2, '0')} DESIGNS</span>
                  </div>
                  <button onClick={() => setShowGallery(true)} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 group">
                    <span>EXPAND GALLERY</span>
                    <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-y-0.5">expand_more</span>
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {patterns.map((p, idx) => (
                    <button
                      key={p._id || idx}
                      className={`group p-2 rounded-xl ${selected?._id === p._id ? 'border-2 border-primary bg-primary/5' : 'border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800'} flex flex-col gap-2 text-left transition-all`}
                      onClick={() => setSelected(p)}
                    >
                      <div
                        className={`aspect-video w-full rounded-lg ${selected?._id === p._id ? 'bg-white border border-slate-100' : 'bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 opacity-80'} flex-shrink-0 bg-cover bg-center`}
                        style={{ backgroundImage: `url('${p.image?.url || ''}')` }}
                      />
                      <div className="min-w-0">
                        <p className={`text-[11px] font-bold ${selected?._id === p._id ? 'text-primary' : ''} truncate`}>{p.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{p.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <aside className="w-96 border-l border-slate-100 dark:border-slate-800 overflow-y-auto bg-white dark:bg-background-dark p-8 flex flex-col gap-8 flex-shrink-0">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Placement Map</h3>
                  <button className="text-primary text-[10px] font-bold hover:underline">RE-CALIBRATE</button>
                </div>
                <div className="aspect-square w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-40 mix-blend-multiply dark:mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUjU-XS3nzulEx51VtgbBUhZj3Bw-xXtkr0l8-oHGXMuHgAGNzMmJ73m1imiL-6jjHMGDyrrwg4zFmUoiEkTs7UCjF3aX7s_7tvIaGkOg05GYYYddjgpFIkSsEiSekO0LisP-umXR3ygzIJje9PDTzgxx5HR5NbN3OAIpPwQXsMaV00EZu-zPMFY7YkRz6TIh7RDBERKWQisWE-4BgModXTsjHYFPeI7PXJSjLPEtiZljz0Xh0ew2WzZErk75H9ftr55mtafOChyw')"
                    }}
                  />
                  <div className="absolute bottom-[20%] right-[25%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-8 h-1 bg-primary rotate-45 rounded-full shadow-lg shadow-primary/40"></div>
                      <div className="absolute w-8 h-1 bg-primary -rotate-45 rounded-full shadow-lg shadow-primary/40"></div>
                      <div className="size-12 border-2 border-primary/20 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[11px] font-bold text-primary mb-1 text-xs">LOCATION SPEC:</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">2 inches above the left cuff edge, centered horizontally on outer sleeve panel.</p>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Thread Palette</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-500">Choose up to 2</span>
                  <span className="text-[11px] font-bold text-primary">{selectedColors.length}/2 selected</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {threadPalette.map(c => {
                    const active = selectedColors.some(x => x.name === c.name);
                    return (
                      <button
                        key={c.name}
                        onClick={() => {
                          let next = [...selectedColors];
                          if (active) {
                            next = next.filter(x => x.name !== c.name);
                          } else {
                            if (next.length >= 2) next = [next[0], c];
                            else next.push(c);
                          }
                          setSelectedColors(next);
                        }}
                        className={`flex items-center gap-3 p-2 rounded-lg border ${active ? 'border-primary' : 'border-slate-100 dark:border-slate-800'} bg-slate-50/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                      >
                        <div className="size-8 rounded shadow-inner" style={{ backgroundColor: c.hex }}></div>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-bold truncate ${active ? 'text-primary' : ''}`}>{c.name}</p>
                          <p className="text-[10px] text-slate-500">{c.code}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedColors.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-500">
                    Selected: {selectedColors.map(c => c.name).join(', ')}
                  </div>
                )}
              </section>
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Technique Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs font-medium text-slate-500">Primary Stitch</span>
                    <span className="text-xs font-bold text-primary">Satin Stitch</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-xs font-medium text-slate-500">Density</span>
                    <span className="text-xs font-bold text-primary">0.4mm (High)</span>
                  </div>
                </div>
              </section>
              <section className="mt-auto space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={onApprove} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">verified</span>
                  <span>Approve for Production</span>
                </button>
                <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span>Request Adjustment</span>
                </button>
              </section>
            </aside>
          </div>
        </div>
      </div>
      {showGallery && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-background-dark w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">gallery_thumbnail</span>
                <h3 className="text-sm font-bold tracking-wider">Embroidery Gallery</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-1.5 bg-slate-50 dark:bg-slate-900">
                  <span className="material-symbols-outlined text-slate-500 text-sm">search</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search patterns"
                    className="bg-transparent outline-none text-sm"
                  />
                </div>
                <button className="p-2 text-slate-400 hover:text-primary transition-colors" onClick={() => setShowGallery(false)}>
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {patterns
                  .filter(p => {
                    const q = query.trim().toLowerCase();
                    if (!q) return true;
                    const n = (p.name || '').toLowerCase();
                    const c = (p.category || '').toLowerCase();
                    return n.includes(q) || c.includes(q);
                  })
                  .map(p => (
                  <button
                    key={p._id}
                    onClick={() => { setSelected(p); setShowGallery(false); }}
                    className={`text-left rounded-xl overflow-hidden border ${selected?._id === p._id ? 'border-primary' : 'border-slate-100 dark:border-slate-800'} bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all`}
                  >
                    <div
                      className="aspect-square bg-center bg-cover"
                      style={{ backgroundImage: `url('${p.image?.url || ''}')` }}
                    />
                    <div className="p-3">
                      <div className="text-[12px] font-bold truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{p.category}</div>
                    </div>
                  </button>
                ))}
              </div>
              {patterns.length === 0 && (
                <div className="text-center text-sm text-slate-500 py-10">No designs available</div>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ee3a6a; }
      `}</style>
      <div className="max-w-[1200px] mx-auto px-10 py-12 opacity-30 pointer-events-none">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="size-8 bg-primary rounded-lg"></div>
            <h2 className="text-2xl font-black">TailorFlow</h2>
          </div>
          <div className="flex gap-8">
            <span className="font-medium">Dashboard</span>
            <span className="font-medium">Orders</span>
            <span className="font-medium">Inventory</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="aspect-[4/5] bg-slate-200 rounded-xl"></div>
          <div className="aspect-[4/5] bg-slate-200 rounded-xl"></div>
          <div className="aspect-[4/5] bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
