
import crypto from 'crypto';

const TOPICS = [
    "Advanced Node.js Streams",
    "MongoDB Aggregation Pipelines",
    "Express.js Middleware Patterns",
    "Redis Caching Strategies",
    "Docker Multi-stage Builds",
    "Kubernetes Pod Lifecycle",
    "TypeScript Generics",
    "GraphQL Schema Design",
    "Event-Driven Architecture",
    "Microservices Patterns",
    "WebSockets Real-time Communication",
    "CI/CD Best Practices",
    "OWASP Security Guidelines",
    "Algorithm Optimization",
    "Data Structures in JS"
];

export async function generateContent(existingLogs = []) {
    // Simple randomization for demo; in production use LLM or more complex templates
    const usedTitles = new Set(existingLogs.map(l => l.title));
    const availableTopics = TOPICS.filter(t => !usedTitles.has(t));

    if (availableTopics.length === 0) {
        // Fallback if all topics used, append date or generate generic
        return {
            type: 'learning_log',
            title: `Daily Learning: ${new Date().toISOString().split('T')[0]}`,
            content: {
                points: ["Refactored existing code", "Optimized database queries", "Reviewed security logs"]
            }
        };
    }

    const topic = availableTopics[Math.floor(Math.random() * availableTopics.length)];

    const content = {
        type: 'learning_log',
        title: topic,
        content: {
            summary: `Explored detailed concepts of ${topic}.`,
            key_takeaways: [
                `Understanding the core principles of ${topic}`,
                "Implementation trade-offs and performance implications",
                "Real-world use cases and examples"
            ],
            code_snippet: `// Example placeholder for ${topic}\nconst demo = () => { console.log("${topic} initialized"); }`
        }
    };

    return content;
}

export function generateHash(content) {
    return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
}
