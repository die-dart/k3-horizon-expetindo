<?php
/**
 * Form Register Controller
 * Handles CRUD operations for Form Registrations
 */

class FormRegister {
    private PDO $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * GET /formRegisters - Get all form registrations
     */
    public function findAll(): void {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM form_registers 
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $forms = $stmt->fetchAll();
            
            successResponse($forms);
        } catch (PDOException $e) {
            logError("FindAll FormRegister error: " . $e->getMessage());
            errorResponse('Failed to fetch form registrations', 500);
        }
    }
    
    /**
     * GET /formRegisters/{id} - Get form registration by ID
     */
    public function findById(string $id): void {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM form_registers 
                WHERE id = :id
            ");
            $stmt->execute(['id' => $id]);
            $form = $stmt->fetch();
            
            if (!$form) {
                errorResponse('Form registration not found', 404);
                return;
            }
            
            successResponse($form);
        } catch (PDOException $e) {
            logError("FindById FormRegister error: " . $e->getMessage());
            errorResponse('Failed to fetch form registration', 500);
        }
    }
    
    /**
     * POST /formRegisters - Create new form registration
     */
    public function create(): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Validate required fields
            $missing = validateRequired($data, ['full_name', 'email']);
            if ($missing) {
                errorResponse('Missing required fields', 400, ['missing' => $missing]);
                return;
            }
            
            $fullName = sanitizeString($data['full_name']);
            $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
            
            if (!$email) {
                errorResponse('Invalid email format', 400);
                return;
            }
            
            $phoneNumber = isset($data['phone_number']) ? $data['phone_number'] : null;
            $company = isset($data['company']) ? sanitizeString($data['company']) : null;
            $trainingProgram = isset($data['training_program']) ? sanitizeString($data['training_program']) : null;
            $note = isset($data['note']) ? sanitizeString($data['note']) : null;
            
            $stmt = $this->db->prepare("
                INSERT INTO form_registers 
                (full_name, email, phone_number, company, training_program, note, created_at, updated_at) 
                VALUES (:full_name, :email, :phone_number, :company, :training_program, :note, NOW(), NOW())
            ");
            
            $stmt->execute([
                'full_name' => $fullName,
                'email' => $email,
                'phone_number' => $phoneNumber,
                'company' => $company,
                'training_program' => $trainingProgram,
                'note' => $note
            ]);
            
            $id = $this->db->lastInsertId();
            
            successResponse([
                'id' => $id,
                'full_name' => $fullName,
                'email' => $email
            ], 'Form registration created successfully', 201);
            
        } catch (PDOException $e) {
            logError("Create FormRegister error: " . $e->getMessage());
            errorResponse('Failed to create form registration', 500);
        }
    }
    
    /**
     * PUT /formRegisters/{id} - Update form registration
     */
    public function update(string $id): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Check if form exists
            $stmt = $this->db->prepare("SELECT id FROM form_registers WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Form registration not found', 404);
                return;
            }
            
            // Build update query dynamically
            $fields = [];
            $params = ['id' => $id];
            
            if (isset($data['name'])) {
                $fields[] = "name = :name";
                $params['name'] = sanitizeString($data['name']);
            }
            
            if (isset($data['email'])) {
                $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
                if (!$email) {
                    errorResponse('Invalid email format', 400);
                    return;
                }
                $fields[] = "email = :email";
                $params['email'] = $email;
            }
            
            if (isset($data['phone'])) {
                $fields[] = "phone = :phone";
                $params['phone'] = sanitizeString($data['phone']);
            }
            
            if (isset($data['message'])) {
                $fields[] = "message = :message";
                $params['message'] = sanitizeString($data['message']);
            }
            
            if (isset($data['status'])) {
                $fields[] = "status = :status";
                $params['status'] = sanitizeString($data['status']);
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 400);
                return;
            }
            
            $fields[] = "updated_at = NOW()";
            $sql = "UPDATE form_registers SET " . implode(', ', $fields) . " WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(['id' => $id], 'Form registration updated successfully');
            
        } catch (PDOException $e) {
            logError("Update FormRegister error: " . $e->getMessage());
            errorResponse('Failed to update form registration', 500);
        }
    }
    
    /**
     * DELETE /formRegisters/{id} - Delete form registration
     */
    public function delete(string $id): void {
        try {
            // Check if form exists
            $stmt = $this->db->prepare("SELECT id FROM form_registers WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('Form registration not found', 404);
                return;
            }
            
            // Delete form
            $stmt = $this->db->prepare("DELETE FROM form_registers WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            successResponse(null, 'Form registration deleted successfully');
            
        } catch (PDOException $e) {
            logError("Delete FormRegister error: " . $e->getMessage());
            errorResponse('Failed to delete form registration', 500);
        }
    }
}
