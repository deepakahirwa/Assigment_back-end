import dotenv from 'dotenv';
import cluster from 'node:cluster';
import os from 'node:os';
import { app } from './app.js'; // Import your Express app
import connectDB from './src/db/index.js'; // Import your database connection function


dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 4000;
const numCPUs = os.cpus().length;
 // Number of CPU cores available
const maxRestarts = 5; 
// Maximum number of restarts for a worker

// Function to start the server

const startServer = () => {
    connectDB()
        .then(() => {
            const server = app.listen(PORT, () => {
                console.log(`⚙️  Server is running on port ${PORT}`);
            }); 
        })
        .catch((err) => {
            console.log(`⚠️  Error in connecting the DB ${err}`);
        });
};

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Track the number of restarts for each worker
    const workerRestarts = new Map();

    // Fork workers
    for (let i = 0; i < Math.min(6, numCPUs); i++) {
        const worker = cluster.fork();

        // Initialize worker restarts count
        workerRestarts.set(worker.process.pid, 0);
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}`);

        // Increase restart count
        const restarts = workerRestarts.get(worker.process.pid) || 0;

        if (restarts >= maxRestarts) {
            console.log(`Worker ${worker.process.pid} exceeded maximum restarts. Not restarting.`);
            workerRestarts.delete(worker.process.pid);
        } else {
            console.log(`Restarting worker ${worker.process.pid}`);
            workerRestarts.set(worker.process.pid, restarts + 1);
            cluster.fork(); // Optionally fork a new worker if one dies
        }
    });
} else {
    // Workers start the server
    startServer();
    console.log(`Worker ${process.pid} started`);
}
