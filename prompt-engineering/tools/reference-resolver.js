#!/usr/bin/env node

/**
 * Reference Resolver for SolnAI Prompt Engineering System
 * 
 * This script processes prompt files and resolves references to the core definitions.
 * It looks for patterns like [SOLNAI:COMPONENT-NAME] and replaces them with
 * the actual content from the definitions file.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const DEFINITIONS_FILE = path.join(__dirname, '../core/definitions.md');
const REFERENCE_PATTERN = /\[SOLNAI:([A-Z0-9-]+)\]/g;

// Read definitions file
function readDefinitions(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const definitions = {};

        // Extract all definition blocks
        const blockRegex = /<!-- SOLNAI:([A-Z0-9-]+) -->([\s\S]*?)<!-- \/SOLNAI:\1 -->/g;
        let match;

        while ((match = blockRegex.exec(content)) !== null) {
            const key = match[1];
            const value = match[2].trim();
            definitions[key] = value;
        }

        return definitions;
    } catch (error) {
        console.error(`Error reading definitions file: ${error.message}`);
        process.exit(1);
    }
}

// Process a single file
function processFile(filePath, definitions) {
    try {
        console.log(`Processing: ${filePath}`);
        let content = fs.readFileSync(filePath, 'utf8');
        let replacementsMade = false;

        // Find and replace all references
        content = content.replace(REFERENCE_PATTERN, (match, key) => {
            if (definitions[key]) {
                replacementsMade = true;
                return `\n\n## Referenced content: ${key}\n\n${definitions[key]}\n\n`;
            } else {
                console.warn(`Warning: Reference [SOLNAI:${key}] not found in definitions`);
                return match;
            }
        });

        if (replacementsMade) {
            // Create output file with -resolved suffix
            const dir = path.dirname(filePath);
            const ext = path.extname(filePath);
            const base = path.basename(filePath, ext);
            const outputPath = path.join(dir, `${base}-resolved${ext}`);

            fs.writeFileSync(outputPath, content, 'utf8');
            console.log(`Created resolved file: ${outputPath}`);
        } else {
            console.log(`No references found in: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing file ${filePath}: ${error.message}`);
    }
}

// Main function
function main() {
    // Check if input files or pattern is provided
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide file paths or a glob pattern');
        console.error('Usage: node reference-resolver.js <file-pattern>');
        console.error('Example: node reference-resolver.js "../implementation/*.md"');
        process.exit(1);
    }

    // Read definitions
    console.log(`Reading definitions from: ${DEFINITIONS_FILE}`);
    const definitions = readDefinitions(DEFINITIONS_FILE);
    console.log(`Found ${Object.keys(definitions).length} definitions`);

    // Process each file pattern
    args.forEach(pattern => {
        const files = glob.sync(pattern);
        if (files.length === 0) {
            console.warn(`Warning: No files found matching pattern: ${pattern}`);
        } else {
            console.log(`Processing ${files.length} files matching: ${pattern}`);
            files.forEach(file => processFile(file, definitions));
        }
    });

    console.log('Reference resolution complete!');
}

// Run the main function
main(); 