const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const markdownLinkCheck = require('markdown-link-check');

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

// Check links in a markdown file
const checkLinks = (filePath) => {
    return new Promise((resolve, reject) => {
        const markdown = fs.readFileSync(filePath, 'utf8');

        markdownLinkCheck(markdown, {
            baseUrl: `file://${path.dirname(path.resolve(filePath))}/`,
            ignorePatterns: [
                { pattern: '^#' } // Ignore anchor links
            ]
        }, (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            resolve({
                filePath,
                results
            });
        });
    });
};

// Main function
const main = async () => {
    const markdownFiles = findMarkdownFiles('.');
    console.log(`Found ${markdownFiles.length} markdown files`);

    let brokenLinksFound = false;

    for (const file of markdownFiles) {
        try {
            const { filePath, results } = await checkLinks(file);

            const brokenLinks = results.filter(result => result.status === 'dead');

            if (brokenLinks.length > 0) {
                brokenLinksFound = true;
                console.log(`\n${filePath}:`);
                brokenLinks.forEach(link => {
                    console.log(`  - [${link.status}] ${link.link}`);
                });
            }
        } catch (error) {
            console.error(`Error checking ${file}:`, error);
        }
    }

    if (!brokenLinksFound) {
        console.log('\nNo broken links found!');
    } else {
        console.log('\nBroken links found. Please fix them.');
        process.exit(1);
    }
};

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
}); 