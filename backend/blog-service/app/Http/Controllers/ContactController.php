<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string'],
        ]);

        $data['is_read'] = false;
        $data['created_at'] = now()->toISOString();

        $contact = Contact::create($data);

        return response()->json([
            'message' => 'Đã gửi liên hệ',
            'contact' => $contact->toApiArray(),
        ], 201);
    }

    public function index(): JsonResponse
    {
        $contacts = Contact::orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Contact $contact) => $contact->toApiArray())
            ->values();

        return response()->json($contacts);
    }

    public function markRead(string $id): JsonResponse
    {
        if (!$this->isValidObjectId($id)) {
            return response()->json(['error' => 'ID liên hệ không hợp lệ'], 400);
        }

        $contact = Contact::find($id);

        if (!$contact) {
            return response()->json(['error' => 'Không tìm thấy liên hệ'], 404);
        }

        $contact->is_read = true;
        $contact->save();

        return response()->json($contact->toApiArray());
    }

    private function isValidObjectId(string $id): bool
    {
        return preg_match('/^[a-f0-9]{24}$/i', $id) === 1;
    }
}
