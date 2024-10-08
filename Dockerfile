# syntax = docker/dockerfile:1

FROM node:lts-slim AS base

LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Install node modules including devDependencies
COPY --link package.json package-lock.json ./
RUN npm install

# Copy application code
COPY --link . .

# Build application
RUN npm run build

# Set production environment
ENV NODE_ENV="production"
# Remove development dependencies
RUN rm -rf node_modules && \
    npm install

# Final stage for app image
FROM base


# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
