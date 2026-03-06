# API Error Handling Documentation

This document describes the comprehensive error handling implemented across the application.

## HTTP Status Codes Used

### 201 Created
- **When**: User successfully registered
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "registered_at": "2026-03-06T12:00:00.000Z",
    "phone": null,
    "birth_date": "1990-01-01T00:00:00.000Z"
  }
}
```

### 400 Bad Request
- **When**: Invalid data provided by the client
- **Cases**:
  - User age less than 13 years
  - User age more than 150 years (invalid birth date)
  - Invalid password (not string, empty)
  - Other constraint violations

**Example Response**:
```json
{
  "error": {
    "message": "User must be at least 13 years old",
    "code": "BAD_REQUEST",
    "details": {
      "field": "birth_date",
      "providedAge": 10
    }
  }
}
```

### 409 Conflict
- **When**: Resource already exists
- **Cases**:
  - Email address already registered
  
**Example Response**:
```json
{
  "error": {
    "message": "An account with this email already exists",
    "code": "CONFLICT",
    "details": {
      "field": "email",
      "value": "user@example.com"
    }
  }
}
```

### 422 Unprocessable Entity
- **When**: Validation errors from Zod schema
- **Cases**:
  - Missing required fields
  - Invalid field types
  - Field length violations
  - Invalid email format
  - Weak password (missing uppercase/lowercase/number)
  - Birth date in the future
  - Birth date before 1900

**Example Response**:
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email address format",
          "code": "invalid_string"
        },
        {
          "field": "password",
          "message": "Password must be at least 8 characters long",
          "code": "too_small"
        }
      ]
    }
  }
}
```

### 500 Internal Server Error
- **When**: Unexpected server errors
- **Cases**:
  - Password hashing failure
  - Database insert failure (non-specific)
  - Unexpected errors in any layer
  - User creation succeeded but no rows returned

**Example Response**:
```json
{
  "error": {
    "message": "Failed to process password",
    "code": "INTERNAL_SERVER_ERROR",
    "details": {
      "stage": "password_hashing"
    }
  }
}
```

### 503 Service Unavailable
- **When**: Database or external services are unavailable
- **Cases**:
  - Database connection pool not initialized
  - Cannot connect to MySQL server (errno 2002, 2003)
  - Connection lost during query (errno 2006, 2013)
  - Too many connections (errno 1040)
  - Query timeout (errno 1205)
  - Network connection errors (ECONN, ENOTFOUND)

**Example Response**:
```json
{
  "error": {
    "message": "Database is temporarily unavailable. Please try again later.",
    "code": "SERVICE_UNAVAILABLE",
    "details": {
      "code": "ECONNREFUSED",
      "errno": 2002,
      "kind": "connection"
    }
  }
}
```

## Error Flow

### 1. Request Validation Layer (API Route)
**File**: `/src/app/api/auth/signup/route.ts`

- Catches invalid JSON in request body
- Validates input against Zod schema
- Returns 422 for validation errors
- Catches and formats all downstream errors

### 2. Business Logic Layer (Service)
**File**: `/src/lib/services/userService.ts`

- Age validation (13-150 years)
- Email normalization (lowercase, trim)
- Name trimming
- Password hashing with error handling
- Database error classification:
  - Duplicate email → 409 Conflict
  - Constraint violations → 400 Bad Request
  - Connection errors → 503 Service Unavailable
  - Other DB errors → 500 Internal Server Error

### 3. Database Layer
**File**: `/src/lib/db/users.ts`

- Validates returned rows
- Wraps unexpected errors
- Re-throws DBError for service layer handling

### 4. Query Layer
**File**: `/src/lib/db/query.ts`

Error classification by MySQL error codes:
- **Connection errors**: ECONN*, PROTOCOL*, errno 1040/2002/2003/2006/2013
- **Timeout errors**: ETIMEDOUT, errno 1205
- **Constraint errors**: ER_DUP_ENTRY, errno 1062/1451/1452/1406
- **Syntax errors**: ER_PARSE_ERROR, errno 1064/1054

