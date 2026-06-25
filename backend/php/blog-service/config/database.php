<?php

$readRootEnv = static function (string $name): ?string {
    $path = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . '.env';
    if (!is_file($path)) {
        return null;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim(ltrim($line, "\xEF\xBB\xBF"));
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        if (trim($key) === $name) {
            return trim(trim($value), "\"'");
        }
    }

    return null;
};

$readEnv = static function (string $name) use ($readRootEnv): ?string {
    foreach ([
        $_SERVER[$name] ?? null,
        $_ENV[$name] ?? null,
        getenv($name),
        env($name),
        $readRootEnv($name),
    ] as $value) {
        if (is_string($value) && trim($value) !== '') {
            return $value;
        }
    }

    return null;
};

$mongoUri = $readEnv('MONGODB_URI');
$mongoDb = $readEnv('BLOG_MONGODB_DB') ?: 'codecamp_php';

if (!$mongoUri) {
    throw new RuntimeException('MONGODB_URI is required for the MongoDB Atlas connection.');
}

return [
    'default' => 'mongodb',

    'connections' => [
        'mongodb' => [
            'driver'   => 'mongodb',
            'dsn'      => $mongoUri,
            'database' => $mongoDb,
        ],
    ],
];
