// ==========================================
// JanaoBangla — AI Problem Category & Smart Suggestion Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Evidence-based description enhancer, realistic title generator, and neutral action recommendations
// ==========================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIImageBasedProblemRecognitionService = require('./AIImageBasedProblemRecognitionService');

class AIProblemCategorySuggestionService {

  // ==========================================
  // suggestCategoryFromText — User er lekha title/description theke category suggest kore
  // ==========================================
  static async suggestCategoryFromText(text = '') {
    const cleanText = (text || '').trim().toLowerCase();
    const kb = AIImageBasedProblemRecognitionService.getKnowledgeBase();

    if (!cleanText) {
      const defaultItem = kb['road_damage'];
      return {
        categoryKey: 'road_damage',
        categoryName: defaultItem.name,
        categoryNameBn: defaultItem.bnName,
        confidence: 75,
        severity: defaultItem.defaultSeverity,
        advice: 'Please describe the problem details.'
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const isValidGeminiKey = apiKey && apiKey.startsWith('AIza') && apiKey.length > 25;

    if (isValidGeminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an AI Civic Problem Classifier for JanaoBangla in Bangladesh.
Classify this civic issue text into exactly one category:
"${cleanText}"

Allowed categories:
- road_damage
- garbage_waste
- street_light
- water_drainage
- traffic_accident
- public_safety

Respond ONLY with valid raw JSON:
{
  "categoryKey": "road_damage" | "garbage_waste" | "street_light" | "water_drainage" | "traffic_accident" | "public_safety",
  "confidence": integer between 65 and 98,
  "severity": "low" | "medium" | "high" | "critical" | "unable_to_determine"
}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOut = response.text().trim();
        const cleanJsonStr = textOut.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        if (kb[parsed.categoryKey]) {
          const item = kb[parsed.categoryKey];
          return {
            categoryKey: parsed.categoryKey,
            categoryName: item.name,
            categoryNameBn: item.bnName,
            confidence: Math.min(99, Math.max(65, parseInt(parsed.confidence) || 88)),
            severity: parsed.severity || item.defaultSeverity,
            advice: `Suggested Category: ${item.name} (${item.bnName})`
          };
        }
      } catch (err) {
        console.warn('Gemini text classification fallback:', err.message);
      }
    }

    // High accuracy keyword & regex NLP engine
    let bestKey = 'road_damage';
    let highestPoints = 0;

    for (const [catKey, catData] of Object.entries(kb)) {
      let points = 0;
      for (const word of catData.keywords) {
        if (cleanText.includes(word)) {
          points += 15;
        }
      }
      if (points > highestPoints) {
        highestPoints = points;
        bestKey = catKey;
      }
    }

    const matched = kb[bestKey];
    const calculatedConfidence = highestPoints > 0 ? Math.min(95, 70 + highestPoints * 2) : 80;

    return {
      categoryKey: bestKey,
      categoryName: matched.name,
      categoryNameBn: matched.bnName,
      confidence: calculatedConfidence,
      severity: matched.defaultSeverity,
      advice: `Suggested Category: ${matched.name} (${matched.bnName})`
    };
  }

  // ==========================================
  // generateSmartReportContent — Evidence-based title, enhanced description, and recommended action
  // ==========================================
  static async generateSmartReportContent({ category, rawTitle = '', rawDescription = '', address = '', recognition = null }) {
    const kb = AIImageBasedProblemRecognitionService.getKnowledgeBase();
    const catKey = kb[category] ? category : (recognition?.suggestedCategory || 'road_damage');
    const catInfo = kb[catKey];

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const isValidGeminiKey = apiKey && apiKey.startsWith('AIza') && apiKey.length > 25;

    // Check if user provided description or title
    const userText = (rawDescription || rawTitle || '').trim();

    if (isValidGeminiKey && (userText || recognition)) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are the AI Report Quality Assistant for JanaoBangla, an evidence-based civic issue reporting platform in Bangladesh.
Your task is to generate a realistic, concise, evidence-based title, an enhanced description that improves the user's notes, and a neutral practical action recommendation.

INPUT INFORMATION:
- Category: ${catInfo.name}
- User's Problem Title: "${rawTitle}"
- User's Problem Description: "${rawDescription}"
- User's Location Address: "${address || 'Not specified'}"
- Evidence Analysis: ${recognition ? JSON.stringify({ detectedProblem: recognition.detectedProblem, visibleCondition: recognition.visibleCondition, possibleImpact: recognition.possibleImpact }) : 'None'}

STRICT EVIDENCE-BASED RULES:
1. Title:
   - Must be short, specific, realistic, and match the actual issue (e.g. "Large pothole on damaged road surface", "Garbage accumulation beside residential road", "Broken street light near roadside").
   - Avoid dramatic wording, avoid invented locations, avoid unnecessary emojis, avoid bureaucratic language.
2. Description Enhancement:
   - Preserve the user's original meaning and context (even if written in Banglish or Bengali).
   - Improve grammar and clarity.
   - Mention observable physical details clearly.
   - Explain possible impact only when reasonable (e.g. difficulty for passing vehicles/pedestrians).
   - Recommend inspection/repair without pretending to be a government authority.
   - NEVER fabricate landmarks, street names, or generic filler like "Local road area / community section".
   - If an address is provided, integrate it naturally. If not provided, refer simply to "the road" or "the affected area".
3. Recommended Action:
   - Must be neutral, realistic, and practical (e.g. "Inspect the affected area and arrange necessary repair." or "Municipal inspection and appropriate waste removal are recommended.").
   - NEVER invent "Emergency barrier needed" or "Immediate mandatory evacuation".
4. Estimated Severity:
   - "low" | "medium" | "high" | "critical" | "unable_to_determine". Use "medium" or "low" unless extreme hazard is explicitly verified.

Respond ONLY with valid raw JSON:
{
  "smartTitle": "Concise realistic title",
  "smartDescription": "Clear, professional, enhanced description preserving user meaning",
  "recommendedAction": "Neutral, practical action recommendation",
  "severity": "low" | "medium" | "high" | "critical" | "unable_to_determine"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOut = response.text().trim();
        const cleanJsonStr = textOut.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        if (parsed && parsed.smartTitle && parsed.smartDescription) {
          return {
            smartTitle: parsed.smartTitle.trim(),
            smartDescription: parsed.smartDescription.trim(),
            recommendedAction: parsed.recommendedAction || catInfo.recommendedAction,
            suggestedCategory: catKey,
            categoryName: catInfo.name,
            categoryNameBn: catInfo.bnName,
            severity: parsed.severity || catInfo.defaultSeverity,
            disclaimer: 'AI-generated suggestions are based on the provided evidence and information. Please review and verify the suggestions before submitting your report.'
          };
        }
      } catch (err) {
        console.warn('Gemini smart report content generator fallback:', err.message);
      }
    }

    // Realistic Knowledge-Base Fallback (No generic exaggerations, No fake locations)
    let fallbackTitle = rawTitle.trim();
    if (!fallbackTitle || fallbackTitle.length < 5) {
      fallbackTitle = recognition?.suggestedTitle || catInfo.defaultTitle;
    }

    let enhancedDescription = '';
    if (rawDescription && rawDescription.trim().length > 5) {
      // Enhance user's description realistically
      const cleanDesc = rawDescription.trim();
      const locPhrase = address ? ` near ${address}` : '';
      enhancedDescription = `${cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1)}. The affected area${locPhrase} exhibits observable ${catInfo.name.toLowerCase()} issues that may cause inconvenience to commuters and local pedestrians. An on-site inspection and necessary maintenance are recommended.`;
    } else if (recognition && recognition.visibleCondition) {
      enhancedDescription = `${recognition.visibleCondition} ${recognition.possibleImpact} Inspection and appropriate repair are recommended.`;
    } else {
      enhancedDescription = `${catInfo.visibleCondition} ${catInfo.possibleImpact} Inspection and appropriate repair are recommended.`;
    }

    return {
      smartTitle: fallbackTitle,
      smartDescription: enhancedDescription,
      recommendedAction: recognition?.recommendedAction || catInfo.recommendedAction,
      suggestedCategory: catKey,
      categoryName: catInfo.name,
      categoryNameBn: catInfo.bnName,
      severity: recognition?.severity || catInfo.defaultSeverity,
      disclaimer: 'AI-generated suggestions are based on the provided evidence and information. Please review and verify the suggestions before submitting your report.'
    };
  }
}

module.exports = AIProblemCategorySuggestionService;
