<?php
// Remote seed endpoint - USE ONCE then delete this file!
header('Content-Type: application/json');

// Simple password protection
$password = $_GET['password'] ?? '';
if ($password !== 'seed-genzshop-2025') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getInstance();
    
    echo "🚀 Starting remote seeding...\n\n";

    // Clear existing data
    echo "🗑️  Clearing existing data...\n";
    $db->getCollection('categories')->deleteMany([]);
    $db->getCollection('subcategories')->deleteMany([]);
    $db->getCollection('products')->deleteMany([]);
    echo "✅ Data cleared!\n\n";

    // Create categories
    $categories = [
        [
            'name' => "Men's Fashion",
            'slug' => 'mens-fashion',
            'description' => 'Trendy fashion for modern men',
            'image' => 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
            'isActive' => true,
            'createdAt' => new MongoDB\BSON\UTCDateTime()
        ],
        [
            'name' => "Women's Fashion",
            'slug' => 'womens-fashion',
            'description' => 'Elegant and stylish clothing for women',
            'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
            'isActive' => true,
            'createdAt' => new MongoDB\BSON\UTCDateTime()
        ],
        [
            'name' => "Kid's Fashion",
            'slug' => 'kids-fashion',
            'description' => 'Comfortable and colorful clothes for kids',
            'image' => 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=800',
            'isActive' => true,
            'createdAt' => new MongoDB\BSON\UTCDateTime()
        ]
    ];

    $categoryIds = [];
    foreach ($categories as $category) {
        $result = $db->getCollection('categories')->insertOne($category);
        $categoryIds[$category['slug']] = $result->getInsertedId();
    }
    echo "✅ Created 3 categories\n\n";

    // Create subcategories
    $subcategories = [
        ['name' => 'Accessories', 'slug' => 'mens-accessories', 'category' => 'mens-fashion', 'image' => 'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=500'],
        ['name' => 'T-Shirts', 'slug' => 'mens-tshirts', 'category' => 'mens-fashion', 'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        ['name' => 'Shoes', 'slug' => 'mens-shoes', 'category' => 'mens-fashion', 'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        ['name' => 'Dresses', 'slug' => 'womens-dresses', 'category' => 'womens-fashion', 'image' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'],
        ['name' => 'T-Shirts', 'slug' => 'womens-tshirts', 'category' => 'womens-fashion', 'image' => 'https://images.unsplash.com/photo-1503341733017-1901578f9f1e?w=500'],
        ['name' => 'Pants', 'slug' => 'womens-pants', 'category' => 'womens-fashion', 'image' => 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500'],
        ['name' => 'Jewellery', 'slug' => 'womens-jewellery', 'category' => 'womens-fashion', 'image' => 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'],
        ['name' => 'T-Shirts', 'slug' => 'kids-tshirts', 'category' => 'kids-fashion', 'image' => 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500'],
        ['name' => 'Shirts', 'slug' => 'kids-shirts', 'category' => 'kids-fashion', 'image' => 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500'],
        ['name' => 'Pants', 'slug' => 'kids-pants', 'category' => 'kids-fashion', 'image' => 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500'],
        ['name' => 'Shorts', 'slug' => 'kids-shorts', 'category' => 'kids-fashion', 'image' => 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500'],
        ['name' => 'Dresses', 'slug' => 'kids-dresses', 'category' => 'kids-fashion', 'image' => 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500']
    ];

    $subcategoryIds = [];
    foreach ($subcategories as $subcat) {
        $data = [
            'name' => $subcat['name'],
            'slug' => $subcat['slug'],
            'categoryId' => $categoryIds[$subcat['category']],
            'image' => $subcat['image'],
            'isActive' => true,
            'createdAt' => new MongoDB\BSON\UTCDateTime()
        ];
        $result = $db->getCollection('subcategories')->insertOne($data);
        $subcategoryIds[$subcat['slug']] = $result->getInsertedId();
    }
    echo "✅ Created 12 subcategories\n\n";

    // Sample products array (abbreviated for file size)
    $sampleProducts = [
        ['name' => 'Leather Watch - Classic Brown', 'price' => 2499, 'subcategory' => 'mens-accessories', 'images' => ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'], 'stock' => 50],
        ['name' => 'Stylish Sunglasses', 'price' => 1299, 'subcategory' => 'mens-accessories', 'images' => ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'], 'stock' => 75],
        ['name' => 'Classic White T-Shirt', 'price' => 499, 'subcategory' => 'mens-tshirts', 'images' => ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], 'stock' => 150],
        ['name' => 'White Sneakers', 'price' => 2999, 'subcategory' => 'mens-shoes', 'images' => ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], 'stock' => 60],
        ['name' => 'Floral Summer Dress', 'price' => 1999, 'subcategory' => 'womens-dresses', 'images' => ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'], 'stock' => 65],
    ];

    // Insert products
    $productCount = 0;
    foreach ($sampleProducts as $product) {
        $subcategoryId = $subcategoryIds[$product['subcategory']];
        $subcatDoc = $db->getCollection('subcategories')->findOne(['_id' => $subcategoryId]);
        $categoryId = $subcatDoc['categoryId'];
        
        $productData = [
            'name' => $product['name'],
            'slug' => strtolower(str_replace(' ', '-', $product['name'])),
            'description' => 'Premium quality ' . $product['name'],
            'price' => $product['price'],
            'originalPrice' => $product['price'] + 500,
            'stock' => $product['stock'],
            'images' => $product['images'],
            'categoryId' => $categoryId,
            'subcategoryId' => $subcategoryId,
            'category' => (string)$categoryId,
            'subcategory' => (string)$subcategoryId,
            'colors' => ['Black', 'Blue', 'White'],
            'sizes' => ['S', 'M', 'L', 'XL'],
            'isActive' => true,
            'isFeatured' => true,
            'rating' => 4.5,
            'reviews' => [],
            'createdAt' => new MongoDB\BSON\UTCDateTime(),
            'updatedAt' => new MongoDB\BSON\UTCDateTime()
        ];
        
        $db->getCollection('products')->insertOne($productData);
        $productCount++;
    }
    
    echo "✅ Created {$productCount} sample products\n\n";
    echo "🎉 Seeding completed successfully!\n";
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Database seeded successfully',
        'categories' => 3,
        'subcategories' => 12,
        'products' => $productCount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Seeding failed: ' . $e->getMessage()
    ]);
}
