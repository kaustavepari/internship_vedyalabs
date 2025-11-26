import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import axios from "axios";
import { useDashboard } from "../../contexts/DashboardContext";

// Reusable UI components
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary/50 ${
      props.className || ""
    }`}
  />
);

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${
      props.className || ""
    }`}
  />
);

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Traffic Analysis Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  // ❗ FIXED: Hook moved to top-level of component
  const { updateDashboardState } = useDashboard();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ---------------------------
  // 🔥 SAFE RESPONSE FORMATTER
  // ---------------------------
  const formatLLMResponse = (data: any): string => {
    if (!data) return "No response received.";

    if (data.date_range && data.charts) {
      return JSON.stringify(data, null, 2);
    }

    if (data.error) {
      return `⚠️ ERROR: ${data.error}\n\nRAW:\n${data.raw_response || "No raw response"}`;
    }

    if (typeof data === "string") {
      return data;
    }

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return "Received an unsupported response format.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_prompt", userMessage.text);

      console.log("Sending request to LLM with prompt:", inputValue);

      const response = await axios.post(
        "http://127.0.0.1:8000/get-output-from-llm/",
        formData
      );

      console.log("LLM Response:", response.data);

      // ❗ FIXED: Hook used safely
      if (response.data.response.state) {
        updateDashboardState(response.data.response.state);
      }

      const formatted = formatLLMResponse(response.data.response.response);

      const botMessage: Message = {
        id: Date.now() + 1,
        text: formatted,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "⚠️ Sorry, I encountered an error. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="w-80 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 overflow-hidden">
          <div className="bg-primary text-white p-3 font-medium flex justify-between items-center">
            <span>Traffic Analysis Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded-full"
            >
              ×
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap break-words ${
                      message.sender === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 rounded-bl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input field */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="w-10 h-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
}
