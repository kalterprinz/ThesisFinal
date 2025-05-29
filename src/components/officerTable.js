import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import axios from "axios";
import Papa from "papaparse";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort, faPen, faTrashCan, faUserPlus, faXmark,
  faFloppyDisk, faChevronLeft, faChevronRight, faRectangleList,
  faMagnifyingGlass, faArrowUpZA, faArrowUpAZ, faUpload
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar';
import OfficerHeader from './OfficerHeader';
import AdminMap from './AdminMap';
import Matrix from './matrix';
import "./all.css";
import "./officerTable.css";

const OfficerTable = () => {
  const [officers, setOfficers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [idnum, setIDNum] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [conNum, setConNum] = useState("");
  const [email, setEmail] = useState("");
  const [agency, setAgency] = useState("");
  const [assign, setAssign] = useState("");
  const [password, setPassword] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [alivetab, setalivetab] = useState(1);

  const navigate = useNavigate();
  
  useEffect(() => {
      const checkAuthentication = async () => {
        const driverId = localStorage.getItem('driverId');
  
        if (driverId) {
          // Check if driverId exists in the drivers' database
          const driverResponse = await fetch(`http://localhost:3001/getDriverById2/${driverId}`);
          if (driverResponse.ok) {
              console.log(`Driver found with id ${driverId}.`);
              navigate('/');
            return;
          }
  
          // If not found in drivers, check in officers' database
          const officerResponse = await fetch(`http://localhost:3001/getOfficerById/${driverId}`);
          if (officerResponse.ok) {
            const officerData = await officerResponse.json();
            // Navigate based on officer's role
            if (officerData.role === 'Admin') {
              console.log(`Admin found with id ${driverId}.`);
              
            } else if (officerData.role === 'Officer') {
              console.log(`Officer found with id ${driverId}.`);
              navigate('/officerDashboard');
            } else if (officerData.role === 'Treasurer') {
              console.log(`Treasurer found with id ${driverId}.`);
              navigate('/treasurerdashboard');
            } else {
              // Role not recognized; remove driverId and navigate to home
              localStorage.removeItem('driverId');
              navigate('/');
            }
            return;
          }
        }
  
        // If driverId is not found in either database
        localStorage.removeItem('driverId');
        navigate('/');
      };
  
      checkAuthentication();
    }, [navigate]);

  // For CSV upload
  const [selectedFile, setSelectedFile] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const [Adagency, setAdAgency] = useState("");

  // 1. Fetch officers from local Mongo backend
  const fetchData = async () => {
    try {
      const driverId = localStorage.getItem("driverId");
      if (!driverId) return;
  
      // Get admin info
      const adminRes = await axios.get(`http://localhost:3001/getOfficerById/${driverId}`);
      const agency = adminRes.data.agency;
      setAdAgency(adminRes.data.agency); 
      // Get officers from the same agency
      const officersRes = await axios.get("http://localhost:3001/getOfficer");
      const filtered = officersRes.data.filter(officer => officer.agency === agency);
      setOfficers(filtered);
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };
  
  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (alivetab === 1) {
      fetchData();
    }
  }, [alivetab]);
  

  // 2. Delete an officer
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/deleteOfficer/${id}`);
      setOfficers((prevOfficers) => prevOfficers.filter((record) => record._id !== id));
      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  // 3. Add an officer (using multipart/form-data)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("idnum", idnum);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("conNum", conNum);
      formData.append("email", email);
      formData.append("agency", Adagency);
      formData.append("assign", assign ? assign : "Abuno");
      const dutyStatus = "Off Duty";
      formData.append("dutyStatus", dutyStatus);
      formData.append("password", password);

      const role = agency === "CityTreasurer" ? "Treasurer" : "Officer";
      formData.append("role", role);

      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post("http://localhost:3001/addOfficer", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response from server:", response.data);

      if (response.status === 201) {
        alert("Officer added successfully!");
        closeModal();
        // Refresh the list
        fetchData();
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting info:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Error submitting info. Please check your input.");
    }
  };


  // 4. Edit (not fully implemented - you’d need a separate route or re-use /addOfficer with an ID)
  const handleEdit = (record) => {
    setIDNum(record.idnum || "");
  setName(record.name || "");
  setAge(record.age || "");
  setGender(record.gender || "");
  setConNum(record.conNum || "");
  setEmail(record.email || "");
  setAgency(record.agency || "");
  setAssign(record.assign || "");
  setPassword(""); // Clear password for security
  setSelectedData(record);
  setIsModalOpen(true);
  
    setSelectedData(record); // Fix: Set the correct selected officer
    setIsModalOpen(true);
  };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
  
    if (!selectedData?._id) {
      alert("Error: No officer selected for update.");
      return;
    }
  
    // Construct the updated officer data from individual state variables
    const updatedData = {
      idnum,
      name,
      age,
      gender,
      conNum,
      email,
      agency,
      assign,
      password, // Ensure password handling is correct
    };
  
    try {
      const response = await axios.put(
        `http://localhost:3001/editOfficer/${selectedData._id}`,
        updatedData, // Sending the updated form data
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        fetchData(); // Fetch latest data and update the table
        setIsModalOpen(false);
        setSelectedData(null);
  
      } else {
        throw new Error("Failed to update record");
      }
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record.");
    }
  };
  
  // Modal open/close
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
    setIDNum("");
    setName("");
    setAge("");
    setGender("");
    setConNum("");
    setEmail("");
    setAgency("");
    setAssign("");
    setPassword("");
  };

  // Search filter
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredOfficers = officers.filter((officer) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
  
    // Convert idnum to a string before calling toLowerCase()
    const idnumString = String(officer.idnum || "");
    const nameString = officer.name?.toLowerCase() || "";
    const assignString = officer.assign?.toLowerCase() || "";
    const agencyString = officer.agency?.toLowerCase() || "";
  
    return (
      idnumString.toLowerCase().includes(lowerCaseQuery) ||
      nameString.includes(lowerCaseQuery) ||
      assignString.includes(lowerCaseQuery) ||
      agencyString.includes(lowerCaseQuery)
    );
  });

  // Sorting
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedOfficers = [...filteredOfficers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedOfficers.length / itemsPerPage);
  const paginatedData = sortedOfficers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

  // Duty button toggle
  const [dutyToggle, setDutyToggle] = useState({});


  const toggleDuty = async (id) => {
    // Find the current officer in the state to know their current status.
    const officer = officers.find((o) => o._id === id);
    if (!officer) return;
  
    // Determine the new status based on the current one.
    const newStatus = officer.dutyStatus === "On Duty" ? "Off Duty" : "On Duty";
  
    try {
      // Send a PUT request to update the duty status.
      const response = await axios.put(`http://localhost:3001/updateOfficerDutyStatus/${id}`, {
        dutyStatus: newStatus,
      });
  
      // Update the local state with the updated officer data.
      if (response.data.officer) {
        setOfficers((prevOfficers) =>
          prevOfficers.map((o) => (o._id === id ? response.data.officer : o))
        );
      }
    } catch (error) {
      console.error("Error updating duty status:", error.response?.data || error.message);
      alert("Error updating duty status.");
    }
  };
  

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <OfficerHeader isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="main-section1"><br/>

        {/* Tab Headers */}
        <div className="tabs">
          <button
            className={alivetab === 1 ? "active-tab" : ""}
            onClick={() => setalivetab(1)}>
              Officer Table
          </button>
          <button
            className={alivetab === 2 ? "active-tab" : ""}
            onClick={() => setalivetab(2)}>
              Matrix
          </button>
          <button
            className={alivetab === 3 ? "active-tab" : ""}
            onClick={() => setalivetab(3)} >
              Map
          </button>
        </div>

        <div> 
          {/* Tab Content 1 */}
          <div>
            {alivetab === 1 && 
              <div>
                <div className="records-oftable">
                  <div className="records-header">
                    <h3 className="recorh2">
                      <FontAwesomeIcon icon={faRectangleList} style={{ marginRight: "10px" }} />
                      Officer Records
                      <div className="search-bar">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="search"
                        />
                        <FontAwesomeIcon
                          icon={faMagnifyingGlass}
                          style={{ marginLeft: "-50px", marginTop: "30px" }}
                        />
                      </div>
                    </h3>

                    <button onClick={() => handleSort('idnum')} className="adddata1">
                      {sortConfig.key === "idnum" && sortConfig.direction === "ascending" ? (
                        <FontAwesomeIcon icon={faArrowUpZA} style={{ color: "#fff", marginRight: "10px" }} />
                      ) : (
                        <FontAwesomeIcon icon={faArrowUpAZ} style={{ color: "#fff", marginRight: "10px" }} />
                      )}
                      Filter
                    </button>

                    <button onClick={openModal} className="adddata">
                      <FontAwesomeIcon icon={faUserPlus} style={{ color: "#ffffff", marginRight: "10px" }} />
                      Add Officer
                    </button>
                  </div>

                  <table className="records-officerrec" tyle={{ tableLayout: "fixed", width: "100%" }}>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort("idnum")}>
                          Id No <FontAwesomeIcon icon={faSort} />
                        </th>
                        <th onClick={() => handleSort("name")}>
                          Name <FontAwesomeIcon icon={faSort} />
                        </th>
                        <th onClick={() => handleSort("gender")}>
                          Gender <FontAwesomeIcon icon={faSort} />
                        </th>
                        <th onClick={() => handleSort("age")}>
                          Age <FontAwesomeIcon icon={faSort} />
                        </th>
                        <th>Contact Number</th>
                        <th>Email</th>
                        <th>Agency</th>
                        <th>Place Assign</th>
                        <th>On/Off Duty</th>
                        <th style={{ width: "30px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((record) => (
                        <tr key={record._id}>
                          <td>{record.idnum}</td>
                          <td>{record.name}</td>
                          <td>{record.gender}</td>
                          <td>{record.age}</td>
                          <td>{record.conNum}</td>
                          <td>{record.email}</td>
                          <td>{record.agency}</td>
                          <td>{record.assign}</td>
                          <td>
                          
                          <button
                              className="duty-button"
                              style={{
                                backgroundColor: record.dutyStatus === "On Duty" ? "green" : "gray",
                                transition: "background-color 0.2s ease-in-out",
                              }}
                              onClick={() => toggleDuty(record._id)}
                            >
                              {record.dutyStatus === "On Duty" ? "On Duty" : "Off Duty"}
                            </button>
                          </td>
                          <td>
                            <div className="buttonsofrec">
                              <button className="edit-button" onClick={() => handleEdit(record)}>
                                <FontAwesomeIcon icon={faPen} style={{ color: "#fff" }} />
                              </button>
                              <button className="delete-button" onClick={() => handleDelete(record._id)}>
                                <FontAwesomeIcon icon={faTrashCan} style={{ color: "#fff" }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>                  
                </div>
                {/* Pagination Controls */}
                <div className="pagination-controls">
                    <button onClick={goToPreviousPage} disabled={currentPage === 1}>
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        className={currentPage === index + 1 ? "active" : ""}
                        onClick={() => handlePageClick(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                      Next
                    </button>
                  </div>
              </div>
            }  
           {/* Tab Content 2 */}
           {alivetab === 2 && 
              <div>  
                  <Matrix/>
              </div>
            }

            {/* Tab Content 3 */}
            {alivetab === 3 && 
              <div className="admminmapdes">  
                  <AdminMap/>
              </div>
              }
          </div>
        </div>

        {/* Modal for Add/Edit Officer */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="modal-contentovr"
          overlayClassName="overlayovr1"
        >
          <h2>
            <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: "10px" }} />
            {selectedData ? "Edit Record" : "Add Officer"}
          </h2>
          <form onSubmit={handleSubmit}>
            <label>Id No <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              value={idnum}
              onChange={(e) => setIDNum(e.target.value)}
              required
            />

            <label>Name <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="name"
              placeholder="Enter Full Name"
              className="input-fieldsign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="form-rowof">
              <div className="form-groupof">
                <label>Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  
                />
              </div>
              <div className="form-groupof">
                <label>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <label>Contact Number <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              required
              value={conNum}
              onChange={(e) => setConNum(e.target.value)}
            />

            <label>Email <span style={{ color: 'red' }}>*</span> </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* <label>Agency</label>
            <select value={agency} onChange={(e) => setAgency(e.target.value)} required>
              <option value="" disabled>Select Agency</option>
              <option value="LTO">LTO</option>
              <option value="ICTPMO">ICTPMO</option>
              <option value="PNP">PNP</option>
              <option value="CityTreasurer">City Treasurer</option>
            </select> */}

            <label>Place Assign <span style={{ color: 'red' }}>*</span></label>
            <select value={assign} onChange={(e) => setAssign(e.target.value)} required>
              <option value="" disabled>Select Place Assign</option>
              <option value="ABUNO">ABUNO</option>
                    <option value="ACMAC-MARIANO BADELLES SR.">ACMAC-MARIANO BADELLES SR.</option>
                    <option value="BAGONG SILANG">BAGONG SILANG</option>
                    <option value="BONBONON">BONBONON</option>
                    <option value="BUNAWAN">BUNAWAN</option>
                    <option value="BURU-UN">BURU-UN</option>
                    <option value="DALIPUGA">DALIPUGA</option>
                    <option value="DEL CARMEN">DEL CARMEN</option>
                    <option value="DIGKILAAN">DIGKILAAN</option>
                    <option value="DITUCALAN">DITUCALAN</option>
                    <option value="DULAG">DULAG</option>
                    <option value="HINAPLANON">HINAPLANON</option>
                    <option value="HINDANG">HINDANG</option>
                    <option value="KABACSANAN">KABACSANAN</option>
                    <option value="KALILANGAN">KALILANGAN</option>
                    <option value="KIWALAN">KIWALAN</option>
                    <option value="LANIPAO">LANIPAO</option>
                    <option value="LUINAB">LUINAB</option>
                    <option value="MAHAYAHAY">MAHAYAHAY</option>
                    <option value="MAINIT">MAINIT</option>
                    <option value="MANDULOG">MANDULOG</option>
                    <option value="MARIA CRISTINA">MARIA CRISTINA</option>
                    <option value="PALAO">PALAO</option>
                    <option value="PANOROGANAN">PANOROGANAN</option>
                    <option value="POBLACION">POBLACION</option>
                    <option value="PUGA-AN">PUGA-AN</option>
                    <option value="ROGONGON">ROGONGON</option>
                    <option value="SAN MIGUEL">SAN MIGUEL</option>
                    <option value="SAN ROQUE">SAN ROQUE</option>
                    <option value="SANTA ELENA">SANTA ELENA</option>
                    <option value="SANTA FILOMENA">SANTA FILOMENA</option>
                    <option value="SANTIAGO">SANTIAGO</option>
                    <option value="SANTO ROSARIO">SANTO ROSARIO</option>
                    <option value="SARAY">SARAY</option>
                    <option value="SUAREZ">SUAREZ</option>
                    <option value="TAMBACAN">TAMBACAN</option>
                    <option value="TIBANGA">TIBANGA</option>
                    <option value="TIPANOY">TIPANOY</option>
                    <option value="TOMAS CABILI">TOMAS CABILI</option>
                    <option value="TUBOD">TUBOD</option>
                    <option value="UBALDO LAYA">UBALDO LAYA</option>
                    <option value="UPPER HINAPLANON">UPPER HINAPLANON</option>
                    <option value="UPPER TOMINOBO">UPPER TOMINOBO</option>
                    <option value="VILLA VERDE">VILLA VERDE</option>
            </select>
            {!selectedData && (
              <>
                <label>Password</label>
                <input
                  type="text"
                  name="password"
                  placeholder="Enter Password"
                  className="input-fieldsign"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </>
            )}



            <div className="modal-buttons">
                {selectedData ? (
                  <button type="submit" onClick={handleUpdate} className="submit-button">Update Officer Record 
                    <FontAwesomeIcon icon={faFloppyDisk} style={{color: "#ffffff", marginLeft:"10"}} /> 
                  </button>
                ) : (
                  <button type="submit" onClick={handleSubmit} className="submit-button">Add Officer Record
                      <FontAwesomeIcon icon={faUserPlus} style={{color: "#ffffff", marginLeft:"10"}} />
                  </button>
                )}
              <button type="button" className="close-modal-btn" onClick={closeModal}>Cancel <FontAwesomeIcon icon={faXmark} style={{color: "#ffffff", marginLeft:"10"}} /> </button>
            </div>
            
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default OfficerTable;
