import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = ({ setLoggedIn, setAccountType }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    accountType: "Student", // Default account type
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(""); // State for success or error message
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); // Clear previous messages

    try {
      const response = await axios.post("http://localhost:5000/login", formData);
      const { message, accountType } = response.data;

      // Display success message
      setMessage(message);
      setMessageType("success");

      // Update login and account type state
      setAccountType(accountType);
      setLoggedIn(true);

      // Redirect based on account type after a delay
      setTimeout(() => {
        if (accountType === "Student") {
          navigate("/chatbot"); // Redirect to Chatbot page
        } else if (accountType === "Admin") {
          navigate("/admin"); // Redirect to Admin Dashboard
        }
      }, 500); // 2-second delay to display the success message
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Error during login.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="box">
      <h1>Login</h1>
      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="accountType" value={formData.accountType} onChange={handleChange}>
          <option value="Admin">Admin</option>
          <option value="Student">Student</option>
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Submit"}
        </button>
        <button type="button" className="back-btn" onClick={() => navigate("/")}>
          Back
        </button>
      </form>
    </div>
  );
};

export default Login;
