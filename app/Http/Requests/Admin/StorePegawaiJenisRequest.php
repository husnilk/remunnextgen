<?php

namespace App\Http\Requests\Admin;

use App\Models\PegawaiJenis;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePegawaiJenisRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming users with 'manage_datamaster' permission can create
        // return $this->user()->can('manage_datamaster');
        return true; // Temporarily true for development without permissions fully set up
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique(PegawaiJenis::class, 'nama')
            ],
            'kode' => [
                'required',
                'string',
                'max:255',
                Rule::unique(PegawaiJenis::class, 'kode')
            ],
            'pegawai_ikatan_id' => [
                'required',
                'integer',
                Rule::exists('pegawai_ikatans', 'id')
            ],
            'jenis' => [
                'required',
                'string',
                Rule::in(['Dosen', 'Tendik', 'Pegawai Lainnya'])
            ],
            'has_remun' => [
                'required',
                'boolean'
            ],
        ];
    }
}
