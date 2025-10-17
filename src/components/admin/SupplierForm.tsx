import React, { useState } from 'react';
import type { SupplierPayload } from '../../api/suppliers';

type SupplierFormProps = {
    onSave: (data: SupplierPayload) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
};

const SupplierForm: React.FC<SupplierFormProps> = ({ onSave, onCancel, isSubmitting }) => {
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Supplier name is required.');
            return;
        }

        const payload: SupplierPayload = {
            name,
            contactPerson: contactPerson || undefined,
            email: email || undefined,
            phoneNumber: phoneNumber || undefined,
            address: address || undefined,
            notes: notes || undefined,
        };

        try {
            await onSave(payload);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700">Supplier Name*</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-zinc-700">Contact Person</label>
                <input type="text" id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-zinc-700">Phone Number</label>
                <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-zinc-700">Address</label>
                <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-zinc-700">Notes</label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm" />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Supplier'}
                </button>
            </div>
        </form>
    );
};

export default SupplierForm;