#!/usr/bin/env node

/**
 * Advanced Prompt Validator for SolnAI Prompt Engineering System
 * 
 * This script analyzes implementation guides and validates them against
 * predefined criteria, generating a validation report. It includes:
 * - Advanced prompt evaluation mechanisms
 * - Model fine-tuning compatibility
 * - Enhanced AI compatibility checks
 * - Performance optimization features
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const crypto = require('crypto');

// Configuration
const DEFINITIONS_FILE = path.join(__dirname, '../core/definitions.md');
const REFERENCE_PATTERN = /\[SOLNAI:([A-Z0-9-]+)\]/g;
const MODEL_COMPATIBILITY = {
    'gpt-4': { maxTokens: 8192, complexity: 'high' },
    'gpt-3.5-turbo': { maxTokens: 4096, complexity: 'medium' },
    'claude-3-sonnet': { maxTokens: 200000, complexity: 'high' },
    'claude-3-haiku': { maxTokens: 200000, complexity: 'medium' },
    'llama-3': { maxTokens: 8192, complexity: 'medium' }
};

const CRITERIA = {
    structure: {
        overview: { pattern: /^#+\s*Overview/im, weight: 2 },
        techStack: { pattern: /Reference:\s*\[SOLNAI:TECH-STACK\]/im, weight: 1 },
        requirements: { pattern: /^#+\s*(Requirements|Specifications)/im, weight: 2 },
        steps: { pattern: /^#+\s*Implementation Steps/im, weight: 3 },
        validation: { pattern: /^#+\s*Validation/im, weight: 2 },
    },
    technical: {
        codeBlocks: { pattern: /```tsx?[\s\S]*?```/g, minCount: 1, weight: 3 },
        componentImports: { pattern: /import\s+[\{\s\w+\s\}|\w+]\s+from/g, weight: 2 },
        typescriptTypes: { pattern: /:\s*(\w+(<.*?>)?(\[\])?)/g, weight: 2 },
        reactHooks: { pattern: /use[A-Z]\w+/g, weight: 1 },
    },
    validation: {
        checklistItems: { pattern: /- \[ \]/g, minCount: 5, weight: 3 },
        errorHandling: { pattern: /## .*Error Handling/im, weight: 2 },
        examples: { pattern: /## .*Example/im, weight: 2 },
    },
    aiCompatibility: {
        contextBounds: { maxLength: 6000, weight: 3 },
        clarity: { weight: 3 }, // Subjective, estimated
        references: { pattern: /\[SOLNAI:[A-Z0-9-]+\]/g, weight: 2 },
        // New extended compatibility checks
        apiIntegration: { pattern: /openai\.api|openai\.ChatCompletion|axios\.post\(['"]https:\/\/api\.openai\.com/g, weight: 2 },
        modelSpecificInstructions: { pattern: /temperature:|max_tokens:|top_p:|frequency_penalty:|presence_penalty:/g, weight: 2 },
        streamingCompatibility: { pattern: /stream:\s*true/g, weight: 1 }
    },
    // New criterion for fine-tuning compatibility
    fineTuningCompatibility: {
        jsonlFormat: { pattern: /```jsonl[\s\S]*?```/g, weight: 3 },
        trainingExamples: { pattern: /(user|system|assistant):/g, minCount: 3, weight: 3 },
        parametersSpecification: { pattern: /epochs:|learning_rate:|batch_size:/g, weight: 2 },
        evaluationMetrics: { pattern: /(BLEU|ROUGE|perplexity|accuracy)/gi, weight: 2 }
    },
    // New criterion for prompt evaluation
    promptEvaluation: {
        expectedOutputs: { pattern: /Expected Output:/im, weight: 2 },
        edgeCases: { pattern: /Edge Cases:|Corner Cases:/im, weight: 3 },
        evaluationCriteria: { pattern: /Evaluation Criteria:/im, weight: 3 },
        performanceMetrics: { pattern: /(latency|throughput|response time)/gi, weight: 2 }
    }
};

/**
 * Generate a unique hash for a prompt content for caching and tracking
 */
function generatePromptHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Read and parse a prompt file
 */
function readPromptFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading file ${filePath}: ${error.message}`);
        return null;
    }
}

/**
 * Estimate token count based on content
 * This is a rough approximation: ~4 chars per token for English text
 */
function estimateTokenCount(content) {
    return Math.ceil(content.length / 4);
}

/**
 * Validate structure criteria
 */
function validateStructure(content) {
    const results = {};
    let totalScore = 0;
    let maxScore = 0;

    for (const [key, criterion] of Object.entries(CRITERIA.structure)) {
        const matches = content.match(criterion.pattern);
        const score = matches ? criterion.weight : 0;
        results[key] = {
            passed: !!matches,
            score,
            maxScore: criterion.weight,
            details: matches ? 'Found' : 'Not found'
        };
        totalScore += score;
        maxScore += criterion.weight;
    }

    return {
        results,
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}

/**
 * Validate technical criteria
 */
function validateTechnical(content) {
    const results = {};
    let totalScore = 0;
    let maxScore = 0;

    for (const [key, criterion] of Object.entries(CRITERIA.technical)) {
        const matches = content.match(criterion.pattern) || [];
        const minCount = criterion.minCount || 1;
        const passed = matches.length >= minCount;
        const score = passed ? criterion.weight : (matches.length > 0 ? criterion.weight / 2 : 0);

        results[key] = {
            passed,
            score,
            maxScore: criterion.weight,
            details: `Found ${matches.length} matches, minimum required: ${minCount}`
        };
        totalScore += score;
        maxScore += criterion.weight;
    }

    return {
        results,
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}

/**
 * Validate validation criteria
 */
function validateValidation(content) {
    const results = {};
    let totalScore = 0;
    let maxScore = 0;

    for (const [key, criterion] of Object.entries(CRITERIA.validation)) {
        if (key === 'checklistItems') {
            const matches = content.match(criterion.pattern) || [];
            const minCount = criterion.minCount || 1;
            const passed = matches.length >= minCount;
            const score = passed ? criterion.weight : (matches.length > 0 ? (matches.length / minCount) * criterion.weight : 0);

            results[key] = {
                passed,
                score,
                maxScore: criterion.weight,
                details: `Found ${matches.length} checklist items, minimum required: ${minCount}`
            };
            totalScore += score;
            maxScore += criterion.weight;
        } else {
            const matches = content.match(criterion.pattern);
            const score = matches ? criterion.weight : 0;
            results[key] = {
                passed: !!matches,
                score,
                maxScore: criterion.weight,
                details: matches ? 'Found' : 'Not found'
            };
            totalScore += score;
            maxScore += criterion.weight;
        }
    }

    return {
        results,
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}

/**
 * Validate AI compatibility criteria
 */
function validateAICompatibility(content) {
    const results = {};
    let totalScore = 0;
    let maxScore = 0;

    // Context bounds
    const contextCriterion = CRITERIA.aiCompatibility.contextBounds;
    const contentLength = content.length;
    const tokenEstimate = estimateTokenCount(content);
    const contextPassed = contentLength <= contextCriterion.maxLength;
    const contextScore = contextPassed ?
        contextCriterion.weight :
        contextCriterion.weight * (1 - ((contentLength - contextCriterion.maxLength) / contextCriterion.maxLength));

    results.contextBounds = {
        passed: contextPassed,
        score: Math.max(0, contextScore),
        maxScore: contextCriterion.weight,
        details: `Content length: ${contentLength}, tokens: ~${tokenEstimate}, maximum recommended: ${contextCriterion.maxLength}`
    };
    totalScore += results.contextBounds.score;
    maxScore += contextCriterion.weight;

    // References
    const refCriterion = CRITERIA.aiCompatibility.references;
    const refMatches = content.match(refCriterion.pattern) || [];
    const refPassed = refMatches.length > 0;
    const refScore = refPassed ? refCriterion.weight : 0;

    results.references = {
        passed: refPassed,
        score: refScore,
        maxScore: refCriterion.weight,
        details: `Found ${refMatches.length} references`
    };
    totalScore += refScore;
    maxScore += refCriterion.weight;

    // Clarity (estimated based on structure and other metrics)
    const clarityCriterion = CRITERIA.aiCompatibility.clarity;
    // This is a subjective estimate based on other metrics
    const structureScore = validateStructure(content).percentage / 100;
    const clarityScore = clarityCriterion.weight * structureScore;

    results.clarity = {
        passed: structureScore > 0.7,
        score: clarityScore,
        maxScore: clarityCriterion.weight,
        details: `Estimated based on structure: ${Math.round(structureScore * 100)}%`
    };
    totalScore += clarityScore;
    maxScore += clarityCriterion.weight;

    // API Integration (Extended compatibility check)
    const apiCriterion = CRITERIA.aiCompatibility.apiIntegration;
    const apiMatches = content.match(apiCriterion.pattern) || [];
    const apiScore = apiMatches.length > 0 ? apiCriterion.weight : 0;

    results.apiIntegration = {
        passed: apiMatches.length > 0,
        score: apiScore,
        maxScore: apiCriterion.weight,
        details: `Found ${apiMatches.length} API integration patterns`
    };
    totalScore += apiScore;
    maxScore += apiCriterion.weight;

    // Model-specific instructions (Extended compatibility check)
    const modelInstructionsCriterion = CRITERIA.aiCompatibility.modelSpecificInstructions;
    const modelInstructionsMatches = content.match(modelInstructionsCriterion.pattern) || [];
    const modelInstructionsScore = modelInstructionsMatches.length > 0 ? modelInstructionsCriterion.weight : 0;

    results.modelSpecificInstructions = {
        passed: modelInstructionsMatches.length > 0,
        score: modelInstructionsScore,
        maxScore: modelInstructionsCriterion.weight,
        details: `Found ${modelInstructionsMatches.length} model parameter specifications`
    };
    totalScore += modelInstructionsScore;
    maxScore += modelInstructionsCriterion.weight;

    // Streaming compatibility (Extended compatibility check)
    const streamingCriterion = CRITERIA.aiCompatibility.streamingCompatibility;
    const streamingMatches = content.match(streamingCriterion.pattern) || [];
    const streamingScore = streamingMatches.length > 0 ? streamingCriterion.weight : 0;

    results.streamingCompatibility = {
        passed: streamingMatches.length > 0,
        score: streamingScore,
        maxScore: streamingCriterion.weight,
        details: `Found ${streamingMatches.length} streaming configuration patterns`
    };
    totalScore += streamingScore;
    maxScore += streamingCriterion.weight;

    return {
        results,
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}

/**
 * Validate fine-tuning compatibility
 */
function validateFineTuningCompatibility(content) {
    const results = {};
    let totalScore = 0;
    let maxScore = 0;

    for (const [key, criterion] of Object.entries(CRITERIA.fineTuningCompatibility)) {
        if (key === 'trainingExamples') {
            const matches = content.match(criterion.pattern) || [];
            const minCount = criterion.minCount || 1;
            const passed = matches.length >= minCount;
            const score = passed ? criterion.weight : (matches.length > 0 ? (matches.length / minCount) * criterion.weight : 0);

            results[key] = {
                passed,
                score,
                maxScore: criterion.weight,
                details: `Found ${matches.length} training examples, minimum required: ${minCount}`
            };
            totalScore += score;
            maxScore += criterion.weight;
        } else {
            const matches = content.match(criterion.pattern) || [];
            const passed = matches.length > 0;
            const score = passed ? criterion.weight : 0;

            results[key] = {
                passed,
                score,
                maxScore: criterion.weight,
                details: `Found ${matches.length} matches`
            };
            totalScore += score;
            maxScore += criterion.weight;
        }
    }

    return {
        results,
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}

/**
 * Validate prompt evaluation mechanisms
 */
function validatePromptEvaluation(content) {
    const results = {};
    let totalScore = 0;
    let maxScore = 0;

    for (const [key, criterion] of Object.entries(CRITERIA.promptEvaluation)) {
        const matches = content.match(criterion.pattern) || [];
        const passed = matches.length > 0;
        const score = passed ? criterion.weight : 0;

        results[key] = {
            passed,
            score,
            maxScore: criterion.weight,
            details: `Found ${matches.length} matches`
        };
        totalScore += score;
        maxScore += criterion.weight;
    }

    return {
        results,
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}

/**
 * Check model compatibility and provide recommendations
 */
function checkModelCompatibility(content) {
    const tokenEstimate = estimateTokenCount(content);
    const compatibleModels = [];
    const incompatibleModels = [];

    for (const [model, specs] of Object.entries(MODEL_COMPATIBILITY)) {
        if (tokenEstimate <= specs.maxTokens) {
            compatibleModels.push(model);
        } else {
            incompatibleModels.push(model);
        }
    }

    return {
        tokenEstimate,
        compatibleModels,
        incompatibleModels,
        recommendations: compatibleModels.length > 0
            ? `Recommended models: ${compatibleModels.join(', ')}`
            : 'Content exceeds token limits for all supported models. Consider splitting or reducing content.'
    };
}

/**
 * Generate full validation report for a prompt file
 */
function validatePrompt(filePath) {
    const content = readPromptFile(filePath);
    if (!content) return null;

    const filename = path.basename(filePath);
    const promptHash = generatePromptHash(content);

    const structure = validateStructure(content);
    const technical = validateTechnical(content);
    const validation = validateValidation(content);
    const aiCompatibility = validateAICompatibility(content);
    const fineTuningCompatibility = validateFineTuningCompatibility(content);
    const promptEvaluation = validatePromptEvaluation(content);
    const modelCompatibility = checkModelCompatibility(content);

    const totalScore = structure.totalScore + technical.totalScore +
        validation.totalScore + aiCompatibility.totalScore +
        fineTuningCompatibility.totalScore + promptEvaluation.totalScore;
    const maxScore = structure.maxScore + technical.maxScore +
        validation.maxScore + aiCompatibility.maxScore +
        fineTuningCompatibility.maxScore + promptEvaluation.maxScore;
    const overallPercentage = Math.round((totalScore / maxScore) * 100);

    let recommendation = "Rejected";
    if (overallPercentage >= 90) {
        recommendation = "Approved for production";
    } else if (overallPercentage >= 75) {
        recommendation = "Approved with minor revisions";
    } else if (overallPercentage >= 50) {
        recommendation = "Requires significant revision";
    }

    return {
        file: filename,
        path: filePath,
        promptHash,
        structure,
        technical,
        validation,
        aiCompatibility,
        fineTuningCompatibility,
        promptEvaluation,
        modelCompatibility,
        overallScore: {
            score: totalScore,
            maxScore,
            percentage: overallPercentage
        },
        recommendation
    };
}

/**
 * Format validation results as markdown
 */
function formatValidationResults(results) {
    if (!results) return "Error: Could not validate file.";

    let output = `# Prompt Validation Results\n\n`;
    output += `## File: ${results.file}\n\n`;
    output += `**Prompt Hash:** \`${results.promptHash}\`\n\n`;

    output += `### Overall Score: ${results.overallScore.percentage}% (${results.overallScore.score}/${results.overallScore.maxScore})\n\n`;
    output += `**Recommendation:** ${results.recommendation}\n\n`;

    output += `### Model Compatibility\n\n`;
    output += `- Token estimate: ~${results.modelCompatibility.tokenEstimate}\n`;
    output += `- Compatible models: ${results.modelCompatibility.compatibleModels.join(', ') || 'None'}\n`;
    output += `- Incompatible models: ${results.modelCompatibility.incompatibleModels.join(', ') || 'None'}\n`;
    output += `- Recommendation: ${results.modelCompatibility.recommendations}\n\n`;

    output += `### Structure Validation: ${results.structure.percentage}%\n\n`;
    for (const [key, result] of Object.entries(results.structure.results)) {
        output += `- ${key}: ${result.passed ? '✅' : '❌'} ${result.details}\n`;
    }
    output += `\n`;

    output += `### Technical Validation: ${results.technical.percentage}%\n\n`;
    for (const [key, result] of Object.entries(results.technical.results)) {
        output += `- ${key}: ${result.passed ? '✅' : '❌'} ${result.details}\n`;
    }
    output += `\n`;

    output += `### Validation Criteria: ${results.validation.percentage}%\n\n`;
    for (const [key, result] of Object.entries(results.validation.results)) {
        output += `- ${key}: ${result.passed ? '✅' : '❌'} ${result.details}\n`;
    }
    output += `\n`;

    output += `### AI Compatibility: ${results.aiCompatibility.percentage}%\n\n`;
    for (const [key, result] of Object.entries(results.aiCompatibility.results)) {
        output += `- ${key}: ${result.passed ? '✅' : '❌'} ${result.details}\n`;
    }
    output += `\n`;

    output += `### Fine-Tuning Compatibility: ${results.fineTuningCompatibility.percentage}%\n\n`;
    for (const [key, result] of Object.entries(results.fineTuningCompatibility.results)) {
        output += `- ${key}: ${result.passed ? '✅' : '❌'} ${result.details}\n`;
    }
    output += `\n`;

    output += `### Prompt Evaluation: ${results.promptEvaluation.percentage}%\n\n`;
    for (const [key, result] of Object.entries(results.promptEvaluation.results)) {
        output += `- ${key}: ${result.passed ? '✅' : '❌'} ${result.details}\n`;
    }
    output += `\n`;

    return output;
}

