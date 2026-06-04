const express = require('express');
const { KinesisClient, PutRecordCommand } = require("@aws-sdk/client-kinesis");
const { exec } = require('child_process'); // 👈 Added for running the Python ML script

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Initialize the AWS Kinesis Client with environment variables 
// passed directly from the Kubernetes container environment config
const kinesisClient = new KinesisClient({ 
    region: process.env.AWS_DEFAULT_REGION || "us-east-1"
});

// 2. Logging Middleware: Intercepts hits to ANY endpoint, captures data, and streams it
app.use(async (req, res, next) => {
    // Wait until the response is completely compiled and sent back to the client
    res.on('finish', async () => {
        const logData = {
            timestamp: new Date().toISOString(),
            endpoint: req.path,
            method: req.method,
            status: res.statusCode,
            // Simulating variable traffic metrics (useful for Machine Learning training data patterns)
            requestVolume: Math.floor(Math.random() * 1200) 
        };

        try {
            const command = new PutRecordCommand({
                StreamName: "cloudops-events-stream",
                Data: Buffer.from(JSON.stringify(logData)),
                PartitionKey: "api-metrics-partition"
            });
            
            await kinesisClient.send(command);
            console.log(`Telemetry event for ${req.path} streamed successfully to Kinesis.`);
        } catch (err) {
            // This logs directly into your 'kubectl logs' if something goes wrong
            console.error("Pipeline Stream Error:", err.message); 
        }
    });
    next();
});

// 3. Application Routes

// Baseline Status Route
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "running", 
        project: "CloudOps Enterprise Platform",
        pipeline: "Module 7 Kinesis Streaming Integration Enabled" 
    });
});

// 🚀 New Module 7 AI/ML Automated Inference Route 🚀
app.get('/api/predict-risk', (req, res) => {
    // Extract input parameter or pass a randomized variable load fallback
    const volume = req.query.volume || Math.floor(Math.random() * 1200);

    // Call the machine learning engine script passing the input metrics parameter
    exec(`python3 traffic_ml.py ${volume}`, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error("Exec error:", error || stderr);
            return res.status(500).json({ error: "ML Inference Failed Execution Engine." });
        }

        // Extract the prediction token tag from standard out
        const predictionLine = stdout.split('\n').find(line => line.startsWith('PREDICTION:'));
        const riskResult = predictionLine ? predictionLine.replace('PREDICTION:', '').trim() : "UNKNOWN";

        res.json({
            timestamp: new Date().toISOString(),
            inputMetrics: {
                currentRequestVolumePerMin: parseInt(volume)
            },
            aiInferenceModel: "Scikit-Learn DecisionTreeClassifier",
            operationalRiskAssessment: riskResult
        });
    });
});

app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
});
