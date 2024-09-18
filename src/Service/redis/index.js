import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Construct Redis URL using environment variables
const redisUrl = process.env.REDIS_URL ||
    `redis://${process.env.REDISUSER || 'default'}:${process.env.REDISPASSWORD || ''}@${process.env.REDISHOST}:${process.env.REDISPORT}`;

// Initialize the Redis client with the constructed URL
const redisClient = new Redis(redisUrl);

// Handle Redis errors
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

// Connect to Redis (optional in case of using Redis v4+)
const connectRedis = async () => {
    try {
        await redisClient.connect(); // Only necessary for Redis v4+
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
};

// Call connectRedis function to establish connection
connectRedis();

export default redisClient;
