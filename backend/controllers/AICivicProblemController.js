// ==========================================
// JanaoBangla — AI Civic Problem Controller
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// AI requests receive kore ebong specialized AI services execute kore
// ==========================================

const AIImageBasedProblemRecognitionService = require('../services/AIImageBasedProblemRecognitionService');
const AIProblemCategorySuggestionService = require('../services/AIProblemCategorySuggestionService');
const AIAdvancedDuplicateDetectionService = require('../services/AIAdvancedDuplicateDetectionService');
const ImageContentSafetyModerationService = require('../services/ImageContentSafetyModerationService');

class AICivicProblemController {

  // ==========================================
  // analyzeImage — Uploaded evidence image analyze kore problem + category + confidence return kore
  // ==========================================
  static async analyzeImage(req, res, next) {
    // Ei function user er upload kora image theke AI recognition run kore
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file for AI recognition.'
        });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname;

      // 0. Strict Image Content Safety & Nudity Moderation Check
      const safetyCheck = await ImageContentSafetyModerationService.inspectImage(filePath, originalName);
      if (!safetyCheck.isSafe) {
        // Delete unsafe image immediately from disk
        ImageContentSafetyModerationService.safelyRemoveFile(filePath);
        return res.status(400).json({
          success: false,
          isUnsafe: true,
          flagType: safetyCheck.flagType,
          error: safetyCheck.reason,
          message: safetyCheck.reason,
          messageBn: safetyCheck.reasonBn
        });
      }

      // 1. Run AI Image Recognition
      const recognitionResult = await AIImageBasedProblemRecognitionService.analyzeEvidenceImage(filePath, originalName);

      // 2. Generate Smart Content Suggestions based on recognition
      const smartContent = await AIProblemCategorySuggestionService.generateSmartReportContent({
        category: recognitionResult.suggestedCategory,
        rawTitle: req.body.title || '',
        rawDescription: req.body.description || '',
        address: req.body.address || ''
      });

      // 3. Run Duplicate check if coordinates/title present
      let duplicateResult = null;
      if (req.body.latitude && req.body.longitude) {
        duplicateResult = await AIAdvancedDuplicateDetectionService.detectDuplicates({
          title: smartContent.smartTitle,
          description: smartContent.smartDescription,
          category: recognitionResult.suggestedCategory,
          latitude: req.body.latitude,
          longitude: req.body.longitude
        });
      }

      return res.status(200).json({
        success: true,
        recognition: recognitionResult,
        suggestions: smartContent,
        duplicates: duplicateResult,
        fileInfo: {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // suggestCategoryAndImprovement — User er draft theke smart category ebong report improvement suggestions banay
  // ==========================================
  static async suggestCategoryAndImprovement(req, res, next) {
    // Ei function text based category ar structured description banabe
    try {
      const { text, title, description, category, address } = req.body;

      // Category guess kora hocche
      const categorySuggestion = await AIProblemCategorySuggestionService.suggestCategoryFromText(text || title || description || '');

      const chosenCategory = category || categorySuggestion.categoryKey;

      // Structured smart content banano hocche
      const smartContent = await AIProblemCategorySuggestionService.generateSmartReportContent({
        category: chosenCategory,
        rawTitle: title || '',
        rawDescription: description || text || '',
        address: address || ''
      });

      return res.status(200).json({
        success: true,
        categorySuggestion,
        smartContent
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // detectDuplicates — Notun report submit korar age existing database reports er sathe similarity check kore
  // ==========================================
  static async detectDuplicates(req, res, next) {
    // Ei function report submit er age duplicate alert dibe
    try {
      const { title, description, category, latitude, longitude } = req.body;

      const result = await AIAdvancedDuplicateDetectionService.detectDuplicates({
        title,
        description,
        category,
        latitude,
        longitude
      });

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AICivicProblemController;
