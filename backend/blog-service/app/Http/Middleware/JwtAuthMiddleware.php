<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JwtAuthMiddleware
{
    public function handle(Request $request, Closure $next, string $requiredRole = 'admin')
    {
        $header = $request->header('Authorization', '');

        if (!str_starts_with($header, 'Bearer ')) {
            return response()->json(['error' => 'Cần header Authorization'], 401);
        }

        $token = substr($header, 7);

        try {
            $secret = getenv('JWT_SECRET') ?: env('JWT_SECRET', 'dev-secret');
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
        } catch (\Throwable $e) {
            Log::warning('Giải mã JWT blog thất bại: ' . $e->getMessage());
            return response()->json(['error' => 'Token không hợp lệ'], 401);
        }

        $role = $decoded->role ?? '';

        if ($requiredRole === 'admin' && !in_array($role, ['admin', 'operator', 'instructor'], true)) {
            return response()->json(['error' => 'Không đủ quyền thực hiện'], 403);
        }

        $request->attributes->set('jwt_user_id', $decoded->user_id ?? '');
        $request->attributes->set('jwt_role', $role);

        return $next($request);
    }
}
