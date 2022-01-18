FROM node:16.13.2-bullseye-slim

WORKDIR /app
COPY . .

RUN yarn install && yarn build

EXPOSE 4000
CMD ["yarn", "start"]
