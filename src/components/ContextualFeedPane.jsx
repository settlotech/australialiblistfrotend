import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Bot, 
  CheckCircle2, 
  Clock, 
  User, 
  X,
  FileSpreadsheet,
  Send,
  Sparkles,
  Layers,
  ClipboardList,
  AlertCircle,
  Plus,
  FileText,
  Calendar,
  Filter
} from 'lucide-react';
import { apiService } from '../services/apiService';
import ShidneyAIChat from './ShidneyAIChat';

export default function ContextualFeedPane({
  activePolicy,
  currentUser,
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
  width = 340,
  refreshTrigger = 0,
  onOpenMakerChecker,
  onSelectPolicy,
  policies = []
}) {
  const [activePaneTab, setActivePaneTab] = useState('chat'); // 'chat' | 'minutes' | 'notes' | 'requests' | 'audit'
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [changeLogs, setChangeLogs] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [metrics, setMetrics] = useState([]);

  // Minutes & Operational Issues near the Chatbot (Initialized clean)
  const [minutesAndIssues, setMinutesAndIssues] = useState([]);
  const [miFilter, setMiFilter] = useState('all'); // 'all' | 'minute' | 'issue'
  const [isAddingMI, setIsAddingMI] = useState(false);
  const [newMIType, setNewMIType] = useState('minute');
  const [newMITitle, setNewMITitle] = useState('');
  const [newMIDetails, setNewMIDetails] = useState('');
  const [newMISeverity, setNewMISeverity] = useState('Medium');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await apiService.getChangeLogs();
        if (logs) setChangeLogs(logs);

        const mc = await apiService.getMakerCheckerItems();
        if (mc?.pending) setPendingRequests(mc.pending);

        const m = await apiService.getDashboardMetrics(activePolicy?.department_id || 'all');
        if (m) setMetrics(m);
      } catch (err) {
        console.error('Failed to load logs:', err);
      }
    };
    loadLogs();
  }, [activePolicy?.id, refreshTrigger]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setComments(prev => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: currentUser?.name || 'Reviewer',
        role: currentUser?.roleType === 'manager' ? 'Bank Owner' : 'Bank Employee',
        time: 'Just now',
        text: newCommentText.trim()
      }
    ]);
    setNewCommentText('');
  };

  const handleCreateMI = (e) => {
    e.preventDefault();
    if (!newMITitle.trim()) return;
    const authorRole = currentUser?.roleType === 'manager' ? 'Bank Owner' : 'Bank Employee';
    const item = {
      id: `mi-${Date.now()}`,
      type: newMIType,
      title: newMITitle.trim(),
      date: 'Just now',
      author: `${currentUser?.name || 'Marcus Vance'} (${authorRole})`,
      details: newMIDetails.trim() || 'No additional details noted.',
      status: newMIType === 'minute' ? 'RECORDED' : 'OPEN',
      severity: newMISeverity
    };
    setMinutesAndIssues(prev => [item, ...prev]);
    setNewMITitle('');
    setNewMIDetails('');
    setIsAddingMI(false);
  };

  const handleQuickApprove = async (requestId) => {
    try {
      await apiService.reviewMakerCheckerItem(requestId, 'approved', 'Approved via Contextual Action Pane', currentUser?.name || 'Marcus Vance');
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      alert("Change request approved and deployed to repository.");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMI = minutesAndIssues.filter(item => {
    if (miFilter === 'all') return true;
    return item.type === miFilter;
  });

  if (isCollapsed) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        style={{ width: `${width}px` }}
        className={`
          flex-shrink-0 bg-[#f0f4f9] border-l border-[#dbe4ef] flex flex-col h-[calc(100vh-3.5rem)] select-none transition-all duration-200
          ${isMobileOpen 
            ? 'fixed inset-y-0 right-0 z-50 shadow-xl !w-80' 
            : 'relative z-10'}
        `}
      >
        {/* Top Header - Comments/Queries with Chat option */}
        <div className="h-11 px-3.5 border-b border-[#dbe4ef] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-[13px]">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="truncate">Comments/Queries with Chat option</span>
          </div>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 5 Clean Tabs: Chatbot (AI) | Issues & Minutes | Notes | Requests | Audit */}
        <div className="p-1 border-b border-[#e2e8f0] bg-white grid grid-cols-5 gap-1 text-[11px]">
          <button
            onClick={() => setActivePaneTab('chat')}
            className={`py-1 px-1 rounded-md flex items-center justify-center gap-1 font-medium transition cursor-pointer ${
              activePaneTab === 'chat'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Interactive Banking AI Copilot"
          >
            <Bot className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Chatbot</span>
          </button>

          <button
            onClick={() => setActivePaneTab('minutes')}
            className={`py-1 px-1 rounded-md flex items-center justify-center gap-1 font-medium transition cursor-pointer ${
              activePaneTab === 'minutes'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Issues & Meeting Minutes"
          >
            <ClipboardList className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Minutes</span>
          </button>

          <button
            onClick={() => setActivePaneTab('notes')}
            className={`py-1 px-1 rounded-md flex items-center justify-center gap-1 font-medium transition cursor-pointer ${
              activePaneTab === 'notes'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Operational Notes & Queries"
          >
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Notes</span>
          </button>

          <button
            onClick={() => setActivePaneTab('requests')}
            className={`py-1 px-1 rounded-md flex items-center justify-center gap-1 font-medium transition cursor-pointer ${
              activePaneTab === 'requests'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Policy Change Requests"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Requests</span>
          </button>

          <button
            onClick={() => setActivePaneTab('audit')}
            className={`py-1 px-1 rounded-md flex items-center justify-center gap-1 font-medium transition cursor-pointer ${
              activePaneTab === 'audit'
                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Live Change Audit Trail"
          >
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Audit</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
          
          {/* TAB 1: Chatbot (Shidney AI Copilot grounded in policy) */}
          {activePaneTab === 'chat' && (
            <div className="h-full flex flex-col">
              <ShidneyAIChat 
                activePolicy={activePolicy} 
                currentUser={currentUser}
                onSelectPolicy={onSelectPolicy}
                policies={policies}
              />
            </div>
          )}

          {/* TAB 2: Issues & Meeting Minutes */}
          {activePaneTab === 'minutes' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Issues & Meeting Minutes
                </span>
                <button
                  onClick={() => setIsAddingMI(!isAddingMI)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingMI ? 'Cancel' : 'Log Item'}</span>
                </button>
              </div>

              {/* Filter pills: All | Minutes | Issues */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  onClick={() => setMiFilter('all')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    miFilter === 'all'
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({minutesAndIssues.length})
                </button>
                <button
                  onClick={() => setMiFilter('minute')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    miFilter === 'minute'
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Minutes ({minutesAndIssues.filter(i => i.type === 'minute').length})
                </button>
                <button
                  onClick={() => setMiFilter('issue')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    miFilter === 'issue'
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Issues ({minutesAndIssues.filter(i => i.type === 'issue').length})
                </button>
              </div>

              {/* Add form */}
              {isAddingMI && (
                <form onSubmit={handleCreateMI} className="p-3 bg-white rounded-lg border border-slate-300 shadow-sm space-y-2 text-xs animate-in fade-in duration-100">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-700">Type:</label>
                    <select
                      value={newMIType}
                      onChange={(e) => setNewMIType(e.target.value)}
                      className="p-1 text-xs rounded border border-slate-300 bg-white"
                    >
                      <option value="minute">Meeting Minute</option>
                      <option value="issue">Operational Issue</option>
                    </select>
                    {newMIType === 'issue' && (
                      <select
                        value={newMISeverity}
                        onChange={(e) => setNewMISeverity(e.target.value)}
                        className="p-1 text-xs rounded border border-slate-300 bg-white ml-auto"
                      >
                        <option value="Low">Low Severity</option>
                        <option value="Medium">Medium Severity</option>
                        <option value="High">High Severity</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={newMITitle}
                      onChange={(e) => setNewMITitle(e.target.value)}
                      placeholder={newMIType === 'minute' ? "Minute Title (e.g. Risk Review)" : "Issue Summary"}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={newMIDetails}
                      onChange={(e) => setNewMIDetails(e.target.value)}
                      placeholder="Enter recorded notes, agreed actions, or resolution..."
                      className="w-full p-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingMI(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                    >
                      Save {newMIType === 'minute' ? 'Minute' : 'Issue'}
                    </button>
                  </div>
                </form>
              )}

              {/* Items List */}
              <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-0.5">
                {filteredMI.length === 0 ? (
                  <div className="py-10 px-4 text-center text-slate-400 text-xs bg-white rounded-xl border border-[#dbe4ef] shadow-2xs">
                    <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-xs">No Minutes or Issues Logged</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                      Click "+ Log Item" above to record meeting minutes or operational issues.
                    </p>
                  </div>
                ) : (
                  filteredMI.map(item => (
                    <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs text-[12px] space-y-1.5">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded font-mono ${
                            item.type === 'minute'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {item.type === 'minute' ? 'Minute' : 'Issue'}
                          </span>
                          <span className="font-bold text-slate-800 leading-snug">{item.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.date}</span>
                      </div>

                      <p className="text-slate-600 text-[11.5px] leading-relaxed">
                        {item.details}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10.5px] text-slate-500">
                        <span>Recorded by {item.author}</span>
                        <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                          item.status === 'APPROVED' || item.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Notes & Discussion */}
          {activePaneTab === 'notes' && (
            <div className="h-full flex flex-col justify-between space-y-3">
              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Staff Notes & Discussion Threads
                </span>

                {comments.length === 0 ? (
                  <div className="py-10 px-4 text-center text-slate-400 text-xs bg-white rounded-xl border border-[#dbe4ef] shadow-2xs">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-xs">No Operational Notes</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                      Staff queries and discussion notes will appear here.
                    </p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs text-[12px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{c.author}</span>
                        <span className="text-[10.5px] text-slate-400">{c.time}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500">{c.role}</div>
                      <p className="text-slate-700 mt-1 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-200">
                <div className="relative">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add operational query or note..."
                    className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-lg text-[12.5px] focus:outline-none focus:border-slate-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Change Requests */}
          {activePaneTab === 'requests' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending Policy Change Requests
                </span>
                <button
                  onClick={onOpenMakerChecker}
                  className="text-[11px] font-medium text-slate-700 hover:text-slate-900 underline"
                >
                  Full Modal →
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-medium text-slate-600">All Requests Adjudicated</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No pending employee submissions in queue.</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs text-[12px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[12px] truncate">{req.title || 'Amendment Request'}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                        PENDING
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11.5px] leading-snug">{req.change_summary || req.reason}</p>
                    <div className="text-[10.5px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Submitted by {req.maker_name}</span>
                      {currentUser?.roleType === 'manager' && (
                        <button
                          onClick={() => handleQuickApprove(req.id)}
                          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: Audit Logs (Neon DB) */}
          {activePaneTab === 'audit' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Audit Trail
                </span>
                <span className="text-[10.5px] text-emerald-600 font-medium">● Connected</span>
              </div>

              {changeLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No change logs recorded yet.</p>
              ) : (
                changeLogs.map(log => (
                  <div key={log.id} className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs text-[11.5px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 uppercase text-[10px] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug">{log.details}</p>
                    <div className="text-[10.5px] text-slate-400 flex items-center gap-1 pt-0.5">
                      <User className="w-3 h-3" /> {log.user_name}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
