import "./all.css";
import React, { useState, useEffect, useCallback, useRef  } from "react";
import axios from "axios";
import Modal from "react-modal";
import OfficerHeader from './OfficerHeader';
import CsvUploader from "./CsvUploader"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faCab, faFilter,faEllipsisH, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus, faAdd, faMoneyBill, faMoneyBill1, faMoneyBill1Wave, faCertificate, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend } from 'chart.js';
import { faMapLocation } from "@fortawesome/free-solid-svg-icons/faMapLocation";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faArrowUpZA } from "@fortawesome/free-solid-svg-icons/faArrowUpZA";
import { faSort } from "@fortawesome/free-solid-svg-icons/faSort";
import Sidebar from  './SidebarOfficer';
import { useNavigate } from "react-router-dom"; 
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import emailjs from '@emailjs/browser';
import SignatureCanvas from 'react-signature-canvas';

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

const OfViolationRecords = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility
  const [records, setRecords] = useState([]);
  const canvasRef = useRef(null);
  const [violationTypes, setViolationTypes] = useState([
    "Failure to carry OR/CR",
      "No loading/Unloading",
      "Obstruction to sidewalk",
      "Unregistered/delinquent/suspended vehicle",
      "Driving without Driver's License",
      "Driving under the influence of Liquor/Drugs",
      "Jaywalking",
      "Over Speeding",
      "No helmet",
      "Failure to obey traffic control device traffic lights/traffic enforcers",
      "Parking on the sidewalk",
      "Smoking inside public utility vehicle",
      "Wearing of slippers and sando",
      "Driving with invalid/delinquent Driver's license",
      "Invalid/No Franchise (Colorum)",
      "Reckless Driving",
      "Contracting",
      "No plate",
  ]);
  const[licenseClassificationData, setlicenseClassificationData] = useState ({PDL: 0, NPDL:1, SP: 2});
  const [fineAmount, setFineAmount] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [officer, setOfficer] = useState(null);
    
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
                navigate('/AdminDashboard');
              } else if (officerData.role === 'Officer') {
                console.log(`Officer found with id ${driverId}.`);
                
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
  }, [fetchRecords])

  const handleViewMore = (record) => {
    navigate(`/viewmore`, { state: record }); // Redirect with data
  };

  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis

   // Function to toggle sidebar
   const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
   };

    const [evidence, setEvidence] = useState(null);
    const [evidencePreview, setEvidencePreview] = useState(null);

  const [ticketNumberinc, setTicketNumber] = useState("000001");
  
  useEffect(() => {
    const savedTicketNumber = localStorage.getItem("lastTicketNumber2");
    if (savedTicketNumber) {
      setTicketNumber(savedTicketNumber); // Set ticket number from localStorage
    } else {
      setTicketNumber("000001"); // Set default ticket number if none exists in localStorage
    }
  }, []); 

  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPaid, setIsModalOpenPaid] = useState(false);
  const [formState, setFormState] = useState({
    ticketNumber: ticketNumberinc,
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
    oRNo:"",
    datepaid:"",
    agency:"",
    });  

    const [officerName, setOfficerName] = useState(""); 
    const [officerAgency, setOfficerAgency] = useState(""); 
    const [offassign, setOfficerAssign] = useState(""); 
    

    useEffect(() => {
      const fetchOfficerData = async () => {
          try {
              const driverId = localStorage.getItem("driverId");
              if (!driverId) {
                  console.warn("No driverId found in localStorage.");
                  return;
              }
  
              const response = await axios.get(`http://localhost:3001/getOfficerById/${driverId}`);
              if (response.data) {
                  setOfficer(response.data);
                  setOfficerName(response.data.name);
                  setOfficerAgency(response.data.agency);
                  setOfficerAssign(response.data.assign);
                  console.log("Fetched Officer Name:", response.data.name); 
                  // Update formState after fetching officer data
                  setFormState(prevState => ({
                      ...prevState,
                      apprehendingOfficer: response.data.name // Set officer name
                  }));
              }
          } catch (error) {
              console.error("Error fetching officer data:", error);
          }
      };
  
      fetchOfficerData();
  }, []);

  const getNowDateTime = () => {
    const now = new Date();
    // Manually apply timezone offset to get correct local ISO
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const date = local.toISOString().split("T")[0]; // Local YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0].slice(0, 5); // HH:MM in local
    return { date, time };
  };
  
  
  

  const openModal = () => {
    setFormState({
      ...formState,
      ticketNumber: ticketNumberinc,
      agency: officerAgency,
      recordSource: officerAgency,
      dateOfApprehension: getNowDateTime().date,
      timeOfApprehension: getNowDateTime().time,
      apprehendingOfficer: officerName,
      placeOfViolation: offassign || "Abuno",
    });
    setSelectedData(null);
    setIsModalOpen(true);
  };
  console.log("open",formState);
  
  const closeModal = () => {
    setIsModalOpen(false);
    setIsModalOpenPaid(false);
    setFormState({  
      ticketNumber: ticketNumberinc,
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
      agency:"",
    });
  };
  
const [editingRecordId, setEditingRecordId] = useState(null);
const [editingFineAmount, setEditingFineAmount] = useState("");
const [ictpmoInputValue, setIctpmoInputValue] = useState("");
const [ictpmoInputValue2, setIctpmoInputValue2] = useState("");
const [ictpmoInputValue3, setIctpmoInputValue3] = useState("");
const [lastTicketNumber, setLastTicketNumber] = useState("");
const [currentDate, setCurrentDate] = useState(new Date());

const getDayWithSuffix = (day) => {
  if (day >= 11 && day <= 13) return `${day}th`; // Handle 11th, 12th, 13th
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

useEffect(() => {
  const savedValue = localStorage.getItem("lastTicketNumber");
  if (savedValue) setLastTicketNumber(savedValue);
}, []);

 useEffect(() => {
    const savedValue = localStorage.getItem("savedInput");
    if (savedValue) setIctpmoInputValue(savedValue);
  }, []);

  useEffect(() => {
    const savedValue = localStorage.getItem("savedInput2");
    if (savedValue) setIctpmoInputValue2(savedValue);
  }, []);

  useEffect(() => {
    const savedValue = localStorage.getItem("savedInput3");
    if (savedValue) setIctpmoInputValue3(savedValue);
  }, []);

const handleIctpmoInputChange = (e) => {
  setIctpmoInputValue(e.target.value);
  localStorage.setItem("savedInput", e.target.value);
};

const handleIctpmoInputChange2 = (e) => {
  setIctpmoInputValue2(e.target.value);
  localStorage.setItem("savedInput2", e.target.value);
};

const handleIctpmoInputChange3 = (e) => {
  setIctpmoInputValue3(e.target.value);
  localStorage.setItem("savedInput3", e.target.value);
};

const inputRef = useRef(null);
const textareaRef = useRef(null);
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto"; // Reset height to recalculate
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set new height
  }
}, [ictpmoInputValue]);

useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto"; // Reset height to recalculate
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set new height
  }
}, [ictpmoInputValue2]);

useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto"; // Reset height to recalculate
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set new height
  }
}, [ictpmoInputValue3]);

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
      if (typeof fetchRecords === "function") {
        fetchRecords();
      }
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


  const [genderData, setGenderData] = useState({ Male: 0, Female: 0 });
  const [ageData, setAgeData] = useState([0, 0, 0, 0, 0]); // [0-18, 19-30, 31-40, 41-50, 51+]
  const [fineStatusData, setFineStatusData] = useState({ Paid: 0, Unpaid: 0 });
  const [vehicleClassificationData, setVehicleClassificationData] = useState({});//doughnut
  const [violationTypeData, setViolationTypeData] = useState({});//doughnut
  const [vehicleClassificationDataC, setVehicleClassificationDataC] = useState({}); //card
  const [violationTypeDataC, setViolationTypeDataC] = useState({});//card



  const [filteredData, setFilteredData] = useState([]);
// Function to fetch data for gender, fine status, and age groups
const fetchDemographicData = async (dataList) => {
  // Process gender data
  const genderCounts = dataList.reduce(
    (acc, record) => {
      if (record.gender === "Male") acc.Male += 1;
      if (record.gender === "Female") acc.Female += 1;
      return acc;
    },
    { Male: 0, Female: 0 }
  );
  setGenderData(genderCounts);

  // Process fine status data
  const fineStatusCounts = dataList.reduce(
    (acc, record) => {
      if (record.fineStatus === "Paid") acc.Paid += 1;
      if (record.fineStatus === "Unpaid") acc.Unpaid += 1;
      return acc;
    },
    { Paid: 0, Unpaid: 0 }
  );
  setFineStatusData(fineStatusCounts);

  // Process age data (grouping by age ranges)
  const ageCounts = [0, 0, 0, 0, 0]; // [0-18, 19-30, 31-40, 41-50, 51+]
  dataList.forEach((record) => {
    const age = record.age;
    if (age >= 0 && age <= 18) ageCounts[0] += 1;
    else if (age >= 19 && age <= 30) ageCounts[1] += 1;
    else if (age >= 31 && age <= 40) ageCounts[2] += 1;
    else if (age >= 41 && age <= 50) ageCounts[3] += 1;
    else if (age >= 51) ageCounts[4] += 1;
  });
  setAgeData(ageCounts);
};

// Function to fetch data for doughnut charts
const fetchDoughnutData = async (dataList) => {
  // Process vehicle classification data
  const vehicleCounts = {};
  dataList.forEach((record) => {
    const vehicle = record.vehicleClassification;
    if (vehicle) {
      vehicleCounts[vehicle] = vehicleCounts[vehicle] ? vehicleCounts[vehicle] + 1 : 1;
    }
  });
  setVehicleClassificationData(vehicleCounts);

  // Process violation type data dynamically
  const violationCounts = {};
  dataList.forEach((record) => {
    const violation = record.violationType;
    if (violation) {
      violationCounts[violation] = violationCounts[violation] ? violationCounts[violation] + 1 : 1;
    }
  });
  setViolationTypeData(violationCounts);
};

// Function to fetch data for cards
const fetchCardData = async (dataList) => {
  // Process vehicle classification data for cards
  const vehicleCountsC = {};
  dataList.forEach((record) => {
    const vehicle = record.vehicleClassification;
    if (vehicle) {
      vehicleCountsC[vehicle] = vehicleCountsC[vehicle] ? vehicleCountsC[vehicle] + 1 : 1;
    }
  });
  const highestVehicleClassification = Object.keys(vehicleCountsC).reduce((a, b) =>
    vehicleCountsC[a] > vehicleCountsC[b] ? a : b
  );
  const highestVehicleCountC = vehicleCountsC[highestVehicleClassification];
  setMostCommonVehicle({ count: highestVehicleCountC, classification: highestVehicleClassification });

  // Process violation type data for cards
  const violationCountsC = {};
  dataList.forEach((record) => {
    const violation = record.violationType;
    if (violation) {
      violationCountsC[violation] = violationCountsC[violation] ? violationCountsC[violation] + 1 : 1;
    }
  });
  const highestViolationTypeC = Object.keys(violationCountsC).reduce((a, b) =>
    violationCountsC[a] > violationCountsC[b] ? a : b
  );
  const highestViolationCount = violationCountsC[highestViolationTypeC];
  setMostCommonViolation({ count: highestViolationCount, type: highestViolationTypeC });

  // Calculate the total number of violations per place of violation
  const placeCounts = {};
  dataList.forEach((record) => {
    const place = record.placeOfViolation;
    if (place) {
      placeCounts[place] = placeCounts[place] ? placeCounts[place] + 1 : 1;
    }
  });
  const top3Places = Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([place, count]) => ({ place, count }));
  setTop3Places(top3Places);
};

// Main fetch function
const fetchData = async () => {
  try {
    const response = await axios.get("http://localhost:3001/getRecords"); // ✅ Fetch records from MongoDB
    const dataList = response.data;

    console.log("Fetched data:", response.data);
    setRecords(dataList);
    setFilteredData(dataList);
    console.log("Records after set:", dataList); 
    // Fetch additional data
    fetchDemographicData(dataList);
    fetchDoughnutData(dataList);
    fetchCardData(dataList);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

useEffect(() => {
  fetchData();
}, []);

const [mostCommonViolation, setMostCommonViolation] = useState({ count: 0, type: "" });
const [mostCommonVehicle, setMostCommonVehicle] = useState({ count: 0, classification: "" });
const [top3Places, setTop3Places] = useState([]);
const totalViolations = records.length; // Use `records` state to calculate this.


const getRemainingTime = (dueDate, fineStatus) => {
  const currentDate = new Date();
  const due = new Date(dueDate);
  const timeDiff = due - currentDate;

  if (fineStatus=="Paid"){
    return 'Paid';
  }

  if(timeDiff <= 0) {
    return 'Overdue'; // Mark as overdue if time is up
  }

  

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m `; 

};

const handleDelete = async (selectedData) => {
  if (!selectedData || !selectedData._id) {
    console.error("No record selected for officer removal.");
    return;
  }

  const updateData = {
    officerremoved: true
  };

  try {
    const response = await axios.put(
      `http://localhost:3001/editRecords/${selectedData._id}`,
      updateData,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200) {
      console.log("Officer removed flag updated successfully!");
      if (typeof fetchRecords === "function") {
        fetchRecords();
      }
      closeModal?.(); // Optional chaining in case closeModal isn't defined
    } else {
      console.error("Failed to update officerremoved. Response:", response);
    }
  } catch (error) {
    console.error("Error updating officerremoved:", error);
    alert("Error updating record. Please try again.");
  }
};

