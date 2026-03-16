import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminEmbroidery() {
  const API_URL = process.env.REACT_APP_API_URL !== undefined 
    ? process.env.REACT_APP_API_URL 
    : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
  const api = axios.create({ baseURL: API_URL });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [category, setCategory] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Floral');
  const [newPrice, setNewPrice] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const font1 = document.createElement('link');
    font1.rel = 'stylesheet';
    font1.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap';
    document.head.appendChild(font1);

    const materialOutlinedFill = document.createElement('link');
    materialOutlinedFill.rel = 'stylesheet';
    materialOutlinedFill.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(materialOutlinedFill);

    const cfg = document.createElement('script');
    cfg.id = 'tailwind-config';
    cfg.innerHTML = `
      window.tailwind = window.tailwind || {};
      window.tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              primary: "#ee3a6a",
              "background-light": "#fdfbfc",
              "background-dark": "#221015"
            },
            fontFamily: {
              display: ["Manrope"]
            },
            borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" }
          }
        }
      };
    `;
    document.head.appendChild(cfg);

    const tw = document.createElement('script');
    tw.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    document.head.appendChild(tw);

    return () => {
      [font1, materialOutlinedFill, cfg, tw].forEach(el => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (sort) params.sort = sort;
      const res = await api.get('/api/embroidery', { params });
      setPatterns(res.data.patterns || []);
    } catch (e) {
      console.error('Failed to load patterns', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, category]);

  const onBrowseClick = () => {
    const input = document.getElementById('emb-upload-input');
    if (input) input.click();
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) setFile(f);
  };

  const onAddToLibrary = async () => {
    if (!newName) return alert('Please enter a pattern name');
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('name', newName);
      fd.append('category', newCategory);
      if (newPrice) fd.append('price', newPrice);
      if (file) fd.append('image', file);
      const res = await api.post('/api/embroidery', fd);
      setNewName('');
      setNewCategory('Floral');
      setNewPrice('');
      setFile(null);
      fetchPatterns();
    } catch (e) {
      const status = e.response?.status;
      if (status === 404 && file) {
        try {
          const fd2 = new FormData();
          fd2.append('referenceImages', file);
          const up = await api.post('/api/uploads/reference', fd2);
          const url = up.data.attachments?.[0]?.url;
          if (url) {
            const res2 = await api.post('/api/embroidery', {
              name: newName,
              category: newCategory,
              price: newPrice,
              imageUrl: url
            });
            setNewName('');
            setNewCategory('Floral');
            setNewPrice('');
            setFile(null);
            fetchPatterns();
            return;
          }
        } catch (fallbackErr) {
          const msg = fallbackErr.response?.data?.message || fallbackErr.message || 'Failed to add pattern';
          alert(msg);
        }
      } else {
        const msg = e.response?.data?.message || e.message || 'Failed to add pattern';
        alert(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      const res = await api.put(`/api/embroidery/${p._id}`, { active: !p.active });
      setPatterns(prev => prev.map(x => x._id === p._id ? res.data.pattern : x));
    } catch (e) {
      console.error('Failed to update active', e);
    }
  };

  const onDelete = async (p) => {
    if (!window.confirm('Delete this pattern?')) return;
    try {
      await api.delete(`/api/embroidery/${p._id}`);
      setPatterns(prev => prev.filter(x => x._id !== p._id));
    } catch (e) {
      console.error('Failed to delete', e);
    }
  };

  const onEdit = async (p) => {
    const name = window.prompt('Pattern name', p.name);
    if (name === null) return;
    const priceStr = window.prompt('Price', String(p.price || ''));
    if (priceStr === null) return;
    try {
      const res = await api.put(`/api/embroidery/${p._id}`, { name, price: priceStr });
      setPatterns(prev => prev.map(x => x._id === p._id ? res.data.pattern : x));
    } catch (e) {
      console.error('Failed to edit', e);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white dark:bg-background-dark px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 text-primary">
                <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">StitchAdmin</h2>
              </div>
              <nav className="flex items-center gap-9">
                <a className="text-slate-600 dark:text-slate-300 hover:text-primary text-sm font-medium transition-colors" href="#">Dashboard</a>
                <a className="text-slate-600 dark:text-slate-300 hover:text-primary text-sm font-medium transition-colors" href="#">Orders</a>
                <a className="text-primary text-sm font-bold border-b-2 border-primary pb-1" href="#">Embroidery Library</a>
                <a className="text-slate-600 dark:text-slate-300 hover:text-primary text-sm font-medium transition-colors" href="#">Customers</a>
                <a className="text-slate-600 dark:text-slate-300 hover:text-primary text-sm font-medium transition-colors" href="#">Settings</a>
              </nav>
            </div>
            <div className="flex flex-1 justify-end gap-6 items-center">
              <label className="flex flex-col min-w-40 h-10 max-w-64">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full border border-primary/10 bg-white shadow-sm">
                  <div className="text-primary flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 border-none focus:ring-0 bg-transparent px-4 pl-2 text-base font-normal placeholder:text-slate-400"
                    placeholder="Search patterns..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </label>
              <div className="flex gap-3">
                <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">settings</span>
                </button>
              </div>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20"
                data-alt="Admin user profile picture"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7fjgZceLJ574OS2l7DotXDoeqECr3a-atvRA2FIGZ1gVo4YqoqHrSGP1gquLU9xnOXTKPFOF3SCo0Sn4qNAOeH5zkL_Io5YxTyLbhE3MxEsd-5sbnM_cSC5VmZq6wSaMR1BJx2nB-fno_9ILpVAglV_fcBSum88CL7rObCC40yN4MsT-XTpLZE3AFgHkewFqeUe_fODdzqYkshpZmZOf-wY6UuQMybL5fB9d-5nvzeW6ojHzmgmhaPbQNW7shJ8LwQ8WXslho3z0')"
                }}
              />
            </div>
          </header>

          <main className="flex-1 px-10 py-8 max-w-[1440px] mx-auto w-full">
            <div className="mb-10">
              <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight mb-2">
                Embroidery Library Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Curate and manage your signature needlework designs for global tailoring orders.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                <section className="bg-white dark:bg-background-dark/50 p-6 rounded-xl border border-primary/10 shadow-sm">
                  <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">cloud_upload</span>
                    Upload New Pattern
                  </h2>
                  <div
                    className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-10 hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={onBrowseClick}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">image</span>
                      </div>
                      <p className="text-slate-900 dark:text-white text-base font-bold text-center mt-2">
                        Drag and drop pattern image
                      </p>
                      <p className="text-slate-500 text-sm text-center">SVG, PNG, or JPG (Max 10MB)</p>
                    </div>
                    <input id="emb-upload-input" type="file" hidden onChange={onFileChange} accept="image/png,image/jpeg,image/jpg,image/svg+xml" />
                    <button onClick={onBrowseClick} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors">
                      Browse Files
                    </button>
                    {file && (
                      <div className="mt-4 flex items-center gap-3">
                        <div
                          className="w-16 h-16 rounded-lg border border-primary/20 bg-cover bg-center"
                          style={{ backgroundImage: `url('${URL.createObjectURL(file)}')` }}
                          aria-label="Selected image preview"
                        />
                        <div className="text-sm">
                          <div className="font-bold">{file.name}</div>
                          <div className="text-slate-500">{Math.round(file.size / 1024)} KB</div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-white dark:bg-background-dark/50 p-6 rounded-xl border border-primary/10 shadow-sm">
                  <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-6">Pattern Details</h2>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pattern Name</label>
                      <input className="w-full border border-primary/10 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Royal Gold Floral" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                      <select className="w-full border border-primary/10 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                        <option value="Floral">Floral</option>
                        <option value="Monogram">Monogram</option>
                        <option value="Geometric">Geometric</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Abstract">Abstract</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Base Price (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-400">$</span>
                        <input className="w-full border border-primary/10 rounded-lg p-3 pl-7 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="45.00" type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                      </div>
                    </div>
                    <button onClick={onAddToLibrary} disabled={uploading} className="w-full bg-primary text-white py-3 rounded-lg font-bold mt-4 shadow-lg shadow-primary/25 hover:brightness-110 transition-all">
                      Add to Library
                    </button>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-slate-900 dark:text-white text-2xl font-bold">Master Library</h2>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const c = window.prompt('Filter category (Floral/Monogram/Geometric/Traditional/Abstract) or leave empty', category);
                      setCategory((c || '').trim());
                    }} className="px-4 py-2 bg-white border border-primary/20 rounded-lg text-sm font-semibold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">filter_list</span> Filter
                    </button>
                    <button onClick={() => setSort(prev => prev === 'price_asc' ? 'price_desc' : 'price_asc')} className="px-4 py-2 bg-white border border-primary/20 rounded-lg text-sm font-semibold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">sort</span> Sort
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {patterns.map((p) => (
                      <div key={p._id} className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        <div className="aspect-square bg-primary/5 relative">
                          <div
                            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                            style={{ backgroundImage: `url('${p.image?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwby3_WMTnSnm3pZTRjI3Sv1vEx8lfArvz6q3xzk2Gg5T-CA6b9y6JF-B5Z0gmAEHWc6LxBgpTO15msQ9-jg3JYykReNmwvFFNGoxXhjE4Frcx4D_0bHQbX4-XUh9itZtutLzBMrfC5pSHJZZZrcKgz7VWIzlmC5tYkbZg7qL9Pq1IvbnmVmurINHgAUAjEgCmPJ_1hMu5QwHcpvTMoxg8a0Z5qXWKUm59zjyQoSeAhpLgKjLuMUbYPL5lOOfEzgGLbVFRM-omOiI'}')` }}
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary shadow-sm">
                            ${Number(p.price || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-slate-900">{p.name}</h3>
                              <p className="text-xs text-slate-500">{p.category}</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer" title={p.active ? 'Active' : 'Inactive'}>
                              <input checked={!!p.active} onChange={() => toggleActive(p)} className="sr-only peer" type="checkbox" />
                              <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => onEdit(p)} className="flex-1 py-1.5 border border-primary/20 rounded text-xs font-bold text-primary hover:bg-primary/5">Edit</button>
                            <button onClick={() => onDelete(p)} className="size-8 flex items-center justify-center border border-red-100 rounded text-red-400 hover:bg-red-50">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
