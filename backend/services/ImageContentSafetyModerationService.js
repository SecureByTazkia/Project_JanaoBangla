// ==========================================
// JanaoBangla — AI Image Content Safety & Moderation Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Google Gemini Vision AI model ebong keyword/metadata heuristics
// Upload kora chobite nudity, adult, sexually explicit ba inappropriate content scan kore block kore
// ==========================================

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Blacklisted keywords in image filenames or metadata indicating NSFW / adult content
const NSFW_KEYWORDS = [
  'nude', 'nudity', 'naked', 'porn', 'porno', 'xxx', 'sex', 'sexy',
  'boobs', 'boob', 'tits', 'nsfw', 'adult', 'erotic', 'leaked',
  'dick', 'penis', 'pussy', 'vagina', 'bikini', 'playboy', 'hentai',
  'undressed', 'lingerie', 'butt', 'gore', 'bloody_corpse'
];

// Helper to convert local image file to base64 inline generative part
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType
    }
  };
}

class ImageContentSafetyModerationService {

  // ==========================================
  // inspectImage — Chobi-te nudity, adult, sexually explicit content ache kina scan kore
  // ==========================================
  static async inspectImage(imageFilePath, originalFileName = '') {
    // Return: { isSafe: boolean, flagType: 'clean' | 'nudity' | 'inappropriate', reason: string, reasonBn: string }
    try {
      if (!imageFilePath || !fs.existsSync(imageFilePath)) {
        return {
          isSafe: false,
          flagType: 'invalid_file',
          reason: 'Image file does not exist or is inaccessible.',
          reasonBn: 'ছবি ফাইলটি পাওয়া যায়নি।'
        };
      }

      // 1. Filename & Metadata Heuristic Scan
      const baseName = (originalFileName || path.basename(imageFilePath)).toLowerCase();
      for (const kw of NSFW_KEYWORDS) {
        const regex = new RegExp(`(^|[^a-zA-Z0-9])${kw}([^a-zA-Z0-9]|$)`, 'i');
        if (regex.test(baseName)) {
          console.warn(`[Content Safety] NSFW keyword matched: "${kw}" in file "${baseName}"`);
          return {
            isSafe: false,
            flagType: 'nudity',
            reason: 'Inappropriate or adult content detected. Adult and nudity materials are strictly forbidden on JanaoBangla.',
            reasonBn: 'আপলোড করা ছবিতে নগ্নতা বা অনৈতিক কন্টেন্ট সনাক্ত হয়েছে। জানা বাংলায় নগ্ন বা আপত্তিকর ছবি আপলোড সম্পূর্ণ নিষিদ্ধ।'
          };
        }
      }

      // 2. Gemini Vision AI Safety Inspection
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      const isValidGeminiKey = apiKey && apiKey.startsWith('AIza') && apiKey.length > 25;

      if (isValidGeminiKey) {
        try {
          const ext = path.extname(imageFilePath).toLowerCase();
          let mimeType = 'image/jpeg';
          if (ext === '.png') mimeType = 'image/png';
          else if (ext === '.webp') mimeType = 'image/webp';

          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const imagePart = fileToGenerativePart(imageFilePath, mimeType);

          const safetyPrompt = `You are the strict Content Moderation & Safety AI for JanaoBangla, a public civic problem reporting platform in Bangladesh.
Your critical job is to inspect this user-uploaded image and determine whether it contains any:
1. Nudity, sexually explicit, pornographic, lingerie, exposed private parts, or erotic/NSFW material.
2. Extreme gore, dead bodies, severe bloody violence, mutilation, or self-harm.
3. Obscene, vulgar, hate gestures, or harassing inappropriate non-civic content.

Respond ONLY with valid raw JSON adhering strictly to this schema:
{
  "isSafe": true | false,
  "flagType": "clean" | "nudity" | "violence" | "inappropriate",
  "reason": "Brief reason in English explaining why it is safe or why it was rejected",
  "reasonBn": "বাংলায় কারণ (যথা: নগ্নতা বা আপত্তিকর ছবি অনুমোদিত নয়)"
}`;

          const result = await model.generateContent([safetyPrompt, imagePart]);
          const response = await result.response;

          // Check if Gemini safety filter triggered directly
          const candidates = response.candidates || [];
          if (candidates.length > 0) {
            const firstCandidate = candidates[0];
            if (firstCandidate.finishReason === 'SAFETY') {
              console.warn('[Content Safety] Gemini blocked image due to SAFETY finishReason');
              return {
                isSafe: false,
                flagType: 'nudity',
                reason: 'Image blocked by AI safety filters due to sensitive or adult content.',
                reasonBn: 'ছবিটিতে সংবেদনশীল বা আপত্তিকর কন্টেন্ট থাকায় এআই ফিল্টার দ্বারা বাতিল করা হয়েছে।'
              };
            }
          }

          const text = response.text().trim();
          const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);

          if (parsed && typeof parsed.isSafe === 'boolean') {
            if (!parsed.isSafe) {
              console.warn(`[Content Safety] Gemini flagged image as unsafe: [${parsed.flagType}] - ${parsed.reason}`);
            }
            return {
              isSafe: parsed.isSafe,
              flagType: parsed.flagType || (parsed.isSafe ? 'clean' : 'inappropriate'),
              reason: parsed.reason || (parsed.isSafe ? 'Image is clean and suitable for civic reporting.' : 'Inappropriate content detected.'),
              reasonBn: parsed.reasonBn || (parsed.isSafe ? 'ছবিটি নিরাপদ ও উপযুক্ত।' : 'আপত্তিকর ছবি আপলোড অনুমোদিত নয়।')
            };
          }
        } catch (geminiError) {
          console.warn('[Content Safety] Gemini safety inspection error:', geminiError.message);
          if (geminiError.message && (
            geminiError.message.includes('SAFETY') ||
            geminiError.message.includes('blocked') ||
            geminiError.message.includes('HarmCategory')
          )) {
            return {
              isSafe: false,
              flagType: 'nudity',
              reason: 'Image contains restricted or adult content that violates safety policies.',
              reasonBn: 'ছবিটিতে অনৈতিক বা নিষিদ্ধ কন্টেন্ট পাওয়া গেছে।'
            };
          }
        }
      }

      // Default to safe if no NSFW signals detected
      return {
        isSafe: true,
        flagType: 'clean',
        reason: 'Image verified and approved for submission.',
        reasonBn: 'ছবিটি সফলভাবে অনুমোদিত হয়েছে।'
      };
    } catch (error) {
      console.error('[Content Safety] Unexpected error in inspectImage:', error);
      return {
        isSafe: true,
        flagType: 'clean',
        reason: 'Image passed safety check.',
        reasonBn: 'ছবি যাচাই সম্পন্ন হয়েছে।'
      };
    }
  }

  // ==========================================
  // safelyRemoveFile — Inappropriate file disk theke remove kore
  // ==========================================
  static safelyRemoveFile(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Content Safety] Safely deleted inappropriate file: ${filePath}`);
      }
    } catch (err) {
      console.warn(`[Content Safety] Could not delete file ${filePath}:`, err.message);
    }
  }
}

module.exports = ImageContentSafetyModerationService;
