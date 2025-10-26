import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import './NewOrder.css';

export default function PortalNewOrder() {
  const navigate = useNavigate();

  // Section 1: Customer info (auto-filled, read-only)
  const [profile, setProfile] = useState({ user: null, customer: null });

  // Section 2: Measurements
  const [useSaved, setUseSaved] = useState(true);
  const [measurements, setMeasurements] = useState({});
  const [mhistory, setMhistory] = useState([]); // [{_id, measurements, createdAt}]
  const [selectedHistoryId, setSelectedHistoryId] = useState('');

  // Section 3: Fabric details
  const [ownFabric, setOwnFabric] = useState(false);
  const [fabricQuery, setFabricQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [allFabrics, setAllFabrics] = useState([]); // All fabrics from API
  const [fabrics, setFabrics] = useState([]); // Filtered fabrics for display
  const [selectedFabricId, setSelectedFabricId] = useState('');
  const [fabricQty, setFabricQty] = useState(1);
  const [ownFabricNotes, setOwnFabricNotes] = useState('');
  const [loadingFabrics, setLoadingFabrics] = useState(false);
  
  // Fabric type filtering
  const [selectedFabricType, setSelectedFabricType] = useState('');
  const [fabricTypes, setFabricTypes] = useState([]);
  const [selectedFabricColor, setSelectedFabricColor] = useState('');

  // Autocomplete suggestions for fabric search (types/materials)
  const fabricTypeSuggestions = useMemo(() => {
    if (!fabricQuery.trim()) return [];
    const pool = Array.from(new Set([
      ...(fabricTypes || []),
      ...((allFabrics || []).map(f => f.material).filter(Boolean)),
      ...((allFabrics || []).map(f => f.type).filter(Boolean)),
    ]));
    const q = fabricQuery.toLowerCase();
    return pool
      .filter(v => typeof v === 'string' && v.toLowerCase().startsWith(q))
      .slice(0, 8);
  }, [fabricQuery, fabricTypes, allFabrics]);

  const handleSuggestionSelect = (value) => {
    if (!value) return;
    setSelectedFabricType(value);
    setSelectedFabricColor('');
    setFabricQuery('');
    setShowSuggestions(false);
  };

  // Section 4: Order Details
  const [details, setDetails] = useState({
    garmentType: '',
    urgency: 'normal', // normal or urgent
    specialInstructions: '',
    expectedDelivery: '', // date string
  });

  // Customization options
  const [customization, setCustomization] = useState({
    collarType: '',
    sleeveType: '',
    hasButtons: false,
    hasZippers: false,
    garmentOptions: {}, // dynamic per garment type
    embroidery: {
      enabled: false,
      type: 'machine',
      placements: [],
      pattern: 'floral',
      colors: [],
      notes: ''
    }
  });

  // Embroidery customization state and options
  const [emb] = useState({ enabled: false, type: 'machine', placements: [], pattern: 'floral', colors: [], notes: '' });

  // Section 5: Billing & Payment — removed from customer portal (handled by Admin)
  const [charges] = useState({ stitching: 0, customization: 0 }); // deprecated in portal; kept for backward compatibility

  const [saving, setSaving] = useState(false);
  
  // Step navigation
  const [currentStep, setCurrentStep] = useState(1);

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
        console.error('Failed to load profile/measurements:', e);
      }
    })();
  }, []);

  const searchFabrics = async () => {
    // This function is now handled by the useEffect that filters fabrics
    // based on fabricQuery state
  };

  // Load fabric types and all fabrics on component mount
  useEffect(() => {
    const loadFabricTypes = async () => {
      try {
        const res = await axios.get('/api/fabrics/types');
        setFabricTypes(res.data.types || []);
      } catch (e) {
        console.error('Failed to load fabric types:', e);
        // Fallback to common fabric types
        setFabricTypes([
          'Cotton', 'Silk', 'Linen', 'Wool', 'Polyester', 'Rayon', 
          'Denim', 'Chiffon', 'Georgette', 'Crepe', 'Satin', 'Velvet'
        ]);
      }
    };

    const loadAllFabrics = async () => {
      try {
        console.log('Loading all fabrics...');
        const res = await axios.get('/api/fabrics');
        console.log('All fabrics response:', res.data);
        setAllFabrics(res.data.fabrics || []);
        // Don't show fabrics initially - user must search first
        setFabrics([]); // Start with empty - only show after search
      } catch (e) {
        console.error('Failed to load fabrics:', e);
        setAllFabrics([]);
        setFabrics([]);
      }
    };

    loadFabricTypes();
    loadAllFabrics();
  }, []);

  // Filter fabrics based on search query ONLY
  // Fabrics only visible when customer actually searches (types in search box)
  useEffect(() => {
    // ONLY show fabrics if customer has typed something in the search box
    if (!fabricQuery.trim()) {
      setFabrics([]);
      return;
    }
    
    let filtered = allFabrics;
    
    // Apply search query filter
    filtered = filtered.filter(fabric => 
      fabric.name?.toLowerCase().includes(fabricQuery.toLowerCase()) ||
      fabric.material?.toLowerCase().includes(fabricQuery.toLowerCase()) ||
      fabric.type?.toLowerCase().includes(fabricQuery.toLowerCase()) ||
      fabric.color?.toLowerCase().includes(fabricQuery.toLowerCase()) ||
      fabric.pattern?.toLowerCase().includes(fabricQuery.toLowerCase())
    );
    
    // Apply type filter (if selected)
    if (selectedFabricType) {
      filtered = filtered.filter(fabric => 
        fabric.material?.toLowerCase() === selectedFabricType.toLowerCase() ||
        fabric.type?.toLowerCase() === selectedFabricType.toLowerCase()
      );
    }
    
    // Apply color filter (if selected)
    if (selectedFabricColor) {
      filtered = filtered.filter(fabric => 
        fabric.color?.toLowerCase() === selectedFabricColor.toLowerCase()
      );
    }
    
    setFabrics(filtered);
  }, [fabricQuery, selectedFabricType, selectedFabricColor, allFabrics]);


  // Price calculation functions
  const getBasePrice = () => {
    const basePrices = {
      'shirt': 800,
      'pants': 600,
      'suit': 2000,
      'dress': 1200,
      'kurta': 1000,
      'blouse': 800,
      'lehenga': 2500,
      'jacket': 1500,
      'other': 1000
    };
    return basePrices[details.garmentType] || 1000;
  };

  const getEmbroideryPrice = () => {
    if (!customization.embroidery.enabled) return 0;
    const base = { machine: 300, hand: 800, zardosi: 1200, aari: 1000, bead: 900, thread: 500 };
    const perPlacement = { collar: 150, sleeves: 200, neckline: 250, hem: 300, full: 1200, custom: 300 };
    const perExtraColor = 50;
    const t = base[customization.embroidery.type] || 0;
    const p = (customization.embroidery.placements || []).reduce((sum, pl) => sum + (perPlacement[pl] || 0), 0);
    const extraColors = Math.max(0, (customization.embroidery.colors?.length || 0) - 1);
    return t + p + (extraColors * perExtraColor);
  };

  const getTotalPrice = () => {
    let total = getBasePrice();
    if (details.urgency === 'urgent') total += 500;
    if (!ownFabric && selectedFabric) total += autoFabricCost;
    if (customization.embroidery.enabled) total += getEmbroideryPrice();
    return total;
  };

  // Step validation functions
  const isStep1Valid = () => {
    return details.garmentType && details.expectedDelivery;
  };

  const isStep2Valid = () => {
    if (useSaved) {
      return selectedHistoryId || mhistory.length === 0;
    } else {
      // Check if required measurements are filled based on garment type
      const requiredFields = getRequiredMeasurementFields();
      return requiredFields.every(field => measurements[field] && measurements[field] !== '');
    }
  };

  const isStep3Valid = () => {
    if (ownFabric) {
      return ownFabricNotes.trim() !== '';
    } else {
      return selectedFabricId && fabricQty > 0;
    }
  };

  // Get measurement fields based on garment type - only show relevant measurements
  const getMeasurementFields = () => {
    const garmentType = details.garmentType?.toLowerCase();
    
    if (garmentType === 'shirt' || garmentType === 'blouse') {
      return {
        height: 'Height',
        chest: 'Chest',
        sleeve: 'Sleeve Length',
        shoulder: 'Shoulder Width',
        neck: 'Neck Size'
      };
    } else if (garmentType === 'pant' || garmentType === 'trouser' || garmentType === 'pants') {
      return {
        height: 'Height',
        waist: 'Waist',
        hips: 'Hip',
        legLength: 'Leg Length',
        thigh: 'Thigh'
      };
    } else if (garmentType === 'dress' || garmentType === 'gown') {
      return {
        height: 'Height',
        chest: 'Bust',
        waist: 'Waist',
        hips: 'Hip',
        sleeve: 'Sleeve Length',
        shoulder: 'Shoulder Width'
      };
    } else if (garmentType === 'suit' || garmentType === 'blazer') {
      return {
        height: 'Height',
        chest: 'Chest',
        waist: 'Waist',
        sleeve: 'Sleeve Length',
        shoulder: 'Shoulder Width',
        neck: 'Neck Size'
      };
    } else if (garmentType === 'kurta' || garmentType === 'kameez') {
      return {
        height: 'Height',
        chest: 'Chest',
        waist: 'Waist',
        sleeve: 'Sleeve Length',
        shoulder: 'Shoulder Width',
        neck: 'Neck Size'
      };
    }
    
    // Default measurements - only show essential ones
    return {
      height: 'Height',
      chest: 'Chest',
      waist: 'Waist',
      hips: 'Hip'
    };
  };

  const getRequiredMeasurementFields = () => {
    const commonFields = ['height'];
    const garmentType = details.garmentType?.toLowerCase();
    
    if (garmentType === 'shirt' || garmentType === 'blouse') {
      return [...commonFields, 'chest', 'sleeve', 'shoulder'];
    } else if (garmentType === 'pant' || garmentType === 'trouser' || garmentType === 'pants') {
      return [...commonFields, 'waist', 'hips', 'legLength'];
    } else if (garmentType === 'dress' || garmentType === 'gown') {
      return [...commonFields, 'chest', 'waist', 'hips'];
    } else if (garmentType === 'suit' || garmentType === 'blazer') {
      return [...commonFields, 'chest', 'waist', 'sleeve', 'shoulder'];
    } else if (garmentType === 'kurta' || garmentType === 'kameez') {
      return [...commonFields, 'chest', 'waist', 'sleeve', 'shoulder'];
    }
    
    // Default required fields
    return [...commonFields, 'chest', 'waist'];
  };

  // Get placeholder for measurement fields
  const getPlaceholderForField = (field) => {
    const placeholders = {
      height: '170',
      chest: '42',
      waist: '34',
      hips: '36',
      sleeve: '24',
      shoulder: '18',
      neck: '16',
      legLength: '32',
      thigh: '24',
      knee: '16',
      bust: '36',
      armhole: '18',
      length: '26'
    };
    return placeholders[field] || '0';
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep === 1 && !isStep1Valid()) {
      alert('Please fill in all required fields (Garment Type and Expected Delivery Date)');
      return;
    }
    if (currentStep === 2 && !isStep2Valid()) {
      alert('Please complete the measurements section');
      return;
    }
    if (currentStep === 3 && !isStep3Valid()) {
      alert('Please select fabric or provide fabric description');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    // Allow going back to previous steps
    if (step <= currentStep) {
      setCurrentStep(step);
    }
    // For forward steps, validate previous steps
    else if (step === 2 && isStep1Valid()) {
      setCurrentStep(step);
    } else if (step === 3 && isStep1Valid() && isStep2Valid()) {
      setCurrentStep(step);
    } else if (step === 4 && isStep1Valid() && isStep2Valid() && isStep3Valid()) {
      setCurrentStep(step);
    } else {
      alert('Please complete the previous steps first');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submission started...');
    
    if (saving) {
      console.log('⚠️ Already saving, ignoring submission');
      return;
    }
    
    setSaving(true);
    
    console.log('📝 Order data being submitted:', {
      garmentType: details.garmentType,
      expectedDelivery: details.expectedDelivery,
      fabric: ownFabric ? 'own fabric' : 'shop fabric',
      selectedFabricId,
      totalPrice: getTotalPrice(),
      measurements: useSaved ? 'using saved' : 'new measurements',
      customization: customization
    });
    
    // Check if required fields are filled
    if (!details.garmentType) {
      alert('Please select a garment type');
      setSaving(false);
      return;
    }
    if (!details.expectedDelivery) {
      alert('Please select expected delivery date');
      setSaving(false);
      return;
    }
    
    // ✅ VALIDATE MEASUREMENTS - CRITICAL FOR TAILORS!
    const finalMeasurements = useSaved ? 
      (mhistory.find(h => h._id === selectedHistoryId)?.measurements || {}) : 
      measurements;
    
    if (!finalMeasurements || Object.keys(finalMeasurements).length === 0) {
      alert('⚠️ MEASUREMENTS REQUIRED!\n\nPlease provide your measurements. The tailor needs measurements to stitch your garment.\n\nGo to Step 2: Measurements and fill in your measurements.');
      setSaving(false);
      setCurrentStep(2); // Navigate to measurements step
      return;
    }
    
    // Check if measurements have actual values (not all empty)
    const hasValidMeasurements = Object.values(finalMeasurements).some(val => 
      val && String(val).trim() !== '' && String(val).trim() !== '0'
    );
    
    if (!hasValidMeasurements) {
      alert('⚠️ INCOMPLETE MEASUREMENTS!\n\nYour measurements appear to be empty or incomplete.\n\nPlease fill in at least the basic measurements (chest, waist, length, etc.)');
      setSaving(false);
      setCurrentStep(2); // Navigate to measurements step
      return;
    }
    
    try {
      const payload = {
        garmentType: details.garmentType,
        sleeveType: customization.sleeveType,
        collarType: customization.collarType,
        hasButtons: customization.hasButtons,
        hasZippers: customization.hasZippers,
        requirements: customization.garmentOptions || {},
        specialInstructions: details.specialInstructions,
        expectedDelivery: details.expectedDelivery,
        measurements: finalMeasurements,
        fabric: ownFabric ? 
          { source: 'customer', notes: ownFabricNotes } : 
          { source: 'shop', fabricId: selectedFabricId, quantity: fabricQty },
        embroidery: emb.enabled ? {
          enabled: true,
          type: emb.type,
          placements: emb.placements,
          pattern: emb.pattern,
          colors: emb.colors,
          notes: emb.notes,
        } : { enabled: false }
      };

      console.log('📤 Sending order to API...');
      const { data: orderRes } = await axios.post('/api/portal/orders', payload);
      console.log('✅ Order created successfully:', orderRes);
      
      // Bill is now auto-generated by backend
      const billId = orderRes?.order?.bill || '';
      const billAmount = orderRes?.order?.totalAmount || getTotalPrice();
      
      console.log('💳 Using bill from order response:', { billId, billAmount });
      
      // Redirect directly to payments page for immediate payment
      const customerName = profile.customer?.name || profile.user?.name || '';
      const params = new URLSearchParams();
      if (customerName) params.set('customer', customerName);
      params.set('open', '1'); // Auto-open payment modal
      if (billId) params.set('bill', billId);
      if (billAmount) params.set('amount', String(billAmount));
      params.set('orderId', orderRes?.order?._id || '');
      params.set('autoPayment', '1'); // Auto-trigger Razorpay payment
      params.set('fromOrder', '1'); // Flag to show this came from order creation
      
      const paymentUrl = `/portal/payments?${params.toString()}`;
      console.log('🔄 Redirecting to payments page:', paymentUrl);
      navigate(paymentUrl);
    } catch (e1) {
      console.error('❌ Order creation failed:', e1);
      console.error('❌ Error details:', e1.response?.data || e1.message);
      alert(e1?.response?.data?.message || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="New Order"
      subtitle="Create a new stitching order with our streamlined process"
      actions={<><button className="secondary" onClick={() => navigate(-1)}>Back</button></>}
    >
      <div className="new-order-container">
        <form onSubmit={submit} className="order-form" id="new-order-form">
        {/* Progress Steps */}
        <div className="order-progress">
          <div className="progress-steps">
            <div 
              className={`step ${currentStep === 1 ? 'active' : ''} ${isStep1Valid() ? 'completed' : ''}`}
              onClick={() => goToStep(1)}
            >
              <div className="step-number">1</div>
              <div className="step-label">Order Details</div>
            </div>
            <div 
              className={`step ${currentStep === 2 ? 'active' : ''} ${isStep2Valid() ? 'completed' : ''}`}
              onClick={() => goToStep(2)}
            >
              <div className="step-number">2</div>
              <div className="step-label">Measurements</div>
            </div>
            <div 
              className={`step ${currentStep === 3 ? 'active' : ''} ${isStep3Valid() ? 'completed' : ''}`}
              onClick={() => goToStep(3)}
            >
              <div className="step-number">3</div>
              <div className="step-label">Fabric & Customization</div>
            </div>
            <div 
              className={`step ${currentStep === 4 ? 'active' : ''}`}
              onClick={() => goToStep(4)}
            >
              <div className="step-number">4</div>
              <div className="step-label">Review & Submit</div>
            </div>
          </div>
        </div>

        {/* Step 1: Order Details */}
        <div className={`order-step ${currentStep === 1 ? 'active' : ''}`}>
          <div className="step-header">
            <h3>Order Details</h3>
            <p>Tell us what you'd like to get stitched</p>
          </div>
          {/* High-priority: Large description just under the intro */}
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Design Description</label>
              <textarea 
                className="desc-textarea"
                placeholder="Describe your garment design, fabric preferences, style details, etc."
                value={details.specialInstructions}
                onChange={(e) => setDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Garment Type *</label>
              <select 
                value={details.garmentType} 
                onChange={(e) => setDetails(prev => ({ ...prev, garmentType: e.target.value }))}
                required
              >
                <option value="">Select garment type</option>
                <option value="shirt">Shirt</option>
                <option value="pants">Pants</option>
                <option value="suit">Suit</option>
                <option value="dress">Dress</option>
                <option value="kurta">Kurta</option>
                <option value="blouse">Blouse</option>
                <option value="lehenga">Lehenga</option>
                <option value="jacket">Jacket</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Expected Delivery Date *</label>
              <input 
                type="date" 
                value={details.expectedDelivery} 
                onChange={(e) => setDetails(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
              <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
                Minimum 7 days from today
              </small>
            </div>
            <div className="form-group full-width">
              <label>Urgency Level</label>
              <div className="urgency-simple">
                <label className="urgency-line">
                  <input
                    type="radio"
                    name="urgency"
                    value="normal"
                    checked={details.urgency === 'normal'}
                    onChange={(e) => setDetails(prev => ({ ...prev, urgency: e.target.value }))}
                  />
                  <span>Normal (Standard Delivery Time)</span>
                </label>
                <label className="urgency-line">
                  <input
                    type="radio"
                    name="urgency"
                    value="urgent"
                    checked={details.urgency === 'urgent'}
                    onChange={(e) => setDetails(prev => ({ ...prev, urgency: e.target.value }))}
                  />
                  <span>Urgent - Faster Delivery (+₹500 extra)</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="step-actions">
            <button 
              type="button" 
              className={`btn-primary ${isStep1Valid() ? 'completed' : ''}`}
              onClick={nextStep}
            >
              {isStep1Valid() ? '✓ Order Details Complete' : 'Next: Measurements →'}
            </button>
          </div>
        </div>

        {/* Step 2: Measurements */}
        <div className={`order-step ${currentStep === 2 ? 'active' : ''}`}>
          <div className="step-header">
            <h3>Measurements</h3>
            <p>Choose your measurement method</p>
          </div>
          
          <div className="measurement-options">
            <div className="option-card">
              <input 
                type="radio" 
                id="use-saved" 
                name="measurement-method" 
                checked={useSaved} 
                onChange={() => setUseSaved(true)}
              />
              <label htmlFor="use-saved" className="option-label">
                <div className="option-icon">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="option-content">
                  <h4>Use Saved Measurements</h4>
                  <p>Use your previously saved measurements</p>
                  {mhistory.length > 0 && (
                    <select 
                      value={selectedHistoryId} 
                      onChange={(e) => setSelectedHistoryId(e.target.value)}
                      className="history-select"
                    >
                      {mhistory.map(h => (
                        <option key={h._id} value={h._id}>
                          {new Date(h.createdAt).toLocaleDateString()} - {Object.keys(h.measurements || {}).length} measurements
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            </div>

            <div className="option-card">
              <input 
                type="radio" 
                id="enter-new" 
                name="measurement-method" 
                checked={!useSaved} 
                onChange={() => setUseSaved(false)}
              />
              <label htmlFor="enter-new" className="option-label">
                <div className="option-icon">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="option-content">
                  <h4>Enter New Measurements</h4>
                  <p>Provide fresh measurements for this order</p>
                </div>
              </label>
            </div>
          </div>

          {!useSaved && (
            <div className="measurements-form">
              <div className="measurement-note">
                <p><strong>Note:</strong> Required measurements vary by garment type. Please provide the measurements marked with *</p>
                {details.garmentType && (
                  <p className="garment-specific-note">
                    <strong>{details.garmentType.charAt(0).toUpperCase() + details.garmentType.slice(1)}</strong> requires: {getRequiredMeasurementFields().join(', ')}
                  </p>
                )}
              </div>
              
              <div className="form-grid">
                {/* Dynamic measurements based on garment type */}
                {Object.entries(getMeasurementFields()).map(([field, label]) => (
                  <div key={field} className="form-group">
                    <label>{label} (inches) {getRequiredMeasurementFields().includes(field) ? '*' : ''}</label>
                    <input 
                      type="number" 
                      value={measurements[field] || ''} 
                      onChange={(e) => setMeasurements(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={getPlaceholderForField(field)}
                      required={getRequiredMeasurementFields().includes(field)}
                    />
                  </div>
                ))}
              </div>

              <div className="measurement-notes">
                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea 
                    value={measurements.notes} 
                    onChange={(e) => setMeasurements(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special fitting requirements or notes..."
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Upload Photos (Optional)</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => setMeasurements(prev => ({ ...prev, photos: e.target.files }))}
                    className="file-input"
                  />
                  <p className="file-help">Upload reference photos for better fitting</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="step-actions">
            <button type="button" className="btn-secondary" onClick={prevStep}>
              ← Back: Order Details
            </button>
            <button 
              type="button" 
              className={`btn-primary ${isStep2Valid() ? 'completed' : ''}`}
              onClick={nextStep}
            >
              {isStep2Valid() ? '✓ Measurements Complete' : 'Next: Fabric & Customization →'}
            </button>
          </div>
        </div>

        {/* Step 3: Fabric & Customization */}
        <div className={`order-step ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-header">
            <h3>Fabric & Customization</h3>
            <p>Choose your fabric and any customizations</p>
          </div>
          
          <div className="fabric-section">
            <div className="fabric-options">
              <div className="option-card">
                <input 
                  type="radio" 
                  id="shop-fabric" 
                  name="fabric-source" 
                  checked={!ownFabric} 
                  onChange={() => setOwnFabric(false)}
                />
                <label htmlFor="shop-fabric" className="option-label">
                  <div className="option-icon">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="option-content">
                    <h4>Choose from Shop</h4>
                    <p>Select from our curated fabric collection</p>
                  </div>
                </label>
              </div>

              <div className="option-card">
                <input 
                  type="radio" 
                  id="own-fabric" 
                  name="fabric-source" 
                  checked={ownFabric} 
                  onChange={() => setOwnFabric(true)}
                />
                <label htmlFor="own-fabric" className="option-label">
                  <div className="option-icon">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="option-content">
                    <h4>Bring Your Own Fabric</h4>
                    <p>Use fabric you already have</p>
                  </div>
                </label>
              </div>
            </div>

            {!ownFabric && (
              <div className="fabric-selection">
                <div className="fabric-search-section">
                  <h4>Search & Filter Fabrics</h4>
                  
                  <div className="search-filters">
                    <div className="form-group">
                      <label>Search Fabrics</label>
                      <div className="search-input">
                        <input 
                          type="text" 
                          value={fabricQuery} 
                          onChange={(e) => {
                            setFabricQuery(e.target.value);
                            // Real-time filtering is handled by useEffect
                            setShowSuggestions(true);
                            setHighlightedSuggestion(-1);
                          }}
                          placeholder="Type fabric name (e.g., cotton, silk, linen)..."
                          onKeyDown={(e) => {
                            if (!showSuggestions || fabricTypeSuggestions.length === 0) return;
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setHighlightedSuggestion(prev => Math.min(prev + 1, fabricTypeSuggestions.length - 1));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setHighlightedSuggestion(prev => Math.max(prev - 1, 0));
                            } else if (e.key === 'Enter') {
                              if (highlightedSuggestion >= 0) {
                                e.preventDefault();
                                handleSuggestionSelect(fabricTypeSuggestions[highlightedSuggestion]);
                              }
                            } else if (e.key === 'Escape') {
                              setShowSuggestions(false);
                            }
                          }}
                        />
                        {showSuggestions && fabricTypeSuggestions.length > 0 && (
                          <ul className="suggestions-list">
                            {fabricTypeSuggestions.map((s, idx) => (
                              <li
                                key={s}
                                className={`suggestion-item ${idx === highlightedSuggestion ? 'highlighted' : ''}`}
                                onMouseDown={() => handleSuggestionSelect(s)}
                              >
                                {s}
                              </li>
                            ))}
                          </ul>
                        )}
                        <button type="button" onClick={searchFabrics} disabled={loadingFabrics || !fabricQuery.trim()}>
                          {loadingFabrics ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                      {fabricQuery && (
                        <p className="search-hint">Searching for: "{fabricQuery}"</p>
                      )}
                    </div>

                    {/* Type and Color filters removed as requested; autocomplete covers this */}
                  </div>
                </div>

                {loadingFabrics ? (
                  <div className="loading-fabrics">
                    <p>Loading fabrics...</p>
                  </div>
                ) : fabrics.length > 0 ? (
                  <div className="fabric-results">
                    {Object.entries(
                      fabrics.reduce((groups, fabric) => {
                        const key = fabric.material || fabric.type || 'Other';
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(fabric);
                        return groups;
                      }, {})
                    ).map(([materialType, fabricList]) => (
                      <div key={materialType} className="fabric-type-group">
                        <h4 className="fabric-type-header">{materialType} Fabrics</h4>
                        <div className="fabric-grid">
                          {fabricList.map(fabric => (
                            <div 
                              key={fabric._id} 
                              className={`fabric-card ${selectedFabricId === fabric._id ? 'selected' : ''}`}
                              onClick={() => setSelectedFabricId(fabric._id)}
                            >
                              <div className="fabric-color-swatch" style={{ 
                                backgroundColor: fabric.color?.toLowerCase() || '#e5e7eb',
                                border: '2px solid #d1d5db'
                              }} title={`Color: ${fabric.color || 'Not specified'}`}>
                              </div>
                              <div className="fabric-info">
                                <h5>{fabric.name}</h5>
                                <p className="fabric-color">
                                  <span className="color-dot" style={{ 
                                    backgroundColor: fabric.color?.toLowerCase() || '#999',
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    marginRight: '6px',
                                    border: '1px solid #ccc',
                                    verticalAlign: 'middle'
                                  }}></span>
                                  {fabric.color || 'Not specified'}
                                </p>
                                <p className="fabric-price">₹{fabric.price}/meter</p>
                                <p className="stock-info">Stock: {fabric.stock || 'Available'}</p>
                                {fabric.pattern && <p className="pattern-info">Pattern: {fabric.pattern}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-fabrics">
                    {!fabricQuery.trim() ? (
                      <p>🔍 Start typing in the search box above to find fabrics...</p>
                    ) : (
                      <p>No fabrics match your search. Try different keywords.</p>
                    )}
                  </div>
                )}

                {selectedFabricId && (
                  <div className="fabric-quantity">
                    <label>Quantity (meters)</label>
                    <input 
                      type="number" 
                      value={fabricQty} 
                      onChange={(e) => setFabricQty(e.target.value)}
                      min="1"
                      max={selectedFabric?.stock || 999}
                    />
                    {stockWarning && <p className="warning">{stockWarning}</p>}
                  </div>
                )}
              </div>
            )}

            {ownFabric && (
              <div className="own-fabric-form">
                <div className="form-group">
                  <label>Fabric Description</label>
                  <textarea 
                    value={ownFabricNotes} 
                    onChange={(e) => setOwnFabricNotes(e.target.value)}
                    placeholder="Describe your fabric: material, color, pattern, etc."
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Customization Options */}
            <div className="customization-section">
              <h4>Customization Options</h4>
              {details.garmentType && (
                <div className="garment-note" style={{ marginBottom: 12, color: '#64748b' }}>
                  Options below are tailored for: <strong>{details.garmentType.charAt(0).toUpperCase() + details.garmentType.slice(1)}</strong>
                </div>
              )}
              
              {/* Collar Type (hidden for pants) */}
              {!(details.garmentType?.toLowerCase() === 'pant' || details.garmentType?.toLowerCase() === 'pants' || details.garmentType?.toLowerCase() === 'trouser') && (
                <div className="customization-group">
                  <label>Collar Type</label>
                  <div className="option-grid">
                    <label className="customization-option">
                      <input 
                        type="radio" 
                        name="collarType" 
                        value="normal" 
                        checked={customization.collarType === 'normal'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, collarType: e.target.value }))}
                      />
                      <span className="radio-custom"></span>
                      <span>Normal</span>
                    </label>
                    <label className="customization-option">
                      <input 
                        type="radio" 
                        name="collarType" 
                        value="mandarin" 
                        checked={customization.collarType === 'mandarin'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, collarType: e.target.value }))}
                      />
                      <span className="radio-custom"></span>
                      <span>Mandarin</span>
                    </label>
                    <label className="customization-option">
                      <input 
                        type="radio" 
                        name="collarType" 
                        value="designer" 
                        checked={customization.collarType === 'designer'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, collarType: e.target.value }))}
                      />
                      <span className="radio-custom"></span>
                      <span>Designer</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Sleeve Type (hidden for pants) */}
              {!(details.garmentType?.toLowerCase() === 'pant' || details.garmentType?.toLowerCase() === 'pants' || details.garmentType?.toLowerCase() === 'trouser') && (
                <div className="customization-group">
                  <label>Sleeve Type</label>
                  <div className="option-grid">
                    <label className="customization-option">
                      <input 
                        type="radio" 
                        name="sleeveType" 
                        value="full" 
                        checked={customization.sleeveType === 'full'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, sleeveType: e.target.value }))}
                      />
                      <span className="radio-custom"></span>
                      <span>Full Sleeve</span>
                    </label>
                    <label className="customization-option">
                      <input 
                        type="radio" 
                        name="sleeveType" 
                        value="half" 
                        checked={customization.sleeveType === 'half'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, sleeveType: e.target.value }))}
                      />
                      <span className="radio-custom"></span>
                      <span>Half Sleeve</span>
                    </label>
                    <label className="customization-option">
                      <input 
                        type="radio" 
                        name="sleeveType" 
                        value="sleeveless" 
                        checked={customization.sleeveType === 'sleeveless'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, sleeveType: e.target.value }))}
                      />
                      <span className="radio-custom"></span>
                      <span>Sleeveless</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Buttons & Zippers (hidden for pants to avoid duplication with fly type) */}
              {!(details.garmentType?.toLowerCase() === 'pant' || details.garmentType?.toLowerCase() === 'pants' || details.garmentType?.toLowerCase() === 'trouser') && (
                <div className="customization-group">
                  <label>Additional Features</label>
                  <div className="checkbox-group">
                    <label className="checkbox-option">
                      <input 
                        type="checkbox" 
                        checked={customization.hasButtons}
                        onChange={(e) => setCustomization(prev => ({ ...prev, hasButtons: e.target.checked }))}
                      />
                      <span className="checkbox-custom"></span>
                      <span>Buttons</span>
                    </label>
                    <label className="checkbox-option">
                      <input 
                        type="checkbox" 
                        checked={customization.hasZippers}
                        onChange={(e) => setCustomization(prev => ({ ...prev, hasZippers: e.target.checked }))}
                      />
                      <span className="checkbox-custom"></span>
                      <span>Zippers</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Garment-specific requirements: Pants */}
              {(details.garmentType?.toLowerCase() === 'pant' || details.garmentType?.toLowerCase() === 'pants' || details.garmentType?.toLowerCase() === 'trouser') && (
                <div className="customization-group">
                  <label>Pants Requirements</label>
                  <div className="option-grid">
                    <div className="form-group">
                      <label>Waistband</label>
                      <select
                        value={customization.garmentOptions.waistband || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, waistband: e.target.value } }))}
                      >
                        <option value="">Select</option>
                        <option value="regular">Regular</option>
                        <option value="elastic">Elastic</option>
                        <option value="adjustable">Adjustable</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hem Style</label>
                      <select
                        value={customization.garmentOptions.hemStyle || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, hemStyle: e.target.value } }))}
                      >
                        <option value="">Select</option>
                        <option value="plain">Plain</option>
                        <option value="cuffed">Cuffed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fit</label>
                      <select
                        value={customization.garmentOptions.fit || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, fit: e.target.value } }))}
                      >
                        <option value="">Select</option>
                        <option value="slim">Slim</option>
                        <option value="regular">Regular</option>
                        <option value="relaxed">Relaxed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pleats</label>
                      <select
                        value={customization.garmentOptions.pleats || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, pleats: e.target.value } }))}
                      >
                        <option value="none">None</option>
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fly Type</label>
                      <select
                        value={customization.garmentOptions.flyType || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, flyType: e.target.value } }))}
                      >
                        <option value="">Select</option>
                        <option value="zipper">Zipper</option>
                        <option value="button">Button</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Belt Loops</label>
                      <select
                        value={customization.garmentOptions.beltLoops || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, beltLoops: e.target.value } }))}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pockets</label>
                      <div className="checkbox-group">
                        {['side','back','coin'].map(pk => (
                          <label key={pk} className="checkbox-option">
                            <input
                              type="checkbox"
                              checked={(customization.garmentOptions.pockets || []).includes(pk)}
                              onChange={(e) => {
                                const current = customization.garmentOptions.pockets || [];
                                const next = e.target.checked ? [...current, pk] : current.filter(x => x !== pk);
                                setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, pockets: next } }));
                              }}
                            />
                            <span className="checkbox-custom"></span>
                            <span>{pk.charAt(0).toUpperCase() + pk.slice(1)} Pocket</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Garment-specific requirements: Shirt */}
              {details.garmentType?.toLowerCase() === 'shirt' && (
                <div className="customization-group">
                  <label>Shirt Requirements</label>
                  <div className="option-grid">
                    <div className="form-group">
                      <label>Pocket</label>
                      <select
                        value={customization.garmentOptions.pocket || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, pocket: e.target.value } }))}
                      >
                        <option value="none">None</option>
                        <option value="one">One</option>
                        <option value="two">Two</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Cuff Style</label>
                      <select
                        value={customization.garmentOptions.cuff || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, cuff: e.target.value } }))}
                      >
                        <option value="button">Button</option>
                        <option value="french">French</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Placket</label>
                      <select
                        value={customization.garmentOptions.placket || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, placket: e.target.value } }))}
                      >
                        <option value="standard">Standard</option>
                        <option value="concealed">Concealed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fit</label>
                      <select
                        value={customization.garmentOptions.fit || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, fit: e.target.value } }))}
                      >
                        <option value="slim">Slim</option>
                        <option value="regular">Regular</option>
                        <option value="relaxed">Relaxed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Garment-specific requirements: Blouse */}
              {details.garmentType?.toLowerCase() === 'blouse' && (
                <div className="customization-group">
                  <label>Blouse Requirements (Optional)</label>
                  <div className="option-grid">
                    <div className="form-group">
                      <label>Blouse Style</label>
                      <select
                        value={customization.garmentOptions.blouseStyle || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, blouseStyle: e.target.value } }))}
                      >
                        <option value="">Select Style</option>
                        <option value="regular">Regular</option>
                        <option value="crop">Crop Top</option>
                        <option value="peplum">Peplum</option>
                        <option value="wrap">Wrap Style</option>
                        <option value="tie-up">Tie-up Back</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Back Style</label>
                      <select
                        value={customization.garmentOptions.backStyle || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, backStyle: e.target.value } }))}
                      >
                        <option value="">Select Back</option>
                        <option value="regular">Regular</option>
                        <option value="tie-up">Tie-up</option>
                        <option value="button">Button Back</option>
                        <option value="zip">Zipper Back</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fit</label>
                      <select
                        value={customization.garmentOptions.fit || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, fit: e.target.value } }))}
                      >
                        <option value="">Select Fit</option>
                        <option value="loose">Loose</option>
                        <option value="regular">Regular</option>
                        <option value="fitted">Fitted</option>
                        <option value="tight">Tight</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Length</label>
                      <select
                        value={customization.garmentOptions.length || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, garmentOptions: { ...prev.garmentOptions, length: e.target.value } }))}
                      >
                        <option value="">Select Length</option>
                        <option value="short">Short</option>
                        <option value="regular">Regular</option>
                        <option value="long">Long</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Embroidery Options */}
              <div className="customization-group">
                <label>Embroidery/Patterns</label>
                <div className="embroidery-options">
                  <label className="checkbox-option">
                    <input 
                      type="checkbox" 
                      checked={customization.embroidery.enabled}
                      onChange={(e) => setCustomization(prev => ({ 
                        ...prev, 
                        embroidery: { ...prev.embroidery, enabled: e.target.checked }
                      }))}
                    />
                    <span className="checkbox-custom"></span>
                    <span>Add Embroidery</span>
                  </label>

                  {customization.embroidery.enabled && (
                    <div className="embroidery-details">
                      <div className="form-group">
                        <label>Embroidery Type</label>
                        <select 
                          value={customization.embroidery.type}
                          onChange={(e) => setCustomization(prev => ({ 
                            ...prev, 
                            embroidery: { ...prev.embroidery, type: e.target.value }
                          }))}
                        >
                          <option value="machine">Machine Embroidery</option>
                          <option value="hand">Hand Embroidery</option>
                          <option value="zardosi">Zardosi Work</option>
                          <option value="aari">Aari Work</option>
                          <option value="bead">Bead Work</option>
                          <option value="thread">Thread Work</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Placement</label>
                        <div className="placement-grid">
                          {['collar', 'sleeves', 'neckline', 'hem', 'full', 'custom'].map(placement => (
                            <label key={placement} className="placement-option">
                              <input 
                                type="checkbox" 
                                checked={customization.embroidery.placements.includes(placement)}
                                onChange={(e) => {
                                  const newPlacements = e.target.checked 
                                    ? [...customization.embroidery.placements, placement]
                                    : customization.embroidery.placements.filter(p => p !== placement);
                                  setCustomization(prev => ({ 
                                    ...prev, 
                                    embroidery: { ...prev.embroidery, placements: newPlacements }
                                  }));
                                }}
                              />
                              <span className="checkbox-custom"></span>
                              <span>{placement.charAt(0).toUpperCase() + placement.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Pattern</label>
                        <select 
                          value={customization.embroidery.pattern}
                          onChange={(e) => setCustomization(prev => ({ 
                            ...prev, 
                            embroidery: { ...prev.embroidery, pattern: e.target.value }
                          }))}
                        >
                          <option value="floral">Floral</option>
                          <option value="geometric">Geometric</option>
                          <option value="custom">Custom Design</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Colors</label>
                        <div className="color-grid">
                          {['gold', 'silver', 'red', 'blue', 'green', 'black', 'white'].map(color => (
                            <label key={color} className="color-option">
                              <input 
                                type="checkbox" 
                                checked={customization.embroidery.colors.includes(color)}
                                onChange={(e) => {
                                  const newColors = e.target.checked 
                                    ? [...customization.embroidery.colors, color]
                                    : customization.embroidery.colors.filter(c => c !== color);
                                  setCustomization(prev => ({ 
                                    ...prev, 
                                    embroidery: { ...prev.embroidery, colors: newColors }
                                  }));
                                }}
                              />
                              <span className="color-swatch" style={{ backgroundColor: color }}></span>
                              <span>{color.charAt(0).toUpperCase() + color.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Embroidery Notes</label>
                        <textarea 
                          value={customization.embroidery.notes}
                          onChange={(e) => setCustomization(prev => ({ 
                            ...prev, 
                            embroidery: { ...prev.embroidery, notes: e.target.value }
                          }))}
                          placeholder="Any specific embroidery requirements..."
                          rows="2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="step-actions">
            <button type="button" className="btn-secondary" onClick={prevStep}>
              ← Back: Measurements
            </button>
            <button 
              type="button" 
              className={`btn-primary ${isStep3Valid() ? 'completed' : ''}`}
              onClick={nextStep}
            >
              {isStep3Valid() ? '✓ Fabric & Customization Complete' : 'Next: Review & Submit →'}
            </button>
          </div>
        </div>

        {/* Step 4: Review & Submit */}
        <div className={`order-step ${currentStep === 4 ? 'active' : ''}`}>
          <div className="step-header">
            <h3>Review & Submit</h3>
            <p>Review your order details and submit</p>
          </div>
          
          <div className="order-summary">
            <div className="summary-section">
              <h4>Order Details</h4>
              <div className="summary-item">
                <span>Garment Type:</span>
                <span>{details.garmentType || 'Not selected'}</span>
              </div>
              <div className="summary-item">
                <span>Expected Delivery:</span>
                <span>{details.expectedDelivery ? new Date(details.expectedDelivery).toLocaleDateString() : 'Not set'}</span>
              </div>
              {details.specialInstructions && (
                <div className="summary-item">
                  <span>Special Instructions:</span>
                  <span>{details.specialInstructions}</span>
                </div>
              )}
            </div>

            <div className="summary-section">
              <h4>Measurements</h4>
              {useSaved ? (
                <div className="summary-item">
                  <span>Using saved measurements from:</span>
                  <span>{mhistory.find(h => h._id === selectedHistoryId)?.createdAt ? new Date(mhistory.find(h => h._id === selectedHistoryId).createdAt).toLocaleDateString() : 'Latest'}</span>
                </div>
              ) : (
                <div className="measurements-summary">
                  {Object.entries(measurements).map(([key, value]) => (
                    value && (
                      <div key={key} className="summary-item">
                        <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                        <span>{value}</span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            <div className="summary-section">
              <h4>Fabric</h4>
              {ownFabric ? (
                <div className="summary-item">
                  <span>Bringing own fabric:</span>
                  <span>{ownFabricNotes || 'No description provided'}</span>
                </div>
              ) : (
                <div className="summary-item">
                  <span>Selected fabric:</span>
                  <span>{selectedFabric ? `${selectedFabric.name} (${fabricQty} meters)` : 'No fabric selected'}</span>
                </div>
              )}
            </div>

            <div className="summary-section">
              <h4>Customization</h4>
              <div className="summary-item">
                <span>Collar Type:</span>
                <span>{customization.collarType || 'Not selected'}</span>
              </div>
              <div className="summary-item">
                <span>Sleeve Type:</span>
                <span>{customization.sleeveType || 'Not selected'}</span>
              </div>
              {Object.keys(customization.garmentOptions || {}).length > 0 && (
                <div className="summary-item" style={{ display:'block' }}>
                  <span>Requirements:</span>
                  <div style={{ marginTop: 6 }}>
                    {Object.entries(customization.garmentOptions).map(([k,v]) => (
                      <div key={k} style={{ color:'#374151' }}>
                        {k}: {Array.isArray(v) ? v.join(', ') : (v || '-')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {customization.hasButtons && (
                <div className="summary-item">
                  <span>Features:</span>
                  <span>Buttons</span>
                </div>
              )}
              {customization.hasZippers && (
                <div className="summary-item">
                  <span>Features:</span>
                  <span>Zippers</span>
                </div>
              )}
              {customization.embroidery.enabled && (
                <div className="summary-item">
                  <span>Embroidery:</span>
                  <span>{customization.embroidery.type} - {customization.embroidery.placements.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="summary-section price-summary">
              <h4>Price Estimation</h4>
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Base Stitching:</span>
                  <span>₹{getBasePrice()}</span>
                </div>
                {details.urgency === 'urgent' && (
                  <div className="price-item urgent">
                    <span>Urgent Delivery:</span>
                    <span>+₹500</span>
                  </div>
                )}
                {!ownFabric && selectedFabric && (
                  <div className="price-item">
                    <span>Fabric Cost:</span>
                    <span>₹{autoFabricCost}</span>
                  </div>
                )}
                {customization.embroidery.enabled && (
                  <div className="price-item">
                    <span>Embroidery:</span>
                    <span>₹{getEmbroideryPrice()}</span>
                  </div>
                )}
                <div className="price-total">
                  <span>Estimated Total:</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={prevStep}>
              ← Back: Fabric & Customization
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary btn-primary-cta" 
              disabled={saving}
              onClick={async (e) => {
                e.preventDefault(); // Prevent default form submission
                console.log('🖱️ Create Order & Pay button clicked');
                
                if (saving) {
                  console.log('⚠️ Already saving, ignoring click');
                  return;
                }
                
                console.log('🖱️ Form data check:', {
                  garmentType: details.garmentType,
                  expectedDelivery: details.expectedDelivery,
                  currentStep: currentStep,
                  totalPrice: getTotalPrice()
                });
                
                // Check required fields
                if (!details.garmentType) {
                  alert('Please select a garment type');
                  return;
                }
                if (!details.expectedDelivery) {
                  alert('Please select expected delivery date');
                  return;
                }
                
                // Directly call the submit function
                console.log('🚀 Starting order creation...');
                await submit(e);
              }}
            >
              {saving ? 'Creating Order...' : 'Create Order & Pay'}
            </button>
          </div>
        </div>
        </form>
      </div>
    </DashboardLayout>
  );
}