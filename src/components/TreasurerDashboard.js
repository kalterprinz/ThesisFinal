import React, { useState, useEffect, useCallback, useRef  } from "react";
import { useNavigate } from "react-router-dom"; 
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import {Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend,RadialLinearScale } from 'chart.js';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import axios from "axios";
import "./all2.css";
import "leaflet/dist/leaflet.css";
import './LandingPage.css';
import './DriverDash.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faArrowUpZA, faCab, faXmark, faFilter,faEllipsisH, faHouse, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus, faAdd, faMoneyBill, faMoneyBill1, faMoneyBill1Wave, faCertificate, faDownload } from '@fortawesome/free-solid-svg-icons';
import iciT from './iciT.png';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import emailjs from '@emailjs/browser';
// Register chart components

//kirk selwyn miguel fuentevilla ycong
//normailah macala
//cate melody dalis

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    RadialLinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
  );
const TreasurerDashboard = () => {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

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
            navigate('/adminDashboard');
          } else if (officerData.role === 'Officer') {
            console.log(`Officer found with id ${driverId}.`);
            navigate('/officerDashboard');
          } else if (officerData.role === 'Treasurer') {
            console.log(`Treasurer found with id ${driverId}.`);
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
  

  const fetchRecords = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3001/getRecords");
      if (response.signature && response.signature.data) {
        
      }
      if (Array.isArray(response.data)) {
        setRecords(response.data);  // Reverse order here
      } else {
        console.error("Data is not an array");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords])

  const [selectedData, setSelectedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]); 
