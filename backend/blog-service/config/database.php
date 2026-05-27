<?php

$mongoUri = getenv('MONGODB_URI') ?: env('MONGODB_URI', 'mongodb://localhost:27017');
$mongoDb = getenv('BLOG_MONGODB_DB') ?: env('BLOG_MONGODB_DB', 'codecamp_php');

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
