FROM node:18 AS builder

COPY . .

RUN npm install  && npm run build

FROM node:18

WORKDIR /opt/app

COPY --from=builder ./node_modules ./node_modules
COPY --from=builder ./dist ./dist
COPY .env .env
EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main"]
