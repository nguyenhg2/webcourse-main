<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{slug}', [BlogController::class, 'show']);
Route::post('/contact', [ContactController::class, 'store']);

// Admin routes — require JWT with admin/operator role
Route::middleware('jwt.admin')->prefix('admin')->group(function () {
    Route::get('/blogs', [BlogController::class, 'adminIndex']);
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{id}', [BlogController::class, 'update']);
    Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);

    Route::get('/contacts', [ContactController::class, 'index']);
    Route::patch('/contacts/{id}/read', [ContactController::class, 'markRead']);
});
