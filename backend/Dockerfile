FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    pkg-config \
    libssl-dev \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install correct MongoDB extension version (1.x required by composer)
RUN pecl install mongodb-1.21.0 \
    && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy application files
COPY . .

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Update Apache configuration for API routing
RUN a2dissite 000-default

# Create custom VirtualHost configuration
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/api\n\
    ServerName localhost\n\
    <Directory /var/www/html/api>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Enable the site
RUN a2ensite 000-default

# Set proper ownership and permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
