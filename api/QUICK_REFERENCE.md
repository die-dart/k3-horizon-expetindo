# 📌 Quick Reference - horizonexpert.id PHP API

## 🌐 Your API URLs

**Production API**: `https://horizonexpert.id/dev/api`

### Test Pages (after upload):
- **API Info**: https://horizonexpert.id/dev/api/
- **Environment Check**: https://horizonexpert.id/dev/api/verify_env.php
- **Database Test**: https://horizonexpert.id/dev/api/test_db.php
- **API Test Tool**: https://horizonexpert.id/dev/api/api_test_tool.html

---

## 🔑 Database Credentials (Already Configured)

```env
DB_HOST=srv939.hstgr.io
DB_NAME=u635932297_db_web_he
DB_USER=u635932297_horizon
DB_PASS=HEDBhoriZ0n
```

---

## 🎯 All API Endpoints

| Resource | Endpoint |
|----------|----------|
| **Article Categories** | |
| List all | `GET /articleCategorys` |
| Get one | `GET /articleCategorys/{id}` |
| Create | `POST /articleCategorys` |
| Update | `PUT /articleCategorys/{id}` |
| Delete | `DELETE /articleCategorys/{id}` |
| **Articles** | |
| List all | `GET /articles` |
| Get one | `GET /articles/{id}` |
| Create | `POST /articles` |
| Update | `PUT /articles/{id}` |
| Delete | `DELETE /articles/{id}` |
| **Form Registers** | |
| List all | `GET /formRegisters` |
| Get one | `GET /formRegisters/{id}` |
| Create | `POST /formRegisters` |
| Update | `PUT /formRegisters/{id}` |
| Delete | `DELETE /formRegisters/{id}` |
| **Galleries** | |
| List all | `GET /galleries` |
| Get one | `GET /galleries/{id}` |
| Create | `POST /galleries` |
| Update | `PUT /galleries/{id}` |
| Delete | `DELETE /galleries/{id}` |
| **Image Categories** | |
| List all | `GET /imageCategorys` |
| Get one | `GET /imageCategorys/{id}` |
| Create | `POST /imageCategorys` |
| Update | `PUT /imageCategorys/{id}` |
| Delete | `DELETE /imageCategorys/{id}` |

---

## 💻 Frontend Code (Copy-Paste Ready)

```javascript
// API Configuration
const API = {
    baseURL: 'https://horizonexpert.id/dev/api',
    token: 'your-jwt-token' // Set ini dari hasil login
};

// Helper function
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API.token}`
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API.baseURL}/${endpoint}`, options);
    return await response.json();
}

// Examples
const articles = await apiCall('articles');
const article = await apiCall('articles/1');
const newArticle = await apiCall('articles', 'POST', {
    title: 'New Article',
    content: 'Content here'
});
```

---

## 📦 Upload Checklist

```
✓ Upload folder ke: public_html/api/
✓ Pastikan .env ter-upload
✓ Set permissions: chmod 600 .env
✓ Test verify_env.php
✓ Test test_db.php
✓ Test api_test_tool.html
✓ Hapus file test setelah berhasil
```

---

## 🔒 Security Settings

**CORS** (in .env):
```
CORS_ALLOWED_ORIGINS=https://horizonexpert.id,https://www.horizonexpert.id
```

**JWT Secret**:
```
ACCESS_SECRET=c5623e7a-ca88-4526-afbd-909c0cbe7b46
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 Error | Check error_log file |
| 401 Unauthorized | Check JWT token |
| CORS Error | Update CORS_ALLOWED_ORIGINS |
| Database Error | Verify credentials in .env |
| 404 Not Found | Check .htaccess uploaded |

---

## 📞 Support Files

- [DEPLOYMENT_horizonexpert.id.md](DEPLOYMENT_horizonexpert.id.md) - Full deployment guide
- [README.md](README.md) - Complete API documentation
- [DATABASE_CONFIG.md](DATABASE_CONFIG.md) - Database setup

---

**Created**: 2026-01-20  
**Domain**: horizonexpert.id  
**Status**: ✅ Ready for Production
