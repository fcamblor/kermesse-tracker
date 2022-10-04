##!/bin/bash -x
#set -e
#
#current_date=$(date '+%Y%m%d_%H%M%S');
#if [[ -f "/tmp/db-dumps/dump_partial_schema" ]]; then
#  echo "Importing data structure from dump_partial_schema file...";
#  psql --username "$POSTGRES_USER" -d ktracker < /tmp/db-dumps/dump_partial_schema
#  echo "... done !";
#  mv /tmp/db-dumps/dump_partial_schema "/tmp/db-dumps/dump_partial_schema.$current_date.done"
#fi
#
#if [[ -f "/tmp/db-dumps/dump_partial_data" ]]; then
#  echo "Importing data content from dump_partial_data file...";
#  pg_restore -Fc -U "$POSTGRES_USER" -d ktracker --disable-triggers /tmp/db-dumps/dump_partial_data
#  echo "... done !";
#  mv /tmp/db-dumps/dump_partial_data "/tmp/db-dumps/dump_partial_data.$current_date.done"
#fi
