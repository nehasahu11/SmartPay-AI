// services/predictionService.js
// Spawns the Python ML script and parses its JSON output

const { spawn } = require('child_process');
const path = require('path');

const runPrediction = (billType, history) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../ml/bill_prediction/predict.py');

    // Pass history as a JSON string argument to the Python script
    const inputData = JSON.stringify(history);
    const pythonProcess = spawn('python', [scriptPath, billType, inputData]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Prediction script failed: ${errorOutput}`));
      }
      try {
        const parsed = JSON.parse(result.trim());
        resolve(parsed.predicted_amount);
      } catch (e) {
        reject(new Error('Failed to parse prediction output.'));
      }
    });
  });
};

module.exports = { runPrediction };