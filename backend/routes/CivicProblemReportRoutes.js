const express = require('express');
const router = express.Router();
const CivicProblemReportController = require('../controllers/CivicProblemReportController');
const { requireAuthentication } = require('../middleware/UserAuthenticationMiddleware');
const upload = require('../middleware/FileUploadMiddleware');

// Ekhane authentication middleware charai publicly report fetch korar sujog deya holo jate sobai public report dekhte pare
router.get('/public', CivicProblemReportController.getPublicReports);

// Nicher shob route e authentication lagbe
router.use(requireAuthentication);

// Natun report submit korar route (maximum 5 ta file allow korlam)
router.post('/', upload.array('evidence', 5), CivicProblemReportController.submitReport);

// User er nijer submit kora shob report pabar route
router.get('/my-reports', CivicProblemReportController.getMyReports);

// Ekta specific report er details dekhar route
router.get('/:id', CivicProblemReportController.getReportDetails);

module.exports = router;
