

```sh
# RUN gem install scrypt -v 3.0.8
rake canvas:compile_assets
rake js:gulp_rev
rake js:webpack_production
rake brand_configs:generate_and_upload_all 
rake canvas:cdn:upload_to_s3

# rake -T
rake analytics_engine:install:migrations                                  # Copy migrations from analytics_engine to application
rake app:template                                                         # Apply the template supplied by LOCATION=(/path/to/template) or URL
rake app:update                                                           # Update configs and some other initially generated files (or use just update:configs or update:bin)
rake brand_configs:generate_and_upload_all                                # generate all brands and upload everything to s3
rake brand_configs:write                                                  # Writes the .css (css variables), .js & .json files that are used to load the theme editor variables for each brand Set BRAND_CONF...
rake cache_digests:dependencies                                           # Lookup first-level dependencies for TEMPLATE (like messages/show or comments/_comment.html)
rake cache_digests:nested_dependencies                                    # Lookup nested dependencies for TEMPLATE (like messages/show or comments/_comment.html)
rake canvas:cdn:upload_to_s3                                              # Push static assets to s3
rake canvas:compile_assets                                                # Compile javascript and css assets
rake canvas:compile_assets_dev                                            # Just compile css and js for development
rake canvas:quizzes:create_event_partitions                               # Create partition tables for the current and upcoming months
rake canvas:quizzes:dump_events[quiz_submission_id,out]                   # Generate a JSON dump of events in a single quiz submission
rake canvas:quizzes:generate_events_from_snapshots[quiz_id]               # Generate events from snapshots for submissions to a quiz
rake canvas:seed_consul                                                   # Load config/dynamic_settings.yml into the configured consul cluster
rake canvas:seed_vault                                                    # Initialize vault
rake canvas:upload_sentry_sourcemaps[auth_token,url,org,project,version]  # Upload source maps to Sentry
rake ci:prepare_test_shards                                               # set up test shards if they don't already exist
rake css:styleguide                                                       # Generate styleguide
rake db:clear_ignored_columns[table_name]                                 # Clear columns to be ignored for each model
rake db:configure_account_name                                            # Configure Default Account Name
rake db:configure_admin                                                   # Create an administrator user
rake db:configure_default_settings                                        # Configure default settings
rake db:configure_statistics_collection                                   # Configure usage statistics collection
rake db:create                                                            # Create the database from DATABASE_URL or config/database.yml for the current RAILS_ENV (use db:create:all to create all databases...
rake db:create_default_accounts                                           # Create default accounts
rake db:create_user                                                       # Create a new user
rake db:drop                                                              # Drop the database from DATABASE_URL or config/database.yml for the current RAILS_ENV (use db:drop:all to drop all databases in th...
rake db:encryption:init                                                   # Generate a set of keys for configuring Active Record encryption in a given environment
rake db:environment:set                                                   # Set the environment value for the database
rake db:evaluate_notification_templates                                   # Make sure all message templates have notifications in the db
rake db:fixtures:load                                                     # Load fixtures into the current environment's database
rake db:generate_data                                                     # generate data
rake db:generate_security_key                                             # Generate security.yml key
rake db:get_ignored_columns[table_name]                                   # Get columns to be ignored for each model
rake db:initial_setup                                                     # Useful initial setup task
rake db:load_environment                                                  # Load environment
rake db:load_initial_data                                                 # Create all the initial data, including notifications and admin account
rake db:load_notifications                                                # Find or create the notifications
rake db:migrate                                                           # Migrate the database (options: VERSION=x, VERBOSE=false, SCOPE=blog)
rake db:migrate:down                                                      # Run the "down" for a given migration VERSION
rake db:migrate:predeploy                                                 # Run all pending predeploy migrations
rake db:migrate:redo                                                      # Roll back the database one migration and re-migrate up (options: STEP=x, VERSION=x)
rake db:migrate:status                                                    # Display status of migrations
rake db:migrate:tagged                                                    # Run migrations for a Tag
rake db:migrate:up                                                        # Run the "up" for a given migration VERSION
rake db:pending_migrations                                                # Shows pending db migrations
rake db:prepare                                                           # Run setup if database does not exist, or run migrations if it does
rake db:reset                                                             # Drop and recreate all databases from their schema for the current environment and load the seeds
rake db:reset_encryption_key_hash                                         # Resets the encryption_key hash in the database
rake db:rollback                                                          # Roll the schema back to the previous version (specify steps w/ STEP=n)
rake db:schema:cache:clear                                                # Clear a db/schema_cache.yml file
rake db:schema:cache:dump                                                 # Create a db/schema_cache.yml file
rake db:schema:dump                                                       # Create a database schema file (either db/schema.rb or db/structure.sql, depending on `ENV['SCHEMA_FORMAT']` or `config.active_rec...
rake db:schema:load                                                       # Load a database schema file (either db/schema.rb or db/structure.sql, depending on `ENV['SCHEMA_FORMAT']` or `config.active_recor...
rake db:seed                                                              # Load the seed data from db/seeds.rb
rake db:seed:replant                                                      # Truncate tables of each database for current environment and load the seeds
rake db:set_ignored_columns[table_name,columns]                           # Set columns to be ignored for each model
rake db:setup                                                             # Create all databases, load all schemas, and initialize with the seed data (use db:reset to also drop all databases first)
rake db:skipped_migrations                                                # Shows skipped db migrations
rake db:test:reset                                                        # Drop and regenerate the test db by running migrations
rake db:version                                                           # Retrieve the current schema version number
rake delayed_engine:install:migrations                                    # Copy migrations from delayed_engine to application
rake doc:api                                                              # Generate YARD Documentation / generate API docs
rake graphql:schema                                                       # Dump GraphQL schema and fragment types
rake graphql:subgraph:publish                                             # Publish the subgraph schema to the schema registry as configured by the given VARIANT_KEY
rake i18n:autoimport[translated_file,source_file]                         # Imports new translations, ignores missing or unexpected keys
rake i18n:check                                                           # Validate translation calls everywhere
rake i18n:check_js                                                        # Validate translation calls in JavaScript/HBS source code
rake i18n:check_rb                                                        # Validate translation calls in Ruby source code
rake i18n:export                                                          # Exports new/changed English strings to be translated
rake i18n:extract                                                         # Extract translations from source code into a YAML file
rake i18n:generate                                                        # Alias for i18n:extract
rake i18n:generate_js                                                     # generate JavaScript translation files
rake i18n:generate_lolz                                                   # Generate the pseudo-translation file lolz
rake i18n:import[source_file,translated_file]                             # Validates and imports new translations
rake i18n:lock                                                            # Lock a key so translators cannot change it
rake js:gulp_rev                                                          # Revision static assets
rake js:webpack_development                                               # Build development webpack js
rake js:webpack_production                                                # Build production webpack js
rake js:yarn_install                                                      # Ensure up-to-date node environment
rake lint:render_json                                                     # lint controllers for bad render json calls
rake log:clear                                                            # Truncate all/specified *.log files in log/ to zero bytes (specify which logs with LOGS=test,development)
rake pact:verify                                                          # Verifies the pact files configured in the pact_helper.rb against this service provider
rake pact:verify:at[pact_uri]                                             # Verifies the pact at the given URI against this service provider
rake pact:verify:help[reports_dir]                                        # Get help debugging pact:verify failures
rake remove_schema_signature                                              # Removes the schema line in fixtures, models, and specs
rake stats                                                                # Report code statistics (KLOCs, etc) from the application or engine
rake stormbreaker:combine_results[path,prefix]                            # Combines results that were created from isolated test runs
rake switchman:install:migrations                                         # Copy migrations from switchman to application
rake switchman_inst_jobs:install:migrations                               # Copy migrations from switchman_inst_jobs to application
rake test                                                                 # Run all tests in test folder except system ones
rake test:db                                                              # Reset the database and run `bin/rails test`
rake time:zones[country_or_offset]                                        # List all time zones, list by two-letter country code (`bin/rails time:zones[US]`), or list by UTC offset (`bin/rails time:zones[-...
rake tmp:clear                                                            # Clear cache, socket and screenshot files from tmp/ (narrow w/ tmp:cache:clear, tmp:sockets:clear, tmp:screenshots:clear)
rake tmp:create                                                           # Create tmp directories for cache, sockets, and pids
rake yarn:install                                                         # Install all JavaScript dependencies as specified via Yarn
rake zeitwerk:check                                                       # Check project structure for Zeitwerk compatibility
```