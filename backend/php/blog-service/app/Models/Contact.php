<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Contact extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'contacts';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'is_read',
        'created_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($contact) {
            $contact->is_read   = false;
            $contact->created_at = now()->toISOString();
        });
    }

    public function toApiArray(): array
    {
        return [
            '_id'        => (string) $this->_id,
            'name'       => $this->name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'subject'    => $this->subject,
            'message'    => $this->message,
            'is_read'    => (bool) $this->is_read,
            'created_at' => $this->created_at,
        ];
    }
}
