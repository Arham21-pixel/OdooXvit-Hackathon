const Tesseract = require('tesseract.js');

exports.parseReceipt = async (imageBuffer) => {
  try {
    const { data: { text, confidence } } = await Tesseract.recognize(
      imageBuffer,
      'eng'
    );

    let amount = null;
    let date = null;
    let description = 'Parsed Receipt';

    // Heuristics for Amount: Look for $ or similar, followed by digits/decimals
    const amountMatch = text.match(/[$€£₹]?\s*(\d+[.,]\d{2})/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(',', '.'));
    }

    // Heuristics for Date (e.g., MM/DD/YYYY, DD-MM-YYYY)
    const dateMatch = text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/);
    if (dateMatch) {
      date = dateMatch[0];
    }

    // Heuristics for Description: Get first non-empty meaningful line
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    if (lines.length > 0) {
      description = lines[0]; // Often the merchant name is at the top
    }

    return {
      amount,
      date,
      description,
      confidence: Math.round(confidence)
    };
  } catch (err) {
    console.error('OCR parsing error:', err);
    throw new Error('Failed to parse receipt image');
  }
};
