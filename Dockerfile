# Use the official Node.js 18 image from DockerHub as the base image
FROM node:18

# Set the working directory inside the container to /app
WORKDIR /app

# Copy package.json and package-lock.json (for installing dependencies)
COPY package*.json ./

# Install all dependencies listed in package.json
RUN npm install

# Copy all the source code from the current directory into the container
COPY . .

# Build the production-ready React app
RUN npm run build


# Use the official Nginx image to serve the built frontend 
# nginx : https://ithelp.ithome.com.tw/m/articles/10241354
FROM nginx:alpine

# Copy the build output from the previous stage into the Nginx public directory
COPY --from=0 /app/build /usr/share/nginx/html

# Copy the Nginx configuration file to the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to allow external access to the app
EXPOSE 80

# Start Nginx in the foreground (required so Docker doesn't exit)
CMD ["nginx", "-g", "daemon off;"]