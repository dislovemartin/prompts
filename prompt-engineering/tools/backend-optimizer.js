#!/usr/bin/env node

/**
 * Backend Architecture Optimizer for SolnAI Prompt Engineering System
 * 
 * This tool enhances backend architecture by providing:
 * - API access pattern optimization
 * - Database indexing recommendations
 * - Load balancing schemes
 * - Performance analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration constants
const PERFORMANCE_THRESHOLDS = {
    apiLatency: {
        excellent: 100, // ms
        good: 300,      // ms
        fair: 500,      // ms
        poor: 1000      // ms
    },
    databaseQueryTime: {
        excellent: 50,  // ms
        good: 100,      // ms
        fair: 200,      // ms
        poor: 500       // ms
    },
    requestsPerSecond: {
        small: 10,      // Low traffic
        medium: 100,    // Medium traffic
        high: 1000,     // High traffic
        extreme: 5000   // Extreme traffic
    }
};

// Common database and API patterns with optimizations
const OPTIMIZATION_PATTERNS = {
    database: {
        indexing: [
            {
                pattern: /await\s+db\.(find|findOne|findMany)\(\s*\{\s*([a-zA-Z0-9_]+)\s*:/g,
                recommendation: 'Create index on frequently queried fields',
                priority: 'high',
                type: 'index'
            },
            {
                pattern: /await\s+db\.(aggregate|group)\(\s*\{\s*([a-zA-Z0-9_]+)\s*:/g,
                recommendation: 'Create compound index for aggregation fields',
                priority: 'high',
                type: 'compound-index'
            },
            {
                pattern: /ORDER BY\s+([a-zA-Z0-9_]+)/gi,
                recommendation: 'Create index for ORDER BY fields',
                priority: 'medium',
                type: 'index'
            },
            {
                pattern: /JOIN.*?ON\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)/gi,
                recommendation: 'Create indexes for JOIN conditions',
                priority: 'high',
                type: 'index'
            }
        ],
        caching: [
            {
                pattern: /await\s+db\.findMany\(\s*\{\s*where:\s*\{\s*([a-zA-Z0-9_]+)\s*:/g,
                recommendation: 'Implement query result caching for repeated lookups',
                priority: 'medium',
                type: 'cache'
            },
            {
                pattern: /await\s+db\.(findFirst|findUnique)\(\s*\{\s*where:\s*\{\s*id:/g,
                recommendation: 'Implement entity caching for by-ID lookups',
                priority: 'high',
                type: 'cache'
            }
        ],
        connectionPooling: [
            {
                pattern: /new\s+(Prisma|Sequelize|Knex|Pool)/g,
                recommendation: 'Configure connection pooling for optimal database performance',
                priority: 'high',
                type: 'connection-pooling'
            }
        ]
    },
    api: {
        rateLimit: [
            {
                pattern: /app\.(get|post|put|delete)\(\s*['"]\/api\//g,
                recommendation: 'Implement rate limiting for public API endpoints',
                priority: 'high',
                type: 'rate-limit'
            }
        ],
        pagination: [
            {
                pattern: /await\s+db\.findMany\(\s*\{(?:(?!take|skip).)*\}\s*\)/gs,
                recommendation: 'Implement pagination for large result sets',
                priority: 'medium',
                type: 'pagination'
            }
        ],
        batchProcessing: [
            {
                pattern: /for\s*\(\s*(?:let|const)\s+[a-zA-Z0-9_]+\s+of\s+.*?\)\s*\{\s*await/g,
                recommendation: 'Use batch processing instead of sequential await in loops',
                priority: 'high',
                type: 'batch'
            }
        ],
        caching: [
            {
                pattern: /app\.(get|post)\(\s*['"]\/api\/[^'"]+['"]\s*,\s*(?:async)?\s*\([^)]*\)\s*=>\s*\{[^{}]*(?:find|fetch|query)[^{}]*\}/g,
                recommendation: 'Implement API response caching for read-heavy endpoints',
                priority: 'medium',
                type: 'api-cache'
            }
        ]
    },
    aiIntegration: {
        streaming: [
            {
                pattern: /openai\.createCompletion|openai\.createChatCompletion/g,
                recommendation: 'Implement streaming responses for long-running AI operations',
                priority: 'medium',
                type: 'streaming'
            }
        ],
        batchProcessing: [
            {
                pattern: /for\s*\(\s*(?:let|const)\s+[a-zA-Z0-9_]+\s+of\s+.*?\)\s*\{\s*(?:await\s+)?openai\./g,
                recommendation: 'Batch AI requests to reduce API call overhead',
                priority: 'high',
                type: 'ai-batch'
            }
        ],
        caching: [
            {
                pattern: /(?:await\s+)?openai\.(createCompletion|createChatCompletion)\(\s*\{[^{}]*\}\s*\)/g,
                recommendation: 'Implement result caching for deterministic AI queries',
                priority: 'medium',
                type: 'ai-cache'
            }
        ],
        loadBalancing: [
            {
                pattern: /openai\.|anthropic\.|cohere\./g,
                recommendation: 'Implement AI provider load balancing and fallback',
                priority: 'medium',
                type: 'ai-load-balance'
            }
        ]
    }
};

// Load balancing schemes
const LOAD_BALANCING_SCHEMES = [
    {
        name: 'Round Robin',
        description: 'Rotates requests through available servers in sequence',
        suitableFor: 'Homogeneous server environments with similar capability servers',
        implementation: 'Simple to implement, distributes requests evenly by count',
        code: `
const servers = ['server1', 'server2', 'server3'];
let currentIndex = 0;

function getNextServer() {
  const server = servers[currentIndex];
  currentIndex = (currentIndex + 1) % servers.length;
  return server;
}
`
    },
    {
        name: 'Least Connections',
        description: 'Routes requests to servers with the fewest active connections',
        suitableFor: 'Mixed workloads with varying processing times',
        implementation: 'Requires tracking connection state, more balanced than round robin',
        code: `
const servers = [
  { host: 'server1', connections: 0 },
  { host: 'server2', connections: 0 },
  { host: 'server3', connections: 0 }
];

function getServerWithLeastConnections() {
  return servers.sort((a, b) => a.connections - b.connections)[0];
}
`
    },
    {
        name: 'Weighted Distribution',
        description: 'Assigns requests based on server capacity',
        suitableFor: 'Heterogeneous environments with servers of different capabilities',
        implementation: 'Reflects true capacity of your infrastructure',
        code: `
const servers = [
  { host: 'server1', weight: 5 },  // High capacity
  { host: 'server2', weight: 3 },  // Medium capacity
  { host: 'server3', weight: 2 }   // Lower capacity
];

function weightedSelection() {
  const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const server of servers) {
    random -= server.weight;
    if (random <= 0) return server;
  }
  return servers[0]; // Fallback
}
`
    },
    {
        name: 'API Gateway with Lambda/Serverless',
        description: 'Serverless architecture that scales automatically',
        suitableFor: 'Varying loads, burst traffic, and cost optimization for inconsistent traffic',
        implementation: 'Managed service, auto-scaling, pay-per-use',
        code: `
// AWS API Gateway + Lambda implementation example
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

async function routeRequest(event) {
  const params = {
    FunctionName: 'myAIProcessor',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(event)
  };
  
  const response = await lambda.invoke(params).promise();
  return JSON.parse(response.Payload);
}
`
    }
];

/**
 * Scan a file for optimization opportunities
 */
