<?php
/**
 * Proposal Category Controller
 * Handles CRUD operations for Proposal Categories
 * Primary key is 'name' column
 */

class ProposalCategory {
    private PDO $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * GET /proposalCategorys - Get all proposal categories
     */
    public function findAll(): void {
        try {
            $stmt = $this->db->prepare("
                SELECT name, created_at, updated_at 
                FROM proposal_categories 
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $categories = $stmt->fetchAll();
            
            successResponse($categories);
        } catch (PDOException $e) {
            logError("FindAll ProposalCategory error: " . $e->getMessage());
            errorResponse('Failed to fetch proposal categories', 500);
        }
    }
    
    /**
     * GET /proposalCategorys/{name} - Get proposal category by name
     */
    public function findByName(string $name): void {
        try {
            $stmt = $this->db->prepare("
                SELECT name, created_at, updated_at 
                FROM proposal_categories 
                WHERE name = :name AND deleted_at IS NULL
            ");
            $stmt->execute(['name' => $name]);
            $category = $stmt->fetch();
            
            if (!$category) {
                errorResponse('Proposal category not found', 404);
                return;
            }
            
            successResponse($category);
        } catch (PDOException $e) {
            logError("FindByName ProposalCategory error: " . $e->getMessage());
            errorResponse('Failed to fetch proposal category', 500);
        }
    }
    
    /**
     * POST /proposalCategorys - Create new proposal category
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
            
            // Check if name already exists
            $stmt = $this->db->prepare("SELECT name FROM proposal_categories WHERE name = :name AND deleted_at IS NULL");
            $stmt->execute(['name' => $name]);
            if ($stmt->fetch()) {
                errorResponse('Proposal category with this name already exists', 409);
                return;
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO proposal_categories (name, created_at, updated_at) 
                VALUES (:name, NOW(), NOW())
            ");
            
            $stmt->execute(['name' => $name]);
            
            successResponse([
                'name' => $name
            ], 'Proposal category created successfully', 201);
            
        } catch (PDOException $e) {
            logError("Create ProposalCategory error: " . $e->getMessage());
            errorResponse('Failed to create proposal category', 500);
        }
    }
    
    /**
     * PUT /proposalCategorys/{name} - Update proposal category
     */
    public function update(string $name): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Check if category exists
            $stmt = $this->db->prepare("SELECT name FROM proposal_categories WHERE name = :name AND deleted_at IS NULL");
            $stmt->execute(['name' => $name]);
            
            if (!$stmt->fetch()) {
                errorResponse('Proposal category not found', 404);
                return;
            }
            
            // Build update query dynamically
            $fields = [];
            $params = ['old_name' => $name];
            
            if (isset($data['name'])) {
                $fields[] = "name = :new_name";
                $params['new_name'] = sanitizeString($data['name']);
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 400);
                return;
            }
            
            $fields[] = "updated_at = NOW()";
            $sql = "UPDATE proposal_categories SET " . implode(', ', $fields) . " WHERE name = :old_name";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(['name' => $params['new_name'] ?? $name], 'Proposal category updated successfully');
            
        } catch (PDOException $e) {
            logError("Update ProposalCategory error: " . $e->getMessage());
            errorResponse('Failed to update proposal category', 500);
        }
    }
    
    /**
     * DELETE /proposalCategorys/{name} - Delete proposal category (soft delete)
     */
    public function delete(string $name): void {
        try {
            // Check if category exists
            $stmt = $this->db->prepare("SELECT name FROM proposal_categories WHERE name = :name AND deleted_at IS NULL");
            $stmt->execute(['name' => $name]);
            
            if (!$stmt->fetch()) {
                errorResponse('Proposal category not found', 404);
                return;
            }
            
            // Soft delete category
            $stmt = $this->db->prepare("UPDATE proposal_categories SET deleted_at = NOW() WHERE name = :name");
            $stmt->execute(['name' => $name]);
            
            successResponse(null, 'Proposal category deleted successfully');
            
        } catch (PDOException $e) {
            logError("Delete ProposalCategory error: " . $e->getMessage());
            errorResponse('Failed to delete proposal category', 500);
        }
    }
}
