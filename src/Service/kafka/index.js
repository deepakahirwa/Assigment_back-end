import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [process.env.KAFKA_SERVICE_URI || `${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
    sasl: {
        mechanism: 'plain', // Adjust if needed
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
    },
    ssl: true, // Enable SSL if required
});

const admin = kafka.admin();

async function createConnection() {
    try {
        await admin.connect();
        console.log('Kafka Admin connected');
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
}

async function closeConnection() {
    try {
        await admin.disconnect();
        console.log('Kafka Admin disconnected');
    } catch (error) {
        console.error('Error disconnecting from Kafka:', error);
    }
}

export { kafka, createConnection, closeConnection, admin };
