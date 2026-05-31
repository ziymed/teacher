<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    /**
     * Publically verify an issued learning certificate using its unique hash.
     */
    public function verify(string $hash, Request $request): Response
    {
        $certificate = Certificate::where('verification_hash', $hash)
            ->with(['student', 'program'])
            ->first();

        return Inertia::render('certificate/verify', [
            'certificate' => $certificate,
            'searchedHash' => $hash,
        ]);
    }
}
