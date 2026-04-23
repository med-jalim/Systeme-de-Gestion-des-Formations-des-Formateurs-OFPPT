<?php

return [
    'url'           => env('KEYCLOAK_URL', 'http://localhost:8080'),
    'realm'         => env('KEYCLOAK_REALM', 'sgff'),
    'client_id'     => env('KEYCLOAK_CLIENT_ID', 'sgff-api'),
    'client_secret' => env('KEYCLOAK_CLIENT_SECRET', ''),
];
