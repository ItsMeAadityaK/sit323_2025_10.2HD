# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Ensure upload directory exists
RUN mkdir -p uploads

# Expose port
EXPOSE 8080

# Start app
CMD ["npm", "start"]
