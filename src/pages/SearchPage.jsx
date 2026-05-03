import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchRentals, fetchStates, fetchPropertyTypes } from '../utils/api';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState';
import Pagination from '../components/Pagination';


const formatPrice = (p) =>
  p != null ? `$${Number(p).toLocaleString('en-AU')}/wk` : '—';


const getAddressFromCoords = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name || 'Unknown location';
  } catch {
    return 'Unknown location';
  }
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [states, setStates] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    suburb: searchParams.get('suburb') || '',
    postcode: searchParams.get('postcode') || '',
    propertyType: searchParams.get('propertyType') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    parkingSpaces: searchParams.get('parkingSpaces') || '',
    sort_col: searchParams.get('sort_col') || '',
    sort_order: searchParams.get('sort_order') || 'asc',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [addressCache, setAddressCache] = useState({});
  const debounceRef = useRef(null);


  useEffect(() => {
    fetchStates().then(setStates).catch(() => {});
    fetchPropertyTypes().then(setPropertyTypes).catch(() => {});
  }, []);


  const doSearch = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const params = { ...currentFilters, page: currentPage,
          property_type: currentFilters.propertyType,
          parking_spaces: currentFilters.parkingSpaces, };

      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] == null) delete params[k];
      });

      const data = await searchRentals(params);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      doSearch(filters, page);

      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      if (page > 1) params.page = page;
      setSearchParams(params, { replace: true });
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [filters, page, doSearch, setSearchParams]);


  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      state: '',
      suburb: '',
      postcode: '',
      property_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
      parkingSpaces: '',
      sort_col: '',
      sort_order: 'asc',
    });
    setPage(1);
  };

  const rentals = results?.rentals || results?.data || [];
  const totalCount =
    results?.pagination?.total ||
    results?.total ||
    rentals.length;

  const totalPages =
    results?.pagination?.lastPage ||
    results?.lastPage ||
    1;

  const getDisplayAddress = (r) => {
    const key = `${r.latitude},${r.longitude}`;

    if (r.address) return r.address;
    if (addressCache[key]) return addressCache[key];

    // async resolve trigger (safe)
    if (r.latitude && r.longitude && !addressCache[key]) {
      getAddressFromCoords(r.latitude, r.longitude).then((addr) => {
        setAddressCache((prev) => ({ ...prev, [key]: addr }));
      });
    }

    return 'Loading address...';
  };

  return (
    <div className="search-page">
      <div className="search-page__sidebar">
        <div className="filter-panel">

          <div className="filter-panel__header">
            <div>
              <h2>Filters</h2>
            </div>

            <button
              className="filter-reset-btn"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>

          <div className="filter-section">
            <select
              className="filter-select"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

          <select
            className="filter-select"
            value={filters.propertyType}
            onChange={(e) =>
              handleFilterChange('propertyType', e.target.value)
            }
          >
            <option value="">All Types</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          </div>

          <div className="filter-section">
            <input
              className="filter-input"
              placeholder="Suburb"
              value={filters.suburb}
              onChange={(e) =>
                handleFilterChange('suburb', e.target.value)
              }
            />

            <input
              className="filter-input"
              placeholder="Postcode"
              value={filters.postcode}
              onChange={(e) =>
                handleFilterChange('postcode', e.target.value)
              }
            />
          </div>

          <div className="filter-section">
            <input
              className="filter-input"
              type="number"
              placeholder="Min Price"
              value={filters.min_price}
              onChange={(e) =>
                handleFilterChange('min_price', e.target.value)
              }
            />

            <input
              className="filter-input"
              type="number"
              placeholder="Max Price"
              value={filters.max_price}
              onChange={(e) =>
                handleFilterChange('max_price', e.target.value)
              }
            />

            <input
              className="filter-input"
              type="number"
              placeholder="Bedrooms"
              value={filters.bedrooms}
              onChange={(e) =>
                handleFilterChange('bedrooms', e.target.value)
              }
            />

            <input
              className="filter-input"
              type="number"
              placeholder="Bathrooms"
              value={filters.bathrooms}
              onChange={(e) =>
                handleFilterChange('bathrooms', e.target.value)
              }
            />

            <input
              className="filter-input"
              type="number"
              placeholder="Parking Spaces"
              value={filters.parkingSpaces}
              onChange={(e) =>
                handleFilterChange('parkingSpaces', e.target.value)
              }
            />
          </div>

        </div>
      </div>

      <div className="search-page__results">

        <h1>
          {loading ? 'Searching…' : `${totalCount} results found`}
        </h1>

        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}

        {!loading && rentals.length === 0 && (
          <EmptyState title="No results found" />
        )}

        {!loading && rentals.length > 0 && (
          <>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Suburb</th>
                  <th>State</th>
                  <th>Type</th>
                  <th>Bed</th>
                  <th>Bath</th>
                  <th>Park</th>
                  <th>Price</th>
                </tr>
              </thead>

              <tbody>
                {rentals.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/rental/${r.id}`)}
                  >
                    <td>{getDisplayAddress(r)}</td>
                    <td>{r.suburb || '—'}</td>
                    <td>{r.state || '—'}</td>
                    <td>{r.propertyType || r.type || '—'}</td>
                    <td>{r.bedrooms ?? '—'}</td>
                    <td>{r.bathrooms ?? '—'}</td>
                    <td>{r.parkingSpaces ?? r.parking_spaces ?? '—'}</td>
                    <td>{formatPrice(r.price ?? r.rent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default SearchPage;