const handleFileChange = (e, setFile) => {
  const file = e.target.files[0];
  if (file) {
    setFile(file);
    setEvidencePreview(URL.createObjectURL(file));
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let signatureImage = null;
    if (!canvasRef.current.isEmpty()) {
      const dataUrl = canvasRef.current.toDataURL("image/png");

      signatureImage = {
        contentType: "image/png",
        data: dataUrl,
      };
    }

    const currentDat = formState.dateOfApprehension || new Date().toISOString().split("T")[0]; 
    const time = formState.timeOfApprehension || "00:00"; 
    const fullDateTime = `${currentDat}T${time}:00Z`;
  
    const combinedDateTime = `${formState.dateOfApprehension}T${formState.timeOfApprehension}:00`;
    const currentDate = new Date(combinedDateTime);
    const dueDate = new Date(currentDate);
    dueDate.setDate(dueDate.getDate() + 7);
  
    const fineStatus = formState.fineStatus || 'Unpaid'; 
  
    const submissionData = new FormData();
  submissionData.append("ticketNumber", formState.ticketNumber);
  submissionData.append("nameOfDriver", formState.nameOfDriver);
  submissionData.append("placeOfViolation", formState.placeOfViolation);
  submissionData.append("timeOfApprehension", fullDateTime);
  submissionData.append("dateOfApprehension", formState.dateOfApprehension);
  submissionData.append("vehicleClassification", formState.vehicleClassification);
  submissionData.append("violationDes", formState.violationDes);
  submissionData.append("violationType", Array.isArray(formState.violationType) ? formState.violationType.join(',') : "");
  submissionData.append("gender", formState.gender);
  submissionData.append("age", formState.age);
  submissionData.append("fineStatus", fineStatus);
  submissionData.append("apprehendingOfficer", formState.apprehendingOfficer);
  submissionData.append("dateOfBirth", formState.dateOfBirth);
  submissionData.append("address", formState.address);
  submissionData.append("phoneNumber", formState.phoneNumber);
  submissionData.append("email", formState.email);
  submissionData.append("occupation", formState.occupation);
  submissionData.append("licenseNumber", formState.licenseNumber);
  submissionData.append("expirationDate", formState.expirationDate);
  submissionData.append("licenseClassification", formState.licenseClassification);
  submissionData.append("plateNumber", formState.plateNumber);
  submissionData.append("vehicleModel", formState.vehicleModel);
  submissionData.append("vehicleYear", formState.vehicleYear);
  submissionData.append("vehicleColor", formState.vehicleColor);
  submissionData.append("vehicleOwnerName", formState.vehicleOwnerName);
  submissionData.append("vehicleOwnerAddress", formState.vehicleOwnerAddress);
  submissionData.append("fineAmount", formState.fineAmount);
  submissionData.append("dueDate", dueDate.toISOString());
  submissionData.append("oRNo", formState.oRNo);
  submissionData.append("datepaid", formState.datepaid);
  submissionData.append("agency", formState.agency);

  // Attach signature (as image blob)
  if (canvasRef.current && !canvasRef.current.isEmpty()) {
    const blob = await fetch(canvasRef.current.toDataURL("image/png")).then(res => res.blob());
    submissionData.append("signature", blob, "signature.png");
  }

  // Attach evidence file
  if (evidence) {
    submissionData.append("evidence", evidence);
  }
  
    try {
      console.log("Submitting form data:", formState); // Log form data
      const response = await fetch("http://localhost:3001/addRecord", {
        method: "POST",
        body: submissionData,
      });
  
        if (response.status === 201) {
          fetchRecords(); // Prepend to maintain order

          const formatDateTime = (dateObj) => {
            try {
              const date = new Date(dateObj);
              if (isNaN(date)) return "N/A";
          
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
          
              return `${year}-${month}-${day} ${hours}:${minutes}`;
            } catch {
              return "N/A";
            }
          };
          
          const formatDueDate = (dateObj) => {
            try {
              const date = new Date(dateObj);
              if (isNaN(date)) return "N/A";
          
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
          
              return `${year}-${month}-${day}`;
            } catch {
              return "N/A";
            }
          };
  
          const isValidEmail = (email) => {
            if (!email) return false; // null, undefined, or empty
            const invalidValues = ["n/a", "na", "none", "null", "undefined", ""]; 
            return !invalidValues.includes(email.toLowerCase());
          };
          
          if (isValidEmail(submissionData.email)) {
            const formattedTime = formatDateTime(submissionData.timeOfApprehension);
            const formattedDue = formatDueDate(submissionData.dueDate);
          
            const emailResponse = await emailjs.send(
              'service_78yoe2g',
              'template_db0khws',
              {
                ...submissionData,
                formattedTimeOfApprehension: formattedTime,
                formattedDueDate: formattedDue,
              },
              'hQp4vB7vRFyLDluy8'
            );
          
            console.log("Sending to EmailJS:", {
              ...submissionData,
              formattedTimeOfApprehension: formattedTime,
            });
          
            console.log("Email sent:", emailResponse.status);
          } else {
            console.log("Email not sent: Invalid or missing email address.");
          }
          
          setEvidence(null); // ✅ Clear evidence from state

          closeModal();
  
          let nextTicketNumber;
  
          // Check if the user has manually entered a ticket number, otherwise increment the stored number
          if (formState.ticketNumber && !isNaN(formState.ticketNumber)) {
            // If the user typed a number, increment it
            nextTicketNumber = (parseInt(formState.ticketNumber, 10) + 1).toString().padStart(6, "0");
          } else {
            // If no manual entry, increment the current ticket number in state
            nextTicketNumber = (parseInt(ticketNumberinc, 10) + 1).toString().padStart(6, "0");
          }
  
          // Save the updated ticket number to both formState and localStorage
          setTicketNumber(nextTicketNumber);
          localStorage.setItem("lastTicketNumber2", nextTicketNumber);
  
          
        }
        console.log("Server response:", response); // Log the full response
  
  
    } catch (error) {
        console.error("Error submitting record:", error);
        alert("Error submitting record. Please check the details and try again.");
    }
  };
  const extractTime = (isoTime) => {
    if (!isoTime) return ""; // Return empty if no time exists
    return isoTime.split("T")[1].slice(0, 5); // Extract HH:MM from ISO string (24-hour format)
  };
  
  const [signature, setSignature] = useState(null);

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

  const handleEvidence = async (records) => {
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
      recordSource: records.agency ||"",
      signature: records.signature || null,
      evidence: records.evidence || null,
    });
    handleEvidence(records)
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

