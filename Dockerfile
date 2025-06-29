FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Set a dummy MONGODB_URI for build time (no actual DB connection needed)
ENV MONGODB_URI=mongodb://localhost:27017/build-dummy

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]