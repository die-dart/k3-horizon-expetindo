<?php
/**
 * Image Category Controller
 * Handles CRUD operations for Image Categories
 */

class ImageCategory {
    private PDO $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * GET /imageCategorys - Get all image categories
     */
    public function findAll(): void {
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, description, created_at, updated_at 
                FROM image_categories 
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $categories = $stmt->fetchAll();
            
            successResponse($categories);
        } catch (PDOException $e) {
            logError("FindAll ImageCategory error: " . $e->getMessage());
            errorResponse('Failed to fetch image categories', 500);
        }
    }
    
    /**
     * GET /imageCategorys/{id} - Get image category by ID
     */
    public function findById(string $id): void {
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, description, created_at, updated_at 
                FROM image_categories 
                WHERE id = :id
            ");
            $stmt->execute(['id' => $id]);
            $category = $stmt->fetch();
            
            if (!$category) {
                errorResponse('Image category not found', 404);
                return;
            }
            
            successResponse($category);
        } catch (PDOException $e) {
            logError("FindById ImageCategory error: " . $e->getMessage());
            errorResponse('Failed to fetch image category', 500);
        }
    }
    
    /**
     * POST /imageCategorys - Create new image category
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
                INSERT INTO image_categories (name, description, created_at, updated_at) 
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
            ], 'Image category created successfully', 201);
            
        } catch (PDOException $e) {
            logError("Create ImageCategory error: " . $e->getMessage());
            errorResponse('Failed to create image category', 500);
        }
    }
    
    /**
     * PUT /imageCategorys/{id} - Update image category
     */
    public function update(string $id): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Check if category exists
            $stmt = $this->db->prepare("SELECT id FROM image_categories WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Image category not found', 404);
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
            $sql = "UPDATE image_categories SET " . implode(', ', $fields) . " WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(['id' => $id], 'Image category updated successfully');
            
        } catch (PDOException $e) {
            logError("Update ImageCategory error: " . $e->getMessage());
            errorResponse('Failed to update image category', 500);
        }
    }
    
    /**
     * DELETE /imageCategorys/{id} - Delete image category
     */
    public function delete(string $id): void {
        try {
            // Check if category exists
            $stmt = $this->db->prepare("SELECT id FROM image_categories WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Image category not found', 404);
                return;
            }
            
            // Delete category
            $stmt = $this->db->prepare("DELETE FROM image_categories WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            successResponse(null, 'Image category deleted successfully');
            
        } catch (PDOException $e) {
            logError("Delete ImageCategory error: " . $e->getMessage());
            errorResponse('Failed to delete image category', 500);
        }
    }
}
