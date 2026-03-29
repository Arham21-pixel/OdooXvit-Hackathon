const ocrService = require('../services/ocr.service');
const { sendSuccess, sendError } = require('../utils/response');

exports.parseImage = async (req, res) => {
  if (!req.file) {
    return sendError(res, 'No image file uploaded', 400);
  }

  try {
    const parsedData = await ocrService.parseReceipt(req.file.buffer);
    return sendSuccess(res, parsedData);
  } catch (err) {
    console.error('parseImage Error:', err);
    return sendError(res, err.message || 'Server error processing image', 500);
  }
};
