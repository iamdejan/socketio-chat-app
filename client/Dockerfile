FROM node:16.13.2-bullseye-slim

WORKDIR /app
COPY . .

RUN yarn install

EXPOSE 3000
ENV SOCKET_URL=http://localhost:4000
CMD ["yarn", "dev"]
