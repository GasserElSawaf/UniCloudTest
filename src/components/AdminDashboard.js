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
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  const accountType = localStorage.getItem('accountType');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (accountType !== 'Admin') {
      navigate('/login');
    }
  }, [navigate, accountType]);

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/registrations', authHeaders);
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
      const response = await axios.get('http://localhost:5000/university-info', authHeaders);
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
    localStorage.removeItem('token');
    localStorage.removeItem('accountType');
    localStorage.setItem('isLoggedIn', 'false');
    navigate('/login');
    window.location.reload();
  };

  const handleEdit = (student) => {
    setEditingStudentId(student._id);
    setEditedData({ ...student });
  };

  const handleEditChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/registrations/${editingStudentId}`, editedData, authHeaders);
      // Update the local list
      setRegistrations((prev) =>
        prev.map((reg) => (reg._id === editingStudentId ? editedData : reg))
      );
      setEditingStudentId(null);
    } catch (err) {
      console.error("Error updating registration:", err);
      alert("Failed to update registration.");
    }
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setEditedData({});
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((student) => {
                  const isEditing = editingStudentId === student._id;
                  return (
                    <tr key={student._id}>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Student Full Name"]}
                            onChange={(e) => handleEditChange("Student Full Name", e.target.value)}
                          />
                        ) : (
                          student["Student Full Name"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Date of Birth"]}
                            onChange={(e) => handleEditChange("Date of Birth", e.target.value)}
                          />
                        ) : (
                          student["Date of Birth"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Gender"]}
                            onChange={(e) => handleEditChange("Gender", e.target.value)}
                          />
                        ) : (
                          student["Gender"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Nationality"]}
                            onChange={(e) => handleEditChange("Nationality", e.target.value)}
                          />
                        ) : (
                          student["Nationality"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["National ID"]}
                            onChange={(e) => handleEditChange("National ID", e.target.value)}
                          />
                        ) : (
                          student["National ID"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Mobile Number"]}
                            onChange={(e) => handleEditChange("Mobile Number", e.target.value)}
                          />
                        ) : (
                          student["Mobile Number"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Email Address"]}
                            onChange={(e) => handleEditChange("Email Address", e.target.value)}
                          />
                        ) : (
                          student["Email Address"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Parent/Guardian Name"]}
                            onChange={(e) => handleEditChange("Parent/Guardian Name", e.target.value)}
                          />
                        ) : (
                          student["Parent/Guardian Name"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Parent/Guardian Contact Number"]}
                            onChange={(e) => handleEditChange("Parent/Guardian Contact Number", e.target.value)}
                          />
                        ) : (
                          student["Parent/Guardian Contact Number"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Parent/Guardian Email Address"]}
                            onChange={(e) => handleEditChange("Parent/Guardian Email Address", e.target.value)}
                          />
                        ) : (
                          student["Parent/Guardian Email Address"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["High School Name"]}
                            onChange={(e) => handleEditChange("High School Name", e.target.value)}
                          />
                        ) : (
                          student["High School Name"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Graduation Year"]}
                            onChange={(e) => handleEditChange("Graduation Year", e.target.value)}
                          />
                        ) : (
                          student["Graduation Year"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["GPA"]}
                            onChange={(e) => handleEditChange("GPA", e.target.value)}
                          />
                        ) : (
                          student["GPA"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            value={editedData["Preferred Major/Program"]}
                            onChange={(e) => handleEditChange("Preferred Major/Program", e.target.value)}
                          />
                        ) : (
                          student["Preferred Major/Program"]
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <>
                            <button onClick={handleSave}>Save</button>
                            <button onClick={handleCancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => handleEdit(student)}>Edit</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
