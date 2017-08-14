
# Pa11y Sidekick ![architecture stage][status-badge]

This is a new project based around Pa11y, code-named "Sidekick". Pa11y Sidekick will be a modern and well thought out replacement for [Pa11y Dashboard] and [Pa11y Webservice]. What exactly is Pa11y Sidekick going to do? Still to be defined, but our rough proposal at this stage:

  > like Travis, but for a11y testing, and with graphs.

:sparkles: [Click here for the full proposal document, project roadmap, and FAQs](PROPOSAL.md) :sparkles:

---


[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![LGPL-3.0 licensed][shield-license]][info-license]

---

## Latest news from Pa11y

💭 We'd like to find out how you use Pa11y and what you think about it. Please [fill in our survey][survey] to let us know your thoughts!

---

## The Architecture

We maintain an [Architecture Guide](ARCHITECTURE.md) which outlines how the application works, and how everything fits together. It's strongly recommended that you read through it if you want to contribute. We're currently in the architecture stage of development so this application has no features – it's purely a demo how _how_ we want to build things.

If you have any feedback, we'd love to hear it! This architecture is not yet set in stone.

  - Have an idea for a feature?
  - Want to help out?
  - Think we're doing this all wrong?

[Raise an issue on this repo][issues], or get in touch on [Twitter][twitter] (our DMs are open). Also, feel free to open a PR to suggest changes.


## Running locally

This application requires [Node.js] 4+ and [PostgreSQL] 9.2+.

  1. Install dependencies:

     ```sh
     make install
     ```

  2. Create a database (assumes you have the `psql` command on your path) and run migrations:

     ```sh
     make db-create db-migrate-up
     ```

  3. Optionally seed the database with test data if you want to see all of the features more quickly:

     ```sh
     make db-seed
     ```

  4. Start the application in either production mode:

     ```sh
     make start
     ```

     or development mode (with auto reloading):

     ```sh
     make start-dev
     ```


## Configuration

Pa11y Sidekick is highly configurable. You can configure the application with the following [environment variables]:

  - **`DATABASE`**: A PostgreSQL connection string, used to connect to the database.<br/>
    Default: `postgres://localhost:5432/pa11y_sidekick`,<br/>
    Aliases: `DATABASE_URL`.

  - **`LOG_LEVEL`**: The lowest level of logs to output, one of `error`, `warn`, `info`, `verbose`, `debug`.<br/>
    Default: `verbose` in production and `debug` in development.

  - **`NODE_ENV`**: The environment to run the application in, one of `production`, `development`, `test`.<br/>
    Default: `development`.

  - **`PORT`**: The HTTP port to run the application on. If set to an empty string, a random port will be assigned.<br/>
    Default: `8080`.

  - **`REQUEST_LOG_FORMAT`**: The log format to use for request logging, one of [morgan's predefined formats][morgan-formats].<br/>
    Default: `combined`.

  - **`SESSION_SECRET`**: The secret to encrypt session IDs with. If not specified, this will default to a UUID which means sessions will be destroyed every time the application restarts.<br/>
    Default: a UUID.

Pa11y Sidekick will first attempt to load an `.env` file in the root of the project and read configurations from there. You can copy the sample environment config as a starting point:

```sh
make config
```

Alternatively you can set environment variables before running your command. Here's an example:

```sh
LOG_LEVEL=debug PORT=1234 REQUEST_LOG_FORMAT=tiny make start
```


## Contributing

There are many ways to contribute to Pa11y Sidekick, we cover these in the [contributing guide](CONTRIBUTING.md) for this repo.

If you're ready to contribute some code, clone this repo locally and commit your code on a new branch. It's useful to read the [Architecture Guide](ARCHITECTURE.md) before contributing.

Please write unit tests for your code, and check that everything works by running the following before opening a <abbr title="pull request">PR</abbr>:

1. Create a test database (assumes you have the `psql` command on your path):

   ```sh
   make db-create-test
   ```

2. Run the following command to verify the code and run all of the tests:

   ```sh
   make ci
   ```

You can also run verifications and tests individually:

```sh
make verify              # Verify all of the code (JSHint/JSCS/Dustmite)
make test                # Run all tests
make test-unit           # Run the unit tests
make test-unit-coverage  # Run the unit tests with coverage
make test-integration    # Run the integration tests
```


## Licence

Licensed under the [Lesser General Public License (LGPL-3.0)](LICENSE).<br/>
Copyright &copy; 2016–2017, Team Pa11y



[environment variables]: https://en.wikipedia.org/wiki/Environment_variable
[issues]: https://github.com/pa11y/sidekick/issues
[morgan-formats]: https://github.com/expressjs/morgan#predefined-formats
[node.js]: https://nodejs.org/
[pa11y dashboard]: https://github.com/pa11y/dashboard
[pa11y webservice]: https://github.com/pa11y/webservice
[postgresql]: http://www.postgresql.org/
[status-badge]: https://img.shields.io/badge/status-architecture-orange.svg
[survey]: https://goo.gl/forms/AiMDJR2IuaqX4iD03
[twitter]: https://twitter.com/pa11yorg

[info-dependencies]: https://gemnasium.com/pa11y/sidekick
[info-license]: LICENSE
[info-node]: package.json
[info-build]: https://travis-ci.org/pa11y/sidekick
[shield-dependencies]: https://img.shields.io/gemnasium/pa11y/sidekick.svg
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-4–6-brightgreen.svg
[shield-build]: https://img.shields.io/travis/pa11y/sidekick/master.svg