function scanFileForOptimizations(filePath, patterns) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const findings = [];

        // Scan for each pattern category
        Object.keys(patterns).forEach(category => {
            Object.keys(patterns[category]).forEach(optimizationType => {
                patterns[category][optimizationType].forEach(pattern => {
                    const matches = [...content.matchAll(pattern.pattern)];
                    if (matches.length > 0) {
                        findings.push({
                            file: filePath,
                            category,
                            type: optimizationType,
                            pattern: pattern.type,
                            recommendation: pattern.recommendation,
                            priority: pattern.priority,
                            occurrences: matches.length,
                            matches: matches.slice(0, 3).map(m => m[0].substring(0, 100)) // First 3 matches, limited to 100 chars
                        });
                    }
                });
            });
        });

        return findings;
    } catch (error) {
        console.error(`Error scanning file ${filePath}: ${error.message}`);
        return [];
    }
}

/**
 * Generate database indexing recommendations based on code patterns
 */
function generateIndexingRecommendations(findings) {
    const indexRecommendations = findings.filter(f =>
        f.category === 'database' && f.type === 'indexing');

    if (indexRecommendations.length === 0) return null;

    // Extract potential fields to index
    const indexableFields = new Set();
    indexRecommendations.forEach(recommendation => {
        recommendation.matches.forEach(match => {
            // Extract field names using regex
            const fieldMatches = [...match.matchAll(/[a-zA-Z0-9_]+\s*:/g)];
            fieldMatches.forEach(m => {
                const field = m[0].replace(':', '').trim();
                if (field && !['where', 'select', 'include', 'orderBy'].includes(field)) {
                    indexableFields.add(field);
                }
            });
        });
    });

    return {
        recommendedIndexes: Array.from(indexableFields),
        explanation: 'These fields are frequently used in queries and would benefit from indexing.',
        implementation: `
// Example Prisma schema index definitions
model YourModel {
  id        String   @id @default(uuid())
  // Other fields...
  ${Array.from(indexableFields).map(field => `${field}    String`).join('\n  ')}
  
  // Recommended indexes
  @@index([${Array.from(indexableFields).join(', ')}])
}
`,
        migrationCommand: 'npx prisma migrate dev --name add_performance_indexes'
    };
}

