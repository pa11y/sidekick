
# Pa11y Sidekick ![architecture stage][status-badge]

This is the proposal for a new project based around Pa11y. The project is code-named "Sidekick".

:point_right: **[Click here for the full proposal document, project roadmap, and FAQs](PROPOSAL.md)** :point_left:


## Understanding the Architecture

We maintain an [Architecture Guide](ARCHITECTURE.md) which outlines how the application works, and how everything fits together. It's strongly recommended that you read through it if you want to contribute. We're currently in the architecture stage of development so this application has no features – it's purely a demo how _how_ we want to build things.


## Running locally

This application requires [Node.js] 4+ and [PostgreSQL].

  1. Install dependencies:

     ```sh
     make install
     ```

  2. Create a database (assumes you have the `psql` command on your path) and run migrations:

     ```sh
     make db-create db-migrate-up
     ```

  3. Optionally seed the database with test data if you want to see the app in full swing:

     ```sh
     make db-seed
     ```

  4. Start the application in either production or development mode (with auto-reloading):

     ```sh
     make start
     make start-dev
     ```


## Contributing

To contribute to Pa11y Sidekick, clone this repo locally and commit your code on a new branch. It's useful to read the [Architecture Guide](ARCHITECTURE.md) before contributing.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

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

Licensed under the [Lesser General Public License (LGPL-3.0)](LICENSE).  
Copyright &copy; 2016, Team Pa11y.



[node.js]: https://nodejs.org/
[postgresql]: http://www.postgresql.org/
[status-badge]: https://img.shields.io/badge/status-architecture-orange.svg
