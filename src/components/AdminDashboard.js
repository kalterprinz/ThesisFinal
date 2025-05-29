import "./all.css";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate  } from "react-router-dom";
import axios from "axios";
import { Bar, Doughnut } from 'react-chartjs-2';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from './firebase';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import car from './cardash1.gif';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faXmark, faCab, faFilter, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus,faDownload } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend } from 'chart.js';
import { faMapLocation } from "@fortawesome/free-solid-svg-icons/faMapLocation";
import OfficerHeader from './OfficerHeader';
import Sidebar from  './Sidebar';
import { Line as LineChart } from "react-chartjs-2";
import iliganData from './iliganmap.json';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2pdf from "html2pdf.js"; 

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
  Legend,
  ChartDataLabels
);

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility
  const [violationsPerBarangay, setViolationsPerBarangay] = useState({});
  const [isLoading, setIsLoading] = useState(true); 
   const [geoJsonData] = useState(iliganData);
   const [records, setRecords] = useState([]);
   const [filteredData, setFilteredData] = useState([]); // Ensure this is defined
   const [loading, setLoading] = useState(true); 
   const [clearances, setClearances] = useState([]);
   const chartRef = useRef(null);
   const chartRef1 = useRef(null);

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
  const [showLegend, setShowLegend] = useState(false);
  const [showLegend1, setShowLegend1] = useState(false);
  
const fetchDemographicData = async (dataList) => {
  if (!dataList || dataList.length === 0) return;
  // Process gender data
  const genderCounts = dataList.reduce(
    (acc, record) => {
      if (record.gender === "Male" || record.gender === "male") acc.Male += 1;
      if (record.gender === "Female" || record.gender === "female") acc.Female += 1;
      return acc;
    },
    { Male: 0, Female: 1 }
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
    const normalizedPlace = getCanonicalBarangay(place); // Normalize it
    if (normalizedPlace) {
      placeCounts[normalizedPlace] = placeCounts[normalizedPlace] ? placeCounts[normalizedPlace] + 1 : 1;
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
const totalViolations = records.length; 
// graphs
const genderChartData = {
  labels: [''], 
  datasets: [
    {
      label: 'Male',
      data: [genderData.Male],
      backgroundColor: '#4e73df',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 10,
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: () => 'Male',
        color: '#4e73df',
        font: {
          weight: 'bold',
          size: 12,
        },
      },
    },
    {
      label: 'Female',
      data: [genderData.Female],
      backgroundColor: '#ff6384',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 10,
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: () => 'Female',
        color: '#ff6384',
        font: {
          weight: 'bold',
          size: 12,
        },
      },
    },
  ],
};

const genderChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#333', // Text color
        font: {
          size: 14,
          family: 'Arial',
          weight: 'bold',
        },
        padding: 20,
        boxWidth: 20, // Width of the color box
        usePointStyle: true, // If you want round dots instead of squares
        textAlign: 'center',
      }
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Count',
      },
    },
  },
};
// 
const fineStatusChartData = {
  labels: [''],
  datasets: [
    {
      label: 'Paid',
      data: [fineStatusData.Paid], // referencing by key
      backgroundColor: '#1cc855',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 10,
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: () => 'Paid',
        color: '#1cc855',
        font: {
          weight: 'bold',
          size: 12,
        },
      },
    },
    {
      label: 'Unpaid',
      data: [fineStatusData.Unpaid], 
      backgroundColor: '#df4e4e',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 10,
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: () => 'Unpaid',
        color: '#df4e4e',
        font: {
          weight: 'bold',
          size: 12,
        },
      },
    },
  ],
};

const fineStatusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: '#333', // Text color
        font: {
          size: 14,
          family: 'Arial',
          weight: 'bold',
        },
        padding: 20,
        boxWidth: 20, // Width of the color box
        usePointStyle: true, // If you want round dots instead of squares
        textAlign: 'center',
      }
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Count',
      },
    },
  },
};

  const ageChartData = {
    labels: ['≤18', '19-30', '31-40', '41-50', '51+'], // Age groups
    datasets: [
      {
        data: ageData,
        backgroundColor: '#9e358e',
        borderColor: '#9e358e',
        borderWidth: 1,
        borderRadius: 10
      },
    ],
  };

  const ageChartOptions = {
    plugins: {
      legend: {
        display: false, // 👈 Hides the legend above the chart
      },
      datalabels: {
        display: false, // 👈 Hides labels inside the bars
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
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


 // Line chart data
 const lineChartData = {
  labels: Object.keys(violationsPerBarangay || {}),
  datasets: [
    {
      label: "Number of Violations",
      data: Object.values(violationsPerBarangay || {}),
      fill: false,
      borderColor: "#05223e", 
      backgroundColor: "#05223e",
      pointBorderColor: "#05223e", 
      pointBackgroundColor: "#FFFFFF", 
      pointRadius: 4, 
      pointHoverRadius: 7, 
      tension: 0.4,
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
      borderColor: "#05223e", 
      backgroundColor: "#05223e",
      pointBorderColor: "#05223e", 
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
    tooltip: { enabled: true },
    datalabels: {
      display: false // hide always-visible labels
    }
  },
  scales: {
    x: { title: { display: false, text: "Month" } },
    y: { 
      beginAtZero: true,
      title: {
        display: true,
        text: 'Count',
      },
    },
  },
};

const lineChartBarangayOptions = {
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
    x: { title: { display: false, text: "Month" } },
    y: { 
      beginAtZero: true,
      title: {
        display: true,
        text: 'Count',
      },
    },
  },

};

const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const allowedBarangays = [
  "ABUNO",
  "ACMAC-MARIANO BADELLES SR.",
  "BAGONG SILANG",
  "BONBONON",
  "BUNAWAN",
  "BURU-UN",
  "DALIPUGA",
  "DEL CARMEN",
  "DIGKILAAN",
  "DITUCALAN",
  "DULAG",
  "HINAPLANON",
  "HINDANG",
  "KABACSANAN",
  "KALILANGAN",
  "KIWALAN",
  "LANIPAO",
  "LUINAB",
  "MAHAYAHAY",
  "MAINIT",
  "MANDULOG",
  "MARIA CRISTINA",
  "PALAO",
  "PANOROGANAN",
  "POBLACION",
  "PUGA-AN",
  "ROGONGON",
  "SAN MIGUEL",
  "SAN ROQUE",
  "SANTA ELENA",
  "SANTA FILOMENA",
  "SANTIAGO",
  "SANTO ROSARIO",
  "SARAY",
  "SUAREZ",
  "TAMBACAN",
  "TIBANGA",
  "TIPANOY",
  "TOMAS L. CABILI (TOMINOBO PROPER)",
  "TUBOD",
  "UBALDO LAYA",
  "UPPER HINAPLANON",
  "UPPER TOMINOBO",
  "VILLA VERDE",
];

useEffect(() => {
  const aggregateViolationsBarangay = () => {
    const barangayCounts = {};
    const wordCloudArray = [];

    records.forEach((record) => {
      const date = new Date(record.dateOfApprehension);
      const recordYear = date.getFullYear().toString();
      // Get full month name, e.g., "January"
      const recordMonth = date.toLocaleString("default", { month: "long" });

      // Apply barangay-specific filters
      if (selectedYearForBarangay && recordYear !== selectedYearForBarangay) return;
      if (selectedMonthForBarangay && recordMonth !== selectedMonthForBarangay) return;

      // Get the canonical barangay name using your helper function
      const canonicalBarangay = getCanonicalBarangay(record.placeOfViolation);
      if (canonicalBarangay && record.violationType) {
        // Split violationType on commas or slashes, trim, and filter out any empty strings
        const violations = record.violationType
          .split(",")
          .map(v => v.trim())
          .filter(v => v);
        // Count each violation individually
        const violationCount = violations.length;
        barangayCounts[canonicalBarangay] =
          (barangayCounts[canonicalBarangay] || 0) + violationCount;
        wordCloudArray.push({ text: canonicalBarangay, value: barangayCounts[canonicalBarangay] });
      }
    });

    setViolationsPerBarangay(barangayCounts);
  };

  aggregateViolationsBarangay();
}, [records, selectedYearForBarangay, selectedMonthForBarangay]);

const getCanonicalBarangay = (barangay) => {
  if (!barangay) return null;
  const lowerBarangay = barangay.toLowerCase();
  
  // First, check for an exact match
  for (const allowed of allowedBarangays) {
    if (allowed.toLowerCase() === lowerBarangay) {
      return allowed;
    }
  }
  
  // Fuzzy check: if the barangay string includes an allowed string or vice versa
  for (const allowed of allowedBarangays) {
    const lowerAllowed = allowed.toLowerCase();
    if (lowerBarangay.includes(lowerAllowed) || lowerAllowed.includes(lowerBarangay)) {
      return allowed;
    }
  }
  return null;
};

const filteredViolationsPerBarangay = {};
Object.keys(violationsPerBarangay).forEach((brgy) => {
  const canonical = getCanonicalBarangay(brgy);
  if (canonical) {
    filteredViolationsPerBarangay[canonical] =
      (filteredViolationsPerBarangay[canonical] || 0) + violationsPerBarangay[brgy];
  }
});

const topBarangays = Object.entries(filteredViolationsPerBarangay)
  .sort((a, b) => b[1] - a[1]) // Sort by highest violations
  .slice(0, 4); // Get the top 3

const lineChartBarangayData = {
  labels: Object.keys(filteredViolationsPerBarangay),
  datasets: [
    {
      label: "Number of Violations",
      data: Object.values(filteredViolationsPerBarangay),
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

  
  // line chart filter
// For Violations Per Month graph
const [selectedYearForMostVio, setSelectedYearForostVio] = useState("");
const [selectedMonthForMostVio, setSelectedMonthForMostVio] = useState("");

useEffect(() => {
  const aggregateViolationsBarangay = () => {
    const barangayCounts = {};
    const wordCloudArray = [];

    records.forEach((record) => {
      const date = new Date(record.dateOfApprehension);
      const recordYear = date.getFullYear().toString();
      // Get full month name, e.g., "January"
      const recordMonth = date.toLocaleString("default", { month: "long" });

      // Apply barangay-specific filters
      if (selectedYearForBarangay && recordYear !== selectedYearForBarangay) return;
      if (selectedMonthForBarangay && recordMonth !== selectedMonthForBarangay) return;

      // Get the canonical barangay name using your helper function
      const canonicalBarangay = getCanonicalBarangay(record.placeOfViolation);
      if (canonicalBarangay && record.violationType) {
        // Split violationType on commas or slashes, trim, and filter out any empty strings
        const violations = record.violationType
          .split(",")
          .map(v => v.trim())
          .filter(v => v);
        // Count each violation individually
        const violationCount = violations.length;
        barangayCounts[canonicalBarangay] =
          (barangayCounts[canonicalBarangay] || 0) + violationCount;
        wordCloudArray.push({ text: canonicalBarangay, value: barangayCounts[canonicalBarangay] });
      }
    });

    setViolationsPerBarangay(barangayCounts);
  };

  aggregateViolationsBarangay();
}, [records, selectedYearForBarangay, selectedMonthForBarangay]);


// bar chart barangays
const barangays = Object.keys(violationsPerBarangay);

  const allViolations = [...new Set(
    barangays.flatMap((barangay) =>
      Object.keys(violationsPerBarangay[barangay])
    )
  )];

  const topViolationsByBarangay = barangays.reduce((acc, barangay) => {
    const topViolations = Object.entries(violationsPerBarangay[barangay])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3); // Get top 3 violations

    acc[barangay] = Object.fromEntries(topViolations);
    return acc;
  }, {});

  // Prepare dataset
  const datasets = allViolations.map((violation, index) => ({
    label: violation,
    data: barangays.map((barangay) => topViolationsByBarangay[barangay]?.[violation] || 0),
    backgroundColor: ["#00bcd4", "#ff4081", "#7e57c2"][index % 3], // Rotate colors
  }));

  const data = {
    labels: barangays,
    datasets: datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
        datalabels: {
          display: false // hide always-visible labels
        }
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count of Violations",
        },
      },
    },
  };


const [selectedYearForClearance, setSelectedYearForClearance] = useState("");
const [selectedMonthForClearance, setSelectedMonthForClearance] = useState("");

// Fetch clearances using fetch and set state correctly
const fetchClearances = useCallback(async () => {
  try {
    const response = await fetch("http://localhost:3001/getClearances");
    const data = await response.json(); // Convert response to JSON
    if (Array.isArray(data)) {
      setClearances(data);  // Use the correct setter for clearances
    } else {
      console.error("Data is not an array");
    }
  } catch (error) {
    console.error("Error fetching clearances:", error);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  fetchClearances();
}, [fetchClearances]);

// Process clearances data to group by month using submissionDate
const clearancesPerMonth = {};
clearances.forEach((clearance) => {
  const clearanceDate = clearance.submissionDate; 
  if (clearanceDate) {
    const dateObj = new Date(clearanceDate);
    
    // Apply clearance-specific filters
    if (selectedYearForClearance && dateObj.getFullYear().toString() !== selectedYearForClearance) return;
    if (selectedMonthForClearance) {
      const monthName = dateObj.toLocaleString("default", { month: "long" });
      if (monthName !== selectedMonthForClearance) return;
    }
    
    // Create a month key in the format "YYYY-MM"
    const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    
    // Increment count (if clearance.count exists, use it; otherwise add 1)
    clearancesPerMonth[monthKey] = (clearancesPerMonth[monthKey] || 0) + (clearance.count || 1);
  }
});

// Sort keys and create display labels (e.g., "Jan 2023")
const sortedMonthKeys = Object.keys(clearancesPerMonth).sort();
const labels = sortedMonthKeys.map((key) => {
  const [year, month] = key.split("-");
  const dateObj = new Date(year, parseInt(month, 10) - 1);
  return dateObj.toLocaleString("default", { month: "short", year: "numeric" });
});

const currentDate = new Date();
const currentMonthName = currentDate.toLocaleString("default", { month: "long" });
const currentMonthKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
  .toString()
  .padStart(2, "0")}`;
const printedThisMonth = clearancesPerMonth[currentMonthKey] || 0;  

// Build clearance chart data
const clearanceChartData = {
  labels,
  datasets: [
    {
      label: "Clearances Printed",
      data: sortedMonthKeys.map((key) => clearancesPerMonth[key]),
      fill: false,
      borderColor: "#0168c8", 
      backgroundColor: "#0168c8",
      pointBorderColor: "#0168c8", 
      pointBackgroundColor: "#FFFFFF", 
      pointRadius: 4, 
      pointHoverRadius: 7, 
      tension: 0.4,
    },
  ],
};

const clearanceChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: "top",
    },
    title: {
      display: false,
      text: "Clearances Printed Over Time",
    },
    tooltip: {
      enabled: true // show on hover
    },
    datalabels: {
      display: false // hide always-visible labels
    }
  },
  scales: {
    x: { title: { display: false, text: "Month" } },
    y: { 
      beginAtZero: true,
      title: {
        display: true,
        text: 'Count',
      },
    },
  },
};



useEffect(() => {
  if (chartRef.current) {
    chartRef.current.style.width = "620px";
    chartRef.current.style.height = "500px";
  }
  if (chartRef1.current) {
    if (window.innerWidth <= 1366) {
      // Smaller screen size
      chartRef1.current.style.width = "750px";
      chartRef1.current.style.height = "400px";
    } else {
      // Larger screen size
      chartRef1.current.style.width = "800px";
      chartRef1.current.style.height = "400px";
    }
  }

}, []);
const classificationCounts = Object.entries(vehicleClassificationData);
const violationCounts = Object.entries(violationTypeData);

const [selectedBarangay, setSelectedBarangay] = useState("");
const [barangayViolationCounts, setBarangayViolationCounts] = useState({});

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

const allowedBarangays2 = [
  "ABUNO",
  "ACMAC-MARIANO BADELLES SR.",
  "BAGONG SILANG",
  "BONBONON",
  "BUNAWAN",
  "BURU-UN",
  "DALIPUGA",
  "DEL CARMEN",
  "DIGKILAAN",
  "DITUCALAN",
  "DULAG",
  "HINAPLANON",
  "HINDANG",
  "KABACSANAN",
  "KALILANGAN",
  "KIWALAN",
  "LANIPAO",
  "LUINAB",
  "MAHAYAHAY",
  "MAINIT",
  "MANDULOG",
  "MARIA CRISTINA",
  "PALAO",
  "PANOROGANAN",
  "POBLACION",
  "PUGA-AN",
  "ROGONGON",
  "SAN MIGUEL",
  "SAN ROQUE",
  "SANTA ELENA",
  "SANTA FILOMENA",
  "SANTIAGO",
  "SANTO ROSARIO",
  "SARAY",
  "SUAREZ",
  "TAMBACAN",
  "TIBANGA",
  "TIPANOY",
  "TOMAS L. CABILI (TOMINOBO PROPER)",
  "TUBOD",
  "UBALDO LAYA",
  "UPPER HINAPLANON",
  "UPPER TOMINOBO",
  "VILLA VERDE",
];

// Helper function to map a violation string to its canonical allowed violation name.
const getCanonicalViolation = (violation) => {
  const lowerViolation = violation.toLowerCase();
  // First, try for an exact match
  for (const canonical of Object.keys(allowedViolations)) {
    if (canonical.toLowerCase() === lowerViolation) {
      return canonical;
    }
  }
  // Otherwise, check if the violation string contains key parts of any allowed violation.
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

// Helper function to scan the placeOfViolation string for any allowed barangay.
const getCanonicalBarangay2 = (barangay) => {
  if (!barangay) return null;
  const lowerBarangay = barangay.toLowerCase();
  
  // First, check for an exact match
  for (const allowed of allowedBarangays2) {
    if (allowed.toLowerCase() === lowerBarangay) {
      return allowed;
    }
  }
  
  // Fuzzy check: if the barangay string includes an allowed string or vice versa
  for (const allowed of allowedBarangays2) {
    const lowerAllowed = allowed.toLowerCase();
    if (lowerBarangay.includes(lowerAllowed) || lowerAllowed.includes(lowerBarangay)) {
      return allowed;
    }
  }
  return null;
};

useEffect(() => {
  if (!selectedBarangay) {
    // If no barangay is selected, clear out the counts
    setBarangayViolationCounts({});
    return;
  }

  const counts = {};
  records.forEach((record) => {
    // Map the placeOfViolation to its canonical barangay using getCanonicalBarangay
    const canonicalBarangay = getCanonicalBarangay2(record.placeOfViolation);
    if (canonicalBarangay === selectedBarangay && record.violationType) {
      // record.violationType might have multiple comma-separated entries
      const rawViolations = record.violationType
  .split(",")
  .map((v) => v.trim().replace(/\/\s+/g, "/ "));
      rawViolations.forEach((rawViolation) => {
        // Map the raw violation to a canonical name using getCanonicalViolation
        const canonicalVio = getCanonicalViolation(rawViolation);
        if (canonicalVio) {
          counts[canonicalVio] = (counts[canonicalVio] || 0) + 1;
        }
      });
    }
  });

  setBarangayViolationCounts(counts);
}, [records, selectedBarangay]);

// Turn allowedViolations into an ordered list of keys.
const orderedAllowedViolations = Object.keys(allowedViolations);

// Only display labels for violations that have counts.
const chartLabels = orderedAllowedViolations.filter(
  (vio) => barangayViolationCounts[vio]
);

// Build the data array in the same order.
const chartData = chartLabels.map((vio) => barangayViolationCounts[vio] || 0);

const barChartBarangayViolationsData = {
  labels: chartLabels,
  datasets: [
    {
      label: "",
      data: chartData,
      backgroundColor: chartLabels.map((_, index) => {
        return `hsl(${(index * 135.5) % 360}, 90%, 60%)`;
      }),  
      borderRadius: 10,    
    },
  ],
};

const barChartOptionsForBarangayViolations = {
  responsive: true,
  maintainAspectRatio: false,
  // Make the chart horizontal
  indexAxis: "y",
  scales: {
    x: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Count of Violations",
      },
    },
    y: {
      ticks: {
        font: {
          size: 10, // Adjust font size
        },
        maxRotation: 0, // Keep labels horizontal
        minRotation: 0,
      },
      beginAtZero: true,
      title: {
        display: false,
        text: 'Count',
      },
    }
  },
  plugins: {
    legend: {
      labels: {
        boxWidth: 0, // Remove color box from the legend
      },
    },
    tooltip: {
      enabled: true // show on hover
    },
    datalabels: {
      display: false // hide always-visible labels
    }
  },
  
};

const totalViolationsSelected = filteredViolationsPerBarangay[selectedBarangay] || 0;
const barangayNames = Object.keys(filteredViolationsPerBarangay);
const violationCountst = Object.values(filteredViolationsPerBarangay);

//for generate report
const modalContentRef = useRef(null);
const downloadPDF = () => {
  const content = modalContentRef.current;
  
  if (content) {
    const options = {
      margin: 10,
      filename: "traffic_violation_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(content) // Specify the element to convert to PDF
      .set(options)
      .save(); // Trigger the download
  }
};
// Map each barangay and violation count to display with total violations
const totalViolationst = filteredViolationsPerBarangay || {}; 
const [isModalOpen, setIsModalOpen] = useState(false);
const openModal = () => {
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
};

  // Find the month with the most violations from all records (not affected by filters)
  const violationsPerMonthAll = records.reduce((acc, record) => {
    const date = new Date(record.dateOfApprehension);
    const recordYear = date.getFullYear().toString();
    const recordMonth = date.getMonth() + 1; // 1-indexed
    const monthKey = `${recordYear}-${recordMonth < 10 ? "0" + recordMonth : recordMonth}`;

    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {});

  // Find the maximum violations in the full dataset
  const mostViolationsKey = Object.keys(violationsPerMonthAll).reduce((maxKey, key) => {
    return violationsPerMonthAll[key] > violationsPerMonthAll[maxKey] ? key : maxKey;
  }, Object.keys(violationsPerMonthAll)[0]);

  const [maxYear, maxMonth] = (mostViolationsKey || "").split("-");
  const maxDate = new Date(maxYear, parseInt(maxMonth) - 1);
  const mostViolationsMonth = maxDate.toLocaleString("default", { month: "long" });
  const mostViolationsYear = maxDate.getFullYear();
  const maxViolationsCount = violationsPerMonthAll[mostViolationsKey];
 // Aggregate violations per year
 const violationsPerYear = records.reduce((acc, record) => {
  const date = new Date(record.dateOfApprehension);
  const recordYear = date.getFullYear();
  acc[recordYear] = (acc[recordYear] || 0) + 1;
  return acc;
}, {});

// Prepare year-wise violation summary
const violationPerYearSummary = Object.keys(violationsPerYear).map((year) => (
  <p key={year}>
    <strong>{year}</strong>: {violationsPerYear[year]} violations
  </p>
));

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  // Check the screen size on component mount
  if (window.innerWidth < 768) { // Threshold for small screens
    setIsMobile(true);
  }

  // Optional: Add event listener to detect screen size change
  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  window.addEventListener("resize", handleResize);

  // Cleanup the event listener on component unmount
  return () => window.removeEventListener("resize", handleResize);
}, []);

if (isMobile) {
  // Redirect to a different page or show a message
  return (
    <div>
      <h2>Admin Login is not supported on smaller screens.</h2>
      <p>Please use a larger screen to log in.</p>
    </div>
  );
}


  return (
      <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <OfficerHeader isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="main-section1">
        <div className="placeholder large">
          <img src={car} alt="Logo" className="banner" />
        </div>

        <h5 style={{ display: "flex", justifyContent: "flex-end", color: "#333",
           marginBottom: "4px", fontSize:"14px", borderBottom: "1px solid lightgray", paddingBottom: "4px",  }}>
           Date: {new Date().toLocaleDateString("en-US", { weekday: "long" })}        {formattedDate} Time: {formattedTime}
        </h5>

        <div style={{ textAlign: "right", padding: "20px" }}>
          <button className="generate-btn" onClick={openModal}>
            Generate Report
          </button>
        </div>

        {isModalOpen && (
          <div className="modalgen" onClick={closeModal}> 
            <div className="modalreport" onClick={closeModal}>
            <div className="modal-header-buttongene">
                  <button className="no-print" onClick={downloadPDF} style={{ border: "none", outline: "none" }}>
                  {/* <button className="no-print"  style={{ border: "none", outline: "none" }}> */}
                    <FontAwesomeIcon icon={faDownload} style={{marginRight:"5"}}/>Download
                  </button>
                  <button className="close-modal" onClick={closeModal} style={{ border: "none", outline: "none" }}>
                    <FontAwesomeIcon icon={faXmark} style={{marginRight:"15"}}/>Close
                  </button>
                </div>
              <div className="modal-contentreport"  ref={modalContentRef}  onClick={(e) => e.stopPropagation()}>
                
                <h2 style={{ textAlign: "center", marginBottom: "10px", marginTop:'-5px' }}>
                  Traffic Violation Report Summary
                </h2>

                <div>
                <p>
                    <em>Note: Some records did not have age data and gender data, so the total number of age and gender related records is less than the total violations recorded.</em>
                    <br /><br />

                    A total of <strong>{totalViolations} traffic violations </strong>  were recorded in the system. Among these, 
                    <strong> {fineStatusData.Paid} were settled or paid</strong> and 
                    <strong> {fineStatusData.Unpaid} remain unpaid</strong>.
                    <br />

                    There were <strong>{ageData[0]}</strong> fines from individuals aged ≤18, 
                    <strong> {ageData[1]}</strong> fines from ages 19-30, 
                    <strong> {ageData[2]}</strong> fines from ages 31-40, 
                    <strong> {ageData[3]}</strong> fines from ages 41-50, 
                    and <strong>{ageData[4]}</strong> fines from those aged 51 and above.
                    In terms of <strong>Gender</strong>, 
                    <strong> {genderData.Male}</strong> violators were male and 
                    <strong> {genderData.Female}</strong> violators were female.
                    <br /><br />

                    The month with the most violations recorded in the system is 
                    <strong> {mostViolationsMonth}</strong> {mostViolationsYear}, with a total of{" "}
                    <strong>{maxViolationsCount}</strong> violations. 
                    The following are the violations recorded for each year. These figures highlight the trends and changes in traffic violations over time.
                    <ul style={{lineHeight:'0.5'}}>
                      {violationPerYearSummary.map((year, index) => (
                        <li key={index}>{year}</li>
                      ))}
                    </ul>
                    {/* <strong>Top 3 Places with Most Violations:</strong><br />
                      {top3Places.map((place, index) => (
                        <li key={index}>
                          {place.place}: {place.count} violations
                        </li>
                      ))}

                    <br /> */}

                    Below is the distribution of traffic violations recorded across 44 barangays in Iligan City. This helps identify areas 
                    with higher incidences and can guide future traffic management efforts.
                    <div style={{ margin: '0px 20px 5px 20px' }}>
                      <ul style={{ 
                        listStyleType: 'none', 
                        padding:'0',
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '2px 30px',
                      }}>
                        {barangayNames.map((barangay, index) => {
                          const totalViolation = totalViolationst[barangay] || 0;
                          return (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize:'11px' }}>
                              <span>{barangay}</span>
                              <span>{totalViolation}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    The list below shows the six most common traffic violations recorded in Iligan City. 
                    Other violations with lower counts or entries with misspellings and typos were grouped under "Others."
                    <ul>
                      {Object.entries(violationTypeData)
                        .sort((a, b) => b[1] - a[1]) // Sort from highest to lowest count
                        .slice(0, 6) // Get top 6 violations
                        .map(([violation, count], index) => (
                          <li key={index}>
                            <strong>{violation}:</strong> {count} occurrences
                          </li>
                        ))}
                    </ul>
                  
                    The following breakdown shows the types of vehicles involved in the recorded traffic violations.
                    <ul>
                      {classificationCounts.map(([classification, count], index) => (
                        <li key={index}>
                          <strong>{classification}:</strong> {count} vehicles
                        </li>
                      ))}
                    </ul>
                  </p>
                    
                </div>
              </div>
            </div>
          </div> 
        )}
        
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

        <div className="bottom-section">
          <div className="placeholder medium">
            {/* Gender Distribution Bar Chart */}
            <h2>Gender Distribution</h2>
            <Bar data={genderChartData} options={genderChartOptions}/>

          </div>
          <div className="placeholder medium">
            {/* Age Distribution Bar Chart */}
            <h2>Age Distribution</h2>
            <Bar data={ageChartData}
              options={ageChartOptions}
              plugins={[ChartDataLabels]}
             />


          </div>
          <div className="placeholder medium">
            {/* fine status Distribution Bar Chart */}
            <h2>Fine Status Distribution</h2>
            <Bar data={fineStatusChartData} 
              options={fineStatusChartOptions} />
          </div>
          
        </div>
        <div className="bottom-sec"> 
          <div  className="headergraph">
            <div>
              <div className="headertitleg"> 
                <h2>Vehicle Classification</h2>
                <button className="legend-buttonad" onClick={() => setShowLegend((prev) => !prev)}>
                    {showLegend ? "Hide Legend" : "Show Legend"}
                </button>
              </div>
            </div>
              
            <div className="headertitleg">              
              <h2>Violation Type</h2>
              <div>
                <button className="legend-buttonad"  onClick={() => setShowLegend1((prev) => !prev)}>
                  {showLegend1 ? "Hide Legend" : "Show Legend"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bottom-section">
            <div className="meduim1"> 
              <div className="medium12">
              <Doughnut
                  data={{
                    labels: Object.keys(vehicleClassificationData),
                    datasets: [
                      {
                        data: Object.values(vehicleClassificationData),
                        backgroundColor: [
                          "#ff6384",  "#36a2eb",  "#ffcd56",   "#ff9f40",   "#4e73df",
                          "#1cc88a","#f6c23e","#36b9cc","#f1f1f1",  "#e74a3b",
                          "#5a5b8c",  "#e77d8e",   "#3b8b8c",  "#b9c3c9",  "#abb2b9",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false, 
                        position: "right", 
                      },
                      tooltip: {
                        enabled: true, // Enable tooltips to show more info on hover
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
                        <div key={index} style={{ display: "flex", alignItems: "center", margin: "2px" }}>
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
              {/* Summary Section */}
                <div className="classification-summary">
                  <h3>Summary</h3>
                  <ul>
                    {classificationCounts.map(([classification, count], index) => (
                      <li key={index}>
                        <strong>{classification}:</strong> {count} vehicles
                      </li>
                    ))}
                  </ul>
                </div> 
            </div>
            
            <div className="meduim1"> 
                <div className="medium121">
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

                {/* Summary Section */}
                <div className="classification-summary">
                  <h3>Summary (Top 6 Violation)</h3>
                  <ul>
                    {Object.entries(violationTypeData)
                      .sort((a, b) => b[1] - a[1]) // Sort from highest to lowest count
                      .slice(0, 6) // Get top 6 violations
                      .map(([violation, count], index) => (
                        <li key={index}>
                          <strong>{violation}:</strong> {count} occurrences
                        </li>
                      ))}
                  </ul>
                </div>
            </div>
          </div>
        </div>  

        <div className="bottom-sectionD">
          <div className="medium2">
           {/* Total Violation Per Month chart*/}
           <div className="chartheader">
            <h2>Total Violation Per Month</h2>
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
            <div id="chartContainer" ref={chartRef}>
              <LineChart data={lineChartMonthData} options={lineChartMonthOptions} />
            </div>
          </div>     
        

        <div className="medium31">
          <h2>Clearances Printed Over Time</h2>
            <div className="filters1">
              <select
                  value={selectedYearForClearance}
                  onChange={(e) => setSelectedYearForClearance(e.target.value)}
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedMonthForClearance}
                  onChange={(e) => setSelectedMonthForClearance(e.target.value)}
                >
                  <option value="">All Months</option>
                  {months.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <LineChart data={clearanceChartData} options={clearanceChartOptions} />

              {/* Summary Section */}
              <div className="clearance-summary">
                  <h3>Summary</h3>
                  <p>
                    <strong>&emsp;&emsp; {printedThisMonth} clearances</strong> are printed this month of <strong>{currentMonthName}</strong>.
                  </p>
              </div> 
          </div>  
        </div>
          <div className="chart-box">
            <h2 style={{textAlign:"center", fontSize:"19px"}}>Violations for Selected Barangay</h2>
            <div className="chartheader2">
                <p style={{textAlign:"center", fontSize:"14px"}}>Select barangay to display the graph</p>
                <div className="filters">
                  <select
                    value={selectedBarangay}
                    onChange={(e) => setSelectedBarangay(e.target.value)}
                  >
                    <option value="">Select Barangay</option>
                    {allowedBarangays.map((brgy, index) => (
                      <option key={index} value={brgy}>
                        {brgy}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              

                {/* Only show the chart and counts if a barangay is selected */}
                {selectedBarangay && (
                  <div className="chart-container" style={{  display: "flex", marginTop: "1rem", flexDirection:"row", justifyContent:"center", alignItems:"flex-start" }} >
              {/* Chart Container */}
              <div className="chart-cont"  style={{  width: "700px", height: "420px",  marginLeft: "0px" }}   >
                
                {Object.keys(barangayViolationCounts).length > 0 ? (
                  <div id="chartContainer" >
                    <Bar
                      data={barChartBarangayViolationsData}
                      options={barChartOptionsForBarangayViolations}
                      style={{ boxSizing:"border-box", display:"block", height:"400px", width:"700px"}}
                    />
                  </div>
                  
                ) : (
                  <p>No violation data available for {selectedBarangay}.</p>
                )}
            </div>

            {/* Counted Numbers Sidebar */}
            <div className="chart-numbers"  >
              <h3 style={{ fontSize: "14px", marginBottom: "20px",textAlign:"center", borderBottom:"2px solid #ccc" }}>
                Most apprehended violations in {selectedBarangay}:{" "}
                {totalViolationsSelected} violation
                {totalViolationsSelected !== 1 ? "s" : ""}
              </h3>
              <p style={{fontSize:"13px", fontWeight:"700"}}>Top violation/s in the barangay:</p>
              <ul style={{ listStyle: "inside", padding: "2px 15px" }}>
                {Object.entries(barangayViolationCounts).map(([violation, count]) => (
                  <li key={violation} className="list">
                    <strong>{violation}</strong>: &emsp;{count} violation/s
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="medium21">
          <div className="chartheader">
            <h2 style={{textAlign:"center", fontSize:"18px"}}>Number of Violations per Barangay</h2>
            {/* Filters */}
            <div className="filters">
              <select
                value={selectedYearForBarangay}
                onChange={(e) => setSelectedYearForBarangay(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={selectedMonthForBarangay}
                onChange={(e) => setSelectedMonthForBarangay(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
           </div>
           <div id="chartContainer" ref={chartRef1}>
              <LineChart
                data={lineChartBarangayData}
                options={lineChartBarangayOptions}
              />
            </div>
          </div>
          
        <div className="map-page2ad">
          <div style={{ flex: 2 }}>
          <div className="mapdes">
            <h2>Map of Iligan City</h2>
            <p>Interactive Map Highlighting Common Violation Hotspots</p>
          </div>
          <div className="map-container1"> 
          <MapContainer center={[8.246, 124.268]} zoom={12.5} className="leaflet-container12">
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
      </main>
    </div>
  );
};

export default AdminDashboard;