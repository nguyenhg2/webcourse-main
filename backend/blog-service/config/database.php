<?php

return [
    'default' => 'mongodb',

    'connections' => [
        'mongodb' => [
            'driver'   => 'mongodb',
            'dsn'      => env('MONGODB_URI', 'mongodb://localhost:27017'),
            'database' => env('MONGODB_DB', 'codecamp_core'),
        ],
    ],
];
