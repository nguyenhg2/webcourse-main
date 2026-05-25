<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    // POST /api/contact — public, gửi liên hệ
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email',
            'phone'   => 'nullable|string|max:20',
            'subject' => 'required|string|max:200',
            'message' => 'required|string',
        ]);

        Contact::create($data);

        return response()->json(['message' => 'Liên hệ đã được gửi']);
    }

    // GET /api/admin/contacts — admin xem danh sách liên hệ
    public function index(): JsonResponse
    {
        $contacts = Contact::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($c) => $c->toApiArray())
            ->values();

        return response()->json($contacts);
    }

    // PATCH /api/admin/contacts/{id}/read — admin đánh dấu đã đọc
    public function markRead(string $id): JsonResponse
    {
        $contact = Contact::find($id);

        if (!$contact) {
            return response()->json(['error' => 'Không tìm thấy liên hệ'], 404);
        }

        $contact->is_read = true;
        $contact->save();

        return response()->json($contact->toApiArray());
    }
}
