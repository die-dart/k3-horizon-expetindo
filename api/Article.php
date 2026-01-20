<?php
/**
 * Article Controller
 * Handles CRUD operations for Articles
 */

class Article {
    private PDO $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * GET /articles - Get all articles
     */
    public function findAll(): void {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM articles 
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $articles = $stmt->fetchAll();
            
            successResponse($articles);
        } catch (PDOException $e) {
            logError("FindAll Article error: " . $e->getMessage());
            errorResponse('Failed to fetch articles', 500);
        }
    }
    
    /**
     * GET /articles/{id} - Get article by ID
     */
    public function findById(string $id): void {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM articles 
                WHERE id = :id
            ");
            $stmt->execute(['id' => $id]);
            $article = $stmt->fetch();
            
            if (!$article) {
                errorResponse('Article not found', 404);
                return;
            }
            
            successResponse($article);
        } catch (PDOException $e) {
            logError("FindById Article error: " . $e->getMessage());
            errorResponse('Failed to fetch article', 500);
        }
    }
    
    /**
     * POST /articles - Create new article
     */
    public function create(): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Validate required fields
            $missing = validateRequired($data, ['title', 'content']);
            if ($missing) {
                errorResponse('Missing required fields', 400, ['missing' => $missing]);
                return;
            }
            
            $title = sanitizeString($data['title']);
            $slug = isset($data['slug']) ? sanitizeString($data['slug']) : $this->generateSlug($title);
            $content = $data['content']; // Keep HTML content as-is
            $thumbnail = $data['thumbnail'] ?? null;
            $categoryId = $data['category_id'] ?? null;
            $author = isset($data['author']) ? sanitizeString($data['author']) : null;
            $publishedAt = $data['published_at'] ?? null;
            
            $stmt = $this->db->prepare("
                INSERT INTO articles 
                (title, slug, content, thumbnail, category_id, author, published_at, created_at, updated_at) 
                VALUES (:title, :slug, :content, :thumbnail, :category_id, :author, :published_at, NOW(), NOW())
            ");
            
            $stmt->execute([
                'title' => $title,
                'slug' => $slug,
                'content' => $content,
                'thumbnail' => $thumbnail,
                'category_id' => $categoryId,
                'author' => $author,
                'published_at' => $publishedAt
            ]);
            
            $id = $this->db->lastInsertId();
            
            successResponse([
                'id' => $id,
                'title' => $title,
                'slug' => $slug
            ], 'Article created successfully', 201);
            
        } catch (PDOException $e) {
            logError("Create Article error: " . $e->getMessage());
            errorResponse('Failed to create article', 500);
        }
    }
    
    /**
     * PUT /articles/{id} - Update article
     */
    public function update(string $id): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Check if article exists
            $stmt = $this->db->prepare("SELECT id FROM articles WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Article not found', 404);
                return;
            }
            
            // Build update query dynamically
            $fields = [];
            $params = ['id' => $id];
            
            if (isset($data['title'])) {
                $fields[] = "title = :title";
                $params['title'] = sanitizeString($data['title']);
            }
            
            if (isset($data['slug'])) {
                $fields[] = "slug = :slug";
                $params['slug'] = sanitizeString($data['slug']);
            }
            
            if (isset($data['content'])) {
                $fields[] = "content = :content";
                $params['content'] = $data['content'];
            }
            
            if (isset($data['thumbnail'])) {
                $fields[] = "thumbnail = :thumbnail";
                $params['thumbnail'] = $data['thumbnail'];
            }
            
            if (isset($data['category_id'])) {
                $fields[] = "category_id = :category_id";
                $params['category_id'] = $data['category_id'];
            }
            
            if (isset($data['author'])) {
                $fields[] = "author = :author";
                $params['author'] = sanitizeString($data['author']);
            }
            
            if (isset($data['published_at'])) {
                $fields[] = "published_at = :published_at";
                $params['published_at'] = $data['published_at'];
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 400);
                return;
            }
            
            $fields[] = "updated_at = NOW()";
            $sql = "UPDATE articles SET " . implode(', ', $fields) . " WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(['id' => $id], 'Article updated successfully');
            
        } catch (PDOException $e) {
            logError("Update Article error: " . $e->getMessage());
            errorResponse('Failed to update article', 500);
        }
    }
    
    /**
     * DELETE /articles/{id} - Delete article
     */
    public function delete(string $id): void {
        try {
            // Check if article exists
            $stmt = $this->db->prepare("SELECT id FROM articles WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Article not found', 404);
                return;
            }
            
            // Delete article
            $stmt = $this->db->prepare("DELETE FROM articles WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            successResponse(null, 'Article deleted successfully');
            
        } catch (PDOException $e) {
            logError("Delete Article error: " . $e->getMessage());
            errorResponse('Failed to delete article', 500);
        }
    }
    
    /**
     * Generate slug from title
     */
    private function generateSlug(string $title): string {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }
}
