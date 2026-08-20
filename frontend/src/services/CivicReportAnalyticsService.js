// ==========================================
// JanaoBangla — Civic Report Analytics Service (Frontend)
// BRANCH: feature-civic-report-search-filter-and-analytics
// Overview stats, category breakdown, timeline trends, and area-based analytics API wrapper
// ==========================================

import { analyticsApi } from './ApiService';

// ==========================================
// getOverviewStatistics — Summary metric counts fetch kora
// ==========================================
export async function getOverviewStatistics() {
  // Overall statistics fetch request pathano hocche
  const response = await analyticsApi.getOverview();
  return response.data;
}

// ==========================================
// getCategoryAnalytics — Category distribution data fetch kora
// ==========================================
export async function getCategoryAnalytics() {
  // Category-wise metrics fetch request pathano hocche
  const response = await analyticsApi.getCategories();
  return response.data;
}

// ==========================================
// getTimelineTrends — Timeline trends data fetch kora
// ==========================================
export async function getTimelineTrends() {
  // Monthly and daily trends fetch request pathano hocche
  const response = await analyticsApi.getTrends();
  return response.data;
}

// ==========================================
// getAreaAnalytics — Area based analytics & division comparison fetch kora
// ==========================================
export async function getAreaAnalytics() {
  // Area problem distribution and hotspots fetch request pathano hocche
  const response = await analyticsApi.getAreas();
  return response.data;
}

// ==========================================
// getPriorityAndStatusDistribution — Priority and status breakdowns fetch kora
// ==========================================
export async function getPriorityAndStatusDistribution() {
  // Priority and status distribution fetch request pathano hocche
  const response = await analyticsApi.getPriorityAndStatus();
  return response.data;
}
