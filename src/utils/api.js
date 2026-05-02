const BASE_URL = 'http://4.237.58.241:3000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  return data;
};

// ─── Rentals ────────────────────────────────────────────────────────────────
export const fetchStates = () =>
  fetch(`${BASE_URL}/rentals/states`).then(handleResponse);

export const fetchPropertyTypes = () =>
  fetch(`${BASE_URL}/rentals/property-types`).then(handleResponse);

export const searchRentals = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) query.append(k, v);
  });
  return fetch(`${BASE_URL}/rentals/search?${query}`).then(handleResponse);
};

export const fetchRental = (id) =>
  fetch(`${BASE_URL}/rentals/${id}`).then(handleResponse);

// ─── Ratings ────────────────────────────────────────────────────────────────
export const fetchMyRatings = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) query.append(k, v);
  });
  return fetch(`${BASE_URL}/ratings?${query}`, {
    headers: getAuthHeader(),
  }).then(handleResponse);
};

export const fetchRatingForRental = (id) =>
  fetch(`${BASE_URL}/ratings/rentals/${id}`, {
    headers: getAuthHeader(),
  }).then(handleResponse);

export const postRating = (id, rating) =>
  fetch(`${BASE_URL}/ratings/rentals/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ rating }),
  }).then(handleResponse);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (email, password) =>
  fetch(`${BASE_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);

  if (data?.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
};