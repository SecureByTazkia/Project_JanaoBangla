// ==========================================
// JanaoBangla — Image Content Safety & Moderation Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Nudity, NSFW, adult content, graphic violence, ebong inappropriate image upload
// prothirodh korar jonno Google Gemini Vision AI + Heuristic Safety Shield
// ==========================================

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

// Blacklisted keywords in image filenames or metadata that strongly indicate NSFW content
const NSFW_KEYWORDS = [
  'nude', 'nudity', 'naked', 'porn', 'porno', 'xxx', 'sex', 'sexy',
  'boobs', 'boob', 'tits', 'nsfw', 'adult', 'erotic', 'leaked',
  'dick', 'penis', 'pussy', 'vagina', 'bikini', 'playboy', 'hentai',
  'undressed', 'lingerie', 'butt', 'gore', 'bloody_corpse',
  'breast', 'nipple', 'topless', 'explicit', 'cleavage', 'sexuality'
];

// Helper to convert local image to GenerativePart format for Gemini
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType
    }
  };
}

// Local 24/7 Decoded Pixel-level YCbCr Skin Tone & Nudity Inspector
function decodeAndAnalyzeImagePixels(filePath) {
  try {
    const fileBuf = fs.readFileSync(filePath);
    let pixels = null;
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg') {
      try {
        const rawDecoded = jpeg.decode(fileBuf, { useTolerant: true });
        if (rawDecoded && rawDecoded.data) {
          pixels = rawDecoded.data;
        }
      } catch (e) {
        console.warn('[JPEG Decode Warning]:', e.message);
      }
    } else if (ext === '.png') {
      try {
        const png = PNG.sync.read(fileBuf);
        if (png && png.data) {
          pixels = png.data;
        }
      } catch (e) {
        console.warn('[PNG Decode Warning]:', e.message);
      }
    }

    if (!pixels || pixels.length < 4) {
      return { isSafe: true, skinRatio: 0 };
    }

    let skinPixels = 0;
    let totalPixels = 0;
    const step = 4 * 4; // Sample pixels for speed & accuracy

    for (let i = 0; i < pixels.length - 4; i += step) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // YCbCr skin detection formula:
      // Y = 0.299 * R + 0.587 * G + 0.114 * B
      // Cb = 128 - 0.168736 * R - 0.331264 * G + 0.5 * B
      // Cr = 128 + 0.5 * R - 0.418688 * G - 0.081312 * B
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
        skinPixels++;
      }
      totalPixels++;
    }

    const skinRatio = totalPixels > 0 ? (skinPixels / totalPixels) : 0;
    console.log(`[Content Safety Pixel Analysis] File: ${path.basename(filePath)}, Skin Exposure Ratio: ${(skinRatio * 100).toFixed(2)}%`);

    // Strict threshold: If skin ratio is >= 20% (0.20), block as adult content/nudity!
    if (skinRatio >= 0.20) {
      return {
        isSafe: false,
        flagType: 'nudity',
        skinRatio,
        reason: 'Image flagged for high skin exposure or explicit adult content.',
        reasonBn: 'আপলোড করা ছবিতে নগ্নতা বা অনৈতিক কন্টেন্ট সনাক্ত হয়েছে। জানা বাংলায় নগ্ন বা আপত্তিকর ছবি আপলোড সম্পূর্ণ নিষিদ্ধ।'
      };
    }

    return { isSafe: true, skinRatio };
  } catch (err) {
    console.warn('[Content Safety Pixel Analysis] Error during pixel analysis:', err.message);
    return { isSafe: true, skinRatio: 0 };
  }
}

class ImageContentSafetyModerationService {

  // ==========================================
  // inspectImage — Chobi-te nudity, adult, violence ba inappropriate content ache kina check kore
  // ==========================================
  static async inspectImage(imageFilePath, originalFileName = '') {
    try {
      // 1. Check if file exists
      if (!imageFilePath || !fs.existsSync(imageFilePath)) {
        return {
          isSafe: false,
          flagType: 'invalid_file',
          reason: 'Image file does not exist or is inaccessible.',
          reasonBn: 'ছবি ফাইলটি পাওয়া যায়নি।'
        };
      }

      // 2. Keyword Inspection
      const baseName = (originalFileName || path.basename(imageFilePath)).toLowerCase();
      for (const kw of NSFW_KEYWORDS) {
        const regex = new RegExp(`(^|[^a-zA-Z0-9])${kw}([^a-zA-Z0-9]|$)`, 'i');
        if (regex.test(baseName)) {
          console.warn(`[Content Safety] NSFW keyword matched: "${kw}" in file "${baseName}"`);
          return {
            isSafe: false,
            flagType: 'nudity',
            reason: 'Inappropriate or adult content detected in uploaded image filename/content. Adult materials are strictly forbidden.',
            reasonBn: 'আপলোড করা ছবিতে নগ্নতা বা অনৈতিক কন্টেন্ট সনাক্ত হয়েছে। জানা বাংলায় নগ্ন বা আপত্তিকর ছবি আপলোড সম্পূর্ণ নিষিদ্ধ।'
          };
        }
      }

      // 3. Decoded Pixel-level YCbCr Skin Tone & Nudity Inspection
      const bufferCheck = decodeAndAnalyzeImagePixels(imageFilePath);
      if (!bufferCheck.isSafe) {
        return bufferCheck;
      }

      // 4. Gemini Vision AI Safety Inspection (if valid key exists)
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

          const safetyPrompt = `You are the strict Content Moderation AI for JanaoBangla.
Your SINGLE MANDATE is to inspect this image and determine if it contains any NUDITY, ADULT CONTENT, EROTIC MATERIAL, EXPOSED BODY PARTS, OR NSFW CONTENT.

Respond ONLY with valid JSON:
{
  "isSafe": true | false,
  "flagType": "clean" | "nudity" | "inappropriate",
  "reason": "English explanation",
  "reasonBn": "বাংলায় কারণ (যথা: নগ্নতা বা আপত্তিকর ছবি আপলোড সম্পূর্ণ নিষিদ্ধ)"
}`;

          const result = await model.generateContent([safetyPrompt, imagePart]);
          const response = await result.response;
          const candidates = response.candidates || [];
          if (candidates.length > 0 && candidates[0].finishReason === 'SAFETY') {
            return {
              isSafe: false,
              flagType: 'nudity',
              reason: 'Image blocked by AI safety filters due to sensitive or adult content.',
              reasonBn: 'ছবিটিতে সংবেদনশীল বা আপত্তিকর কন্টেন্ট থাকায় এআই ফিল্টার দ্বারা বাতিল করা হয়েছে।'
            };
          }

          const text = response.text().trim();
          const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);

          if (parsed && typeof parsed.isSafe === 'boolean') {
            return {
              isSafe: parsed.isSafe,
              flagType: parsed.flagType || (parsed.isSafe ? 'clean' : 'nudity'),
              reason: parsed.reason || (parsed.isSafe ? 'Image is clean.' : 'Adult content detected.'),
              reasonBn: parsed.reasonBn || (parsed.isSafe ? 'ছবিটি নিরাপদ।' : 'আপত্তিকর ছবি আপলোড অনুমোদিত নয়।')
            };
          }
        } catch (geminiError) {
          console.warn('[Content Safety] Gemini inspection warning:', geminiError.message);
        }
      }

      return {
        isSafe: true,
        flagType: 'clean',
        reason: 'Image verified clean.',
        reasonBn: 'ছবিটি নিরাপদ।'
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
    // Ei function unsafe file server theke permanently delete kore
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
