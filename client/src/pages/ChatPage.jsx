import { useChatEngine, ChatMessages, TelemetryStrip, QuickActions, ChatInput } from '../components/AIChat';
import { useVehicle } from '../context/VehicleContext';

const TELE_DISPLAY = {
  speed: { label: 'Speed', unit: 'km/h', icon: '🏎️' },
  engineTemp: { label: 'Engine Temp', unit: '°C', icon: '🌡️' },
  rpm: { label: 'RPM', unit: 'rpm', icon: '⚙️' },
  oilPressure: { label: 'Oil Pressure', unit: 'psi', icon: '🛢️' },
  tirePressure: { label: 'Tire Pressure', unit: 'psi', icon: '🔵' },
  batteryVoltage: { label: 'Battery', unit: 'V', icon: '🔋' },
  fuelLevel: { label: 'Fuel Level', unit: '%', icon: '⛽' },
  brakeThickness: { label: 'Brake Pads', unit: 'mm', icon: '🛑' },
};

const SUGGESTED_PROMPTS = [
  "🔍 Run a full health check on my vehicle",
  "🌡️ Is my engine temperature normal?",
  "🔋 How's my battery doing?",
  "⛽ How far can I drive with current fuel?",
  "🛞 Should I worry about tire pressure?",
  "🔧 What maintenance is due soon?",
];

export default function ChatPage() {
  const chat = useChatEngine();
  const { params } = useVehicle();

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>🤖 AI Assistant</h1>
        <p>Your intelligent vehicle companion — powered by real-time telemetry</p>
      </div>

      <div className="chat-page">
        {/* Main Chat Area */}
        <div className="chat-page-main">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-avatar">🤖</div>
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-title">AutoPulse AI Assistant</div>
              <div className="ai-chat-header-status">Online — Live telemetry connected</div>
            </div>
            <div className="ai-chat-header-actions">
              <button className="ai-chat-header-btn" onClick={chat.clearChat} title="Clear conversation">🗑️</button>
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

        {/* Sidebar */}
        <div className="chat-page-sidebar">
          {/* Live Telemetry Card */}
          <div className="glass-card chat-page-tele-card">
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
              📡 Live Telemetry
            </h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              AI sees this data in real-time
            </p>
            <div className="chat-page-tele-grid">
              {Object.entries(params).map(([key, val]) => {
                const info = TELE_DISPLAY[key];
                if (!info) return null;
                return (
                  <div key={key} className="chat-page-tele-item">
                    <div className="label">{info.icon} {info.label}</div>
                    <div className="value">{val}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '2px' }}>{info.unit}</span></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="glass-card chat-page-tips">
            <h4>💡 Try Asking...</h4>
            <ul>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <li key={i} onClick={() => chat.sendMessage(p.replace(/^.+?\s/, ''))}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
