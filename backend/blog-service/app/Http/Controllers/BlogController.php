<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        $blogs = Blog::where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Blog $blog) => $blog->toApiArray())
            ->values();

        return response()->json($blogs);
    }

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

    public function adminIndex(): JsonResponse
    {
        $blogs = Blog::orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Blog $blog) => $blog->toApiArray())
            ->values();

        return response()->json($blogs);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedData($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? null, $data['title']);
        $data['is_published'] = (bool) ($data['is_published'] ?? false);
        $data['created_at'] = now()->toISOString();

        $blog = Blog::create($data);

        return response()->json($blog->toApiArray(), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        if (!$this->isValidObjectId($id)) {
            return response()->json(['error' => 'ID bài viết không hợp lệ'], 400);
        }

        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['error' => 'Không tìm thấy bài viết'], 404);
        }

        $data = $this->validatedData($request, true);

        if (array_key_exists('slug', $data) || array_key_exists('title', $data)) {
            $data['slug'] = $this->uniqueSlug(
                $data['slug'] ?? $blog->slug,
                $data['title'] ?? $blog->title,
                $id,
            );
        }

        if (array_key_exists('is_published', $data)) {
            $data['is_published'] = (bool) $data['is_published'];
        }

        $blog->fill($data);
        $blog->save();

        return response()->json($blog->toApiArray());
    }

    public function destroy(string $id): JsonResponse
    {
        if (!$this->isValidObjectId($id)) {
            return response()->json(['error' => 'ID bài viết không hợp lệ'], 400);
        }

        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json(['error' => 'Không tìm thấy bài viết'], 404);
        }

        $blog->delete();

        return response()->json(['message' => 'Đã xóa bài viết']);
    }

    private function validatedData(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        try {
            return $request->validate([
                'title' => [$required, 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255'],
                'excerpt' => [$required, 'string'],
                'content' => [$required, 'string'],
                'image' => ['nullable', 'string'],
                'author' => [$required, 'string', 'max:100'],
                'is_published' => ['sometimes', 'boolean'],
            ]);
        } catch (ValidationException $e) {
            throw ValidationException::withMessages($e->errors());
        }
    }

    private function uniqueSlug(?string $slug, string $title, ?string $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $title) ?: Str::random(8);
        $candidate = $base;
        $counter = 2;

        while ($this->slugExists($candidate, $ignoreId)) {
            $candidate = $base . '-' . $counter;
            $counter++;
        }

        return $candidate;
    }

    private function slugExists(string $slug, ?string $ignoreId = null): bool
    {
        $blog = Blog::where('slug', $slug)->first();

        if (!$blog) {
            return false;
        }

        return (string) $blog->_id !== $ignoreId;
    }

    private function isValidObjectId(string $id): bool
    {
        return preg_match('/^[a-f0-9]{24}$/i', $id) === 1;
    }
}