const handleCloseModal = () => {
  document.body.classList.remove("modal-open");
  setAgencyModal("");
};
//paid modal
const today = new Date().toISOString().split("T")[0];

const handlePaid = (records) => {
  console.log("Paid record:", records); 
  setFormState({
    _id: records._id,
    oRNo: records.oRNo || "", 
    datepaid: records.datepaid || today, 
  });

  setSelectedData(records);
  setIsModalOpenPaid(true);
};

const [editingOR, setEditingOR] = useState("");
const [editingDatePaid, setEditingDatePaid] = useState("");

const handlePaidUpdate = async () => {
  // Ensure a valid record is selected
  if (!selectedData || !selectedData._id) {
    console.error("No record selected for update.");
    return;
  }

  // Prepare the update data
  const updateData = {
    fineStatus: "Paid",       // update fineStatus to "Paid"
    oRNo: formState.oRNo,
    datepaid: formState.datepaid,// updated date paid
  };

  try {
    // Send a PUT request to update the record by its _id
    const response = await axios.put(
      `http://localhost:3001/editRecords/${selectedData._id}`,
      updateData,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200) {
      console.log("Record updated successfully!");
      // Optionally refresh the records list and close the modal
      if (typeof fetchRecords === "function") {
        fetchRecords();
      }
      closeModal();
    } else {
      console.error("Failed to update record. Response:", response);
    }
  } catch (error) {
    console.error("Error updating record:", error);
    alert("Error updating record. Please try again.");
  } finally {
    setFormState({ oRNo: "", datepaid: "" });
  }
};

  const [formState2, setFormState2] = useState({
    violationType: "",
    recordSource: "",
  });

  
const [agencyModal, setAgencyModal] = useState(""); // Controls ICTPMO modal display
// For ICTPMO modal we use separate ticket number state
const [ictpmoTicketNumber, setIctpmoTicketNumber] = useState(() => {
  return localStorage.getItem("lastTicketNumber") || "0001";
})
// We also create an editable record state for the modal
const [ictpmoRecord, setIctpmoRecord] = useState({
  nameOfDriver: "",
  address: "",
  violationType: "",
  dateOfApprehension: "",
  apprehendingOfficer: "",
});

const handleIctpmoCloseModal = () => {
  document.body.classList.remove("modal-open");
  setAgencyModal("");
};

const handleIctpmoDownloadPDF = async () => {
  const closeButton = document.querySelector(".close-modal");
  const downloadButton = document.querySelector(".no-print");
  try {
    const modalContent = document.querySelectorAll(".insidepage"); // Select all pages
    // Ensure buttons exist before modifying them
    if (closeButton) closeButton.classList.add("hidden");
    if (downloadButton) downloadButton.classList.add("hidden");

    const pdf = new jsPDF("p", "mm", [215.9, 370.6]);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const pages = document.querySelectorAll(".insidepage");
    if (!pages.length) {
      console.error("No .insidepage elements found.");
      return;
    }

    for (let i = 0; i < pages.length; i++) {
      const clone = pages[i].cloneNode(true);

      // Convert textareas into divs
      const textAreas = clone.querySelectorAll("textarea");
      textAreas.forEach((ta) => {
        const cs = window.getComputedStyle(ta);
        const div = document.createElement("div");
        div.innerText = ta.value;
        div.style.width = cs.width;
        div.style.height = cs.height;
        div.style.font = cs.font;
        ta.parentNode.replaceChild(div, ta);
      });

      // Create an off-screen container
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "794px";
      clone.style.width = "794px";
      container.appendChild(clone);
      document.body.appendChild(container);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Capture screenshot with html2canvas
      const canvas = await html2canvas(clone, { scale: 2 });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0,15, pdfWidth, imgHeight);
    }

    pdf.save(`CASE_${ictpmoRecord.nameOfDriver}.pdf`);

    // Increment Ticket Number and store in localStorage
    setIctpmoTicketNumber((prev) => {
      const newNumber = (parseInt(prev) + 1).toString().padStart(4, "0");
      localStorage.setItem("lastTicketNumber", newNumber);
      return newNumber;
    });

    handleCloseModal();
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
     // Ensure buttons exist before modifying them
    if (closeButton) closeButton.classList.add("hidden");
    if (downloadButton) downloadButton.classList.add("hidden");
  }
};


