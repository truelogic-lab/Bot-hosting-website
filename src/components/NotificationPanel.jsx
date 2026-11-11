import React, { useState, useEffect } from 'react';
import { X, Check, Zap, ShieldAlert, Cpu, Info, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data.notifications);
      setUnread(data.unread);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <ShieldAlert size={18} strokeWidth={1.5} className="text-orange-500 shrink-0 mt-0.5" />;
      case 'success': return <Zap size={18} strokeWidth={1.5} className="text-green-600 shrink-0 mt-0.5" />;
      case 'info': return <Info size={18} strokeWidth={1.5} className="text-brand shrink-0 mt-0.5" />;
      default: return <Cpu size={18} strokeWidth={1.5} className="text-gray-400 shrink-0 mt-0.5" />;
    }
  };

  const handleMarkRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(prev - 1, 0));
    try { await api.markNotificationRead(id); } catch {}
  };

  const handleMarkAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    try { await api.markAllNotificationsRead(); } catch {}
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      )}

      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col border-l border-gray-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-darktext">Notifications</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {unread > 0 ? `You have ${unread} unread` : 'All caught up'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-darktext transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {unread > 0 && (
          <div className="px-6 py-3 border-b border-gray-100 flex justify-end">
            <button onClick={handleMarkAll} className="flex items-center gap-1.5 text-[11px] font-bold text-brand hover:text-brand-dark transition-colors">
              <Check size={14} strokeWidth={1.5} /> Mark all as read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 size={20} className="animate-spin text-brand" /></div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center px-6">
              <Info size={24} strokeWidth={1.5} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-darktext">No notifications</p>
              <p className="text-xs text-gray-500 mt-1">You're all caught up.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`px-6 py-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-brand/5' : ''}`}
                >
                  {getIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-darktext">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.body}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-2">{formatTime(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 bg-brand rounded-full shrink-0 mt-1.5"></div>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default NotificationPanel;
