<template>
  <div class="ask-hakro-pro" :class="{ 'theme-dark': isDarkMode }">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': !sidebarOpen }">
      <div class="sidebar-header">
        <h2>Ask Hakro</h2>
        <button @click="toggleSidebar" class="sidebar-toggle" aria-label="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <button @click="startNewChat" class="new-chat-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Chat
      </button>

      <div class="history-section">
        <h3>Chat History</h3>
        <div v-if="chatSessions.length === 0" class="no-history">
          No chats yet
        </div>
        <div v-else class="history-list">
          <!-- Oldest first → newest at bottom (natural stack) -->
          <button
            v-for="session in chatSessions.slice().reverse()"
            :key="session.id"
            @click="loadChatSession(session.id)"
            class="history-item"
            :class="{ active: currentSessionId === session.id }"
          >
            <div class="history-preview">
              {{ session.title || 'Untitled' }}
            </div>
            <span class="history-time">{{ formatTimeAgo(session.lastMessage) }}</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Chat -->
    <main class="main-chat">
      <div class="top-bar">
        <button @click="toggleSidebar" class="menu-btn" aria-label="Open sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1>Ask Hakro</h1>
        <button @click="toggleTheme" class="theme-btn" aria-label="Toggle theme">
          <svg v-if="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>

      <!-- Messages: Newest at BOTTOM -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="currentMessages.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">🤖</div>
          <h3>Welcome to Ask Hakro</h3>
          <p>Ask me anything — code, explanations, or ideas!</p>
        </div>

        <!-- Render messages in normal order (oldest → newest) -->
        <!-- Container scrolls, so newest appears at bottom -->
        <transition-group name="message" tag="div" class="messages-container">
          <div
            v-for="(msg, index) in currentMessages"
            :key="index"
            class="message"
            :class="{
              'message-user': msg.role === 'user',
              'message-ai': msg.role === 'ai'
            }"
          >
            <div class="message-bubble">
              <div class="message-header">
                <span class="role-badge" :class="msg.role">{{ msg.role === 'user' ? 'You' : 'Hakro' }}</span>
                <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
              </div>
              <div v-if="msg.role === 'ai' && index === currentMessages.length - 1 && loading" class="thinking">
                <div class="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Thinking...</span>
              </div>
              <div v-else class="message-content" v-html="formatMessage(msg.content)"></div>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <textarea
          v-model="userInput"
          @keydown.enter.exact.prevent="sendChat"
          @input="autoResize"
          ref="inputRef"
          placeholder="Message Ask Hakro..."
          class="input-field"
          :disabled="loading"
          rows="1"
        ></textarea>
        <button
          @click="sendChat"
          :disabled="!userInput.trim() || loading"
          class="send-button"
          aria-label="Send"
        >
          <svg v-if="!loading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v4"></path>
            <path d="M12 22v-4"></path>
            <path d="m17 17-5-5-5 5"></path>
            <path d="m17 7-5 5-5-5"></path>
          </svg>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// === Theme (with localStorage persistence) ===
const isDarkMode = ref(localStorage.getItem('askHakroTheme') !== 'light')
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('askHakroTheme', isDarkMode.value ? 'dark' : 'light')
}

// === Sidebar ===
const sidebarOpen = ref(window.innerWidth > 768)
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// === Chat State ===
const chatSessions = ref([])
const currentSessionId = ref(null)
const currentMessages = ref([])
const userInput = ref('')
const loading = ref(false)
const messagesContainer = ref(null)
const inputRef = ref(null)

