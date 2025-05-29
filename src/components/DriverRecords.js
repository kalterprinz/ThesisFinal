import "./DriverDash.css";
import React, { useState, useEffect, useCallback, useRef  } from "react";
import axios from "axios";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from './firebase'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faCab, faFilter, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend } from 'chart.js';
import { faArrowUpZA } from "@fortawesome/free-solid-svg-icons/faArrowUpZA";
import { faSort } from "@fortawesome/free-solid-svg-icons/faSort";
import { faCircleDown } from "@fortawesome/free-solid-svg-icons/faCircleDown";
import { useNavigate } from "react-router-dom"; 
import html2canvas from "html2canvas";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const fineMapping = {
  ICTPMO: {
      "FAILURE TO CARRY OR/CR": 500,
      "EXPIRED OR/CR":1000,
      "NO LOADING/UNLOADING": 100,
      "OBSTRUCTION TO SIDEWALK": 500,
      "UNREGISTERED/DELINQUENT/SUSPENDED VEHICLE": 2000,
      "DRIVING WITHOUT DRIVER'S LICENSE": 1500,
      "EXPIRED DRIVER'S LICENSE":3000,
      "DRIVING UNDER THE INFLUENCE OF LIQUOR/DRUGS": 4000,
      "JAYWALKING": 300,
      "OVER SPEEDING": 1000,
      "NO HELMET/NON-WEARING OF CRASH HELMET": 500,
      "FAILURE TO OBEY TRAFFIC CONTROL DEVICE TRAFFIC LIGHTS/TRAFFIC ENFORCERS": 1000,
      "PARKING ON THE SIDEWALK": 500,
      "SMOKING INSIDE PUBLIC UTILITY VEHICLE": 1500,
      "WEARING OF SLIPPERS AND SANDO": 150,
      "DRIVING WITH INVALID/DELINQUENT DRIVER'S LICENSE": 3000,
      "INVALID/NO FRANCHISE (COLORUM)": 5000,
      "RECKLESS DRIVING": 2000,
      "CONTRACTING": 2000,
      "NO PLATE NUMBER": 2000,
      "TRIP CUTTING":500,
  },
};

const DriverRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("tab1");
  const [fineAmount, setFineAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const [formState, setFormState] = useState({
    ticketNumber: "",
    dateOfApprehension: "",
    timeOfApprehension: "",
    nameOfDriver: "",
    gender: "",
    age: "",
    vehicleClassification: "",
    placeOfViolation: "",
    violationType: [],
    recordSource: "",
    violationDes: "",
    fineStatus: "",
    apprehendingOfficer: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
    email: "",
    occupation: "",
    licenseNumber: "",
    expirationDate: "",
    licenseClassification: "",
    plateNumber: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    vehicleOwnerName: "",
    vehicleOwnerAddress: "",
    dueDate:"",
    });  

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);


    const openModal = (record) => {
      setSelectedRecord(record);
      setFormState({
        ...formState,
      });
      setSelectedData(null);
      setIsModalOpen(true);
    };
    const closeModal = () => {
      setSignature(null);
      setIsModalOpen(false);
      setShowModal(false);
      setFormState({  
        ticketNumber: "",
        dateOfApprehension: "",
        timeOfApprehension: "",
        nameOfDriver: "",
        gender: "",
        age: "",
        vehicleClassification: "",
        placeOfViolation: "",
        violationType: [],
        recordSource: "ICTPMO",
        violationDes: "",
        fineStatus: "",
        apprehendingOfficer: "",
        dateOfBirth: "",
        address: "",
        phoneNumber: "",
        email: "",
        occupation: "",
        licenseNumber: "",
        expirationDate: "",
        licenseClassification: "",
        plateNumber: "",
        vehicleModel: "",
        vehicleYear: "",
        vehicleColor: "",
        vehicleOwnerName: "",
        vehicleOwnerAddress: "",
      });
    };

  const fetchRecords = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3001/getRecords");
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
  }, [fetchRecords]);

 
  const [filteredData, setFilteredData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [driveremail, setDriveremail] = useState("");
  const [driverInfo, setDriverInfo] = useState(null);

  useEffect(() => {
    const fetchDriverData = async () => {
        try {
            const driverId = localStorage.getItem("driverId");
            if (!driverId) {
                console.warn("No driverId found in localStorage.");
                return;
            }
            console.log( driverId);
            const response = await axios.get(`http://localhost:3001/getDriver/${driverId}`);
            if (response.data) {
                setDriverInfo(response.data); 
                setDriveremail(response.data.email);
                console.log("Fetched Officer Name:", response.data.email); 
                
            }
        } catch (error) {
            console.error("Error fetching officer data:", error);
        }
    };

    fetchDriverData();
}, []);

// Main fetch function
const fetchData = async () => {
  try {
    const response = await axios.get("http://localhost:3001/getRecords"); // ✅ Fetch records from MongoDB
    const dataList = response.data;

    console.log("Fetched data:", response.data);
    setRecords(dataList);
    setFilteredData(dataList);
    console.log("Records after set:", dataList); 
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

useEffect(() => {
  fetchData();
}, []);

        //kirk selwyn miguel fuentevilla ycong
        //normailah macala
        //cate melody dalis
  
  //search
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    const filtered = (records || []).filter((rec) => {
      return (
        (rec.ticketNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (rec.nameOfDriver?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (rec.vehicleClassification?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (rec.placeOfViolation?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (rec.violationType?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (rec.apprehendingOfficer?.toLowerCase() || "").includes(searchQuery.toLowerCase())
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
  // Filter out records with fineStatus "Paid"
  .filter(record => record.email === driveremail)
  // Then sort the remaining records
  .sort((a, b) => {
    // Among non-paid records, overdue ones go to the top
    const aIsOverdue = isRecordOverdue(a);
    const bIsOverdue = isRecordOverdue(b);
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;
    
    // Apply any additional sort configuration if needed
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

  const [isFineManual, setIsFineManual] = useState(false);
  useEffect(() => {
    // Only auto-calculate if the user has not manually changed the value
    if (!isFineManual) {
      if (Array.isArray(formState.violationType) && formState.violationType.length > 0) {
        const totalFine = formState.violationType.reduce((sum, violation) => {
          const fine = fineMapping["ICTPMO"]?.[violation];
          let fineValue = 0;
          if (typeof fine === "string") {
            const matches = fine.match(/\d+/g);
            fineValue = matches ? parseInt(matches[0], 10) : 0;
          } else if (typeof fine === "number") {
            fineValue = fine;
          }
          return sum + fineValue;
        }, 0);
        console.log("Total Fine Calculated:", totalFine);
        setFineAmount(totalFine);
        setFormState((prevState) => ({
          ...prevState,
          fineAmount: totalFine,
        }));
      } else {
        console.log("No violations selected or missing record source");
        setFineAmount(0);
        setFormState((prevState) => ({
          ...prevState,
          fineAmount: 0,
        }));
      }
    }
  }, [formState.violationType, isFineManual]);
  
  const downloadReceipt = async () => {
    const receiptElement = document.getElementById("receipt-container");
 
    try {
      const canvas = await html2canvas(receiptElement, { scale: 2 });
      const dataURL = canvas.toDataURL("image/png");
 
      // Trigger download
      const link = document.createElement("a");
      link.download = `E-Receipt-${selectedRecord.ticketNumber}.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error("Error generating receipt:", error);
    }
  };

  const [signature, setSignature] = useState(null);
  
    useEffect(() => {
      const fetchSignature = async () => {
        try {
          const response = await fetch(`http://localhost:3001/getSignature/${selectedRecord._id}`);
          console.log("id value",selectedRecord._id)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
  
          if (data.signature && data.signature.data && data.signature.contentType) {
            setSignature(`data:${data.signature.contentType};base64,${data.signature.data}`);
          } else {
            console.error("Signature not found in the record.");
          }
        } catch (error) {
          console.error("Error fetching signature:", error);
        }
      };
  
      if (selectedRecord?._id) {
        fetchSignature();
      }
    }, [selectedRecord]);
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains("modal-overlay1")) {
        closeModal();
      }
    };

  return (
    <div>
      <section  className="RecordsDriver"> 
        <div  className="records-officer" style={{overflow:"auto"}}>
        <table  style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: "100px" }} onClick={() => handleSort('ticketNumber')}>Ticket Number <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th style={{ width: "100px" }} onClick={() => handleSort('dateOfApprehension')}>Date of Apprehension  <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th style={{ width: "100px" }}>Time of Apprehension</th>
                <th style={{ width: "100px" }} onClick={() => handleSort('vehicleClassification')}>Vehicle Type  <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th style={{ width: "100px" }}onClick={() => handleSort('placeOfViolation')}>Place of Violation <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th style={{ width: "150px" }}>Violation Type</th>
                <th style={{ width: "120px" }}>Violation Description</th>
                <th style={{ width: "100px" }} >Fine Amount</th>
                <th style={{ width: "100px" }} >Fine Status</th>
                <th onClick={() => handleSort('apprehendingOfficer')}>Apprehending Officer  <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th onClick={() => handleSort('apprehendingOfficer')}>Officer Agency  <FontAwesomeIcon icon={faSort} size="2xs" style={{ color: "#fff", marginLeft: "5px" }} /></th>
                <th style={{ width: "30px" }}></th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
                  <tr>
                    <td colSpan="12" className="norecord"><p>Loading records...</p></td>
                  </tr>
                ) : currentRecords.length > 0 ? (
                  currentRecords.map((records) => (
                    <tr key={records?._id}>
                    <td>{records.ticketNumber}</td>
                    <td>{new Date(records.dateOfApprehension).toISOString().split('T')[0]}</td>
                    <td>{new Date(records.timeOfApprehension).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</td>
                    <td>{records.vehicleClassification}</td>
                    <td>{records.placeOfViolation}</td>
                    <td>{records.violationType}</td>
                    <td>{records.violationDes}</td>
                    <td>₱{records.fineAmount}</td>
                    <td>{records.fineStatus}</td>
                    <td>{records.apprehendingOfficer}</td>
                    <td>{records.agency}</td>
                    <td>
                      <div>
                        <button className="rbutton" onClick={() => openModal(records)} >
                           <FontAwesomeIcon icon={faCircleDown}  size="xl" style={{ color: "#05223e"}}/> 
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="norecordD" ><p>No records to display
                    </p></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="paginationD">
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
      </section>
      {/* Modal */}
      {isModalOpen && (
          <div className="modal-overlay1 active" onClick={handleOutsideClick}>
            <div className="modal-content1d" >
              <div id="receipt-container" className="receipt-container1" >
              <h2 style={{ lineHeight:"normal", textAlign: "center", marginBottom: "20px", marginTop:"-5px"}}>
                Traffic Violation E-Receipt
              </h2>
              <div style={{ fontFamily: "Arial, sans-serif", width: "100%" }}>
                    <div className="receipt-row1">
                      <p><strong>{selectedRecord.ticketNumber}</strong></p>
                      <p><strong>{new Date(selectedRecord.dateOfApprehension).toLocaleDateString()}</strong></p>
                      <p><strong>{new Date(selectedRecord.timeOfApprehension).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true,timeZone: 'UTC'})}</strong></p></div>
                    <div class="section-divider"></div>

                    <div className="receipt-row">
                      <p>Driver's Name:</p>
                      <p><strong>{driverInfo.name}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>License Number:</p>
                      <p><strong>{driverInfo.DriLicense}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>Plate Number:</p>
                      <p><strong>{selectedRecord.plateNumber}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>Vehicle Class.:</p>
                      <p><strong>{selectedRecord.vehicleClassification}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>Type/Model:</p>
                      <p><strong>{selectedRecord.vehicleModel}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>Owner's Name:</p>
                      <p><strong>{selectedRecord.vehicleOwnerName}</strong></p>
                    </div>
                    <div class="section-divider"></div>                    
                    <div className="receipt-row">
                      <p>Place of Violation:</p>
                      <p><strong>{selectedRecord.placeOfViolation}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>Violation Type:</p>
                      <p><strong>{selectedRecord.violationType}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>Description:</p>
                      <p><strong>{selectedRecord.violationDes}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>Fine Amount:</p>
                      <p><strong>{selectedRecord.fineAmount}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p></p>
                      {signature ? (
                        <img
                          src={signature}
                          alt="Driver Signature"
                          style={{ maxWidth: '200px', height: 'auto' }}
                        />
                      ) : (
                        "No signature available"
                      )}
                    </div>
                    <div class="section-divider"></div>                    
                    <div className="receipt-row">
                      <p>Officer:</p>
                      <p><strong>{selectedRecord.apprehendingOfficer}</strong></p>
                    </div>
                    <div className="receipt-row">
                      <p>Officer Agency:</p>
                      <p><strong>{selectedRecord.agency}</strong></p>
                    </div>
                    <div class="section-divider"></div>                    
                    </div>

              </div>
              <div className="modal-buttons1">
                <button onClick={downloadReceipt}>Download</button>
                <button onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default DriverRecords;