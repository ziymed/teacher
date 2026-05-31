#!/usr/bin/env bash

# Define paths
DB_DIR="/var/www/html/storage/database"
DB_FILE="$DB_DIR/database.sqlite"

echo "Checking SQLite database at $DB_FILE..."

# Create database directory if it does not exist
if [ ! -d "$DB_DIR" ]; then
    echo "Creating SQLite database directory..."
    mkdir -p "$DB_DIR"
fi

# Create database file if it does not exist
if [ ! -f "$DB_FILE" ]; then
    echo "Creating SQLite database file..."
    touch "$DB_FILE"
fi

# Ensure correct permissions for Nginx / PHP-FPM
echo "Setting permissions for www-data..."
chown -R www-data:www-data "$DB_DIR"
chmod -R 775 "$DB_DIR"

# Run Laravel migrations on boot
echo "Running Laravel database migrations..."
/usr/bin/php /var/www/html/artisan migrate --force --no-ansi

echo "SQLite initialization completed successfully."
