# Use the latest official Node.js image from Docker Hub
FROM node:current

# Create and change to the app directory.
WORKDIR /usr/src/app

# Install app dependencies.
# Copy both package.json AND package-lock.json (if available) to ensure proper dependency management.
COPY package*.json ./
RUN npm install --production

# Bundle app source inside the Docker image.
COPY . .

# Expose the port the app runs on (based on your app's configuration)
EXPOSE 8500

# Define environment variable
ENV NODE_ENV=production

# Run the app
CMD [ "npm", "start" ]
