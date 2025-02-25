#!/usr/bin/env node

/**
 * Model Fine-Tuning and Evaluation Tool for SolnAI Prompt Engineering System
 * 
 * This script provides utilities for:
 * - Converting prompts to training data format
 * - Generating fine-tuning datasets
 * - Evaluating model performance on prompts
 * - Analyzing prompt effectiveness across models
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
    models: {
        'gpt-4': {
            type: 'openai',
            finetuningSupport: false,
            evaluationSupport: true,
            maxTokens: 8192
        },
        'gpt-3.5-turbo': {
            type: 'openai',
            finetuningSupport: true,
            evaluationSupport: true,
            maxTokens: 4096
        },
        'claude-3-sonnet': {
            type: 'anthropic',
            finetuningSupport: false,
            evaluationSupport: true,
            maxTokens: 200000
        },
        'llama-3': {
            type: 'local',
            finetuningSupport: true,
            evaluationSupport: true,
            maxTokens: 8192
        }
    },
    metrics: [
        'accuracy',
        'perplexity',
        'response_length',
        'latency',
        'token_usage',
        'hallucination_rate'
    ],
    promptFormats: {
        openai: {
            system: { role: 'system', key: 'content' },
            user: { role: 'user', key: 'content' },
            assistant: { role: 'assistant', key: 'content' }
        },
        anthropic: {
            system: { role: 'system', key: 'content' },
            user: { role: 'user', key: 'content' },
            assistant: { role: 'assistant', key: 'content' }
        },
        local: {
            system: { prefix: '<|system|>\n', suffix: '\n' },
            user: { prefix: '<|user|>\n', suffix: '\n' },
            assistant: { prefix: '<|assistant|>\n', suffix: '\n' }
        }
    }
};

/**
 * Generate a unique identifier for tracking experiments
 */
function generateExperimentId() {
    return `exp_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Extract conversation examples from markdown prompts
 */
function extractConversationExamples(content) {
    // Look for conversation examples in the format:
    // ```conversation
    // system: System message
    // user: User message
    // assistant: Assistant response
    // ```
    const conversationPattern = /```conversation\s+([\s\S]*?)```/g;
    const conversations = [];

    let match;
    while ((match = conversationPattern.exec(content)) !== null) {
        const conversationText = match[1];
        const turns = conversationText.split('\n').filter(line => line.trim() !== '');

        const conversation = [];
        for (const turn of turns) {
            const [role, ...messageParts] = turn.split(':');
            const message = messageParts.join(':').trim();
            if (role && message) {
                conversation.push({
                    role: role.trim().toLowerCase(),
                    content: message
                });
            }
        }

        if (conversation.length > 0) {
            conversations.push(conversation);
        }
    }

    return conversations;
}

/**
 * Convert conversations to JSONL format for fine-tuning
 */
function convertToJSONL(conversations, format = 'openai') {
    const jsonlData = [];

    for (const conversation of conversations) {
        const formatConfig = CONFIG.promptFormats[format];
        const formattedConversation = { messages: [] };

        for (const message of conversation) {
            const { role, content } = message;

            if (format === 'openai' || format === 'anthropic') {
                if (formatConfig[role]) {
                    formattedConversation.messages.push({
                        [formatConfig[role].role]: message.content
                    });
                }
            } else if (format === 'local') {
                if (formatConfig[role]) {
                    formattedConversation.messages.push(
                        formatConfig[role].prefix + message.content + formatConfig[role].suffix
                    );
                }
            }
        }

        if (formattedConversation.messages.length > 0) {
            jsonlData.push(JSON.stringify(formattedConversation));
        }
    }

    return jsonlData.join('\n');
}

/**
 * Generate a fine-tuning dataset from a collection of prompts
 */
function generateFineTuningDataset(promptFiles, outputFile, format = 'openai') {
    const allConversations = [];

    for (const file of promptFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const conversations = extractConversationExamples(content);
            allConversations.push(...conversations);
        } catch (error) {
            console.error(`Error processing file ${file}: ${error.message}`);
        }
    }

    if (allConversations.length === 0) {
        console.error('No conversation examples found in the provided prompts.');
        return false;
    }

    const jsonlData = convertToJSONL(allConversations, format);

    try {
        fs.writeFileSync(outputFile, jsonlData, 'utf8');
        console.log(`Fine-tuning dataset saved to: ${outputFile}`);
        console.log(`Total examples extracted: ${allConversations.length}`);
        return true;
    } catch (error) {
        console.error(`Error saving fine-tuning dataset: ${error.message}`);
        return false;
    }
}

