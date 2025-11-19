# Multi-stage build for React/Vite web app
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_BASE_URL=http://129.212.134.118
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src ./src
COPY public ./public
COPY index.html tsconfig.json vite.config.ts postcss.config.js tailwind.config.js ./

# Build application with VITE_API_BASE_URL
RUN VITE_API_BASE_URL=$VITE_API_BASE_URL pnpm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app

# Install pnpm and serve package globally
RUN npm install -g pnpm serve

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
