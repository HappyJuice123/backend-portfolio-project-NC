# Welcome to Jason's backend project

This is an board games API which shows the reviews, comments, categories and users involved.

## Link to hosted version

https://jasons-backend-games-project.onrender.com/api

## Access to repo

Please navigate to https://github.com/HappyJuice123/backend-portfolio-project-NC and fork the repo.

## Installation of dependencies

You will need to install the dependencies doing a "npm install" in your terminal

Please install the following as dev dependencies

- jest
- jest-extended
- jest-sorted
- supertest

Command is npm install -D <devDependencies>

You will need a minimum version of v19.1.0 for node.js and v8.7.3 for Postgres.

## Setup database

To run the file, create the following files with the exact naming convention in the base repo of BE-NC-GAMES:
'.env.development'
'.env.test'

In the '.end.development' file, add a line of "PGDATABASE=nc_games"
In the '.end.test' file, add a line of "PGDATABASE=nc_games_test"

## Seeding

You will need to create the database you can use the `setup-dbs` command.
To seed the database, there is a file in the `db` folder for the database. You can run this file with the `seed` script.

## Endpoints

To see information on the available endpoints, please navigate to endpoint "/api".
