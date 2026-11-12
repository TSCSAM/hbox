FROM node:24.14.0-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /workspace
COPY --chown=node:node . .
USER node

RUN pnpm install --frozen-lockfile --filter @hbox/browser-use-plugin...
RUN pnpm --dir apps/hbox-cli --filter @hbox/browser-use-plugin... build

ENV DISPLAY=""
ENV HBOX_HEADLESS_BROWSER_E2E_EXECUTABLE=/usr/bin/chromium
ENV HBOX_HEADLESS_BROWSER_E2E_REQUIRED=1

CMD ["pnpm", "--dir", "apps/hbox-cli", "--filter", "@hbox/browser-use-plugin", "exec", "vitest", "run", "test/headless-browser.e2e.test.ts"]
