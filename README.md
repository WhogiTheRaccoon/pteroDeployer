# PteroDeployer

## Description

`PteroDeployer` is a Discord bot designed to help users deploy game servers easily. It leverages the Pterodactyl API to manage server instances and provides a set of commands to interact with the bot via Discord. This bot is cobbled together quickly for a friend and is not intended to be a full featured bot. This bot is also made to my friends specifications so if you want to remove, add, or alter features feel free to fork and modify as needed.

## Features

- Deploy game servers with a simple command.
- Check the status of the bot.
- Send custom embed messages in chat.
- Log important actions to a specified channel.
- Manage server limits per user.
- Fetch and create users and servers using the Pterodactyl API.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/WhogiTheRaccoon/pteroDeployer.git
    cd pteroDeployer
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a ``.env`` file based on the ``.env.example`` and fill in the required values:
    ```sh
    cp .env.example .env
    ```
4. Generate and migrate the database:
    ```sh
    npm run db:generate
    npm run db:migrate
    ```

4. Build the project:
    ```sh
    npm run build
    ```

5. Start the bot:
    ```sh
    npm start
    ```

## Example Usage

### Deploy Command

Deploy a game server using the `/deploy` command:
```sh
/deploy servername:<Server Name> gametype:<Game Type> email:<Your Email> serverdescription:<Server Description>
```

### Send Embed Command

Send a custom embed message using the `/sendembed` command:
```sh
/sendembed embedname:introduction
```

### Ping Command

Check the bot's status using the `/ping` command:
```sh
/ping
```

### ListServers Command

List active servers `/listservers` command:
```sh
/listservers
```

## Commands

- **/deploy**: Deploy a game server.
- **/sendembed**: Send a custom embed message.
- **/ping**: Check the bot's status.
- **/listservers**: List active servers.

## Configuration

Ensure you have the following environment variables set in your .env file:

```env
# General
SERVER_NAME=Community Name
SERVER_PREFIX=Prefix
TOKEN=
GUILD_ID=
LOG_CHANNEL_ID=

# Pterodactyl Configs
PTERO_URL=https://panel.server.com
PTERO_TOKEN= # Application API Key
NODE=1 # Primary Node to deploy to.
SERVER_PER_USER=1 # Max Servers per User
SERVER_EXPIRE=14 # After x days their server will expire 
USER_WAIT_TIME=300000 # Wait for the user's response for x amount of time. | Default: 300000 (5 minutes)

# Server Details Config The default specs you want each vm to have
CPU_LIMIT=100
RAM_LIMIT=1024
DISK_LIMIT=1024

# Database
DB_FILE=./src/db/database.sqlite
```

### Game Nests & Eggs
Everyones installation of pterodactyl will be different, so you will need to update the `games.csv` file to match your nests and eggs. 

```csv
displayName:NestID:EggID

Example:
minecraft:1:1
garrysmod:2:10
```
