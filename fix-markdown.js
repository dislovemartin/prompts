const fs = require('fs');
const path = require('path');

// Find all markdown files
const findMarkdownFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory() && file !== 'node_modules') {
            findMarkdownFiles(filePath, fileList);
        } else if (file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });

    return fileList;
};

// Fix common markdown linting issues
const fixMarkdownFile = (filePath) => {
    console.log(`Fixing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Fix: Add language specifiers to code blocks (MD040)
    const codeBlockRegex = /```\s*\n/g;
    if (content.match(codeBlockRegex)) {
        content = content.replace(codeBlockRegex, '```text\n');
        fixed = true;
    }

    // Fix: Remove trailing spaces (MD009)
    const trailingSpaceRegex = /[ \t]+$/gm;
    if (content.match(trailingSpaceRegex)) {
        content = content.replace(trailingSpaceRegex, '');
        fixed = true;
    }

    // Fix: Remove multiple consecutive blank lines (MD012)
    const multipleBlankLinesRegex = /\n{3,}/g;
    if (content.match(multipleBlankLinesRegex)) {
        content = content.replace(multipleBlankLinesRegex, '\n\n');
        fixed = true;
    }

    // Fix: Ensure blank lines around headings (MD022)
    const headingRegex = /^(#{1,6} .+)$/gm;
    let match;
    let newContent = content;

    while ((match = headingRegex.exec(content)) !== null) {
        const heading = match[0];
        const index = match.index;

        // Check if there's a blank line before the heading
        const beforeHeading = content.substring(0, index);
        const hasBlankLineBefore = beforeHeading.endsWith('\n\n') || index === 0;

        // Check if there's a blank line after the heading
        const afterHeading = content.substring(index + heading.length);
        const hasBlankLineAfter = afterHeading.startsWith('\n\n') || afterHeading.trim() === '';

        if (!hasBlankLineBefore || !hasBlankLineAfter) {
            const prefix = !hasBlankLineBefore && index > 0 ? '\n' : '';
            const suffix = !hasBlankLineAfter ? '\n' : '';

            newContent = newContent.substring(0, index) + prefix + heading + suffix + newContent.substring(index + heading.length);
            fixed = true;
        }
    }
    content = newContent;

    // Fix: Ensure blank lines around fenced code blocks (MD031)
    const codeBlockStartRegex = /^```/gm;
    const codeBlockEndRegex = /^```\s*$/gm;

    // Fix code block starts
    newContent = content;
    while ((match = codeBlockStartRegex.exec(content)) !== null) {
        const blockStart = match[0];
        const index = match.index;

        // Check if there's a blank line before the code block
        const beforeBlock = content.substring(0, index);
        const hasBlankLineBefore = beforeBlock.endsWith('\n\n') || index === 0;

        if (!hasBlankLineBefore && index > 0) {
            newContent = newContent.substring(0, index) + '\n' + blockStart + newContent.substring(index + blockStart.length);
            fixed = true;
        }
    }
    content = newContent;

    // Fix code block ends
    newContent = content;
    while ((match = codeBlockEndRegex.exec(content)) !== null) {
        const blockEnd = match[0];
        const index = match.index;

        // Check if there's a blank line after the code block
        const afterBlock = content.substring(index + blockEnd.length);
        const hasBlankLineAfter = afterBlock.startsWith('\n\n') || afterBlock.trim() === '';

        if (!hasBlankLineAfter && afterBlock.trim() !== '') {
            newContent = newContent.substring(0, index + blockEnd.length) + '\n' + newContent.substring(index + blockEnd.length);
            fixed = true;
        }
    }
    content = newContent;

    // Fix: Ensure blank lines around lists (MD032)
    const listItemRegex = /^(\s*[-*+]|\s*\d+\.)\s/gm;
    let lastIndex = -1;
    let listStartIndices = [];
    let listEndIndices = [];

    while ((match = listItemRegex.exec(content)) !== null) {
        const currentIndex = match.index;

        // If this is a new list (not consecutive items)
        if (lastIndex === -1 || currentIndex > lastIndex + match[0].length + 100) {
            if (lastIndex !== -1) {
                listEndIndices.push(lastIndex + content.substring(lastIndex).indexOf('\n'));
            }
            listStartIndices.push(currentIndex);
        }

        lastIndex = currentIndex;
    }

    if (lastIndex !== -1) {
        listEndIndices.push(lastIndex + content.substring(lastIndex).indexOf('\n'));
    }

    // Add blank lines around lists
    for (let i = listStartIndices.length - 1; i >= 0; i--) {
        const startIndex = listStartIndices[i];
        const endIndex = listEndIndices[i];

        // Add blank line after list if needed
        if (endIndex < content.length - 1) {
            const afterList = content.substring(endIndex + 1);
            if (!afterList.startsWith('\n') && afterList.trim() !== '') {
                content = content.substring(0, endIndex + 1) + '\n' + content.substring(endIndex + 1);
                fixed = true;
            }
        }

        // Add blank line before list if needed
        if (startIndex > 0) {
            const beforeList = content.substring(0, startIndex);
            if (!beforeList.endsWith('\n\n')) {
                content = content.substring(0, startIndex) + '\n' + content.substring(startIndex);
                fixed = true;
            }
        }
    }

    // Fix: Fix ordered list item prefixes (MD029)
    const orderedListRegex = /^(\s*)(\d+)\.(\s+)/gm;
    let currentNumber = 1;
    let lastIndent = '';
    let fixedContent = '';
    let lastPos = 0;

    while ((match = orderedListRegex.exec(content)) !== null) {
        const [fullMatch, indent, number, space] = match;
        const matchIndex = match.index;

        // Add text before this match
        fixedContent += content.substring(lastPos, matchIndex);

        // Reset counter if indent changes or there's a gap in the list
        if (indent !== lastIndent || matchIndex > lastPos + 100) {
            currentNumber = 1;
        }

        // Replace the number
        fixedContent += `${indent}${currentNumber}.${space}`;

        currentNumber++;
        lastIndent = indent;
        lastPos = matchIndex + fullMatch.length;
    }

    // Add remaining content
    fixedContent += content.substring(lastPos);

    if (fixedContent !== content) {
        content = fixedContent;
        fixed = true;
    }

    // Fix: Ensure files end with a single newline (MD047)
    if (!content.endsWith('\n')) {
        content += '\n';
        fixed = true;
    } else if (content.endsWith('\n\n')) {
        // Trim extra newlines at the end
        content = content.replace(/\n+$/, '\n');
        fixed = true;
    }

    // Write the fixed content back to the file
    if (fixed) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
};

// Fix broken links
const fixBrokenLinks = (filePath) => {
    console.log(`Checking for broken links in ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Fix localhost links
    const localhostRegex = /\[([^\]]+)\]\(http:\/\/localhost:3000[^)]*\)/g;
    if (content.match(localhostRegex)) {
        content = content.replace(localhostRegex, '[$1](#local-development)');
        fixed = true;
    }

    // Write the fixed content back to the file
    if (fixed) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
};

// Main function
const main = () => {
    const markdownFiles = findMarkdownFiles('.');
    console.log(`Found ${markdownFiles.length} markdown files`);

    let fixedFiles = 0;
    let fixedLinks = 0;

    markdownFiles.forEach(file => {
        if (fixMarkdownFile(file)) {
            fixedFiles++;
        }

        if (fixBrokenLinks(file)) {
            fixedLinks++;
        }
    });

    console.log(`\nFixed linting issues in ${fixedFiles} files`);
    console.log(`Fixed broken links in ${fixedLinks} files`);
};

main(); 