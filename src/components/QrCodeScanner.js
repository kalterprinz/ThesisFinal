import React, { useState, useEffect, useCallback, useRef  } from "react";
import Modal from "react-modal"; //
import { useNavigate } from "react-router-dom"; 
import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './QrCodeScanner.css';
import SidebarOfficer from './SidebarOfficer';
import OfficerHeader from './OfficerHeader';
import jsQR from 'jsqr';
import { faTicket, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import axios from 'axios';
import emailjs from '@emailjs/browser';
import SignatureCanvas from 'react-signature-canvas';

Modal.setAppElement("#root"); 
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


const QrCodeScanner = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [ticketModalIsOpen, setTicketModalIsOpen] = useState(false); // Add a state for the ticket modal
  const[licenseClassificationData, setlicenseClassificationData] = useState ({PDL: 0, NPDL:1, SP: 2});
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const [driverId, setDriverId] = useState(null);
  const [officerInfo, setOfficerInfo] = useState(null);
  const sigcanvasRef = useRef(null);
  const [signature, setSignature] = useState(null);
    
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

  const fetchOfficerInfo = async () => {
    try {
      const storedId = localStorage.getItem("driverId"); // or 'officerId' if named that
      if (!storedId) {
        throw new Error("No driverId found in localStorage");
      }

      console.log("Getting officer by ID:", storedId);

      const response = await fetch(`http://localhost:3001/getOfficerById/${storedId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch officer info: ${response.status}`);
      }

      const data = await response.json();
      console.log("Officer Info:", data);
      setOfficerInfo(data);
    } catch (err) {
      console.error("Error fetching officer info:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOfficerInfo();
  }, []);

  const [violationHistory, setViolationHistory] = useState([

  ]);


  console.log(driverId)
  const [driverInfo, setDriverInfo] = useState("");

const getDriverInfo = async () => {
  try {
    const response = await fetch(`http://localhost:3001/getdriver4/${driverId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const driverInfor = await response.json();
    console.log('Driver Info:', driverInfor);
    setDriverInfo(driverInfor);

    // You can now use driverInfo as needed in your app
    return driverInfo;

  } catch (error) {
    console.error('Failed to fetch driver info:', error);
    return null;
  }
};

useEffect(() => {
  if (driverId) {
    getDriverInfo();
  }
}, [driverId]);

  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis

const [loading, setLoading] = useState(true);
console.log(driverInfo.email);

const fetchViolationHistory = async () => {
  try {
    const response = await fetch(`http://localhost:3001/getrecordemail/${driverInfo.email}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.status}`);
    }

    const records = await response.json();
    console.log("Fetched Violation Records:", records);
    console.log("Violation History:", records);
    setViolationHistory(records); // make sure you declared this state
  } catch (error) {
    console.error("Error fetching violation history:", error);
    setError(error.message); // optional: if you want to display the error
  }
};

useEffect(() => {
  if (driverInfo?.email) {
    fetchViolationHistory();
  }
}, [driverInfo.email]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Error accessing camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    if (scanning) {
      setMessage('Scanning QR...');
      startCamera();
      requestAnimationFrame(scanQRCode);
    } else {
      setMessage('');
      stopCamera();
    }

    return stopCamera;
  }, [scanning]);

  const scanQRCode = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
  
      // Ensure the video element is ready
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        requestRef.current = requestAnimationFrame(scanQRCode);
        return;
      }
  
      // Set canvas dimensions
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
  
      // Draw video frame on the canvas
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
  
      // Get image data from the canvas
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
  
      // Decode QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height);
  
      if (code) {
        setQrCode(code.data);
        handleQrCodeData(code.data);
        setMessage('QR Code Detected!');
        setScanning(false);
        stopCamera();
        setModalIsOpen(true);
      } else {
        setMessage('QR Code not detected. Keep scanning...');
        requestRef.current = requestAnimationFrame(scanQRCode);
      }
    }
  };

  

  useEffect(() => {
    try {
      const parsedData = JSON.parse(qrCode);
      if (parsedData?.id) {
        setDriverId(parsedData.license);
      } else {
        setDriverId(null);
      }
    } catch (error) {
      console.error('Error parsing QR Code:', error);
      setDriverId(null);
    }
  }, [qrCode]); // Re-run whenever qrCode changes

  const renderQrCodeData = () => {
    return (
      <div className="scanned-data">
        {driverInfo ? (
          <>
            {/* Profile Picture */}
            {driverInfo.profilePic && driverInfo.profilePic.data && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
              <img
                src={`data:${driverInfo.profilePic.contentType};base64,${driverInfo.profilePic.data}`}
                alt="Driver Profile"
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  marginBottom: '1rem',
                  }}
              />
            </div>
            
            )}
  
            {/* Driver Details */}
            <p><strong>Name:</strong> {driverInfo.name}</p>
            <p><strong>Age:</strong> {driverInfo.age}</p>
            <p><strong>Gender:</strong> {driverInfo.gender}</p>
            <p><strong>Birthday:</strong> {new Date(driverInfo.birthday).toLocaleDateString()}</p>
            <p><strong>License Number:</strong> {driverInfo.DriLicense}</p>
          </>
        ) : (
          <p>No driver information found.</p>
        )}
      </div>
    );
  };
  


  const handleScanAgain = () => {
    setModalIsOpen(false);
    setQrCode("");
    setScanning(true); // Restart scanning
  };

  const handleCreateTicket = () => {
    setTicketModalIsOpen(true);  // Open the ticket creation modal
    setModalIsOpen(false);       // Close the QR scan modal
  };

  const [ticketNumberinc, setTicketNumber] = useState("000001");
  useEffect(() => {
      const savedTicketNumber = localStorage.getItem("lastTicketNumber2");
      if (savedTicketNumber) {
        setTicketNumber(savedTicketNumber); // Set ticket number from localStorage
      } else {
        setTicketNumber("000001"); // Set default ticket number if none exists in localStorage
      }
    }, []); 

  const handleQrCodeData = (data) => {
    try {
      const parsedData = JSON.parse(data); // Parse the QR code JSON
      setFormState((prevState) => ({
        ...prevState,
        ticketNumber: ticketNumberinc, // Generate ticket number
        nameOfDriver: parsedData.name || "",
        age: parsedData.age || "",
        gender: parsedData.gender || "",
        address: parsedData.address || "",
        email: parsedData.email || "",
        licenseNumber: parsedData.licenseNumber || "",
        phoneNumber: parsedData.contactNumber || "",
        dateOfBirth: parsedData.dateOfBirth || "",
      }));
    } catch (error) {
      console.error("Error parsing QR code data:", error);
    }
  };
  
  const [records, setRecords] = useState([]);

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

  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getNowDateTime = () => {
    const now = new Date();
    // Manually apply timezone offset to get correct local ISO
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const date = local.toISOString().split("T")[0]; // Local YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0].slice(0, 5); // HH:MM in local
    return { date, time };
  };

   const officerName = officerInfo?.name; 
   const offagency = officerInfo?.agency;
   const offassign = officerInfo?.assign?.toUpperCase();

   console.log("driverInfo:", driverInfo);
