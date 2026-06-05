FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Start Vite in dev mode bound to all network interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
