import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price) => {
  if (!price && price !== 0) return 'N/A';
  return `$${Number(price).toLocaleString('en-AU')}/wk`;
};

const RentalCard = ({ rental }) => {
  const navigate = useNavigate();

  const image =
    rental?.images?.[0] ||
    rental?.image_url ||
    'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <article
      className="rental-card"
      onClick={() => navigate(`/rental/${rental.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/rental/${rental.id}`)}
    >

      {/* IMAGE */}
      <div className="rental-card__image-wrapper">
        <img
          src={image}
          alt={rental.address || 'Rental property'}
          className="rental-card__image"
          loading="lazy"
        />

        <div className="rental-card__image-overlay" />

        <span className="rental-card__badge">
          {rental.property_type || 'Property'}
        </span>
      </div>

      {/* CONTENT */}
      <div className="rental-card__content">

        <div className="rental-card__top">
          <h3 className="rental-card__address">
            {rental.address || 'Address not available'}
          </h3>

          <span className="rental-card__price">
            {formatPrice(rental.price)}
          </span>
        </div>

        <div className="rental-card__meta">
          <span>{rental.suburb}, {rental.state}</span>
          <span>{rental.postcode || '—'}</span>
        </div>

        <div className="rental-card__details">
          {rental.bedrooms != null && (
            <span className="rental-card__pill">🛏 {rental.bedrooms}</span>
          )}
          {rental.bathrooms != null && (
            <span className="rental-card__pill">🚿 {rental.bathrooms}</span>
          )}
          {rental.parking_spaces != null && (
            <span className="rental-card__pill">🚗 {rental.parking_spaces}</span>
          )}
        </div>

      </div>
    </article>
  );
};

export default RentalCard;