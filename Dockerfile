# From the node image version 20.04
FROM node:latest

# Create a directory to store the app
WORKDIR /app

# Copy the package.json file to the app directory
COPY package.json /app

# Update the package list  
RUN apt-get update

# install the dependencies
RUN npm install

# Copy the rest of the files to the app directory 
COPY . /app

# ENVIRONMENT VARIABLES

ENV PORT=8080

# Expose the port 8080
EXPOSE 8080

# Build the app
RUN npm run build

CMD ["npm", "start"]