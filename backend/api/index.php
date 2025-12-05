<?php
// Increase limits for large image uploads
ini_set('memory_limit', '256M');
ini_set('post_max_size', '50M');
ini_set('upload_max_filesize', '50M');
ini_set('max_execution_time', '300');

header('Content-Type: application/json');

// Load config
$config = require __DIR__ . '/../config/config.php';

// Handle multiple CORS origins
$allowedOrigins = $config['cors']['origins'] ?? ['*'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin && in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (str_starts_with($origin, 'http://localhost') || str_starts_with($origin, 'https://localhost')) {
    header("Access-Control-Allow-Origin: $origin"); // Allow localhost automatically
} else {
    header("Access-Control-Allow-Origin: " . ($allowedOrigins[0] ?? '*'));
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/SubcategoryController.php';

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove base path and query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Handle root path
if ($path === '/' || $path === '' || $path === '/api') {
    if ($requestMethod === 'GET') {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'GenZShop API is running',
            'version' => '1.0.0'
        ]);
        exit();
    }
}

// Remove /api prefix if present
if (str_starts_with($path, '/api')) {
    $path = substr($path, 4);
}

// Normalize path
if (empty($path) || $path === '/') {
    $path = '/';
}

// Route handling
try {
    // Product routes
    if (preg_match('/^\/products$/', $path) && $requestMethod === 'GET') {
        $controller = new ProductController();
        $controller->getAll();
    }
    elseif (preg_match('/^\/products\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'GET') {
        $controller = new ProductController();
        $controller->getById($matches[1]);
    }
    elseif (preg_match('/^\/products\/category\/(.+)$/', $path, $matches) && $requestMethod === 'GET') {
        $controller = new ProductController();
        $controller->getByCategory($matches[1]);
    }
    elseif (preg_match('/^\/products\/search$/', $path) && $requestMethod === 'GET') {
        $controller = new ProductController();
        $controller->search();
    }
    elseif (preg_match('/^\/products$/', $path) && $requestMethod === 'POST') {
        $controller = new ProductController();
        $controller->create();
    }
    elseif (preg_match('/^\/products\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'PUT') {
        $controller = new ProductController();
        $controller->update($matches[1]);
    }
    elseif (preg_match('/^\/products\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'DELETE') {
        $controller = new ProductController();
        $controller->delete($matches[1]);
    }

    // Auth routes
    elseif ($path === '/auth/register' && $requestMethod === 'POST') {
        $controller = new AuthController();
        $controller->register();
    }
    elseif ($path === '/auth/login' && $requestMethod === 'POST') {
        $controller = new AuthController();
        $controller->login();
    }
    elseif ($path === '/auth/profile' && $requestMethod === 'GET') {
        $controller = new AuthController();
        $controller->getProfile();
    }

    // Order routes
    elseif ($path === '/orders' && $requestMethod === 'POST') {
        $controller = new OrderController();
        $controller->create();
    }
    elseif ($path === '/orders' && $requestMethod === 'GET') {
        $controller = new OrderController();
        $controller->getAll();
    }
    elseif ($path === '/orders/user' && $requestMethod === 'GET') {
        $controller = new OrderController();
        $controller->getUserOrders();
    }
    elseif (preg_match('/^\/orders\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'GET') {
        $controller = new OrderController();
        $controller->getById($matches[1]);
    }
    elseif (preg_match('/^\/orders\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'PUT') {
        $controller = new OrderController();
        $controller->update($matches[1]);
    }

    // Category routes
    elseif ($path === '/categories' && $requestMethod === 'GET') {
        $controller = new CategoryController();
        $controller->getAll();
    }
    elseif ($path === '/categories/active' && $requestMethod === 'GET') {
        $controller = new CategoryController();
        $controller->getActive();
    }
    elseif ($path === '/categories' && $requestMethod === 'POST') {
        $controller = new CategoryController();
        $controller->create();
    }
    elseif (preg_match('/^\/categories\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'PUT') {
        $controller = new CategoryController();
        $controller->update($matches[1]);
    }
    elseif (preg_match('/^\/categories\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'DELETE') {
        $controller = new CategoryController();
        $controller->delete($matches[1]);
    }

    // Subcategory routes
    elseif ($path === '/subcategories' && $requestMethod === 'GET') {
        $controller = new SubcategoryController();
        $controller->getAll();
    }
    elseif ($path === '/subcategories/active' && $requestMethod === 'GET') {
        $controller = new SubcategoryController();
        $controller->getActive();
    }
    elseif (preg_match('/^\/subcategories\/category\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'GET') {
        $controller = new SubcategoryController();
        $controller->getByCategory($matches[1]);
    }
    elseif ($path === '/subcategories' && $requestMethod === 'POST') {
        $controller = new SubcategoryController();
        $controller->create();
    }
    elseif (preg_match('/^\/subcategories\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'PUT') {
        $controller = new SubcategoryController();
        $controller->update($matches[1]);
    }
    elseif (preg_match('/^\/subcategories\/([a-f0-9]{24})$/', $path, $matches) && $requestMethod === 'DELETE') {
        $controller = new SubcategoryController();
        $controller->delete($matches[1]);
    }

    // 404 Not Found
    else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Route not found'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}
