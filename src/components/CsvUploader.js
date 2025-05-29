import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import './CsvUploader.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

function CsvUploader({ onCsvUpload }) {
  const [csvFile, setCsvFile] = useState(null);

  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const parseDate = (dateString) => {
    if (!dateString || dateString.toLowerCase() === "n/a") return null;

    dateString = dateString.trim();
    const parsedDate = new Date(dateString);
    
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString(); // Convert to ISO format
    }
    //kirk selwyn miguel fuentevilla ycong
        //normailah macala
        //cate melody dalis
    // Handle MM/DD/YY format (e.g., "10/21/24")
    const parts = dateString.split("/");
    if (parts.length === 3) {
      let [month, day, year] = parts.map(p => p.trim());
      if (year.length === 2) year = `20${year}`; // Convert "24" to "2024"

      const formattedDate = `${year}-${month}-${day}`;
      const finalDate = new Date(formattedDate);

      return isNaN(finalDate.getTime()) ? null : finalDate.toISOString();
    }

    return null; // Return null if format is invalid
  };

  const handleFileUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }
    

    Papa.parse(csvFile, {
      complete: async (result) => {
        let data = result.data;

        if (data.length < 3) {
          alert("CSV file doesn't contain enough data.");
          return;
        }

        // Extract headers from row 2 (index 1)
        const headers = data[1].map(header => header.trim().replace(/\s+/g, "")); // Trim headers and remove spaces

        const filteredData = data.slice(2).filter(row => row.length > 1 && row.some(cell => cell.trim() !== ""));

        if (filteredData[0]?.[1] === "TCT NO.") {
          filteredData.shift(); // Remove the header row if still present
        }

        const parseDate = (dateString) => {
          if (!dateString || dateString.toLowerCase() === "n/a") return null;
        
          dateString = dateString.trim();
          const parts = dateString.split("/");
        
          if (parts.length === 3) {
            let [month, day, year] = parts.map(p => p.trim());
            if (year.length === 2) year = `20${year}`; // Convert "24" to "2024"
        
            // Ensure two-digit month and day
            month = month.padStart(2, "0");
            day = day.padStart(2, "0");
        
            // Create Date object in UTC
            const parsedDate = new Date(`${year}-${month}-${day}T12:00:00.000Z`); 
        
            return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
          }
        
          return null; // Return null if format is invalid
        };
        
        
        const fineMapping = {
          ICTPMO: {
            "FAILURE TO CARRY OR/CR": 500,
            "NO LOADING/UNLOADING": 100,
            "OBSTRUCTION TO SIDEWALK": 500,
            "UNREGISTERED/DELINQUENT/SUSPENDED VEHICLE": 2000,
            "DRIVING WITHOUT DRIVER'S LICENSE": 1500,
            "DRIVING WITHOUT DRIVERS LICENSE": 1500,
            "FAILURE TO CARRY DRIVERS LICENSE": 1500,
            "FAILURE TO CARRY DRIVER'S LICENSE": 1500,
            "FAILURE TO CARRY DL": 1500,
            "EXPIRED DRIVER'S LICENSE": 3000,
            "EXPIRED DRIVERS LICENSE": 3000,
            "EXPIRED LICENSE": 3000,
            "DRIVING UNDER THE INFLUENCE OF LIQUOR/DRUGS": 4000,
            "JAYWALKING": 300,
            "OVER SPEEDING": 1000,
            "NO HELMET": 500,
            "FAILURE TO OBEY TRAFFIC CONTROL DEVICE TRAFFIC LIGHTS/TRAFFIC ENFORCERS": 1000,
            "PARKING ON THE SIDEWALK": 500,
            "SMOKING INSIDE PUBLIC UTILITY VEHICLE": 1500,
            "WEARING OF SLIPPERS AND SANDO": 150,
            "DRIVING WITH INVALID/DELINQUENT DRIVER'S LICENSE": 3000,
            "INVALID/NO FRANCHISE (COLORUM)": 5000,
            "RECKLESS DRIVING": 2000,
            "CONTRACTING": 2000,
            "NO PLATE NUMBER": 2000,
            "EXPIRED OR":1000,
            "EXPIRED CR":1000,
            "EXPIRED OR/CR":1000,
            "EXPIRED CR/OR":1000,
            "NO SIDE MIRROR":150,
            "NO SIDE MIRRORS":150,
            "FAILURE TO CARRY OR":500,
            "FAILURE TO CARRY CR":500,
            "NO OR":500,
            "NO CR":500,
            "NO OR/CR":500,
            "NO CR/OR":500,
            "FAILURE TO CARRY CR/OR":500,
            "NON-WEARING OF CRASH HELMET":500,
            "NON WEARING OF CRASH HELMET":500,
            "DISOBEDIENCE TO TRAFFIC ENFORCEMENT":1000,
            "DISOBEDIENCE TO TRAFFIC PNP":1000,
            "ABANDONED VEHICLE":1000,
            "BACKRIDE NO HELMET":500,
            "EXCESS PASSENGER":200,
            "WEARING SLIPPER":150,
            "TRIP CUTTING":500,
            "NO RIGHT TURN ON RED":500,
            "NO RIGHT TURN ON STOP SIGNAL":500,
            "NO U-TURN":500,
            "U-TURN":500,
            "GIVE WAY":500,
            "YIELD":500,
            "CROSSING SOLID LANE":500,
            "VIOLATING THE REVISED ROAD DETAILS":1000,
            "NO PUJ LANE":300,
            "CAUTION ALONE":500,
            "YELLOW ALONE":500,
            "GREEN ALONE": 500,
            "RED ALONE":200,
            "UNPROCEDURAL TURNING AT CHANNELIZED INTERSECTION":200,
            "UNPROCEDURAL TURNING":200,
            "NO PASSING ZONE":200,
            "ONE WAY STREETS":200,
            "STOP SIGNALS":200,
            "RED WITH GREEN ARROW":500,
            "L-TURN":200,
            "R-TURN":200,
            "TRAFFIC LANE MARKINGS":500,
            "SPEED RESTRICTIONS":500,
            "WRONG EXECUTION OF R-TURN":200,
            "WRONG EXECUTION OF L-TURN":200,
            "STARTING AND SIGNAL ON STARTING":500,
            "SIGNAL ON STARTING":500,
            "STOPPING":500,
            "FAILURE TO DISPLAY TARIFF FARE": 500,
            "NON-DISPLAY OF COLOR CODE": 500,
            "INSTALLATION OF STEREOS": 500,
            "INSTALLATION OF ADDITIONAL EXTENSION": 500,
            "NOT FOLLOWING PRESCRIBED ROUTE": 500,
            "ANTI-DISPATCHING": 1000,
            "TRUCK BAN": 1000,
            "NOT FOLLOWING ROUTES FOR PUBLIC SERVICE VEHICLE": 200,
            "NON-DISPLAY OF PLATE NUMBER AND DRIVER’S NAME IN PUBLIC UTILITY VEHICLES": 500,
            "OBSTRUCTION DUE TO DISABLED VEHICLE": 100,
            "NO-DELIVERY VEHICLE PERMIT": 200,
            "UNLAWFUL USE OF SIDEWALK/ALLEY BY PEDESTRIAN/PUSHCART": 400,
            "SMOKING BAN INSIDE PUBLIC UTILITY BUS": 100,
            "DRIVING INSTRUCTION CONDUCTED ON MAJOR STREET": 300,
            "NO REGISTRATION": 250,
            "NO PLATE NUMBER": 200,
            "NO LAMP ON REAR OR RED REFLECTORIZED MIRROR": 200,
            "OPERATING IN NON-DESIGNATED AREAS": 1000,
            "FAILURE TO COMPLY WITH REGISTRATION": 50,
            "FOG LAMP VIOLATION": 100,
            "PARKING ON CROSSWALK": 100,
            "PARKING ON SENSOR": 500,
            "TINTED":100,
            "NO WIPER": 100,
            "NO HORN": 100,
            "NO BLOWING OF HORN": 400,
            "NO REFLECTOR MIRROR": 100,
            "NO CANVAS COVER": 100,
            "SMOKE BELCHING": 1000,
            "STEREO BAN": 400,
            "FAILURE TO DIM HEADLIGHTS": 10,
            "LOUD AND DEAFENING BLASTS ON EXHAUST PIPES": 20,
            "NO TAXI AVAILABILITY INDICATOR": 100,
            "OVERLOADING": 200,
            "OVERHEIGHT VEHICLE": 100,
            "ENTRY OF VEHICLES OVER FIVE (5) TONS TO SUBDIVISION": 1000,
            "UNAUTHORIZED MOVEMENT OF TRAILERS AND CONTAINER VANS": 500,
            "PROHIBITED PARKING FOR CONTAINER VANS AND TRAILERS": 400,
            "PUJ LOADING CARGOES": 200,
            "TRUCKING MUD ON STREET": 1000,
            "UNLAWFUL RIDING": 100,
            "CARRYING PASSENGERS ON TRUCKS": 100,
            "U-TURN IN BUSINESS DISTRICT/INTERSECTION": 200,
            "UNSAFE BACKING/MANEUVER": 200,
            "DRIVING ON RIGHT SIDE OF ROADWAY AND PASSING": 500,
            "RIGHT OF WAY VIOLATION": 500,
            "SPECIAL STOPS (DTS)":500,
            "NO STOPPING (DTS)": 100,
            "PARKING ON SIDEWALK": 100,
            "PARKING ON INTERSECTION": 100,
            "PARKING ON CROSSWALK":100,
            "PARKING ON SENSOR":500,
            "DOUBLE PARKING": 100,
            "DRIVING ON SIDEWALK": 100,
            "PARKING ON OPPOSITE DIRECTION": 100,
            "NO PARKING (DTS)":100,
            "TOW AWAY ZONE VIOLATION": 300,
            "NON-PARALLEL PARKING OF TRUCKS, CARS, TARTANILLAS, CAROMATAS, AND OTHER VEHICLES": 300,
            "NO ENTRY AT FREEDOM PARK": 300,
            "CLAMPING VIOLATION": 500,
            "NO LOADING AND UNLOADING (DTS)": 100,
            "LOADING / UNLOADING BUS STOP": 100,
            "PARKING ON PUJ STOP": 300,
            "PAY PARKING VIOLATION": 500,
            "VIOLATION ON EMBARKING ON/DISEMBARKING FROM ANY VEHICLE":10,
            "ILLEGAL LOADING AND UNLOADING FOR CARGOES": 400,
            "FAILURE TO YIELD TO PEDESTRIAN": 100,
            "PARKING ON RESTRICTED AND PROHIBITED ON-STREET PARKING": 500,
            "NO RIG LICENSE": 100,
            "JAYWALKING": 20,
            "NO LAMP LIGHT": 100,
            "NO FALLING IN LINE": 20,
            "INCONVENIENCE FOR DISABLED PERSON":300,
            "DEFECTIVE TAIL/BRAKE/PLATE/HEAD LIGHT":100,
            "PEDAL OPERATED/TRISICAD BAN":100,

          }
        };

        // Map data using headers
        const parsedData = filteredData.map(row => {
          console.log("📝 Raw Row Data:", row); // Debugging
        
          const apprehensionDate = parseDate(row[2]?.trim()) || new Date().toISOString();
          
          const apprehensionDateObj = new Date(apprehensionDate);
          const dueDateObj = new Date(apprehensionDateObj);
          dueDateObj.setDate(dueDateObj.getDate() + 7);

          // Process violation type while preserving "OR/CR"
          let violationType = row[12]?.trim() || "N/A";
          violationType = violationType.replace(/OR\/CR/g, "OR_CR_PLACEHOLDER");
          violationType = violationType.replace(/\/(?!CR)/g, ", ");
          violationType = violationType.replace(/OR_CR_PLACEHOLDER/g, "OR/CR");

          const violationTypes = violationType
          .split(",")
          .map((v) => v.trim().toUpperCase())
          .filter(Boolean);
          
            // Calculate total fine amount
            let totalFine = violationTypes.reduce((sum, violation) => {
              return sum + (fineMapping.ICTPMO[violation] || 0);
            }, 0);

          return {
            ticketNumber: row[1]?.trim(),
            dateOfApprehension: apprehensionDate,  // Assign valid date
            timeOfApprehension: apprehensionDate,  // Same as date
            nameOfDriver: row[3]?.trim() || "N/A",
            address: row[4]?.trim() || "N/A",
            licenseNumber: row[5]?.trim() || "N/A",
            vehicleOwnerName: row[6]?.trim() || "N/A",
            vehicleOwnerAddress: row[7]?.trim() || "N/A",
            vehicleModel: row[8]?.trim() || "N/A",
            vehicleClassification: row[9]?.trim() || "N/A",
            plateNumber: row[10]?.trim() || "N/A",
            placeOfViolation: row[11]?.trim() || "N/A",
            violationType: row[12]?.trim() || "N/A",
            apprehendingOfficer: row[13]?.trim() || "N/A",
            fineAmount: totalFine,
            dueDate: dueDateObj.toISOString(),
            fineStatus: "Unpaid",
          };
          
        });
        
        
        

        console.log("🔍 Parsed CSV Data:", parsedData);
        const CHUNK_SIZE = 100;

        const chunkArray = (array, size) => {
          const result = [];
          for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
          }
          return result;
        };
        
        try {
          const chunks = chunkArray(parsedData, CHUNK_SIZE);
          let allSuccessful = true;
        
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const response = await axios.post('http://localhost:3001/csvUpload', { data: chunk });
        
            if (response.status !== 200) {
              allSuccessful = false;
              console.error(`❌ Error uploading chunk ${i + 1}:`, response.data);
              alert(`Failed to upload chunk ${i + 1}. Check console for details.`);
              break; // optional: stop on first failure
            }
        
            console.log(`✅ Uploaded chunk ${i + 1}/${chunks.length}`);
          }
        
          if (allSuccessful) {
            alert('CSV data uploaded successfully!');
            onCsvUpload(parsedData); // optionally pass full data to parent
          }
        
        } catch (error) {
          console.error('❌ Error uploading CSV data:', error.response?.data || error.message);
          alert('Error uploading CSV data. Check console for details.');
        }
      },
      header: false, // We're manually handling headers
      skipEmptyLines: true,
    });
  };

  return (
    <div className="csv-uploader">
      <input type="file" accept=".csv" onChange={handleFileChange} className="file-input" />
      <button className="upload-csv-button" onClick={handleFileUpload}>
        <FontAwesomeIcon icon={faUpload} style={{ color: "#ffffff", marginRight: "10px" }} />
        Upload CSV
      </button>
    </div>
  );
}

export default CsvUploader;
