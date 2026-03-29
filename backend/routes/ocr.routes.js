const express = require('express');
const multer = require('multer');
const ocrController = require('../controllers/ocr.controller');
const { requireAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/role');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.post(
  '/parse',
  allowRoles('employee'),
  upload.single('receipt'), // Expecting 'receipt' to be the multipart field name
  ocrController.parseImage
);

module.exports = router;