/**
 * Generate API optimization recommendations
 */
function generateApiOptimizations(findings) {
    const apiOptimizations = findings.filter(f => f.category === 'api');

    if (apiOptimizations.length === 0) return null;

    const recommendations = {
        rateLimiting: apiOptimizations.some(o => o.type === 'rateLimit'),
        pagination: apiOptimizations.some(o => o.type === 'pagination'),
        batchProcessing: apiOptimizations.some(o => o.type === 'batchProcessing'),
        caching: apiOptimizations.some(o => o.type === 'caching')
    };

    let implementationCode = '';

    if (recommendations.rateLimiting) {
        implementationCode += `
// Rate limiting implementation
import rateLimit from 'express-rate-limit';

// Apply rate limiting to all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
`;
    }

    if (recommendations.pagination) {
        implementationCode += `
// Pagination utility function
async function paginatedQuery(model, query, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    model.findMany({
      ...query,
      take: pageSize,
      skip: skip
    }),
    model.count({ where: query.where })
  ]);
  
  return {
    data,
    meta: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total
    }
  };
}
`;
    }

    if (recommendations.batchProcessing) {
        implementationCode += `
// Batch processing example
async function processBatch(items) {
  // Instead of:
  // for (const item of items) {
  //   await processItem(item);
  // }
  
  // Use:
  await Promise.all(items.map(item => processItem(item)));
}
`;
    }

    if (recommendations.caching) {
        implementationCode += `
// API response caching with Redis
import { createClient } from 'redis';

const redisClient = createClient();
redisClient.connect();

async function cachedFetch(key, ttlSeconds, fetchFunction) {
  // Try to get from cache first
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // If not in cache, fetch fresh data
  const data = await fetchFunction();
  
  // Store in cache
  await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
  
  return data;
}
`;
    }

    return {
        recommendations,
        implementation: implementationCode
    };
}

/**
 * Generate AI integration optimization recommendations
 */
function generateAIOptimizations(findings) {
    const aiOptimizations = findings.filter(f => f.category === 'aiIntegration');

    if (aiOptimizations.length === 0) return null;

    const recommendations = {
        streaming: aiOptimizations.some(o => o.type === 'streaming'),
        batchProcessing: aiOptimizations.some(o => o.type === 'ai-batch'),
        caching: aiOptimizations.some(o => o.type === 'ai-cache'),
        loadBalancing: aiOptimizations.some(o => o.type === 'ai-load-balance')
    };

    let implementationCode = '';

    if (recommendations.streaming) {
        implementationCode += `
// Streaming API responses
app.get('/api/ai/stream', async (req, res) => {
  // Set headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: req.query.prompt }],
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(\`data: \${JSON.stringify({ content })}\n\n\`);
      }
    }
    
    res.write('data: [DONE]\\n\\n');
    res.end();
  } catch (error) {
    res.write(\`data: \${JSON.stringify({ error: error.message })}\n\n\`);
    res.end();
  }
});
`;
    }

    if (recommendations.loadBalancing) {
        implementationCode += `
// AI provider load balancing
class AILoadBalancer {
  constructor() {
    this.providers = [
      { name: 'openai', client: openai, weight: 5, available: true },
      { name: 'anthropic', client: anthropic, weight: 3, available: true },
      { name: 'cohere', client: cohere, weight: 2, available: true }
    ];
  }
  
  getProvider() {
    // Filter available providers
    const availableProviders = this.providers.filter(p => p.available);
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }
    
    // Use weighted selection
    const totalWeight = availableProviders.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const provider of availableProviders) {
      random -= provider.weight;
      if (random <= 0) return provider;
    }
    
    return availableProviders[0];
  }
  
  async complete(prompt) {
    let attempts = 0;
    const maxAttempts = this.providers.length;
    
    while (attempts < maxAttempts) {
      try {
        const provider = this.getProvider();
        return await this.callProvider(provider, prompt);
      } catch (error) {
        console.error(\`Error with provider: \${error}\`);
        attempts++;
      }
    }
    
    throw new Error('All AI providers failed');
  }
  
  async callProvider(provider, prompt) {
    // Implementation for each provider
    if (provider.name === 'openai') {
      const response = await provider.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      });
      return response.choices[0].message.content;
    } else if (provider.name === 'anthropic') {
      // Anthropic implementation
    } else if (provider.name === 'cohere') {
      // Cohere implementation
    }
  }
}
`;
    }

    if (recommendations.caching) {
        implementationCode += `
// AI response caching
import { createClient } from 'redis';

const redisClient = createClient();
redisClient.connect();

async function cachedAICompletion(prompt, model = 'gpt-3.5-turbo', ttlSeconds = 3600) {
  // Generate a cache key based on the prompt and model
  const cacheKey = \`ai:completion:\${crypto.createHash('md5').update(\`\${model}:\${prompt}\`).digest('hex')}\`;
  
  // Try to get from cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // If not in cache, get from AI provider
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const result = response.choices[0].message.content;
  
  // Store in cache
  await redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(result));
  
  return result;
}
`;
    }

    return {
        recommendations,
        implementation: implementationCode
    };
}

