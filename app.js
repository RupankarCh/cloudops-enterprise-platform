const express = require('express');
const { KinesisClient, PutRecordCommand } = require("@aws-sdk/client-kinesis");

const app = express();
const PORT = process.env.PORT || 3000;

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
            // Simulating variable traffic metrics (useful later for Phase 5 Machine Learning training)
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
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "running", 
        project: "CloudOps Enterprise Platform",
        pipeline: "Module 7 Kinesis Streaming Integration Enabled" 
    });
});

app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
});
