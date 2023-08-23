# Mems

=> WIP <=

Photo and video organizer to consolidate all those random folders of family photos and create some cool albums

## Features

- Image deduplication
- Smart album creation
- Face detection/classification
- Object detection

## Getting Started

### First time setup

Before firing everything up, make sure to create a .env file and update it with the values in the env.example file as well as updating the env variables in the docker-compose.yaml file

1. Enable corepack by running `corepack enable`
2. Install deps `yarn`
3. Setup local environment `docker-compose up`
4. Setup db `yarn workspace @mems/db db-push`