/**
 * Save validation results to file
 */
function saveValidationResults(results, outputDir) {
    const filename = path.basename(results.path, path.extname(results.path));
    const outputPath = path.join(outputDir, `${filename}-validation.md`);

    try {
        const markdown = formatValidationResults(results);
        fs.writeFileSync(outputPath, markdown, 'utf8');
        console.log(`Validation report saved to: ${outputPath}`);
    } catch (error) {
        console.error(`Error saving validation results: ${error.message}`);
    }
}

/**
 * Main function
 */
function main() {
    // Check if input files or pattern is provided
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide file paths or a glob pattern');
        console.error('Usage: node prompt-validator.js <file-pattern> [output-directory]');
        console.error('Example: node prompt-validator.js "../implementation/*.md" ../validation-reports');
        process.exit(1);
    }

    const filePattern = args[0];
    const outputDir = args[1] || path.join(__dirname, '../validation/reports');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created output directory: ${outputDir}`);
    }

    // Process each file matching the pattern
    const files = glob.sync(filePattern);
    if (files.length === 0) {
        console.warn(`Warning: No files found matching pattern: ${filePattern}`);
        process.exit(0);
    }

    console.log(`Processing ${files.length} files matching: ${filePattern}`);
    let totalScore = 0;
    const validationSummary = [];

    files.forEach(file => {
        console.log(`Validating: ${file}`);
        const results = validatePrompt(file);
        if (results) {
            totalScore += results.overallScore.percentage;
            validationSummary.push({
                file: results.file,
                hash: results.promptHash,
                score: results.overallScore.percentage,
                recommendation: results.recommendation
            });
            saveValidationResults(results, outputDir);
        }
    });

    const averageScore = Math.round(totalScore / files.length);
    console.log(`\nValidation complete!`);
    console.log(`Average score across all files: ${averageScore}%`);

    // Save summary report
    const summaryPath = path.join(outputDir, '_validation-summary.md');
    let summaryContent = `# Prompt Validation Summary\n\n`;
    summaryContent += `**Date:** ${new Date().toISOString()}\n`;
    summaryContent += `**Files Processed:** ${files.length}\n`;
    summaryContent += `**Average Score:** ${averageScore}%\n\n`;
    summaryContent += `## File Summary\n\n`;
    summaryContent += `| File | Hash | Score | Recommendation |\n`;
    summaryContent += `| ---- | ---- | ----- | -------------- |\n`;

    validationSummary.forEach(item => {
        summaryContent += `| ${item.file} | \`${item.hash}\` | ${item.score}% | ${item.recommendation} |\n`;
    });

    fs.writeFileSync(summaryPath, summaryContent, 'utf8');
    console.log(`Summary report saved to: ${summaryPath}`);
}

// Run the main function
main(); 