// Main fetch function
const fetchData = async () => {
  try {
    const response = await axios.get("http://localhost:3001/getRecords"); // ✅ Fetch records from MongoDB
    const dataList = response.data;

    console.log("Fetched data:", response.data);
    setRecords(dataList);
    setFilteredData(dataList);
    if (dataList.signature && dataList.signature.data) {
      
    }
    console.log("Records after set:", dataList); 
    // Fetch additional data
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

useEffect(() => {
  fetchData();
}, []);

//search
const [searchQuery, setSearchQuery] = useState("");
const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
const [currentPage, setCurrentPage] = useState(1);
const recordsPerPage = 10;

useEffect(() => {
  const filtered = (records || []).filter((rec) => {
    return (
      (rec.ticketNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (rec.nameOfDriver?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (rec.vehicleOwnerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (rec.placeOfViolation?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (rec.violationType?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (rec.apprehendingOfficer?.toLowerCase() || "").includes(searchQuery.toLowerCase())||
      (rec.fineStatus?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
  });
  setFilteredData(filtered);
}, [searchQuery, records]);

const handleSort = (key) => {
  let direction = 'ascending';
  if (sortConfig.key === key && sortConfig.direction === 'ascending') {
    direction = 'descending';
  }
  setSortConfig({ key, direction });
};

useEffect(() => {
  if (sortConfig.key) {
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setFilteredData(sortedData);
  }
}, [sortConfig, filteredData]);

// Helper: Determines if a record is overdue (non-paid and dueDate passed)
const isRecordOverdue = (record) => {
  if (record.fineStatus === "Paid" || !record.dueDate) return false;
  const now = new Date();
  const due = new Date(record.dueDate);
  return due <= now;
};

// Compute final sorted records
const finalSortedRecords = [...filteredData]
  // Sort all records, pushing overdue ones to the top
  .sort((a, b) => {
    const aIsOverdue = isRecordOverdue(a);
    const bIsOverdue = isRecordOverdue(b);

    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;

    // Apply additional sort config if defined
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "ascending" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "ascending" ? 1 : -1;
    }

    return 0;
  });

const totalPages = Math.ceil(finalSortedRecords.length / recordsPerPage);

// Helper: Generate an array of page numbers to display (always 7 numbers if possible)
const getPageNumbers = () => {
const pages = [];
  if (totalPages <= 7) {
    // Fewer than or equal to 7 pages: show them all
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always include page 1 and the last page
    pages.push(1);
    
    // If currentPage is near the start, display pages 2-6
    if (currentPage <= 4) {
      pages.push(2, 3, 4, 5, 6);
    }
    // If currentPage is near the end, display the last 5 pages before the final page
    else if (currentPage >= totalPages - 3) {
      pages.push(
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1
      );
    }
    // Otherwise, center the current page with two before and two after
    else {
      pages.push(
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2
      );
    }
    pages.push(totalPages);
  }
  return pages;
  };

  const pageNumbers = getPageNumbers();
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = finalSortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
};

const goToNextPage = () => {
  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
};

const handlePageClick = (pageNumber) => {
  setCurrentPage(pageNumber);
};

// Handle search input change
const handleSearchChange = (event) => {
  setSearchQuery(event.target.value);
  setCurrentPage(1); // Reset to first page when searching
};

  const [rowsPerPage] = useState(8);
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const filteredRecords = records.filter((record) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      record.ticketNumber.toString().toLowerCase().includes(lowerCaseQuery) ||
      record.nameOfDriver.toLowerCase().includes(lowerCaseQuery) ||
      record.vehicleOwnerName.toLowerCase().includes(lowerCaseQuery) ||
      record.placeOfViolation.toLowerCase().includes(lowerCaseQuery) ||
      record.violationType.toLowerCase().includes(lowerCaseQuery) ||
      record.apprehendingOfficer.toLowerCase().includes(lowerCaseQuery) ||
      record.fineStatus.toLowerCase().includes(lowerCaseQuery)
    );
  });

  // Sort the filtered records dynamically
const sortedRecords = [...filteredRecords].sort((a, b) => {
  if (!sortConfig.key) return 0; // No sorting if no key is selected
  if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1;
  if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1;
  return 0;
});


  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPageData = filteredData.slice(indexOfFirstRow, indexOfLastRow);



useEffect(()=> {
  setFilteredData(records);
},[records]);

useEffect(() => {
  const lowerCaseQuery = searchQuery.toLowerCase();

  // Filter records based on the search query
  const filtered = records.filter((record) => {
    return (
      record.ticketNumber.toString().toLowerCase().includes(lowerCaseQuery) ||
      record.nameOfDriver.toLowerCase().includes(lowerCaseQuery) ||
      record.vehicleOwnerName.toLowerCase().includes(lowerCaseQuery) ||
      record.placeOfViolation.toLowerCase().includes(lowerCaseQuery) ||
      record.violationType.toLowerCase().includes(lowerCaseQuery) ||
      record.apprehendingOfficer.toLowerCase().includes(lowerCaseQuery) ||
      record.fineStatus.toLowerCase().includes(lowerCaseQuery)
    );
  });

  setFilteredData(filtered);
  setCurrentPage(1); // Reset to the first page when filtering
}, [searchQuery, records]);

useEffect(() => {
  if (sortConfig.key) {
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    setFilteredData(sortedData);
  }
}, [sortConfig, filteredData]);
  
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("driverId");
  navigate("/login");  // Redirect to login page after logout
};
  
return (
    <div className="landing-page">
        {/* Header */}
        <header className="headerdriver">
          <div className="logoheader">
            <img src={iciT} alt="Logo" />
          </div>
          <h4 className="title">ILIGAN CITATION TICKET ONLINE</h4>
          <nav className="nav" style={{fontSize:"14px"}}>
          <a href="/">Dashboard<FontAwesomeIcon icon={faHouse} style={{marginLeft:"5"}}  /></a>
            | <button className="logoutBtn" onClick={handleLogout}>
            Logout
            </button>
          </nav>
        </header>
        <br/><br/>

        {/* Records Section */}
        <div className="page-headerDf" style={{marginTop:"60px"}}>
            <h2 style={{color:"#2b4450", fontSize:"20px", borderBottomStyle:"solid", margin:"30px 90px", borderBottomColor:"#2b4450"}}><FontAwesomeIcon icon={faRectangleList} style={{ marginRight: "20px" , marginLeft: "5px" }} />Transaction Table</h2>
        </div>
        <section id="Records" className="Records">
          <div className="records-contentTre">
                <div className="records-header" style={{marginTop:"-23px"}}>
                  <h3 className="recorh2">
                  <div className="search-bar">
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search" /> <FontAwesomeIcon icon={faMagnifyingGlass} style={{marginLeft:"-50", marginTop:"30"}} />
                  </div>
                  </h3>
                  <button onClick={() => handleSort('ticketNumber')} className="adddata1t">
                    {sortConfig.key === "ticketNumber" && sortConfig.direction === "ascending" ? (
                      <FontAwesomeIcon icon={faArrowUpZA} style={{ color: "#fff", marginRight: "10px" }} />
                    ) : (
                      <FontAwesomeIcon icon={faArrowUpAZ} style={{ color: "#fff", marginRight: "10px" }} />
                    )}
                    Filter
                  </button>
                </div>

                <div  className="records-officer"  style={{overflow:"auto"}}>
                <table style={{ tableLayout: "fixed", width: "100%" }}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('ticketNumber')}>Ticket No.</th>
                             <th style={{ width: "80px" }}  onClick={() => handleSort('dateOfApprehension')}>Date of Apprehension</th>
                            <th onClick={() => handleSort('nameOfDriver')}>Driver's Name</th>
                            <th style={{ width: "80px" }} >Address</th>
                            <th style={{ width: "80px" }} >License No.</th>
                           <th style={{ width: "80px" }} >Owner's Name</th>
                           <th style={{ width: "80px" }} >Owner's Address</th>
                            <th style={{ width: "120px" }}>Violation Type</th>
                            <th style={{ width: "100px" }}>Apprehending Officer</th>
                            <th style={{ width: "40px" }} >Fine Amount</th>
                            <th style={{ width: "50px" }} >Fine Status</th>
     
                          </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                          <tr>
                            <td colSpan="11" className="norecord">
                              <p>Loading records...</p></td>
                          </tr>
                        ) : currentRecords.length > 0 ? (
                          currentRecords.map((records) => (
                            <tr key={records?._id} className={records?.fineStatus === 'Unpaid' ? 'unpaid-row' : records?.fineStatus === 'Paid' ? 'paid-row' : ''}>
                              <td>{records?.ticketNumber}</td>
                              <td>{records?.dateOfApprehension ? records.dateOfApprehension.split("T")[0] : "N/A"}</td>
                              <td>{records?.nameOfDriver}</td>
                              <td>{records?.address}</td>
                              <td>{records?.licenseNumber}</td>
                              <td>{records?.vehicleOwnerName}</td>
                              <td>{records?.vehicleOwnerAddress}</td>
                              <td>{records?.violationType}</td>
                              <td>{records?.apprehendingOfficer}</td>
                              <td>{records?.fineAmount}</td>
                              <td>{records?.fineStatus}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="11" className="norecord">
                              <p>No records to display</p>
                            </td>
                          </tr>
                        )}
                    </tbody>

                  </table>

                </div>
                </div>

                <div className="pagination">
                  <button onClick={goToPreviousPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  
                  {pageNumbers.map((page, index) => (
                    <button
                      key={index}
                      className={currentPage === page ? "active" : ""}
                      onClick={() => handlePageClick(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
               
            
          
        </section>
    </div>
  );
};

export default TreasurerDashboard;
