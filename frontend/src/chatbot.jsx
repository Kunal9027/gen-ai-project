import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [canSendRequest, setCanSendRequest] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate a new unique session id
  const generateSessionId = () => {
    setSessionId(`session-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    setMessages([]); // clear chat history when session changes
  };

  useEffect(() => {
    const pingBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/ping', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok && response.status === 200) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.error('Backend ping failed:', error);
        setServerStatus('offline');
      }
    };

    pingBackend();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (serverStatus === 'offline') {
      const errorMsg = { sender: 'bot', text: 'Sorry, the server is currently offline. Please try again later.' };
      setMessages((prev) => [...prev, errorMsg]);
      setInput('');
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < 3000) {
      const timeLeft = Math.ceil((3000 - (now - lastRequestTime)) / 1000);
      const errorMsg = { sender: 'bot', text: `Please wait ${timeLeft} more second(s) before sending another message.` };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setCanSendRequest(false);
    setLastRequestTime(now);

    try {
      const res = await fetch('http://127.0.0.1:8000/chatapi/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          session_id: sessionId
        })
      });

      const data = await res.json();
      const botMsg = { sender: 'bot', text: data.response };
      setMessages((prev) => [...prev, botMsg]);
      setServerStatus('online');
    } catch (err) {
      console.error('API error:', err);
      setServerStatus('offline');
      const errorMsg = { sender: 'bot', text: 'Sorry, I encountered an error. The server might be offline. Please try again later.' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        setCanSendRequest(true);
      }, 3000);
    }

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("session_id", sessionId);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const botMsg = { sender: "bot", text: "✅ PDF uploaded and vector DB created successfully." };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const botMsg = { sender: "bot", text: `❌ Upload failed: ${data.error || "Unknown error"}` };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("Upload error:", err);
      const botMsg = { sender: "bot", text: "❌ Upload error. Server might be offline." };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto  px-4 py-8">
        <div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-180px)] flex flex-col">
            <div className="bg-gray-600 px-4 sm:px-6 py-3 flex-shrink-0 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Doc Assistant</h3>
                  <p className="text-gray-100 text-xs">
                    {serverStatus === 'checking' ? 'Connecting...' :
                     serverStatus === 'online' ? 'Online now' : 'Currently offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={generateSessionId}
                className="bg-white text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-200"
              >
                New Session
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-gray-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'}`}>
                    <div className="text-sm leading-relaxed">
                      {msg.sender === 'bot' ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeSanitize]}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      ) : msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border px-3 sm:px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Upload + Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="text-sm text-gray-600 border-r border-l border-b border-t"
                />
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="bg-gray-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload PDF"}
                </button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 sm:py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping || !canSendRequest}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 focus:outline-none disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Build by Kunal Chaudhary👍</p>
          <p className="mt-1">Current Session: {sessionId}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
