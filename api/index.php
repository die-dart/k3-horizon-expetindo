<?php
/**
 * Main Router - PHP API for k3-api-horizon
 * 
 * This file handles all routing for the API endpoints
 * matching the Golang implementation.
 * 
 * All endpoints require authentication via Bearer token or IP whitelist
 */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 in production

// Load required files (config.php loads .env first)
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/ArticleCategory.php';
require_once __DIR__ . '/Article.php';
require_once __DIR__ . '/FormRegister.php';
require_once __DIR__ . '/Gallery.php';
require_once __DIR__ . '/ImageCategory.php';
require_once __DIR__ . '/ProposalCategory.php';
require_once __DIR__ . '/BnspProposal.php';
require_once __DIR__ . '/KemnakerProposal.php';

// Enable CORS
enableCORS();

// Get request details
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

// Remove query string from URI
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove base path if API is not in root
// Support both /api (local development) and /php_api (production)
$basePaths = ['/api', '/php_api'];
foreach ($basePaths as $basePath) {
    if (strpos($path, $basePath) === 0) {
        $path = substr($path, strlen($basePath));
        break;
    }
}

// Clean up path
$path = trim($path, '/');

// Split path into parts
$pathParts = array_filter(explode('/', $path));
$resource = $pathParts[0] ?? '';
$id = $pathParts[1] ?? null;

// Authentication - all endpoints require auth
$auth = authenticate();