// Render function for the ICTPMO modal
const renderIctpmoModal = () => {
  const questions = [
    "Q1: Do you swear to tell the truth and nothing but the truth?",
    "Q2: What is your full name?",
    "Q3: What is your address?",
    "Q4: What is your contact number?",
    "Q5: What is the nature of your complaint?",
    "Q6: Can you describe the incident?",
    "Q7: Where did the incident occur?",
    "Q8: What time did the incident happen?",
    "Q9: Who was involved in the incident?",
    "Q10: Were there any witnesses?",
    "Q11: Did you sustain any injuries?",
    "Q12: Do you have supporting evidence?",
    "Q13: Do you wish to provide additional remarks?",
  ];

  // Track total height used per page
  let currentPageHeight = 0;
  const maxPageHeight = 800; // Adjust this based on your layout
  let pages = [];
  let currentPage = [];

  questions.forEach((question, index) => {
    // Estimate the height of question + input box
    const estimatedHeight = 60; // Adjust based on actual rendering

    if (currentPageHeight + estimatedHeight > maxPageHeight) {
      // Start a new page
      pages.push(currentPage);
      currentPage = [];
      currentPageHeight = 0;
    }

    currentPage.push(question);
    currentPageHeight += estimatedHeight;
  });

  // Push the last remaining questions to a new page
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  if (agencyModal === "ICTPMO") {
    return (
      <div className="modalall" onRequestClose={closeModal}>
        <div className="modal" onRequestClose={closeModal}>
          <div className="modal-header-button">
            <button className="no-print" onClick={handleIctpmoDownloadPDF} style={{ border: "none", outline: "none" }}>
            <FontAwesomeIcon icon={faDownload} style={{marginRight:"5"}}/>Download
            </button>
            <button className="close-modal" onClick={handleIctpmoCloseModal} style={{ border: "none", outline: "none" }}>
            <FontAwesomeIcon icon={faXmark} style={{marginRight:"15"}}/>Close
            </button>
          </div>

          <div className="page">
            {/* First Page - Transmittal */}
            <div className="insidepage">
              <div className="modal-header">
                <div className="seal-container">
                  <img src="/seal.png" alt="Official Seal" className="seal" />
                </div>
                <div className="titleview">
                  <p>Republic of the Philippines</p>
                  <p>City of Philippines</p>
                  <p>Office of the City Administrator</p>
                  <h3>Iligan City Traffic and Parking Management Office</h3>
                  <p>IBJT-North, Tambo, Hinaplanon, Iligan City</p>
                </div>
                <div className="logo-container">
                  <img src="/ictpmo.jpg" alt="Logo" className="logoictpmo" />
                </div>
              </div>

              <div className="modal-body">
                <div className="det">
                  <h4>
                    Date:{" "}
                    {currentDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}
                  </h4>
                  <h4>
                    T.S.-{new Date().getFullYear().toString().slice(-2)}-
                    <span
                      contentEditable="true"
                      onBlur={(e) => {
                        let newNumber = e.target.innerText.replace(/\D/g, "");
                        newNumber = Math.min(Math.max(parseInt(newNumber || "1", 10), 1), 9999)
                          .toString()
                          .padStart(4, "0");
                        setIctpmoTicketNumber(newNumber);
                      }}
                      suppressContentEditableWarning={true}
                      style={{ outline: "none", cursor: "text" }}
                    >
                      {ictpmoTicketNumber}
                    </span>
                  </h4>
                </div>

                <p>Iligan City Traffic and Parking Management Office</p>
                <br />

                <table className="no-border-table" style={{ tableLayout: "fixed", width: "100%" }}>
                  <tbody>
                    <tr>
                      <td>
                        <b>TO</b>
                      </td>
                      <td>:The Prosecutor’s Office</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>:Hall of Justice, Iligan City</td>
                    </tr>
                    <tr>
                      <td>
                        <b>SUBJECT</b>
                      </td>
                      <td>:Transmittal</td>
                    </tr>
                  </tbody>
                </table>

                <br />
                <p>
                  &emsp;&emsp;&emsp;&emsp;&emsp;1. Transmitted herewith the Traffic Citation Ticket for violation of City
                  Ordinance No. 02-4256, otherwise known as <b>"The New Traffic Code of Iligan City."</b>
                </p>
                <br />

                <table className="details-table" style={{ tableLayout: "fixed", width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Name/Address</th>
                      <th>Violation/s</th>
                      <th>Date Apprehended</th>
                      <th style={{ width: "100px" }}>Apprehending Officer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {ictpmoRecord.nameOfDriver || "N/A"}
                        <br />
                        {ictpmoRecord.address || "N/A"}
                      </td>
                      <td>
                        {ictpmoRecord.violationType
                          ? ictpmoRecord.violationType.split(",").map((v, idx) => (
                              <div key={idx}>
                                {idx + 1}. {v.trim()}
                              </div>
                            ))
                          : "N/A"}
                      </td>
                      <td>
                        {ictpmoRecord.dateOfApprehension
                          ? new Date(ictpmoRecord.dateOfApprehension).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            })
                          : "N/A"}
                      </td>
                      <td>{ictpmoRecord.apprehendingOfficer || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <br />

              <div className="admin">
                <div>
                  <input
                    type="text"
                    value={ictpmoInputValue}
                    onChange={handleIctpmoInputChange}
                    className="editable-input"
                    placeholder="Enter name here"
                    style={{
                      border: "none",
                      outline: "none",
                      width:"fit-content",
                      cursor: "text",
                      textAlign:"center",
                      height: "20px"
                    }}
                  />
                </div>
                <p>TCT Case In Charge</p>
              </div>
            </div>

            {/* Page Break */}
            <div className="page-break"></div>

            {/* Second Page - Affidavit */}
            <div className="insidepage">
              <div className="affidavit"> 
              <div className="affidavitheader">
                  <p>Republic of the Philippines <br/>
                    Iligan City&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )S.S. <br/>
                    X-----------------------------------/ </p>
                  <h3>AFFIDAVIT OF COMPLAINT </h3>
                  <p className="titleviewp">(THIS IS THE JUDICIAL AFFIDAVIT OF
                    {" "}<strong>{ictpmoRecord.nameOfDriver|| "N/A"}</strong> {" "}
                    TAKEN BEFORE BY TRAFFIC ENFORCER 
                    <input
                    type="text"
                    className="editable-input"
                    placeholder="Enter name here"
                    style={{
                      border: "none",
                      outline: "none",
                      width:"max-content",
                      cursor: "text",
                      textAlign:"center",
                      height: "20px",
                      fontWeight:"800",
                      fontSize:"14px",
                      fontFamily: "Times New Roman, Times, serif"
                    }}
                  />
                    OF ILIGAN CITY TRAFFIC PARKING AND MANAGEMENT OFFICE 
                    IBIT TAMBO HINAPLANON, ILIGAN CITY WHERE THE EXAMINATION WAS CONDUCTED.)  </p>
                    <p>Legend: Q - Question; T - Translation; A - Answer</p>
                </div>
                <div className="QA">
                  <h3>1. Q: Do you swear to tell the truth and nothing but the truth?  </h3>
                    <p>A:
                    <input
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                       height: "20px", textAlign:"left"
                      }}
                    />
                    </p>
                  <h3>2. Q: Please state your personal circumstances </h3>
                    <p>A:
                    <textarea
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                         textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>3. Q: Why are you here at ICTPMO?  </h3>
                    <p>A:
                    <input
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                        height: "20px", textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>4. Q: What nature of complaint?  </h3>
                    <p>A: 
                      <textarea
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                        textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>5. Q: When and where did the offense happen?</h3>
                    <p>A:
                    <textarea
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                         textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>6. Q: How did it happen?  </h3>
                    <p>A:
                    <textarea
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                         textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>7. Q: What happened thereafter?  </h3>
                    <p>A:
                    <textarea
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                         textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>8. Q: What did you do after the incident?  </h3>
                    <p>A:
                    <textarea
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                        textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>9. Q: Who drove the Vehicle?  </h3>
                    <p>A: 
                      <textarea
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text address"
                      style={{
                       textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>10. Q: What happened next?  </h3>
                    <p>A:
                    <textarea
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                        textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>11. Q: Do you all affirm the truthfulness of your statement in this affidavit? </h3>
                    <p>A:
                    <input
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                        height: "20px", textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>12. Q: Do you voluntarily answer all the questions asked to you in this affidavit? </h3>
                    <p>A:
                    <input
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                        height: "20px", textAlign:"left"
                       }}
                    />
                    </p>
                  <h3>13. Q: Are you aware that this affidavit is under oath which means that you may be 
                      prosecuted for perjury or false Testimony if it turns out that you lied about any of the answers 
                      you have given in response to the question propounded to you? </h3>
                    <p>A:
                    <input
                      type="text"
                      className="editable-inputQA"
                      placeholder="Enter text here"
                      style={{
                        height: "20px", textAlign:"left"
                       }}
                    />
                    </p>
                </div>
              </div>
            </div>

            <div className="page-break"></div>

            {/* Third Page - Attestation */}
            <div className="insidepage">
              <div className="affidavitA"> 
              <div className="affidavitheader1">
              <p className="titleviewpA">
                  <b>IN WITNESS WHEREOF</b>, I have hereunto affixed my signature this{" "}
                  {getDayWithSuffix(new Date().getDate())} day of {new Date().toLocaleString("default", { month: "long" })}{" "}
                  at Iligan City, Philippines.
                </p>
                    <div className="adminA">
                      <div>
                      {" "}<strong>{ictpmoRecord.nameOfDriver|| "N/A"}</strong> {" "}
                      </div>
                      <p>Affiant</p>
                    </div>
                </div>
                <div className="attest">
                  <h3>ATTESTATION </h3>
                  <p className="titleviewpA">
                    <b>I HEREBY CERTIFY</b>,  that I personally supervised the examination of the above named affiant 
                    conducted by
                    {" "}<strong>{ictpmoRecord.apprehendingOfficer|| "N/A"}</strong> {" "}
                    and I have caused to be recorded the questions propounded to 
                    him as well as the corresponding answer were given freely and voluntarily by said affiant without 
                    being coached by the undersigned or any person then present.  
                    <br/>  <br/>
                    {currentDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}{"  "}
                    at Iligan City, Philippines
                    
                    </p>
                    
                    <div className="adminAT">
                      <div>
                        <input
                          type="text"
                          value={ictpmoInputValue3}
                          onChange={handleIctpmoInputChange3}
                          className="editable-input"
                          placeholder="ENTER NAME HERE"
                          style={{
                            border: "none",
                            outline: "none",
                            width:"300px",
                            cursor: "text",
                            textAlign:"right",
                            fontWeight:"800",
                            fontSize:"16px",
                            fontFamily:"Inter",
                            height: "20px"
                          }}
                        />
                      </div>
                      <p><input
                          type="text"
                          className="editable-input"
                          placeholder="Position"
                          style={{
                            border: "none",
                            outline: "none",
                            width:"300px",
                            cursor: "text",
                            textAlign:"right",
                            height: "20px",
                            fontWeight:"700",
                            fontSize:"16px",
                            fontFamily:"Inter",
                            marginTop:"-20px",
                          }}
                        /> </p>
                      <p><input
                          type="text"
                          className="editable-input"
                          placeholder="Agency"
                          style={{
                            border: "none",
                            outline: "none",
                            width:"300px",
                            cursor: "text",
                            height: "23px",
                            fontWeight:"700",
                            fontSize:"15px",
                            fontFamily:"Inter",
                            marginTop:"-20px",
                            textAlign:"right",
                          }}
                        /> </p>
                    </div><br/> <br/><br/><br/>
                    <p className="titleviewpA">
                    <b>SUBSCRIBED AND SWORN</b> to before me this 
                    {" "} {currentDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}{" "}
                    at Iligan City, Philippines.
                    </p>
                    <div className="adminAT">
                    <div>
                        <input
                          type="text"
                          className="editable-input"
                          placeholder="ENTER NAME HERE"
                          style={{
                            border: "none",
                            outline: "none",
                            width:"300px",
                            cursor: "text",
                            height: "20px",
                            textAlign:"right",
                            fontWeight:"800",
                            fontSize:"16px",
                            fontFamily:"Inter",
                            height: "20px"
                          }}
                        />
                      </div>
                      <p><input
                          type="text"
                          className="editable-input"
                          placeholder="Position"
                          style={{
                            border: "none",
                            outline: "none",
                            width:"300px",
                            cursor: "text",
                            textAlign:"right",
                            height: "20px",
                            fontWeight:"800",
                            fontSize:"16px",
                            fontFamily:"Inter",
                            marginTop:"-20px",
                          }}
                        /> </p>
                      <p><input
                          type="text"
                          className="editable-input"
                          placeholder="Agency"
                          style={{
                            border: "none",
                            outline: "none",
                            width:"300px",
                            cursor: "text",
                            height: "23px",
                            fontWeight:"800",
                            fontSize:"15px",
                            fontFamily:"Inter",
                            marginTop:"-20px",
                            textAlign:"right",
                          }}
                        /> </p>
                    </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
  return null;
};

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