/**
 * Calculate the estimated cost of fine-tuning
 */
function estimateFineTuningCost(datasetPath, model = 'gpt-3.5-turbo') {
    try {
        const dataset = fs.readFileSync(datasetPath, 'utf8');
        const lines = dataset.split('\n').filter(line => line.trim() !== '');

        // Rough token estimation (4 chars per token)
        const totalChars = dataset.length;
        const estimatedTokens = Math.ceil(totalChars / 4);

        // Cost estimates (based on OpenAI pricing as of 2024)
        let costPer1KTokens = 0;
        if (model === 'gpt-3.5-turbo') {
            costPer1KTokens = 0.008; // $0.008 per 1K tokens for training
        } else if (model === 'gpt-4') {
            costPer1KTokens = 0.03; // $0.03 per 1K tokens for training
        }

        const estimatedCost = (estimatedTokens / 1000) * costPer1KTokens;

        return {
            examples: lines.length,
            estimatedTokens,
            estimatedCost: estimatedCost.toFixed(2),
            model
        };
    } catch (error) {
        console.error(`Error estimating fine-tuning cost: ${error.message}`);
        return null;
    }
}

/**
 * Evaluate a prompt with a specific model (mock implementation)
 * In a real implementation, this would call the respective AI API
 */
function evaluatePrompt(promptContent, model = 'gpt-3.5-turbo') {
    // This is a mock implementation
    // In a real system, this would make API calls to the respective model

    console.log(`Evaluating prompt with model: ${model}`);

    // Mock evaluation metrics
    const metrics = {
        model,
        timestamp: new Date().toISOString(),
        contentLength: promptContent.length,
        estimatedTokens: Math.ceil(promptContent.length / 4),
        metrics: {
            accuracy: Math.random() * 0.3 + 0.7, // Random between 0.7 and 1.0
            perplexity: Math.random() * 10 + 10, // Random between 10 and 20
            response_length: Math.floor(Math.random() * 500) + 200, // Random between 200 and 700
            latency: Math.random() * 2 + 0.5, // Random between 0.5 and 2.5 seconds
            token_usage: Math.floor(Math.random() * 1000) + 500, // Random between 500 and 1500
            hallucination_rate: Math.random() * 0.1 // Random between 0 and 0.1 (10%)
        }
    };

    return metrics;
}

/**
 * Run a comprehensive evaluation of a prompt across multiple models
 */
