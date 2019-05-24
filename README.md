# branch-deploy
### Manage the deployment of multiple branches through an API 

## What is this used for?
### When you want to quickly deploy test branches of NodeJS server-side applications onto temporary hosts. Back-end API's, front-end previews - anything with a host server. 

## How does this work?
### Essentially, this project acts as a master controller, managing the different branches of a git repo. When the branch-deploy API is triggered, the controller clones the repo locally, checkouts the specified branch and then starts it up on a unique hostname. 

## Application ENV variables 
### When you build your application, it needs to have a few ENV variables working in order to properly assign a unique route prefix. Branch-deploy expects a dotenv configuration type setup: .env is stored in the project root and is automatically binded to the application on runtime. Your rout

| Variable | Description                                |
|----------|--------------------------------------------|
| PREFIX   | Assigns a host for the server to listen on |
| HOST     | Assigns a host for the server to listen on |
| PORT     | Assigns a port for the server to listen on |

## Branch-Deploy ENV variables 
### Before you can use branch-deploy you will have to setup a few ENV variables. 

| Variable  | Description                                              |
|-----------|----------------------------------------------------------|
| REPO_URL  | The URL of the git repo you want to deploy               |
| GIT_USER  | Your git username                                        |
| GIT_PASS  | Your git password                                        |
| APP_ENTRY | Location of your entry file relative to root of app repo |
| HOST      | Assign a host for branch-deploy to listen on(optional)   |
| PORT      | Assign a port for branch-deploy to listen on(optional)   |

### NOTE: Any additional variables defined in your application can be added to the .additional.env in the branch-deploy. These will be automatically binded to the application environment. 

## Quick-Start
### 1. Start off by cloning this [repo](https://github.com/Squishy123/branch-deploy.git). 
### 2. Copy .example.env to .env and fill in your branch-deploy ENV variables.
### 3. Install project dependencies: 
### ` yarn ` or ` npm install `
### 4. Start up the branch-deploy server:
### `yarn start` or `npm run start`