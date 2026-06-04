# Lightweight production image for the Zah Hub Discord bot.
FROM node:20-alpine

WORKDIR /app

# Install only production deps; skip optional music packages (they need extra
# build tooling and the bot degrades gracefully without them — see HOSTING.md).
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --omit=optional --no-audit --no-fund

# App source
COPY src ./src
COPY scripts ./scripts

# Persist per-guild JSON storage across restarts by mounting a volume here.
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV NODE_ENV=production
CMD ["node", "src/index.js"]
