import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  FaCloudUploadAlt, 
  FaClock, 
  FaRobot, 
  FaSearch,
  FaPlus,
  FaBell,
  FaStore,
  FaShoppingBag,
  FaPaperPlane,
  FaInfoCircle,
  FaRegFileAlt,
  FaTshirt,
  FaChevronRight,
  FaChevronLeft,
  FaUndo,
  FaSync,
  FaMinus,
  FaMagic,
  FaCheck
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'react-toastify';
import './NewOrder.css';

const shapeRecommendations = {
  'Hourglass': {
    text: "Your balanced proportions and defined waist are perfect for wrap dresses and belted styles.",
    styles: ["V-necks", "Wrap Dresses", "High-waisted skirts"],
    defaults: { silhouette: 'Sheath', neckline: 'V-Neck', sleeve: 'Sleeveless' }
  },
  'Pear': {
    text: "Balance your hips by adding volume to your top half with statement sleeves or boat necks.",
    styles: ["Boat necks", "Ruffled tops", "A-line skirts"],
    defaults: { silhouette: 'A-Line', neckline: 'Boat', sleeve: 'Short Sleeve' }
  },
  'Apple': {
    text: "Empire waists and V-necks will help elongate your torso and draw attention to your face.",
    styles: ["Empire waist", "V-necks", "Structured jackets"],
    defaults: { silhouette: 'Empire', neckline: 'V-Neck', sleeve: '3/4 Sleeve' }
  },
  'Rectangle': {
    text: "Create the illusion of curves with sweetheart necklines and peplum tops.",
    styles: ["Sweetheart neckline", "Peplum tops", "Flared skirts"],
    defaults: { silhouette: 'Mermaid', neckline: 'Sweetheart', sleeve: 'Short Sleeve' }
  },
  'Inverted Triangle': {
    text: "Softening your shoulder line with V-necks and adding volume to your lower half works best.",
    styles: ["V-necks", "Full skirts", "Wide-leg pants"],
    defaults: { silhouette: 'A-Line', neckline: 'V-Neck', sleeve: 'Full Sleeve' }
  }
};

