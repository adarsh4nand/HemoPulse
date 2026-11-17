import { useState, useRef, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am the HemoPulse AI Assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const quickReplies = [
    "What is the 90-day rule?",
    "Weight requirements?",
    "Can I donate if I have a cold?",
    "Hemoglobin limits",
    "Tattoo rules"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const sendMessage = async (text) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMsg = { sender: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }])
    } catch (e) {
      console.log("Chatbot error:", e)
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server.' }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="card wide chat-container">
      <div className="chat-header">
        <h2>🤖 HemoPulse AI Assistant</h2>
        <p>Always here to help donors</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-row bot">
            <div className="message-bubble bot typing">⏳ Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-replies">
        {quickReplies.map((reply, idx) => (
          <button key={idx} className="quick-reply-btn" onClick={() => sendMessage(reply)}>
            {reply}
          </button>
        ))}
      </div>

      <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="Type your question here..." 
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default Chatbot