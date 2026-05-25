<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    // GET /api/blogs — public, chỉ trả bài đã publish
    public function index(): JsonResponse
    {
        $blogs = Blog::where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($b) => $b->toApiArray())
            ->values();

        return response()->json($blogs);
    }

    // GET /api/blogs/{slug} — public
    public function show(string $slug): JsonResponse
    {
        $blog = Blog::where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (!$blog) {
            return response()->json(['error' => 'Không tìm thấy bài viết'], 404);
        }

        return response()->json($blog->toApiArray());
    }

    // GET /api/admin/blogs — admin, trả tất cả kể cả draft
    public function adminIndex(): JsonResponse
    {
        $blogs = Blog::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($b) => $b->toApiArray())
            ->values();

        return response()->json($blogs);
    }

    // POST /api/admin/blogs — admin tạo bài mới
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'slug'         => 'nullable|string|max:255',
            'excerpt'      => 'required|string',
            'content'      => 'required|string',
            'image'        => 'nullable|string',
            'author'       => 'required|string|max:100',
            'is_published' => 'boolean',
        ]);

        $blog = Blog::create($data);

        return response()->json($blog->toApiArray(), 201);
    }

    // PUT /api/admin/blogs/{id} — admin sửa bài
    public function update(Request $request, string $id): JsonResponse
    {
        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['error' => 'Không tìm thấy bài viết'], 404);
        }

        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'slug'         => 'sometimes|string|max:255',
            'excerpt'      => 'sometimes|string',
            'content'      => 'sometimes|string',
            'image'        => 'nullable|string',
            'author'       => 'sometimes|string|max:100',
            'is_published' => 'sometimes|boolean',
        ]);

        $blog->fill($data)->save();

        return response()->json($blog->toApiArray());
    }

    // DELETE /api/admin/blogs/{id} — admin xóa bài
    public function destroy(string $id): JsonResponse
    {
        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['error' => 'Không tìm thấy bài viết'], 404);
        }

        $blog->delete();

        return response()->json(['message' => 'Đã xóa bài viết']);
    }
}
