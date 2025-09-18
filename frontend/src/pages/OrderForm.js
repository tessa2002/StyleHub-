import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const numberOrUndefined = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

export default function OrderForm(){
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [tailors, setTailors] = useState([]);

  const [form, setForm] = useState({
    customerId: '',
    orderType: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    fabric: { name: '', code: '', color: '' },
    assignedTailor: '',
    orderDate: '',
    expectedDelivery: '',
    notes: '',
    uploads: [], // local selected files
    uploadCategory: 'Other',
  });
  const [m, setM] = useState({ height: '', chest: '', waist: '', hips: '', shoulder: '', sleeve: '', armLength: '', legLength: '', neck: '' });
  // Section 4: Order Details
  const [details, setDetails] = useState({
    garmentType: '',
    sleeveType: '',
    collarType: '',
    hasButtons: false,
    hasEmbroidery: false,
    specialInstructions: '',
  });
  // Section 5: Billing & Payment
  const [charges, setCharges] = useState({ stitching: 0, fabric: 0, customization: 0 });
  const [payment, setPayment] = useState({ status: 'Pending', amountNow: 0, method: 'Cash' });

  const baseSubtotal = useMemo(() => (form.items || []).reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0), [form.items]);
  const extraCharges = useMemo(() => Number(charges.stitching || 0) + Number(charges.fabric || 0) + Number(charges.customization || 0), [charges]);
  const grandTotal = useMemo(() => baseSubtotal + extraCharges, [baseSubtotal, extraCharges]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [{ data: c }, { data: u }] = await Promise.all([
          axios.get('/api/customers'),
          axios.get('/api/admin/users?role=Tailor'),
        ]);
        setCustomers(c.customers || []);
        setTailors(u.users || []);
      } catch {
        setCustomers([]);
        setTailors([]);
      }
    })();
  }, []);

  const setItem = (i, field, value) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [field]: value } : it) }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: '', quantity: 1, price: 0 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const measurementSnapshot = useMemo(() => Object.fromEntries(Object.entries(m).map(([k,v]) => [k, numberOrUndefined(v)])), [m]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const detailsNote = [
        details.garmentType && `Garment: ${details.garmentType}`,
        details.sleeveType && `Sleeve: ${details.sleeveType}`,
        details.collarType && "Collar: " + details.collarType,
        details.hasButtons ? 'Buttons: Yes' : 'Buttons: No',
        details.hasEmbroidery ? 'Embroidery: Yes' : 'Embroidery: No',
        details.specialInstructions && `Instructions: ${details.specialInstructions}`,
      ].filter(Boolean).join(' | ');

      const baseItems = form.items.map(it => ({ name: it.name, quantity: Number(it.quantity || 1), price: Number(it.price || 0) }));
      const chargeItems = [];
      if (Number(charges.stitching) > 0) chargeItems.push({ name: 'Stitching Charges', quantity: 1, price: Number(charges.stitching) });
      if (Number(charges.fabric) > 0) chargeItems.push({ name: 'Fabric Cost', quantity: 1, price: Number(charges.fabric) });
      if (Number(charges.customization) > 0) chargeItems.push({ name: 'Customization Charges', quantity: 1, price: Number(charges.customization) });
      const payload = {
        ...form,
        items: [...baseItems, ...chargeItems],
        measurementSnapshot,
        assignedTailor: form.assignedTailor || undefined,
        orderDate: form.orderDate || undefined,
        expectedDelivery: form.expectedDelivery || undefined,
        notes: [form.notes, detailsNote].filter(Boolean).join(' | '),
      };

      const { data } = await axios.post('/api/orders', payload);

      // upload attachments if selected
      if (form.uploads && form.uploads.length) {
        const fd = new FormData();
        [...form.uploads].forEach(f => fd.append('files', f));
        fd.append('category', form.uploadCategory || 'Other');
        await axios.post(`/api/uploads/order/${data.order?._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      // Optional: create bill and record payment
      if (grandTotal > 0) {
        try {
          const { data: billResp } = await axios.post('/api/bills/generate', {
            orderId: data.order?._id,
            amount: grandTotal,
            paymentMethod: payment.method,
          });
          if (payment.status === 'Paid' || (payment.status === 'Partial' && Number(payment.amountNow) > 0)) {
            await axios.post(`/api/bills/${billResp.bill._id}/payments`, {
              amount: payment.status === 'Paid' ? grandTotal : Number(payment.amountNow || 0),
              method: payment.method,
              reference: 'POS',
            });
          }
        } catch (e2) {
          // non-blocking billing error
          console.warn('Billing step failed', e2?.message);
        }
      }

      navigate(`/orders/${data.order?._id}`);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="New Order" actions={<>
      <button className="secondary" onClick={() => navigate(-1)}>Back</button>
    </>}>
      <form className="form" onSubmit={handleSubmit}>
        <div className="section">
          <h3 className="section-title">Basics</h3>
          <div className="row">
            <label>
              <span>Customer</span>
              <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} required>
                <option value="">Select customer</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name} · {c.phone}</option>)}
              </select>
            </label>
            <label>
              <span>Order Type</span>
              <input value={form.orderType} onChange={e => setForm(f => ({ ...f, orderType: e.target.value }))} placeholder="Suit / Shirt / Dress / Alteration" />
            </label>
            <label>
              <span>Assigned Tailor</span>
              <select value={form.assignedTailor} onChange={e => setForm(f => ({ ...f, assignedTailor: e.target.value }))}>
                <option value="">Unassigned</option>
                {tailors.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Items</h3>
          {form.items.map((it, i) => (
            <div key={i} className="row" style={{ gridTemplateColumns: '1.2fr .3fr .3fr auto' }}>
              <label>
                <span>Item</span>
                <input value={it.name} onChange={e=> setItem(i, 'name', e.target.value)} placeholder="e.g. 2-Piece Suit" />
              </label>
              <label>
                <span>Qty</span>
                <input type="number" min={1} value={it.quantity} onChange={e=> setItem(i, 'quantity', e.target.value)} />
              </label>
              <label>
                <span>Price</span>
                <input type="number" min={0} step="0.01" value={it.price} onChange={e=> setItem(i, 'price', e.target.value)} />
              </label>
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <button type="button" className="secondary" onClick={() => removeItem(i)}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{ display:'flex', gap:16, alignItems:'center', marginTop:8 }}>
            <button type="button" className="secondary" onClick={addItem}>Add Item</button>
            <div style={{ marginLeft:'auto', color:'#64748b' }}>Subtotal: {baseSubtotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Fabric</h3>
          <div className="row">
            <label><span>Name</span><input value={form.fabric.name} onChange={e=> setForm(f => ({ ...f, fabric: { ...f.fabric, name: e.target.value } }))} /></label>
            <label><span>Code</span><input value={form.fabric.code} onChange={e=> setForm(f => ({ ...f, fabric: { ...f.fabric, code: e.target.value } }))} /></label>
            <label><span>Color</span><input value={form.fabric.color} onChange={e=> setForm(f => ({ ...f, fabric: { ...f.fabric, color: e.target.value } }))} /></label>
          </div>
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
              <span>Sleeve Type</span>
              <select value={details.sleeveType} onChange={e => setDetails(d => ({ ...d, sleeveType: e.target.value }))}>
                {['','Sleeveless','Short','3/4th','Full'].map(x => <option key={x} value={x}>{x || 'Select'}</option>)}
              </select>
            </label>
            <label>
              <span>Collar Type</span>
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
              <input type="checkbox" checked={details.hasEmbroidery} onChange={e => setDetails(d => ({ ...d, hasEmbroidery: e.target.checked }))} />
              <span>Embroidery</span>
            </label>
            <label style={{ gridColumn:'1 / -1' }}>
              <span>Special Instructions</span>
              <textarea value={details.specialInstructions} onChange={e => setDetails(d => ({ ...d, specialInstructions: e.target.value }))} />
            </label>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Measurements Snapshot</h3>
          <div className="row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {['height','chest','waist','hips','shoulder','sleeve','armLength','legLength','neck'].map(k => (
              <label key={k}><span>{k}</span><input type="number" step="0.1" value={m[k] ?? ''} onChange={e => setM(v => ({ ...v, [k]: e.target.value }))} /></label>
            ))}
          </div>
        </div>

        {/* Section 5: Billing & Payment */}
        <div className="section">
          <h3 className="section-title">Billing & Payment</h3>
          <div className="row">
            <label><span>Stitching Charges</span><input type="number" min={0} step="0.01" value={charges.stitching} onChange={e => setCharges(c => ({ ...c, stitching: e.target.value }))} /></label>
            <label><span>Fabric Cost</span><input type="number" min={0} step="0.01" value={charges.fabric} onChange={e => setCharges(c => ({ ...c, fabric: e.target.value }))} /></label>
            <label><span>Customization Charges</span><input type="number" min={0} step="0.01" value={charges.customization} onChange={e => setCharges(c => ({ ...c, customization: e.target.value }))} /></label>
          </div>
          <div className="row">
            <label><span>Total Bill</span><input value={grandTotal.toFixed(2)} readOnly /></label>
            <label>
              <span>Payment Status</span>
              <select value={payment.status} onChange={e => setPayment(p => ({ ...p, status: e.target.value }))}>
                {['Paid','Partial','Pending'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            {payment.status === 'Partial' && (
              <label><span>Amount Paid Now</span><input type="number" min={0} step="0.01" value={payment.amountNow} onChange={e => setPayment(p => ({ ...p, amountNow: e.target.value }))} /></label>
            )}
            {(payment.status === 'Paid' || payment.status === 'Partial') && (
              <label>
                <span>Method</span>
                <select value={payment.method} onChange={e => setPayment(p => ({ ...p, method: e.target.value }))}>
                  {['Cash','Card','UPI'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Files</h3>
          <div className="row">
            <label>
              <span>Category</span>
              <select value={form.uploadCategory} onChange={e => setForm(f => ({ ...f, uploadCategory: e.target.value }))}>
                {['Sketch','Fabric','Receipt','Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              <span>Upload</span>
              <input type="file" multiple onChange={e => setForm(f => ({ ...f, uploads: e.target.files }))} />
            </label>
          </div>
          {form.uploads && form.uploads.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {[...form.uploads].map((f, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border)', padding: 8, borderRadius: 6 }}>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>{f.name}</div>
                  {f.type.startsWith('image/') ? (
                    <img alt={f.name} src={URL.createObjectURL(f)} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 100, height: 100, display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#64748b' }}>No preview</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h3 className="section-title">Dates & Notes</h3>
          <div className="row">
            <label><span>Order Date</span><input type="date" value={form.orderDate} onChange={e=> setForm(f => ({ ...f, orderDate: e.target.value }))} /></label>
            <label><span>Expected Delivery</span><input type="date" value={form.expectedDelivery} onChange={e=> setForm(f => ({ ...f, expectedDelivery: e.target.value }))} /></label>
            <label><span>Notes</span><input value={form.notes} onChange={e=> setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Special instructions" /></label>
          </div>
        </div>

        {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{error}</div>}
        <button className="primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Order'}</button>
      </form>
    </DashboardLayout>
  );
}