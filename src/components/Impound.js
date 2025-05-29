import "./all.css";
import React, { useState, useEffect, useCallback, useRef  } from "react";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from './firebase';
import Modal from "react-modal";
import axios from "axios";
import OfficerHeader from './OfficerHeader';
import CsvUploader from "./CsvUploader"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faCab, faFilter,faEllipsisH, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend } from 'chart.js';
import { faMapLocation } from "@fortawesome/free-solid-svg-icons/faMapLocation";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faArrowUpZA } from "@fortawesome/free-solid-svg-icons/faArrowUpZA";
import { faSort } from "@fortawesome/free-solid-svg-icons/faSort";
import Sidebar from  './Sidebar';
import { useNavigate } from "react-router-dom"; 
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
//kirk selwyn miguel fuentevilla ycong
//normailah macala
//cate melody dalis
const fineMapping = {
  LTO: {
    "FAILURE TO CARRY OR/CR": 150,
    "EXPIRED OR/CR":450,
    "NO LOADING/UNLOADING": 100,
    "OBSTRUCTION TO SIDEWALK": 500,
    "UNREGISTERED/DELINQUENT/SUSPENDED VEHICLE": 2000,
    "DRIVING WITHOUT DRIVER'S LICENSE": 150,
    "EXPIRED DRIVER'S LICENSE":300,
    "DRIVING UNDER THE INFLUENCE OF LIQUOR/DRUGS": 4000,
    "JAYWALKING": 300,
    "OVER SPEEDING": 1000,
    "NO HELMET/NON-WEARING OF CRASH HELMET": 150,
    "FAILURE TO OBEY TRAFFIC CONTROL DEVICE TRAFFIC LIGHTS/TRAFFIC ENFORCERS": 150,
    "PARKING ON THE SIDEWALK": 500,
    "SMOKING INSIDE PUBLIC UTILITY VEHICLE": 1500,
    "WEARING OF SLIPPERS AND SANDO": 150,
    "DRIVING WITH INVALID/DELINQUENT DRIVER'S LICENSE": 300,
    "INVALID/NO FRANCHISE (COLORUM)": 1000,
    "RECKLESS DRIVING": 150,
    "CONTRACTING": 2000,
    "NO PLATE NUMBER": 375,
    "TRIP CUTTING":1000,
  },
  PNP: {
    // Copy PNP fine amounts here...
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

const AdminDashboard = () => {
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility
  const [records, setRecords] = useState([]);
  const [ticketNumber, setTicketNumber] = useState("");
  const [dateOfApprehension, setDateOfApprehension] = useState("");
  const [timeOfApprehension, setTimeOfApprehension] = useState("");
  const [nameOfDriver, setNameOfDriver] = useState("");
  const [placeOfViolation, setPlaceOfViolation] = useState("");
  const [violationType, setViolationType] = useState("");
  const [violationTypes, setViolationTypes] = useState([
    "Driving without a valid license",
    "Unregistered vehicles",
    "Invalid or tampered vehicle plates",
    "Failure to carry the Official Receipt (OR) and Certificate of Registration (CR).",
    "Driving without a valid license",
    "No or expired vehicle insurance",
    "Failure to install early warning devices (EWDs)",
    "Non-compliance with seatbelt laws",
    "Overspeeding",
    "Reckless Driving",
    "Driving under the influence (DUI)",
    "Counterflow or overtaking in prohibited areas",
    "Disobeying traffic signs or signals",
    "Illegal parking",
    "Obstruction violations",
    "Use of a private vehicle for public transport without proper franchise",
    "Worn-out tires or other safety hazards",
    "No helmet ",
    "Carrying children under 7 years old as passengers",
    "Illegal use of motorcycle lanes",
    "Riding with more than one passenger",
    "Use of mobile phones while driving",
    "Operating other distracting devices while driving",
    "Failure to yield to pedestrians at marked crossings",
    "Parking on sidewalks, pedestrian lanes, or bike lanes",
    "Blocking fire lanes or emergency exits",
    "No loading/unloading in designated zones",
    "Unauthorized tricycle routes",
    "Illegal use of restricted roads for certain vehicles",
    "Failure to follow one-way street designations",
    "Smoke belching",
    "Idling for extended periods in prohibited zones",
    "Illegal dumping of waste from vehicles",
    "Fake or forged documents",
    "Failure to renew driver’s license or vehicle registration on time",
    "Carrying firearms or illegal substances in vehicles",
    "Transporting contraband or overloaded vehicles",
  ]);
  const [violationDes, setViolationDes]= useState("");
  const [fineStatus, setFineStatus] = useState("");
    const[licenseClassificationData, setlicenseClassificationData] = useState ({PDL: 0, NPDL:1, SP: 2});
  const [fineAmount, setFineAmount] = useState("");
    const [recordSource, setRecordSource] = useState("");
  const [apprehendingOfficer, setApprehendingOfficer] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [vehicleClassification, setVehicleClassification] = useState("");
  const [loading, setLoading] = useState(true);

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

  const generateTicketNumber = () => {
    return `T-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  };
  const handleViewMore = (record) => {
    navigate(`/viewmore`, { state: record }); // Redirect with data
  };

   // Function to toggle sidebar
   const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
   };

 const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({
    ticketNumber: "",
    dateOfApprehension: "",
    timeOfApprehension: "",
    nameOfDriver: "",
    gender: "",
    age: "",
    vehicleClassification: "",
    placeOfViolation: "",
    violationType: "",
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
    dateOfIssue: "",
    expirationDate: "",
    licenseClassification: "",
    plateNumber: "",
    vehicleModel: "",
    vehicleMake: "",
    vehicleYear: "",
    vehicleColor: "",
    vehicleOwnerName: "",
    vehicleOwnerAddress: "",
    });  

    const [editingRecordId, setEditingRecordId] = useState(null);
const [editingFineAmount, setEditingFineAmount] = useState("");
const inputRef = useRef(null);


const handleFineDoubleClick = (record) => {
  setEditingRecordId(record._id);
  setEditingFineAmount(record.fineAmount);
};

// Update the fineAmount for the given record when the user finishes editing
const handleFineUpdate = async (recordId) => {
  try {
    // Prepare the data to update (you could update only the fineAmount)
    const updateData = { fineAmount: editingFineAmount };

    // Call the API to update the record. Adjust the endpoint if needed.
    const response = await axios.put(
      `http://localhost:3001/editRecords/${recordId}`,
      updateData,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200) {
      // Refresh the records (or update the local state accordingly)
      fetchRecords();
    } else {
      console.error("Failed to update fine amount.");
    }
  } catch (error) {
    console.error("Error updating fine amount:", error);
    alert("Error updating fine amount. Please try again.");
  } finally {
    // Exit editing mode regardless of success or error
    setEditingRecordId(null);
    setEditingFineAmount("");
  }
};

  const [editingViolationRecordId, setEditingViolationRecordId] = useState(null);
  const [editingViolationValue, setEditingViolationValue] = useState("");
  

  // When a violationType cell is double-clicked, enter editing mode.
  const handleViolationDoubleClick = (record) => {
    const violationStr = Array.isArray(record.violationType)
      ? record.violationType.join(", ")
      : record.violationType || "";
    setEditingViolationRecordId(record._id);
    setEditingViolationValue(violationStr);
  };

  // Update the violation type for the given record.
  const handleViolationUpdate = async (recordId) => {
    try {
      const updateData = { violationType: editingViolationValue };

      // Update the record on the backend. Adjust the endpoint as needed.
      const response = await axios.put(
        `http://localhost:3001/editRecords/${recordId}`,
        updateData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        // Optionally refresh the records.
        if (typeof fetchRecords === "function") {
          fetchRecords();
        }
      } else {
        console.error("Failed to update violation type.");
      }
    } catch (error) {
      console.error("Error updating violation type:", error);
      alert("Error updating violation type. Please try again.");
    } finally {
      // Exit editing mode
      setEditingViolationRecordId(null);
      setEditingViolationValue("");
    }
  };

  const [editingViolationDesRecordId, setEditingViolationDesRecordId] = useState(null);
  const [editingViolationDesValue, setEditingViolationDesValue] = useState("");
  const [signature, setSignature] = useState(null);

  // When a violationType cell is double-clicked, enter editing mode.
  const handleViolationDesDoubleClick = (record) => {
    setEditingViolationDesRecordId(record._id);
    setEditingViolationDesValue(record.violationDes);
  };

  // Update the violation type for the given record.
  const handleViolationDesUpdate = async (recordId) => {
    try {
      const updateData = { violationDes: editingViolationDesValue };

      // Update the record on the backend. Adjust the endpoint as needed.
      const response = await axios.put(
        `http://localhost:3001/editRecords/${recordId}`,
        updateData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        // Optionally refresh the records.
        if (typeof fetchRecords === "function") {
          fetchRecords();
        }
      } else {
        console.error("Failed to update violation type.");
      }
    } catch (error) {
      console.error("Error updating violation type:", error);
      alert("Error updating violation type. Please try again.");
    } finally {
      // Exit editing mode
      setEditingViolationDesRecordId(null);
      setEditingViolationDesValue("");
    }
  };

  // Save and exit editing mode (used when clicking outside)
  const saveAndExitEditing = () => {
    if (editingViolationRecordId !== null) {
      handleViolationUpdate(editingViolationRecordId);
    }
    if (editingRecordId !== null) {
      handleFineUpdate(editingRecordId);
    }
    if(editingViolationDesRecordId !== null){
      handleViolationDesUpdate(editingViolationDesRecordId);
    }
  };

  // Detect clicks outside the input field
  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      saveAndExitEditing();
    }
  };

  useEffect(() => {
    if (editingViolationRecordId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingViolationRecordId]);

  useEffect(() => {
    if (editingRecordId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingRecordId]);

 useEffect(() => {
    if (editingViolationDesRecordId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingViolationDesRecordId]);

  const [filteredData, setFilteredData] = useState([]);

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

const extractTime = (isoTime) => {
  if (!isoTime) return ""; // Return empty if no time exists
  return isoTime.split("T")[1].slice(0, 5); // Extract HH:MM from ISO string (24-hour format)
};

const handleSignature = async (records) => {
  try {
    const response = await fetch(`http://localhost:3001/getSignature/${records._id}`);

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


const handleEdit = (records) => {
  
  console.log("Editing record:", records); 

  setFormState({
    ticketNumber: records.ticketNumber || "",
    dateOfApprehension: records.dateOfApprehension ? records.dateOfApprehension.split("T")[0] : "",
    timeOfApprehension: records.timeOfApprehension ? extractTime(records.timeOfApprehension) : "",
    nameOfDriver: records.nameOfDriver || "",
    gender: records.gender || "",
    age: records.age || "",
    vehicleClassification: records.vehicleClassification || "",
    placeOfViolation: records.placeOfViolation || "",
    violationType: Array.isArray(records.violationType) ? records.violationType : (records.violationType ? records.violationType.split(',').map(v => v.trim()) : []),
    violationDes: records.violationDes || "",
    fineStatus: records.fineStatus || "",
    apprehendingOfficer: records.apprehendingOfficer || "",
    address: records.address || "",
    licenseNumber: records.licenseNumber || "",
    plateNumber: records.plateNumber || "",
    vehicleOwnerName: records.vehicleOwnerName || "",
    vehicleOwnerAddress: records.vehicleOwnerAddress || "",  
    dateOfBirth: records.dateOfBirth ? records.dateOfBirth.split("T")[0] : "",
    vehicleType: records.vehicleType || "",
    vehicleModel: records.vehicleModel || "",  
    vehicleYear: records.vehicleYear || "",  
    vehicleColor: records.vehicleColor || "",  
    phoneNumber: records.phoneNumber || "",
    email: records.email || "",
    occupation: records.occupation || "",
    fineAmount: records.fineAmount || "",  
    licenseClassification: records.licenseClassification || "", 
    expirationDate: records.expirationDate ? records.expirationDate.split("T")[0] : "",
    agency: records.agency || "",
    recordSource: records.agency || "",
    signature: records.signature || null,
  });

  handleSignature(records);
  setSelectedData(records);
  setIsModalOpen(true);
};


const handleUpdate = async (e) => {
e.preventDefault();

if (!selectedData) return;

const currentDat = formState.dateOfApprehension || new Date().toISOString().split("T")[0]; 
const time = formState.timeOfApprehension || "00:00"; 
const fullDateTime = `${currentDat}T${time}:00Z`;

let dateTime = null;
if (formState.dateOfApprehension && formState.timeOfApprehension) {
  dateTime = new Date(`${formState.dateOfApprehension}T${formState.timeOfApprehension}:00Z`);
}

const updatedData = {
  ...formState,
  violationType: Array.isArray(formState.violationType) 
    ? formState.violationType.join(",")  // Convert array to string
    : (formState.violationType ? formState.violationType.toString() : ""),
  timeOfApprehension: fullDateTime,
};

try {
  const response = await axios.put(`http://localhost:3001/editRecords/${selectedData._id}`, updatedData, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 200) {
    // Fetch the updated records after the update
    fetchRecords(); // Fetch latest data and set it to state

    setIsModalOpen(false);
    setSelectedData(null);
    setFormState({});
  } else {
    throw new Error("Failed to update record");
  }
} catch (error) {
  console.error("Error updating record:", error);
  alert("Failed to update record.");
}
};

const closeModal = () => {
  document.body.classList.remove("modal-open");
  setIsModalOpen(false);
  setShowModal(false);
};

const handleDelete = async (recordId) => {
  if (!recordId) {
    console.error("No record ID provided for deletion.");
    return;
  }

  const confirmDelete = window.confirm("Are you sure you want to delete this record?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:3001/deleteRecord/${recordId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const message = await response.text();
      console.log(message);
      alert("Record deleted successfully.");
      // Optionally: refresh the data or update the UI
      fetchData();
    } else if (response.status === 404) {
      alert("Record not found.");
    } else {
      alert("Failed to delete the record.");
    }
  } catch (error) {
    console.error("Error deleting record:", error);
    alert("An error occurred while deleting the record.");
  }
};

  //search
  //search
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 8;

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
  .filter(record => {
    const keywords = [
      "SERVE AS IMPOUNDING RECEIPT",
      "SERVE AS IMPOUND RECEIPT",
      "IMPOUND",
      "IMPOUNDING"
    ];
    return keywords.some(keyword => 
      record.violationType?.includes(keyword) || record.violationDes?.includes(keyword)
    );
  })
  .map(record => {
    if (!record.dateOfApprehension || !record.fineAmount) return record;

    const today = new Date();
    const apprehensionDate = new Date(record.dateOfApprehension);
    const daysPassed = Math.floor((today - apprehensionDate) / (1000 * 60 * 60 * 24)); // Calculate full days
    const additionalFine = 50 * daysPassed;

    return {
      ...record,
      fineAmount: Number(record.fineAmount) + additionalFine
    };
  })
  .sort((a, b) => {
    // Sorting logic (your overdue first logic)
    const aIsOverdue = isRecordOverdue(a);
    const bIsOverdue = isRecordOverdue(b);
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;
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
  console.log("Effect triggered!");
  console.log("Selected Agency (recordSource):", formState.recordSource);
  console.log("Selected Violations (violationType):", formState.violationType);
  console.log("isFineManual:", isFineManual);

  if (!isFineManual && formState.recordSource) { // Ensure an agency is selected
    if (Array.isArray(formState.violationType) && formState.violationType.length > 0) {
      const agencyFines = fineMapping[formState.recordSource] || {}; // Get fines for selected agency

      const totalFine = formState.violationType.reduce((sum, violation) => {
        const fine = agencyFines[violation]; 
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
}, [formState.violationType, formState.recordSource, isFineManual]); // Make sure dependencies are correct


  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <OfficerHeader isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="main-section1">   
        
        <div className="records-oftable">
        <div className="records-header">
          <h3 className="recorh2"><FontAwesomeIcon icon={faRectangleList} style={{marginRight:"10"}} />Records
          <div className="search-bar">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search" /> <FontAwesomeIcon icon={faMagnifyingGlass} style={{marginLeft:"-50", marginTop:"30"}} />
          </div>
          </h3>
          <button onClick={() => handleSort('ticketNumber')} className="adddata1">
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
               <th style={{ width: "60px" }} onClick={() => handleSort('ticketNumber')}>Ticket No.</th>
                     <th style={{ width: "80px" }}  onClick={() => handleSort('dateOfApprehension')}>Date of Apprehension</th>
                    <th style={{ width: "80px" }}   onClick={() => handleSort('nameOfDriver')}>Driver' Name</th>
                    <th style={{ width: "80px" }} >Address</th>
                    <th style={{ width: "80px" }} >License No.</th>
                   <th style={{ width: "80px" }} >Owner's Name</th>
                   <th style={{ width: "80px" }} >Owner's Address</th>
                   <th style={{ width: "50px" }} >Vehicle Type</th>
                    <th style={{ width: "50px" }} onClick={() => handleSort('vehicleClassification')}>Class.</th>
                    <th style={{ width: "50px" }}>Plate No.</th>
                    <th style={{ width: "80px" }}onClick={() => handleSort('placeOfViolation')}>Place of Violation</th>
                    <th style={{ width: "150px" }}>Violation Type</th>
                    <th style={{ width: "120px" }}>Violation Description</th>
                    <th style={{ width: "100px" }}>Apprehending Officer</th>
                    <th style={{ width: "40px" }} >Fine Amount</th>
                    <th style={{ width: "50px" }} >Fine Status</th>
                    <th style={{ width: "30px" }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                  <tr>
                    <td  colSpan="17" className="norecord">
                      Loading records...</td>
                  </tr>
                ) : currentRecords.length > 0 ? (
                  currentRecords.map((records) => (
                    <tr key={records?._id}>
                      <td>{records?.ticketNumber}</td>
                      <td>{records?.dateOfApprehension ? records.dateOfApprehension.split("T")[0] : "N/A"}</td>
                      <td>{records?.nameOfDriver}</td>
                      <td>{records?.address}</td>
                      <td>{records?.licenseNumber}</td>
                      <td>{records?.vehicleOwnerName}</td>
                      <td>{records?.vehicleOwnerAddress}</td>
                      <td>{records?.vehicleModel}</td>
                      <td>{records?.vehicleClassification}</td>
                      <td>{records?.plateNumber}</td>
                      <td>{records?.placeOfViolation}</td>
                      <td onDoubleClick={() => handleViolationDoubleClick(records)}>
                        {editingViolationRecordId === records._id ? (
                          // Use a <textarea> so text will wrap within the given width/height.
                          <textarea
                            ref={inputRef}
                            value={editingViolationValue}
                            onChange={(e) => setEditingViolationValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                // Optionally, if you want Enter to also trigger saving:
                                saveAndExitEditing();
                              }
                            }}
                            style={{
                              width: "300px",            // Increase the width as needed
                              height: "100px",           // Increase the height as needed
                              whiteSpace: "pre-wrap",    // Allows wrapping
                              wordWrap: "break-word",    // Break long words if necessary
                              resize: "vertical",        // Optional: allow vertical resizing
                            }}
                          />
                        ) : (
                          // Display the violation type normally.
                          Array.isArray(records.violationType)
                            ? records.violationType.join(", ")
                            : records.violationType
                        )}
                      </td>
                      <td onDoubleClick={() => handleViolationDesDoubleClick(records)}>
                        {editingViolationDesRecordId === records._id ? (
                          <textarea
                            ref={inputRef}
                            value={editingViolationDesValue}
                            onChange={(e) => setEditingViolationDesValue(e.target.value)}
                            onBlur={() => handleViolationDesUpdate(records._id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleViolationDesUpdate(records._id);
                              }
                            }}
                            style={{
                              width: "300px",            // Increase the width as needed
                              height: "100px",           // Increase the height as needed
                              whiteSpace: "pre-wrap",    // Allows wrapping
                              wordWrap: "break-word",    // Break long words if necessary
                              resize: "vertical",        // Optional: allow vertical resizing
                            }}
                          />
                        ) : (
                         records.violationDes || ""
                        )}
                      </td>
                      <td>{records?.apprehendingOfficer}</td>
                      <td
                        // Allow double-click to trigger inline editing
                        onDoubleClick={() => handleFineDoubleClick(records)}
                      >
                        {editingRecordId === records._id ? (
                          <input
                            ref={inputRef}
                            type="text"
                            value={editingFineAmount}
                            onChange={(e) => setEditingFineAmount(e.target.value)}
                            onBlur={() => handleFineUpdate(records._id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleFineUpdate(records._id);
                            }}
                            style={{ width: "80px" }} // Optional styling adjustment
                          />
                        ) : (
                          `₱${records.fineAmount}`
                        )}
                      </td>
                      <td>{records?.fineStatus}</td>
                    <td>
                      <div className="buttonsof">
                        <button className="edit-button" onClick={() => handleEdit(records)}>
                           <FontAwesomeIcon icon={faPen} style={{color:"#fff"}} /> 
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(records._id)}
                        >
                           <FontAwesomeIcon icon={faTrashCan} style={{color:"#fff"}}   />
                        </button>
                        <button
                        className="view-more-button"
                        onClick={() => handleViewMore(records)}
                      >
                        <FontAwesomeIcon icon={faEllipsisH} style={{ color: "#fff" }} />
                      </button>


                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="17" className="norecord" >
                    <p>No records to display
                    </p></td>
                </tr>
              )}
            </tbody>

          </table>

        </div>
        </div>

        </main>
        <div className="pagination">
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

      <br/><br/>
 {/*  
<div className="records-section">
<Map onCsvUpload={handleCsvData} />
</div>*/}

        <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal-contentovr" overlayClassName="overlayovr1">
      
               <h2><FontAwesomeIcon icon={faTicket} style={{marginRight:"10px"}}/> {selectedData ? "Edit Record" : "Add New Record"}</h2>
                <form className="add-formovr">
                 <label htmlFor="ticket-id">Ticket Number/ID <span style={{ color: 'red' }}>*</span></label>
                  <input
                    id="ticket-id"
                    type="text"
                    value={formState.ticketNumber}
                    disabled
                    required
                  />
      
                <div className="form-rowovr"> 
                <div className="form-groupovr">
                <label htmlFor="record-source">Agency <span style={{ color: 'red' }}>*</span></label>
                  <select
                    id="record-source"
                    value={formState.agency}
                    onChange={(e) => {
                      const newAgency = e.target.value;
                      setFormState((prevState) => ({
                        ...prevState,
                        recordSource: newAgency,
                        agency: newAgency, // Ensure agency is also updated
                      }));
                      setIsFineManual(false); // Reset manual override when agency changes
                    }}
                    required
                  >
                    <option value="" disabled>Select Agency</option>
                    <option value="LTO">LTO</option>
                    <option value="PNP">PNP</option>
                    <option value="ICTPMO">ICTPMO</option>
                  </select>
                  </div>
                <div className="form-groupovr">
                <label htmlFor="date-of-apprehension">Date of Apprehension  <span style={{ color: 'red' }}>*</span></label>
                <input 
                  id="date-of-apprehension" 
                  type="date" 
                  value={formState.dateOfApprehension} 
                  onChange={(e) => setFormState({ ...formState, dateOfApprehension: e.target.value })} 
                  required 
                />
                </div>
                <div className="form-groupovr">
                <label htmlFor="time-of-apprehension">Time of Apprehension <span style={{ color: 'red' }}>*</span></label>
                <input
                  id="time-of-apprehension"
                  type="time"
                  placeholder="Enter time "
                  value={formState.timeOfApprehension}
                  onChange={(e) => setFormState({ ...formState, timeOfApprehension: e.target.value })}
                  required
               />
                 </div>
                 </div>
      
                <label htmlFor="driver-name">Name of Driver</label>
                <input 
                  id="driver-name" 
                  type="text" 
                  placeholder="Enter Name of Driver" 
                  value={formState.nameOfDriver} 
                  onChange={(e) => setFormState({ ...formState, nameOfDriver: e.target.value })} 
                 
                />
      
              <div className="form-rowovr"> 
              <div className="form-groupovr">
              <label htmlFor="gender">Gender</label>
              <select 
                    id="gender" 
                    value={formState.gender||""} 
                    onChange={(e) => setFormState({ ...formState, gender: e.target.value })} 
                  >
                    <option value="" disabled hidden>Select Gender</option> 
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                  </div>
                  <div className="form-groupovr">
                <label htmlFor="age">Age</label>
                <input 
                  id="age" 
                  type="number" 
                  placeholder="Enter Age" 
                  value={formState.age} 
                  onChange={(e) => setFormState({ ...formState, age: e.target.value })} 
                
                />
                </div>
                <div className="form-groupovr">
                 <label htmlFor="date-of-birth">Date of Birth</label>
                  <input
                    id="date-of-birth"
                    type="date"
                    value={formState.dateOfBirth}
                    onChange={(e) => setFormState({ ...formState, dateOfBirth: e.target.value })}
                   
                  />
                  </div>
                  </div>
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Enter Address"
                    value={formState.address}
                    onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  
                  />
      
                  <label htmlFor="phone-number">Phone Number</label>
                  <input
                    id="phone-number"
                    type="tel"
                    placeholder="Enter Phone Number"
                    value={formState.phoneNumber}
                    onChange={(e) => setFormState({ ...formState, phoneNumber: e.target.value })}
                   
                  />
      
                 <label htmlFor="email">Email <span style={{ color: 'red' }}>*</span></label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter Email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    required
                  />
      
                  <label htmlFor="occupation">Occupation</label>
                  <input
                    id="occupation"
                    type="text"
                    placeholder="Enter Occupation"
                    value={formState.occupation}
                    onChange={(e) => setFormState({ ...formState, occupation: e.target.value })}
                  
                  />
      
                <label htmlFor="place-of-violation">Place of Violation</label>
                <select 
                  id="place-of-violation" 
                  value={formState.placeOfViolation}  
                  onChange={(e) => setFormState({ ...formState, placeOfViolation: e.target.value })} 
                
                >
                   <option value="" disabled>Select Place of Violation</option>
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
                    <option value="TOMAS L. CABILI (TOMINOBO PROPER)">TOMAS L. CABILI (TOMINOBO PROPER)</option>
                    <option value="TUBOD">TUBOD</option>
                    <option value="UBALDO LAYA">UBALDO LAYA</option>
                    <option value="UPPER HINAPLANON">UPPER HINAPLANON</option>
                    <option value="UPPER TOMINOBO">UPPER TOMINOBO</option>
                    <option value="VILLA VERDE">VILLA VERDE</option>

                </select>
      
                <label htmlFor="classsification-of-vehicle">Classification of Vehicle</label>
                    <select 
                      id="classsification-of-vehicle" 
                      value={formState.vehicleClassification} 
                      onChange={(e) => setFormState({ ...formState, vehicleClassification: e.target.value })} 
                      
                    >
                      <option value="" disabled>
                        Select classification of vehicle
                      </option>
                      <option value="PUV">PUV (Public Utility Vehicle)</option>
                      <option value="Private">Private</option>
                      <option value="Government">Government Vehicle</option>
                      <option value="PUJ">PUJ (Public Utility Jeepney)</option>
                      <option value="PUB">PUB (Public Utility Bus)</option>
                      <option value="MC">Motorcycle</option>
                      <option value="TRI">Tricycle</option>
                    </select>
                    <label htmlFor="plate-number">Plate Number</label>
                  <input
                    id="plate-number"
                    type="text"
                    placeholder="Enter Plate Number"
                    value={formState.plateNumber}
                    onChange={(e) => setFormState({ ...formState, plateNumber: e.target.value })}
                   
                  />
                <div className="form-rowovr"> 
                <div className="form-groupovr">
                <label htmlFor="model">Model</label>
                  <input
                    id="model"
                    type="text"
                    placeholder="Vehicle Model"
                    value={formState.model}
                    onChange={(e) => setFormState({ ...formState,   vehicleModel: e.target.value })}
                   
                  />
                  </div>
                <div className="form-groupovr">
                <label htmlFor="year">Year</label>
                  <input
                    id="year"
                    type="number"
                    placeholder="Vehicle Year"
                    value={formState.year}
                    onChange={(e) => setFormState({ ...formState, vehicleYear: e.target.value })}
                    
                  />
                   </div>
                   <div className="form-groupovr">
                   <label htmlFor="color">Vehicle Color</label>
                  <input
                    id="color"
                    type="text"
                    placeholder="Vehicle Color"
                    value={formState.color}
                    onChange={(e) => setFormState({ ...formState, vehicleColor: e.target.value })}
                  
                  />
                 </div>
                 </div>
      
                  <label htmlFor="vehicle-owner-name">Owner's Name</label>
                  <input
                    id="vehicle-owner-name"
                    type="text"
                    placeholder="Enter Vehicle Owner's Name"
                    value={formState.vehicleOwnerName}
                    onChange={(e) => setFormState({ ...formState, vehicleOwnerName: e.target.value })}
                   
                  />
      
                  <label htmlFor="owner-address">Owner's Address</label>
                  <input
                    id="owner-address"
                    type="text"
                    placeholder="Enter Owner's Address"
                    value={formState.ownerAddress}
                    onChange={(e) => setFormState({ ...formState, vehicleOwnerAddress: e.target.value })}
                
                  />   
      
                <label htmlFor="violation-type">Violation Type</label>
                <div id="violation-type">
                  {[
                    "FAILURE TO CARRY OR/CR",
                    "EXPIRED OR/CR",
                    "NO LOADING/UNLOADING",
                    "OBSTRUCTION TO SIDEWALK",
                    "UNREGISTERED/DELINQUENT/SUSPENDED VEHICLE",
                    "DRIVING WITHOUT DRIVER'S LICENSE",
                    "EXPIRED DRIVER'S LICENSE",
                    "DRIVING UNDER THE INFLUENCE OF LIQUOR/DRUGS",
                    "JAYWALKING",
                    "OVER SPEEDING",
                    "NO HELMET/NON-WEARING OF CRASH HELMET",
                    "FAILURE TO OBEY TRAFFIC CONTROL DEVICE TRAFFIC LIGHTS/TRAFFIC ENFORCERS",
                    "PARKING ON THE SIDEWALK",
                    "SMOKING INSIDE PUBLIC UTILITY VEHICLE",
                    "WEARING OF SLIPPERS AND SANDO",
                    "DRIVING WITH INVALID/DELINQUENT DRIVER'S LICENSE",
                    "INVALID/NO FRANCHISE (COLORUM)",
                    "RECKLESS DRIVING",
                    "CONTRACTING",
                    "NO PLATE NUMBER",
                    "TRIP CUTTING",
                  ].map((type, index) => (
                    <div key={index} className="checkbox-itemovr">
                      <input
                        type="checkbox"
                        id={`violation-${index}`}
                        value={type}
                        checked={formState.violationType?.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Add the violation to the list
                            setFormState((prevState) => ({
                              ...prevState,
                              violationType: [...prevState.violationType, type],
                            }));
                          } else {
                            // Remove the violation from the list
                            setFormState((prevState) => ({
                              ...prevState,
                              violationType: prevState.violationType.filter(
                                (violation) => violation !== type
                              ),
                            }));
                          }
                        }}
                      />
                      <label style={{fontWeight:"lighter"}} htmlFor={`violation-${index}`}>{type}</label>
                    </div>
                  ))}
                </div>
      
                 <label htmlFor="violation-description">Violation Description</label>
                  <textarea
                    id="violation-description"
                    placeholder="Enter details about the violation"
                    value={formState.violationDes}
                    onChange={(e) =>
                      setFormState({ ...formState, violationDes: e.target.value })
                    }
                    rows="4"
                  ></textarea>
             
              <label htmlFor="fine-amount">Fine Amount</label>
              <input
                    id="fine-amount"
                    type="text"
                    value={fineAmount}
                    readOnly={!isFineManual} // Prevent manual editing unless manually overridden
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (value === "") {
                        setIsFineManual(false); // Resume auto-calculation
                        return;
                      }
                      setIsFineManual(true); // Mark as manually edited
                      setFineAmount(value);
                      setFormState((prevState) => ({ ...prevState, fineAmount: value }));
                    }}
                  />
                
              <label htmlFor="fine-status">Fine Status <span style={{ color: 'red' }}>*</span></label>
              <select 
                  id="fine-status" 
                  value={formState.fineStatus||""} 
                  onChange={(e) => setFormState({ ...formState, fineStatus: e.target.value })} 
                  required 
                >
                  <option value="" disabled hidden>
                    Select Fine Status
                  </option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
      
                <label htmlFor="license-number">License Number</label>
                  <input
                    id="license-number"
                    type="text"
                    placeholder="Enter License Number"
                    value={formState.licenseNumber}
                    onChange={(e) => setFormState({ ...formState, licenseNumber: e.target.value })}
                    
                  />
             
               <div className="form-rowovr"> 
               <div className="form-groupovr">
                <label htmlFor="license-classification">License Classification</label>
                <select
                    id="license-classification"
                    value={formState.licenseClassification||""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        licenseClassification: e.target.value,
                      })
                    }
                    
                  >
                    <option value="" disabled hidden>Select classification</option> 
                    <option value="PDL">PDL</option>
                    <option value="NPDL">NPDL</option>
                    <option value="SP">SP</option>
                  </select>
                  </div>
                  <div className="form-groupovr">
                  <label htmlFor="expiration-date">Expiration Date</label>
                  <input
                    id="expiration-date"
                    type="date"
                    value={formState.expirationDate}
                    onChange={(e) => setFormState({ ...formState, expirationDate: e.target.value })}
                   
                  />
                 </div>
                
                 </div>
                <label htmlFor="apprehending-officer">Apprehending Officer <span style={{ color: 'red' }}>*</span></label>
                <input 
                  id="apprehending-officer" 
                  type="text" 
                  value={formState.apprehendingOfficer} 
                  onChange={(e) => setFormState({ ...formState, apprehendingOfficer: e.target.value })} 
                  required 
                />
                
                <label htmlFor="e-signature">Driver's E-Signature</label>
                {formState.signature && formState.signature.data ? (
                <img 
                src={signature} 
                style={{
                    width: '500px',
                    height: '200px',
                    border: '2px solid black',
                    marginTop: '20px',
                    display: 'block',
                    objectFit: 'contain',
                  }}
    
                />
              ) : <p style={{ marginTop: '20px' }}>Signature not available</p>}

                <div className="modal-buttons">
                  <button type="submit" onClick={handleUpdate} className="submitadd">Update record<FontAwesomeIcon icon={faFloppyDisk} style={{color: "#ffffff", marginLeft:"10"}} /></button>
                  <button type="button" className="close-modal-btn" onClick={closeModal}>Cancel <FontAwesomeIcon icon={faXmark} style={{color: "#ffffff", marginLeft:"10"}} /> </button>
                </div>
              </form>
            </Modal>
    </div>

  );
};

export default AdminDashboard;