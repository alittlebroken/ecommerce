# eCommerce API

a RESTFul API for an eCommerce service

## Description

The eCommerce API is one part of a suite of software that makes up the bulk of a backend for an online shop. 

It provides routing that allow you to perform CRUD operations against the database which contains the users, products and other pertient information related to an online shop.

It uses Stripe for payment of goods and passport to secure the API.

## Getting Started

All commands specified below were run inside Windows PowerShell

### Dependencies

The api was developed and tested with the following software

* Windows 11
* postgres 14.1
* Node v14.19.0
* An account at https://stripe.com/gb for your stripe API keys

### Installing

* Clone the repo to an appropriate location
```
 git clone https://github.com/alittlebroken/ecommerce.git
```

* Change into the folder
```
cd ecommerce
```

* Install the packages
```
npm install
```

* Create the database

username must have privileges to create users and databases within postgres and also ensure that when creating the user you set a unique password and not use CHANGEME.

```
cd ecommerce\db

psql -U username

CREATE DATABASE ecommerce WITH ENCODING 'UTF8' LC_COLLATE='English_United Kingdom' LC_CTYPE='English_United Kingdom';

CREATE USER ecomm_user WITH ENCRYPTED PASSWORD 'CHANGEME';

GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecomm_user;
```

* Import the schema
```
pqsl ecommerce.sql -p 5432 -U ecomm_user ecommerce
```

### Configuring

* Create a copy of .env.MODIFY
```
copy .env.MODIFY .env
```

* Now set the appropriate values for your system

Make sure that you use hard to guess secrets and use different secrets for each environment you have

### Executing program

* Start the server
```
npm start
```

* To test everything works as designed run the tests
```
npm test
```

* If all is good with the tests you should see results similar to the following
```
Test Suites: 7 passed, 7 total
Tests:       68 passed, 68 total
Snapshots:   0 total
Time:        16.831 s
```

## Authors

Paul Lockyer
[@lockyerp](https://twitter.com/lockyerp)


## Version History

* 0.1
    * Initial Release

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
