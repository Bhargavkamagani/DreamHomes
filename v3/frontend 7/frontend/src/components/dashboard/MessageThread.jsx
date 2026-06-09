import { useEffect, useMemo, useRef, useState } from 'react'
import { FileText, ImagePlus, Search, SendHorizontal } from 'lucide-react'
import DashboardCard from './DashboardCard.jsx'
import EmptyState from './EmptyState.jsx'
import { fetchConversationMessages, fetchConversations, sendConversationMessage } from '../../services/gharService.js'
import { imageUrl, websocketUrl } from '../../services/apiClient.js'
import { uploadLocalFile } from '../../services/uploadService.js'

function readAccessToken() {
  try {
    return JSON.parse(localStorage.getItem('gharbano_auth') || 'null')?.accessToken || ''
  } catch {
    return ''
  }
}

function initials(name) {
  return String(name || 'U').slice(0, 2).toUpperCase()
}

function messageAttachmentType(url) {
  if (!url) return 'TEXT'
  return /\.(png|jpe?g|webp|gif)$/i.test(url) ? 'IMAGE' : 'DOCUMENT'
}

export default function MessageThread() {
  const [conversationList, setConversationList] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageList, setMessageList] = useState([])
  const [messageBody, setMessageBody] = useState('')
  const [messageSearch, setMessageSearch] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [typingNotice, setTypingNotice] = useState('')
  const socketRef = useRef(null)

  const loadConversations = async () => {
    const items = await fetchConversations()
    setConversationList(items)
    setSelectedConversation((currentConversation) => {
      if (currentConversation) {
        return items.find((item) => item.id === currentConversation.id) || currentConversation
      }
      return items[0] || null
    })
  }

  useEffect(() => {
    loadConversations()
    const pollingTimer = window.setInterval(loadConversations, 15000)
    return () => window.clearInterval(pollingTimer)
  }, [])

  const loadMessages = async (options = {}) => {
    if (!selectedConversation) return
    const items = await fetchConversationMessages(selectedConversation.id, options)
    setMessageList(options.before_id ? [...items, ...messageList] : items)
    loadConversations()
  }

  useEffect(() => {
    if (!selectedConversation) return undefined
    loadMessages({ search: messageSearch })
    const token = readAccessToken()
    if (!token) return undefined
    const socket = new WebSocket(websocketUrl(`/messages/ws/${selectedConversation.id}?token=${encodeURIComponent(token)}`))
    socketRef.current = socket
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      if (payload.event === 'message') {
        loadMessages({ search: messageSearch })
        loadConversations()
      }
      if (payload.event === 'typing') {
        setTypingNotice('typing...')
        window.setTimeout(() => setTypingNotice(''), 1800)
      }
    }
    return () => socket.close()
  }, [selectedConversation?.id, messageSearch])

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!messageBody.trim() || !selectedConversation) return
    await sendConversationMessage({ conversation_id: selectedConversation.id, body: messageBody, message_type: 'TEXT' })
    setMessageBody('')
    await loadMessages({ search: messageSearch })
  }

  const uploadAttachment = async (file) => {
    if (!file || !selectedConversation) return
    setUploadMessage('Uploading attachment...')
    const uploadedFile = await uploadLocalFile(file)
    const type = messageAttachmentType(uploadedFile.url)
    await sendConversationMessage({
      conversation_id: selectedConversation.id,
      body: type === 'IMAGE' ? 'Photo attached' : file.name,
      attachment_url: uploadedFile.url,
      message_type: type,
    })
    setUploadMessage('')
    await loadMessages({ search: messageSearch })
  }

  const loadOlderMessages = async () => {
    if (!messageList.length) return
    await loadMessages({ search: messageSearch, before_id: messageList[0].id })
  }

  const selectedParticipant = selectedConversation?.participant
  const filteredTitle = useMemo(() => selectedParticipant?.primary_name || selectedConversation?.title || 'Messages', [selectedConversation, selectedParticipant])

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <DashboardCard title="Chats">
        <div className="space-y-2">
          {conversationList.map((conversation) => {
            const participant = conversation.participant || {}
            return (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${selectedConversation?.id === conversation.id ? 'border-forest-400 bg-forest-50' : 'border-forest-100 bg-white hover:bg-cream/40'}`}
              >
                <div className="flex gap-3">
                  {participant.avatar_url ? (
                    <img src={imageUrl(participant.avatar_url)} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-700 text-xs font-bold text-white">{initials(participant.primary_name || conversation.title)}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-graphite">{participant.primary_name || conversation.title}</p>
                        <p className="truncate text-xs font-semibold text-graphite/50">{participant.secondary_name || 'GharBanao chat'}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-graphite/45">{conversation.latest_message_time}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-graphite/55">{conversation.latest_message || 'No messages yet'}</p>
                      {conversation.unread_count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-warm px-1 text-[10px] font-bold text-white">{conversation.unread_count}</span>}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
          {!conversationList.length && <EmptyState title="No conversations" message="Send a message or accept a request to start chatting." />}
        </div>
      </DashboardCard>

      <DashboardCard title="">
        {!selectedConversation ? (
          <EmptyState title="Select a conversation" message="Messages with owners, contractors, suppliers, and support appear here." />
        ) : (
          <div className="flex min-h-[620px] flex-col overflow-hidden rounded-xl border border-forest-100 bg-cream/35">
            <div className="flex items-center gap-3 border-b border-forest-100 bg-white px-4 py-3">
              {selectedParticipant?.avatar_url ? (
                <img src={imageUrl(selectedParticipant.avatar_url)} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-700 text-xs font-bold text-white">{initials(filteredTitle)}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-graphite">{filteredTitle}</p>
                <p className="truncate text-xs font-semibold text-graphite/50">{typingNotice || selectedParticipant?.secondary_name || 'Offline'}</p>
              </div>
              <div className="hidden min-w-[220px] items-center gap-2 rounded-xl border border-forest-100 px-3 py-2 md:flex">
                <Search className="h-4 w-4 text-forest-700" />
                <input value={messageSearch} onChange={(event) => setMessageSearch(event.target.value)} placeholder="Search messages" className="min-w-0 flex-1 text-xs outline-none" />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messageList.length > 0 && (
                <button onClick={loadOlderMessages} className="mx-auto block rounded-full border border-forest-100 bg-white px-4 py-1.5 text-xs font-bold text-forest-700">Load older messages</button>
              )}
              {messageList.map((message) => (
                <div key={message.id} className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm ${message.is_mine ? 'bg-forest-700 text-white' : 'bg-white text-graphite'}`}>
                    {message.attachment_url && message.messageType === 'IMAGE' && <img src={imageUrl(message.attachment_url)} alt="" className="mb-2 max-h-56 rounded-xl object-cover" />}
                    {message.attachment_url && message.messageType !== 'IMAGE' && (
                      <a href={imageUrl(message.attachment_url)} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 font-bold">
                        <FileText className="h-4 w-4" /> Open attachment
                      </a>
                    )}
                    <p>{message.body}</p>
                    <p className={`mt-1 text-[10px] ${message.is_mine ? 'text-white/65' : 'text-graphite/40'}`}>{message.created_at}{message.is_mine && message.read ? ' · Read' : ''}</p>
                  </div>
                </div>
              ))}
              {!messageList.length && <EmptyState title="No messages found" message={messageSearch ? 'No messages match your search.' : 'Start the conversation below.'} />}
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-forest-100 bg-white p-3">
              <label className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl bg-forest-50 text-forest-700">
                <ImagePlus className="h-5 w-5" />
                <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={(event) => uploadAttachment(event.target.files?.[0]).catch(() => setUploadMessage('Attachment upload failed.'))} className="sr-only" />
              </label>
              <input
                value={messageBody}
                onFocus={() => socketRef.current?.send(JSON.stringify({ event: 'typing' }))}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder={uploadMessage || 'Type a message'}
                className="h-10 min-w-0 flex-1 rounded-xl border border-forest-100 px-3 text-sm outline-none focus:border-forest-400"
              />
              <button className="grid h-10 w-10 place-items-center rounded-xl bg-forest-700 text-white">
                <SendHorizontal className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
