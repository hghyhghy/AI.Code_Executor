
# Project Title

A brief description of what this project does and who it's for

a fullstack AI supported code editor , with code options for python,javascript,typescript, and go ... user also gets some features listed below 
1. Monaco code editor 
2. Support for python,js,ts,go  
3.  Terminal for debugging/run 
4. Ai suggestions and auto complete 
5. Code  share with unique link 
6. Real time code collaboration .
## Acknowledgements

 - [Awesome Readme Templates](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
 - [Awesome README](https://github.com/matiassingers/awesome-readme)
 - [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)


## API Reference in this project 

#### register / entry point for user 

```http
  POST/auth/register 
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### signed up user can login from here 

```http
  POST /auth/login
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |

#### folder creating point for user 

```http
  POST/folder/create  
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |


#### file creating point for user 

```http
  POST/file/create  
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |


#### folder deletion point for user 

```http
  POST/folder/delete/{id}  
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |


#### file deleting point for user 

```http
  POST/file/delete/{id}/{folderName}  
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

## Appendix

Any additional information goes here

use technologies are 

1.prisma - for connecting/interaction with DB

2.mysql - for database

3.monaco -for code editor

4.websocket - for realtime code collab

5.next js - frontend/UI

6.next js-backend/endpoints

7.tailwind - styling

8.geminiAi- for AI suggestion and autocomplete and code debug

9.jwttoken - for user authentication## Color Reference

| Color             | Hex                                                                |
| ----------------- | ------------------------------------------------------------------ |
| Prisma code  |   datasource db {
                    provider = "sqlite"
                    url      = env("DATABASE_URL")
}

                        generator client {
                        provider = "prisma-client-js"
                        } |



## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.


## Authors

- [@hghyghy](https://www.github.com/hghyhghy)


## Documentation

[Nest js +prisma](https://docs.nestjs.com/recipes/prisma)

[Nest js + websocket](https://docs.nestjs.com/websockets/gateways)

[Nest js + database](https://docs.nestjs.com/techniques/database)

[Next js ](https://nextjs.org/docs)

[Google Ai studio ](https://aistudio.google.com/)







## Badges

Add badges from somewhere like: [shields.io](https://shields.io/)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)


## Features

- Light/dark mode toggle

- Live previews / dubug in console 

- AI suggestion  

- CORS enabled 

- real time code collab

- share code using unique link






## Tech Stack

**Client:** React, Next js , TailwindCSS ,  axios , monaco,react-icons

**Server:** Nest js ,prisma, MySql,websocket,GeminiApi,Jwt token


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY_FOR_Ai`:get your api key from googleAiStudio

`ANOTHER_API_KEY`

