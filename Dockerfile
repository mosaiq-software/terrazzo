FROM node:20

RUN apt-get update && apt-get install -y 

COPY . /app

WORKDIR /app

RUN npm install

EXPOSE 3001
EXPOSE 3002
EXPOSE 3003

CMD ["npm", "run", "start"]