FROM node:10.19.0-stretch
WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .
RUN apt-get update && apt-get install postgresql-client -y
RUN echo "DATABASE_URL=postgres://sidekick:sidekick@db:5432/sidekick" > .env
RUN echo "LOG_LEVEL=debug" >> .env
RUN echo "NODE_ENV=development" >> .env
RUN echo "PORT=8080" >> .env
RUN echo "SESSION_SECRET=development" >> .env
EXPOSE 8080
CMD [ "node", "index.js" ]
