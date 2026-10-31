<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Please authenticate to access this endpoint.',
            ], 401);
        }

        // Super Admin can access all operational endpoints unless explicitly restricted
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Check if user's role matches any allowed role
        if (!empty($roles) && !in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => "Forbidden: Access denied. Your role '{$user->role}' is not authorized to access this resource.",
                'required_roles' => $roles,
                'your_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
