# StarChain Web service

This project implements a simple web service for creating and retrieving blocks in a blockchain using a REST API.

The blocks contain star coordinates and related data.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

Stars are represented with the notation:

```
RA 13h 03m 33.35sec, Dec -49° 31’ 38.1” Mag 4.83 Cen
```

where:

- RA - Right Ascension
- DEC - Declination
- MAG - Magnitude
- CEN - Centaurus (name of star)

### Dependencies

1. Node.js
2. Express.js
3. levelDB

### Setup

1. Install Node and NPM or yarn
2. Clone the project - `git clone https://github.com/gapfranco/starchain`
3. Install dependencies - `npm install` or `yarn`

### Running the project

Change to the project folder and call the entry point:

```
node index.js
```

Listens on port 8000 by default.

With the server running, use a tool like _CURL_, _Insomnia_ or _Postman_ to access the endpoints:

### API endpoints

- **POST localhost:8000/requestValidation**
  Submit a new validation request to the memory pool

- **POST localhost:8000/message-signature/validate**
  Send a a validation request

- **POST localhost:8000/block**
  Send star data to be stored

- **GET localhost:8000/block/[height]**
  Send star data by height

- **GET localhost:8000/stars/hash:[hashcode]**
  Get block by hashcodo

- **GET localhost:8000/stars/address:[address]**
  Get list of blocks by wallet address

### API helper endpoints

Endpoint for debbuging and validation.

- **GET localhost:8000/listRequests**
  After submitting a validation request, it is kept in memory pool for 5 minutes.
  This endpoint lists the requests waiting in the memory pool.

- **GET localhost:8000/listValidRequests**
  After validating a new request, it is taken off the meory pool and added to the validated memory pool.
  This endpoint lists the requests in the validated memory pool.

### Usage examples

To store star data in the blockchan, submit a validation request using a wallet address.

**POST localhost:8000/requestValidation**

Payload: wallet address

```
{
  "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK"
}
```

The service stores the request in the memory pool with a 5 minutes expiration time.
Returns a JSON object containing a message to sign, the timestamp and the validation window:

```
{
  "walletAddress": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
  "requestTimeStamp": "1543941732",
  "message": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK:1543941732:starRegistry",
  "validationWindow": 300
}
```

If the same entry point is called again before expiration, it does not crete a new validation request
but returns the new validation window.

Use the message to get a signed text with a wallet and post the signature with the wallet address.

**localhost:8000/message-signature/validate**

Payload: message signature

```
{
  "address":"13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
  "signature":"IFkrfX+xSFy+TYonM2shJWGgyGiCxtd0F2GkGju+hyddV07XvrucM5aDvOBV9bmFnzh59aMJ+klROEYBy59ezls="
}
```

If the request expired (after 5min or more), the request will be wiped out and the validation will fail:

```
{
  "registerStar": false,
  "error": "validation request not found"
}
```

If the request is still valid:

```
{
  "registerStar": true,
  "status": {
    "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
    "requestTimeStamp": "1543949916",
    "message": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK:1543949916:starRegistry",
    "validationWindow": 255,
    "messageSignature": "H/sQ2Yy/mfnrh7r+3bf8eLKNqHNnLtpx6Kb0OHXt+w1rdEs9IxyefhDq+ZU6HABKqqQlesOWDjbI/Xr+fsKR67s="
  }
}
```

Send a new block with star data

**POST localhost:8000/block**

Payload: star object

```
{
  "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
  "star": {
    "dec": "68° 52' 56.9",
    "ra": "16h 29m 1.0s",
    "mag": "4.83",
    "story": "Found star using https://www.google.com/sky/"
  }
}
```

Returns the block with the star in the body:

```
{
  "hash": "420b9ab7f773f255a91f99dcec50ada9d7aacb17cc23929dee71519228786ba6",
  "height": 9,
  "body": {
    "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
    "star": {
      "dec": "68° 52' 56.9",
      "ra": "16h 29m 1.0s",
      "mag": "4.83",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1543950112",
  "previousBlockHash": "a9aefe51e46968cdc388237f1b1b9a167035c97769a906dcc00c16c894a26415"
}
```

Get a star by hash:

**GET localhost:8000/stars/hash:420b9ab7f773f255a91f99dcec50ada9d7aacb17cc23929dee71519228786ba6**

Returns the block with the star:

```
{
  "hash": "420b9ab7f773f255a91f99dcec50ada9d7aacb17cc23929dee71519228786ba6",
  "height": 9,
  "body": {
    "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
    "star": {
      "dec": "68° 52' 56.9",
      "ra": "16h 29m 1.0s",
      "mag": "4.83",
      "story": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1543950112",
  "previousBlockHash": "a9aefe51e46968cdc388237f1b1b9a167035c97769a906dcc00c16c894a26415"
}
```

Get a star by wallet address:

**GET localhost:8000/stars/address:13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK**

```
[
 {
    "hash": "a9aefe51e46968cdc388237f1b1b9a167035c97769a906dcc00c16c894a26415",
    "height": 8,
    "body": {
      "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
      "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1543941789",
    "previousBlockHash": "010aaa089ce0e96f688d75f441f18a8137209846cab59658bb9381fa2855e136"
  },
  {
    "hash": "420b9ab7f773f255a91f99dcec50ada9d7aacb17cc23929dee71519228786ba6",
    "height": 9,
    "body": {
      "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
      "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "mag": "4.83",
        "story": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1543950112",
    "previousBlockHash": "a9aefe51e46968cdc388237f1b1b9a167035c97769a906dcc00c16c894a26415"
  }
]
```

Get a star by height:

**GET localhost:8000/block/6**

```
{
  "hash": "db5852f3c824ab6778babe33e90c1a1a1a4d50c3b13bffcca090913c4eabbf87",
  "height": 6,
  "body": {
    "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
    "star": {
      "dec": "68° 52' 56.9",
      "ra": "16h 29m 1.0s",
      "story": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1543935859",
  "previousBlockHash": "4c803baf03d4fddf5acbd1495f6f123c5d893a2d38613f64b0758b8e850c0b61"
}
```

**GET localhost:8000/listRequests**

List request in the memory pool

```
[
  {
    "walletAddress": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
    "requestTimeStamp": "1543951309",
    "message": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK:1543951309:starRegistry",
    "validationWindow": 291
  }
]
```

**GET localhost:8000/listValidRequests**

List validated request in the validated memory pool

```
[
  {
    "registerStar": true,
    "status": {
      "address": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK",
      "requestTimeStamp": "1543951309",
      "message": "13hrWT3YoRaEUY92ApcnyRLGSKL9iQYWFK:1543951309:starRegistry",
      "validationWindow": 200,
      "messageSignature": "ID5EE3rQektiBjZ1p91J17G9IGHRYQx2R+Ry+riDrAc8M/5qFB13ghb7WDt5pszbM90XjK1y2FjWNWuLQGeGXTU="
    }
  }
]
```

### Notes

- The _level_ database is created automatically on first use. Will create a folder _chaindata_
  at the project folder level.

- To reset the database, drop the _chaindata_ folder and restart the node service.
