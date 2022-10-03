#!/bin/bash
set -e

psql -Upostgres ktracker -c 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kermesse_tracker;'
