'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PatientDetail() {
  const { token, API_BASE_URL } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Patient not found');
        const data = await res.json();
        setPatient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPatient();
  }, [id, token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-rose-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-8 space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{patient.name}</h1>
          <p className="text-sm text-slate-400 mt-1">{patient.email} · {patient.phone}</p>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Clinical Background</h2>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
            {/* FIX: Optional chaining prevents crash when medicalHistory is null */}
            {patient.medicalHistory?.length > 0 ? (
              patient.medicalHistory.map((h, i) => (
                <div key={i} className="mb-2">
                  <p><strong>Diagnosis:</strong> {h.diagnosis ?? 'N/A'}</p>
                  <p><strong>Notes:</strong> {h.notes ?? 'N/A'}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No medical history on record for this patient.</p>
            )}
          </div>

          <Link
            href={`/patients/${id}/history-records`}
            className="text-teal-600 font-extrabold hover:underline flex items-center gap-1 text-sm"
          >
            View Diagnostic Reports Details (Legacy App)
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </main>
    </div>
  );
}
