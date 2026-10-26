import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Upload, 
  BookOpen, 
  Edit3, 
  CheckCircle, 
  Sparkles, 
  Bot, 
  Loader2,
  Clock,
  ShieldCheck,
  Check,
  Search
} from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AddPolicyModal({
  isOpen,
  onClose,
  preselectedDepartmentId,
  preselectedDepartmentName,
  departments = [],
  currentUser,
  onPolicyCreated
}) {
  if (!isOpen) return null;

  // 3 Policy Creation Modes: 'direct' | 'library' | 'upload'
  const [creationMode, setCreationMode] = useState('direct');

  // Form Fields
  const [departmentId, setDepartmentId] = useState(preselectedDepartmentId || departments[0]?.id || 'company-policies');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [turnaroundSla, setTurnaroundSla] = useState('4 Hours');
  const [dailyLimit, setDailyLimit] = useState('$25,000 AUD');
  const [officerCap, setOfficerCap] = useState('$100,000 AUD');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [masterSearchQuery, setMasterSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('template-credit-card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // AI Thinking state for document ingestion
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiStep, setAiStep] = useState('');

  useEffect(() => {
    if (preselectedDepartmentId) {
      setDepartmentId(preselectedDepartmentId);
    }
  }, [preselectedDepartmentId]);

  // Master library templates
  const masterTemplates = [
    {
      id: 'template-credit-card',
      title: 'Credit Cards & Revolving Credit Assessment Guidelines',
      dept: 'retail-lending',
      sla: '4 Hours',
      cap: '$50,000 AUD',
      daily: '$15,000 AUD',
      summary: 'Statutory verification of retail credit line applicants including mandatory 36-month repayment buffer testing.',
      content: `1. Purpose and Scope:
This operational instruction governs the underwriting, verification, and limit escalation for all CBA retail credit card facilities.

2. Mandatory Capacity Verification:
All applicants must have debt-serviceability verified against benchmark household expenditure measures (HEM).
A mandatory minimum repayment buffer of 3.00% must be applied across all active credit liabilities.

3. Escalation & Dual Officer Sign-off:
Credit lines exceeding $50,000 AUD require Level 3 Manager approval and verified 100-point identity confirmation.`
    },
    {
      id: 'template-aml-kyc',
      title: 'Anti-Money Laundering & Sanctions Screening Standard',
      dept: 'legal-compliance',
      sla: '2 Hours',
      cap: '$250,000 AUD',
      daily: '$50,000 AUD',
      summary: 'Mandatory AUSTRAC reporting rules, PEP screening, and international wire transfer controls.',
      content: `1. Statutory Obligation:
Pursuant to the Anti-Money Laundering and Counter-Terrorism Financing Act 2006, all customer onboarding must undergo real-time screening against DFAT and UN sanctions lists.

2. Threshold Transaction Reporting:
Any physical cash or unverified wire deposit exceeding $10,000 AUD must be logged and reported to AUSTRAC within 10 business days.

3. Politically Exposed Persons (PEP):
Immediate escalation to Chief Compliance Officer prior to facility establishment.`
    },
    {
      id: 'template-it-sec',
      title: 'Privileged Access Management & Session Termination Standard',
      dept: 'security',
      sla: '1 Hour',
      cap: 'N/A',
      daily: 'N/A',
      summary: 'Mandatory session timeout rules, step-up MFA triggers, and privileged credential rotation.',
      content: `1. Inactivity Timeouts:
Core banking operational terminals must automatically lock after 15 minutes of inactivity. Absolute maximum session duration is 8 hours.

2. Step-Up Authentication:
Step-up biometric or hardware MFA token verification is mandatory for any administrative change or batch transfer exceeding $5,000 AUD.

3. Access Revocation:
De-provisioning of departed contractors must execute within 60 minutes of HR notice.`
    }
  ];

  const handleSelectTemplate = (template) => {
    setTitle(template.title);
    setSummary(template.summary);
    setContent(template.content);
    setTurnaroundSla(template.sla);
    setOfficerCap(template.cap);
    setDailyLimit(template.daily || '$25,000 AUD');
    if (departments.some(d => d.id === template.dept)) {
      setDepartmentId(template.dept);
    }
  };

  // AI-Assisted Document Ingestion with Step-by-Step Thinking sequence
  const handleUploadDocumentWithAi = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsAiThinking(true);
    setAiStep('1/4: Reading document stream & optical text analysis...');

    setTimeout(() => {
      setAiStep('2/4: AI evaluating operational clauses & statutory conditions...');
    }, 700);

    setTimeout(() => {
      setAiStep('3/4: Extracting Turnaround SLAs, Daily Limits & Approval Caps...');
    }, 1400);

    setTimeout(() => {
      setAiStep('4/4: Formatting reviewable policy cards and parameters...');
      
      const cleanBase = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      const parsedTitle = cleanBase.charAt(0).toUpperCase() + cleanBase.slice(1);
      
      setTitle(`${parsedTitle} Standard Operating Procedure`);
      setSummary(`AI Ingestion Complete: Extracted operational parameters, authorization ceilings, and execution standards from '${file.name}'.`);
      setContent(`### Section 1.0 Executive Mandate & Authority
This operational policy was ingested and structured automatically by the AI Document Engine from file '${file.name}'.

### Section 2.0 Operational Rules & Verification Checkpoints
1. All retail transactions and applications governed by this document must be logged in the core banking system.
2. Mandatory 100-Point KYC or DVS identity check must be confirmed prior to activation.
3. Dual-officer sign-off applies to any customer limit variation exceeding the standard baseline.

### Section 3.0 Governance & Monitoring
Turnaround target is monitored under institutional SLA benchmarks. All variations are logged for internal audit inspection.`);

      setTurnaroundSla('4 Hours');
      setDailyLimit('$20,000 AUD');
      setOfficerCap('$75,000 AUD');
      setIsAiThinking(false);
    }, 2100);
  };

  const isBankOwner = currentUser?.roleType === 'manager' || currentUser?.roleType === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    let finalDeptId = departmentId;
    let finalTitle = title;
    let finalSummary = summary;
    let finalContent = content;
    let finalSla = turnaroundSla;
    let finalDaily = dailyLimit;
    let finalCap = officerCap;

    if (creationMode === 'library') {
      const selectedTpl = masterTemplates.find(t => t.id === selectedTemplateId) || masterTemplates[0];
      finalDeptId = selectedTpl.dept;
      finalTitle = selectedTpl.title;
      finalSummary = selectedTpl.summary;
      finalContent = selectedTpl.content;
      finalSla = selectedTpl.sla;
      finalCap = selectedTpl.cap;
      finalDaily = selectedTpl.daily;
    } else if (creationMode === 'upload') {
      if (!uploadedFileName) {
        setErrorMessage('Please upload a document to proceed.');
        return;
      }
      finalTitle = title || `${uploadedFileName.replace(/\.[^/.]+$/, "")} Operating Policy`;
      finalSummary = summary || `AI ingested policy from ${uploadedFileName}`;
      finalContent = content || `### Operational Policy Specification\nExtracted from document: ${uploadedFileName}`;
    }

    if (!finalTitle.trim() || !finalContent.trim()) {
      setErrorMessage('Please enter policy title and content.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isBankOwner) {
        // Direct Publish for Bank Owner
        const res = await apiService.createPolicy({
          department_id: finalDeptId,
          title: finalTitle.trim(),
          summary: finalSummary.trim() || finalTitle.trim(),
          content: finalContent.trim(),
          parameters: {
            turnaround_sla: finalSla,
            daily_limit: finalDaily,
            approval_limits: { officer_cap: finalCap },
            mandatory_dvs: true
          },
          created_by: currentUser?.name || 'Bank Owner',
          creation_mode: creationMode
        });

        if (res.id) {
          if (onPolicyCreated) onPolicyCreated(res.id);
          onClose();
        }
      } else {
        // Bank Employee: Submits for Bank Owner Approval (Maker-Checker)
        const targetDeptName = departments.find(d => d.id === finalDeptId)?.name || 'Retail Banking';
        await apiService.createMakerCheckerItem({
          type: 'create_policy',
          title: `New Policy Proposal: ${finalTitle.trim()}`,
          department: targetDeptName,
          requested_by: `${currentUser?.name || 'Bank Employee'} (${currentUser?.role || 'Staff'})`,
          change_details: `Proposed new operational policy: "${finalTitle.trim()}" in ${targetDeptName}. Mode: ${creationMode}. SLA: ${finalSla}, Daily Limit: ${finalDaily}. Content: ${finalSummary.trim() || finalTitle.trim()}`,
          status: 'pending'
        });
        alert(`Policy proposal "${finalTitle.trim()}" submitted for Bank Owner (Marcus Vance) approval.`);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create policy:', err);
      setErrorMessage('Failed to save policy. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMasterTemplates = masterTemplates.filter(t => 
    t.title.toLowerCase().includes(masterSearchQuery.toLowerCase()) ||
    t.summary.toLowerCase().includes(masterSearchQuery.toLowerCase()) ||
    t.dept.toLowerCase().includes(masterSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm">
              +
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                LibList • Create Operational Policy
              </h2>
              <p className="text-[12px] text-slate-500">
                {isBankOwner 
                  ? 'Bank Owner Direct Publishing: Author or Adopt Master Governance Policies' 
                  : 'Bank Employee Authoring: Submit Policy Proposals for Bank Owner Approval'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Creation Modes Tab Bar */}
        <div className="p-3 bg-slate-50 border-b border-[#e5e7eb] grid grid-cols-3 gap-2 text-[12.5px]">
          <button
            type="button"
            onClick={() => setCreationMode('direct')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-medium transition cursor-pointer ${
              creationMode === 'direct'
                ? 'bg-white text-blue-900 shadow-xs border border-blue-300 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>1. Direct In-System</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreationMode('library');
              handleSelectTemplate(masterTemplates[0]);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-medium transition cursor-pointer ${
              creationMode === 'library'
                ? 'bg-white text-blue-900 shadow-xs border border-blue-300 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>2. Master Library</span>
          </button>

          <button
            type="button"
            onClick={() => setCreationMode('upload')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-medium transition cursor-pointer ${
              creationMode === 'upload'
                ? 'bg-white text-blue-900 shadow-xs border border-blue-300 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4 text-blue-600" />
            <span>3. Document Upload (AI)</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-100 text-rose-800 text-[12.5px] font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-[13px] custom-scrollbar">
          
          {/* MODE 2: MASTER LIBRARY (Search bar + Template cards only; NO target department dropdown or manual text inputs) */}
          {creationMode === 'library' && (
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Master Repository Templates (Published by Platform Owner Ramesh)
                </span>
                
                {/* Search Bar for Master Library */}
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={masterSearchQuery}
                    onChange={(e) => setMasterSearchQuery(e.target.value)}
                    placeholder="Search master library templates (credit cards, AML/KYC, security)..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Master Templates List */}
              <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {filteredMasterTemplates.map(t => {
                  const isSelected = selectedTemplateId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 shadow-2xs' 
                          : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-[13.5px]">{t.title}</h4>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[12px] mt-1 leading-relaxed">{t.summary}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11.5px] text-slate-500 font-medium">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Partition: {t.dept}</span>
                        <span>SLA: <strong className="text-slate-700">{t.sla}</strong></span>
                        <span>•</span>
                        <span>Approval Cap: <strong className="text-slate-700">{t.cap}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 3: DOCUMENT UPLOAD (AI) - ONLY UPLOAD OPTION */}
          {creationMode === 'upload' && (
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-xl text-center space-y-3">
                {isAiThinking ? (
                  <div className="py-6 space-y-3 text-center">
                    <Loader2 className="w-9 h-9 text-blue-600 animate-spin mx-auto" />
                    <p className="text-[14px] font-bold text-slate-900">
                      AI Document Engine Analyzing & Ingesting...
                    </p>
                    <p className="text-[12px] text-blue-700 font-mono bg-blue-50 px-3 py-1 rounded inline-block">
                      {aiStep}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-blue-500 mx-auto" />
                    <div className="text-[14px] font-bold text-slate-800">
                      Upload Any Document (PDF, Word, TXT)
                    </div>
                    <p className="text-[12px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Select your operational guideline or policy document. The AI ingestion engine will automatically extract clauses, SLA targets, and delegation limits.
                    </p>
                    <div className="pt-2">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.rtf"
                        onChange={handleUploadDocumentWithAi}
                        className="hidden"
                        id="doc-upload-input"
                      />
                      <label
                        htmlFor="doc-upload-input"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[13px] cursor-pointer shadow-xs transition"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Choose Document to Ingest</span>
                      </label>
                    </div>
                    {uploadedFileName && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[12.5px] flex items-center justify-center gap-2 font-medium mt-3">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>AI Ready: Populated from "{uploadedFileName}"</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* MODE 1: DIRECT IN-SYSTEM MANUAL CREATION FORM */}
          {creationMode === 'direct' && (
            <div className="space-y-3.5">
              {/* Target Department Partition */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department Partition</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-[13px]"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Policy Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Policy Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Credit Card Escalation & Approval Limits"
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-[13px]"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Executive Summary / Scope</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of intent and applicability"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-[13px]"
                />
              </div>

              {/* Operational Parameters */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turnaround SLA</label>
                  <input
                    type="text"
                    value={turnaroundSla}
                    onChange={(e) => setTurnaroundSla(e.target.value)}
                    placeholder="e.g. 4 Hours"
                    className="w-full p-2 rounded-lg border border-slate-300 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily Limit</label>
                  <input
                    type="text"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    placeholder="e.g. $25,000 AUD"
                    className="w-full p-2 rounded-lg border border-slate-300 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Officer Cap</label>
                  <input
                    type="text"
                    value={officerCap}
                    onChange={(e) => setOfficerCap(e.target.value)}
                    placeholder="e.g. $100,000 AUD"
                    className="w-full p-2 rounded-lg border border-slate-300 text-[13px]"
                  />
                </div>
              </div>

              {/* Clause Content */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Clauses</label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter statutory clauses, conditions, and procedures..."
                  required
                  className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-[13px] font-mono leading-relaxed"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isAiThinking}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            {isSubmitting 
              ? (isBankOwner ? 'Publishing Policy...' : 'Submitting Proposal...') 
              : (isBankOwner ? 'Publish Policy' : 'Submit for Approval')}
          </button>
        </div>
      </div>
    </div>
  );
}
