import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaHeart, 
  FaStar, 
  FaShoppingBag, 
  FaBell,
  FaArrowRight,
  FaChevronRight
} from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import './FabricCatalog.css';

export default function FabricCatalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('Popularity');

  const previousForm = location.state?.previousForm;

  const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

  const categories = useMemo(() => {
    const counts = fabrics.reduce((acc, f) => {
      const cat = f.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Silk', count: counts['silk'] || 0 },
      { name: 'Cotton', count: counts['cotton'] || 0 },
      { name: 'Velvet', count: counts['velvet'] || counts['other'] || 0 },
      { name: 'Linen', count: counts['linen'] || 0 },
      { name: 'Wool', count: counts['wool'] || 0 },
      { name: 'Denim', count: counts['denim'] || 0 },
      { name: 'Chiffon', count: counts['chiffon'] || 0 }
    ];
  }, [fabrics]);

  const colors = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#000000', '#ffffff', '#e91e63', '#9c27b0'];

  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        const res = await axios.get('/api/fabrics');
        setFabrics(res.data.fabrics || []);
      } catch (e) {
        console.error('Failed to fetch fabrics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFabrics();
  }, []);

  const filteredFabrics = useMemo(() => {
    let result = fabrics;

    if (searchQuery) {
      result = result.filter(f => 
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.material?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(f => f.category === selectedCategory.toLowerCase() || f.type === selectedCategory || f.material === selectedCategory);
    }

    return result;
  }, [fabrics, searchQuery, selectedCategory]);

  const getFabricImage = (fabric) => {
    if (fabric.images && fabric.images.length > 0 && fabric.images[0].url) {
      if (fabric.images[0].url.startsWith('http')) return fabric.images[0].url;
      return `${API_URL}${fabric.images[0].url}`;
    }

    // High quality placeholders based on material/category
    const material = (fabric.material || fabric.category || '').toLowerCase();
    if (material.includes('silk')) return 'https://images.unsplash.com/photo-1601662528567-526cd06f6582?w=500'; // Blue Silk
    if (material.includes('velvet')) return 'https://images.unsplash.com/photo-1590736969955-71cc94828144?w=500'; // Velvet
    if (material.includes('cotton')) return 'https://images.unsplash.com/photo-1598104358204-87cefc7c5986?w=500'; // Cotton
    if (material.includes('linen')) return 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=500'; // Linen
    if (material.includes('denim')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'; // Denim
    if (material.includes('chiffon')) return 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500'; // Chiffon
    if (material.includes('wool')) return 'https://images.unsplash.com/photo-1463100099907-44d70a43c042?w=500'; // Wool
    
    return 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500'; // Default fabric
  };

  const handleAddToRequest = (fabric) => {
    // Navigate back to New Order with selected fabric info and previous form state
    navigate('/portal/orders/new', { 
      state: { 
        selectedFabric: fabric,
        materialSource: 'catalog',
        previousForm: previousForm
      } 
    });
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <DashboardLayout>
      <div className="fabric-catalog-portal">
        <header className="catalog-header">
          <div>
            <div className="breadcrumbs">
              <Link to="/portal">Home</Link> <span>›</span> Cloth Catalog
            </div>
            <h1 className="page-title">Browse Premium Cloth Materials</h1>
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

        <div className="catalog-layout">
          {/* Sidebar Filters */}
          <aside className="filter-sidebar">
            <div className="filter-card">
              <div className="filter-header">
                <span className="filter-title"><FaFilter /> Filters</span>
                <span className="clear-all" onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setPriceRange('All');
                }}>Clear All</span>
              </div>

              <div className="search-filter">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search cloth..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-section">
                <span className="filter-section-title">Categories</span>
                <div className="category-list">
                  {categories.map(cat => (
                    <div 
                      key={cat.name} 
                      className="category-item"
                      onClick={() => setSelectedCategory(cat.name)}
                    >
                      <div className="category-label">
                        <div className={`radio-dot ${selectedCategory === cat.name ? 'active' : ''}`} 
                             style={selectedCategory === cat.name ? { backgroundColor: '#e91e63', borderColor: '#e91e63' } : {}}
                        />
                        {cat.name}
                      </div>
                      <span className="category-count">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <span className="filter-section-title">Color</span>
                <div className="color-grid">
                  {colors.map(color => (
                    <div 
                      key={color} 
                      className="color-dot" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <span className="filter-section-title">Price Range (Affordable)</span>
                <div className="price-options">
                  <label className="price-option">
                    <input type="radio" name="price" /> Under ₹1,500
                  </label>
                  <label className="price-option">
                    <input type="radio" name="price" /> ₹1,500 - ₹3,000
                  </label>
                </div>
              </div>

              <div className="filter-section">
                <span className="filter-section-title">Price / Yard (₹)</span>
                <div className="price-range-inputs">
                  <input type="text" placeholder="Min ₹" />
                  <span className="price-sep">-</span>
                  <input type="text" placeholder="Max ₹" />
                </div>
              </div>
            </div>

            <div className="promo-card">
              <div className="promo-tag">
                <FaStar /> New Arrivals
              </div>
              <p>Check out our latest collection of premium Italian silks.</p>
              <button className="view-coll-btn">
                View Collection <FaArrowRight style={{ fontSize: '10px' }} />
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="catalog-content">
            <div className="catalog-toolbar">
              <div className="results-count">
                Showing <b>{filteredFabrics.length}</b> of <b>{fabrics.length}</b> fabrics
              </div>
              <div className="sort-select">
                Sort by:
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="catalog-loading">
                <div className="spinner"></div>
                <p>Curating your premium collection...</p>
              </div>
            ) : fabrics.length === 0 ? (
              <div className="empty-catalog">
                <h3>No fabrics found</h3>
                <p>We're currently updating our catalog with new premium materials. Please check back later.</p>
                <button className="view-coll-btn" onClick={() => window.location.reload()}>
                  Refresh Catalog
                </button>
              </div>
            ) : (
              <div className="fabric-grid">
                {filteredFabrics.map(fabric => (
                  <div key={fabric._id} className="fabric-card">
                    <div className="fabric-image-container">
                      <img src={getFabricImage(fabric)} alt={fabric.name} />
                      <button className="heart-btn"><FaHeart /></button>
                      <span className="fabric-tag">{fabric.material || fabric.type || 'Material'}</span>
                      {fabric.stock < 10 && <span className="sale-badge">SALE</span>}
                    </div>
                    <div className="fabric-info">
                      <div className="fabric-name-row">
                        <h3 className="fabric-name">{fabric.name}</h3>
                        <span className="fabric-price">₹{fabric.price}</span>
                      </div>
                      <div className="fabric-meta">
                        <span className="fabric-type">{fabric.description?.substring(0, 30)}...</span>
                        <span className="price-unit">per yard</span>
                      </div>
                      <div className="rating-row">
                        <div className="stars">
                          <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                        </div>
                        <span className="reviews-count">({Math.floor(Math.random() * 50) + 10} reviews)</span>
                      </div>
                      <button 
                        className="add-to-request-btn"
                        onClick={() => handleAddToRequest(fabric)}
                      >
                        <FaShoppingBag /> Add to Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