/**
 * Generate load balancing recommendations
 */
function generateLoadBalancingRecommendations(trafficLevel = 'medium') {
    let recommendedSchemes = [];

    switch (trafficLevel) {
        case 'small':
            recommendedSchemes = ['Round Robin'];
            break;
        case 'medium':
            recommendedSchemes = ['Round Robin', 'Least Connections'];
            break;
        case 'high':
            recommendedSchemes = ['Least Connections', 'Weighted Distribution'];
            break;
        case 'extreme':
            recommendedSchemes = ['API Gateway with Lambda/Serverless', 'Weighted Distribution'];
            break;
        default:
            recommendedSchemes = ['Round Robin', 'Least Connections'];
    }

    const recommendations = LOAD_BALANCING_SCHEMES
        .filter(scheme => recommendedSchemes.includes(scheme.name));

    return {
        trafficLevel,
        requestsPerSecond: PERFORMANCE_THRESHOLDS.requestsPerSecond[trafficLevel],
        recommendations
    };
}

/**
 * Generate full optimization report
 */
function generateReport(findings, trafficLevel = 'medium') {
    const indexingRecommendations = generateIndexingRecommendations(findings);
    const apiOptimizations = generateApiOptimizations(findings);
    const aiOptimizations = generateAIOptimizations(findings);
    const loadBalancing = generateLoadBalancingRecommendations(trafficLevel);

    let reportContent = `# Backend Architecture Optimization Report\n\n`;
    reportContent += `**Date:** ${new Date().toISOString()}\n`;
    reportContent += `**Traffic Level:** ${trafficLevel} (${PERFORMANCE_THRESHOLDS.requestsPerSecond[trafficLevel]} req/s)\n\n`;

    reportContent += `## Summary of Findings\n\n`;
    reportContent += `Total optimization opportunities found: ${findings.length}\n\n`;

    const highPriorityFindings = findings.filter(f => f.priority === 'high');
    const mediumPriorityFindings = findings.filter(f => f.priority === 'medium');

    reportContent += `- High priority: ${highPriorityFindings.length}\n`;
    reportContent += `- Medium priority: ${mediumPriorityFindings.length}\n`;
    reportContent += `- Low priority: ${findings.length - highPriorityFindings.length - mediumPriorityFindings.length}\n\n`;

    // Database Indexing Section
    if (indexingRecommendations) {
        reportContent += `## Database Indexing Recommendations\n\n`;
        reportContent += `The following fields should be indexed to improve query performance:\n\n`;
        reportContent += `\`\`\`\n${indexingRecommendations.recommendedIndexes.join('\n')}\n\`\`\`\n\n`;
        reportContent += `**Implementation Example:**\n\n`;
        reportContent += `\`\`\`typescript\n${indexingRecommendations.implementation}\n\`\`\`\n\n`;
        reportContent += `**Migration Command:**\n\n`;
        reportContent += `\`\`\`bash\n${indexingRecommendations.migrationCommand}\n\`\`\`\n\n`;
    }

    // API Optimizations Section
    if (apiOptimizations) {
        reportContent += `## API Optimization Recommendations\n\n`;

        if (apiOptimizations.recommendations.rateLimiting) {
            reportContent += `### Rate Limiting\n\n`;
            reportContent += `Implement rate limiting to protect your API from abuse and ensure fair usage.\n\n`;
        }

        if (apiOptimizations.recommendations.pagination) {
            reportContent += `### Pagination\n\n`;
            reportContent += `Implement pagination for endpoints returning large result sets to improve performance.\n\n`;
        }

        if (apiOptimizations.recommendations.batchProcessing) {
            reportContent += `### Batch Processing\n\n`;
            reportContent += `Replace sequential processing with batch processing for better performance.\n\n`;
        }

        if (apiOptimizations.recommendations.caching) {
            reportContent += `### API Response Caching\n\n`;
            reportContent += `Implement caching for frequently accessed, relatively static data.\n\n`;
        }

        reportContent += `**Implementation Examples:**\n\n`;
        reportContent += `\`\`\`typescript\n${apiOptimizations.implementation}\n\`\`\`\n\n`;
    }

    // AI Optimizations Section
    if (aiOptimizations) {
        reportContent += `## AI Integration Optimization Recommendations\n\n`;

        if (aiOptimizations.recommendations.streaming) {
            reportContent += `### Streaming Responses\n\n`;
            reportContent += `Implement streaming for AI responses to improve user experience for long-running requests.\n\n`;
        }

        if (aiOptimizations.recommendations.loadBalancing) {
            reportContent += `### AI Provider Load Balancing\n\n`;
            reportContent += `Implement load balancing across multiple AI providers for redundancy and cost optimization.\n\n`;
        }

        if (aiOptimizations.recommendations.caching) {
            reportContent += `### AI Response Caching\n\n`;
            reportContent += `Cache deterministic AI responses to reduce costs and improve performance.\n\n`;
        }

        reportContent += `**Implementation Examples:**\n\n`;
        reportContent += `\`\`\`typescript\n${aiOptimizations.implementation}\n\`\`\`\n\n`;
    }

    // Load Balancing Section
    reportContent += `## Load Balancing Recommendations\n\n`;
    reportContent += `Based on ${trafficLevel} traffic level (${PERFORMANCE_THRESHOLDS.requestsPerSecond[trafficLevel]} req/s), the following load balancing schemes are recommended:\n\n`;

    loadBalancing.recommendations.forEach(scheme => {
        reportContent += `### ${scheme.name}\n\n`;
        reportContent += `${scheme.description}\n\n`;
        reportContent += `**Suitable for:** ${scheme.suitableFor}\n\n`;
        reportContent += `**Implementation:** ${scheme.implementation}\n\n`;
        reportContent += `**Example Code:**\n\n`;
        reportContent += `\`\`\`javascript\n${scheme.code}\n\`\`\`\n\n`;
    });

    return reportContent;
}

