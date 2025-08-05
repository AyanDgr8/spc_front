# /var/www/html/form_front/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose dev server port
EXPOSE 8991

# Start React dev server
CMD ["npm", "start"]