// Router - Match resource and method
try {
    switch ($resource) {
        // ===========================
        // ARTICLE CATEGORY ROUTES
        // ===========================
        case 'articleCategorys':
            $controller = new ArticleCategory();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        // GET /articleCategorys/{id}
                        $controller->findById($id);
                    } else {
                        // GET /articleCategorys
                        $controller->findAll();
                    }
                    break;
                    
                case 'POST':
                    // POST /articleCategorys
                    $controller->create();
                    break;
                    
                case 'PUT':
                    // PUT /articleCategorys/{id}
                    if (!$id) {
                        errorResponse('ID is required for update', 400);
                    }
                    $controller->update($id);
                    break;
                    
                case 'DELETE':
                    // DELETE /articleCategorys/{id}
                    if (!$id) {
                        errorResponse('ID is required for delete', 400);
                    }
                    $controller->delete($id);
                    break;
                    
                default:
                    errorResponse('Method not allowed', 405);
            }
            break;
            
        // ===========================
        // ARTICLES ROUTES
        // ===========================
        case 'articles':
            $controller = new Article();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        // GET /articles/{id}
                        $controller->findById($id);
                    } else {
                        // GET /articles
                        $controller->findAll();
                    }
                    break;
                    
                case 'POST':
                    // POST /articles
                    $controller->create();
                    break;
                    
                case 'PUT':
                    // PUT /articles/{id}
                    if (!$id) {
                        errorResponse('ID is required for update', 400);
                    }
                    $controller->update($id);
                    break;
                    
                case 'DELETE':
                    // DELETE /articles/{id}
                    if (!$id) {
                        errorResponse('ID is required for delete', 400);
                    }
                    $controller->delete($id);
                    break;
                    
                default:
                    errorResponse('Method not allowed', 405);
            }
            break;
            
        // ===========================
        // FORM REGISTERS ROUTES
        // ===========================
        case 'formRegisters':
            $controller = new FormRegister();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        // GET /formRegisters/{id}
                        $controller->findById($id);
                    } else {
                        // GET /formRegisters
                        $controller->findAll();
                    }
                    break;
                    
                case 'POST':
                    // POST /formRegisters
                    $controller->create();
                    break;
                    
                case 'PUT':
                    // PUT /formRegisters/{id}
                    if (!$id) {
                        errorResponse('ID is required for update', 400);
                    }
                    $controller->update($id);
                    break;
                    
                case 'DELETE':
                    // DELETE /formRegisters/{id}
                    if (!$id) {
                        errorResponse('ID is required for delete', 400);
                    }
                    $controller->delete($id);
                    break;
                    
                default:
                    errorResponse('Method not allowed', 405);
            }
            break;
            
        // ===========================
        // GALLERIES ROUTES
        // ===========================
        case 'galleries':
            $controller = new Gallery();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        // GET /galleries/{id}
                        $controller->findById($id);
                    } else {
                        // GET /galleries
                        $controller->findAll();
                    }
                    break;
                    
                case 'POST':
                    // POST /galleries
                    $controller->create();
                    break;
                    
                case 'PUT':
                    // PUT /galleries/{id}
                    if (!$id) {
                        errorResponse('ID is required for update', 400);
                    }
                    $controller->update($id);
                    break;
                    
                case 'DELETE':
                    // DELETE /galleries/{id}
                    if (!$id) {
                        errorResponse('ID is required for delete', 400);
                    }
                    $controller->delete($id);
                    break;
                    
                default:
                    errorResponse('Method not allowed', 405);
            }
            break;
            
        // ===========================
        // IMAGE CATEGORY ROUTES
        // ===========================
        case 'imageCategorys':
            $controller = new ImageCategory();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        // GET /imageCategorys/{id}
                        $controller->findById($id);
                    } else {
                        // GET /imageCategorys
                        $controller->findAll();
                    }
                    break;
                    
                case 'POST':
                    // POST /imageCategorys
                    $controller->create();
                    break;
                    
                case 'PUT':
                    // PUT /imageCategorys/{id}
                    if (!$id) {
                        errorResponse('ID is required for update', 400);
                    }
                    $controller->update($id);
                    break;
                    
                case 'DELETE':
                    // DELETE /imageCategorys/{id}
                    if (!$id) {
                        errorResponse('ID is required for delete', 400);
                    }
                    $controller->delete($id);
                    break;
                    
                default:
                    errorResponse('Method not allowed', 405);
            }
            break;
            
        // ===========================
        // PROPOSAL CATEGORY ROUTES
        // ===========================
        case 'proposalCategorys':
            $controller = new ProposalCategory();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        // GET /proposalCategorys/{name}
                        $controller->findByName($id);
                    } else {
                        // GET /proposalCategorys
                        $controller->findAll();
                    }
                    break;
                    
                case 'POST':
                    // POST /proposalCategorys
                    $controller->create();
                    break;
                    
                case 'PUT':
                    // PUT /proposalCategorys/{name}
                    if (!$id) {
                        errorResponse('Name is required for update', 400);
                    }
                    $controller->update($id);
                    break;
                    
                case 'DELETE':
                    // DELETE /proposalCategorys/{name}
                    if (!$id) {
                        errorResponse('Name is required for delete', 400);
                    }
                    $controller->delete($id);
                    break;
                    
                default:
                    errorResponse('Method not allowed', 405);
            }
            break;
            
        // ===========================
        // BNSP PROPOSAL ROUTES
        // ===========================
        case 'bnspProposals':
            $controller = new BnspProposal();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        // GET /bnspProposals/{id}
                        $controller->findById($id);
                    } else {
                        // GET /bnspProposals
                        $controller->findAll();
                    }
                    break;
                    
                case 'POST':
                    // POST /bnspProposals
                    $controller->create();
                    break;
                    
                case 'PUT':
                    // PUT /bnspProposals/{id}
                    if (!$id) {
                        errorResponse('ID is required for update', 400);
                    }
                    $controller->update($id);
                    break;
                    
                case 'DELETE':
                    // DELETE /bnspProposals/{id}
                    if (!$id) {
                        errorResponse('ID is required for delete', 400);
                    }
                    $controller->delete($id);
                    break;
                    
                default:
                    errorResponse('Method not allowed', 405);
            }
            break;
            
        // ===========================
        // KEMNAKER PROPOSAL ROUTES
        // ===========================
        case 'kemnakerProposals':
            $controller = new KemnakerProposal();
            
            switch ($method) {
                case 'GET':
                    if ($id) {
                        // GET /kemnakerProposals/{id}
                        $controller->findById($id);
                    } else {
                        // GET /kemnakerProposals
                        $controller->findAll();
                    }
                    break;
                    
                case 'POST':
                    // POST /kemnakerProposals
                    $controller->create();
                    break;
                    
                case 'PUT':
                    // PUT /kemnakerProposals/{id}
                    if (!$id) {
                        errorResponse('ID is required for update', 400);
                    }
                    $controller->update($id);
                    break;
                    
                case 'DELETE':
                    // DELETE /kemnakerProposals/{id}
                    if (!$id) {
                        errorResponse('ID is required for delete', 400);
                    }
                    $controller->delete($id);
                    break;
                    
                default:
                    errorResponse('Method not allowed', 405);
            }
            break;
            
        // ===========================
        // DEFAULT - NOT FOUND
        // ===========================
        default:
            // API root - show available endpoints
            if (empty($resource)) {
                successResponse([
                    'message' => 'k3-api-horizon PHP API',
                    'version' => '1.0.0',
                    'endpoints' => [
                        'Article Categories' => [
                            'GET /articleCategorys',
                            'GET /articleCategorys/{id}',
                            'POST /articleCategorys',
                            'PUT /articleCategorys/{id}',
                            'DELETE /articleCategorys/{id}'
                        ],
                        'Articles' => [
                            'GET /articles',
                            'GET /articles/{id}',
                            'POST /articles',
                            'PUT /articles/{id}',
                            'DELETE /articles/{id}'
                        ],
                        'Form Registers' => [
                            'GET /formRegisters',
                            'GET /formRegisters/{id}',
                            'POST /formRegisters',
                            'PUT /formRegisters/{id}',
                            'DELETE /formRegisters/{id}'
                        ],
                        'Galleries' => [
                            'GET /galleries',
                            'GET /galleries/{id}',
                            'POST /galleries',
                            'PUT /galleries/{id}',
                            'DELETE /galleries/{id}'
                        ],
                        'Image Categories' => [
                            'GET /imageCategorys',
                            'GET /imageCategorys/{id}',
                            'POST /imageCategorys',
                            'PUT /imageCategorys/{id}',
                            'DELETE /imageCategorys/{id}'
                        ],
                        'Proposal Categories' => [
                            'GET /proposalCategorys',
                            'GET /proposalCategorys/{name}',
                            'POST /proposalCategorys',
                            'PUT /proposalCategorys/{name}',
                            'DELETE /proposalCategorys/{name}'
                        ],
                        'BNSP Proposals' => [
                            'GET /bnspProposals',
                            'GET /bnspProposals/{id}',
                            'POST /bnspProposals',
                            'PUT /bnspProposals/{id}',
                            'DELETE /bnspProposals/{id}'
                        ],
                        'Kemnaker Proposals' => [
                            'GET /kemnakerProposals',
                            'GET /kemnakerProposals/{id}',
                            'POST /kemnakerProposals',
                            'PUT /kemnakerProposals/{id}',
                            'DELETE /kemnakerProposals/{id}'
                        ]
                    ],
                    'authentication' => 'Required: Bearer token or whitelisted IP'
                ]);
            } else {
                errorResponse("Endpoint not found: /$resource", 404);
            }
    }
    
} catch (PDOException $e) {
    logError("Database error: " . $e->getMessage());
    errorResponse('Database error occurred', 500);
    
} catch (Exception $e) {
    logError("Unexpected error: " . $e->getMessage());
    errorResponse('An unexpected error occurred', 500);
}
