// ==========================================
// JanaoBangla — AI Content Safety Controller
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// AI safety scanning for nudity, NSFW and adult content moderation
// ==========================================

const ImageContentSafetyModerationService = require('../services/ImageContentSafetyModerationService');

class AICivicProblemController {

  // ==========================================
  // moderateImage — Uploaded image analyze kore nudity / adult content detect kore
  // ==========================================
  static async moderateImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file for content moderation scan.'
        });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname;

      const safetyResult = await ImageContentSafetyModerationService.inspectImage(filePath, originalName);

      // If unsafe, safely remove from temporary disk
      if (!safetyResult.isSafe) {
        ImageContentSafetyModerationService.safelyRemoveFile(filePath);
      }

      return res.status(200).json({
        success: true,
        ...safetyResult,
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
}

module.exports = AICivicProblemController;
