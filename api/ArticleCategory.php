<?php
/**
 * Article Category Controller
 * Handles CRUD operations for Article Categories
 */

class ArticleCategory {
    private PDO $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * GET /articleCategorys - Get all article categories
     */
    public function findAll(): void {
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, description, created_at, updated_at 
                FROM article_categories 
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $categories = $stmt->fetchAll();
            
            successResponse($categories);
        } catch (PDOException $e) {
            logError("FindAll ArticleCategory error: " . $e->getMessage());
            errorResponse('Failed to fetch article categories', 500);
        }
    }
    
    /**
     * GET /articleCategorys/{id} - Get article category by ID
     */
    public function findById(string $id): void {
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, description, created_at, updated_at 
                FROM article_categories 
                WHERE id = :id
            ");
            $stmt->execute(['id' => $id]);
            $category = $stmt->fetch();
            
            if (!$category) {
                errorResponse('Article category not found', 404);
                return;
            }
            
            successResponse($category);
        } catch (PDOException $e) {
            logError("FindById ArticleCategory error: " . $e->getMessage());
            errorResponse('Failed to fetch article category', 500);
        }
    }
    
    /**
     * POST /articleCategorys - Create new article category
     */
    public function create(): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Validate required fields
            $missing = validateRequired($data, ['name']);
            if ($missing) {
                errorResponse('Missing required fields', 400, ['missing' => $missing]);
                return;
            }
            
            $name = sanitizeString($data['name']);
            $description = isset($data['description']) ? sanitizeString($data['description']) : null;
            
            $stmt = $this->db->prepare("
                INSERT INTO article_categories (name, description, created_at, updated_at) 
                VALUES (:name, :description, NOW(), NOW())
            ");
            
            $stmt->execute([
                'name' => $name,
                'description' => $description
            ]);
            
            $id = $this->db->lastInsertId();
            
            successResponse([
                'id' => $id,
                'name' => $name,
                'description' => $description
            ], 'Article category created successfully', 201);
            
        } catch (PDOException $e) {
            logError("Create ArticleCategory error: " . $e->getMessage());
            errorResponse('Failed to create article category', 500);
        }
    }
    
    /**
     * PUT /articleCategorys/{id} - Update article category
     */
    public function update(string $id): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Check if category exists
            $stmt = $this->db->prepare("SELECT id FROM article_categories WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Article category not found', 404);
                return;
            }
            
            // Build update query dynamically
            $fields = [];
            $params = ['id' => $id];
            
            if (isset($data['name'])) {
                $fields[] = "name = :name";
                $params['name'] = sanitizeString($data['name']);
            }
            
            if (isset($data['description'])) {
                $fields[] = "description = :description";
                $params['description'] = sanitizeString($data['description']);
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 400);
                return;
            }
            
            $fields[] = "updated_at = NOW()";
            $sql = "UPDATE article_categories SET " . implode(', ', $fields) . " WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(['id' => $id], 'Article category updated successfully');
            
        } catch (PDOException $e) {
            logError("Update ArticleCategory error: " . $e->getMessage());
            errorResponse('Failed to update article category', 500);
        }
    }
    
    /**
     * DELETE /articleCategorys/{id} - Delete article category
     */
    public function delete(string $id): void {
        try {
            // Check if category exists
            $stmt = $this->db->prepare("SELECT id FROM article_categories WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Article category not found', 404);
                return;
            }
            
            // Delete category
            $stmt = $this->db->prepare("DELETE FROM article_categories WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            successResponse(null, 'Article category deleted successfully');
            
        } catch (PDOException $e) {
            logError("Delete ArticleCategory error: " . $e->getMessage());
            errorResponse('Failed to delete article category', 500);
        }
    }
}
