import { useState, useRef, useEffect } from 'react'
import apiClient from '../services/api'
import '../styles/ChatbotAI.css'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Xin chào! Tôi là trợ lý AI của Phòng Khám Đa Khoa. 👋\n\nTôi có thể giúp bạn:\n• Tư vấn về triệu chứng và gợi ý chuyên khoa phù hợp\n• Giải đáp thắc mắc về dịch vụ khám chữa bệnh\n• Hướng dẫn quy trình đặt lịch khám\n\nBạn cần hỗ trợ gì?'
}

export default function ChatbotAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async () => {
    const text = inputValue.trim()
    if (!text || loading) return

    setInputValue('')
    const updatedMessages = [...messages, { role: 'user', content: text }]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const response = await apiClient.post('/chatbot/message', {
        messages: updatedMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      })

      if (response.data.success) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response.data.message }
        ])
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.' }
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Xin lỗi, không thể kết nối với AI. Vui lòng thử lại sau.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE])
  }

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-icon">🤖</div>
              <div>
                <div className="chatbot-title">Trợ Lý AI</div>
                <div className="chatbot-subtitle">Phòng Khám Đa Khoa</div>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-action-btn"
                onClick={clearChat}
                title="Xoá hội thoại"
              >
                🗑️
              </button>
              <button
                className="chatbot-action-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-message ${msg.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-assistant'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="chatbot-bot-avatar">🤖</div>
                )}
                <div className="chatbot-bubble">{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message chatbot-message-assistant">
                <div className="chatbot-bot-avatar">🤖</div>
                <div className="chatbot-bubble chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Nhập câu hỏi của bạn... (Enter để gửi)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={loading}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={loading || !inputValue.trim()}
              title="Gửi"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button
        className="chatbot-toggle-btn"
        onClick={() => setIsOpen(prev => !prev)}
        title={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}
