FROM node:16.13.2-bullseye-slim

WORKDIR /app
COPY . .

RUN yarn install

EXPOSE 3000
CMD ["yarn", "dev"]
