#!/usr/bin/env node

/**
 * Prompt Validator for SolnAI Prompt Engineering System
 * 
 * This script analyzes implementation guides and validates them against
 * predefined criteria, generating a validation report.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const DEFINITIONS_FILE = path.join(__dirname, '../core/definitions.md');
const REFERENCE_PATTERN = /\[SOLNAI:([A-Z0-9-]+)\]/g;
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
    }
};

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
    const contextPassed = contentLength <= contextCriterion.maxLength;
    const contextScore = contextPassed ?
        contextCriterion.weight :
        contextCriterion.weight * (1 - ((contentLength - contextCriterion.maxLength) / contextCriterion.maxLength));

    results.contextBounds = {
        passed: contextPassed,
        score: Math.max(0, contextScore),
        maxScore: contextCriterion.weight,
        details: `Content length: ${contentLength}, maximum recommended: ${contextCriterion.maxLength}`
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

    return {
        results,
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)
    };
}

/**
 * Generate full validation report for a prompt file
 */
function validatePrompt(filePath) {
    const content = readPromptFile(filePath);
    if (!content) return null;

    const filename = path.basename(filePath);

    const structure = validateStructure(content);
    const technical = validateTechnical(content);
    const validation = validateValidation(content);
    const aiCompatibility = validateAICompatibility(content);

    const totalScore = structure.totalScore + technical.totalScore +
        validation.totalScore + aiCompatibility.totalScore;
    const maxScore = structure.maxScore + technical.maxScore +
        validation.maxScore + aiCompatibility.maxScore;
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
        structure,
        technical,
        validation,
        aiCompatibility,
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

    output += `### Overall Score: ${results.overallScore.percentage}% (${results.overallScore.score}/${results.overallScore.maxScore})\n\n`;
    output += `**Recommendation:** ${results.recommendation}\n\n`;

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
    const outputDir = args[1] || path.join(__dirname, '../validation-reports');

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

    files.forEach(file => {
        console.log(`Validating: ${file}`);
        const results = validatePrompt(file);
        if (results) {
            totalScore += results.overallScore.percentage;
            saveValidationResults(results, outputDir);
        }
    });

    const averageScore = Math.round(totalScore / files.length);
    console.log(`\nValidation complete!`);
    console.log(`Average score across all files: ${averageScore}%`);
}

// Run the main function
main(); 