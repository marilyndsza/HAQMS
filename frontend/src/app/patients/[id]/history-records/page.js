'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList, Calendar } from 'lucide-react';

export default function PatientHistoryRecords() {
  const { token, API_BASE_URL } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load patient records');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading records...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-rose-500">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-8 space-y-6">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Patient
        </button>

        {/* Header */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 text-teal-600 rounded-xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                Diagnostic Records
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">Patient: {patient.name}</p>
            </div>
          </div>
        </div>

        {/* Records */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Clinical History Records</h2>

          {patient.medicalHistory?.length > 0 ? (
            <div className="space-y-4">
              {patient.medicalHistory.map((record, index) => (
                <div
                  key={record.id ?? index}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                      Record #{index + 1}
                    </span>
                    {record.createdAt && (
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <p><span className="font-bold text-slate-500">Diagnosis:</span> {record.diagnosis ?? 'Not recorded'}</p>
                    <p><span className="font-bold text-slate-500">Notes:</span> {record.notes ?? 'No notes available'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold text-sm">No diagnostic records found for this patient.</p>
              <p className="text-slate-400 text-xs mt-1">Records will appear here once a physician adds clinical notes.</p>
            </div>
          )}
        </div>

        {/* Appointments summary */}
        {patient.appointments?.length > 0 && (
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Appointment History</h2>
            <div className="space-y-3">
              {patient.appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(apt.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-extrabold uppercase tracking-wide ${
                    apt.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' :
                    apt.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
