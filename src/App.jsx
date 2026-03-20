import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Upload, 
  Search, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Fingerprint, 
  ArrowRight,
  Loader2,
  X,
  User,
  ShieldAlert
} from 'lucide-react';
import { db } from './db/evidenceVault';
import { hashFile } from './utils/hashFile';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

const ACCEPTED_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'application/pdf': ['.pdf'],
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className={cn(
        "fixed bottom-8 left-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl font-semibold flex items-center gap-3 min-w-[320px] backdrop-blur-xl border-t border-white/20",
        type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
      )}
    >
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
}

function ScanView({ onTabChange, onSuccess }) {
  const [officerId, setOfficerId] = useState('');
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: isSubmitting,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!officerId.trim() || !file) {
      setToast({ message: 'Officer ID and file are required', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      const hash = await hashFile(file);
      await db.documents.add({
        fileName: file.name,
        hash,
        timestamp: Date.now(),
        officerId: officerId.trim(),
      });
      setToast({ message: 'Document fingerprinted and stored in vault', type: 'success' });
      setFile(null);
      setOfficerId('');
      onSuccess?.();
    } catch (err) {
      setToast({ message: 'Failed to save. Try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scan & Log Evidence</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">Create a tamper-proof cryptographic record of your documents instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
            <User size={16} className="text-indigo-500" />
            <span>Officer Credentials</span>
          </div>
          <input
            type="text"
            value={officerId}
            onChange={(e) => setOfficerId(e.target.value)}
            placeholder="e.g. OFF-2024-001"
            className="input-field"
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
            <FileText size={16} className="text-indigo-500" />
            <span>Upload Document</span>
          </div>
          <div
            {...getRootProps()}
            className={cn(
              "dropzone",
              isDragActive && "dropzone-active"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 ring-8 ring-indigo-500/5 group-hover:scale-110 transition-transform">
                {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
              </div>
              <div className="space-y-1">
                {file ? (
                  <p className="text-indigo-700 font-bold block">{file.name}</p>
                ) : (
                  <>
                    <p className="text-slate-700 font-bold">
                      {isDragActive ? 'Release to drop' : 'Drag & drop document'}
                    </p>
                    <p className="text-sm text-slate-400">PDF, PNG, JPG (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!officerId.trim() || !file || isSubmitting}
          className="btn-primary w-full group relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Fingerprint size={20} />
            )}
            {isSubmitting ? 'Calculating Hash...' : 'Log to Vault'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </form>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onTabChange('verify')}
          className="group flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors py-2 px-4 rounded-xl hover:bg-indigo-50"
        >
          <History size={16} />
          <span>Verification Dashboard</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function VerifyView({ onTabChange }) {
  const [documents, setDocuments] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isHashing, setIsHashing] = useState(false);

  const loadDocs = useCallback(async () => {
    const list = await db.documents.orderBy('timestamp').reverse().toArray();
    setDocuments(list);
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setIsHashing(true);
    setVerificationResult(null);
    try {
      const hash = await hashFile(acceptedFiles[0]);
      const match = documents.find((d) => d.hash === hash);
      setVerificationResult({
        hash,
        fileName: acceptedFiles[0].name,
        verified: !!match,
        matchedDoc: match,
      });
    } catch {
      setVerificationResult({ verified: false, error: true });
    } finally {
      setIsHashing(false);
    }
  }, [documents]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: isHashing,
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      <div className="flex justify-between items-center bg-white p-4 -mx-4 rounded-3xl sm:mx-0 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Search size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verification Hub</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Doc Integrity Check</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onTabChange('scan')}
          className="p-3 hover:bg-slate-50 text-slate-500 rounded-2xl transition-colors border border-transparent hover:border-slate-200"
          title="Back to Scan"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div 
            {...getRootProps()}
            className={cn(
              "dropzone border-indigo-200/50 py-16 group active:bg-indigo-50/20",
              isDragActive && "dropzone-active shadow-indigo-100 shadow-2xl scale-[1.01]"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
                <div className="relative p-6 rounded-3xl bg-white shadow-xl shadow-indigo-100/50 text-indigo-600 border border-indigo-50">
                   {isHashing ? <Loader2 className="animate-spin" size={40} /> : <ShieldCheck size={40} />}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <h3 className="text-xl font-bold text-slate-800">
                  {isDragActive ? 'Release to verify' : 'Drop file to verify'}
                </h3>
                <p className="text-slate-500 font-medium">Auto-scans and matches against vault records</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {verificationResult && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-8 rounded-3xl border shadow-2xl transition-all duration-500",
                  verificationResult.verified 
                    ? "bg-emerald-50/50 border-emerald-200 shadow-emerald-100/30" 
                    : "bg-rose-50/50 border-rose-200 shadow-rose-100/30"
                )}
              >
                <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
                  <div className={cn(
                    "p-5 rounded-full shadow-lg",
                    verificationResult.verified ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                  )}>
                    {verificationResult.verified ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className={cn(
                      "text-2xl font-black italic uppercase tracking-tight",
                      verificationResult.verified ? "text-emerald-900" : "text-rose-900"
                    )}>
                      {verificationResult.verified ? "Verified Authentic" : "Tampered / Invalid"}
                    </h4>
                    <p className="text-slate-600 font-mono text-xs break-all opacity-80 bg-white/50 p-2 rounded-lg border border-white/50">
                      HASH: {verificationResult.hash}
                    </p>
                    {verificationResult.verified && (
                      <p className="text-emerald-700 font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Matches Logged: {verificationResult.matchedDoc?.fileName}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Vault Records</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{documents.length} Total</span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {documents.length === 0 ? (
              <div className="text-center py-12 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold italic">Vault is empty.</p>
                <p className="text-xs text-slate-400 mt-1">Log evidence to see records here.</p>
              </div>
            ) : (
              documents.map((doc, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={doc.id}
                  className="group relative p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-default"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-bold truncate pr-10">{doc.fileName}</p>
                      <p className="text-[10px] text-slate-300 font-mono truncate">{doc.hash}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          {doc.officerId}
                        </span>
                        <span className="text-[10px] text-slate-300 font-medium">
                          {new Date(doc.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [tab, setTab] = useState('scan');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-[#fcfdff] selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100/30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-100/30 rounded-full blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg animate-float">
               <Fingerprint size={24} />
             </div>
             <div>
               <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">CryptoVault</h1>
               <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Evidence Scanner</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold ring-1 ring-emerald-500/20">
                <ShieldCheck size={14} />
                <span>Zero Knowledge Vault</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <User size={20} />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {tab === 'scan' ? (
            <ScanView key={`scan-${refreshKey}`} onTabChange={setTab} onSuccess={() => setRefreshKey((k) => k + 1)} />
          ) : (
            <VerifyView key={`verify-${refreshKey}`} onTabChange={setTab} />
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 mb-8">
           <ShieldCheck className="text-indigo-600" size={20} />
           <p className="text-slate-600 text-sm font-semibold tracking-tight">
             Secure, Local-First, Military-Grade Hashing
           </p>
        </div>
        <div className="space-y-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] leading-loose">
            Built for Secure Investigations & Forensics<br/>
            No records ever leave the local database.
          </p>
          <p className="text-slate-600 text-sm font-semibold">
            Built by{' '}
            <a
              href="https://chethan-4255.github.io/Portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Chethan Vasthaw Tippani
            </a>
          </p>
          <a
            href="https://github.com/Chethan-4255/cryptographic-document-scanner-vault"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Contribute on GitHub
            <ArrowRight size={16} />
          </a>
          <p className="text-slate-900 font-black text-sm pt-4">© 2026 CRYPTOVAULT CORE</p>
        </div>
      </footer>
    </div>
  );
}
