# 🚀 Deployment Guide untuk horizonexpert.id

## Domain & URL Structure

**Domain**: horizonexpert.id  
**API Base URL**: `https://horizonexpert.id/dev/api`

---

## 📋 Step-by-Step Deployment

### 1. Upload Files ke Hosting

Upload seluruh folder `api/` ke:
```
public_html/api/
```

**File Structure di Server:**
```
public_html/
├── api/
│   ├── index.php
│   ├── config.php
│   ├── .env              ← PENTING!
│   ├── .htaccess
│   ├── auth.php
│   ├── helpers.php
│   ├── load_env.php
│   ├── Article.php
│   ├── ArticleCategory.php
│   ├── FormRegister.php
│   ├── Gallery.php
│   ├── ImageCategory.php
│   ├── test_db.php       ← Hapus setelah testing
│   ├── verify_env.php    ← Hapus setelah testing
│   └── README.md
```

### 2. Update CORS untuk Production

Edit file `.env` di server, ubah:
```env
# Development (allow all)
CORS_ALLOWED_ORIGINS=*

# Production (specific domain)
CORS_ALLOWED_ORIGINS=https://horizonexpert.id,https://www.horizonexpert.id
```

Jika frontend di subdomain:
```env
CORS_ALLOWED_ORIGINS=https://horizonexpert.id,https://www.horizonexpert.id,https://app.horizonexpert.id
```

### 3. Set File Permissions (via SSH/FTP)

```bash
chmod 755 api/
chmod 644 api/*.php
chmod 600 api/.env     # Protect credentials
chmod 644 api/.htaccess
```

### 4. Verify Environment Variables

**URL Test**: `https://horizonexpert.id/dev/api/verify_env.php`

Expected output:
```
✓ All environment variables loaded correctly from .env!
✓ Configuration looks good!
```

### 5. Test Database Connection

**URL Test**: `https://horizonexpert.id/dev/api/test_db.php`

Expected output:
```
✓ Database connection successful!
✓ Connected to database: u635932297_db_web_he
✓ MySQL version: 8.0.x
```

### 6. Test API Endpoints

**URL Test**: `https://horizonexpert.id/dev/api/`

Expected output (JSON):
```json
{
  "success": true,
  "message": "k3-api-horizon PHP API",
  "version": "1.0.0",
  "endpoints": {
    "Article Categories": [...],
    "Articles": [...],
    ...
  }
}
```

### 7. ⚠️ Security - Delete Test Files

Setelah semua test berhasil, **HAPUS** file-file ini:
```bash
rm api/test_db.php
rm api/verify_env.php
```

---

## 🌐 API Endpoints untuk Frontend

Base URL: `https://horizonexpert.id/dev/api`

### Article Categories
```
GET    https://horizonexpert.id/dev/api/articleCategorys
GET    https://horizonexpert.id/dev/api/articleCategorys/{id}
POST   https://horizonexpert.id/dev/api/articleCategorys
PUT    https://horizonexpert.id/dev/api/articleCategorys/{id}
DELETE https://horizonexpert.id/dev/api/articleCategorys/{id}
```

### Articles
```
GET    https://horizonexpert.id/dev/api/articles
GET    https://horizonexpert.id/dev/api/articles/{id}
POST   https://horizonexpert.id/dev/api/articles
PUT    https://horizonexpert.id/dev/api/articles/{id}
DELETE https://horizonexpert.id/dev/api/articles/{id}
```

### Form Registers
```
GET    https://horizonexpert.id/dev/api/formRegisters
GET    https://horizonexpert.id/dev/api/formRegisters/{id}
POST   https://horizonexpert.id/dev/api/formRegisters
PUT    https://horizonexpert.id/dev/api/formRegisters/{id}
DELETE https://horizonexpert.id/dev/api/formRegisters/{id}
```