console.log("ticketNumberinc:", ticketNumberinc);
console.log("offagency:", offagency);
console.log("officerName:", officerName);

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
  dueDate: "",
  oRNo: "",
  datepaid: "",
  agency: ""
});

const convertToDateInputFormat = (mmddyyyy) => {
  const [month, day, year] = mmddyyyy.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};


useEffect(() => {
  if (driverInfo && ticketNumberinc && offagency && officerName) {
    setFormState((prev) => ({
      ...prev,
      ticketNumber: ticketNumberinc,
      nameOfDriver: driverInfo.name,
      gender: driverInfo.gender?.charAt(0).toUpperCase() + driverInfo.gender?.slice(1),
      age: driverInfo.age,
      dateOfBirth: driverInfo.birthday?.split("T")[0],
      address: driverInfo.address,
      phoneNumber: driverInfo.conNum,
      email: driverInfo.email,
      occupation: driverInfo.occu,
      dateOfApprehension: getNowDateTime().date,
      timeOfApprehension: getNowDateTime().time,
      licenseNumber: driverInfo.DriLicense,
      expirationDate: convertToDateInputFormat(driverInfo.DLExpireDate),
      licenseClassification: driverInfo.DLClass,
      agency: offagency,
      recordSource: offagency,
      apprehendingOfficer: officerName,
      placeOfViolation: prev.placeOfViolation || offassign,

    }));
  }
}, [driverInfo, ticketNumberinc, offagency, officerName, offassign]);

useEffect(() => {
  console.log("Updated formState:", formState);
}, [formState]);

const [evidence, setEvidence] = useState(null);

