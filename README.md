<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/henriquemod/apolloservers-discord-bot">
    <img src="https://github.com/henriquemod/apolloservers-discord-bot/blob/main/src/assets/logo2.png?raw=true" alt="Logo" width="160" height="160">
  </a>

  <h3 align="center">Apollo Servers</h3>

  <p align="center">
    The best gameserver status query bot for your discord server!
    <br />
    <a href="https://github.com/henriquemod/apolloservers-discord-bot/wiki"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://discord.com/api/oauth2/authorize?client_id=937315369171955713&permissions=10240&scope=bot%20applications.commands">Add Bot</a>
    ·
    <a href="https://github.com/henriquemod/apolloservers-discord-bot/issues">Report Bug</a>
    ·
    <a href="https://github.com/henriquemod/apolloservers-discord-bot/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

This project was first idealized from my personal need in a bot that could query game servers, in special CSGO servers and all available solutions at the moment were either insufficient or couldn't offer all the features I wanted.

Here a few things Apollo can do:

* Up to 25 servers per discord server
* Autoupdate embends
* Suports legacy and slash commands
* Help menu

The idea is to keep simple while giving discord admins the possibility of adding their preferred game server (for now limited to valve protocols) and make easy for users to check server status (players count, tags, map, game, server name and more)

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

* [Discord.js](https://discord.js.org/)
* [WOKCommands](https://github.com/AlexzanderFlores/WOKCommands)
* [GraphQL](https://graphql.org/)
* [Apollo GraphQL](https://www.apollographql.com/)
* [NodeJS](https://nodejs.org/)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

This project is in development state as well the API the bot consumes, if you intend to host this bot to query gameservers in your discord server fell free to contact me and ask for an api key, futher more i'll be creating a webpage to allow people to create their own account's

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* NodeJS v16.14+
* MongoDB
* Yarn
  ```sh
  npm install yarn -g
  ```

### Installation

1. Get a free API Key at [Website under development](https://apolloapi.top/) contact me for a key
2. Clone the repo
   ```sh
   git clone git@github.com:henriquemod/apolloservers-discord-bot.git
   ```
3. Install NPM packages
   ```sh
   yarn
   ```
4. Configure docker-compose.yml with desired credentials and then run
   ```sh
   docker-compose up -d
   ```
   _If you already have a mongodb server you can skip this step_
####

5. Rename .env.example to .env and fill variables with your relevant data
_If in production I strongly recommend using local environment variables instead putting in an. env file for security purposes_
####
6. Build project
   ```sh
   yarn build
   ```

7. Start the bot
   ```sh
   yarn dev
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

| **Command**    | **Description**                                                | **Permition** | **Legacy** | **Slash** |
|:--------------:|:--------------------------------------------------------------:|:-------------:|:----------:|:---------:|
| status         | Show a menu to user select one to show its status              | public        | :white_check_mark:          | :white_check_mark:         |
| servers        | Show a status resume of all servers added                      | public        | :white_check_mark:          | :white_check_mark:         |
| setkey         | Set an API Key                                                 | admin         | :no_entry_sign:          | :white_check_mark:         |
| setlocale      | Set the locale to be used                                      | admin         | :no_entry_sign:          | :white_check_mark:         |
| settimezone    | Set the timezone to be used                                    | admin         | :no_entry_sign:          | :white_check_mark:         |
| addschedule    | Create embend with server status that are frequently refreshed | admin         | :white_check_mark:          | :white_check_mark:         |
| deleteschedule | Delete a schedule                                              | admin         | :white_check_mark:          | :white_check_mark:         |
| addserver      | Add a gameserver                                               | admin         | :no_entry_sign:          | :white_check_mark:         |
| deleteserver   | Delete a gameserver                                            | admin         | :white_check_mark:          | :white_check_mark:         |
| showservers    | Show servers with their IDs and settings                       | admin         | :white_check_mark:          | :white_check_mark:         |
| editdesc       | Edit a server description                                      | admin         | :white_check_mark:          | :white_check_mark:         |
| edithost       | Edit a server host                                             | admin         | :white_check_mark:          | :white_check_mark:         |
| editname       | Edit a server name                                             | admin         | :white_check_mark:          | :white_check_mark:         |
| editport       | Edit a server port                                             | admin         | :white_check_mark:          | :white_check_mark:         |
| edittype       | Edit a server type                                             | admin         | :white_check_mark:          | :white_check_mark:         |
| botpresence    | Show how many servers this bot is added                        | bot owner     | :white_check_mark:          | :white_check_mark:         |
| botstatus      | Change bot status                                              | bot owner     | :no_entry_sign:          | :white_check_mark:         |


_For more in depth command usage, please refer to the [Documentation](https://github.com/henriquemod/apolloservers-discord-bot/wiki)_

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [ ] Add Changelog
- [x] Add back to top links
- [ ] Multi-language Support
    - [x] English
    - [x] Portuguese
    - [ ] Spanish
- [ ] Test coverage all cases

See the [open issues](https://github.com/henriquemod/apolloservers-discord-bot/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Henrique Souza - [LinkedIn](https://www.linkedin.com/in/henriqueasouza/)

Project Link: [https://github.com/henriquemod/apolloservers-discord-bot](https://github.com/henriquemod/apolloservers-discord-bot)

<p align="right">(<a href="#top">back to top</a>)</p>