### Galleries
```
GET    https://horizonexpert.id/dev/api/galleries
GET    https://horizonexpert.id/dev/api/galleries/{id}
POST   https://horizonexpert.id/dev/api/galleries
PUT    https://horizonexpert.id/dev/api/galleries/{id}
DELETE https://horizonexpert.id/dev/api/galleries/{id}
```

### Image Categories
```
GET    https://horizonexpert.id/dev/api/imageCategorys
GET    https://horizonexpert.id/dev/api/imageCategorys/{id}
POST   https://horizonexpert.id/dev/api/imageCategorys
PUT    https://horizonexpert.id/dev/api/imageCategorys/{id}
DELETE https://horizonexpert.id/dev/api/imageCategorys/{id}
```

---

## 💻 Frontend Integration Example

### JavaScript/HTML

```javascript
// API Configuration
const API_BASE_URL = 'https://horizonexpert.id/dev/api';
const JWT_TOKEN = 'your-jwt-token-here'; // Dari login

// Fetch Articles
async function getArticles() {
    try {
        const response = await fetch(`${API_BASE_URL}/articles`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Articles:', data.data);
            return data.data;
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Create Article
async function createArticle(articleData) {
    try {
        const response = await fetch(`${API_BASE_URL}/articles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(articleData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating article:', error);
    }
}

// Update Article
async function updateArticle(id, articleData) {
    try {
        const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(articleData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating article:', error);
    }
}

// Delete Article
async function deleteArticle(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${JWT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting article:', error);
    }
}

// Example usage
getArticles().then(articles => {
    console.log('Loaded articles:', articles);
});
```

---

## 🔐 Authentication

### Header Format
```
Authorization: Bearer <your-jwt-token>
```

### Generate JWT Token (for testing)

Gunakan token yang sama dari Golang API Anda, atau buat baru dengan:
```php
// In PHP
$token = createJWT('user_id_here', 'admin');
```

Secret key harus sama:
```
ACCESS_SECRET=c5623e7a-ca88-4526-afbd-909c0cbe7b46
```

---

## 🔧 Troubleshooting

### Testing dengan cURL

```bash
# Test root endpoint
curl https://horizonexpert.id/dev/api/

# Test with Bearer token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://horizonexpert.id/dev/api/articles

# Test POST
curl -X POST https://horizonexpert.id/dev/api/articles \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Article","content":"Test content"}'
```

### Common Issues

**1. 500 Internal Server Error**
- Check `error_log` file in `api/` folder
- Verify database credentials in `.env`
- Check file permissions

**2. 401 Unauthorized**
- Verify JWT token is valid
- Check if `ACCESS_SECRET` matches
- Ensure `Authorization` header format: `Bearer <token>`

**3. CORS Error**
- Update `CORS_ALLOWED_ORIGINS` in `.env`
- Make sure your frontend domain is listed

**4. 404 Not Found**
- Verify `.htaccess` is uploaded
- Check if mod_rewrite is enabled
- Confirm file path: `public_html/api/index.php`

---

## ✅ Production Checklist

- [ ] Upload all files to `public_html/api/`
- [ ] Upload `.env` with correct credentials
- [ ] Set file permissions (chmod 600 .env)
- [ ] Update CORS to production domain
- [ ] Test `verify_env.php`
- [ ] Test `test_db.php`
- [ ] Test API root endpoint
- [ ] Delete `test_db.php` and `verify_env.php`
- [ ] Change `APP_ENV=production` in `.env`
- [ ] Test all CRUD operations
- [ ] Update frontend to use new API URL
- [ ] Monitor `error_log` for issues

---

## 📊 Expected Performance

- **Shared Hosting**: 100-500ms response time
- **Database Queries**: Optimized with prepared statements
- **CORS**: Configured for horizonexpert.id
- **Authentication**: JWT with IP whitelist fallback

---

## 🎉 Ready for Production!

Your API will be accessible at:
**`https://horizonexpert.id/dev/api`**

Frontend dapat langsung memanggil API ini dengan `fetch()` atau AJAX!
