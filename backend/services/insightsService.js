// services/insightsService.js
// Spawns run_insights.py and parses its JSON output

const { spawn } = require('child_process');
const path = require('path');

const runInsights = (transactions) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../ml/spending_insights/run_insights.py');
    const inputData = JSON.stringify(transactions);
    const pythonProcess = spawn('python', [scriptPath, inputData]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => { result += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { errorOutput += data.toString(); });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Insights script failed: ${errorOutput}`));
      }
      try {
        resolve(JSON.parse(result.trim()));
      } catch (e) {
        reject(new Error('Failed to parse insights output.'));
      }
    });
  });
};

module.exports = { runInsights };