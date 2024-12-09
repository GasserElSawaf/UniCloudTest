import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [showUniversityInfo, setShowUniversityInfo] = useState(false);
  const [universityInfo, setUniversityInfo] = useState("");

  useEffect(() => {
    const accountType = localStorage.getItem('accountType');
    if (accountType !== 'Admin') {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/registrations');
      setRegistrations(response.data.registrations);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError("Failed to fetch registrations.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniversityInfo = async () => {
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/university-info');
      setUniversityInfo(response.data.info);
    } catch (err) {
      console.error("Error fetching university info:", err);
      setError("Failed to load university info.");
    }
  };

  const handleToggleRegistrations = async () => {
    if (!showRegistrations) {
      await fetchRegistrations();
    }
    setShowRegistrations(!showRegistrations);
    setShowUniversityInfo(false);
  };

  const handleToggleUniversityInfo = async () => {
    if (!showUniversityInfo) {
      await fetchUniversityInfo();
    }
    setShowUniversityInfo(!showUniversityInfo);
    setShowRegistrations(false);
  };

  const handleLogout = () => {
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout} className="logout-btn">Logout</button>

      <div className="fetch-section">
        <button
          onClick={handleToggleRegistrations}
          disabled={isLoading}
          className="fetch-btn"
        >
          {isLoading ? "Fetching Registrations..." : "View All Registered Students"}
        </button>
        <button
          onClick={handleToggleUniversityInfo}
          className="info-btn"
        >
          University Info
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showRegistrations && registrations.length > 0 && (
        <div className="registrations-list">
          <h2>Registered Students</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Nationality</th>
                  <th>National ID</th>
                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>Parent/Guardian Name</th>
                  <th>Parent/Guardian Contact</th>
                  <th>Parent/Guardian Email</th>
                  <th>High School</th>
                  <th>Graduation Year</th>
                  <th>GPA</th>
                  <th>Preferred Major</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((student, index) => (
                  <tr key={index}>
                    <td>{student['Student Full Name']}</td>
                    <td>{student['Date of Birth']}</td>
                    <td>{student['Gender']}</td>
                    <td>{student['Nationality']}</td>
                    <td>{student['National ID']}</td>
                    <td>{student['Mobile Number']}</td>
                    <td>{student['Email Address']}</td>
                    <td>{student['Parent/Guardian Name']}</td>
                    <td>{student['Parent/Guardian Contact Number']}</td>
                    <td>{student['Parent/Guardian Email Address']}</td>
                    <td>{student['High School Name']}</td>
                    <td>{student['Graduation Year']}</td>
                    <td>{student['GPA']}</td>
                    <td>{student['Preferred Major/Program']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showUniversityInfo && (
        <div className="university-info">
          <h2>University Information</h2>
          <pre>{universityInfo}</pre>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
