FROM node:22-alpine AS builder



# Stage 1: Build Angular application
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve Angular application using nginx
FROM nginx:alpine
COPY --from=builder /app/dist/prpo-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