const handleFileChange = (e, setFile) => {
  const file = e.target.files[0];
  if (file) {
    setFile(file);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  let signatureImage = null;
    if (!sigcanvasRef.current.isEmpty()) {
      const dataUrl = sigcanvasRef.current.toDataURL("image/png");

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
  if (sigcanvasRef.current && !sigcanvasRef.current.isEmpty()) {
    const blob = await fetch(sigcanvasRef.current.toDataURL("image/png")).then(res => res.blob());
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
      closeModal();

  } catch (error) {
      console.error("Error submitting record:", error);
      alert("Error submitting record. Please check the details and try again.");
  }
};

  const handleScan = (data) => {
    if (data) {
      try {
        const scannedData = JSON.parse(data); // Parse JSON from QR code
        setFormState((prevState) => ({
          ...prevState,
          ...scannedData, // Update only matching keys
        }));
      } catch (error) {
        console.error("Error parsing QR code data:", error);
      }
    }
  };


  const openModal = () => {
    setFormState({
      ...formState,
    });
    setSelectedData(null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setTicketModalIsOpen(false);
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
      dueDate: "",
      oRNo: "",
      datepaid: "",
      agency: "",
    });
  };
  

  const [filteredData, setFilteredData] = useState([]);



const [fineAmount, setFineAmount] = useState("");
useEffect(() => {
  console.log("Record Source:", formState.recordSource);
  console.log("Violation Types Selected:", formState.violationType);

  if (formState.recordSource && Array.isArray(formState.violationType) && formState.violationType.length > 0) {
    const totalFine = formState.violationType.reduce((sum, violation) => {
      const fine = fineMapping[formState.recordSource]?.[violation];

      // Handle cases where the fine is a string (e.g., "1st 100 2nd 200")
      let fineValue = 0;
      if (typeof fine === "string") {
        // Extract all numeric values and take the first one
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
    setFineAmount(0); // Reset fine amount if no violations are selected
  }
}, [formState.recordSource, formState.violationType]);

// sample violation history table


console.log("Form state updated:", formState);

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
console.log("Evidence:", formState.evidence);


  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <OfficerHeader />
      <SidebarOfficer isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="main-section2">
        <div className="outerContainer">
          <div className="containerqr">
            <div className="newBox">
              <div className="contentWrapper">
                <div className="descriptionBox">
                  <p>Scan your QR Code</p>
                  <ul>
                    <li>Step 1. Prepare the QR code</li>
                    <li>Step 2. Prepare your camera</li>
                    <li>Step 3. Click the start scanning button</li>
                    <li>Step 4. Scan the QR code</li>
                  </ul>
                 
                </div>

                <div className="scannerWithDescription">
                  <div className="scannerBox">
                    <div className="videoWrapper">
                      <video ref={videoRef} autoPlay muted playsInline style={{ transform: 'scaleX(-1)' }} />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      <svg
                        className="qr-frame"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 200 200"
                      >
                        <rect x="30" y="30" width="140" height="140" stroke="white" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                    <button onClick={() => setScanning((prev) => !prev)} className="button">
                      {scanning ? 'Stop Scanning' : 'Start Scanning'}
                    </button><br/>
                    {message && <p>{message}</p>}
                    {qrCode && <p>QR Code Scanned</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                  </div>

                  <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    className="modalqrscan"
                    overlayClassName="overlayqr1"
                  >
                    <h2>Scanned QR Code</h2>
                    <hr></hr>
                    {/*<p>{qrCode}</p>*/}
                    {renderQrCodeData()}
                    <hr></hr>
                    <h4 style={{textAlign:"center"}}>Violation History table</h4>
                    <div className="modalqrscan-table">
                    
                  </div>

                  {violationHistory.length > 0 ? (
        <div className="viotable">
         <table style={{ tableLayout: "fixed", width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Violation</th>
              <th>Location</th>
              <th>Penalty</th>
              <th style={{ width: "50px" }} >Fine Status</th>
            </tr>
          </thead>
          <tbody>
            {violationHistory.map((record, index) => (
              <tr key={index}>
                 <td>{record.dateOfApprehension ? record.dateOfApprehension.split("T")[0] : "N/A"}</td>
                <td>{record.violationType}</td>
                <td>{record.placeOfViolation}</td>
                <td>₱{record.fineAmount}</td>
                <td>{record.fineStatus}</td>
              </tr>
            ))}
             </tbody>
        </table>
        </div>
      ) : (
        <p>No violation history.</p>
      )}
                  
                    <div className="modal-buttonsqr">
                      <button onClick={handleScanAgain} className="buttonqr">
                        Scan QR Again
                      </button>
                      <button onClick={handleCreateTicket} className="buttonqr">
                        Create Ticket
                      </button>
                    </div>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Ticket Modal */}
      <Modal
  isOpen={ticketModalIsOpen}
  onRequestClose={() => setTicketModalIsOpen(false)}
  className="modal-contentqr"
   overlayClassName="overlayqr1"
>
  
  <h2> <FontAwesomeIcon icon={faTicket} style={{marginRight:"10"}} />Create Ticket</h2>
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
        
                  <label htmlFor="violation-type">Violation Type <span style={{ color: 'red' }}>*</span></label>
                  <div id="violation-type" style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", marginBottom:"20px", borderRadius:"8px" }}>
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
                          required
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

                <div className="e-sig">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin:"0px 0px 10px 0px" }}>
                    <label htmlFor="e-signature">Driver's E-Signature <span style={{ color: 'red' }}>*</span></label>
                    {!formState.signature?.data && !selectedData && (
                      <button onClick={() => sigcanvasRef.current.clear()}>
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
                      ref={sigcanvasRef}
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
                    <label htmlFor="evidence">Evidential Photo<span style={{ color: 'red' }}>*</span></label>
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
                      <button type="submit" onClick={handleSubmit} className="submitadd">
                        Add Record
                      </button>
                    <button type="button" className="close-modal-btn" onClick={closeModal}>Cancel <FontAwesomeIcon icon={faXmark} style={{color: "#ffffff", marginLeft:"10"}} /> </button>
                  </div>
                </form>
</Modal>

    </div>
  );
};

export default QrCodeScanner;