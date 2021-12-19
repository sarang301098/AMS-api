FROM node:14-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY tsconfig*.json ./
COPY src src
RUN npm run build

FROM node:14-alpine AS app
RUN apk add --no-cache chromium
RUN npm install pm2 -g
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -r src/
RUN rm tsconfig.json
COPY --from=builder /usr/src/app/dist dist/
EXPOSE 3333
ENTRYPOINT [ "npm", "run", "docker:start" ]