export default function PortalNewOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [profile, setProfile] = useState({ user: null, customer: null });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Details, 2: Studio, 3: Timeline
  
  // Customization Studio State
  const [activeTab, setActiveTab] = useState('Design');
  const [silhouette, setSilhouette] = useState('A-Line');
  const [neckline, setNeckline] = useState('Sweetheart');
  const [sleeve, setSleeve] = useState('Sleeveless');

  // Form fields (Moved up to avoid initialization error)
  const [garmentType, setGarmentType] = useState('Saree');
  const [occasion, setOccasion] = useState('Wedding Guest');
  const [description, setDescription] = useState('');
  const [materialSource, setMaterialSource] = useState('catalog'); // 'catalog' or 'own'
  const [fabricQuery, setFabricQuery] = useState('');
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [priority, setPriority] = useState('standard');
  const [measurementMode, setMeasurementMode] = useState('saved'); // 'saved' or 'new'
  const [measurements, setMeasurements] = useState({});
  
  // Advanced Customization State
  const [hasLining, setHasLining] = useState(false);
  const [hasEmbroidery, setHasEmbroidery] = useState(false);
  const [embroideryDetails, setEmbroideryDetails] = useState({
    type: 'Zardosi',
    method: 'Hand',
    placement: 'Neckline',
    pattern: 'Floral'
  });
  
  // Dynamic Pricing Logic - Fixed percentages for each priority level
  const priceDetails = useMemo(() => {
    const basePrices = {
      'Saree': 2500,
      'Kurthi': 1500,
      'Short Kurthi': 1200,
      'Lehenga': 5000,
      'Salwar Kameez': 2200,
      'Gown': 4500,
      'Anarkali': 3500,
      'Palazzo Set': 2800,
      'Sharara': 4000,
      'Gharara': 4200,
      'Indo-Western Dress': 3800,
      'Crop Top & Skirt': 2500,
      'Jacket': 2000,
      'Blouse': 1200,
      'Dupatta': 800,
      'Pants': 1800,
      'Skirt': 1500,
      'Sherwani': 6000,
      'Kurta (Men)': 2000,
      'Nehru Jacket': 2500,
      'Dhoti': 1000,
      'Pajama': 1500
    };

    const base = basePrices[garmentType] || 2000;
    const customization = 350;
    let fabricCost = 0;
    if (materialSource === 'catalog' && selectedFabric) {
      fabricCost = (selectedFabric.price || 0) * 2.5; // Default 2.5m as used in backend
    }
    let lining = hasLining ? 500 : 0;
    let embroidery = 0;

    if (hasEmbroidery) {
      const typeMultipliers = {
        'Zardosi': 1.5,
        'Resham': 1.2,
        'Mirror': 1.1,
        'Bead': 1.4,
        'Chikankari': 1.3
      };
      
      const methodBase = embroideryDetails.method === 'Hand' ? 1500 : 600;
      const multiplier = typeMultipliers[embroideryDetails.type] || 1.0;
      embroidery = Math.round(methodBase * multiplier);
    }

    let subtotal = base + customization + fabricCost + lining + embroidery;
    let priorityFee = 0;
    
    // Fixed priority fees based on urgency level
    if (priority === 'urgent') {
      priorityFee = Math.round(subtotal * 0.4); // 40% for urgent (5-7 days)
    } else if (priority === 'express') {
      priorityFee = Math.round(subtotal * 0.2); // 20% for express (7-10 days)
    }
    // Standard priority (10-14 days) has no fee

    return {
      base,
      customization,
      fabricCost,
      lining,
      embroidery,
      priorityFee,
      total: subtotal + priorityFee,
      daysFromNow: deliveryDate ? Math.ceil((new Date(deliveryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    };
  }, [garmentType, materialSource, selectedFabric, hasLining, hasEmbroidery, embroideryDetails, priority, deliveryDate]);

  // Preview mapping
  const previewImages = {
    'Saree': 'https://images.unsplash.com/photo-1610030469915-9a88e479c982?auto=format&fit=crop&q=80&w=800',
    'Kurthi': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    'Short Kurthi': 'https://images.unsplash.com/photo-1624313503195-2376ee308870?auto=format&fit=crop&q=80&w=800',
    'Lehenga': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    'Salwar Kameez': 'https://images.unsplash.com/photo-1597505213323-28216c025816?auto=format&fit=crop&q=80&w=800',
    'Gown': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
    'Anarkali': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    'Palazzo Set': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    'Sharara': 'https://images.unsplash.com/photo-1597505213323-28216c025816?auto=format&fit=crop&q=80&w=800',
    'Gharara': 'https://images.unsplash.com/photo-1597505213323-28216c025816?auto=format&fit=crop&q=80&w=800',
    'Indo-Western Dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
    'Crop Top & Skirt': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    'Jacket': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=800',
    'Blouse': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    'Dupatta': 'https://images.unsplash.com/photo-1610030469915-9a88e479c982?auto=format&fit=crop&q=80&w=800',
    'Pants': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    'Skirt': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    'Sherwani': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    'Kurta (Men)': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    'Nehru Jacket': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    'Dhoti': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    'Pajama': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
  };

  const getGarmentPreview = () => {
    return previewImages[garmentType] || previewImages['Gown'];
  };

  // Body Shape Calculation Logic
  const bodyShape = useMemo(() => {
    const m = measurementMode === 'saved' ? profile.customer?.measurements : measurements;
    if (!m) return null;

    const chest = parseFloat(m.Chest || m.chest || 0);
    const waist = parseFloat(m.Waist || m.waist || 0);
    const hips = parseFloat(m.Hips || m.hips || 0);

    if (!chest || !waist || !hips) return null;

    const bustHipsRatio = chest / hips;
    const waistBustRatio = waist / chest;
    const waistHipsRatio = waist / hips;

    if (bustHipsRatio >= 0.95 && bustHipsRatio <= 1.05) {
      if (waistBustRatio < 0.8 && waistHipsRatio < 0.8) return 'Hourglass';
      return 'Rectangle';
    } else if (hips / chest > 1.05) {
      return 'Pear';
    } else if (chest / hips > 1.05) {
      return 'Inverted Triangle';
    } else if (waist / chest > 0.9) {
      return 'Apple';
    }
    
    return 'Rectangle';
  }, [measurements, profile.customer, measurementMode]);

  // AI Suggestion Logic
  const aiSuggestion = useMemo(() => {
    const suggestions = {
      'Saree': "Silk fabrics enhance the drape. Consider a contrasting blouse color.",
      'Kurthi': "Cotton-linen blends are perfect for everyday comfort and breathability.",
      'Short Kurthi': "Pair with denim for a chic fusion look. Velvet adds a premium touch.",
      'Lehenga': "Heavier fabrics like Velvet or Brocade silk are ideal for bridal wear.",
      'Salwar Kameez': "Chiffon or Georgette dupattas provide a graceful, airy silhouette.",
      'Gown': "Satin or Silk would create a stunning evening look with this silhouette.",
      'Anarkali': "Flowing fabrics like Georgette or Chiffon enhance the Anarkali's graceful silhouette.",
      'Palazzo Set': "Light, breathable fabrics like Cotton or Rayon work best for comfort and style.",
      'Sharara': "Rich fabrics like Silk or Brocade add elegance to this traditional outfit.",
      'Gharara': "Heavy fabrics like Silk or Velvet complement the Gharara's regal appearance.",
      'Indo-Western Dress': "Experiment with modern fabrics like Crepe or Jersey for a contemporary look.",
      'Crop Top & Skirt': "Mix textures - try a structured crop top with a flowing skirt.",
      'Jacket': "Structured fabrics like Cotton or Linen provide the perfect fit and shape.",
      'Blouse': "Silk or Satin blouses pair beautifully with traditional sarees.",
      'Dupatta': "Lightweight fabrics like Chiffon or Net add elegance without weight.",
      'Pants': "Tailored fabrics like Cotton or Polyester blends ensure comfort and style.",
      'Skirt': "A-line cuts in flowing fabrics create a flattering silhouette.",
      'Sherwani': "Rich fabrics like Silk or Brocade with intricate embroidery make a statement.",
      'Kurta (Men)': "Cotton or Linen kurtas are perfect for comfort and traditional elegance.",
      'Nehru Jacket': "Add sophistication with fabrics like Silk or Jacquard.",
      'Dhoti': "Traditional Cotton or Silk dhotis offer comfort and cultural authenticity.",
      'Pajama': "Comfortable fabrics like Cotton or Modal ensure all-day comfort."
    };

    let text = suggestions[garmentType] || "Our AI Stylist suggests choosing a breathable fabric for your body type.";
    
    if (bodyShape && shapeRecommendations[bodyShape]) {
      const recs = shapeRecommendations[bodyShape];
      text = `AI DETECTED: ${bodyShape} Shape. ${recs.text} To save you time, I've automatically selected a ${recs.defaults.silhouette} silhouette with a ${recs.defaults.neckline} neckline and ${recs.defaults.sleeve} which will suit you perfectly!`;
    }

    if (selectedFabric) {
      text += ` The ${selectedFabric.name} will look stunning as a ${silhouette} ${garmentType}.`;
    }

    return text;
  }, [garmentType, selectedFabric, silhouette, bodyShape]);

  const applyAISuggestions = () => {
    if (bodyShape && shapeRecommendations[bodyShape]) {
      const defaults = shapeRecommendations[bodyShape].defaults;
      setSilhouette(defaults.silhouette);
      setNeckline(defaults.neckline);
      setSleeve(defaults.sleeve);
      toast.info(`AI applied best design for ${bodyShape} body type`, {
        icon: <FaRobot color="#e91e63" />,
        position: "top-center"
      });
    }
  };

  // Garment-specific customization options
  const garmentCustomizations = {
    'Saree': {
      silhouettes: [
        { id: 'Traditional', icon: '🥻', label: 'Traditional' },
        { id: 'Designer', icon: '✨', label: 'Designer' },
        { id: 'Contemporary', icon: '🎨', label: 'Contemporary' },
        { id: 'Lehenga Style', icon: '👗', label: 'Lehenga Style' }
      ],
      necklines: [
        { id: 'Round', icon: '○', label: 'Round' },
        { id: 'V-Neck', icon: '∨', label: 'V-Neck' },
        { id: 'Square', icon: '⊔', label: 'Square' },
        { id: 'Boat', icon: '—', label: 'Boat' }
      ],
      sleeves: ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Bell Sleeve', 'Puff Sleeve']
    },
    'Kurthi': {
      silhouettes: [
        { id: 'Straight', icon: '▯', label: 'Straight' },
        { id: 'A-Line', icon: '△', label: 'A-Line' },
        { id: 'Asymmetric', icon: '◢', label: 'Asymmetric' },
        { id: 'High-Low', icon: '⩘', label: 'High-Low' }
      ],
      necklines: [
        { id: 'Round', icon: '○', label: 'Round' },
        { id: 'V-Neck', icon: '∨', label: 'V-Neck' },
        { id: 'Mandarin', icon: '⊓', label: 'Mandarin' },
        { id: 'Keyhole', icon: '🔑', label: 'Keyhole' }
      ],
      sleeves: ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Bell Sleeve', 'Kimono Sleeve']
    },
    'Lehenga': {
      silhouettes: [
        { id: 'A-Line', icon: '△', label: 'A-Line' },
        { id: 'Mermaid', icon: '🧜‍♀️', label: 'Mermaid' },
        { id: 'Ball Gown', icon: '👗', label: 'Ball Gown' },
        { id: 'Sharara Style', icon: '🎭', label: 'Sharara Style' }
      ],
      necklines: [
        { id: 'Sweetheart', icon: '♡', label: 'Sweetheart' },
        { id: 'Deep V', icon: '∨', label: 'Deep V' },
        { id: 'Halter', icon: '⊥', label: 'Halter' },
        { id: 'Off-Shoulder', icon: '⌒', label: 'Off-Shoulder' }
      ],
      sleeves: ['Sleeveless', 'Cap Sleeve', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Off-Shoulder']
    },
    'Gown': {
      silhouettes: [
        { id: 'A-Line', icon: '△', label: 'A-Line' },
        { id: 'Mermaid', icon: '🧜‍♀️', label: 'Mermaid' },
        { id: 'Sheath', icon: '▯', label: 'Sheath' },
        { id: 'Empire', icon: '♙', label: 'Empire' }
      ],
      necklines: [
        { id: 'Sweetheart', icon: '♡', label: 'Sweetheart' },
        { id: 'V-Neck', icon: '∨', label: 'V-Neck' },
        { id: 'Halter', icon: '⊥', label: 'Halter' },
        { id: 'One-Shoulder', icon: '⟋', label: 'One-Shoulder' }
      ],
      sleeves: ['Sleeveless', 'Cap Sleeve', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Long Sleeve']
    },
    'Anarkali': {
      silhouettes: [
        { id: 'Floor Length', icon: '👗', label: 'Floor Length' },
        { id: 'Knee Length', icon: '🩱', label: 'Knee Length' },
        { id: 'Asymmetric', icon: '◢', label: 'Asymmetric' },
        { id: 'Layered', icon: '🎂', label: 'Layered' }
      ],
      necklines: [
        { id: 'Round', icon: '○', label: 'Round' },
        { id: 'V-Neck', icon: '∨', label: 'V-Neck' },
        { id: 'Boat', icon: '—', label: 'Boat' },
        { id: 'High Neck', icon: '⊓', label: 'High Neck' }
      ],
      sleeves: ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Bell Sleeve', 'Flared Sleeve']
    },
    'Sherwani': {
      silhouettes: [
        { id: 'Classic', icon: '🤵', label: 'Classic' },
        { id: 'Indo-Western', icon: '🎭', label: 'Indo-Western' },
        { id: 'Achkan', icon: '👔', label: 'Achkan' },
        { id: 'Jodhpuri', icon: '🏰', label: 'Jodhpuri' }
      ],
      necklines: [
        { id: 'Band Collar', icon: '⊓', label: 'Band Collar' },
        { id: 'Mandarin', icon: '⊔', label: 'Mandarin' },
        { id: 'High Neck', icon: '⊤', label: 'High Neck' },
        { id: 'V-Neck', icon: '∨', label: 'V-Neck' }
      ],
      sleeves: ['Full Sleeve', 'Short Sleeve', 'Sleeveless']
    }
  };

  // Garment-specific fabric recommendations
  const fabricRecommendations = {
    'Saree': {
      recommended: ['Silk', 'Cotton Silk', 'Georgette', 'Chiffon', 'Crepe', 'Handloom Cotton'],
      avoid: ['Denim', 'Leather', 'Heavy Wool'],
      note: 'Choose fabrics that drape well and complement the blouse design'
    },
    'Kurthi': {
      recommended: ['Cotton', 'Rayon', 'Linen', 'Cotton Blend', 'Viscose', 'Khadi'],
      avoid: ['Heavy Silk', 'Stiff Brocade', 'Leather'],
      note: 'Comfortable, breathable fabrics work best for daily wear'
    },
    'Lehenga': {
      recommended: ['Silk', 'Velvet', 'Brocade', 'Net', 'Satin', 'Taffeta'],
      avoid: ['Cotton', 'Linen', 'Jersey'],
      note: 'Rich, structured fabrics enhance the grandeur of lehengas'
    },
    'Gown': {
      recommended: ['Satin', 'Silk', 'Chiffon', 'Georgette', 'Crepe', 'Taffeta'],
      avoid: ['Cotton', 'Denim', 'Heavy Wool'],
      note: 'Elegant fabrics that flow beautifully for formal occasions'
    },
    'Anarkali': {
      recommended: ['Georgette', 'Chiffon', 'Net', 'Silk', 'Crepe', 'Satin'],
      avoid: ['Stiff Cotton', 'Denim', 'Heavy Brocade'],
      note: 'Flowing fabrics enhance the Anarkali silhouette'
    },
    'Sherwani': {
      recommended: ['Silk', 'Brocade', 'Jacquard', 'Raw Silk', 'Cotton Silk', 'Linen'],
      avoid: ['Jersey', 'Stretch Fabrics', 'Chiffon'],
      note: 'Structured fabrics maintain the formal appearance'
    },
    'Palazzo Set': {
      recommended: ['Rayon', 'Cotton', 'Crepe', 'Georgette', 'Viscose', 'Modal'],
      avoid: ['Heavy Silk', 'Stiff Fabrics', 'Denim'],
      note: 'Comfortable, flowy fabrics for ease of movement'
    }
  };

  // Get fabric recommendations for current garment
  const getCurrentFabricRecs = () => {
    return fabricRecommendations[garmentType] || {
      recommended: ['Cotton', 'Silk', 'Linen', 'Rayon'],
      avoid: ['Heavy fabrics'],
      note: 'Choose fabrics suitable for your garment style'
    };
  };

  // Get customization options for current garment type
  const getCurrentCustomizations = () => {
    return garmentCustomizations[garmentType] || {
      silhouettes: [
        { id: 'A-Line', icon: '△', label: 'A-Line' },
        { id: 'Straight', icon: '▯', label: 'Straight' },
        { id: 'Fitted', icon: '⧫', label: 'Fitted' },
        { id: 'Loose', icon: '◯', label: 'Loose' }
      ],
      necklines: [
        { id: 'Round', icon: '○', label: 'Round' },
        { id: 'V-Neck', icon: '∨', label: 'V-Neck' },
        { id: 'Square', icon: '⊔', label: 'Square' },
        { id: 'Boat', icon: '—', label: 'Boat' }
      ],
      sleeves: ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve']
    };
  };

  // Garment Types and their measurement fields
  const garmentConfig = {
    'Saree': ['Chest', 'Waist', 'Blouse Length', 'Sleeve Length', 'Shoulder'],
    'Kurthi': ['Chest', 'Waist', 'Hips', 'Shoulder', 'Length', 'Sleeve Length'],
    'Short Kurthi': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve Length'],
    'Lehenga': ['Chest', 'Waist', 'Hips', 'Skirt Length', 'Blouse Length'],
    'Salwar Kameez': ['Chest', 'Waist', 'Hips', 'Shoulder', 'Kameez Length', 'Salwar Length'],
    'Gown': ['Chest', 'Waist', 'Hips', 'Full Length', 'Shoulder'],
    'Anarkali': ['Chest', 'Waist', 'Hips', 'Shoulder', 'Full Length', 'Sleeve Length'],
    'Palazzo Set': ['Chest', 'Waist', 'Hips', 'Shoulder', 'Top Length', 'Palazzo Length'],
    'Sharara': ['Chest', 'Waist', 'Hips', 'Shoulder', 'Kameez Length', 'Sharara Length'],
    'Gharara': ['Chest', 'Waist', 'Hips', 'Shoulder', 'Kameez Length', 'Gharara Length'],
    'Indo-Western Dress': ['Chest', 'Waist', 'Hips', 'Shoulder', 'Full Length', 'Sleeve Length'],
    'Crop Top & Skirt': ['Chest', 'Waist', 'Hips', 'Crop Top Length', 'Skirt Length'],
    'Jacket': ['Chest', 'Waist', 'Shoulder', 'Jacket Length', 'Sleeve Length'],
    'Blouse': ['Chest', 'Waist', 'Shoulder', 'Blouse Length', 'Sleeve Length'],
    'Dupatta': ['Length', 'Width'],
    'Pants': ['Waist', 'Hips', 'Thigh', 'Pant Length', 'Bottom Opening'],
    'Skirt': ['Waist', 'Hips', 'Skirt Length'],
    'Sherwani': ['Chest', 'Waist', 'Shoulder', 'Sherwani Length', 'Sleeve Length'],
    'Kurta (Men)': ['Chest', 'Waist', 'Shoulder', 'Kurta Length', 'Sleeve Length'],
    'Nehru Jacket': ['Chest', 'Waist', 'Shoulder', 'Jacket Length'],
    'Dhoti': ['Waist', 'Dhoti Length'],
    'Pajama': ['Waist', 'Hips', 'Pajama Length', 'Bottom Opening']
  };

  const garmentTypes = Object.keys(garmentConfig);
  const occasions = ['Wedding Guest', 'Corporate Event', 'Cocktail Party', 'Casual Outing', 'Gala Dinner', 'Festive'];

  // Priority-based date constraints - Updated with correct ranges
  const dateConstraints = useMemo(() => {
    const today = new Date();
    const getFormatted = (days) => {
      const d = new Date();
      d.setDate(today.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    switch(priority) {
      case 'urgent':
        return { min: getFormatted(5), max: getFormatted(7) }; // 5-7 days for urgent
      case 'express':
        return { min: getFormatted(7), max: getFormatted(10) }; // 7-10 days for express
      case 'standard':
        return { min: getFormatted(10), max: getFormatted(14) }; // 10-14 days for standard
      default:
        return null; // No date range until priority is selected
    }
  }, [priority]);

  // Reset customization options when garment type changes
  useEffect(() => {
    const customizations = getCurrentCustomizations();
    setSilhouette(customizations.silhouettes[0]?.id || 'A-Line');
    setNeckline(customizations.necklines[0]?.id || 'Round');
    setSleeve(customizations.sleeves[0] || 'Sleeveless');
  }, [garmentType]);

  // Clear delivery date when priority changes and set to minimum of new range
  useEffect(() => {
    if (priority && dateConstraints) {
      setDeliveryDate(dateConstraints.min);
    } else {
      setDeliveryDate(''); // Clear date if no priority selected
    }
  }, [priority, dateConstraints]);

  // Handle returning from fabric catalog
  useEffect(() => {
    if (location.state?.previousForm) {
      const pf = location.state.previousForm;
      setGarmentType(pf.garmentType);
      setOccasion(pf.occasion);
      setDescription(pf.description);
      setDeliveryDate(pf.deliveryDate);
      setPriority(pf.priority);
      setMeasurementMode(pf.measurementMode);
      setMeasurements(pf.measurements);
      setHasLining(pf.hasLining);
      setHasEmbroidery(pf.hasEmbroidery);
      setEmbroideryDetails(pf.embroideryDetails);
      setActiveStep(pf.activeStep || 1);
    }
    
    if (location.state?.selectedFabric) {
      const fabric = location.state.selectedFabric;
      setSelectedFabric(fabric);
      setFabricQuery(fabric.name);
      setMaterialSource('catalog');
    }
  }, [location.state]);

  // Images
  const [referenceImages, setReferenceImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes] = await Promise.all([
          axios.get('/api/portal/profile')
        ]);
        setProfile(pRes.data || { user: null, customer: null });
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setReferenceImages(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!priority) {
      toast.error('Please select a priority level');
      return;
    }
    
    if (!deliveryDate || !garmentType) {
      toast.error('Please fill in required fields including delivery date');
      return;
    }

    // Validate delivery date is within allowed range
    if (dateConstraints) {
      const selectedDate = new Date(deliveryDate);
      const minDate = new Date(dateConstraints.min);
      const maxDate = new Date(dateConstraints.max);
      
      if (selectedDate < minDate || selectedDate > maxDate) {
        const rangeDays = priority === 'urgent' ? '5-7 days' : 
                         priority === 'express' ? '7-10 days' : '10-14 days';
        toast.error(`Please select a delivery date within ${rangeDays} from today`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // 1. Upload images if any
      let uploadedAttachments = [];
      if (referenceImages.length > 0) {
        const uploadData = new FormData();
        referenceImages.forEach(img => {
          uploadData.append('referenceImages', img);
        });
        
        try {
          const uploadRes = await axios.post('/api/uploads/reference', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedAttachments = uploadRes.data.attachments || [];
        } catch (uploadErr) {
          console.error('Failed to upload images:', uploadErr);
          toast.warn('Could not upload some images, proceeding with order...');
        }
      }

      // 2. Prepare order data as JSON
      let rawMeasurements = measurementMode === 'saved' ? profile.customer?.measurements : measurements;
      
      // Normalize measurement keys for backend (Lowercase and mapping)
      const orderMeasurements = {};
      if (rawMeasurements) {
        Object.keys(rawMeasurements).forEach(key => {
          let k = key.toLowerCase().replace(/\s/g, '');
          // Map frontend labels to backend schema fields
          if (k === 'sleevelength') k = 'sleeve';
          if (k === 'armlength') k = 'armLength';
          if (k === 'leglength') k = 'legLength';
          if (k === 'fulllength' || k === 'length' || k === 'skirtlength' || k === 'blouselength') k = 'height'; // Mapping various lengths to height or specific field if exists
          
          orderMeasurements[k] = rawMeasurements[key];
        });
      }
      
      const orderData = {
        garmentType,
        occasion,
        notes: description,
        specialInstructions: description,
        materialSource,
        expectedDelivery: deliveryDate,
        urgency: priority, // Map priority to urgency for backend
        measurements: orderMeasurements,
        fabric: materialSource === 'catalog' && selectedFabric ? {
          source: 'shop',
          fabricId: selectedFabric._id,
          name: selectedFabric.name,
          quantity: 2.5 // Default quantity for the garment
        } : {
          source: materialSource === 'own' ? 'customer' : 'none',
          meters: 3.0 // Default for own fabric
        },
        customizations: {
          hasLining,
          embroidery: hasEmbroidery ? {
            enabled: true,
            type: embroideryDetails.type.toLowerCase(),
            method: embroideryDetails.method,
            placements: [embroideryDetails.placement.toLowerCase()],
            pattern: embroideryDetails.pattern.toLowerCase()
          } : { enabled: false }
        },
        attachments: uploadedAttachments,
        totalPrice: priceDetails.total
      };

      // 3. API call to create order (Customer Portal route)
      const response = await axios.post('/api/portal/orders', orderData);
      const { order } = response.data;

      toast.success('Request submitted successfully!');
      
      // Redirect to payments with bill info for better UX
      const billId = order.bill;
      const amount = order.totalAmount;
      navigate(`/portal/payments?bill=${billId}&amount=${amount}&open=1&fromOrder=1&autoPayment=1`);
    } catch (err) {
      console.error('Failed to submit order:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit request. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Navigation helper for Fabric Catalog
  const goToFabrics = () => {
    navigate('/portal/fabrics', { 
      state: { 
        previousForm: {
          garmentType,
          occasion,
          description,
          deliveryDate,
          priority,
          measurementMode,
          measurements,
          hasLining,
          hasEmbroidery,
          embroideryDetails,
          activeStep
        }
      } 
    });
  };

  // Materials & Measurements Card
  const renderMaterialsCard = () => (
    <section className="order-card">
      <div className="card-header">
        <FaRegFileAlt className="card-icon" style={{ transform: 'rotate(-10deg)' }} />
        <h2>Materials & Measurements</h2>
      </div>

      <div className="form-group">
        <label>Material Source</label>
        <div className="material-source-grid">
          <div 
            className={`source-option ${materialSource === 'catalog' ? 'active' : ''}`}
            onClick={goToFabrics}
          >
            <div className="radio-circle">
              {materialSource === 'catalog' && <div className="radio-circle-inner" />}
            </div>
            <div className="source-content">
              <span className="source-title">Select from Catalog</span>
              <span className="source-desc">Browse our premium fabrics</span>
            </div>
            <FaStore className="source-icon" />
          </div>
          
          <div 
            className={`source-option ${materialSource === 'own' ? 'active' : ''}`}
            onClick={() => setMaterialSource('own')}
          >
            <div className="radio-circle">
              {materialSource === 'own' && <div className="radio-circle-inner" />}
            </div>
            <div className="source-content">
              <span className="source-title">I will provide material</span>
              <span className="source-desc">Bring fabric to fitting</span>
            </div>
            <FaShoppingBag className="source-icon" />
          </div>
        </div>
      </div>

      {materialSource === 'catalog' && (
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Preferred Fabric (Optional)</label>
            <button 
              onClick={goToFabrics} 
              style={{ background: 'none', border: 'none', fontSize: '12px', color: '#e91e63', cursor: 'pointer', padding: 0 }}
            >
              Browse Catalog
            </button>
          </div>
          <div className="search-wrapper">
            <FaSearch className="search-icon-left" />
            <input 
              type="text" 
              placeholder="Search silk, cotton, velvet..."
              className="fabric-search-input"
              value={fabricQuery}
              onChange={(e) => setFabricQuery(e.target.value)}
            />
          </div>
        </div>
      )}
    </section>
  );

  return (
    <DashboardLayout>
      <div className="new-order-portal">
        {/* Header Section */}
        <header className="portal-header">
          <div>
            <div className="breadcrumbs">
              <Link to="/portal">Home</Link> <span>›</span> 
              <Link to="#" onClick={() => setActiveStep(1)}>New Request</Link>
              {activeStep > 1 && (
                <>
                  <span>›</span> 
                  <span className="active-breadcrumb">Dress Customization</span>
                </>
              )}
            </div>
            <h1 className="page-title">
              {activeStep === 2 ? 'Dress Customization Studio' : 'Create New Order'}
            </h1>
          </div>
          <div className="header-right">
            <div className="today-date">
              Today is
              <strong>{formattedDate}</strong>
            </div>
            <button className="notif-btn">
              <FaBell />
            </button>
          </div>
        </header>

        <div className={`order-grid ${activeStep === 2 ? 'studio-layout' : ''}`}>
          {activeStep === 1 && (
            /* Left Column: Form Details (Step 1) */
            <div className="form-main-col">
              
              {/* Garment Details Card */}
              <section className="order-card">
                <div className="card-header">
                  <FaTshirt className="card-icon" />
                  <h2>Garment Details</h2>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Garment Type</label>
                    <select 
                      value={garmentType} 
                      onChange={(e) => setGarmentType(e.target.value)}
                    >
                      {garmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Occasion</label>
                    <select 
                      value={occasion} 
                      onChange={(e) => setOccasion(e.target.value)}
                    >
                      {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Design Reference / Description</label>
                  <textarea 
                    placeholder="Describe the style, cut, and fit you're looking for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="upload-section">
                  <label className="upload-label">Upload Inspiration Photo</label>
                  <div className="upload-dropzone" onClick={() => document.getElementById('fileInput').click()}>
                    <FaCloudUploadAlt className="upload-icon" />
                    <div className="upload-text">
                      <span>Upload a file</span> or drag and drop
                    </div>
                    <div className="upload-hint">PNG, JPG up to 10MB</div>
                    <input 
                      type="file" 
                      id="fileInput" 
                      hidden 
                      multiple 
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="image-previews">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="preview-item">
                          <img src={src} alt="Preview" />
                          <button className="remove-img" onClick={() => removeImage(i)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Delivery Date & Urgency Section */}
              <section className="order-card">
                <div className="card-header">
                  <FaClock className="card-icon" />
                  <h2>Delivery Date & Urgency</h2>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>When do you need this? *</label>
                    <input 
                      type="date" 
                      value={deliveryDate}
                      min={dateConstraints?.min || ''}
                      max={dateConstraints?.max || ''}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      disabled={!priority}
                      required
                    />
                    <div className="date-helper-text">
                      {!priority ? (
                        '⚠️ Please select a priority level first'
                      ) : (
                        `📅 ${priority === 'urgent' ? 'Urgent: 5-7 days from today' : 
                             priority === 'express' ? 'Express: 7-10 days from today' : 
                             'Standard: 10-14 days from today'}`
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Order Priority</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="standard">Standard - No extra charge</option>
                      <option value="express">Express - +20% fee</option>
                      <option value="urgent">Urgent - +40% fee</option>
                    </select>
                  </div>
                </div>

                <div className="urgency-visual-selector">
                  <div 
                    className={`urgency-card ${priority === 'standard' ? 'active' : ''}`}
                    onClick={() => setPriority('standard')}
                  >
                    <div className="urgency-icon">📦</div>
                    <span className="urgency-title">Standard</span>
                    <span className="urgency-desc">10-14 days</span>
                    <span className="urgency-price">FREE</span>
                  </div>
                  <div 
                    className={`urgency-card ${priority === 'express' ? 'active' : ''}`}
                    onClick={() => setPriority('express')}
                  >
                    <div className="urgency-icon">⚡</div>
                    <span className="urgency-title">Express</span>
                    <span className="urgency-desc">7-10 days</span>
                    <span className="urgency-price">+20%</span>
                  </div>
                  <div 
                    className={`urgency-card ${priority === 'urgent' ? 'active' : ''}`}
                    onClick={() => setPriority('urgent')}
                  >
                    <div className="urgency-icon">🚀</div>
                    <span className="urgency-title">Urgent</span>
                    <span className="urgency-desc">5-7 days</span>
                    <span className="urgency-price">+40%</span>
                  </div>
                </div>

                <div className="delivery-info-box">
                  {!priority ? (
                    <div className="no-priority-message">
                      <span className="info-label">👆 Please select a priority level above to choose your delivery date</span>
                    </div>
                  ) : (
                    <>
                      <div className="info-row">
                        <span className="info-label">Available Date Range:</span>
                        <span className="info-value">
                          {priority === 'urgent' ? '5-7 days from today' : 
                           priority === 'express' ? '7-10 days from today' : 
                           '10-14 days from today'}
                        </span>
                      </div>
                      {deliveryDate && (
                        <>
                          <div className="info-row">
                            <span className="info-label">Selected Date:</span>
                            <span className="info-value">
                              {new Date(deliveryDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Days from now:</span>
                            <span className="info-value">
                              {priceDetails.daysFromNow} days
                            </span>
                          </div>
                        </>
                      )}
                      <div className="info-row">
                        <span className="info-label">Priority Level:</span>
                        <span className={`info-value priority-badge priority-${priority}`}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      </div>
                      {priceDetails.priorityFee > 0 && (
                        <div className="info-row">
                          <span className="info-label">Priority Fee:</span>
                          <span className="info-value priority-fee">
                            +₹{priceDetails.priorityFee.toLocaleString()} 
                            ({Math.round((priceDetails.priorityFee / (priceDetails.total - priceDetails.priorityFee)) * 100)}%)
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

              </section>

              {renderMaterialsCard()}
              
              <section className="order-card">
                <div className="measurement-section-header">
                  <h3>Measurement Details</h3>
                  <Link to="#" className="size-guide-link">
                    <FaInfoCircle /> Size Guide
                  </Link>
                </div>
                
                <div className="measurement-mode-selector">
                  <div 
                    className={`mode-option ${measurementMode === 'saved' ? 'active' : ''}`}
                    onClick={() => setMeasurementMode('saved')}
                  >
                    <div className="radio-circle">
                      {measurementMode === 'saved' && <div className="radio-circle-inner" />}
                    </div>
                    <span>Use Saved Measurements</span>
                  </div>
                  <div 
                    className={`mode-option ${measurementMode === 'new' ? 'active' : ''}`}
                    onClick={() => setMeasurementMode('new')}
                  >
                    <div className="radio-circle">
                      {measurementMode === 'new' && <div className="radio-circle-inner" />}
                    </div>
                    <span>Enter New Measurements</span>
                  </div>
                </div>

                {measurementMode === 'saved' ? (
                  <div className="saved-measurements-preview">
                    {profile.customer?.measurements ? (
                      <div className="measurements-grid-mini">
                        {Object.entries(profile.customer.measurements).map(([key, val]) => (
                          <div key={key} className="meas-item">
                            <span className="meas-label">{key}</span>
                            <span className="meas-val">{val} in</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-measurements">
                        <p>No saved measurements found.</p>
                        <button className="btn-small" onClick={() => setMeasurementMode('new')}>Add New</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="new-measurements-form">
                    <p className="form-hint">Enter measurements for {garmentType}:</p>
                    <div className="measurements-input-grid">
                      {garmentConfig[garmentType]?.map(field => (
                        <div key={field} className="meas-input-group">
                          <label>{field} (in)</label>
                          <input 
                            type="number" 
                            placeholder="0.0" 
                            value={measurements[field] || ''}
                            onChange={(e) => setMeasurements({...measurements, [field]: e.target.value})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeStep === 2 && (
            /* Customization Studio (Step 2) */
            <div className="studio-container">
              {/* Preview Area (Left) */}
              <div className="studio-preview-col">
                <div className="studio-canvas">
                  <div className="canvas-header-ai">
                    <div className="canvas-title-group">
                      <span className="ai-3d-badge">AI 3D RENDER</span>
                      <span className="garment-type-badge">{garmentType}</span>
                    </div>
                    {bodyShape && <span className="shape-tag">Tailored for: <strong>{bodyShape}</strong></span>}
                  </div>
                  <div className="garment-render 3d-effect">
                    <img 
                      src={getGarmentPreview()} 
                      alt="Garment Preview" 
                      className="preview-image 3d-model"
                    />
                    {selectedFabric && (
                      <div className="fabric-swatch-overlay">
                        <img src={selectedFabric.images?.[0]?.url || 'https://images.unsplash.com/photo-1601662528567-526cd06f6582?w=100'} alt="Fabric Swatch" />
                        <span>Applying {selectedFabric.name}</span>
                      </div>
                    )}
                    <div className="preview-dot dot-neckline" style={{ top: '35%', left: '46%' }}></div>
                    <div className="preview-dot dot-waist" style={{ top: '56%', left: '43%' }}></div>
                  </div>
                  
                  <div className="canvas-controls">
                    <button className="canvas-btn" title="Rotate"><FaUndo /></button>
                    <button className="canvas-btn" title="Zoom In"><FaPlus /></button>
                    <button className="canvas-btn" title="Zoom Out"><FaMinus /></button>
                    <button className="canvas-btn" title="Reset View"><FaSync /></button>
                  </div>
                  
                  <div className="canvas-footer-info">
                    <p>Based on your {measurementMode === 'saved' ? 'saved' : 'provided'} measurements</p>
                  </div>
                </div>
              </div>

              {/* Controls Area (Right) */}
              <div className="studio-controls-col">
                {/* AI Suggestion Card */}
                <div className="ai-suggestion-box">
                  <div className="ai-suggestion-header">
                    <FaMagic className="ai-spark-icon" />
                    <div className="ai-title-group">
                      <span className="ai-main-title">AI STYLE ASSISTANT</span>
                      {bodyShape && <span className="ai-shape-detected">{bodyShape} Shape Detected</span>}
                    </div>
                  </div>
                  <div className="ai-suggestion-content">
                    <p>{aiSuggestion}</p>
                    <div className="ai-recommendations">
                      {bodyShape && shapeRecommendations[bodyShape].styles.map(s => (
                        <span key={s} className="recommendation-pill">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tabs & Options */}
                <div className="studio-tabs-card">
                  <div className="studio-tabs-header">
                    <button 
                      className={`studio-tab ${activeTab === 'Design' ? 'active' : ''}`}
                      onClick={() => setActiveTab('Design')}
                    >
                      Design
                    </button>
                    <button 
                      className={`studio-tab ${activeTab === 'Fabric' ? 'active' : ''}`}
                      onClick={() => setActiveTab('Fabric')}
                    >
                      Fabric
                    </button>
                    <button 
                      className={`studio-tab ${activeTab === 'Size' ? 'active' : ''}`}
                      onClick={() => setActiveTab('Size')}
                    >
                      Size
                    </button>
                  </div>

                  <div className="studio-tab-content">
                    {activeTab === 'Design' && (
                      <div className="design-options">
                        <div className="option-section">
                          <div className="section-title-row">
                            <h3>{garmentType} Style</h3>
                            <span className="guide-link">Guide</span>
                          </div>
                          <div className="visual-options-grid">
                            {getCurrentCustomizations().silhouettes.map(opt => (
                              <div 
                                key={opt.id}
                                className={`visual-option ${silhouette === opt.id ? 'active' : ''}`}
                                onClick={() => setSilhouette(opt.id)}
                              >
                                <div className="option-icon-box">{opt.icon}</div>
                                <span>{opt.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="option-section">
                          <h3>Neckline Style</h3>
                          <div className="visual-options-grid">
                            {getCurrentCustomizations().necklines.map(opt => (
                              <div 
                                key={opt.id}
                                className={`visual-option ${neckline === opt.id ? 'active' : ''}`}
                                onClick={() => setNeckline(opt.id)}
                              >
                                <div className="option-icon-box">{opt.icon}</div>
                                <span>{opt.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="option-section">
                          <h3>Sleeve Style</h3>
                          <select 
                            className="studio-select"
                            value={sleeve}
                            onChange={(e) => setSleeve(e.target.value)}
                          >
                            {getCurrentCustomizations().sleeves.map(sleeveOption => (
                              <option key={sleeveOption} value={sleeveOption}>
                                {sleeveOption}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    {activeTab === 'Fabric' && (
                      <div className="fabric-recommendations">
                        <div className="fabric-section">
                          <h3>Recommended for {garmentType}</h3>
                          <div className="fabric-tags">
                            {getCurrentFabricRecs().recommended.map(fabric => (
                              <span key={fabric} className="fabric-tag recommended">
                                {fabric}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="fabric-section">
                          <h3>Avoid for {garmentType}</h3>
                          <div className="fabric-tags">
                            {getCurrentFabricRecs().avoid.map(fabric => (
                              <span key={fabric} className="fabric-tag avoid">
                                {fabric}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="fabric-note">
                          <p><strong>Tip:</strong> {getCurrentFabricRecs().note}</p>
                        </div>

                        <button 
                          className="btn-outline-studio" 
                          onClick={() => navigate('/portal/fabrics')}
                        >
                          Browse Fabric Catalog
                        </button>
                      </div>
                    )}
                    {activeTab === 'Size' && (
                      <div className="size-tab-placeholder">
                        <p>Confirm size and adjustments...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            /* Left Column: Timeline & Finalization (Step 3) */
            <div className="form-main-col">
              <section className="order-card">
                <div className="card-header">
                  <FaClock className="card-icon" />
                  <h2>Timeline & Urgency</h2>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Desired Delivery Date</label>
                    <input 
                      type="date" 
                      value={deliveryDate}
                      min={dateConstraints.min}
                      max={dateConstraints.max}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Order Priority</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="standard">Standard (14-21 Days) - Free</option>
                      <option value="express">Express (7-10 Days) - +20%</option>
                      <option value="urgent">Urgent (3-5 Days) - +40%</option>
                    </select>
                  </div>
                </div>

                <div className="urgency-visual-selector">
                  <div 
                    className={`urgency-card ${priority === 'standard' ? 'active' : ''}`}
                    onClick={() => setPriority('standard')}
                  >
                    <span className="urgency-title">Standard</span>
                    <span className="urgency-time">14-21 Days</span>
                    <span className="urgency-price">FREE</span>
                  </div>
                  <div 
                    className={`urgency-card ${priority === 'express' ? 'active' : ''}`}
                    onClick={() => setPriority('express')}
                  >
                    <span className="urgency-title">Express</span>
                    <span className="urgency-time">7-10 Days</span>
                    <span className="urgency-price">+20%</span>
                  </div>
                  <div 
                    className={`urgency-card ${priority === 'urgent' ? 'active' : ''}`}
                    onClick={() => setPriority('urgent')}
                  >
                    <span className="urgency-title">Urgent</span>
                    <span className="urgency-time">3-5 Days</span>
                    <span className="urgency-price">+40%</span>
                  </div>
                </div>
              </section>

              <section className="order-card">
                <div className="card-header">
                  <FaRobot className="card-icon" />
                  <h2>Advanced Customization</h2>
                </div>
                <div className="advanced-custom-grid">
                  <div 
                    className={`custom-toggle-card ${hasLining ? 'active' : ''}`}
                    onClick={() => setHasLining(!hasLining)}
                  >
                    <div className="toggle-header">
                      <div className="toggle-info">
                        <span className="toggle-title">Add Premium Lining</span>
                        <span className="toggle-desc">High-quality silk or cotton lining for comfort</span>
                      </div>
                      <div className={`toggle-switch ${hasLining ? 'on' : ''}`}>
                        <div className="switch-knob"></div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`custom-toggle-card ${hasEmbroidery ? 'active' : ''}`}
                    onClick={() => setHasEmbroidery(!hasEmbroidery)}
                  >
                    <div className="toggle-header">
                      <div className="toggle-info">
                        <span className="toggle-title">Add Custom Embroidery</span>
                        <span className="toggle-desc">Hand-crafted intricate patterns and designs</span>
                      </div>
                      <div className={`toggle-switch ${hasEmbroidery ? 'on' : ''}`}>
                        <div className="switch-knob"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {hasEmbroidery && (
                  <div className="embroidery-details-panel">
                    <div className="panel-header-mini">Embroidery Configuration</div>
                    <div className="embroidery-form-grid">
                      <div className="form-group-mini">
                        <label>Embroidery Type</label>
                        <select 
                          value={embroideryDetails.type}
                          onChange={(e) => setEmbroideryDetails({...embroideryDetails, type: e.target.value})}
                        >
                          <option value="Zardosi">Zardosi (Gold/Silver thread)</option>
                          <option value="Resham">Resham (Silk thread)</option>
                          <option value="Mirror">Mirror Work</option>
                          <option value="Bead">Bead & Sequin</option>
                          <option value="Chikankari">Chikankari</option>
                        </select>
                      </div>
                      <div className="form-group-mini">
                        <label>Embroidery Method</label>
                        <select 
                          value={embroideryDetails.method}
                          onChange={(e) => setEmbroideryDetails({...embroideryDetails, method: e.target.value})}
                        >
                          <option value="Hand">Hand Embroidery (Premium)</option>
                          <option value="Machine">Machine Embroidery (Fast)</option>
                        </select>
                      </div>
                      <div className="form-group-mini">
                        <label>Placement</label>
                        <select 
                          value={embroideryDetails.placement}
                          onChange={(e) => setEmbroideryDetails({...embroideryDetails, placement: e.target.value})}
                        >
                          <option value="Neckline">Neckline</option>
                          <option value="Sleeves">Sleeves</option>
                          <option value="Border">Border / Hemline</option>
                          <option value="Back">Back Center</option>
                          <option value="All-over">All-over Bootis</option>
                        </select>
                      </div>
                      <div className="form-group-mini">
                        <label>Pattern Style</label>
                        <select 
                          value={embroideryDetails.pattern}
                          onChange={(e) => setEmbroideryDetails({...embroideryDetails, pattern: e.target.value})}
                        >
                          <option value="Floral">Floral / Nature</option>
                          <option value="Geometric">Geometric / Linear</option>
                          <option value="Paisley">Traditional Paisley</option>
                          <option value="Abstract">Modern Abstract</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className="section-actions">
                <button 
                  className="btn-back-step"
                  onClick={() => setActiveStep(2)}
                >
                  <FaChevronLeft style={{ fontSize: '10px' }} /> Back to Customization
                </button>
              </div>
            </div>
          )}

          {/* Right Column: Order Summary & Actions */}
          <div className="side-col">
              <section className="order-card summary-card">
                <div className="card-header">
                  <FaRegFileAlt className="card-icon" />
                  <h2>Order Summary</h2>
                </div>
                
                <div className="summary-details">
                  <div className="summary-section-label">Garment Info</div>
                  <div className="summary-row">
                    <span>Type</span>
                    <strong>{garmentType || 'Saree'}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Fabric</span>
                    <strong>{selectedFabric?.name || fabricQuery || 'To be selected'}</strong>
                  </div>
                  
                  <div className="summary-section-label">Delivery Info</div>
                  <div className="summary-row">
                    <span>Priority</span>
                    <strong>
                      {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Not selected'}
                    </strong>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Date</span>
                    <strong>
                      {deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Not selected'}
                    </strong>
                  </div>
                  {deliveryDate && priority && (
                    <div className="summary-row">
                      <span>Days from now</span>
                      <strong>
                        {priceDetails.daysFromNow} days
                      </strong>
                    </div>
                  )}
                  
                  <div className="summary-section-label">Design Details</div>
                  <div className="summary-row">
                    <span>Silhouette</span>
                    <strong>{silhouette || 'A-Line'}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Neckline</span>
                    <strong>{neckline || 'Sweetheart'}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Sleeve</span>
                    <strong>{sleeve || 'Sleeveless'}</strong>
                  </div>

                  {(hasLining || hasEmbroidery) && (
                    <>
                      <div className="summary-section-label">Add-ons</div>
                      {hasLining && (
                        <div className="summary-row">
                          <span>Lining</span>
                          <strong>Premium</strong>
                        </div>
                      )}
                      {hasEmbroidery && (
                        <div className="summary-row">
                          <span>Embroidery</span>
                          <strong>{embroideryDetails.method} {embroideryDetails.type}</strong>
                        </div>
                      )}
                    </>
                  )}

                  <div className="summary-section-label">Price Breakdown</div>
                  <div className="summary-row">
                    <span>Base Price</span>
                    <span>₹{priceDetails.base.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Customization</span>
                    <span>₹{priceDetails.customization.toLocaleString()}</span>
                  </div>
                  {priceDetails.fabricCost > 0 && (
                    <div className="summary-row">
                      <span>Fabric Cost</span>
                      <span>₹{priceDetails.fabricCost.toLocaleString()}</span>
                    </div>
                  )}
                  {hasLining && (
                    <div className="summary-row">
                      <span>Lining</span>
                      <span>₹{priceDetails.lining.toLocaleString()}</span>
                    </div>
                  )}
                  {hasEmbroidery && (
                    <div className="summary-row">
                      <span>Embroidery</span>
                      <span>₹{priceDetails.embroidery.toLocaleString()}</span>
                    </div>
                  )}
                  {priceDetails.priorityFee > 0 && (
                    <div className="summary-row">
                      <span>Rush Fee ({priceDetails.daysFromNow} days)</span>
                      <span>₹{priceDetails.priorityFee.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '12px 0' }} />
                  <div className="summary-row total">
                    <span>Final Estimated Total</span>
                    <strong>₹{priceDetails.total.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="action-buttons">
                  {activeStep === 1 ? (
                    <button 
                      className="btn-next-step"
                      onClick={() => {
                        if (measurementMode === 'new' && garmentConfig[garmentType]?.some(f => !measurements[f])) {
                          toast.warning('Please provide all measurements');
                          return;
                        }
                        applyAISuggestions();
                        setActiveStep(2);
                      }}
                    >
                      Next: Customization Studio <FaChevronRight style={{ fontSize: '10px' }} />
                    </button>
                  ) : activeStep === 2 ? (
                    <>
                      <button 
                        className="btn-save-draft"
                        onClick={() => setActiveStep(1)}
                        style={{ marginBottom: '12px' }}
                      >
                        <FaChevronLeft style={{ marginRight: '8px', fontSize: '12px' }} /> Back to Details
                      </button>
                      <button 
                        className="btn-submit-order"
                        onClick={() => setActiveStep(3)}
                        style={{ backgroundColor: '#ad1457', color: 'white' }}
                      >
                        Continue to Timeline <FaChevronRight style={{ marginLeft: '8px', fontSize: '12px' }} />
                      </button>
                    </>
                  ) : activeStep === 3 ? (
                    <>
                      <button 
                        className="btn-save-draft"
                        onClick={() => setActiveStep(2)}
                        style={{ marginBottom: '12px' }}
                      >
                        <FaChevronLeft style={{ marginRight: '8px', fontSize: '12px' }} /> Back to Studio
                      </button>
                      <button 
                        className="btn-submit-order"
                        onClick={(e) => handleSubmit(e)}
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : (
                          <>Submit Request <FaPaperPlane /></>
                        )}
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn-submit-order"
                      onClick={(e) => handleSubmit(e)}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : (
                        <>Submit Request <FaPaperPlane /></>
                      )}
                    </button>
                  )}
                </div>
              </section>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
