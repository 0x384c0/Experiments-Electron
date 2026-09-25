FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Electron runtime needs these on Linux, xvfb for headless window display.
RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    xauth \
    libgtk-3-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    libatspi2.0-0 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*
