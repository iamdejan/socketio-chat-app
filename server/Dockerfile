FROM node:16.13.2-bullseye-slim

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .
RUN yarn lint && yarn build

EXPOSE 4000
CMD ["yarn", "start"]
