import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    accountType: "Admin",
  });
  const [message, setMessage] = useState(""); // State for success or error message
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", formData);

      // Display success message and navigate
      setMessage(response.data.message);
      setMessageType("success");
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
    } catch (error) {
      // Display error message
      setMessage(error.response?.data?.message || "Error during registration.");
      setMessageType("error");
    }
  };

  return (
    <div className="box">
      <h1>Register</h1>
      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <select name="accountType" value={formData.accountType} onChange={handleChange}>
        <option value="Admin">Admin</option>
        <option value="Student">Student</option>
      </select>
      <button onClick={handleRegister}>Submit</button>
      <button className="back-btn" onClick={() => navigate("/")}>Back</button>
    </div>
  );
};

export default Register;