### 5. Authentication Layer
**File**: `/src/lib/auth/hash.ts`

- Password validation (length, type)
- Bcrypt error handling
- Safe comparison (returns false on error)

## Validation Rules

### First Name & Last Name
- **Required**: Yes
- **Type**: String
- **Min length**: 1 (after trim)
- **Max length**: 32
- **Transformations**: Trimmed

### Email
- **Required**: Yes
- **Type**: String
- **Format**: Valid email
- **Max length**: 256
- **Transformations**: Lowercase, trimmed
- **Uniqueness**: Must be unique (409 if exists)

### Password
- **Required**: Yes
- **Type**: String
- **Min length**: 8
- **Max length**: 72 (bcrypt limit)
- **Pattern**: Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Birth Date
- **Required**: Yes
- **Type**: Date
- **Validation**:
  - Must be in the past
  - Must be after 1900
  - User must be at least 13 years old
  - User age cannot exceed 150 years

### Phone
- **Required**: No
- **Type**: String or null
- **Max length**: 32
- **Transformations**: Trimmed, empty string → null

## Database Error Codes

### MySQL Error Numbers Handled

| errno | Code | Description | HTTP Status |
|-------|------|-------------|-------------|
| 1062 | ER_DUP_ENTRY | Duplicate entry | 409 |
| 1451 | ER_ROW_IS_REFERENCED_2 | Foreign key constraint (delete) | 400 |
| 1452 | ER_NO_REFERENCED_ROW_2 | Foreign key constraint (insert/update) | 400 |
| 1406 | ER_DATA_TOO_LONG | Data too long for column | 400 |
| 1040 | - | Too many connections | 503 |
| 2002 | - | Can't connect to server | 503 |
| 2003 | - | Can't connect to MySQL | 503 |
| 2006 | - | MySQL server has gone away | 503 |
| 2013 | - | Lost connection during query | 503 |
| 1205 | - | Lock wait timeout | 503 |
| 1064 | ER_PARSE_ERROR | SQL syntax error | 500 |
| 1054 | ER_BAD_FIELD_ERROR | Unknown column | 500 |

## Error Classes

All error classes extend `ApiError` base class:

```typescript
class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  
  toJSON() // Returns formatted error response
}
```

### Available Error Classes

- `BadRequestError` - 400
- `NotFoundError` - 404
- `ConflictError` - 409
- `ValidationError` - 422
- `InternalServerError` - 500
- `ServiceUnavailableError` - 503

## Usage Example

```typescript
import { ConflictError } from '@/lib/errors/ApiError';

// In your code
if (emailExists) {
  throw new ConflictError('Email already exists', {
    field: 'email',
    value: email
  });
}
```

## Testing Error Cases

### Test duplicate email (409)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "existing@example.com",
    "password": "Password123",
    "birth_date": "1990-01-01"
  }'
```

### Test validation error (422)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "J",
    "last_name": "D",
    "email": "invalid-email",
    "password": "weak",
    "birth_date": "2030-01-01"
  }'
```

### Test underage user (400)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Child",
    "last_name": "User",
    "email": "child@example.com",
    "password": "Password123",
    "birth_date": "2020-01-01"
  }'
```

## Logging

All errors are logged with appropriate context:
- Password hashing errors
- Database connection errors
- Unexpected errors in each layer

Logs include:
- Error message
- Error code
- Operation context
- Stack trace (for unexpected errors)

## Security Considerations

1. **Password comparison**: Never throws errors, returns false on failure
2. **Error details**: Carefully chosen to not leak sensitive information
3. **Stack traces**: Only logged server-side, never sent to client
4. **Email normalization**: Prevents case-sensitivity issues
5. **Input sanitization**: All strings trimmed, validated
