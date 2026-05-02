import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Map, Marker } from 'pigeon-maps';
import {
  fetchRental,
  fetchRatingForRental,
  postRating,
  searchRentals,
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { LoadingState, ErrorState } from '../components/LoadingState';

const formatPrice = (p) =>
  p != null ? `$${Number(p).toLocaleString('en-AU')}/wk` : '—';

/* =========================
   DESCRIPTION RENDER (SAFE)
========================= */
const renderDescription = (text) => {
  if (!text) return <p>No description available.</p>;

  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map((line, i) =>
      line.trim() ? <p key={i}>{line}</p> : <br key={i} />
    );
};

/* =========================
   DETAIL ROW (SAFE)
========================= */
const DetailRow = ({ label, value }) => {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '');

  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">
        {isEmpty ? '—' : value}
      </span>
    </div>
  );
};

const RentalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [myRating, setMyRating] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMsg, setRatingMsg] = useState('');

  const [nearby, setNearby] = useState([]);

  /* =========================
     LOAD PROPERTY
  ========================= */
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchRental(id)
      .then((data) => {
        setRental(data);

        if (data?.postcode) {
          searchRentals({ postcode: data.postcode, limit: 6 })
            .then((res) => {
              const all = res?.rentals || res?.data || res || [];
              setNearby(
                all.filter((r) => String(r.id) !== String(id)).slice(0, 5)
              );
            })
            .catch(() => {});
        }
      })
      .catch((err) =>
        setError(err.message || 'Failed to load property.')
      )
      .finally(() => setLoading(false));
  }, [id]);

  /* =========================
     LOAD RATING
  ========================= */
  useEffect(() => {
    if (!user) return;

    setRatingLoading(true);

    fetchRatingForRental(id)
      .then((data) => {
        setMyRating(data?.rating || 0);
        setAvgRating(data?.average_rating ?? data?.avgRating ?? null);
      })
      .catch(() => {})
      .finally(() => setRatingLoading(false));
  }, [id, user]);

  /* =========================
     RATE PROPERTY
  ========================= */
  const handleRate = useCallback(
    async (star) => {
      if (!user) {
        setRatingMsg('Please log in to rate properties.');
        return;
      }

      setRatingLoading(true);
      setRatingMsg('');

      try {
        const data = await postRating(id, star);
        setMyRating(star);
        setAvgRating(data?.average_rating ?? data?.avgRating ?? null);
        setRatingMsg('Rating saved!');
      } catch (err) {
        setRatingMsg(err.message || 'Failed to save rating.');
      } finally {
        setRatingLoading(false);
      }
    },
    [id, user]
  );

  if (loading) return <LoadingState message="Loading property details…" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!rental) return null;

  const lat = parseFloat(rental.latitude);
  const lng = parseFloat(rental.longitude);
  const hasCoords = !isNaN(lat) && !isNaN(lng);

  return (
    <div className="detail-page">
      <div className="container">

        {/* =========================
            HEADER NAV
        ========================= */}
        <nav className="breadcrumb">
            <button
              className="breadcrumb__link"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            <span className="breadcrumb__sep">/</span>

            <button
              className="breadcrumb__link"
              onClick={() => navigate('/search')}
            >
              Search
            </button>

            <span className="breadcrumb__sep">/</span>

            <span className="breadcrumb__current">
              {rental?.address?.trim()
                ? rental.address
                : `Property #${rental?.id || id}`}
            </span>
          </nav>

        <div className="detail-page__grid">

          {/* =========================
              LEFT
          ========================= */}
          <div className="detail-page__info">

            {/* HEADER */}
            <div className="detail-page__header">
              <div>
                <span className="badge badge--lg">
                  {rental.property_type || 'Property'}
                </span>

                <h1 className="detail-page__title">
                  {rental.address}
                </h1>

                <p className="detail-page__location">
                  {rental.suburb}, {rental.state} {rental.postcode}
                </p>
              </div>

              <div className="detail-page__price">
                {formatPrice(rental.price)}
              </div>
            </div>

            {/* STATS (FIXED GRID UI) */}
            <div className="detail-stats">
              <div className="detail-stat">
                <span className="detail-stat__icon">🛏</span>
                <span className="detail-stat__val">{rental.bedrooms ?? 0}</span>
                <span className="detail-stat__label">Bedrooms</span>
              </div>

              <div className="detail-stat">
                <span className="detail-stat__icon">🚿</span>
                <span className="detail-stat__val">{rental.bathrooms ?? 0}</span>
                <span className="detail-stat__label">Bathrooms</span>
              </div>

              <div className="detail-stat">
                <span className="detail-stat__icon">🚗</span>
                <span className="detail-stat__val">{rental.parking_spaces ?? 0}</span>
                <span className="detail-stat__label">Parking</span>
              </div>
            </div>

          {/* DETAILS */}
          <div className="detail-card">
            <h2 className="detail-card__title">Property Details</h2>

            <DetailRow
              label="Weekly Rent"
              value={
                rental.rent != null
                  ? `$${Number(rental.rent).toLocaleString('en-AU')}/wk`
                  : '—'
              }
            />

            <DetailRow
              label="Property Type"
              value={rental.propertyType || '—'}
            />

            <DetailRow
              label="Location"
              value={
                rental.latitude && rental.longitude
                  ? `${rental.latitude}, ${rental.longitude}`
                  : '—'
              }
            />

            <DetailRow
              label="Post Code"
              value={rental.postcode || '—'}
            />

            <DetailRow
              label="State"
              value={rental.state || '—'}
            />

            <DetailRow
              label="Street Address"
              value={rental.streetAddress || rental.address || '—'}
            />

            <DetailRow
              label="Suburb"
              value={rental.suburb || '—'}
            />

            <DetailRow
              label="Rating"
              value={
                rental.averageRating != null
                  ? `${rental.averageRating} ⭐ (${rental.numRatings || 0})`
                  : 'No ratings'
              }
            />
          </div>

            {/* DESCRIPTION */}
            <div className="detail-card">
              <h2 className="detail-card__title">Description</h2>
              <div className="detail-description">
                {renderDescription(rental.description)}
              </div>
            </div>

            {/* RATINGS */}
            <div className="detail-card">
              <h2 className="detail-card__title">Ratings</h2>

              {/* Average rating */}
              {avgRating != null && (
                <div className="rating-avg">
                  <StarRating
                    value={Math.round(avgRating)}
                    readonly
                    size="lg"
                  />
                  <span className="rating-avg__text">
                    Average: {Number(avgRating).toFixed(1)} / 5
                  </span>
                </div>
              )}

              {/* User rating */}
              {user ? (
                <div className="rating-user">
                  <p className="rating-user__label">
                    {myRating
                      ? `Your rating: ${myRating}`
                      : 'Rate this property:'}
                  </p>

                  {ratingLoading ? (
                    <div className="rating-loading">Saving…</div>
                  ) : (
                    <div className="rating-stars">
                      <StarRating
                        value={myRating}
                        onChange={handleRate}
                        size="lg"
                      />
                    </div>
                  )}

                  {ratingMsg && (
                    <p
                      className={`rating-msg ${
                        ratingMsg === 'Rating saved!'
                          ? 'rating-msg--success'
                          : 'rating-msg--error'
                      }`}
                    >
                      {ratingMsg}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rating-login">
                  <p className="rating-login__text">
                    You need to be logged in to rate this property
                  </p>
                  <button
                    className="rating-login__btn"
                    onClick={() => navigate('/login')}
                  >
                    Log in
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* =========================
              RIGHT
          ========================= */}
          <div className="detail-page__map-col">

            {hasCoords ? (
              <div className="map-wrapper">
                <h2 className="map-wrapper__title">Location</h2>

                <Map height={380} center={[lat, lng]} zoom={14}>
                  <Marker anchor={[lat, lng]} />
                </Map>
              </div>
            ) : (
              <div className="map-placeholder">
                Map not available
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default RentalDetailPage;