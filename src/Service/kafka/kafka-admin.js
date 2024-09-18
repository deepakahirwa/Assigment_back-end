// kafka-admin.js
import { createConnection, closeConnection, admin } from './index.js';

async function createTopic(topicName, partitions = 1, replicationFactor = 1) {
    try {
        await createConnection();
        const existingTopics = await admin.listTopics();
        if (!existingTopics.includes(topicName)) {
            await admin.createTopics({
                topics: [{ topic: topicName, numPartitions: partitions, replicationFactor }],
            });
            console.log(`Topic '${topicName}' created`);
        } else {
            console.log(`Topic '${topicName}' already exists`);
        }
    } catch (error) {
        console.error('Error creating topic:', error);
    } finally {
        await closeConnection();
    }
}

// createTopic('answer-key-updates');
export default createTopic;

// Example usage
// createTopic('result-preparation');
