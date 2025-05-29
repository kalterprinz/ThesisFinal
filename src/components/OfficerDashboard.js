import "./all.css";
import axios from "axios";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { Bar, Doughnut } from 'react-chartjs-2';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from './firebase';
import car from './cardash1.gif';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faCab, faFilter, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend } from 'chart.js';
import { faMapLocation } from "@fortawesome/free-solid-svg-icons/faMapLocation";
import OfficerHeader from './OfficerHeader';
import SidebarOfficer from  './SidebarOfficer';
import { Line as LineChart } from "react-chartjs-2";
import WordCloud from "react-wordcloud"; // Install this library

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

const OfficerDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility
    const [violationsPerBarangay, setViolationsPerBarangay] = useState({});
    const [isLoading, setIsLoading] = useState(true); 
     const [records, setRecords] = useState([]);
     const [filteredData, setFilteredData] = useState([]); // Ensure this is defined
     const [loading, setLoading] = useState(true); 
     const [showLegend, setShowLegend] = useState(false);
     const [showLegend1, setShowLegend1] = useState(false);   
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
              navigate('/AdminDashboard');
            } else if (officerData.role === 'Officer') {
              console.log(`Officer found with id ${driverId}.`);
              
            }  else if (officerData.role === 'Treasurer') {
              console.log(`Treasurer found with id ${driverId}.`);
              navigate('/treasurerdashboard');
            }else {
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
  

    //kirk selwyn miguel fuentevilla ycong
    //normailah macala
    //cate melody dalis

     // Function to toggle sidebar
    const toggleSidebar = () => {
      setIsSidebarOpen((prev) => !prev);
    };
  
    const [genderData, setGenderData] = useState({ Male: 0, Female: 0 });
    const [ageData, setAgeData] = useState([0, 0, 0, 0, 0]); // [0-18, 19-30, 31-40, 41-50, 51+]
    const [fineStatusData, setFineStatusData] = useState({ Paid: 0, Unpaid: 0 });
    const [vehicleClassificationData, setVehicleClassificationData] = useState({});//doughnut
    const [violationTypeData, setViolationTypeData] = useState({});//doughnut
    const [vehicleClassificationDataC, setVehicleClassificationDataC] = useState({}); //card
    const [violationTypeDataC, setViolationTypeDataC] = useState({});//card
  
  
  const fetchDemographicData = async (dataList) => {
    if (!dataList || dataList.length === 0) return;
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
    // --- VEHICLE CLASSIFICATION PROCESSING ---
    // Allowed vehicle types
    const allowedVehicles = ["MV", "MC", "PUJ", "TRI", "PVT","Goverment","PUB","PUV"];
  
    // Helper function to map a vehicle classification string (even with misspellings)
    // to one of the allowed canonical values.
    const getCanonicalVehicle = (vehicle) => {
      if (!vehicle) return null;
      const lower = vehicle.toLowerCase();
      
      // If it mentions motorcycle (or variants), classify as MC
      if (lower.includes("motorcycle") || lower.includes("mcycle") || lower === "mc") {
        return "MC";
      }
      // If it mentions private (or similar), classify as PVT
      if (lower.includes("private") || lower === "pvt" || lower.includes("pvt.")) {
        return "PVT";
      }
      // Check for allowed abbreviations or similar fragments
      if (lower.includes("mv")) return "MV";
      if (lower.includes("puj")) return "PUJ";
      if (lower.includes("tri")) return "TRI";
      
      return null;
    };
  
    // Count only records that match allowed vehicle classifications
    const vehicleCounts = {};
    dataList.forEach((record) => {
      const vehicle = record.vehicleClassification;
      const canonical = getCanonicalVehicle(vehicle);
      if (canonical && allowedVehicles.includes(canonical)) {
        vehicleCounts[canonical] = (vehicleCounts[canonical] || 0) + 1;
      }
    });
    setVehicleClassificationData(vehicleCounts);
  
    // --- VIOLATION TYPE PROCESSING (as before) ---
    // Allowed violations with fixed amounts (for reference/fine amount purposes)
    const allowedViolations = {
      "FAILURE TO CARRY OR/CR": 500,
      "EXPIRED OR/CR": 1000,
      "NO OR/CR":500,
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
      "ILLEGAL PARKING":0,
      "DISOBEDIENCE TO TRAFFIC ENFORCER/TRAFFIC CONTROL DEVICE/ TRAFFIC SIGNAL/SIGN":1000,
      "MODIFIED ACCESSORIES":500,
      "OVERLOADING/EXCESS PASSENGER":100,
    };
  
    // Helper function to map a violation string (even with possible misspellings)
    // to a canonical allowed violation name.
    const getCanonicalViolation = (violation) => {
      const lowerViolation = violation.toLowerCase();
      // First check for an exact match
      for (const canonical of Object.keys(allowedViolations)) {
        if (canonical.toLowerCase() === lowerViolation) {
          return canonical;
        }
      }
      // If not an exact match, check if the violation string contains key parts of any allowed violation.
      for (const canonical of Object.keys(allowedViolations)) {
        const lowerCanonical = canonical.toLowerCase();
        if (
          lowerViolation.includes(lowerCanonical) ||
          lowerCanonical.includes(lowerViolation)
        ) {
          return canonical;
        }
      }
      if (["non wearing", "unauthorized helmet","backride","nutshell"].some(term => lowerViolation.includes(term))) {
        return "NO HELMET/NON-WEARING OF CRASH HELMET";
      }
      if (["colorum","unregistered motor vehicle"].some(term => lowerViolation.includes(term))) {
        return "UNREGISTERED/DELINQUENT/SUSPENDED VEHICLE";
      }
      if (["no dl", "no drivers license","no driver's license","driving without drivers license","failure to carry driver's license","failure to carry drivers license", "failure to carry dl", "driving w/out driver`s license ", "driving w/out drivers license ", "driving w/o driver`s license ", "driving w/o drivers license ", "driving w/out dl", "no license","driving without license","failure to carry license","failure carry license", "driving w/out license ","driving w/o license "].some(term => lowerViolation.includes(term))) {
        return "DRIVING WITHOUT DRIVER'S LICENSE";
      }
      if (["disobedience to traffic enforcement/pnp","failure to obey traffic control devices/signs","disobedience to traffic enforcer","disobedience"].some(term => lowerViolation.includes(term))) {
        return "DISOBEDIENCE TO TRAFFIC ENFORCER/TRAFFIC CONTROL DEVICE/ TRAFFIC SIGNAL/SIGN";
      }
      if (["wearing of slipper/sandals (sleeveless) shirt","wearing of sando/slippers not allowed","wearing of sando slippers not allowed","slipper not allowed","wearing slipper","wearing sando"].some(term => lowerViolation.includes(term))) {
        return "WEARING OF SLIPPERS/SANDAL/SANDO";
      }
      if (["no side mirrors","no side mirror","no horn","no reflector mirror","no canvas","pipe","improvised muffler","improvise muffler", "illegal muffler", "head light", "broken plate", "plate light","tail light", "signal lamp","lamp light", "no wiper","tinted", "mirror","lamp","windshield", "no head"].some(term => lowerViolation.includes(term))) {
        return "MODIFIED ACCESSORIES";
      }
      if (["expired or","expire or","expired cr","expire cr","expire or/cr","expired cr/or","expire cr/or"].some(term => lowerViolation.includes(term))) {
        return "EXPIRED OR/CR";
      }
      if (["failure to carry or","failure to carry cr","failure to carry cr/or", "failure carry or","failure carry cr","failure carry cr/or"].some(term => lowerViolation.includes(term))) {
        return "FAILURE TO CARRY OR/CR";
      }
      if (["no or","no cr","no cr/or"].some(term => lowerViolation.includes(term))) {
        return "NO OR/CR";
      }
      if (["no plate"].some(term => lowerViolation.includes(term))) {
        return "NO PLATE NUMBER";
      }
      return "OTHERS";
    };
    const violationCounts = {};
    dataList.forEach((record) => {
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
  const fetchRecords = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3001/getRecords");
  
      if (Array.isArray(response.data)) {
        const dataList = response.data.reverse(); // Reverse order if needed
        setRecords(dataList);
        setFilteredData(dataList);
  
        // Fetch data for different purposes
        fetchDemographicData(dataList);
        fetchDoughnutData(dataList);
        fetchCardData(dataList);
      } else {
        console.error("Data is not an array");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchDemographicData, fetchDoughnutData, fetchCardData]); // Added dependencies
  
  
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  
  const [mostCommonViolation, setMostCommonViolation] = useState({ count: 0, type: "" });
  const [mostCommonVehicle, setMostCommonVehicle] = useState({ count: 0, classification: "" });
  const [top3Places, setTop3Places] = useState([]);
  const totalViolations = records.length; // Use `records` state to calculate this.
  
  
  
    //graphs
    const genderChartData = {
      labels: ['Male', 'Female'],
      datasets: [
        {
          label: 'Gender Distribution',
          data: genderData, // Example: [50, 30] for male and female counts
          backgroundColor: ['#4e73df', '#1cc88a'],
          borderColor: ['#4e73df', '#1cc88a'],
          borderWidth: 1,
        },
      ],
    };
    const genderChartOptions = {
      plugins: {
        legend: {
          display: true, // Show the legend
          labels: {
            generateLabels: (chart) => {
              const dataset = chart.data.datasets[0];
              return chart.data.labels.map((label, index) => ({
                text: label, // Use the label (Male/Female)
                fillStyle: dataset.backgroundColor[index], // Use the corresponding color
              }));
            },
            font: {
              size: 14, // Optional: Adjust legend font size
            },
            color: '#333', // Optional: Adjust legend text color
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };
    
    
    const fineStatusChartData = {
      labels: ['Paid', 'Unpaid'], 
      datasets: [
        {
          label: 'Fine Status Distribution',
          data: fineStatusData, // Example: [10, 20, 30, 40, 50] for each age group count
          backgroundColor: ['#4e73df', '#1cc88a'],
          borderColor: ['#4e73df', '#1cc88a'],
          borderWidth: 1,
        },
      ],
    };
    const ageChartData = {
      labels: ['0-18', '19-30', '31-40', '41-50', '51+'], // Age groups
      datasets: [
        {
          label: 'Age Distribution',
          data: ageData, // Example: [10, 20, 30, 40, 50] for each age group count
          backgroundColor: '#ff6384',
          borderColor: '#ff6384',
          borderWidth: 1,
        },
      ],
    };
  //time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
   useEffect(() => {
     // Update date and time every second
     const timer = setInterval(() => {
       setCurrentDateTime(new Date());
     }, 1000);
  
     // Clear timer on component unmount
     return () => clearInterval(timer);
   }, []);
  const today = new Date();
  const formattedDate = currentDateTime.toLocaleDateString();
  const formattedTime = currentDateTime.toLocaleTimeString();
  
  const chartRef1 = useRef(null);
  
  useEffect(() => {
    if (chartRef1.current) {
      const screenWidth = window.innerWidth;
  
      if (screenWidth <= 480) {
        // Mobile phones
        chartRef1.current.style.width = "100%";
        chartRef1.current.style.height = "350px";
      } else if (screenWidth <= 768) {
        // Tablets and small devices
        chartRef1.current.style.width = "600px";
        chartRef1.current.style.height = "300px";
      } else if (screenWidth <= 1366) {
        // Laptops / smaller desktops
        chartRef1.current.style.width = "750px";
        chartRef1.current.style.height = "400px";
      } else {
        // Larger desktops
        chartRef1.current.style.width = "800px";
        chartRef1.current.style.height = "400px";
      }
    }
  }, []);
  
   // Line chart data
   const lineChartData = {
    labels: Object.keys(violationsPerBarangay || {}),
    datasets: [
      {
        label: "Number of Violations",
        data: Object.values(violationsPerBarangay || {}),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };
  
  //map
      const [trafficData, setTrafficData] = useState([]);
    
      // Barangay alias mapping
    const barangayAliases = {
      "PALA-O": "PALAO",
      "PALAO": "PALAO",
      "BURU-UN": "BURUUN",
      "BURUUN": "BURUUN"
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
            "SARAY", "SUAREZ", "TAMBACAN", "TIBANGA", "TIPANOY", "TOMAS L. CABILI (TOMINOBO PROPER)",
            "TUBOD", "UBALDO LAYA", "UPPER HINAPLANON", "UPPER TOMINOBO", "VILLAVERDE"
          ];
  
          // Normalize barangay list
          const normalizedBarangays = barangayList.reduce((acc, barangay) => {
            acc[normalizeString(barangay)] = barangay;
            return acc;
          }, {});
  
          // Aggregate occurrences
          const aggregated = data.reduce((acc, record) => {
            const place = normalizeString(record.placeOfViolation);
            const matchedBarangay = Object.keys(normalizedBarangays).find(b => place.includes(b));
  
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
  
  const [selectedYearForMonth, setSelectedYearForMonth] = useState("");
  const [selectedYearForBarangay, setSelectedYearForBarangay] = useState("");
  const [selectedMonthForBarangay, setSelectedMonthForBarangay] = useState("");
  
  // Aggregate violations per month (with filtering by year only)
  const violationsPerMonth = records.reduce((acc, record) => {
    const date = new Date(record.dateOfApprehension);
    const recordYear = date.getFullYear().toString();
  
    // If a year is selected for the month graph, only include matching records.
    if (selectedYearForMonth && recordYear !== selectedYearForMonth) return acc;
  
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-indexed
    const monthKey = `${year}-${month < 10 ? "0" + month : month}`;
  
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {});
  
  // Prepare chart labels and data
  const sortedKeys = Object.keys(violationsPerMonth).sort();
  const sortedLabels = sortedKeys.map((key) => {
    const [year, month] = key.split("-");
    const dateObj = new Date(year, parseInt(month) - 1);
    return dateObj.toLocaleString("default", { month: "short", year: "numeric" });
  });
  
  const lineChartMonthData = {
    labels: sortedLabels,
    datasets: [
      {
        label: "Number of Violations",
        data: sortedKeys.map((key) => violationsPerMonth[key]),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,1)8",
        pointBorderColor: "rgba(75,192,192,1)", 
        pointBackgroundColor: "#FFFFFF", 
        pointRadius: 4, 
        pointHoverRadius: 7, 
        tension: 0.4,
      },
    ],
  };
  
  const lineChartMonthOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true // show on hover
      },
      datalabels: {
        display: false // hide always-visible labels
      }
    },
    scales: {
      x: { title: { display: true, text: "Month" } },
      y: { beginAtZero: true },
    },
  };
  
  const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
  


  return (
      <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <OfficerHeader isSidebarOpen={isSidebarOpen} />
      <SidebarOfficer isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="main-section1">
        <div>
          <div className="placeholder large">
            <img src={car} alt="Logo" className="banner" />
          </div>
        </div>
        <h5 classname="ofdate">
           Date: {new Date().toLocaleDateString("en-US", { weekday: "long" })}        {formattedDate} Time: {formattedTime}
        </h5>
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
  
        <div className="bottom-section1">

          <div className="placeholder medium1">
           {/* Vehicle Classification Donut Chart */}
           <div className="headertitleg"> 
              <h2>Vehicle Classification</h2>
              <button className="legend-buttonad" onClick={() => setShowLegend((prev) => !prev)}>
                  {showLegend ? "Hide Legend" : "Show Legend"}
              </button>
            </div>
           <div className="legendd" ref={chartRef1} >  
              <Doughnut 
                    data={{
                      labels: Object.keys(vehicleClassificationData),
                      datasets: [
                        {
                          data: Object.values(vehicleClassificationData),
                          backgroundColor: [
                            "#ff6384",
                            "#36a2eb",
                            "#ffcd56",
                            "#ff9f40",
                            "#4e73df",
                            "#1cc88a",
                            "#f6c23e",
                            "#36b9cc",
                            "#f1f1f1",
                            "#e74a3b",
                            "#5a5b8c",
                            "#e77d8e",
                            "#3b8b8c",
                            "#b9c3c9",
                            "#abb2b9",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false, 
                          position: "right", // You can adjust the position of the legend
                        },
                        tooltip: {
                          enabled: true // show on hover
                        },
                        datalabels: {
                          display: false // hide always-visible labels
                        }
                      },
                    }}
                  />
                {showLegend && (
                    <div className="showlegend">
                      {Object.keys(vehicleClassificationData).map((label, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: "2px",
                          }}
                        >
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              backgroundColor: [
                                "#ff6384", "#36a2eb", "#ffcd56", "#ff9f40", "#4e73df",
                                "#1cc88a", "#f6c23e", "#36b9cc", "#f1f1f1", "#e74a3b",
                                "#5a5b8c", "#e77d8e", "#3b8b8c", "#b9c3c9", "#abb2b9",
                              ][index],
                              marginRight: "5px",
                            }}
                          ></div>
                          <span style={{ fontSize: "12px" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
            </div>
          </div>

          <div className="placeholder medium1">
           {/* violation type Donut Chart */}
            <div className="headertitleg">              
              <h2>Violation Type</h2>
                <button className="legend-buttonad"  onClick={() => setShowLegend1((prev) => !prev)}>
                  {showLegend1 ? "Hide Legend" : "Show Legend"}
                </button>
            </div>
          <div className="legendd" ref={chartRef1} >
            <Doughnut
                  data={{
                    labels: Object.keys(violationTypeData), // Dynamic labels based on violation types
                    datasets: [
                      {
                        data: Object.values(violationTypeData), // Data counts dynamically set from violationCounts
                        backgroundColor: [
                          "#ff6384", // Color for first category
                          "#36a2eb", // Color for second category
                          "#ffcd56", // Color for third category
                          "#ff9f40", // Color for fourth category
                          "#4caf50", // Additional colors for more categories (you can add more)
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false, 
                        position: "right", // You can adjust the position of the legend
                      },
                      tooltip: {
                        enabled: true // show on hover
                      },
                      datalabels: {
                        display: false // hide always-visible labels
                      }
                    },
                  }}
                />
                {showLegend1 && (
                    <div className="showlegend">
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
        <div className="line-chart-section">
         <div className="chartheader">
            <h2 style={{textAlign:"center"}}>Number of Violations per Barangay</h2>
            {/* Filters */}
            <div className="filters">
            <select
              value={selectedYearForMonth}
              onChange={(e) => setSelectedYearForMonth(e.target.value)}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            </div>
          </div>

            <div id="chartContainer" ref={chartRef1} classname="nvb">
              <LineChart data={lineChartMonthData} options={lineChartMonthOptions} />
            </div>
          </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;