// === Lifecycle ===
onMounted(() => {
  // Load theme
  const savedTheme = localStorage.getItem('askHakroTheme')
  isDarkMode.value = savedTheme !== 'light'

  // Load chats
  loadAllSessions()
  if (chatSessions.value.length > 0) {
    // Load most recent chat
    loadChatSession(chatSessions.value[0].id)
  } else {
    startNewChat()
  }

  // Handle resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

// === Session Management ===
const generateId = () => Math.random().toString(36).substr(2, 9)

const startNewChat = () => {
  const newId = generateId()
  currentSessionId.value = newId
  currentMessages.value = []
  userInput.value = ''
  saveSession(newId, [])
}

const loadChatSession = (id) => {
  currentSessionId.value = id
  const session = chatSessions.value.find(s => s.id === id)
  currentMessages.value = session?.messages || []
  nextTick(() => scrollToBottom())
}

const saveSession = (id, messages) => {
  const title = messages.length > 0 
    ? (messages[0].role === 'user' ? messages[0].content.substring(0, 40) : 'AI Response')
    : 'New Chat'

  const now = Date.now()
  const existingIndex = chatSessions.value.findIndex(s => s.id === id)
  
  if (existingIndex >= 0) {
    chatSessions.value[existingIndex] = {
      ...chatSessions.value[existingIndex],
      messages,
      title,
      lastMessage: now
    }
  } else {
    // Add to top (most recent first)
    chatSessions.value.unshift({
      id,
      title,
      messages,
      lastMessage: now,
      createdAt: now
    })
  }
  
  // Keep only last 30 sessions
  if (chatSessions.value.length > 30) {
    chatSessions.value = chatSessions.value.slice(0, 30)
  }
  
  localStorage.setItem('askHakroSessions', JSON.stringify(chatSessions.value))
}

const loadAllSessions = () => {
  const saved = localStorage.getItem('askHakroSessions')
  if (saved) {
    try {
      chatSessions.value = JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to parse sessions')
    }
  }
}

// === Chat Logic ===
const sendChat = async () => {
  if (!userInput.value.trim() || loading.value) return

  const userMsg = {
    role: 'user',
    content: userInput.value.trim(),
    timestamp: Date.now()
  }

  currentMessages.value.push(userMsg)
  const msgs = [...currentMessages.value]
  saveSession(currentSessionId.value, msgs)
  
  userInput.value = ''
  loading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const res = await axios.post('http://localhost:8081/api/chat', { input: userMsg.content })
    const aiResponse = res.data?.trim() || "I'm not sure how to respond to that."
    
    currentMessages.value.push({
      role: 'ai',
      content: aiResponse,
      timestamp: Date.now()
    })
  } catch (error) {
    currentMessages.value.push({
      role: 'ai',
      content: '⚠️ Oops! I ran into an issue. Please try again.',
      timestamp: Date.now()
    })
    console.error('Chat API error:', error)
  } finally {
    loading.value = false
    const finalMsgs = [...currentMessages.value]
    saveSession(currentSessionId.value, finalMsgs)
    await nextTick()
    scrollToBottom()
  }
}

// === Formatting ===
const formatMessage = (text) => {
  if (!text) return ''

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const langMatch = code.match(/^([a-z0-9]*)\n?([\s\S]*)$/i)
    const lang = langMatch ? langMatch[1] : ''
    const codeContent = langMatch ? langMatch[2] : code
    return `<pre class="code-block"><code>${codeContent}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Line breaks
  html = html.replace(/\n/g, '<br>')

  return html
}

// === Utils ===
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const autoResize = () => {
  const el = inputRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatTimeAgo = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
</script>

<style scoped>
/* ===== THEME VARIABLES ===== */
:root {
  /* Light mode */
  --bg: #f8fafc;
  --sidebar-bg: #f1f5f9;
  --card-bg: white;
  --input-bg: white;
  --border-color: #e2e8f0;
  --text: #1e293b;
  --text-muted: #64748b;
  --user-bubble: #4f46e5;
  --ai-bubble: #f1f5f9;
  --accent: #8b5cf6;
  --code-bg: #f8fafc;
}

.theme-dark {
  /* Dark mode */
  --bg: #0a0a14;
  --sidebar-bg: #121220;
  --card-bg: #181828;
  --input-bg: #1e1e32;
  --border-color: #2d2d48;
  --text: #f0f0ff;
  --text-muted: #a0a0d0;
  --user-bubble: #4f46e5;
  --ai-bubble: #1e1e32;
  --accent: #8b5cf6;
  --code-bg: #1a1a2e;
}

/* ===== BASE STYLES ===== */
.ask-hakro-pro {
  display: flex;
  height: 100dvh;
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 260px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  z-index: 100;
}
.sidebar.collapsed {
  transform: translateX(-100%);
}
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    height: 100dvh;
  }
}

.sidebar-header {
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}
.sidebar-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent);
}
.sidebar-toggle {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1.2rem;
  margin: 1rem;
  background: linear-gradient(135deg, var(--user-bubble), var(--accent));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.history-section {
  padding: 0 1rem 1rem;
  flex: 1;
  overflow-y: auto;
}
.history-section h3 {
  padding: 0.5rem 0.5rem 0.8rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}
.no-history {
  padding: 1rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}
.history-item {
  background: transparent;
  border: none;
  text-align: left;
  padding: 0.7rem;
  border-radius: 10px;
  color: var(--text);
  cursor: pointer;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-item:hover {
  background: rgba(139, 92, 246, 0.1);
}
.history-item.active {
  background: rgba(139, 92, 246, 0.2);
  border-left: 3px solid var(--accent);
}
.history-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
  margin-top: 0.2rem;
}

/* ===== MAIN CHAT ===== */
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  z-index: 10;
}
.menu-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  margin-right: 1rem;
  display: none;
  padding: 4px;
}
.top-bar h1 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  flex: 1;
  text-align: center;
}
.theme-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 4px;
  cursor: pointer;
}
@media (max-width: 768px) {
  .menu-btn { display: block; }
  .top-bar h1 { margin: 0 auto; }
}

/* Messages container */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  text-align: center;
  padding: 2rem;
}
.empty-icon { font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.7; }
.empty-state h3 { margin: 0 0 0.6rem; font-size: 1.6rem; color: var(--text); }
.empty-state p { max-width: 400px; line-height: 1.5; }

/* Message styles */
.message {
  max-width: 85%;
  display: flex;
}
.message-user { justify-content: flex-end; }
.message-ai { justify-content: flex-start; }

.message-bubble {
  width: 100%;
  padding: 1rem 1.3rem;
  border-radius: 20px;
  line-height: 1.55;
  background: var(--ai-bubble);
  border: 1px solid var(--border-color);
}
.message-user .message-bubble {
  background: var(--user-bubble);
  color: white;
  border: none;
  border-bottom-right-radius: 6px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  font-size: 0.8rem;
}
.role-badge {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
}
.role-badge.user { background: rgba(255, 255, 255, 0.2); }
.role-badge.ai { 
  background: rgba(139, 92, 246, 0.2); 
  color: var(--accent);
}
.timestamp { color: var(--text-muted); }

.thinking {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--text-muted);
  font-style: italic;
}
.thinking-dots {
  display: flex;
  gap: 0.25rem;
}
.thinking-dots span {
  width: 7px;
  height: 7px;
  background: var(--accent);
  border-radius: 50%;
  animation: thinkingBounce 1.4s infinite ease-in-out;
}
.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 1rem;
}
.message-content :deep(.code-block) {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.7rem 0;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.92rem;
  line-height: 1.5;
  border: 1px solid var(--border-color);
}
.message-content :deep(.inline-code) {
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.92rem;
  border: 1px solid var(--border-color);
}

/* Input Area */
.chat-input-area {
  display: flex;
  padding: 1rem;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  gap: 0.8rem;
  align-items: flex-end;
}

.input-field {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 0.85rem 1.3rem;
  font-size: 1rem;
  color: var(--text);
  resize: none;
  outline: none;
  min-height: 50px;
  max-height: 120px;
  font-family: inherit;
}
.input-field:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
}
.input-field::placeholder {
  color: var(--text-muted);
}

.send-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--user-bubble), var(--accent));
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.send-button:hover:not(:disabled) {
  transform: scale(1.06);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
}
.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
.message-enter-active {
  animation: popIn 0.25s ease-out;
}
@keyframes popIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes thinkingBounce {
  0%, 80%, 100% { transform: scale(0.3); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

/* Scrollbars */
.chat-messages::-webkit-scrollbar,
.history-section::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-thumb,
.history-section::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar { width: 260px; }
  .message { max-width: 95%; }
  .chat-input-area { padding: 0.8rem; }
  .input-field { min-height: 48px; }
  .send-button { width: 48px; height: 48px; }
}
</style>

