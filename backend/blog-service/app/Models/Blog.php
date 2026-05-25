<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Str;

class Blog extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'blogs';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'image',
        'author',
        'is_published',
        'created_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($blog) {
            if (empty($blog->slug)) {
                $blog->slug = Str::slug($blog->title) . '-' . Str::random(6);
            }
            if (empty($blog->created_at)) {
                $blog->created_at = now()->toISOString();
            }
        });
    }

    public function toApiArray(): array
    {
        return [
            '_id'          => (string) $this->_id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'excerpt'      => $this->excerpt,
            'content'      => $this->content,
            'image'        => $this->image,
            'author'       => $this->author,
            'is_published' => (bool) $this->is_published,
            'created_at'   => $this->created_at,
        ];
    }
}
