# Mems

## Features

- Image deduplication
- Smart album creation

## Getting Started

### First time setup

Before firing everything up, make sure to create a .env file and update it with the values in the env.example file as well as updating the env variables in the docker-compose.yaml file

1) Enable corepack by running `corepack enable`
2) Install deps `yarn`
3) Setup local environment `docker-compose up`
4) Setup db `yarn workspace @mems/db db-push`

### Testing it out

# TODO

## Server

- [] `should_move_files` when set to false
  - Should maintain the original structure of how the media came in, if possible.

Helpful links:

filtering: https://www.prisma.io/docs/concepts/components/prisma-client/composite-types#filtering-for-one-composite-type

TODO

[ ] Album Suggestions Broken
[ ] Figure out why media takes so long to load - limit ffmpeg? use child processes?
