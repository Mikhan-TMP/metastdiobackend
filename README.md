# MetaStudio API

A RESTful API for generating, storing, and managing user avatars with different styles.

## Table of Contents
- [API Endpoints](#api-endpoints)
  - [Save Generated Avatar](#generate-avatar)
  - [Get All Avatars](#get-all-avatars)
  - [Filter Avatars](#filter-avatars)
  - [Delete Avatar](#delete-avatar)
- [Response Examples](#response-examples)
- [Error Handling](#error-handling)

## API Endpoints

### Save Generated Avatar
`POST http://192.168.1.141:3001/avatar/generate`

Save a generated avatar to the database.

**Request Body:**
```json
{
    "email": "test@example.com",
    "image": "base64_encoded_image",
    "style": "realistic"
}

```


### Get All Avatars
`GET http://192.168.1.141:3001/avatar/getAvatars?email={email}`

Fetch all generated avatars for a specific user.

**Parameters:**

    email (required): User's email address

### Filter Avatars
`GET http://192.168.1.141:3001/avatar/getAvatars?email={email}&style={style}&name={name}`

Fetch avatars with optional filters.

**Parameters:**

    email (required): User's email address

    style: Filter by avatar style

    name: Filter by avatar name
    

### Delete Avatar
`DELETE http://192.168.1.141:3001/avatar/delete?email=test@example.com&id=67e11f9194774c7ccb2b84d1`

Delete a specific avatar.

**Parameters:**

    email (required): User's email address

    id (required): Avatar ID to delete
    
## Response Examples

### Get All Avatars Response
```
[
    {
        "imgSrc": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "style": "realistic"
    },
    {
        "imgSrc": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "style": "realistic"
    }
]
```

### Filtered Avatars Response

```
[
    {
        "imgSrc": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "style": "realistic",
        "name": "Avatar 1023"
    },
    {
        "imgSrc": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "style": "realistic",
        "name": "Avatar Air"
    }
]
```

## Error Handling
The API returns appropriate HTTP status codes with error messages in JSON format when something goes wrong.

**Common Error Responses:**

    400 Bad Request: Missing required parameters or invalid input

    404 Not Found: Avatar not found

    500 Internal Server Error: Server-side error

**Example Error Response:**


```
{
    "error": "Email parameter is required",
    "status": 400
}

```


## License
This project is licensed under the MIT License.

## Contact

For any issues or inquiries, please contact at mikhanbalbastro00@gmail.com.
