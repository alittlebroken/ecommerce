# What image to use
FROM node:14

# The workdir for the app
WORKDIR /usr/src/ecommerce-api

# Copy package files and then install them
COPY package*.json .
RUN npm install

# Copy the source code
COPY . .

# Set the port the API listens on
EXPOSE 5000

# Set the environment variables
# APP
ENV CLIENT_URL http://localhost:3000
ENV SERVER_URL http://localhost:5000
# DB
ENV DBUSER ecommerce
ENV DBPASSWORD password
ENV DBNAME ecommerce
ENV DBPORT 5433
ENV DBHOST localhost
ENV DATABASE_URL postgres://$DBUSER:$DBPASSWORD@$DBHOST:$DBPORT/$DBNAME
# AUTH
ENV SALT_ROUNDS 10
ENV TOKEN_SECRET CHANGEME
ENV TOKEN_EXPIRATION 14d
# STRIPE API
ENV STRIPE_API_KEY CHANGEME
ENV STRIPE_ENDPOINT_SECRET CHANGEME
ENV STRIPE_CURRENCY GBP

# Command to run to start the server
CMD ["node","server.js"]