import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";

function Chatbot({ isLoggedIn }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("question"); // 'question' or 'registration'
  
  // Generate a unique session ID for the user
  const [sessionId] = useState(() => Date.now() + "-" + Math.random().toString(36).substr(2, 9));
  
  // Ref to track the initial render
  const isFirstRender = useRef(true);

  // Function to send messages to the backend
  const sendMessage = async (message, isUser = true) => {
    if (isUser && message.trim() !== "") {
      setMessages((prev) => [...prev, { sender: "user", text: message }]);
      setInput("");
    }

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        question: message,
        mode,
        session_id: sessionId,
      });

      setMessages((prev) => [...prev, { sender: "bot", text: response.data.answer }]);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, something went wrong." }]);
    }
  };

  // Initialize with a greeting message on first mount
  useEffect(() => {
    setMessages([{ sender: "bot", text: "Hello! How can I assist you today?" }]);
  }, []);

  // Handle mode changes
  useEffect(() => {
    // Skip the effect on the initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (mode === "question") {
      // Append the greeting message when switching to 'question' mode
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Hello! How can I assist you today?" },
      ]);
    } else if (mode === "registration") {
      // Initiate or resume the registration process
      sendMessage("", false);
    }
  }, [mode]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Handle user logout
  const handleLogout = () => {
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="App">
      <div className="header">
        <h1>University Registration Chatbot</h1>
        <button onClick={handleLogout} style={{ float: "right", marginRight: "20px" }}>
          Logout
        </button>
        <div className="toggle-container">
          <span className={mode === "question" ? "active" : ""}>Question Answering</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={mode === "registration"}
              onChange={(e) => setMode(e.target.checked ? "registration" : "question")}
            />
            <span className="slider"></span>
          </label>
          <span className={mode === "registration" ? "active" : ""}>Registration</span>
        </div>
      </div>
      <div className="chatbox">
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === "bot" ? "bot" : "user"}`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-box">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage(input);
              }
            }}
          />
          <button onClick={() => sendMessage(input)}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
