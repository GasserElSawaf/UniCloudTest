// src/components/AdminDashboard.js

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
  const [editingRegistrationId, setEditingRegistrationId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Retrieve JWT from localStorage
  const jwtToken = localStorage.getItem("jwtToken");

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
      const response = await axios.get('http://localhost:5000/registrations', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      setRegistrations(response.data.registrations);
      setShowRegistrations(true);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError(err.response?.data?.message || "Failed to fetch registrations.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniversityInfo = async () => {
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/university-info');
      setUniversityInfo(response.data.info);
      setShowUniversityInfo(true);
    } catch (err) {
      console.error("Error fetching university info:", err);
      setError("Failed to load university info.");
    }
  };

  const handleToggleRegistrations = async () => {
    if (!showRegistrations) {
      await fetchRegistrations();
    } else {
      setShowRegistrations(false);
    }
    setShowUniversityInfo(false);
  };

  const handleToggleUniversityInfo = async () => {
    if (!showUniversityInfo) {
      await fetchUniversityInfo();
    } else {
      setShowUniversityInfo(false);
    }
    setShowRegistrations(false);
  };

  const handleLogout = () => {
    // Clear JWT and other stored data
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accountType');
    navigate('/login');
    window.location.reload();
  };

  // Handle Edit Button Click
  const handleEditClick = (registration) => {
    setEditingRegistrationId(registration._id);
    setEditFormData({ ...registration });
  };

  // Handle form field changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission for editing
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Send PUT request to update the registration
      await axios.put(`http://localhost:5000/registrations/${editingRegistrationId}`, editFormData, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      // Update the local state
      setRegistrations(prevRegs => prevRegs.map(reg => reg._id === editingRegistrationId ? editFormData : reg));
      setEditingRegistrationId(null);
      setEditFormData({});
      alert("Registration updated successfully.");
    } catch (err) {
      console.error("Error updating registration:", err);
      setError(err.response?.data?.message || "Failed to update registration.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Cancel Editing
  const handleCancelEdit = () => {
    setEditingRegistrationId(null);
    setEditFormData({});
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
          {isLoading && showRegistrations ? "Hiding Registrations..." : showRegistrations ? "Hide Registered Students" : "View All Registered Students"}
        </button>
        <button
          onClick={handleToggleUniversityInfo}
          className="info-btn"
        >
          {showUniversityInfo ? "Hide University Info" : "University Info"}
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
                  <th>Actions</th> {/* New Column for Actions */}
                </tr>
              </thead>
              <tbody>
                {registrations.map((student) => (
                  <tr key={student._id}>
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
                    <td>
                      <button onClick={() => handleEditClick(student)} className="edit-btn">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingRegistrationId && (
        <div className="edit-form">
          <h2>Edit Registration</h2>
          <form onSubmit={handleEditFormSubmit}>
            <input
              type="text"
              name="Student Full Name"
              placeholder="Student Full Name"
              value={editFormData['Student Full Name'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="Date of Birth"
              placeholder="Date of Birth (DD-MM-YYYY)"
              value={editFormData['Date of Birth'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <select
              name="Gender"
              value={editFormData['Gender'] || ''}
              onChange={handleEditFormChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="text"
              name="Nationality"
              placeholder="Nationality"
              value={editFormData['Nationality'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="National ID"
              placeholder="National ID"
              value={editFormData['National ID'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="Mobile Number"
              placeholder="Mobile Number"
              value={editFormData['Mobile Number'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="email"
              name="Email Address"
              placeholder="Email Address"
              value={editFormData['Email Address'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="Parent/Guardian Name"
              placeholder="Parent/Guardian Name"
              value={editFormData['Parent/Guardian Name'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="Parent/Guardian Contact Number"
              placeholder="Parent/Guardian Contact Number"
              value={editFormData['Parent/Guardian Contact Number'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="email"
              name="Parent/Guardian Email Address"
              placeholder="Parent/Guardian Email Address"
              value={editFormData['Parent/Guardian Email Address'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="High School Name"
              placeholder="High School Name"
              value={editFormData['High School Name'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="Graduation Year"
              placeholder="Graduation Year"
              value={editFormData['Graduation Year'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="GPA"
              placeholder="GPA"
              value={editFormData['GPA'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="text"
              name="Preferred Major/Program"
              placeholder="Preferred Major/Program"
              value={editFormData['Preferred Major/Program'] || ''}
              onChange={handleEditFormChange}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </button>
            <button type="button" className="back-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
          </form>
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