function runPromptEvaluation(promptFile, outputDir) {
    try {
        const content = fs.readFileSync(promptFile, 'utf8');
        const filename = path.basename(promptFile, path.extname(promptFile));
        const experimentId = generateExperimentId();
        const evaluationResults = {
            promptFile: filename,
            experimentId,
            timestamp: new Date().toISOString(),
            results: []
        };

        // Evaluate with each supported model
        for (const [modelName, modelConfig] of Object.entries(CONFIG.models)) {
            if (modelConfig.evaluationSupport) {
                const result = evaluatePrompt(content, modelName);
                evaluationResults.results.push(result);
            }
        }

        // Save evaluation results
        const outputPath = path.join(outputDir, `${filename}-evaluation-${experimentId}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(evaluationResults, null, 2), 'utf8');
        console.log(`Evaluation results saved to: ${outputPath}`);

        return evaluationResults;
    } catch (error) {
        console.error(`Error evaluating prompt: ${error.message}`);
        return null;
    }
}

/**
 * Generate a formatted evaluation report as markdown
 */
function generateEvaluationReport(evaluationResults, outputDir) {
    if (!evaluationResults) return null;

    const { promptFile, experimentId, timestamp, results } = evaluationResults;

    let reportContent = `# Prompt Evaluation Report\n\n`;
    reportContent += `**Prompt File:** ${promptFile}\n`;
    reportContent += `**Experiment ID:** \`${experimentId}\`\n`;
    reportContent += `**Timestamp:** ${new Date(timestamp).toLocaleString()}\n\n`;

    reportContent += `## Model Comparison\n\n`;
    reportContent += `| Model | Accuracy | Perplexity | Response Length | Latency (s) | Token Usage | Hallucination Rate |\n`;
    reportContent += `| ----- | -------- | ---------- | --------------- | ----------- | ----------- | ------------------ |\n`;

    results.forEach(result => {
        const { model, metrics } = result;
        reportContent += `| ${model} | ${metrics.accuracy.toFixed(2)} | ${metrics.perplexity.toFixed(2)} | ${metrics.response_length} | ${metrics.latency.toFixed(2)} | ${metrics.token_usage} | ${metrics.hallucination_rate.toFixed(3)} |\n`;
    });

    reportContent += `\n## Analysis\n\n`;

    // Best performing model
    const bestAccuracyModel = results.reduce((best, current) =>
        current.metrics.accuracy > best.metrics.accuracy ? current : best, results[0]);
    reportContent += `**Best Accuracy:** ${bestAccuracyModel.model} (${bestAccuracyModel.metrics.accuracy.toFixed(2)})\n`;

    // Fastest model
    const fastestModel = results.reduce((fastest, current) =>
        current.metrics.latency < fastest.metrics.latency ? current : fastest, results[0]);
    reportContent += `**Fastest Response:** ${fastestModel.model} (${fastestModel.metrics.latency.toFixed(2)}s)\n`;

    // Most efficient model
    const mostEfficientModel = results.reduce((efficient, current) =>
        current.metrics.token_usage < efficient.metrics.token_usage ? current : efficient, results[0]);
    reportContent += `**Most Token Efficient:** ${mostEfficientModel.model} (${mostEfficientModel.metrics.token_usage} tokens)\n`;

    // Save report
    const reportPath = path.join(outputDir, `${promptFile}-evaluation-report-${experimentId}.md`);
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`Evaluation report saved to: ${reportPath}`);

    return reportPath;
}

/**
 * Main function to process command line arguments
 */
function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.error('Please specify a command:');
        console.error('  - generate-dataset: Generate a fine-tuning dataset');
        console.error('  - estimate-cost: Estimate the cost of fine-tuning');
        console.error('  - evaluate-prompt: Run evaluation on a prompt');
        process.exit(1);
    }

    switch (command) {
        case 'generate-dataset':
            if (args.length < 3) {
                console.error('Usage: node model-tuning.js generate-dataset <prompt-files-glob> <output-file> [format]');
                process.exit(1);
            }

            const promptPattern = args[1];
            const outputFile = args[2];
            const format = args[3] || 'openai';

            const promptFiles = require('glob').sync(promptPattern);
            if (promptFiles.length === 0) {
                console.error(`No files found matching pattern: ${promptPattern}`);
                process.exit(1);
            }

            generateFineTuningDataset(promptFiles, outputFile, format);
            break;

        case 'estimate-cost':
            if (args.length < 2) {
                console.error('Usage: node model-tuning.js estimate-cost <dataset-file> [model]');
                process.exit(1);
            }

            const datasetFile = args[1];
            const model = args[2] || 'gpt-3.5-turbo';

            const costEstimate = estimateFineTuningCost(datasetFile, model);
            if (costEstimate) {
                console.log(`\nFine-tuning Cost Estimate:`);
                console.log(`  - Model: ${costEstimate.model}`);
                console.log(`  - Examples: ${costEstimate.examples}`);
                console.log(`  - Estimated Tokens: ${costEstimate.estimatedTokens}`);
                console.log(`  - Estimated Cost: $${costEstimate.estimatedCost}`);
            }
            break;

        case 'evaluate-prompt':
            if (args.length < 2) {
                console.error('Usage: node model-tuning.js evaluate-prompt <prompt-file> [output-directory]');
                process.exit(1);
            }

            const promptFile = args[1];
            const outputDir = args[2] || path.join(__dirname, '../validation/evaluations');

            // Create output directory if it doesn't exist
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
                console.log(`Created output directory: ${outputDir}`);
            }

            const evaluationResults = runPromptEvaluation(promptFile, outputDir);
            if (evaluationResults) {
                generateEvaluationReport(evaluationResults, outputDir);
            }
            break;

        default:
            console.error(`Unknown command: ${command}`);
            process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

// Export functions for use in other modules
module.exports = {
    extractConversationExamples,
    generateFineTuningDataset,
    evaluatePrompt,
    runPromptEvaluation,
    estimateFineTuningCost
}; 