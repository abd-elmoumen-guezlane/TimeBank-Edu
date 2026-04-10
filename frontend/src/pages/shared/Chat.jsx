import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MoreHorizontal, Send, Phone, Video, Paperclip } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import { useApp, mockMessages } from '../../context/AppContext';

export default function Chat() {
  const location = useLocation();
  const { tutors, students, currentUser } = useApp();
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState('');
  const [msgs, setMsgs] = useState(() => [...mockMessages]);

  const contacts = useMemo(() => {
    if (currentUser?.role === 'student') {
      return tutors
        .filter((t) => !t.suspended)
        .map((t) => ({
          id: t.id,
          name: t.name,
          avatar: t.avatar,
          avatarPhoto: t.avatarPhoto,
          lastMsg: 'Conversation',
          time: '—',
          online: !!t.disponible,
          unread: 0,
        }));
    }
    if (currentUser?.role === 'tutor') {
      return students
        .filter((s) => !s.suspended)
        .map((s) => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          avatarPhoto: s.avatarPhoto,
          lastMsg: 'Conversation',
          time: '—',
          online: false,
          unread: 0,
        }));
    }
    return [];
  }, [tutors, students, currentUser?.role]);

  useEffect(() => {
    const open = location.state?.openWithId;
    if (open != null && contacts.some((c) => c.id === open)) {
      setSelectedId(open);
    }
  }, [location.key, location.state?.openWithId, contacts]);

  const selectedContact = useMemo(() => {
    if (!contacts.length) return null;
    const picked = selectedId != null ? contacts.find((c) => c.id === selectedId) : null;
    return picked || contacts[0];
  }, [contacts, selectedId]);

  const sendMessage = () => {
    if (!message.trim() || !selectedContact) return;
    setMsgs((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: currentUser?.name || 'Moi',
        senderId: currentUser?.id,
        text: message,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        mine: true,
      },
    ]);
    setMessage('');
  };

  if (!contacts.length) {
    return (
      <DashboardLayout>
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
        </div>
        <div className="card p-8 text-center text-gray-500 dark:text-gray-400">Aucun contact disponible pour le moment.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
      </div>
      <div className="card p-0 overflow-hidden flex h-[calc(100vh-200px)] dark:bg-gray-800 dark:border-gray-700">
        <div className="w-64 border-r border-gray-100 dark:border-gray-700 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-900 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/80 ${selectedContact?.id === c.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar initials={c.avatar} src={c.avatarPhoto} size="sm" alt={c.name} />
                  {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{c.name}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">{c.unread}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar initials={selectedContact.avatar} src={selectedContact.avatarPhoto} size="sm" alt={selectedContact.name} />
                {selectedContact.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{selectedContact.name}</p>
                <p className="text-xs text-gray-400">{selectedContact.online ? 'En ligne' : 'Hors ligne'}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button type="button" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Appel">
                <Phone size={14} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button type="button" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Vidéo">
                <Video size={14} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button type="button" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Plus">
                <MoreHorizontal size={14} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'} gap-2`}>
                {!m.mine && <Avatar initials={selectedContact.avatar} src={selectedContact.avatarPhoto} size="xs" alt={selectedContact.name} />}
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${m.mine ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'}`}
                >
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.mine ? 'text-primary-200' : 'text-gray-400'} text-right`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <button type="button" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Pièce jointe">
              <Paperclip size={15} className="text-gray-500" />
            </button>
            <input
              type="text"
              placeholder="Écrire un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
            <button type="button" onClick={sendMessage} className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center hover:bg-primary-700 flex-shrink-0" aria-label="Envoyer">
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
