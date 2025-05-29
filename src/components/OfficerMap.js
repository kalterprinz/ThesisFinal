import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import iliganData from './iliganmap.json';
import "./all2.css";
import "./OfficerDash.css";
import "leaflet/dist/leaflet.css";
import SidebarOfficer from './SidebarOfficer';
import OfficerHeader from './OfficerHeader';
import AdminMap from './AdminMap';

const OfficerMap = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [geoJsonData] = useState(iliganData);
  const [trafficData, setTrafficData] = useState([]);

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

      // Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis

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
    "ACMAC":"ACMAC-MARIANO BADELLES SR.",
    "STO. ROSARIO": "SANTO ROSARIO",
    "SANTO ROSARIO": "SANTO ROSARIO",
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
      color: 'black',
      fillOpacity: 0.8
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

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <OfficerHeader />
      <SidebarOfficer isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="main-section1">
        <div className="map-page2">
          <div className="map-page2ad">
            <div style={{ flex: 2 }}>
            {/* <div className="mapdes">
              <h2>Map of Iligan City</h2>
              <p>Interactive Map Highlighting Common Violation Hotspots</p>
            </div> */}
            {/* <div className="map-container1"> 
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
            </div> */}
            <AdminMap/>
            {/* <div className="mapdes1">
              <p>
                Explore this interactive map to understand the distribution of traffic violations 
                across Iligan City. The color-coded regions represent varying levels of violations, 
                with darker shades indicating higher frequencies.
              </p>
            </div> */}
            </div>
        </div>
       </div>
      </main>
    </div>
  );
};

export default OfficerMap;
