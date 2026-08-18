// ==========================================
// JanaoBangla — Smart Problem Category Suggestion Component
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// AI je category suggest koreche ta dekhay ebong user ke
// one-click accept ba customize korar option dey
// ==========================================

import React from 'react';
import '../styles/ai.css';

function SmartProblemCategorySuggestion({
  suggestedCategory,
  currentCategory,
  confidence,
  onAcceptCategory,
  onDismiss
}) {
  // Ei component AI suggested category card render korbe

  if (!suggestedCategory) return null;

  const categoryDetails = {
    road_damage: { label: 'Road Damage', bn: 'সড়ক ক্ষতিগ্রস্ত / গর্ত', icon: '🛣️' },
    garbage_waste: { label: 'Garbage / Waste', bn: 'ময়লা-আবর্জনা ও বর্জ্য', icon: '🗑️' },
    street_light: { label: 'Street Light', bn: 'রাস্তার বাতি নষ্ট / অন্ধকার', icon: '💡' },
    water_drainage: { label: 'Water / Drainage', bn: 'পানি নিষ্কাশন ও জলাবদ্ধতা', icon: '🌊' },
    traffic_accident: { label: 'Traffic / Accident', bn: 'যানজট ও দুর্ঘটনা ঝুঁকি', icon: '🚦' },
    public_safety: { label: 'Public Safety', bn: 'জননিরাপত্তা ঝুঁকি', icon: '🛡️' }
  };

  const matched = categoryDetails[suggestedCategory] || { label: suggestedCategory, bn: '', icon: '📌' };
  const isAlreadySelected = currentCategory === suggestedCategory;

  return (
    <div className="ai-widget-card" style={{ borderLeftColor: '#16A34A', background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
      <div className="ai-widget-header">
        <div className="ai-badge" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
          💡 AI Recommended Category
        </div>
        {confidence && (
          <span className="badge bg-success" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
            {confidence}% Match
          </span>
        )}
      </div>

      <div className="ai-suggestion-box" style={{ borderLeftColor: '#16A34A', backgroundColor: '#FFFFFF', border: '1px solid #BBF7D0' }}>
        <div className="ai-suggestion-title" style={{ color: '#15803D', fontSize: '1rem' }}>
          <span>{matched.icon}</span> <strong>{matched.label}</strong> {matched.bn && <span className="text-muted" style={{ fontSize: '0.85rem' }}>({matched.bn})</span>}
        </div>
        <p className="mb-0 mt-1" style={{ fontSize: '0.84rem', color: '#334155' }}>
          Based on the analyzed visual and problem characteristics, classifying under <strong>{matched.label}</strong> ensures priority routing to the appropriate municipal authority.
        </p>
      </div>

      <div className="ai-actions-row">
        {!isAlreadySelected ? (
          <button
            type="button"
            className="btn-ai-apply"
            onClick={() => onAcceptCategory(suggestedCategory)}
            style={{ backgroundColor: '#15803D' }}
          >
            ✓ Accept & Switch to {matched.label}
          </button>
        ) : (
          <div className="text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.88rem' }}>
            <span>✅</span> Selected category matches AI recommendation.
          </div>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn-ai-secondary"
            onClick={onDismiss}
          >
            Keep Manual Category
          </button>
        )}
      </div>
    </div>
  );
}

export default SmartProblemCategorySuggestion;
