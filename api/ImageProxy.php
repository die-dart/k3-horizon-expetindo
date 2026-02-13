<?php
/**
 * Image Proxy - Caches Google Drive images locally
 * 
 * Usage: GET /imageProxy?url=<google-drive-url>
 * 
 * Downloads the image from Google Drive once, caches it locally,
 * and serves it directly on subsequent requests.
 * This avoids Google Drive's 429 rate limiting.
 */

class ImageProxy {
    private string $cacheDir;
    private int $cacheTTL; // seconds

    public function __construct() {
        $this->cacheDir = __DIR__ . '/image_cache';
        $this->cacheTTL = 86400 * 7; // 7 days cache

        // Create cache directory if it doesn't exist
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }

    /**
     * Handle the proxy request
     */
    public function handle(): void {
        $url = $_GET['url'] ?? '';
        
        if (empty($url)) {
            http_response_code(400);
            echo json_encode(['error' => 'URL parameter is required']);
            return;
        }

        // Only allow Google Drive / googleusercontent URLs
        if (!$this->isAllowedUrl($url)) {
            http_response_code(403);
            echo json_encode(['error' => 'Only Google Drive URLs are allowed']);
            return;
        }

        // Generate cache key from URL
        $cacheKey = md5($url);
        $cachePath = $this->cacheDir . '/' . $cacheKey;
        $metaPath = $cachePath . '.meta';

        // Check if cached version exists and is still valid
        if ($this->isCacheValid($cachePath, $metaPath)) {
            $this->serveCachedImage($cachePath, $metaPath);
            return;
        }

        // Download and cache the image
        $this->downloadAndCache($url, $cachePath, $metaPath);
    }

    /**
     * Check if URL is from allowed domains
     */
    private function isAllowedUrl(string $url): bool {
        $allowed = [
            'lh3.googleusercontent.com',
            'drive.google.com',
            'docs.google.com',
            'googleusercontent.com'
        ];

        $host = parse_url($url, PHP_URL_HOST);
        if (!$host) return false;

        foreach ($allowed as $domain) {
            if ($host === $domain || str_ends_with($host, '.' . $domain)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if cache file exists and is still valid
     */
    private function isCacheValid(string $cachePath, string $metaPath): bool {
        if (!file_exists($cachePath) || !file_exists($metaPath)) {
            return false;
        }

        $meta = json_decode(file_get_contents($metaPath), true);
        if (!$meta) return false;

        // Check TTL
        $age = time() - ($meta['cached_at'] ?? 0);
        return $age < $this->cacheTTL;
    }

    /**
     * Serve a cached image
     */
    private function serveCachedImage(string $cachePath, string $metaPath): void {
        $meta = json_decode(file_get_contents($metaPath), true);
        $contentType = $meta['content_type'] ?? 'image/jpeg';

        header('Content-Type: ' . $contentType);
        header('Cache-Control: public, max-age=86400');
        header('X-Cache: HIT');
        header('Access-Control-Allow-Origin: *');
        readfile($cachePath);
    }

    /**
     * Download image from URL and cache it
     */
    private function downloadAndCache(string $url, string $cachePath, string $metaPath): void {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
            CURLOPT_HTTPHEADER => [
                'Accept: image/*,*/*;q=0.8',
            ],
        ]);

        $imageData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $error = curl_error($ch);

        if ($httpCode !== 200 || empty($imageData) || $error) {
            // Return a transparent 1x1 pixel as fallback
            http_response_code(502);
            header('Content-Type: application/json');
            header('Access-Control-Allow-Origin: *');
            echo json_encode([
                'error' => 'Failed to fetch image',
                'http_code' => $httpCode,
                'curl_error' => $error
            ]);
            return;
        }

        // Validate it's actually an image
        if (!str_starts_with($contentType, 'image/')) {
            http_response_code(502);
            header('Content-Type: application/json');
            header('Access-Control-Allow-Origin: *');
            echo json_encode(['error' => 'Response is not an image', 'content_type' => $contentType]);
            return;
        }

        // Save to cache
        file_put_contents($cachePath, $imageData);
        file_put_contents($metaPath, json_encode([
            'url' => $url,
            'content_type' => $contentType,
            'size' => strlen($imageData),
            'cached_at' => time(),
        ]));

        // Serve the image
        header('Content-Type: ' . $contentType);
        header('Cache-Control: public, max-age=86400');
        header('X-Cache: MISS');
        header('Access-Control-Allow-Origin: *');
        echo $imageData;
    }
}
