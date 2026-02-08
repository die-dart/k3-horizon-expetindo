<?php
/**
 * BNSP Proposal Controller
 * Handles CRUD operations for BNSP Proposals
 */

class BnspProposal {
    private PDO $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * GET /bnspProposals - Get all BNSP proposals
     */
    public function findAll(): void {
        try {
            $stmt = $this->db->prepare("
                SELECT id, title, image_title, proposal_category, training_description, legal_basis,
                       `condition`, facility, unit_code, unit_title, 
                       timetable1, timetable2, location1, location2, image_online, image_offline,
                       created_at, updated_at 
                FROM bnsp_proposals 
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $proposals = $stmt->fetchAll();
            
            successResponse($proposals);
        } catch (PDOException $e) {
            logError("FindAll BnspProposal error: " . $e->getMessage());
            errorResponse('Failed to fetch BNSP proposals', 500);
        }
    }
    
    /**
     * GET /bnspProposals/{id} - Get BNSP proposal by ID
     */
    public function findById(string $id): void {
        try {
            $stmt = $this->db->prepare("
                SELECT id, title, image_title, proposal_category, training_description, legal_basis,
                       `condition`, facility, unit_code, unit_title, 
                       timetable1, timetable2, location1, location2, image_online, image_offline,
                       created_at, updated_at 
                FROM bnsp_proposals 
                WHERE id = :id AND deleted_at IS NULL
            ");
            $stmt->execute(['id' => $id]);
            $proposal = $stmt->fetch();
            
            if (!$proposal) {
                errorResponse('BNSP proposal not found', 404);
                return;
            }
            
            successResponse($proposal);
        } catch (PDOException $e) {
            logError("FindById BnspProposal error: " . $e->getMessage());
            errorResponse('Failed to fetch BNSP proposal', 500);
        }
    }
    
    /**
     * POST /bnspProposals - Create new BNSP proposal
     */
    public function create(): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Validate required fields
            $missing = validateRequired($data, ['title']);
            if ($missing) {
                errorResponse('Missing required fields', 400, ['missing' => $missing]);
                return;
            }
            
            $title = sanitizeString($data['title']);
            $imageTitle = isset($data['image_title']) ? sanitizeString($data['image_title']) : null;
            $proposalCategory = isset($data['proposal_category']) ? sanitizeString($data['proposal_category']) : null;
            $trainingDescription = $data['training_description'] ?? null;
            $legalBasis = $data['legal_basis'] ?? null;
            $condition = $data['condition'] ?? null;
            $facility = $data['facility'] ?? null;
            $unitCode = $data['unit_code'] ?? null;
            $unitTitle = $data['unit_title'] ?? null;
            $timetable1 = isset($data['timetable_1']) ? sanitizeString($data['timetable_1']) : null;
            $timetable2 = isset($data['timetable_2']) ? sanitizeString($data['timetable_2']) : null;
            $timetable1 = isset($data['timetable1']) ? sanitizeString($data['timetable1']) : null;
            $timetable2 = isset($data['timetable2']) ? sanitizeString($data['timetable2']) : null;
            $location1 = $data['location1'] ?? null;
            $location2 = $data['location2'] ?? null;
            $imageOnline = isset($data['image_online']) ? sanitizeString($data['image_online']) : null;
            $imageOffline = isset($data['image_offline']) ? sanitizeString($data['image_offline']) : null;
            
            $stmt = $this->db->prepare("
                INSERT INTO bnsp_proposals 
                (title, image_title, proposal_category, training_description, legal_basis, `condition`, facility,
                 unit_code, unit_title, timetable1, timetable2, location1, location2, image_online, image_offline,
                 created_at, updated_at) 
                VALUES (:title, :image_title, :proposal_category, :training_description, :legal_basis, :condition, :facility,
                        :unit_code, :unit_title, :timetable1, :timetable2, :location1, :location2, :image_online, :image_offline,
                        NOW(), NOW())
            ");
            
            $stmt->execute([
                'title' => $title,
                'image_title' => $imageTitle,
                'proposal_category' => $proposalCategory,
                'training_description' => $trainingDescription,
                'legal_basis' => $legalBasis,
                'condition' => $condition,
                'facility' => $facility,
                'unit_code' => $unitCode,
                'unit_title' => $unitTitle,
                'timetable_1' => $timetable1,
                'timetable_2' => $timetable2,
                'location_1' => $location1,
                'location_2' => $location2,
                'image_online' => $imageOnline,
                'image_offline' => $imageOffline
            ]);
            
            $id = $this->db->lastInsertId();
            
            successResponse([
                'id' => $id,
                'title' => $title,
                'proposal_category' => $proposalCategory
            ], 'BNSP proposal created successfully', 201);
            
        } catch (PDOException $e) {
            logError("Create BnspProposal error: " . $e->getMessage());
            errorResponse('Failed to create BNSP proposal', 500);
        }
    }
    
    /**
     * PUT /bnspProposals/{id} - Update BNSP proposal
     */
    public function update(string $id): void {
        try {
            $data = getJsonBody();
            
            if (!$data) {
                errorResponse('Invalid JSON body', 400);
                return;
            }
            
            // Check if proposal exists
            $stmt = $this->db->prepare("SELECT id FROM bnsp_proposals WHERE id = :id AND deleted_at IS NULL");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('BNSP proposal not found', 404);
                return;
            }
            
            // Build update query dynamically
            $fields = [];
            $params = ['id' => $id];
            
            $fieldMap = [
                'title' => 'title',
                'image_title' => 'image_title',
                'proposal_category' => 'proposal_category',
                'training_description' => 'training_description',
                'legal_basis' => 'legal_basis',
                'condition' => '`condition`',
                'facility' => 'facility',
                'unit_code' => 'unit_code',
                'unit_title' => 'unit_title',
                'timetable_1' => 'timetable_1',
                'timetable_2' => 'timetable_2',
                'location_1' => 'location_1',
                'location_2' => 'location_2',
                'image_online' => 'image_online',
                'image_offline' => 'image_offline'
            ];
            
            foreach ($fieldMap as $dataKey => $dbColumn) {
                if (isset($data[$dataKey])) {
                    $paramKey = str_replace('`', '', $dbColumn);
                    $fields[] = "$dbColumn = :$paramKey";
                    $params[$paramKey] = $data[$dataKey];
                }
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 400);
                return;
            }
            
            $fields[] = "updated_at = NOW()";
            $sql = "UPDATE bnsp_proposals SET " . implode(', ', $fields) . " WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(['id' => $id], 'BNSP proposal updated successfully');
            
        } catch (PDOException $e) {
            logError("Update BnspProposal error: " . $e->getMessage());
            errorResponse('Failed to update BNSP proposal', 500);
        }
    }
    
    /**
     * DELETE /bnspProposals/{id} - Delete BNSP proposal (soft delete)
     */
    public function delete(string $id): void {
        try {
            // Check if proposal exists
            $stmt = $this->db->prepare("SELECT id FROM bnsp_proposals WHERE id = :id AND deleted_at IS NULL");
            $stmt->execute(['id' => $id]);
            
            if (!$stmt->fetch()) {
                errorResponse('BNSP proposal not found', 404);
                return;
            }
            
            // Soft delete proposal
            $stmt = $this->db->prepare("UPDATE bnsp_proposals SET deleted_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            successResponse(null, 'BNSP proposal deleted successfully');
            
        } catch (PDOException $e) {
            logError("Delete BnspProposal error: " . $e->getMessage());
            errorResponse('Failed to delete BNSP proposal', 500);
        }
    }
}