/**
 * Scan a directory recursively for optimization opportunities
 */
function scanDirectory(directory, patterns, extensions = ['.js', '.ts', '.jsx', '.tsx']) {
    const findings = [];

    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            // Skip node_modules and similar folders
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
                findings.push(...scanDirectory(filePath, patterns, extensions));
            }
        } else if (stats.isFile() && extensions.includes(path.extname(file))) {
            findings.push(...scanFileForOptimizations(filePath, patterns));
        }
    });

    return findings;
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: node backend-optimizer.js <directory> <output-file> [traffic-level]');
        console.error('Example: node backend-optimizer.js ../implementation/backend optimization-report.md medium');
        process.exit(1);
    }

    const directory = args[0];
    const outputFile = args[1];
    const trafficLevel = args[2] || 'medium';

    if (!['small', 'medium', 'high', 'extreme'].includes(trafficLevel)) {
        console.error('Traffic level must be one of: small, medium, high, extreme');
        process.exit(1);
    }

    if (!fs.existsSync(directory)) {
        console.error(`Directory does not exist: ${directory}`);
        process.exit(1);
    }

    console.log(`Scanning directory: ${directory}`);
    const findings = scanDirectory(directory, OPTIMIZATION_PATTERNS);
    console.log(`Found ${findings.length} optimization opportunities`);

    const report = generateReport(findings, trafficLevel);

    fs.writeFileSync(outputFile, report, 'utf8');
    console.log(`Report saved to: ${outputFile}`);
}

// Run the main function if executed directly
if (require.main === module) {
    main();
}

// Export functions for use in other modules
module.exports = {
    scanFileForOptimizations,
    generateIndexingRecommendations,
    generateApiOptimizations,
    generateAIOptimizations,
    generateLoadBalancingRecommendations,
    generateReport
}; 