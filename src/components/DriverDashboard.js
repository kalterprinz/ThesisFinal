import React, { useRef, useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import {Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend,RadialLinearScale } from 'chart.js';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import iliganData from './iliganmap.json';
import "./all2.css";
import "leaflet/dist/leaflet.css";
import DriverRecords from './DriverRecords';
import Calendar from './Calendar';
import './LandingPage.css';
import './DriverDash.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faIdCard, faRectangleList } from '@fortawesome/free-solid-svg-icons';
import { faCircleUser } from "@fortawesome/free-solid-svg-icons/faCircleUser";
import { faGamepad } from "@fortawesome/free-solid-svg-icons/faGamepad";
import iciT from './iciT.png';
import DriverProfile from './DriverProfile';
//kirk selwyn miguel fuentevilla ycong
        //normailah macala
        //cate melody dalis
// Register chart components
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

const DriverDashboard = () => {
   const navigate = useNavigate();  
   
   useEffect(() => {
       const checkAuthentication = async () => {
         const driverId = localStorage.getItem('driverId');
   
         if (driverId) {
           // Check if driverId exists in the drivers' database
           const driverResponse = await fetch(`http://localhost:3001/getDriverById2/${driverId}`);
           if (driverResponse.ok) {
               console.log(`Driver found with id ${driverId}.`);
             
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

    // Function to handle button click
    const handleProfileClick = () => {
      navigate("/DriverProfile");  // Navigate to the profile page
    };
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("driverId");
      navigate("/login");  // Redirect to login page after logout
    };
    const [trafficData, setTrafficData] = useState([]);
    const [records, setRecords] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [geoJsonData] = useState(iliganData);
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const chartRef = useRef(null);
  useEffect(() => {
    if (chartRef.current) {
      if (window.innerWidth <= 420) {
        // Smaller screen size
        chartRef.current.style.width = "310px";
        chartRef.current.style.height = "170px";
      } else {
        // Larger screen size
        chartRef.current.style.width = "390x";
        chartRef.current.style.height = "210px";
      }
    }
  
  }, []);


    // Barangay alias mapping
  const barangayAliases = {
    "PALA-O": "PALAO",
    "PALAO": "PALAO",
    "BURU-UN": "BURUUN",
    "BURUUN": "BURUUN",
    "VILLAVERDE": "VILLA VERDE",
    "SANTA FILOMENA": "STA FILOMENA",
    "SANTA FELOMENA": "STA FILOMENA",
    "STA FELOMENA": "STA FILOMENA",
    "STA FILOMENA": "STA FILOMENA",
    "ACMAC":"ACMAC-MARIANO BADELLES SR."
  };

  // Normalize Barangay Names
  const normalizeString = (str) => {
    if (!str) return "";
    const normalized = str.toUpperCase().trim().replace(/[.,]/g, ""); // Remove punctuation
    return barangayAliases[normalized] || normalized; // Apply alias mapping
  };

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/traffic-data");
        const data = response.data;

        console.log("Raw Data from API:", data);

        const barangayList = [
          "ABUNO", "ACMAC-MARIANO BADELLES SR.", "BAGONG SILANG", "BONBONON",
          "BUNAWAN", "BURUUN", "DALIPUGA", "DEL CARMEN", "DIGKILAAN", "DITUCALAN",
          "DULAG", "HINAPLANON", "HINDANG", "KABACSANAN", "KALILANGAN", "KIWALAN",
          "LANIPAO", "LUINAB", "MAHAYAHAY", "MAINIT", "MANDULOG", "MARIA CRISTINA",
          "PALAO", "PANOROGANAN", "POBLACION", "PUGA-AN", "ROGONGON", "SAN MIGUEL",
          "SAN ROQUE", "SANTA ELENA", "SANTA FILOMENA", "SANTIAGO", "SANTO ROSARIO",
          "SARAY", "SUAREZ", "TAMBACAN", "TIBANGA", "TIPANOY", "TOMAS CABILI",
          "TUBOD", "UBALDO LAYA", "UPPER HINAPLANON", "UPPER TOMINOBO", "VILLA VERDE"
        ];

        // Normalize barangay list
        const normalizedBarangays = barangayList.reduce((acc, barangay) => {
          acc[normalizeString(barangay)] = barangay;
          return acc;
        }, {});

        // Aggregate occurrences
        const aggregated = data.reduce((acc, record) => {
          const place = normalizeString(record.placeOfViolation);
          const sortedBarangayKeys = Object.keys(normalizedBarangays).sort((a, b) => b.length - a.length);

        const matchedBarangay = sortedBarangayKeys.find(b => {
          const regex = new RegExp(`\\b${b}\\b`, "i");
          return regex.test(place);
        });


          if (matchedBarangay) {
            const actualBarangay = normalizedBarangays[matchedBarangay];
            acc[actualBarangay] = (acc[actualBarangay] || 0) + 1;
          }
          return acc;
        }, {});

        console.log("Aggregated Data:", aggregated);

        // Convert to array
        const trafficList = Object.keys(aggregated).map(barangay => ({
          barangay,
          count: aggregated[barangay],
        }));

        console.log("Final Traffic Data Array:", trafficList);

        setTrafficData(trafficList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching traffic data: ", error);
      }
    };

    fetchTrafficData();
  }, []);

const getTrafficCount = (barangayName) => {
    const normalizedBarangay = normalizeString(barangayName);
    const found = trafficData.find(data => normalizeString(data.barangay) === normalizedBarangay);
    return found ? found.count : 0;
  };

  const getColor = (count) => {
    if (count > 50) return '#67000d'; // darkest red
    if (count > 30) return '#a50f15';
    if (count > 10) return '#de2d26';
    if (count > 5)  return '#fb6a4a';
    if (count > 0)  return '#fcbba1';
    return '#fee0d2'; // lightest red
  };

const styleFeature = (feature) => {
  const barangayName = normalizeString(feature.properties.adm4_en);
  const trafficCount = getTrafficCount(barangayName);

  return {
      fillColor: getColor(trafficCount),
      weight: 1,
      color: 'gray',
      fillOpacity: 0.7
  };
};

const onEachFeature = (feature, layer) => {
  const barangayName = normalizeString(feature.properties.adm4_en);
  const trafficCount = getTrafficCount(barangayName);

  layer.bindTooltip(
    `<strong>${feature.properties.adm4_en}</strong><br>Traffic Violations: ${trafficCount}`,
    { direction: "center", className: "custom-tooltip", permanent: false }
  );
};

  const [violationTypeData, setViolationTypeData] = useState({}); // Doughnut chart data

// Allowed violations mapping
const allowedViolations = {
  "FAILURE TO CARRY OR/CR": 500,
  "EXPIRED OR/CR": 1000,
  "NO OR/CR": 500,
  "NO LOADING/UNLOADING": 100,
  "OBSTRUCTION TO SIDEWALK": 500,
  "UNREGISTERED/DELINQUENT/SUSPENDED VEHICLE": 2000,
  "DRIVING WITHOUT DRIVER'S LICENSE": 1500,
  "EXPIRED DRIVER'S LICENSE": 3000,
  "DRIVING UNDER THE INFLUENCE OF LIQUOR/DRUGS": 4000,
  "JAYWALKING": 300,
  "OVER SPEEDING": 1000,
  "NO HELMET/NON-WEARING OF CRASH HELMET": 500,
  "FAILURE TO OBEY TRAFFIC CONTROL DEVICE TRAFFIC LIGHTS/TRAFFIC ENFORCERS": 1000,
  "PARKING ON THE SIDEWALK": 500,
  "SMOKING INSIDE PUBLIC UTILITY VEHICLE": 1500,
  "WEARING OF SLIPPERS/SANDAL/SANDO": 150,
  "DRIVING WITH INVALID/DELINQUENT DRIVER'S LICENSE": 3000,
  "INVALID/NO FRANCHISE (COLORUM)": 5000,
  "RECKLESS DRIVING": 2000,
  "CONTRACTING": 2000,
  "NO PLATE NUMBER": 2000,
  "TRIP CUTTING": 500,
  "ILLEGAL PARKING": 0,
  "DISOBEDIENCE TO TRAFFIC ENFORCER/TRAFFIC CONTROL DEVICE/ TRAFFIC SIGNAL/SIGN": 1000,
  "MODIFIED ACCESSORIES": 500,
  "OVERLOADING/EXCESS PASSENGER": 100,
};

// Function to normalize violation names
const getCanonicalViolation = (violation) => {
  const lowerViolation = violation.toLowerCase();

  // Exact match
  for (const canonical of Object.keys(allowedViolations)) {
    if (canonical.toLowerCase() === lowerViolation) {
      return canonical;
    }
  }

  // Check for partial match
  for (const canonical of Object.keys(allowedViolations)) {
    const lowerCanonical = canonical.toLowerCase();
    if (lowerViolation.includes(lowerCanonical) || lowerCanonical.includes(lowerViolation)) {
      return canonical;
    }
  }

  // Handle specific cases
  if (["non wearing", "unauthorized helmet", "backride", "nutshell"].some(term => lowerViolation.includes(term))) {
    return "NO HELMET/NON-WEARING OF CRASH HELMET";
  }
  if (["colorum", "unregistered motor vehicle"].some(term => lowerViolation.includes(term))) {
    return "UNREGISTERED/DELINQUENT/SUSPENDED VEHICLE";
  }
  if (["no dl", "no drivers license", "no driver's license", "driving without drivers license", "failure to carry driver's license", "failure to carry drivers license", "failure to carry dl", "driving w/out driver`s license", "driving w/out drivers license", "driving w/o driver`s license", "driving w/o drivers license", "driving w/out dl", "no license", "driving without license", "failure to carry license", "failure carry license", "driving w/out license", "driving w/o license"].some(term => lowerViolation.includes(term))) {
    return "DRIVING WITHOUT DRIVER'S LICENSE";
  }
  if (["disobedience to traffic enforcement/pnp", "failure to obey traffic control devices/signs", "disobedience to traffic enforcer", "disobedience"].some(term => lowerViolation.includes(term))) {
    return "DISOBEDIENCE TO TRAFFIC ENFORCER/TRAFFIC CONTROL DEVICE/ TRAFFIC SIGNAL/SIGN";
  }
  if (["wearing of slipper/sandals (sleeveless) shirt", "wearing of sando/slippers not allowed", "wearing of sando slippers not allowed", "slipper not allowed", "wearing slipper", "wearing sando"].some(term => lowerViolation.includes(term))) {
    return "WEARING OF SLIPPERS/SANDAL/SANDO";
  }
  if (["no side mirrors", "no side mirror", "no horn", "no reflector mirror", "no canvas", "pipe", "improvised muffler", "improvise muffler", "illegal muffler", "head light", "broken plate", "plate light", "tail light", "signal lamp", "lamp light", "no wiper", "tinted", "mirror", "lamp", "windshield", "no head"].some(term => lowerViolation.includes(term))) {
    return "MODIFIED ACCESSORIES";
  }
  if (["expired or", "expire or", "expired cr", "expire cr", "expire or/cr", "expired cr/or", "expire cr/or"].some(term => lowerViolation.includes(term))) {
    return "EXPIRED OR/CR";
  }
  if (["failure to carry or", "failure to carry cr", "failure to carry cr/or", "failure carry or", "failure carry cr", "failure carry cr/or"].some(term => lowerViolation.includes(term))) {
    return "FAILURE TO CARRY OR/CR";
  }
  if (["no or", "no cr", "no cr/or"].some(term => lowerViolation.includes(term))) {
    return "NO OR/CR";
  }
  if (["no plate"].some(term => lowerViolation.includes(term))) {
    return "NO PLATE NUMBER";
  }

  return "OTHERS";
};

// Function to fetch data for doughnut charts
const fetchDoughnutData = async () => {
  try {
    // Retrieve driverId from localStorage
    const driverId = localStorage.getItem("driverId");
    if (!driverId) {
      console.error("Driver ID not found in localStorage");
      return;
    }

    // Fetch driver details to get email
    const driverResponse = await fetch(`http://localhost:3001/getDriver/${driverId}`);
    const driverData = await driverResponse.json();
    const driverEmail = driverData?.email;

    if (!driverEmail) {
      console.error("Driver email not found");
      return;
    }

    // Fetch all records
    const response = await fetch("http://localhost:3001/getRecords");
    const data = await response.json();

    // Filter records to include only violations committed by the logged-in driver
    const driverRecords = data.filter(record => record.email === driverEmail);

    // Process violation type data dynamically
    const violationCounts = {};
    driverRecords.forEach((record) => {
      const violations = record.violationType?.split(",").map((v) => v.trim());
      if (violations) {
        violations.forEach((violation) => {
          if (violation) {
            const canonical = getCanonicalViolation(violation);
            if (canonical) {
              violationCounts[canonical] = (violationCounts[canonical] || 0) + 1;
            }
          }
        });
      }
    });

    setViolationTypeData(violationCounts);
  } catch (error) {
    console.error("Error fetching records:", error);
  }
};

// Fetch data on component mount
useEffect(() => {
  fetchDoughnutData();
}, []);

  

 //search
  const [searchQuery, setSearchQuery] = useState("");
// Handle search input change
const handleSearchChange = (event) => {
  setSearchQuery(event.target.value);
  setCurrentPage(1); // Reset to first page when searching
};

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
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
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);


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
  

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };



//legend button
const [showLegend, setShowLegend] = useState(false); // State to track legend visibility

  const toggleLegend = () => {
    setShowLegend((prev) => !prev); // Toggle legend visibility
  };

 
 const [time, setTime] = useState({
     hours: new Date().getHours(),
     minutes: new Date().getMinutes(),
     seconds: new Date().getSeconds(),
   });
 
   useEffect(() => {
     const interval = setInterval(() => {
       const now = new Date();
       setTime({
         hours: now.getHours(),
         minutes: now.getMinutes(),
         seconds: now.getSeconds(),
       });
     }, 1000);
 
     return () => clearInterval(interval);
   }, []);
 
   const formatTime = (num) => (num < 10 ? `0${num}` : num); 
   //time
const today = new Date();
const formattedDate = today.toLocaleDateString('en-US')


//meter
const driverId = localStorage.getItem("driverId");

// Demerit points mapping
const violationPoints = {
  // Grave (5)
  "DRIVING UNDER THE INFLUENCE OF LIQUOR/DRUGS": 5,
  "INVALID/NO FRANCHISE (COLORUM)": 5,
  "DRIVING WITHOUT DRIVER'S LICENSE": 5,
  "DRIVING WITH INVALID/DELINQUENT DRIVER'S LICENSE": 5,

  // Less Grave (3)
  "RECKLESS DRIVING": 3,
  "UNREGISTERED/DELINQUENT/SUSPENDED VEHICLE": 3,
  "OVER SPEEDING": 3,

  // Light (1)
  "NO HELMET/NON-WEARING OF CRASH HELMET": 1,
  "FAILURE TO CARRY OR/CR": 1,
  "EXPIRED OR/CR": 1,
  "NO OR/CR": 1,
  "NO LOADING/UNLOADING": 1,
  "OBSTRUCTION TO SIDEWALK": 1,
  "EXPIRED DRIVER'S LICENSE": 1,
  "JAYWALKING": 1,
  "FAILURE TO OBEY TRAFFIC CONTROL DEVICE TRAFFIC LIGHTS/TRAFFIC ENFORCERS": 1,
  "PARKING ON THE SIDEWALK": 1,
  "SMOKING INSIDE PUBLIC UTILITY VEHICLE": 1,
  "WEARING OF SLIPPERS/SANDAL/SANDO": 1,
  "CONTRACTING": 1,
  "NO PLATE NUMBER": 1,
  "TRIP CUTTING": 1,
  "ILLEGAL PARKING": 1,
  "DISOBEDIENCE TO TRAFFIC ENFORCER/TRAFFIC CONTROL DEVICE/ TRAFFIC SIGNAL/SIGN": 1,
  "MODIFIED ACCESSORIES": 1,
  "OVERLOADING/EXCESS PASSENGER": 1,
};

const getComplianceLevel = (score) => {
  if (score >= 80) return "Very Poor";
  if (score >= 55) return "Poor";
  if (score >= 15) return "Fair";
  if (score >= 2) return "Good";
  return "Excellent";
};

const complianceDescriptions = {
  "Excellent": "Great job! You are adhering to traffic rules excellently.",
  "Good": "You are compliant with most traffic rules. Keep it up!",
  "Fair": "You are doing okay but there's room for improvement.",
  "Poor": "Your compliance is below average. Consider making changes.",
  "Very Poor": "You need to improve significantly to comply with traffic rules.",
  
};

const getDescription = (level) => complianceDescriptions[level] || "";

const [complianceScore, setComplianceScore] = useState(0);

useEffect(() => {
  const fetchComplianceData = async () => {
    try {
      if (!driverId) return;

      const driverRes = await fetch(`http://localhost:3001/getDriver/${driverId}`);
      const driverData = await driverRes.json();
      const driverEmail = driverData?.email;

      if (!driverEmail) return;

      const recordsRes = await fetch("http://localhost:3001/getRecords");
      const allRecords = await recordsRes.json();

      const driverRecords = allRecords.filter(record => record.email === driverEmail);

      let totalPoints = 0;

      console.log("▶ Driver Email:", driverEmail);
      console.log("▶ Found", driverRecords.length, "violation records.");

      driverRecords.forEach((record, index) => {
        const rawViolations = record.violationType || "";
        const violations = rawViolations.split(",").map(v => v.trim());

        console.log(`\n📄 Record ${index + 1}:`);
        console.log(" - Raw Violations:", rawViolations);

        violations.forEach(v => {
          const upper = v.toUpperCase();
          const points = violationPoints[upper] ?? 1;
          totalPoints += points;

          console.log(`   ✅ ${v} → +${points} point(s)`);
        });
      });

      console.log("\n🎯 Total Compliance Score:", totalPoints);
      setComplianceScore(totalPoints);
    } catch (error) {
      console.error("❌ Error fetching compliance data:", error);
    }
  };

  fetchComplianceData();
}, []);


const complianceLevel = getComplianceLevel(complianceScore);
const description = getDescription(complianceLevel);


const [timeLeft, setTimeLeft] = useState(null);

useEffect(() => {
  const fetchRecords = async () => {
    try {
      // Retrieve driverId from localStorage
      const driverId = localStorage.getItem("driverId");
      if (!driverId) {
        console.error("Driver ID not found in localStorage");
        return;
      }

      // Fetch driver details to get email
      const driverResponse = await fetch(`http://localhost:3001/getDriver/${driverId}`);
      const driverData = await driverResponse.json();
      const driverEmail = driverData?.email;

      if (!driverEmail) {
        console.error("Driver email not found");
        return;
      }

      // Fetch all records
      const response = await fetch("http://localhost:3001/getRecords");
      const data = await response.json();

      // Filter records for the logged-in driver
      const unpaidRecords = data.filter(
        (record) => record.fineStatus !== "Paid" && record.email === driverEmail
      );

      setRecords(unpaidRecords);

      if (unpaidRecords.length === 0) {
        setTimeLeft(null); // No records, so don't show countdown
        return;
      }

      // Find the record with the closest due date
      const now = new Date();
      let closestRecord = null;
      let minTimeDiff = Infinity;

      unpaidRecords.forEach((record) => {
        if (record.dueDate) {
          const dueDate = new Date(record.dueDate);
          const timeDiff = dueDate - now;

          if (timeDiff > 0 && timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestRecord = dueDate;
          }
        }
      });

      if (closestRecord) {
        setTimeLeft(minTimeDiff);
      } else {
        setTimeLeft(null); // No valid due date
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  fetchRecords();
}, []);

useEffect(() => {
  if (timeLeft !== null) {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 1000 ? prevTime - 1000 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }
}, [timeLeft]);

const formatTimeLeft = (milliseconds) => {
  if (milliseconds === null) return null; // Hide countdown if null

  const seconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
};


  return (
    <div className="landing-page">
        {/* Header */}
        <header className="headerdriver">
          <div className="logoheader">
            <img src={iciT} alt="Logo" />
          </div>
          <h4 className="titlel1">ILIGAN CITATION TICKET ONLINE</h4>
         <nav className="nav">
          <div class="buton">
              <a href="/">Home<FontAwesomeIcon icon={faHouse} style={{ marginLeft: "5px" }} /></a>
              <a href="/Game">Game <FontAwesomeIcon icon={faGamepad} style={{ marginLeft: "5px" }} /></a>
              <a href="/DriverDashboard">Profile<FontAwesomeIcon icon={faCircleUser} style={{ marginLeft: "5px" }} /></a>
              |
              <button className="logoutBtn" onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("driverId");
              window.location.reload();
              }}>
              Logout
              </button>
          </div>
        </nav>
        </header>
        <br/><br/>
        

        
        {/* Visual Section */}
        <section id="Visual" className="Visual">
              {/* Personal Section */}
          <div className="page-headerDF">
            <h2 style={{color:"#2b4450", marginBottom:"0px"}}><FontAwesomeIcon icon={faIdCard} style={{ marginRight: "20px" , marginLeft: "5px" }} />Profile</h2>
            <div className="countdown-inline">
            {timeLeft !== null && timeLeft > 0 && (
              <p>Time Left: <strong>{formatTimeLeft(timeLeft)}</strong></p>
            )}

            </div>
          </div>
          <DriverProfile/>

            <div className="visual-content">
                <div className="left">
                <div className="pie-chart">
                  <button className="legend-button" onClick={toggleLegend} >
                      {showLegend ? "Hide Legend" : "Show Legend"}
                  </button><br/>

                      <h2>Compliance Score</h2>
                      <p>Indicates how well the driver adheres to traffic rules based on their violation record</p>

                          {/* Legend */}
                          {showLegend && (
                            <div
                              style={{
                                marginBottom: "15px",
                                marginTop: "15px",
                                display: "contents",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-around",
                                  marginTop: "10px",
                                  width: "100%",
                                }}
                              >
                                {/* Legend Items in a Single Line */}
                                <div className="legendItems">
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                      style={{
                                        width: "10px",
                                        height: "2px",
                                        backgroundColor: "#4caf50",
                                        marginRight: "2px",
                                      }}
                                    ></div>
                                    <p style={{ margin: 0, color: "#4caf50", fontSize: "12px" }}>Excellent</p>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                      style={{
                                        width: "10px",
                                        height: "2px",
                                        backgroundColor: "#36a2eb",
                                        marginRight: "5px",
                                      }}
                                    ></div>
                                    <p style={{ margin: 0, color: "#36a2eb", fontSize: "12px" }}>Good</p>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                      style={{
                                        width: "10px",
                                        height: "2px",
                                        backgroundColor: "#ffcd56",
                                        marginRight: "5px",
                                      }}
                                    ></div>
                                    <p style={{ margin: 0, color: "#ffcd56", fontSize: "12px" }}>Fair</p>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                      style={{
                                        width: "10px",
                                        height: "2px",
                                        backgroundColor: "#ff9f40",
                                        marginRight: "5px",
                                      }}
                                    ></div>
                                    <p style={{ margin: 0, color: "#ff9f40" , fontSize: "12px"}}>Poor</p>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                      style={{
                                        width: "10px",
                                        height: "2px",
                                        backgroundColor: "#ff4d4d",
                                        marginRight: "5px",
                                      }}
                                    ></div>
                                    <p style={{ margin: 0, color: "#ff4d4d", fontSize: "12px" }}>Very Poor</p>
                                  </div>
                                  
                                </div>
                              </div>
                            </div>
                          )}
                            {/* Progress Bar */}
                          <div className="progressbar">
                            <div
                              style={{ width: "20%", height: "100%", backgroundColor: "#4caf50" }}
                            ></div>
                            <div
                              style={{ width: "20%", height: "100%", backgroundColor: "#36a2eb" }}
                            ></div>
                            <div
                              style={{ width: "20%", height: "100%", backgroundColor: "#ffcd56" }}
                            ></div>
                            <div
                              style={{ width: "20%", height: "100%", backgroundColor: "#ff9f40" }}
                            ></div>
                            <div
                              style={{ width: "20%", height: "100%", backgroundColor: "#ff4d4d" }}
                            ></div>

                            {/* Arrow Marker */}
                            <div  
                              className="dprogress"
                              style={{  left: `${complianceScore}%` }} ></div>
                            </div>

                          {/* Compliance Score Label */}
                          <div style={{ textAlign: "center", display:"inline-flex", margin:"0px 22px"}}>
                            <strong className="strongcon">
                              {complianceScore} Demerit Points - {complianceLevel}
                            </strong>
                            <p>{description}</p>
                          </div>
                        </div>

                <div className="pie-chart1" >
                    <h2 >Violation Type</h2>
                    <p>Show the breakdown of violations committed</p>
                    <div ref={chartRef} style={{ display: "flex", justifyContent:"center", alignItems:"center"}}>  
                       <Doughnut
                          data={{
                            labels: Object.keys(violationTypeData),
                            datasets: [
                              {
                                data: Object.keys(violationTypeData).map(
                                  (key) => violationTypeData[key]
                                ),
                                backgroundColor: Object.keys(violationTypeData).map(
                                  (_, index) => `hsl(${(index * 137.5) % 360}, 90%, 60%)`),
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: true },
                              datalabels: {
                                display: false // hide always-visible labels
                              }
                            },
                          }}
                        />
                        {showLegend && (
                    <div className="showlegenddf">
                      {Object.keys(violationTypeData).map((label, index) => (
                        <div
                          key={index}
                          style={{ display: "flex", alignItems: "center", margin: "2px" }}
                        >
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Generates distinct colors
                              marginRight: "5px",
                            }}
                          ></div>

                          <span style={{ fontSize: "10px", marginBottom:"-2px", marginTop:"-2px", justifyContent:"center", }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                    </div>
                    
                </div>
        
                </div>
                <div className="right">
                    <div className="map-page1">
                        <div style={{ flex: 2 }}>
                        <div className="mapdes">
                          <h2>Map of Iligan City</h2>
                          <p>Interactive Map Highlighting Common Violation Hotspots</p>
                        </div>
                        <div className="map-container12"> 
                        <MapContainer center={[8.246, 124.268]} zoom={12.5} className="leaflet-container121">
                                      <TileLayer
                                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                          attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                                      />
                                      {!isLoading && (
                                          <GeoJSON
                                              data={geoJsonData}
                                              style={styleFeature}
                                              onEachFeature={onEachFeature}
                                          />
                                      )}
                                  </MapContainer>
                        </div>
                        <div className="mapdes1">
                          <p>
                            Explore this interactive map to understand the distribution of traffic violations 
                            across Iligan City. The color-coded regions represent varying levels of violations, 
                            with darker shades indicating higher frequencies.
                          </p>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </section> 

        {/* Records Section */}
        
        <section id="Records" className="Records">
        <div className="page-headerDF">
            <h2 style={{color:"#2b4450", marginBottom:"0px"}}><FontAwesomeIcon icon={faRectangleList} style={{ marginRight: "20px" , marginLeft: "5px" }} />Transaction</h2>
          </div>
            <div className="records-content">
                <div className="left">
                      <DriverRecords/>
                 
                </div>
                <div className="right">
                  <div>
                    <Calendar />  
                  </div>
                </div>
            </div>
        </section> 
      
    </div>
  );
};

export default DriverDashboard;
