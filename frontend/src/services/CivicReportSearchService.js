// ==========================================
// JanaoBangla — Civic Report Search Service (Frontend)
// BRANCH: feature-civic-report-search-filter-and-analytics
// Search, multi-criteria filter, ar sorting API call ekhane manage hoy
// ==========================================

import { searchApi } from './ApiService';

// ==========================================
// searchReports — Query parameters diye backend search API call kora
// ==========================================
export async function searchReports(params = {}) {
  // Search and filter parameters backend e pathano hocche
  const response = await searchApi.search(params);
  return response.data;
}

// ==========================================
// getSearchMetadata — Filter options & distinct counts fetch kora
// ==========================================
export async function getSearchMetadata() {
  // Categories, divisions, and status counts metadata fetch kora hocche
  const response = await searchApi.getMetadata();
  return response.data;
}
