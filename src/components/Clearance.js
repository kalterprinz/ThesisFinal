import "./all.css";
import React, { useState, useEffect, useCallback, useRef  } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title,Tooltip, Legend } from 'chart.js';
import { useNavigate } from "react-router-dom"; 
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./OfViolationRecords.css";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import OfficerHeader from './OfficerHeader';
import Sidebar from  './Sidebar';

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


const Clearance = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility
  const [activeTab, setActiveTab] = useState(1);

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

  const [ictpmoInputValue, setIctpmoInputValue] = useState("");
  const handleIctpmoInputChange = (e) => {
    setIctpmoInputValue(e.target.value);
  };

  const handleDownloadPDF = async () => {
    try {
      const tabContent = document.querySelector(".tab-content");
      if (!tabContent) {
        console.error("Tab content not found");
        return;
      }

      const canvas = await html2canvas(tabContent, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`Clearance_Tab${activeTab}.pdf`);

      handleSubmit();

    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
     // Function to toggle sidebar
     const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
      };
    

  const [encoder, setEncoder] = useState(() => {
      return localStorage.getItem("encoder");
    })
  
    const [adminInCharge, setAdminInCharge] = useState(() => {
      return localStorage.getItem("adminInCharge");
    })
    const handleEncoderChange = (e) => {
      const value = e.target.value;
      setEncoder(value); 
      localStorage.setItem("encoder", value); 
    };
    const handleAdminInChargeChange = (e) => {
      const value = e.target.value;
      setAdminInCharge(value); 
      localStorage.setItem("adminInCharge", value); 
    };
  const [defaultAddress, setDefaultAddress] = useState("Land Transportation Office at Tubod, Iligan City, Lanao Del Norte ,Philippines.");
  const [ticketNumber3, setTicketNumber3] = useState(() => {
      return localStorage.getItem("lastTicketNumber3") || "0001";
    })

    const [name3, setName3] = useState("");
    const [address3, setAddress3] = useState("");
    const [vehicle, setVehicle] = useState("");
    const [brand, setBrand] = useState("");
    const [plate, setPlate] = useState("");
    const [cha, setCha] = useState("");
    const [req, setReq] = useState("");
    const [addressReq, setAddressReq] = useState("");

    const handleSubmit = async (e) => {
      if (e) e.preventDefault();
    
      const recordData = {
        ticketNumber: ticketNumber3,
        name: name3,
        address: address3,
        vehicle: vehicle,
        brand: brand,
        plateNumber: plate,
        chassisNumber: cha,
        requirement: req,
        requirementAddress: addressReq,
        encoder: encoder,
        adminInCharge: adminInCharge,
        submissionDate: new Date().toISOString(),
      };
    
      try {
        const response = await fetch("http://localhost:3001/addClearance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recordData),
        });
    
        if (response.ok) {
          // Increment ticket number
          const nextTicketNumber = String(parseInt(ticketNumber3) + 1).padStart(4, '0');
          setTicketNumber3(nextTicketNumber);
          localStorage.setItem("lastTicketNumber3", nextTicketNumber);
    
          // Clear form fields
          setName3("");
          setAddress3("");
          setVehicle("");
          setBrand("");
          setPlate("");
          setCha("");
          setReq("");
          setAddressReq("");
    
        } else {
          throw new Error("Failed to save record");
        }
      } catch (error) {
        console.error("Error saving record:", error);
        alert("Failed to save the record. Please try again.");
      }
    };

    useEffect(() => {
      const handleUnload = async () => {
        await fetch("http://localhost:3001/shutdown", { method: "POST" });
      };
    
      window.addEventListener("beforeunload", handleUnload);
    
      return () => {
        window.removeEventListener("beforeunload", handleUnload);
      };
    }, []);
    const [showModal, setShowModal] = useState(false);
    const [agencyModal, setAgencyModal] = useState("");
    const handleClearance = (records) => {
      setShowModal(true);
      setIctpmoRecord({
        nameOfDriver: records.nameOfDriver,
        address: records.address,
        violationType: records.violationType,
        dateOfApprehension: records.dateOfApprehension,
        apprehendingOfficer: records.apprehendingOfficer,
        fineAmount: records.fineAmount,
        oRNo: records.oRNo,
        datepaid: records.datepaid,
      });
      //kirk selwyn miguel fuentevilla ycong
        //normailah macala
        //cate melody dalis
      // Add the modal-open class to the body for proper styling
      document.body.classList.add("modal-open");
      // Set the state to trigger the ICTPMO modal rendering
      setAgencyModal("ICTPMO");
    };
    
   const [ictpmoRecord, setIctpmoRecord] = useState({
      nameOfDriver: "",
      address: "",
      violationType: "",
      dateOfApprehension: "",
      apprehendingOfficer: "",
      fineAmount:"",
      oRNo:"",
      datepaid:"",
    });

  return (
    <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <OfficerHeader isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="main-sectionclear">
        <div className="clearance-section">
        <h1 className="clearanceh2">Clearance</h1>
        
          {/* Tab Headers */}
          <div className="tabs">
            <button
              className={activeTab === 1 ? "active-tab" : ""}
              onClick={() => setActiveTab(1)}
            >
              Lost Driver's License
            </button>
            <button
              className={activeTab === 2 ? "active-tab" : ""}
              onClick={() => setActiveTab(2)}
            >
              For Vehicle Registration
            </button>
            <button
              className={activeTab === 3 ? "active-tab" : ""}
              onClick={() => setActiveTab(3)}
            >
              Lost Certificate of Registration/Official Receipt
            </button>
          </div>

          <div className="download-clearance">
            <button className="download-pdf" onClick={handleDownloadPDF}>
              <FontAwesomeIcon icon={faDownload} style={{marginRight:"5"}}/>Download
            </button>
          </div>
          
        <div className="tabss"> 
          {/* Tab Content 1 */}
          <div className="tab-content">
            {activeTab === 1 && 
              <div>
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
                    <img src="/logorem.png" alt="Logo" className="logoictpmo" />
                  </div>
                </div>
                <div className="belowheadercl">
                  <p>ICTPMO Number:  {""}
                  <span
                      contentEditable="true"
                      onBlur={(e) => {
                        let newNumber = e.target.innerText.replace(/\D/g, "");
                        newNumber = Math.min(
                          Math.max(parseInt(newNumber || "1", 10), 1),
                          99999
                        )
                          .toString()
                          .padStart(5, "0");
                        setTicketNumber3(newNumber);
                      }}
                      suppressContentEditableWarning={true}
                      style={{ outline: "none", cursor: "text" }}
                    >
                      {ticketNumber3}
                    </span>-
                      {new Date().toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric"
                      }).replace(/\//g, "-")}
           
            </p>
            <p>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric"
            })}
            </p>
                </div>
                <div className="clearcontentcl"> 
                  <h1 style={{textAlign:"center", fontSize:"27px", marginBottom:"60px", marginTop:"40px"}}>TRAFFIC CLEARANCE</h1>
                  <h4>TO WHOM IT MAY CONCERN;</h4>
                  <p>
                    &emsp;&emsp;&emsp;THIS IS TO CERTIFY that per record available in this office shows 
                    {" "}<input
                      type="text"
                      className="editable-input"
                      placeholder="Name"
                      value={name3}
                      onChange={(e) => setName3(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        width:"fit-content",
                        cursor: "text",
                        textAlign:"left",
                        height: "20px",
                        width:"250px",
                        font:"16px Times New Roman",
                        fontWeight:"bold",
                        textDecoration: name3 ? "none" : "underline",
                      }}
                    />
                    , of legal age, Filipino, single/married/widow/er a resident of
                    <input
                      type="text"
                      className="editable-input"
                      placeholder="Address"
                      value={address3}
                      onChange={(e) => setAddress3(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        width:"fit-content",
                        cursor: "text",
                        textAlign:"left",
                        height: "20px",
                        width:"380px",
                        font:"16px Times New Roman",
                        fontWeight:"bold",
                        textDecoration: address3 ? "none" : "underline",
                      }}
                    />
                    has no pending record found in the system for violation of the provisions of the law under <i><b>C.O. 02-4256 known as The New Traffic Code of Iligan City.</b></i> <br/><br/>
                    
                    &emsp;&emsp;&emsp;This clearance is being issued upon the request of the aforementioned name to support his/her application for the replacement/renewal of his/her Driver's License
                    
                     at <input
                type="text"
                className="editable-input"
                placeholder="Address"
                value={defaultAddress}
                onChange={(e) => setDefaultAddress(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "fit-content",
                  cursor: "text",
                  textAlign: "left",
                  height: "25px",
                  width: "640px",
                  font: "16px Times New Roman",
                }}
              />
                  </p>
                </div><br/>
                <div className="signatoriescl">
                  <p>Prepared and Verified by:</p>
                  <p>Certified by:       </p>
                </div>
                <div className="signatoriescl1">
                  <p style={{marginLeft:"30px"}}>
                  <input
                type="text"
                value={encoder}
                onChange={handleEncoderChange}
                className="editable-input"
                placeholder="Name"
                style={{
                  border: "none",
                  outline: "none",
                  width:"fit-content",
                  cursor: "text",
                  textAlign:"center",
                  height: "20px",
                  width:"200px",
                  font:"16px Times New Roman",
                  fontWeight:"bold",
                  borderBottom:"1px solid black"
                }}
              />
                  </p>
                  <p>
                  <input
                type="text"
                value={adminInCharge}
                onChange={handleAdminInChargeChange}
                className="editable-input"
                placeholder="Name"
                style={{
                  border: "none",
                  outline: "none",
                  width:"fit-content",
                  cursor: "text",
                  textAlign:"center",
                  height: "20px",
                  width:"200px",
                  font:"16px Times New Roman",
                  fontWeight:"bold",
                  borderBottom:"1px solid black"
                }}
              />
                    </p>
                </div>
                <div className="signatoriescl2">
                  <p>Data Encoder	   </p>
                  <p>Admin In-charge ICTPMO </p>
                </div>

              </div>
            }

             {/* Tab Content 2 */}
            {activeTab === 2 && 
              <div>
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
                  <img src="/logorem.png" alt="Logo" className="logoictpmo" />
                </div>
              </div>
              <div className="belowheadercl">
              <p>ICTPMO Number:  {""}
            <span
                      contentEditable="true"
                      onBlur={(e) => {
                        let newNumber = e.target.innerText.replace(/\D/g, "");
                        newNumber = Math.min(
                          Math.max(parseInt(newNumber || "1", 10), 1),
                          99999
                        )
                          .toString()
                          .padStart(5, "0");
                        setTicketNumber3(newNumber);
                      }}
                      suppressContentEditableWarning={true}
                      style={{ outline: "none", cursor: "text" }}
                    >
                      {ticketNumber3}
                    </span>-
                      {new Date().toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric"
                      }).replace(/\//g, "-")}
           
            </p>
            <p>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric"
            })}
            </p>
              </div>
              <div className="clearcontentcl"> 
                <h1 style={{textAlign:"center", fontSize:"27px", marginBottom:"60px", marginTop:"40px"}}>TRAFFIC CLEARANCE</h1>
                <h3>TO WHOM IT MAY CONCERN;</h3>
                <p>
                  &emsp;&emsp;&emsp;This is to certify that based on records available in this office shows that the CERTIFICATE OF REGISTRATION/OFFCIAL RECEIPT issued under the name
                  {" "}<input
                    type="text"
                    className="editable-input"
                    placeholder="Name"
                    value={name3}
                    onChange={(e) => setName3(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      width:"fit-content",
                      cursor: "text",
                      textAlign:"left",
                      height: "20px",
                      width:"200px",
                      font:"16px Times New Roman",
                      fontWeight:"bold",
                      textDecoration: name3 ? "none" : "underline",
                    }}
                  />
                  , a 
                  {" "}<input
                        type="text"
                        className="editable-input"
                        placeholder="Vehicle"
                        value={vehicle}
                        onChange={(e) => setVehicle(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          cursor: "text",
                          textAlign:"left",
                          height: "20px",
                          width: "150px",
                          font: "16px Times New Roman",
                          fontWeight: "bold",
                          textDecoration: vehicle ? "none" : "underline",
                        }}
                      />
                  brand name 
                  {" "}<input
                        type="text"
                        className="editable-input"
                        placeholder="Brand Name, Model, Year"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          cursor: "text",
                          textAlign:"left",
                          height: "20px",
                          width: "300px",
                          font: "16px Times New Roman",
                          fontWeight: "bold",
                          textDecoration: brand ? "none" : "underline",
                        }}
                      />
                  bearing Plate No. 
                  {" "}<input
                    type="text"
                    className="editable-input"
                    placeholder="Plate Number"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      cursor: "text",
                      textAlign:"left",
                      height: "20px",
                      width: "150px",
                      font: "16px Times New Roman",
                      fontWeight: "bold",
                      textDecoration: plate ? "none" : "underline",
                    }}
                  /> &emsp;, 
                  Chassis/Engine No. {" "}
                  <input
                    type="text"
                    className="editable-input"
                    placeholder="xxxxxxxxxxxxxxxxxxxxx"
                    value={cha}
                    onChange={(e) => setCha(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      width:"fit-content",
                      cursor: "text",
                      textAlign:"left",
                      height: "20px",
                      width:"250px",
                      font:"16px Times New Roman",
                      fontWeight:"bold",
                      textDecoration: cha ? "none" : "underline",
                    }}
                  />
                  of legal age, Filipino, single/married/widow/er a resident of
                  {" "}<input
                    type="text"
                    className="editable-input"
                    placeholder="Address"
                    value={address3}
                    onChange={(e) => setAddress3(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      width:"fit-content",
                      cursor: "text",
                      textAlign:"left",
                      height: "20px",
                      width:"350px",
                      font:"16px Times New Roman",
                      fontWeight:"bold",
                      textDecoration: address3 ? "none" : "underline",
                    }}
                  />
                  has no pending record found in the system for violation of the provisions of the law under <i><b>C.O. 02-4256 known as The New Traffic Code of Iligan City,</b></i> and is cleared for vehicle registration. <br/><br/>
                  &emsp;&emsp;&emsp;This clearance is being issued upon the request of 
                  {" "}<input
                    type="text"
                    className="editable-input"
                    placeholder="Name of Requesting Person"
                    value={req}
                    onChange={(e) => setReq(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      width:"fit-content",
                      cursor: "text",
                      padding:"0px 10px",
                      textAlign:"left",
                      height: "20px",
                      width:"250px",
                      font:"16px Times New Roman",
                      fontWeight:"bold",
                      textDecoration: req ? "none" : "underline",
                    }}
                  />.
                  for the purpose of 
                  the replacement/renewal of his/her Vehicle Registration at
                  <input
                type="text"
                className="editable-input"
                placeholder="Address"
                value={defaultAddress}
                onChange={(e) => setDefaultAddress(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "fit-content",
                  cursor: "text",
                  textAlign: "left",
                  height: "25px",
                  width: "640px",
                  font: "16px Times New Roman",
                }}
              />
                </p>
              </div><br/>
              <div className="signatoriescl">
                <p>Prepared and Verified by:</p>
                <p>Certified by:       </p>
              </div>
              <div className="signatoriescl1">
                <p style={{marginLeft:"30px"}}>
                <input
                type="text"
                value={encoder}
                onChange={handleEncoderChange}
                className="editable-input"
                placeholder="Name"
                style={{
                  border: "none",
                  outline: "none",
                  width:"fit-content",
                  cursor: "text",
                  textAlign:"center",
                  height: "20px",
                  width:"200px",
                  font:"16px Times New Roman",
                  fontWeight:"bold",
                  borderBottom:"1px solid black"
                }}
              />
                </p>
                <p>
                <input
                type="text"
                value={adminInCharge}
                onChange={handleAdminInChargeChange}
                className="editable-input"
                placeholder="Name"
                style={{
                  border: "none",
                  outline: "none",
                  width:"fit-content",
                  cursor: "text",
                  textAlign:"center",
                  height: "20px",
                  width:"200px",
                  font:"16px Times New Roman",
                  fontWeight:"bold",
                  borderBottom:"1px solid black"
                }}
              />
                  </p>
              </div>
              <div className="signatoriescl2">
                <p>Data Encoder	   </p>
                <p>Admin In-charge ICTPMO </p>
              </div>
              
            </div>
            }

             {/* Tab Content 3 */}
            {activeTab === 3 && 
              <div>
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
                    <img src="/logorem.png" alt="Logo" className="logoictpmo" />
                  </div>
                </div>
                <div className="belowheadercl">
                <p>ICTPMO Number:  {""}
            <span
                      contentEditable="true"
                      onBlur={(e) => {
                        let newNumber = e.target.innerText.replace(/\D/g, "");
                        newNumber = Math.min(
                          Math.max(parseInt(newNumber || "1", 10), 1),
                          99999
                        )
                          .toString()
                          .padStart(5, "0");
                        setTicketNumber3(newNumber);
                      }}
                      suppressContentEditableWarning={true}
                      style={{ outline: "none", cursor: "text" }}
                    >
                      {ticketNumber3}
                    </span>-
                      {new Date().toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric"
                      }).replace(/\//g, "-")}
           
            </p>
            <p>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric"
            })}
            </p>
                </div>
                <div className="clearcontentcl"> 
                  <h1 style={{textAlign:"center", fontSize:"27px", marginBottom:"60px", marginTop:"40px"}}>TRAFFIC CLEARANCE</h1>
                  <h3>TO WHOM IT MAY CONCERN;</h3>
                  <p>
                    &emsp;&emsp;&emsp;This is to certify that based on records available in this office shows that the CERTIFICATE OF REGISTRATION/OFFCIAL RECEIPT issued under the name
                    {" "}<input
                      type="text"
                      className="editable-input"
                      placeholder="Name"
                      value={name3}
                      onChange={(e) => setName3(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        width:"fit-content",
                        cursor: "text",
                        textAlign:"left",
                        height: "20px",
                        width:"250px",
                        font:"16px Times New Roman",
                        fontWeight:"bold",
                        textDecoration: vehicle ? "none" : "underline",
                      }}
                    />
                    , a 
                    {" "}<input
                      type="text"
                      className="editable-input"
                      placeholder="Vehicle"
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        cursor: "text",
                        textAlign:"left",
                        height: "20px",
                        width: "150px",
                        font: "16px Times New Roman",
                        fontWeight: "bold",
                        textDecoration: vehicle ? "none" : "underline",
                      }}
                    />
                    brand name 
                    {" "}<input
                            type="text"
                            className="editable-input"
                            placeholder="Brand Name, Model, Year"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            style={{
                              border: "none",
                              outline: "none",
                              cursor: "text",
                              textAlign:"left",
                              height: "20px",
                              width: "300px",
                              font: "16px Times New Roman",
                              fontWeight: "bold",
                              textDecoration: brand ? "none" : "underline",
                            }}
                          />
                    bearing Plate No. 
                    {" "}<input
                      type="text"
                      className="editable-input"
                      placeholder="Plate Number"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        cursor: "text",
                        textAlign:"left",
                        height: "20px",
                        width: "150px",
                        font: "16px Times New Roman",
                        fontWeight: "bold",
                        textDecoration: plate ? "none" : "underline",
                      }}
                    /> &emsp;, &emsp;
                    Chassis/Engine No. {" "}
                    <input
                      type="text"
                      className="editable-input"
                      placeholder="xxxxxxxxxxxxxxxxxxxxx"
                      value={cha}
                      onChange={(e) => setCha(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        width:"fit-content",
                        cursor: "text",
                        textAlign:"left",
                        height: "20px",
                        width:"250px",
                        font:"16px Times New Roman",
                        fontWeight:"bold",
                        textDecoration: cha ? "none" : "underline",
                      }}
                    />
                    of legal age, Filipino, single/married/widow/er a resident of
                    {" "}<input
                      type="text"
                      className="editable-input"
                      placeholder="Address"
                      value={address3}
                      onChange={(e) => setAddress3(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        width:"fit-content",
                        cursor: "text",
                        padding:"0px 10px",
                        textAlign:"left",
                        height: "20px",
                        width:"350px",
                        font:"16px Times New Roman",
                        fontWeight:"bold",
                        textDecoration: address3 ? "none" : "underline",
                      }}
                    />
                    has no pending record found in the system for violation of the provisions of the law under <i><b>C.O. 02-4256 known as The New Traffic Code of Iligan City.</b></i> <br/><br/>
                    &emsp;&emsp;&emsp;This clearance is being issued upon the request of 
                    {" "}<input
                      type="text"
                      className="editable-input"
                      placeholder="Name of Requesting Person"
                      value={req}
                      onChange={(e) => setReq(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        width:"fit-content",
                        cursor: "text",
                        padding:"0px 10px",
                        textAlign:"left",
                        height: "20px",
                        width:"250px",
                        font:"16px Times New Roman",
                        fontWeight:"bold",
                        textDecoration: req ? "none" : "underline",
                      }}
                    />  
                    , a resident of {"  "}
                    <input
                        type="text"
                        className="editable-input"
                        placeholder="Address"
                        value={addressReq}
                        onChange={(e) => setAddressReq(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          cursor: "text",
                          textAlign:"left",
                          height: "20px",
                          width: "300px",
                          font: "16px Times New Roman",
                          fontWeight: "bold",
                          textDecoration: addressReq ? "none" : "underline",
                        }}
                      />                  
                     to support his/her application for the replacement/renewal of his/her Official Receipt/Certificate of Registration
                    
                     at  {"  "}<input
                type="text"
                className="editable-input"
                placeholder="Address"
                value={defaultAddress}
                onChange={(e) => setDefaultAddress(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "fit-content",
                  cursor: "text",
                  textAlign: "left",
                  height: "25px",
                  width: "640px",
                  font: "16px Times New Roman",
                }}
              />
                  </p>
                </div><br/>
                <div className="signatoriescl">
                  <p>Prepared and Verified by:</p>
                  <p>Certified by:       </p>
                </div>
                <div className="signatoriescl1">
                  <p style={{marginLeft:"30px"}}>
                  <input
                type="text"
                value={encoder}
                onChange={handleEncoderChange}
                className="editable-input"
                placeholder="Name"
                style={{
                  border: "none",
                  outline: "none",
                  width:"fit-content",
                  cursor: "text",
                  textAlign:"center",
                  height: "20px",
                  width:"200px",
                  font:"16px Times New Roman",
                  fontWeight:"bold",
                  borderBottom:"1px solid black"
                }}
              />
                  </p>
                  <p>
                  <input
                type="text"
                value={adminInCharge}
                onChange={handleAdminInChargeChange}
                className="editable-input"
                placeholder="Name"
                style={{
                  border: "none",
                  outline: "none",
                  width:"fit-content",
                  cursor: "text",
                  textAlign:"center",
                  height: "20px",
                  width:"200px",
                  font:"16px Times New Roman",
                  fontWeight:"bold",
                  borderBottom:"1px solid black"
                }}
              />
                    </p>
                </div>
                <div className="signatoriescl2">
                  <p>Data Encoder	   </p>
                  <p>Admin In-charge ICTPMO </p>
                </div>
              </div>
            }
          </div>
        </div>  
        </div>
      </main>
    </div>

  );
};

export default Clearance;