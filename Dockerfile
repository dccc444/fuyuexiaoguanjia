FROM node:22-alpine AS client-builder

WORKDIR /app/yueyue-client
COPY yueyue-client/package*.json ./
RUN npm install
COPY yueyue-client/ ./
RUN npm run build

FROM node:22-alpine AS server-runtime

WORKDIR /app/yueyue-server
COPY yueyue-server/package*.json ./
RUN npm install --omit=dev
COPY yueyue-server/ ./

COPY --from=client-builder /app/yueyue-client/dist /app/yueyue-client/dist

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/server.js"]
