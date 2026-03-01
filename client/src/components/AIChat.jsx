import { useState, useRef, useEffect } from 'react';
import { useVehicle } from '../context/VehicleContext';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const QUICK_ACTIONS = [
  { label: '🔍 What\'s wrong?', prompt: 'Based on my current telemetry, are there any issues with my vehicle?' },
  { label: '🛡️ Safe to drive?', prompt: 'Is it safe to drive my vehicle right now given the current telemetry readings?' },
  { label: '📊 Explain telemetry', prompt: 'Give me a quick summary of my current vehicle telemetry and what each reading means.' },
  { label: '🔧 Maintenance tips', prompt: 'Based on my vehicle data, what preventive maintenance should I do soon?' },
  { label: '⚡ Performance', prompt: 'How is my vehicle performing overall? Any optimization suggestions?' },
];

const TELE_LABELS = {
  speed: { icon: '🏎️', label: 'Speed', unit: 'km/h' },
  engineTemp: { icon: '🌡️', label: 'Temp', unit: '°C' },
  rpm: { icon: '⚙️', label: 'RPM', unit: '' },
  oilPressure: { icon: '🛢️', label: 'Oil', unit: 'psi' },
  tirePressure: { icon: '🔵', label: 'Tire', unit: 'psi' },
  batteryVoltage: { icon: '🔋', label: 'Batt', unit: 'V' },
  fuelLevel: { icon: '⛽', label: 'Fuel', unit: '%' },
  brakeThickness: { icon: '🛑', label: 'Brake', unit: 'mm' },
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px;font-size:0.82em">$1</code>')
    .replace(/\n/g, '<br/>');
}

// Shared chat core — used by both floating panel and full-page
export function useChatEngine() {
  const { params } = useVehicle();
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hey there! 👋 I'm **AutoPulse AI**, your real-time vehicle assistant. I can see your live telemetry data and help you understand your vehicle's health.\n\nAsk me anything or try a quick action below!", time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text?.trim()) return;
    const userMessage = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, time: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          telemetry: params,
          history: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content }))
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.response || "Sorry, I couldn't process that right now. Please try again.",
        time: new Date()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "⚠️ **Connection Error** — Unable to reach the AI service. Make sure the server is running on port 5000.",
        time: new Date()
      }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([
      { role: 'ai', content: "Chat cleared! 🧹 How can I help you?", time: new Date() }
    ]);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  return { messages, input, setInput, loading, sendMessage, clearChat, copyText, messagesEndRef, params };
}

// Reusable message list renderer
export function ChatMessages({ messages, loading, messagesEndRef, copyText }) {
  return (
    <div className="ai-chat-messages">
      {messages.map((msg, i) => (
        <div key={i} className={`ai-chat-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
          <div className="ai-chat-msg-avatar">
            {msg.role === 'ai' ? '🤖' : '👤'}
          </div>
          <div className="ai-chat-msg-body">
            <div
              className="ai-chat-msg-bubble"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
            <div className="ai-chat-msg-meta">
              <span className="ai-chat-msg-time">{msg.time ? formatTime(msg.time) : ''}</span>
              {msg.role === 'ai' && i > 0 && (
                <button className="ai-chat-msg-copy" onClick={() => copyText(msg.content)} title="Copy response">
                  📋 Copy
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="ai-chat-typing">
          <div className="ai-chat-msg-avatar" style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(59,130,246,0.15)',
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'
          }}>🤖</div>
          <div className="ai-chat-typing-dots">
            <span /><span /><span />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Telemetry strip
export function TelemetryStrip({ params }) {
  return (
    <div className="ai-chat-telemetry">
      {Object.entries(params).map(([key, val]) => {
        const info = TELE_LABELS[key];
        if (!info) return null;
        return (
          <div key={key} className="ai-chat-tele-chip">
            {info.icon} {info.label}: <span className="value">{val}{info.unit}</span>
          </div>
        );
      })}
    </div>
  );
}

// Quick actions bar
export function QuickActions({ onSend, disabled }) {
  return (
    <div className="ai-chat-quick-actions">
      {QUICK_ACTIONS.map((qa, i) => (
        <button
          key={i}
          className="ai-chat-quick-btn"
          onClick={() => onSend(qa.prompt)}
          disabled={disabled}
        >
          {qa.label}
        </button>
      ))}
    </div>
  );
}

// Chat input bar
export function ChatInput({ input, setInput, onSend, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
    }
  };

  return (
    <form className="ai-chat-input-area" onSubmit={handleSubmit}>
      <input
        className="ai-chat-input"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask AutoPulse AI anything..."
        disabled={loading}
      />
      <button
        className="ai-chat-send-btn"
        type="submit"
        disabled={loading || !input.trim()}
        title="Send message"
      >
        ➤
      </button>
    </form>
  );
}

// ──── FLOATING CHAT WIDGET ────
export default function AIChat() {
  const chat = useChatEngine();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleToggle = () => {
    if (isOpen) handleClose();
    else setIsOpen(true);
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className={`ai-chat-panel ${isClosing ? 'closing' : ''}`}>
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-avatar">🤖</div>
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-title">AutoPulse AI</div>
              <div className="ai-chat-header-status">Online — Monitoring vehicle</div>
            </div>
            <div className="ai-chat-header-actions">
              <button className="ai-chat-header-btn" onClick={chat.clearChat} title="Clear chat">🗑️</button>
              <button className="ai-chat-header-btn" onClick={handleClose} title="Close">✕</button>
            </div>
          </div>

          {/* Telemetry Strip */}
          <TelemetryStrip params={chat.params} />

          {/* Messages */}
          <ChatMessages
            messages={chat.messages}
            loading={chat.loading}
            messagesEndRef={chat.messagesEndRef}
            copyText={chat.copyText}
          />

          {/* Quick Actions */}
          <QuickActions onSend={chat.sendMessage} disabled={chat.loading} />

          {/* Input */}
          <ChatInput
            input={chat.input}
            setInput={chat.setInput}
            onSend={chat.sendMessage}
            loading={chat.loading}
          />
        </div>
      )}

      {/* FAB */}
      <button
        className={`ai-chat-fab ${isOpen ? 'is-open' : ''}`}
        onClick={handleToggle}
        title="Chat with AutoPulse AI"
      >
        {!isOpen && <span className="ai-chat-fab-pulse" />}
        {isOpen ? '✕' : '✨'}
      </button>
    </>
  );
}
