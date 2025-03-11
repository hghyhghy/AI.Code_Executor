# Use official Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (to leverage Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the application port (Adjust if your NestJS app runs on a different port)
EXPOSE 3001

# Set environment variables (Ensure you use a .env file for sensitive data)
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start:prod"]
