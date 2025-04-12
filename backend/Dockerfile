FROM node:18-alpine
WORKDIR /app
RUN apk update && apk add --no-cache python3 py3-pip g++
COPY . . 
RUN npm install
EXPOSE 8888
CMD ["node", "index.js"]