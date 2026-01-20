# PHP API for k3-api-horizon

Complete PHP implementation of the k3-api-horizon backend API, designed to run on shared hosting.

## 📁 Structure

```
api/
├── index.php              # Main router - handles all requests
├── config.php             # Database & app configuration
├── auth.php               # JWT authentication middleware
├── helpers.php            # JSON response & utility functions
├── ArticleCategory.php    # Article category controller
├── Article.php            # Article controller
├── FormRegister.php       # Form registration controller
├── Gallery.php            # Gallery controller
├── ImageCategory.php      # Image category controller
├── .htaccess              # Apache rewrite rules
├── .env.example           # Environment variables example
└── README.md              # This file
```

## 🚀 Features

- ✅ **Identical endpoints** to Golang API
- ✅ **JWT Bearer Token** authentication
- ✅ **IP Whitelist** support
- ✅ **PDO prepared statements** for security
- ✅ **CORS enabled**
- ✅ **JSON responses** for all endpoints
- ✅ **PHP 8+ compatible**
- ✅ **Ready for shared hosting**

## 📋 Requirements

- PHP 8.0 or higher
- MySQL 5.7+ or MariaDB 10.2+
- PDO extension enabled
- Apache with mod_rewrite (for .htaccess)

## 🔧 Installation

### 1. Upload Files

Upload the entire `api/` folder to your shared hosting (e.g., `public_html/api/`).

### 2. Configure Environment

Create a `.env` file or set environment variables in your hosting control panel:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
ACCESS_SECRET=your-secret-jwt-key-here
APP_ENV=production
CORS_ALLOWED_ORIGINS=*
```

**Alternative**: Edit `config.php` directly (not recommended for production).

### 3. Database Setup

Ensure your MySQL database has the following tables:

- `article_categories` (id, name, description, created_at, updated_at)
- `articles` (id, title, slug, content, thumbnail, category_id, author, published_at, created_at, updated_at)
- `form_registers` (id, name, email, phone, message, status, created_at, updated_at)
- `galleries` (id, title, description, image_url, thumbnail, category_id, created_at, updated_at)
- `image_categories` (id, name, description, created_at, updated_at)

### 4. Set Permissions

```bash
chmod 755 api/
chmod 644 api/*.php
```

### 5. Test the API

Visit: `https://yourdomain.com/api/`

You should see a JSON response with available endpoints.

## 🌐 API Endpoints

All endpoints require authentication via:
- **Bearer Token**: `Authorization: Bearer <your-jwt-token>`
- **Whitelisted IP**: Automatic for IPs in whitelist

### Article Categories

```
GET    /articleCategorys       # Get all categories
GET    /articleCategorys/{id}  # Get category by ID
POST   /articleCategorys       # Create new category
PUT    /articleCategorys/{id}  # Update category
DELETE /articleCategorys/{id}  # Delete category
```

### Articles

```
GET    /articles       # Get all articles
GET    /articles/{id}  # Get article by ID
POST   /articles       # Create new article
PUT    /articles/{id}  # Update article
DELETE /articles/{id}  # Delete article
```

### Form Registers

```
GET    /formRegisters       # Get all form submissions
GET    /formRegisters/{id}  # Get form by ID
POST   /formRegisters       # Create new form submission
PUT    /formRegisters/{id}  # Update form submission
DELETE /formRegisters/{id}  # Delete form submission
```

### Galleries

```
GET    /galleries       # Get all gallery images
GET    /galleries/{id}  # Get image by ID
POST   /galleries       # Create new image
PUT    /galleries/{id}  # Update image
DELETE /galleries/{id}  # Delete image
```

### Image Categories

```
GET    /imageCategorys       # Get all image categories
GET    /imageCategorys/{id}  # Get category by ID
POST   /imageCategorys       # Create new category
PUT    /imageCategorys/{id}  # Update category
DELETE /imageCategorys/{id}  # Delete category
```

## 🔐 Authentication

### Using JWT Token

```javascript
fetch('https://yourdomain.com/api/articles', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
})
```

### IP Whitelist

Default whitelisted IPs (configured in `config.php`):
- `103.103.192.24`
- `localhost`
- `127.0.0.1`
- `::1`

Requests from these IPs bypass JWT authentication.

## 📝 Example Requests

### Create Article Category

```bash
curl -X POST https://yourdomain.com/api/articleCategorys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Technology", "description": "Tech articles"}'
```

### Get All Articles

```bash
curl -X GET https://yourdomain.com/api/articles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Article

```bash
curl -X PUT https://yourdomain.com/api/articles/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "content": "New content"}'
```

### Delete Gallery Image

```bash
curl -X DELETE https://yourdomain.com/api/galleries/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛡️ Security Features

1. **Prepared Statements**: All database queries use PDO prepared statements to prevent SQL injection
2. **Input Sanitization**: All user input is sanitized before processing
3. **JWT Verification**: Tokens are verified using HMAC SHA256
4. **CORS Control**: Configurable allowed origins
5. **Error Logging**: Errors are logged without exposing sensitive data
6. **Environment Variables**: Credentials stored in environment, not code

## 🐛 Troubleshooting

### 500 Internal Server Error

- Check PHP error logs
- Verify database credentials in `config.php`
- Ensure all required PHP extensions are enabled
- Check file permissions

### 401 Unauthorized

- Verify JWT token is valid
- Check if `ACCESS_SECRET` matches the one used to generate token
- Ensure `Authorization` header is being sent correctly

### 404 Not Found

- Verify `.htaccess` is working (test with other paths)
- Check if `mod_rewrite` is enabled on your server
- Ensure base path is configured correctly in `index.php`

### Database Connection Failed

- Verify database credentials
- Check if database server is running
- Ensure PDO extension is enabled
- Test database connection separately

## 📊 Database Schema (MySQL)

```sql
-- Article Categories
CREATE TABLE article_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Articles
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT,
    thumbnail VARCHAR(500),
    category_id INT,
    author VARCHAR(255),
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES article_categories(id) ON DELETE SET NULL
);

-- Form Registers
CREATE TABLE form_registers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Galleries
CREATE TABLE galleries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    thumbnail VARCHAR(500),
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES image_categories(id) ON DELETE SET NULL
);

-- Image Categories
CREATE TABLE image_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔄 Migrating from Golang API

This PHP API provides **identical endpoints** to the Golang version. To switch:

1. Update your frontend API base URL to point to PHP API
2. Ensure JWT tokens are compatible (same secret key)
3. Verify database schema matches
4. Test all endpoints thoroughly

Both APIs can run simultaneously on different ports/paths for gradual migration.

## 📞 Support

For issues related to:
- **Shared hosting setup**: Contact your hosting provider
- **Database errors**: Check MySQL logs and credentials
- **API functionality**: Review error logs in `error_log` file

## 📄 License

Same as parent k3-api-horizon project.
