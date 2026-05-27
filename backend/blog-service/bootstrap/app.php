<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'jwt.admin' => \App\Http\Middleware\JwtAuthMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (!$request->is('api/*') || !str_starts_with($e::class, 'MongoDB\\')) {
                return null;
            }

            Log::error('Blog MongoDB error', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);

            $isPermissionError = str_contains($e->getMessage(), 'not allowed')
                || str_contains($e->getMessage(), 'Unauthorized');

            return response()->json([
                'error' => 'Blog database error',
                'message' => $isPermissionError
                    ? 'Khong the truy cap MongoDB Atlas cho blog-service. Kiem tra quyen readWrite tren database BLOG_MONGODB_DB.'
                    : 'Blog-service khong the truy cap database.',
            ], $isPermissionError ? 503 : 500);
        });
    })->create();
