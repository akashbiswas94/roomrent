import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStates } from '../utils/api';

const STATS = [
  { value: '8', label: 'States & Territories' },
  { value: '2026', label: 'Market Snapshot' },
  { value: '100%', label: 'Free to Browse' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [quickState, setQuickState] = useState('');

  useEffect(() => {
    fetchStates().then(setStates).catch(() => {});
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = quickState ? `?state=${quickState}` : '';
    navigate(`/search${params}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__grid" />
        </div>
        <div className="hero__content">
          <span className="hero__eyebrow">Australia's Rental Market · 2026</span>
          <h1 className="hero__title">
            Find Your<br />
            <span className="hero__title-accent">Next Home</span>
          </h1>
          <p className="hero__subtitle">
            Browse thousands of rental properties across every Australian state and territory.
            Detailed listings, map views, and community ratings — all in one place.
          </p>
          <form className="hero__search" onSubmit={handleQuickSearch}>
            <select
              className="hero__select"
              value={quickState}
              onChange={(e) => setQuickState(e.target.value)}
              aria-label="Filter by state"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button type="submit" className="btn btn--hero">
              Search Rentals →
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-card__value">{s.value}</span>
                <span className="stat-card__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
<section className="features">
  <div className="container">
    <div className="features__header">
      <span className="features__tag">Premium Features</span>
      <h2 className="section-title">Everything You Need</h2>
      <p className="features__subtitle">
        Discover smarter ways to search, compare, and secure your next rental home.
      </p>
    </div>

    <div className="features__grid">
      <div className="feature-card">
        <div className="feature-card__icon">🔍</div>
        <span className="feature-card__label">Smart Search</span>
        <h3>Advanced Search</h3>
        <p>
          Filter properties by state, bedrooms, bathrooms, price range,
          and more with instant results.
        </p>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/search')}
        >
          Search Now →
        </button>
      </div>

      <div className="feature-card">
        <div className="feature-card__icon">🗺️</div>
        <span className="feature-card__label">Live Maps</span>
        <h3>Interactive Map View</h3>
        <p>
          Explore exact property locations, nearby suburbs, and rental
          hotspots across Australia.
        </p>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/search')}
        >
          Explore →
        </button>
      </div>

      <div className="feature-card">
        <div className="feature-card__icon">⭐</div>
        <span className="feature-card__label">Community</span>
        <h3>Ratings & Reviews</h3>
        <p>
          See what renters think, rate properties, and build your
          personalized watchlist.
        </p>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/register')}
        >
          Join Free →
        </button>
      </div>
    </div>
  </div>
</section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to find your next home?</h2>
            <p>Create a free account to rate properties and track your favourites.</p>
            <div className="cta-box__actions">
              <button className="btn btn--white" onClick={() => navigate('/register')}>Create Account</button>
              <button className="btn btn--ghost-white" onClick={() => navigate('/search')}>Browse Listings</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
