import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyRatings, fetchRental } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState';
import Pagination from '../components/Pagination';

const LIMIT = 10;

const MyRatingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detailed rental info keyed by id
  const [rentalDetails, setRentalDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadRatings = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyRatings({ page: currentPage, limit: LIMIT });
      const list = data?.ratings || data?.data || data || [];
      setRatings(list);
      const last = data?.pagination?.lastPage || data?.lastPage || 1;
      setTotalPages(last);

      // Fetch rental details for each rating
      if (list.length > 0) {
        setDetailsLoading(true);
        const detailPromises = list.map((r) =>
          fetchRental(r.rental_id || r.rentalId || r.id)
            .then((detail) => ({ id: r.rental_id || r.rentalId || r.id, detail }))
            .catch(() => ({ id: r.rental_id || r.rentalId || r.id, detail: null }))
        );
        const results = await Promise.allSettled(detailPromises);
        const detailMap = {};
        results.forEach((res) => {
          if (res.status === 'fulfilled' && res.value.detail) {
            detailMap[res.value.id] = res.value.detail;
          }
        });
        setRentalDetails(detailMap);
        setDetailsLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your ratings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadRatings(page);
  }, [user, page, loadRatings, navigate]);

  if (loading) return <LoadingState message="Loading your ratings…" />;
  if (error) return <ErrorState message={error} onRetry={() => loadRatings(page)} />;

  return (
    <div className="my-ratings-page container">
      <h1 className="page-title">My Rated Properties</h1>
      <p className="page-subtitle">Properties you've rated as {user?.email}</p>

      {ratings.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No ratings yet"
          subtitle="Browse properties and rate them to see them here."
        />
      ) : (
        <>
          <div className="ratings-grid">
            {ratings.map((r) => {
              const rentalId = r.rental_id || r.rentalId || r.id;
              const detail = rentalDetails[rentalId];
              return (
                <article
                  key={rentalId}
                  className="rating-card"
                  onClick={() => navigate(`/rental/${rentalId}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/rental/${rentalId}`)}
                >
                  <div className="rating-card__header">
                    {detail ? (
                      <>
                        <span className="badge">{detail.property_type}</span>
                        <h3 className="rating-card__address">{detail.address || `Property #${rentalId}`}</h3>
                        <p className="rating-card__location">
                          {detail.suburb}, {detail.state} {detail.postcode}
                        </p>
                        {detail.price && (
                          <p className="rating-card__price">
                            ${Number(detail.price).toLocaleString('en-AU')}/wk
                          </p>
                        )}
                      </>
                    ) : (
                      <h3 className="rating-card__address">Property #{rentalId}</h3>
                    )}
                  </div>
                  <div className="rating-card__stars">
                    <StarRating value={r.rating} readonly size="md" />
                    <span className="rating-card__star-label">Your rating: {r.rating}/5</span>
                  </div>
                  <div className="rating-card__footer">
                    <span className="btn btn--sm btn--ghost">View Property →</span>
                  </div>
                </article>
              );
            })}
          </div>

          {detailsLoading && (
            <p className="ratings-hint">Loading property details…</p>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
};

export default MyRatingsPage;
