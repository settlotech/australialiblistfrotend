import React, { useState, useEffect } from 'react';
import { X, FileEdit, CheckCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function ConfigurePolicyModal({
  isOpen,
  onClose,
  policy,
  currentUser,
  onPolicyUpdated
}) {
  if (!isOpen || !policy) return null;

  const isChecker = currentUser?.roleType === 'manager' || currentUser?.roleType === 'admin';
  const isEmployee = currentUser?.roleType === 'employee';

  const initialParams = typeof policy.parameters === 'string'
    ? JSON.parse(policy.parameters || '{}')
    : (policy.parameters || {});

  const [title, setTitle] = useState(policy.title || '');
  const [content, setContent] = useState(policy.content || '');
  const [turnaroundSla, setTurnaroundSla] = useState(initialParams.turnaround_sla || '4 Hours');
  const [officerCap, setOfficerCap] = useState(initialParams.approval_limits?.officer_cap || '$100,000 AUD');
  const [dailyLimit, setDailyLimit] = useState(initialParams.daily_limit || '$25,000 AUD');
  const [mandatoryDvs, setMandatoryDvs] = useState(Boolean(initialParams.mandatory_dvs ?? true));
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const updatedParams = {
      ...initialParams,
      turnaround_sla: turnaroundSla,
      daily_limit: dailyLimit,
      mandatory_dvs: mandatoryDvs,
      approval_limits: {
        ...(initialParams.approval_limits || {}),
        officer_cap: officerCap
      }
    };

    try {
      const res = await apiService.updatePolicy(policy.id, {
        title,
        content,
        parameters: updatedParams,
        user_name: currentUser?.name || 'Marcus Vance',
        user_role: currentUser?.roleType || 'employee',
        justification: justification || 'Operational parameters revised'
      });

      if (res.maker_checker) {
        setStatusMessage({
          type: 'success',
          text: 'Proposed amendments submitted to Department Manager for Maker-Checker review.'
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Policy updated directly to version ${res.version} with audit logging.`
        });
      }

      setTimeout(() => {
        if (onPolicyUpdated) onPolicyUpdated();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to configure policy:', err);
      setStatusMessage({ type: 'error', text: 'Failed to update policy parameters.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configure Operational Clauses & Parameters
              </h2>
              <p className="text-[12px] text-slate-500">
                {isEmployee 
                  ? 'Submit proposed amendments to Department Manager for Maker-Checker review.' 
                  : 'Direct in-system editing: Auto-increments version (v1.0 → v1.1) and updates repository.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`p-3 text-[12.5px] font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100' : 'bg-rose-50 text-rose-800 border-b border-rose-100'
          }`}>
            <CheckCircle className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-[13px] custom-scrollbar">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Policy Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 text-[13px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Turnaround SLA</label>
              <input
                type="text"
                value={turnaroundSla}
                onChange={(e) => setTurnaroundSla(e.target.value)}
                placeholder="e.g. 4 Hours"
                required
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 text-[13px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Retail Limit</label>
              <input
                type="text"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="e.g. $25,000 AUD"
                required
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 text-[13px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Officer Approval Cap</label>
              <input
                type="text"
                value={officerCap}
                onChange={(e) => setOfficerCap(e.target.value)}
                placeholder="e.g. $100,000 AUD"
                required
                className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 text-[13px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Operational Clauses & Execution Standard</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Enter operational clauses, procedures, and conditions..."
              className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 text-[13px] font-mono leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Revision Justification / Change Notes</label>
            <input
              type="text"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Updated Turnaround SLA from 6h to 4h based on Q3 committee directive"
              className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-500 text-[13px]"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition"
          >
            {isSubmitting 
              ? 'Processing...' 
              : isEmployee 
              ? 'Submit for Maker-Checker Approval' 
              : 'Save & Deploy Version'}
          </button>
        </div>
      </div>
    </div>
  );
}
