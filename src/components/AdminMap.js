import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import axios from "axios";
import iliganData from './iliganmap.json';
import "./all.css";
import "./OfficerDash.css";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

const OfficerMap = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const agencyColors = {
    LTO: "#1f77b4", // blue
    ICTPMO: "#2ca02c",    // green
    PNP: "#d62728"     // red
  };
  
  const blendColors = (colors) => {
    if (colors.length === 1) return colors[0];
    
    const toRGB = hex => {
      const bigint = parseInt(hex.slice(1), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };
  
    const avg = colors
      .map(toRGB)
      .reduce((acc, cur) => acc.map((a, i) => a + cur[i]), [0, 0, 0])
      .map(c => Math.round(c / colors.length));
  
    return `rgb(${avg.join(",")})`;
  };
  



  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

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

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/getOfficer");
        const data = response.data;
        
        console.log("API Response:", data); // Debugging line
  
        const filteredOfficers = data.filter(officer => {
          console.log("Officer Barangay:", officer.barangay); // Check barangay field
          return officer.dutyStatus === "On Duty" && 
                 officer.role !== "Admin" && 
                 officer.role !== "Treasurer";
        });
  
        console.log("Filtered Officers:", filteredOfficers);
  
        setOfficers(filteredOfficers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching officers: ", error);
      }
    };
  
    fetchOfficers();
  }, []);
  
  const normalizeBarangayName = (name) => {
    return name.toLowerCase().replace(/[-\s]/g, ""); 
  };
  
  const getOfficersByBarangay = (barangayName) => {
    if (!barangayName) return "";
  
    return officers
      .filter(officer => 
        officer.assign &&
        normalizeBarangayName(officer.assign) === normalizeBarangayName(barangayName)
      )
      .map(officer => `${officer.name} (${officer.agency})`)
      .join("<br>"); // Use <br> for HTML line breaks
  };
  
    //kirk selwyn miguel fuentevilla ycong
        //normailah macala
        //cate melody dalis
  const styleFeature = (feature) => {
    const barangayName = feature.properties.adm4_en ? feature.properties.adm4_en.toUpperCase() : "";
  
    const assignedOfficers = officers.filter(officer =>
      officer.assign &&
      normalizeBarangayName(officer.assign) === normalizeBarangayName(barangayName)
    );
  
    const uniqueAgencies = [...new Set(assignedOfficers.map(o => o.agency))];
    const agencyColorList = uniqueAgencies.map(agency => agencyColors[agency]).filter(Boolean);
  
    return {
      weight: 2,
      color: 'black',
      fillOpacity: 0.7,
      fillColor: agencyColorList.length > 0 ? blendColors(agencyColorList) : 'lightgray'
    };
  };

  const onEachFeature = (feature, layer) => {
    const barangayName = feature.properties.adm4_en ? feature.properties.adm4_en.toUpperCase() : "";
    const assignedOfficers = getOfficersByBarangay(barangayName);
  
    layer.bindTooltip(
      `<strong>${feature.properties.adm4_en}</strong><br>Officers:<br>${assignedOfficers || "None"}`,
      { direction: "center", className: "custom-tooltip", permanent: false }
    );
  };

  return (
        <div>
          <div className="map-container"> 
            <div className="map-title-container">
              <h1 className="map-title">Traffic Officers Map</h1>
              <p className="map-descriptionof">
                This map displays the deployment of traffic officers across Iligan City. Hover over a barangay to see assigned officers.
              </p>
            </div>
            <MapContainer center={[8.236, 124.258]} zoom={12.5} className="leaflet-container13">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
              />
              {!isLoading && (
                <GeoJSON
                  data={iliganData}
                  style={styleFeature}
                  onEachFeature={onEachFeature}
                />
              )}
            </MapContainer>
            <div className="map-footer">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent:'center',gap: '20px', fontSize:'11px' }}>
                Legend: 
                {/* Green Legend */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{  width: '60px', height: '10px', backgroundColor: 'green', display: 'inline-block', marginRight: '5px' }}></span>
                  <span>ICTPMO</span>
                </div>

                {/* Red Legend */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '60px', height: '10px', backgroundColor: 'red', display: 'inline-block', marginRight: '5px' }}></span>
                  <span>PNP</span>
                </div>

                {/* Blue Legend */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '60px', height: '10px', backgroundColor: 'blue', display: 'inline-block', marginRight: '5px' }}></span>
                  <span>LTO</span>
                </div>
             </div>
              <p style={{ margin: '5px 0', fontStyle:'italic'}}>
                <strong>Note:</strong> If the color is a mix of green, red, and/or blue, it indicates that the traffic officers from ICTPMO, PNP, and LTO are assigned together in that area. If only two colors are mixed, it represents a combined deployment of those two agencies.
              </p>
              <p>
                Use this map to monitor traffic officers' deployment in various barangays. It provides an overview of assigned locations to ensure effective traffic management.
              </p>

            </div>
          </div>
        </div>
  );
};

export default OfficerMap;
