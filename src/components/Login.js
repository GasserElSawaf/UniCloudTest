import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = ({ setLoggedIn, setAccountType }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    accountType: "Student",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/login", formData);
      const { message, accountType, token } = response.data;

      setMessage(message);
      setMessageType("success");

      setAccountType(accountType);
      setLoggedIn(true);

      // Store the token in localStorage
      localStorage.setItem('token', token);

      setTimeout(() => {
        if (accountType === "Student") {
          navigate("/chatbot");
        } else if (accountType === "Admin") {
          navigate("/admin");
        }
      }, 500);
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