const handleOpenIctpmo = (record) => {
// Pre-fill the modal with the record's data
setIctpmoRecord({
  nameOfDriver: record.nameOfDriver,
  address: record.address,
  violationType: record.violationType,
  dateOfApprehension: record.dateOfApprehension,
  apprehendingOfficer: record.apprehendingOfficer,
});
// Add the modal-open class to the body for proper styling
document.body.classList.add("modal-open");
// Set the state to trigger the ICTPMO modal rendering
setAgencyModal("ICTPMO");
};

// Compute final sorted records
const finalSortedRecords = [...filteredData]
// Filter out records with fineStatus "Paid"
.filter(record => 
  record.apprehendingOfficer === officerName && 
  !record.officerremoved
)
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



// Handle search input change
const handleSearchChange = (event) => {
  setSearchQuery(event.target.value);
  setCurrentPage(1); // Reset to first page when searching
};

  const [rowsPerPage] = useState(10);
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const filteredRecords = records.filter((record) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      record.ticketNumber.toString().toLowerCase().includes(lowerCaseQuery) ||
      record.nameOfDriver.toLowerCase().includes(lowerCaseQuery) ||
      record.vehicleClassification.toLowerCase().includes(lowerCaseQuery) ||
      record.placeOfViolation.toLowerCase().includes(lowerCaseQuery) ||
      record.violationType.toLowerCase().includes(lowerCaseQuery) ||
      record.apprehendingOfficer.toLowerCase().includes(lowerCaseQuery)
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
      record.vehicleClassification.toLowerCase().includes(lowerCaseQuery) ||
      record.placeOfViolation.toLowerCase().includes(lowerCaseQuery) ||
      record.violationType.toLowerCase().includes(lowerCaseQuery) ||
      record.apprehendingOfficer.toLowerCase().includes(lowerCaseQuery)
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
  


  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <OfficerHeader isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="main-section1">
        <div className="cards-container">
          <div className="card">
          <h3><FontAwesomeIcon icon={faTicket} size="xl" rotation={90} style={{marginRight:"5"}}/>
            Total Violations</h3>
            <p>{totalViolations}</p> {/* Display total violation count */}
          </div>
          <div className="card">
          <h3><FontAwesomeIcon icon={faTicket} size="xl" rotation={90} style={{marginRight:"5"}}/>
         Highest Violation Type </h3>
          <p>{mostCommonViolation.count} for {mostCommonViolation.type}</p>

            </div>
          <div className="card">
          <h3><FontAwesomeIcon icon={faCab} size="xl" style={{marginRight:"5"}}/>
          Highest Vehicle Classification</h3>
          <p>{mostCommonVehicle.count} for {mostCommonVehicle.classification}</p>
            </div>

            <div className="card">
            <h3><FontAwesomeIcon icon={faMapLocation}  size="xl" style={{marginRight:"5"}}/>
            Top 3 Places with Most Violations</h3>
                {top3Places.map((place, index) => (
                  <li key={index}>{place.place}: {place.count} violations</li>
                ))}
          </div>
        </div>

    
        <div className="records-oftable">
        <div className="records-header">
          <h3 className="recorh2"><FontAwesomeIcon icon={faRectangleList} style={{marginRight:"10"}} />Records
          <div className="search-bar">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search" /> <FontAwesomeIcon icon={faMagnifyingGlass} className="searchIcon" />
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
          <button onClick={openModal} className="adddata"> <FontAwesomeIcon icon={faUserPlus} style={{color: "#ffffff", marginRight:"5"}} />Add Record</button>

        </div>

        <div  className="records-officer" style={{overflow:"auto"}}>
          <table  style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
                <tr>
                    <th style={{ width: "60px" }} onClick={() => handleSort('ticketNumber')}>Ticket No.</th>
                     <th style={{ width: "80px" }}  onClick={() => handleSort('dateOfApprehension')}>Date of Apprehension</th>
                    <th style={{ width: "80px" }} onClick={() => handleSort('nameOfDriver')}>Driver's Name</th>
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
                    <th style={{ width: "40px" }} >Fine Amount</th>
                    {/* <th>Timer</th> */}
                    <th style={{ width: "50px" }} >Fine Status</th>
                    <th style={{ width: "30px" }}></th>
                  </tr>
            </thead>
            <tbody>
            {loading ? (
                  <tr>
                    <td colSpan="16" className="norecord"><p>Loading records...</p> </td>
                  </tr>
                ) : currentRecords
                .length > 0 ? (
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
                          <textarea
                            ref={inputRef}
                            value={editingViolationValue}
                            onChange={(e) => setEditingViolationValue(e.target.value)}
                            onBlur={() => handleViolationUpdate(records._id)}
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
                      {/* <td>
                        {isRecordOverdue(records) ? (
                          <button className="file" 
                            onClick={() => handleOpenIctpmo(records)}
                          >
                            File a Case
                          </button>
                        ) : (
                          getRemainingTime(records?.dueDate, records?.fineStatus)
                        )}
                      </td> */}
                      <td>{records?.fineStatus}</td>
                      <td>
                        <div className="buttonsof">
                          <button className="edit-button" onClick={() => handleEdit(records)}>
                            <FontAwesomeIcon icon={faPen} style={{ color: "#fff" }} />
                          </button>
                            {/* <button
                            className="view-more-button"
                            onClick={() => handleViewMore(records)}
                          >
                            <FontAwesomeIcon icon={faEllipsisH} style={{ color: "#fff" }} />
                          </button> */}
                          <button
                              className="delete-button"
                              onClick={() => handleDelete(records)}
                            >
                              <FontAwesomeIcon icon={faTrashCan} style={{color:"#fff"}}   />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="16" className="norecord">
                      <p>No records to display</p>
                    </td>
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

      <br/><br/>
 {/*  
<div className="records-section">
<Map onCsvUpload={handleCsvData} />
</div>*/}

        <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal-contentovr" overlayClassName="overlayovr1">
      
               <h2><FontAwesomeIcon icon={faTicket} style={{marginRight:"10px"}}/> {selectedData ? "Edit Record" : "Add New Record"}</h2>
                <form onSubmit={handleSubmit} className="add-formovr">
                 <label htmlFor="ticket-id">Ticket Number/ID <span style={{ color: 'red' }}>*</span></label>
                  <input
                    id="ticket-id"
                    type="text"
                    placeholder="Enter ticket number"
                    value={formState.ticketNumber || ticketNumberinc} // Use ticketNumberinc for default, but allow manual input
                    onChange={(e) => setFormState({ ...formState, ticketNumber: e.target.value })} // Update formState when the user changes the value
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
                <label htmlFor="date-of-apprehension">Date of Apprehension <span style={{ color: 'red' }}>*</span></label>
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
                  required
                  onChange={(e) => setFormState({ ...formState, timeOfApprehension: e.target.value })}
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
      
                  <label htmlFor="email">Email<span style={{ color: 'red' }}>*</span></label>
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
      
                <label htmlFor="place-of-violation">Place of Violation <span style={{ color: 'red' }}>*</span></label>
                <select 
                  id="place-of-violation" 
                  value={formState.placeOfViolation||""}  
                  onChange={(e) => setFormState({ ...formState, placeOfViolation: e.target.value })} 
                  required
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
                    <option value="TOMAS L. CABILI (TOMINOBO PROPER)">TOMAS L. CABILI</option>
                    <option value="TUBOD">TUBOD</option>
                    <option value="UBALDO LAYA">UBALDO LAYA</option>
                    <option value="UPPER HINAPLANON">UPPER HINAPLANON</option>
                    <option value="UPPER TOMINOBO">UPPER TOMINOBO</option>
                    <option value="VILLA VERDE">VILLA VERDE</option>

                </select>
      
                <label htmlFor="classsification-of-vehicle">Classification of Vehicle</label>
                    <select 
                      id="classsification-of-vehicle" 
                      value={formState.vehicleClassification||""} 
                      onChange={(e) => setFormState({ ...formState, vehicleClassification: e.target.value })} 
                
                    >
                      <option value="" disabled hidden>
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
                    value={formState.vehicleModel}
                    onChange={(e) => setFormState({ ...formState,   vehicleModel: e.target.value })}
            
                  />
                  </div>
                <div className="form-groupovr">
                <label htmlFor="year">Year</label>
                  <input
                    id="year"
                    type="number"
                    placeholder="Vehicle Year"
                    value={formState.vehicleYear}
                    onChange={(e) => setFormState({ ...formState, vehicleYear: e.target.value })}
                    
                  />
                   </div>
                   <div className="form-groupovr">
                   <label htmlFor="color">Vehicle Color</label>
                  <input
                    id="color"
                    type="text"
                    placeholder="Vehicle Color"
                    value={formState.vehicleColor}
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
                    value={formState.vehicleOwnerAddress}
                    onChange={(e) => setFormState({ ...formState, vehicleOwnerAddress: e.target.value })}
                    
                  />   
      
                <label htmlFor="violation-type">Violation Type</label>
                <div id="violation-type" style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", marginBottom:"20px", borderRadius:"8px", fontFamily:"sans-serif" }}>
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
                          setFormState((prevState) => {
                            const violationType = Array.isArray(prevState.violationType) ? [...prevState.violationType] : []; // Safe initialization
                            if (e.target.checked) {
                              violationType.push(type);
                            } else {
                              const indexToRemove = violationType.indexOf(type);
                              if (indexToRemove !== -1) violationType.splice(indexToRemove, 1);
                            }
                            return {
                              ...prevState,
                              violationType: violationType,
                            };
                          });
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

                
              <label htmlFor="fine-status">Fine Status  <span style={{ color: 'red' }}>*</span></label>
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
                    <option value="PDL">Professional Driver's License (PDL)</option>
                    <option value="NPDL">Non-Professional Driver's License (NPDL)</option>
                    <option value="SP">Student Driver's Permit (SP)</option>
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

                <div className="e-sig">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin:"0px 0px 10px 0px" }}>
                    <label htmlFor="e-signature">Driver's E-Signature <span style={{ color: 'red' }}>*</span></label>
                    {!formState.signature?.data && !selectedData && (
                      <button onClick={() => canvasRef.current.clear()}>
                        Clear
                      </button>
                    )}
                  </div>

                  {formState.signature && formState.signature.data ? (
                    <img 
                      src={signature} 
                      className = "signature-canvas"
                    />
                  ) : !selectedData ? (
                    <SignatureCanvas
                      ref={canvasRef}
                      penColor="black"
                      canvasProps={{
                        className: "signature-canvas",
                       
                      }}
                    />
                  ) : (
                    <p style={{ marginTop: '10px', fontSize:"12px", fontStyle:"italic", marginLeft:"60px"  }}>Signature not available</p>
                  )}
                </div>
                <div >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin:"0px 0px 10px 0px" }}>
                    <label htmlFor="evidence">Evidential Photo<span style={{ color: 'red' }}>*</span> </label>
                  </div>

                  {formState.evidence && formState.evidence.data ? (
                    <img 
                    src={`data:${formState.evidence.contentType};base64,${formState.evidence.data}`} 
                    className="evidence"
                    style={{ maxWidth: '300px', maxHeight: '300px' }}
                    alt="Uploaded evidence"
                  />
                  
                  
                  ) : !selectedData ? (
                    <div className="form-group">
                      <input 
                        type="file" 
                        className="input-fieldsign" 
                        name="evidence"  
                        onChange={(e) => handleFileChange(e, setEvidence)}
                        required 
                      />
                    </div>
                  ) : (
                    <p style={{ marginTop: '10px', fontSize:"12px", fontStyle:"italic", marginLeft:"60px"  }}>Evidential Photo Not Available</p>
                  )}
                </div>
                <div className="modal-buttons">
                  {selectedData ? (
                      <button type="submit" onClick={handleUpdate} className="submit-button">Update Record 
                       <FontAwesomeIcon icon={faFloppyDisk} style={{color: "#ffffff", marginLeft:"10"}} /> 
                      </button>
                    ) : (
                      <button type="submit" onClick={handleSubmit} className="submit-button">Add Record
                         <FontAwesomeIcon icon={faUserPlus} style={{color: "#ffffff", marginLeft:"10"}} />
                      </button>
                    )}
                  <button type="button" className="close-modal-btn" onClick={closeModal}>Cancel <FontAwesomeIcon icon={faXmark} style={{color: "#ffffff", marginLeft:"10"}} /> </button>
                </div>
              </form>
            </Modal>
            <Modal
        isOpen={isModalOpenPaid}
        onRequestClose={closeModal}
        contentLabel="Add Record"
        className="modal-contentovrpaid"
        overlayClassName="overlayqr1"
      >
        <h2><FontAwesomeIcon icon={faMoneyBill1Wave}/> Paid Ticket </h2>
        <form onSubmit={handleSubmit} className="add-formovr">
          <div className="paidModal"> 
            <label htmlFor="ORno">Enter Official Receipt(OR) Number: </label>
            <input 
              id="ORno" 
              type="text" 
              value={formState.oRNo} 
              onChange={(e) => setFormState({ ...formState, oRNo: e.target.value })} 
              required 
            />
            <label htmlFor="Date-paid">Enter Date Paid:</label>
            <input 
              id="Date-paid" 
              type="date" 
              value={formState.datepaid} 
              onChange={(e) => setFormState({ ...formState, datepaid: e.target.value })} 
              required 
            />
            <div className="modal-buttons">
              <button type="submit"  onClick={handlePaidUpdate} className="submit-button">Update Record <FontAwesomeIcon icon={faFloppyDisk} style={{color: "#ffffff", marginLeft:"10"}} /></button>
              <button type="button" className="close-modal-btn" onClick={closeModal}>Cancel <FontAwesomeIcon icon={faXmark} style={{color: "#ffffff", marginLeft:"10"}} /> </button>
            </div>
          </div>
        </form>
      </Modal>
      {renderIctpmoModal()}
    </div>

  );
};

export default OfViolationRecords;