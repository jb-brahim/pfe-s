const validateInvoice = (extractedData) => {
  const rulesResult = [];
  let overallStatus = 'PASS';

  // Rule 1: Correct TVA Calculation (difference between HT and TTC)
  const { totalAmount, totalHT, tvaAmount } = extractedData;
  if (totalAmount && totalHT) {
    const calculatedTva = totalAmount - totalHT;
    
    // Accept small rounding differences (e.g. +/- 1.0)
    if (Math.abs(calculatedTva - (tvaAmount || 0)) <= 1.0) {
      rulesResult.push({ ruleName: 'TVA Correctness', passed: true, message: 'Total Amount matches Sum of HT + TVA' });
    } else {
      rulesResult.push({ ruleName: 'TVA Correctness', passed: false, message: `TVA mismatch: expected ~${calculatedTva.toFixed(2)}, got ${tvaAmount}` });
      overallStatus = 'WARNING'; // Set to warning instead of fail to allow manual review
    }
  } else {
    rulesResult.push({ ruleName: 'TVA Correctness', passed: false, message: 'Missing Total Amount or HT for verification' });
    overallStatus = 'WARNING';
  }

  // Rule 2: Confidence Scores
  const { confidenceScores } = extractedData;
  let lowConfidence = false;
  if (confidenceScores) {
    for (const [key, value] of Object.entries(confidenceScores)) {
      if (value < 0.7) {
        lowConfidence = true;
      }
    }
  }

  if (lowConfidence) {
    rulesResult.push({ ruleName: 'Confidence Scores', passed: false, message: 'Some fields have low OCR confidence (< 70%)' });
    if (overallStatus !== 'FAIL') {
      overallStatus = 'WARNING'; // Require manual check
    }
  } else {
    rulesResult.push({ ruleName: 'Confidence Scores', passed: true, message: 'High confidence on all extracted fields' });
  }

  // Rule 3: Date Validation (Not future)
  if (extractedData.date) {
    const invoiceDate = new Date(extractedData.date);
    if (invoiceDate > new Date()) {
      rulesResult.push({ ruleName: 'Date Validation', passed: false, message: 'Invoice date is in the future' });
      overallStatus = 'FAIL';
    } else {
      rulesResult.push({ ruleName: 'Date Validation', passed: true, message: 'Valid past/present date' });
    }
  }

  return { rulesResult, overallStatus };
};

module.exports = { validateInvoice };
