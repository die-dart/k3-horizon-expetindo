<?php
/**
 * Gallery Controller
 * Handles CRUD operations for Gallery Images
 */

class Gallery {
    private PDO $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * GET /galleries - Get all gallery images
     */
    public function findAll(): void {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM galleries 
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $galleries = $stmt->fetchAll();
            
            successResponse($galleries);
        } catch (PDOException $e) {
            logError("FindAll Gallery error: " . $e->getMessage());
            errorResponse('Failed to fetch galleries', 500);
        }
    }
    
    /**
     * GET /galleries/{id} - Get gallery image by ID
     */
    public function findById(string $id): void {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM galleries 
                WHERE id = :id
            ");
            $stmt->execute(['id' => $id]);
            $gallery = $stmt->fetch();
            
            if (!$gallery) {
                errorResponse('Gallery image not found', 404);
                return;
            }
            
            successResponse($gallery);
        } catch (PDOException $e) {
            logError("FindById Gallery error: " . $e->getMessage());
            errorResponse('Failed to fetch gallery image', 500);
        }
    }
    
    /**
     * POST /galleries - Create new gallery image
     */
    public function create(): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Validate required fields
            $missing = validateRequired($data, ['title', 'image_url']);
            if ($missing) {
                errorResponse('Missing required fields', 400, ['missing' => $missing]);
                return;
            }
            
            $title = sanitizeString($data['title']);
            $description = isset($data['description']) ? sanitizeString($data['description']) : null;
            $imageUrl = $data['image_url'];
            $thumbnail = $data['thumbnail'] ?? null;
            $categoryId = $data['category_id'] ?? null;
            
            $stmt = $this->db->prepare("
                INSERT INTO galleries 
                (title, description, image_url, thumbnail, category_id, created_at, updated_at) 
                VALUES (:title, :description, :image_url, :thumbnail, :category_id, NOW(), NOW())
            ");
            
            $stmt->execute([
                'title' => $title,
                'description' => $description,
                'image_url' => $imageUrl,
                'thumbnail' => $thumbnail,
                'category_id' => $categoryId
            ]);
            
            $id = $this->db->lastInsertId();
            
            successResponse([
                'id' => $id,
                'title' => $title,
                'image_url' => $imageUrl
            ], 'Gallery image created successfully', 201);
            
        } catch (PDOException $e) {
            logError("Create Gallery error: " . $e->getMessage());
            errorResponse('Failed to create gallery image', 500);
        }
    }
    
    /**
     * PUT /galleries/{id} - Update gallery image
     */
    public function update(string $id): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Check if gallery exists
            $stmt = $this->db->prepare("SELECT id FROM galleries WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Gallery image not found', 404);
                return;
            }
            
            // Build update query dynamically
            $fields = [];
            $params = ['id' => $id];
            
            if (isset($data['title'])) {
                $fields[] = "title = :title";
                $params['title'] = sanitizeString($data['title']);
            }
            
            if (isset($data['description'])) {
                $fields[] = "description = :description";
                $params['description'] = sanitizeString($data['description']);
            }
            
            if (isset($data['image_url'])) {
                $fields[] = "image_url = :image_url";
                $params['image_url'] = $data['image_url'];
            }
            
            if (isset($data['thumbnail'])) {
                $fields[] = "thumbnail = :thumbnail";
                $params['thumbnail'] = $data['thumbnail'];
            }
            
            if (isset($data['category_id'])) {
                $fields[] = "category_id = :category_id";
                $params['category_id'] = $data['category_id'];
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 400);
                return;
            }
            
            $fields[] = "updated_at = NOW()";
            $sql = "UPDATE galleries SET " . implode(', ', $fields) . " WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(['id' => $id], 'Gallery image updated successfully');
            
        } catch (PDOException $e) {
            logError("Update Gallery error: " . $e->getMessage());
            errorResponse('Failed to update gallery image', 500);
        }
    }
    
    /**
     * DELETE /galleries/{id} - Delete gallery image
     */
    public function delete(string $id): void {
        try {
            // Check if gallery exists
            $stmt = $this->db->prepare("SELECT id FROM galleries WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Gallery image not found', 404);
                return;
            }
            
            // Delete gallery
            $stmt = $this->db->prepare("DELETE FROM galleries WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            successResponse(null, 'Gallery image deleted successfully');
            
        } catch (PDOException $e) {
            logError("Delete Gallery error: " . $e->getMessage());
            errorResponse('Failed to delete gallery image', 500);
        }
    }
}
