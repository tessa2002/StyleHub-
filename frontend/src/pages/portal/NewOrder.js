import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

// Helper: numeric coercion for inputs
const toNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

export default function PortalNewOrder() {
  const navigate = useNavigate();

  // Section 1: Customer info (auto-filled, read-only)
  const [profile, setProfile] = useState({ user: null, customer: null });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Section 2: Measurements
  const [useSaved, setUseSaved] = useState(true);
  const [measurements, setMeasurements] = useState({ height: '', chest: '', waist: '', hips: '', sleeve: '', shoulder: '' });
  const [mhistory, setMhistory] = useState([]); // [{_id, measurements, createdAt}]
  const [selectedHistoryId, setSelectedHistoryId] = useState('');

  // Section 3: Fabric details
  const [ownFabric, setOwnFabric] = useState(false);
  const [fabricQuery, setFabricQuery] = useState('');
  const [fabrics, setFabrics] = useState([]);
  const [selectedFabricId, setSelectedFabricId] = useState('');
  const [fabricQty, setFabricQty] = useState(1);
  const [ownFabricNotes, setOwnFabricNotes] = useState('');
  const [loadingFabrics, setLoadingFabrics] = useState(false);

  // Section 4: Order Details
  const [details, setDetails] = useState({
    garmentType: '',
    sleeveType: '',
    collarType: '',
    hasButtons: false,
    hasEmbroidery: false,
    specialInstructions: '',
    expectedDelivery: '', // date string
  });

  // Embroidery customization state and options
  const [emb, setEmb] = useState({ enabled: false, type: 'machine', placements: [], pattern: 'floral', colors: [], notes: '' });
  const EMB_TYPES = ['hand','machine','zardosi','aari','bead','thread'];
  const EMB_PLACEMENTS = ['collar','sleeves','neckline','hem','full','custom'];
  const EMB_PATTERNS = ['floral','geometric','custom'];
  const SHOP_COLORS = ['gold','silver','red','blue','green','black','white']; // basic palette; can be fetched later

  // Section 5: Billing & Payment — removed from customer portal (handled by Admin)
  const [charges, setCharges] = useState({ stitching: 0, customization: 0 }); // deprecated in portal; kept for backward compatibility
  const [payment, setPayment] = useState({ status: 'Pending', amountNow: 0, method: 'Cash' }); // deprecated in portal

  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Derived values
  const selectedFabric = useMemo(() => fabrics.find(f => f._id === selectedFabricId) || null, [fabrics, selectedFabricId]);
  const fabricUnitPrice = selectedFabric?.price ? Number(selectedFabric.price) : 0;
  const autoFabricCost = (!ownFabric && selectedFabric) ? Math.max(0, (fabricUnitPrice || 0) * Number(fabricQty || 0)) : 0;

  // Auto pricing for embroidery (simple rules)
  const embCost = useMemo(() => {
    if (!emb.enabled) return 0;
    const base = { machine: 300, hand: 800, zardosi: 1200, aari: 1000, bead: 900, thread: 500 };
    const perPlacement = { collar: 150, sleeves: 200, neckline: 250, hem: 300, full: 1200, custom: 300 };
    const perExtraColor = 50;
    const t = base[emb.type] || 0;
    const p = (emb.placements || []).reduce((sum, pl) => sum + (perPlacement[pl] || 0), 0);
    const extraColors = Math.max(0, (emb.colors?.length || 0) - 1);
    return t + p + (extraColors * perExtraColor);
  }, [emb]);

  const grandTotal = useMemo(() => {
    const s = Number(charges.stitching || 0);
    const c = Number(charges.customization || 0);
    const f = autoFabricCost;
    const e = embCost;
    return s + c + f + e;
  }, [charges, autoFabricCost, embCost]);
  const stockWarning = useMemo(() => {
    if (!selectedFabric || !fabricQty || ownFabric) return '';
    if (typeof selectedFabric.stock === 'number' && fabricQty > selectedFabric.stock) return 'Requested quantity exceeds available stock';
    return '';
  }, [selectedFabric, fabricQty, ownFabric]);

  useEffect(() => {
    // Load profile + measurements
    (async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          axios.get('/api/portal/profile'),
          axios.get('/api/portal/measurements')
        ]);
        setProfile(pRes.data || { user: null, customer: null });
        const hist = (mRes.data?.history || []).map(h => ({ _id: h._id, createdAt: h.createdAt, measurements: h.measurements || {} }));
        setMhistory(hist);
        setSelectedHistoryId(hist[0]?._id || '');
      } catch (e) {
        setProfile({ user: null, customer: null });
        setMhistory([]);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Initial fabrics load
    fetchFabrics('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFabrics = async (q) => {
    try {
      setLoadingFabrics(true);
      const { data } = await axios.get(`/api/fabrics`, { params: { q, inStock: '1', limit: 20 } });
      setFabrics(data.items || []);
    } catch {
      setFabrics([]);
    } finally {
      setLoadingFabrics(false);
    }
  };

  const selectedSnapshot = useMemo(() => {
    if (useSaved) {
      const picked = mhistory.find(h => h._id === selectedHistoryId);
      return picked?.measurements || {};
    }
    return {
      height: toNum(measurements.height),
      chest: toNum(measurements.chest),
      waist: toNum(measurements.waist),
      hips: toNum(measurements.hips),
      sleeve: toNum(measurements.sleeve),
      shoulder: toNum(measurements.shoulder),
    };
  }, [useSaved, mhistory, selectedHistoryId, measurements]);

  const doPrint = () => {
    // Simple print of current form summary (mini)
    window.print();
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Compose details note
      const detailsNote = [
        details.garmentType && `Garment: ${details.garmentType}`,
        details.sleeveType && `Sleeve: ${details.sleeveType}`,
        details.collarType && `Collar: ${details.collarType}`,
        `Buttons: ${details.hasButtons ? 'Yes' : 'No'}`,
        `Embroidery: ${details.hasEmbroidery ? 'Yes' : 'No'}`,
        details.specialInstructions && `Instructions: ${details.specialInstructions}`,
        details.expectedDelivery && `Delivery: ${details.expectedDelivery}`,
      ].filter(Boolean).join(' | ');

      // Fabric notes
      const fabricNotes = ownFabric
        ? `Customer will bring own fabric. Notes: ${ownFabricNotes || 'N/A'}`
        : selectedFabric
          ? `Fabric: ${selectedFabric.name || ''}${selectedFabric.code ? ` (Code: ${selectedFabric.code})` : ''}${selectedFabric.color ? `, Color/Pattern: ${selectedFabric.color}` : ''}. Qty needed: ${fabricQty}.`
          : '';

      const finalNotes = [notes, detailsNote, fabricNotes].filter(Boolean).join('\n');

      // Build items for order total in portal (no bill generation here)
      const chargeItems = [];
      if (Number(charges.stitching) > 0) chargeItems.push({ name: 'Stitching Charges', quantity: 1, price: Number(charges.stitching) });
      if (!ownFabric && autoFabricCost > 0) chargeItems.push({ name: 'Fabric Cost', quantity: 1, price: Number(autoFabricCost) });
      // Embroidery preview is priced client-side, but the server will add the charge item automatically.
      if (Number(charges.customization) > 0) chargeItems.push({ name: 'Customization Charges', quantity: 1, price: Number(charges.customization) });

      // Optional base item name with garment type for clarity
      const baseItemName = details.garmentType ? `${details.garmentType} Stitching` : 'Custom Stitching';
      const items = [{ name: baseItemName, quantity: 1, price: 0 }, ...chargeItems];

      // Build fabric payload for backend (stock decremented server-side if shop fabric)
      let fabricPayload = { source: 'none' };
      if (ownFabric) {
        fabricPayload = { source: 'customer', quantity: Number(fabricQty || 0) || 0, notes: ownFabricNotes };
      } else if (selectedFabricId) {
        fabricPayload = { source: 'shop', fabricId: selectedFabricId, quantity: Number(fabricQty || 1) || 1 };
      }

      const payload = {
        items,
        measurementSnapshot: selectedSnapshot,
        notes: finalNotes,
        expectedDelivery: details.expectedDelivery || undefined,
        fabric: fabricPayload,
        customizations: {
          embroidery: emb.enabled ? {
            enabled: true,
            type: emb.type,
            placements: emb.placements,
            pattern: emb.pattern,
            colors: emb.colors,
            notes: emb.notes,
          } : { enabled: false }
        }
      };

      await axios.post('/api/portal/orders', payload);
      navigate('/portal/orders');
    } catch (e1) {
      setError(e1?.response?.data?.message || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="New Order"
      subtitle="Book a new stitching order quickly by selecting fabrics, measurements, and customizations."
      actions={<><button className="secondary" onClick={() => navigate(-1)}>Back</button></>}
    >
      <form className="form" onSubmit={submit}>
        {/* Section 1: Customer Information */}
        <div className="section">
          <h3 className="section-title">Customer Information</h3>
          {loadingProfile ? (
            <div>Loading...</div>
          ) : (
            <div className="row">
              <label>
                <span>Name</span>
                <input value={profile.user?.name || profile.customer?.name || ''} readOnly />
              </label>
              <label>
                <span>Phone</span>
                <input value={profile.user?.phone || profile.customer?.phone || ''} readOnly />
              </label>
              <label>
                <span>Email</span>
                <input value={profile.user?.email || profile.customer?.email || ''} readOnly />
              </label>
            </div>
          )}
        </div>

        {/* Section 2: Measurements */}
        <div className="section">
          <h3 className="section-title">Measurements</h3>
          <div className="row" style={{ alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" name="mopt" checked={useSaved} onChange={() => setUseSaved(true)} />
              <span>Use Saved Measurements</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" name="mopt" checked={!useSaved} onChange={() => setUseSaved(false)} />
              <span>Add New Measurements</span>
            </label>
          </div>

          {useSaved ? (
            <div className="row">
              <label style={{ gridColumn: '1 / -1' }}>
                <span>Select from history</span>
                <select value={selectedHistoryId} onChange={e => setSelectedHistoryId(e.target.value)}>
                  {mhistory.length === 0 && <option value="">No saved measurements</option>}
                  {mhistory.map(h => (
                    <option key={h._id} value={h._id}>
                      {h.createdAt ? new Date(h.createdAt).toLocaleString() : 'Snapshot'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <label><span>Height</span><input type="number" step="0.1" value={measurements.height} onChange={e => setMeasurements(v => ({ ...v, height: e.target.value }))} /></label>
              <label><span>Chest</span><input type="number" step="0.1" value={measurements.chest} onChange={e => setMeasurements(v => ({ ...v, chest: e.target.value }))} /></label>
              <label><span>Waist</span><input type="number" step="0.1" value={measurements.waist} onChange={e => setMeasurements(v => ({ ...v, waist: e.target.value }))} /></label>
              <label><span>Hip</span><input type="number" step="0.1" value={measurements.hips} onChange={e => setMeasurements(v => ({ ...v, hips: e.target.value }))} /></label>
              <label><span>Sleeve length</span><input type="number" step="0.1" value={measurements.sleeve} onChange={e => setMeasurements(v => ({ ...v, sleeve: e.target.value }))} /></label>
              <label><span>Shoulder width</span><input type="number" step="0.1" value={measurements.shoulder} onChange={e => setMeasurements(v => ({ ...v, shoulder: e.target.value }))} /></label>
            </div>
          )}
        </div>

        {/* Section 3: Fabric Details */}
        <div className="section">
          <h3 className="section-title">Fabric Details</h3>
          <div className="row" style={{ alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={ownFabric} onChange={e => setOwnFabric(e.target.checked)} />
              <span>Customer will bring own fabric</span>
            </label>
          </div>

          {!ownFabric ? (
            <>
              <div className="row" style={{ gridTemplateColumns: '1fr auto' }}>
                <label>
                  <span>Search fabric</span>
                  <input
                    placeholder="Search by name, type, color..."
                    value={fabricQuery}
                    onChange={e => setFabricQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); fetchFabrics(fabricQuery); } }}
                  />
                </label>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <button type="button" className="secondary" onClick={() => fetchFabrics(fabricQuery)} disabled={loadingFabrics}>
                    {loadingFabrics ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              <div className="row">
                <label style={{ gridColumn: '1 / -1' }}>
                  <span>Select Fabric</span>
                  <select value={selectedFabricId} onChange={e => setSelectedFabricId(e.target.value)}>
                    <option value="">Select from inventory</option>
                    {fabrics.map(f => (
                      <option key={f._id} value={f._id}>
                        {f.name}{f.code ? ` — ${f.code}` : ''}{f.color ? ` — ${f.color}` : ''} {typeof f.stock === 'number' ? `(Stock: ${f.stock})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedFabric && (
                <div className="row">
                  <label>
                    <span>Fabric Name / Code</span>
                    <input value={`${selectedFabric.name || ''}${selectedFabric.code ? ` / ${selectedFabric.code}` : ''}`} readOnly />
                  </label>
                  <label>
                    <span>Color / Pattern</span>
                    <input value={selectedFabric.color || ''} readOnly />
                  </label>
                  <label>
                    <span>Quantity needed</span>
                    <input type="number" min={1} value={fabricQty} onChange={e => setFabricQty(Number(e.target.value || 1))} />
                  </label>
                </div>
              )}

              {stockWarning && (
                <div className="field-error" role="alert">{stockWarning}</div>
              )}
            </>
          ) : (
            <div className="row" style={{ gridTemplateColumns: '1fr' }}>
              <label>
                <span>Notes (fabric details)</span>
                <textarea value={ownFabricNotes} onChange={e => setOwnFabricNotes(e.target.value)} placeholder="Color, pattern, any special instructions..." />
              </label>
            </div>
          )}
        </div>

        {/* Section 4: Order Details */}
        <div className="section">
          <h3 className="section-title">Order Details</h3>
          <div className="row">
            <label>
              <span>Garment Type</span>
              <select value={details.garmentType} onChange={e => setDetails(d => ({ ...d, garmentType: e.target.value }))}>
                <option value="">Select</option>
                {['Shirt','Blouse','Dress','Suit','Lehenga','Kurta','Trousers','Skirt','Sherwani','Other'].map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <label>
              <span>Sleeve type</span>
              <select value={details.sleeveType} onChange={e => setDetails(d => ({ ...d, sleeveType: e.target.value }))}>
                {['','Sleeveless','Short','3/4th','Full'].map(x => <option key={x} value={x}>{x || 'Select'}</option>)}
              </select>
            </label>
            <label>
              <span>Collar type</span>
              <select value={details.collarType} onChange={e => setDetails(d => ({ ...d, collarType: e.target.value }))}>
                {['','None','Mandarin','Spread','Notch','Band','Round'].map(x => <option key={x} value={x}>{x || 'Select'}</option>)}
              </select>
            </label>
          </div>
          <div className="row">
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={details.hasButtons} onChange={e => setDetails(d => ({ ...d, hasButtons: e.target.checked }))} />
              <span>Buttons</span>
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={details.hasEmbroidery} onChange={ev => { const checked = ev.target.checked; setDetails(d => ({ ...d, hasEmbroidery: checked })); setEmb(e => ({ ...e, enabled: checked })); }} />
              <span>Embroidery</span>
            </label>
            <label>
              <span>Delivery Date</span>
              <input type="date" value={details.expectedDelivery} onChange={e => setDetails(d => ({ ...d, expectedDelivery: e.target.value }))} />
            </label>
            <label style={{ gridColumn:'1 / -1' }}>
              <span>Special Instructions</span>
              <textarea value={details.specialInstructions} onChange={e => setDetails(d => ({ ...d, specialInstructions: e.target.value }))} />
            </label>
          </div>
        </div>

        {/* Section 4.1: Embroidery Customization */}
        {details.hasEmbroidery && (
          <div className="section">
            <h3 className="section-title">Embroidery Customization</h3>
            <div className="row">
              <label>
                <span>Embroidery Type</span>
                <select value={emb.type} onChange={e => setEmb(v => ({ ...v, type: e.target.value }))}>
                  {EMB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>
                <span>Pattern</span>
                <select value={emb.pattern} onChange={e => setEmb(v => ({ ...v, pattern: e.target.value }))}>
                  {EMB_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <div>
                <span>Placement</span>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', paddingTop: 8 }}>
                  {EMB_PLACEMENTS.map(p => (
                    <label key={p} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <input
                        type="checkbox"
                        checked={emb.placements.includes(p)}
                        onChange={() => setEmb(v => ({ ...v, placements: v.placements.includes(p) ? v.placements.filter(x => x !== p) : [...v.placements, p] }))}
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="row">
              <div>
                <span>Colors</span>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', paddingTop: 8 }}>
                  {SHOP_COLORS.map(c => (
                    <label key={c} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <input
                        type="checkbox"
                        checked={emb.colors.includes(c)}
                        onChange={() => setEmb(v => ({ ...v, colors: v.colors.includes(c) ? v.colors.filter(x => x !== c) : [...v.colors, c] }))}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label style={{ gridColumn:'1 / -1' }}>
                <span>Embroidery Notes</span>
                <textarea value={emb.notes} onChange={e => setEmb(v => ({ ...v, notes: e.target.value }))} placeholder="Motif reference, density, custom area, etc." />
              </label>
            </div>
            <div style={{ color:'#64748b', fontSize: 12 }}>
              Embroidery Charges (auto): {embCost.toFixed(2)} will be included in total.
            </div>
          </div>
        )}

        {/* Section 5: Billing & Payment */}
        {/* Billing & Payment removed for customer portal. Charges will be added by Admin in dashboard. */}
        <div className="section">
          <h3 className="section-title">Additional Notes</h3>
          <div className="row">
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Notes</span>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any extra info you'd like to include" />
            </label>
          </div>
          <div style={{ color:'#64748b', fontSize: 12 }}>
            Billing is handled by the shop after review. You can check My Orders for bill and payment status.
          </div>
        </div>

        {/* Section 6: Actions */}
        {error && (<div className="field-error" role="alert">{error}</div>)}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="primary" disabled={saving || (!!stockWarning && !ownFabric)}>
            {saving ? 'Saving...' : 'Save Order'}
          </button>
          <button type="button" className="secondary" onClick={() => navigate('/portal')}>Cancel</button>
          <button type="button" onClick={doPrint}>Print Receipt</button>
        </div>
      </form>
    </DashboardLayout>
  );
}