#!/bin/bash
set -e

psql -Upostgres ktracker -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
