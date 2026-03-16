import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import './Measurements.css';
import { FaTshirt, FaSlidersH, FaQuestionCircle, FaMagic, FaRuler, FaCheckCircle, FaLock, FaRobot, FaCamera } from 'react-icons/fa';
import { GiTrousers } from 'react-icons/gi';
import mlService from '../../services/mlService';
import WebcamBodyScanner from '../../components/WebcamBodyScanner';

export default function MeasurementsPage() {
  const [data, setData] = useState({ current: {}, history: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('IN'); // IN or CM
  const [activeField, setActiveField] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [annotatedImage, setAnnotatedImage] = useState(null);

  // Default values for ML prediction if not available in current measurements
  const [mlInputs, setMlInputs] = useState({
    height_cm: 170,
    weight_kg: 70,
    shoulder_width_cm: 45
  });

  const handlePredictMeasurements = async (webcamImage = null) => {
    setPredicting(true);
    if (webcamImage) setShowWebcam(false);
    
    console.log('Sending prediction request with:', {
      height: mlInputs.height_cm,
      weight: mlInputs.weight_kg,
      shoulder: mlInputs.shoulder_width_cm,
      hasImage: !!webcamImage
    });

    try {
      const result = await mlService.predictBodyMeasurements(
        mlInputs.height_cm,
        mlInputs.weight_kg,
        webcamImage ? null : mlInputs.shoulder_width_cm,
        webcamImage
      );

      if (result.success) {
        const { chest_cm, waist_cm, hips_cm, shoulder_cm, annotated_image } = result.data;
        
        // Update annotated image if available
        if (annotated_image) {
          setAnnotatedImage(annotated_image);
        }

        // Update shoulder width if it was detected from image
        if (shoulder_cm) {
          setMlInputs(prev => ({ ...prev, shoulder_width_cm: shoulder_cm }));
        }
        
        // Convert to current unit if necessary
        const factor = unit === 'IN' ? 0.393701 : 1;
        
        setData(d => ({
          ...d,
          current: {
            ...d.current,
            chest: (chest_cm * factor).toFixed(2),
            waist: (waist_cm * factor).toFixed(2),
            hips: (hips_cm * factor).toFixed(2)
          }
        }));
        
        alert('✨ AI successfully estimated your measurements!');
      } else {
        alert('❌ AI Prediction failed: ' + result.error);
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setPredicting(false);
    }
  };

  const handleMlInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : Number(value);
    console.log(`ML input change: ${name} = ${numValue}`);
    setMlInputs(prev => ({ ...prev, [name]: numValue }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/portal/measurements');
        setData({ 
          current: data.current || {
            shoulderSlope: 'Normal',
            postureProfile: 'Standard / Erect',
            armholeFit: 'Standard'
          }, 
          history: data.history || [], 
          styleNotes: data.styleNotes || '' 
        });
      } catch {
        setData({ 
          current: {
            shoulderSlope: 'Normal',
            postureProfile: 'Standard / Erect',
            armholeFit: 'Standard'
          }, 
          history: [] 
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const m = data.current || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(d => ({ ...d, current: { ...d.current, [name]: value } }));
  };

  const handleFitPreference = (value) => {
    setData(d => ({ ...d, current: { ...d.current, armholeFit: value } }));
  };

  const save = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        measurements: {
          ...m,
          // Numeric fields
          neck: m.neck === '' ? undefined : Number(m.neck),
          chest: m.chest === '' ? undefined : Number(m.chest),
          upperWaist: m.upperWaist === '' ? undefined : Number(m.upperWaist),
          sleeve: m.sleeve === '' ? undefined : Number(m.sleeve),
          waist: m.waist === '' ? undefined : Number(m.waist),
          hips: m.hips === '' ? undefined : Number(m.hips),
          inseam: m.inseam === '' ? undefined : Number(m.inseam),
          outseam: m.outseam === '' ? undefined : Number(m.outseam),
        },
        styleNotes: data.styleNotes || '',
      };
      
      await axios.put('/api/portal/measurements', payload);
      const { data: fresh } = await axios.get('/api/portal/measurements');
      setData({ 
        current: fresh.current || {}, 
        history: fresh.history || [],
        styleNotes: fresh.styleNotes || ''
      });
      alert('✅ Measurements updated successfully!');
    } catch (e) {
      const errorMessage = e?.response?.data?.message || 'Failed to save';
      setError(errorMessage);
      alert('❌ Error: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const lastUpdated = data.history?.[0]?.createdAt 
    ? new Date(data.history[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 24, 2023';

  return (
    <DashboardLayout title="My Measurements">
      <div className="measurements-page-v2">
        {loading ? (
          <div className="loading-v2">Loading your profile...</div>
        ) : (
          <>
            {/* Header Area */}
            <div className="header-v2">
              <div className="header-left-v2">
                <h1 className="title-v2">My Measurements</h1>
                <p className="updated-v2">Last Updated: {lastUpdated}</p>
              </div>
              <div className="header-actions-v2">
                <button className="btn-secondary-v2">
                  <FaQuestionCircle /> How to measure yourself
                </button>
                <button className="btn-primary-v2">
                  <FaMagic /> Request Pro-Fitting
                </button>
              </div>
            </div>

            <div className="main-grid-v2">
              {/* Left Column - Anatomical Guide */}
              <div className="anatomical-card-v2">
                <div className="card-header-v2">
                  <span className="label-v2">ANATOMICAL GUIDE</span>
                  <div className="unit-toggle-v2">
                    <button className={unit === 'IN' ? 'active' : ''} onClick={() => setUnit('IN')}>IN</button>
                    <button className={unit === 'CM' ? 'active' : ''} onClick={() => setUnit('CM')}>CM</button>
                  </div>
                </div>
                
                <div className="body-guide-v2">
                  <div className="body-svg-container">
                    {annotatedImage ? (
                      <div className="annotated-image-container">
                        <img src={annotatedImage} alt="Body scan" className="annotated-img" />
                        <button className="reset-scan-btn" onClick={() => setAnnotatedImage(null)}>
                          <FaSync /> Reset Scan
                        </button>
                      </div>
                    ) : (
                      <svg viewBox="0 0 200 400" className="body-svg">
                        {/* Simplified body outline/proxy */}
                        <path d="M100 50 L130 80 L140 150 L130 250 L120 350 L80 350 L70 250 L60 150 L70 80 Z" 
                              fill="none" stroke="#ff4d8d" strokeWidth="1" strokeOpacity="0.3" />
                        <circle cx="100" cy="70" r="4" fill="#ff4d8d" className={activeField === 'neck' ? 'active-dot' : ''} />
                        <circle cx="80" cy="110" r="4" fill="#ff4d8d" className={activeField === 'chest' ? 'active-dot' : ''} />
                        <circle cx="120" cy="110" r="4" fill="#ff4d8d" className={activeField === 'chest' ? 'active-dot' : ''} />
                        <circle cx="100" cy="130" r="4" fill="#ff4d8d" className={activeField === 'upperWaist' ? 'active-dot' : ''} />
                      </svg>
                    )}
                  </div>
                  
                  {/* AI Prediction Tool in anatomical guide */}
                  <div className="ai-predictor-card-v2">
                    <h4><FaRobot /> AI Measurement Predictor</h4>
                    <p>Scan with webcam or enter stats to estimate sizes.</p>
                    <div className="ai-input-row-v2">
                      <div className="ai-field-v2">
                        <label>Height (cm)</label>
                        <input name="height_cm" type="number" step="1" value={mlInputs.height_cm || ''} onChange={handleMlInputChange} />
                      </div>
                      <div className="ai-field-v2">
                        <label>Weight (kg)</label>
                        <input name="weight_kg" type="number" step="0.1" value={mlInputs.weight_kg || ''} onChange={handleMlInputChange} />
                      </div>
                      <div className="ai-field-v2">
                        <label>Shoulder (cm)</label>
                        <input name="shoulder_width_cm" type="number" step="0.1" value={mlInputs.shoulder_width_cm || ''} onChange={handleMlInputChange} />
                      </div>
                    </div>
                    
                    <div className="ai-action-buttons-v2">
                      <button 
                        className="btn-ai-webcam-v2" 
                        onClick={() => setShowWebcam(true)}
                        disabled={predicting}
                      >
                        <FaCamera /> Scan Body
                      </button>
                      <button 
                        className="btn-ai-predict-v2" 
                        onClick={() => handlePredictMeasurements()}
                        disabled={predicting}
                      >
                        {predicting ? '...' : 'Predict'}
                      </button>
                    </div>
                  </div>

                  <div className="guide-footer-v2">
                    {annotatedImage ? "Pose detected! Measurements updated." : "Click an input field to highlight the measurement zone."}
                  </div>
                </div>

                {showWebcam && (
                  <WebcamBodyScanner 
                    onCapture={handlePredictMeasurements} 
                    onClose={() => setShowWebcam(false)} 
                  />
                )}
              </div>

              {/* Right Column - Input Sections */}
              <div className="inputs-column-v2">
                {/* Top Measurements */}
                <div className="input-card-v2">
                  <div className="card-title-v2">
                    <div className="icon-bg-v2 pink"><FaTshirt /></div>
                    <h3>Top Measurements</h3>
                  </div>
                  <div className="input-grid-v2">
                    <MeasurementInput 
                      label="Neck Circumference" 
                      name="neck" 
                      value={m.neck} 
                      onChange={handleChange}
                      onFocus={() => setActiveField('neck')}
                    />
                    <MeasurementInput 
                      label="Chest Width" 
                      name="chest" 
                      value={m.chest} 
                      onChange={handleChange}
                      onFocus={() => setActiveField('chest')}
                    />
                    <MeasurementInput 
                      label="Upper Waist" 
                      name="upperWaist" 
                      value={m.upperWaist} 
                      onChange={handleChange}
                      onFocus={() => setActiveField('upperWaist')}
                    />
                    <MeasurementInput 
                      label="Sleeve Length" 
                      name="sleeve" 
                      value={m.sleeve} 
                      onChange={handleChange}
                      onFocus={() => setActiveField('sleeve')}
                    />
                  </div>
                </div>

                {/* Bottom Measurements */}
                <div className="input-card-v2">
                  <div className="card-title-v2">
                    <div className="icon-bg-v2 pink"><GiTrousers /></div>
                    <h3>Bottom Measurements</h3>
                  </div>
                  <div className="input-grid-v2">
                    <MeasurementInput 
                      label="Waist (Pant Line)" 
                      name="waist" 
                      value={m.waist} 
                      onChange={handleChange}
                      onFocus={() => setActiveField('waist')}
                    />
                    <MeasurementInput 
                      label="Hip Circumference" 
                      name="hips" 
                      value={m.hips} 
                      onChange={handleChange}
                      onFocus={() => setActiveField('hips')}
                    />
                    <MeasurementInput 
                      label="Inseam" 
                      name="inseam" 
                      value={m.inseam} 
                      onChange={handleChange}
                      onFocus={() => setActiveField('inseam')}
                    />
                    <MeasurementInput 
                      label="Outseam" 
                      name="outseam" 
                      value={m.outseam} 
                      onChange={handleChange}
                      onFocus={() => setActiveField('outseam')}
                    />
                  </div>
                </div>

                {/* Special Adjustments */}
                <div className="input-card-v2">
                  <div className="card-title-v2">
                    <div className="icon-bg-v2 pink"><FaSlidersH /></div>
                    <h3>Special Adjustments</h3>
                  </div>
                  <div className="input-grid-v2">
                    <div className="select-group-v2">
                      <label>Shoulder Slope</label>
                      <select name="shoulderSlope" value={m.shoulderSlope} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Steep">Steep</option>
                        <option value="Flat">Flat</option>
                      </select>
                    </div>
                    <div className="select-group-v2">
                      <label>Posture Profile</label>
                      <select name="postureProfile" value={m.postureProfile} onChange={handleChange}>
                        <option value="Standard / Erect">Standard / Erect</option>
                        <option value="Stooped">Stooped</option>
                        <option value="Leaning Back">Leaning Back</option>
                      </select>
                    </div>
                  </div>
                  <div className="fit-preference-v2">
                    <label>Armhole Fit Preference</label>
                    <div className="segmented-control-v2">
                      {['Standard', 'High/Tight', 'Deep/Loose'].map(pref => (
                        <button 
                          key={pref}
                          className={m.armholeFit === pref ? 'active' : ''}
                          onClick={() => handleFitPreference(pref)}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bottom-bar-v2">
              <button className="btn-update-v2" onClick={save} disabled={saving}>
                {saving ? 'Updating...' : 'Update Measurements'}
              </button>
              <div className="security-note-v2">
                <FaLock /> Your data is secured with AES-256 encryption.
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function MeasurementInput({ label, name, value, onChange, onFocus }) {
  return (
    <div className="m-input-group-v2">
      <label>{label}</label>
      <input 
        name={name}
        type="number" 
        step="0.01" 
        placeholder="0.00"
        value={value ?? ''} 
        onChange={onChange}
        onFocus={onFocus}
      />
    </div>
  );
}
