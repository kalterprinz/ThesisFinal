import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ViewMore.css"; // External CSS file
import iciT from './iciT.png';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"; // Import the back icon
import { faCircleUser } from "@fortawesome/free-solid-svg-icons/faCircleUser";
import { faArrowUpAZ, faCab, faFilter,faEllipsisH, faFloppyDisk, faMagnifyingGlass, faPen, faRectangleList, faTicket, faTrashCan, faUserPlus, faAdd, faMoneyBill, faMoneyBill1, faMoneyBill1Wave, faCertificate, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import html2canvas from "html2canvas";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";


const ViewMore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const record = location.state;
  console.log("Record Data:", record);
  const fileInputRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [agencyModal, setAgencyModal] = useState(null); // To control which agency modal is shown
  const [driverinfo, setDriverinfo] = useState(null);  // Move state declaration here
  const [isLoading, setIsLoading] = useState(true); // Optional loading state to handle async calls

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("driverId");
    navigate("/login");  // Redirect to login page after logout
  };

  const handleOpenModal = () => {
    document.body.classList.add("modal-open");
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    document.body.classList.remove("modal-open");
    setShowModal(false);
    setAgencyModal(""); // Close the agency-specific modal
  };
  
  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis
  
  const handleDownloadPDF = async () => {
    const modalContent = document.querySelector(".modal .content");
    const closeButton = document.querySelector(".close-modal");
    const downloadButton = document.querySelector(".no-print");

    if (modalContent) {
      try {
         // Temporarily hide buttons
         closeButton.classList.add("hidden");
         downloadButton.classList.add("hidden");

        const canvas = await html2canvas(modalContent, {
          scale: 2, // Increase the scale for better quality
          useCORS: true, // Handle cross-origin issues for images
        });


        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`CASE_${record.nameOfDriver}.pdf`);

        setIctpmoTicketNumber((prev) => {
          const newNumber = (parseInt(prev) + 1).toString().padStart(4, "0");
          localStorage.setItem("lastTicketNumber", newNumber);
          return newNumber;
        });
  
        handleCloseModal();

      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        // Restore button visibility
        closeButton.classList.remove("hidden");
        downloadButton.classList.remove("hidden");
      }
    }
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const fetchDriver = async () => {
    if (!record || !record.email) {
      console.error("Email not found in record");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3001/getdriverfromrecords/${encodeURIComponent(record.email)}`);
      if (!response.ok) throw new Error("Driver not found");

      const driver = await response.json();
      setDriverinfo(driver);
      if (driver.profilePic && driver.profilePic.data) {
        setProfilePic(`data:${driver.profilePic.contentType};base64,${driver.profilePic.data}`);
      }
      console.log("Driver Data:", driver);
    } catch (error) {
      console.error("Error fetching driver:", error);
    }
  };

  // Call fetchDriver in useEffect without conditional logic
  useEffect(() => {
    fetchDriver();
  }, [record.email]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [ictpmoTicketNumber, setIctpmoTicketNumber] = useState(() => {
    return localStorage.getItem("lastTicketNumber") || "0001";
  })

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

  const [ictpmoInputValue, setIctpmoInputValue] = useState("");
  const [ictpmoInputValue3, setIctpmoInputValue3] = useState("");

  const handleIctpmoInputChange = (e) => {
    setIctpmoInputValue(e.target.value);
    localStorage.setItem("savedInput", e.target.value);
  };

  const handleIctpmoInputChange3 = (e) => {
    setIctpmoInputValue3(e.target.value);
    localStorage.setItem("savedInput3", e.target.value);
  };

  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to recalculate
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set new height
    }
  }, [ictpmoInputValue]);

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

  const renderModal = () => {
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
    
      if (agencyModal === "PNP") {
        return (
          <div className="modalall" onRequestClose={handleCloseModal}>
            <div className="modal" onRequestClose={handleCloseModal}>
            <div className="modal-header-button">
                <button className="no-print" onClick={handleDownloadPDF} style={{ border: "none", outline: "none" }}>
                <FontAwesomeIcon icon={faDownload} style={{marginRight:"5"}}/>Download
                </button>
                <button className="close-modal" onClick={handleCloseModal} style={{ border: "none", outline: "none" }}>
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
                    <h3>Philippine National Police</h3>
                    <p>IBJT-North, Tambo, Hinaplanon, Iligan City</p>
                  </div>
                  <div className="logo-container">
                    <img src="/npa.png" alt="Logo" className="logocase" />
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
                  <p1>Philippine National Police</p1>
                  <br></br>
                  <table className="no-border-table">
                      <tbody>
                        <tr>
                          <td><b>TO</b></td>
                          <td><p5>:The Prosecutor’s Office</p5></td>
                          <br></br>
                        </tr>
                        <tr>
                          <td></td>
                          <td><p5>:Hall of Justice, Iligan City</p5></td>
                        </tr>
                        <tr>
                          <td><b>SUBJECT</b></td>
                          <td><p5>:Transmittal</p5></td>
                        </tr>
                      </tbody>
                    </table>
                  <br></br>
                  <p3>&emsp;&emsp;&emsp;&emsp;&emsp;1. Transmitted herewith the Traffic Citation Ticket for violation of City Ordinance No. 02-4256, otherwise known as <b>"The New Traffic Code of Iligan City."</b></p3>
          <br></br><br></br>
          <table className="details-table123">
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
                  {driverinfo?.name || record.nameOfDriver || "N/A"} <br />
                  {driverinfo?.address ||record.address|| "N/A"}
                </td>
                <td>
                  {record.violationType
                    ? record.violationType.split(",").map((v, idx) => (
                        <div key={idx}>
                          {idx + 1}. {v.trim()}
                        </div>
                      ))
                    : "N/A"}
                </td>
                <td>
                  {record.dateOfApprehension
                    ? new Date(record.dateOfApprehension).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })
                    : "N/A"}
                </td>
                <td>{record.apprehendingOfficer || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <br></br><br></br>
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
                <div className="page-break"></div>
    
                {/* Second Page - Affidavit */}
                <div className="insidepage">
                  <div className="affidavit"> 
                  <div className="affidavitheader">
                      <p>Republic of the Philippines <br/>
                        Iligan City&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )S.S. <br/>
                        X-----------------------------------/ </p>
                      <h3 style={{textAlign:"center", marginBottom:"25px"}}>AFFIDAVIT OF COMPLAINT </h3>
                      <p className="titleviewp">(THIS IS THE JUDICIAL AFFIDAVIT OF
                        {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
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
                          {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
                          </div>
                          <p>Affiant</p>
                        </div>
                    </div>
                    <div className="attest">
                      <h3>ATTESTATION </h3>
                      <p className="titleviewpA">
                        <b>I HEREBY CERTIFY</b>,  that I personally supervised the examination of the above named affiant 
                        conducted by
                        {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
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
      } else if (agencyModal === "LTO") {
        return (
          <div className="modalall" onRequestClose={handleCloseModal}>
            <div className="modal" onRequestClose={handleCloseModal}>
              <div className="modal-header-button">
                <button className="no-print" onClick={handleDownloadPDF} style={{ border: "none", outline: "none" }}>
                <FontAwesomeIcon icon={faDownload} style={{marginRight:"5"}}/>Download
                </button>
                <button className="close-modal" onClick={handleCloseModal} style={{ border: "none", outline: "none" }}>
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
                    <h3>Land Transportation Office</h3>
                    <p>Tubod, Iligan City</p>
                  </div>
                  <div className="logo-container">
                  <img src="/lto.png" alt="Logo" className="logocase" />
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
                  <p1>Land Transportation Office</p1>
                  <br></br>
                  <table className="no-border-table">
                      <tbody>
                        <tr>
                          <td><b>TO</b></td>
                          <td><p5>:The Prosecutor’s Office</p5></td>
                          <br></br>
                        </tr>
                        <tr>
                          <td></td>
                          <td><p5>:Hall of Justice, Iligan City</p5></td>
                        </tr>
                        <tr>
                          <td><b>SUBJECT</b></td>
                          <td><p5>:Transmittal</p5></td>
                        </tr>
                      </tbody>
                    </table>
                  <br></br>
                  <p3>&emsp;&emsp;&emsp;&emsp;&emsp;1. Transmitted herewith the Traffic Citation Ticket for violation of City Ordinance No. 02-4256, otherwise known as <b>"The New Traffic Code of Iligan City."</b></p3>
          <br></br><br></br>
          <table className="details-table123">
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
                {driverinfo?.name || record.nameOfDriver || "N/A"} <br />
                {driverinfo?.address ||record.address|| "N/A"}
                </td>
                <td>
                  {record.violationType
                    ? record.violationType.split(",").map((v, idx) => (
                        <div key={idx}>
                          {idx + 1}. {v.trim()}
                        </div>
                      ))
                    : "N/A"}
                </td>
                <td>
                  {record.dateOfApprehension
                    ? new Date(record.dateOfApprehension).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })
                    : "N/A"}
                </td>
                <td>{record.apprehendingOfficer || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <br></br><br></br>
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
                        <h3 style={{textAlign:"center", marginBottom:"25px"}}>AFFIDAVIT OF COMPLAINT </h3>
                      <p className="titleviewp">(THIS IS THE JUDICIAL AFFIDAVIT OF
                        {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
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
                          {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
                          </div>
                          <p>Affiant</p>
                        </div>
                    </div>
                    <div className="attest">
                      <h3>ATTESTATION </h3>
                      <p className="titleviewpA">
                        <b>I HEREBY CERTIFY</b>,  that I personally supervised the examination of the above named affiant 
                        conducted by
                        {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
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
      } else if (agencyModal === "ICTPMO") {
        return (
          <div className="modalall" onRequestClose={handleCloseModal}>
            <div className="modal" onRequestClose={handleCloseModal}>
              <div className="modal-header-button">
                <button className="no-print" onClick={handleDownloadPDF} style={{ border: "none", outline: "none" }}>
                <FontAwesomeIcon icon={faDownload} style={{marginRight:"5"}}/>Download
                </button>
                <button className="close-modal" onClick={handleCloseModal} style={{ border: "none", outline: "none" }}>
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
    
                    <p1>Iligan City Traffic and Parking Management Office</p1>
                    <br />
    
                    <table className="no-border-table">
                    <tbody>
                        <tr>
                          <td><b>TO</b></td>
                          <td><p5>:The Prosecutor’s Office</p5></td>
                          <br></br>
                        </tr>
                        <tr>
                          <td></td>
                          <td><p5>:Hall of Justice, Iligan City</p5></td>
                        </tr>
                        <tr>
                          <td><b>SUBJECT</b></td>
                          <td><p5>:Transmittal</p5></td>
                        </tr>
                      </tbody>
                    </table>
    
                    <br />
                    <p>
                      &emsp;&emsp;&emsp;&emsp;&emsp;1. Transmitted herewith the Traffic Citation Ticket for violation of City
                      Ordinance No. 02-4256, otherwise known as <b>"The New Traffic Code of Iligan City."</b>
                    </p>
                    <br />
    
                    <table className="details-table123">
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
                          {driverinfo?.name || record.nameOfDriver || "N/A"} <br />
                          {driverinfo?.address ||record.address|| "N/A"}
                          </td>
                          <td>
                            {record.violationType
                              ? record.violationType.split(",").map((v, idx) => (
                                  <div key={idx}>
                                    {idx + 1}. {v.trim()}
                                  </div>
                                ))
                              : "N/A"}
                          </td>
                          <td>
                            {record.dateOfApprehension
                              ? new Date(record.dateOfApprehension).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "2-digit",
                                })
                              : "N/A"}
                          </td>
                          <td>{record.apprehendingOfficer || "N/A"}</td>
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
                        <h3 style={{textAlign:"center", marginBottom:"25px"}}>AFFIDAVIT OF COMPLAINT </h3>
                      <p className="titleviewp">(THIS IS THE JUDICIAL AFFIDAVIT OF
                        {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
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
                          {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
                          </div>
                          <p>Affiant</p>
                        </div>
                    </div>
                    <div className="attest">
                      <h3>ATTESTATION </h3>
                      <p className="titleviewpA">
                        <b>I HEREBY CERTIFY</b>,  that I personally supervised the examination of the above named affiant 
                        conducted by
                        {" "}<strong>{record.apprehendingOfficer|| "N/A"}</strong> {" "}
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
  
  const [signature, setSignature] = useState(null);
  const [evidence, setEvidence] = useState(null);
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await fetch(`http://localhost:3001/getSignature/${record._id}`);
        console.log("id value",record._id)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.signature && data.signature.data && data.signature.contentType) {
          setSignature(`data:${data.signature.contentType};base64,${data.signature.data}`);
        } else {
          console.error("Signature not found in the record.");
        }
        if (data.evidence && data.evidence.data && data.evidence.contentType) {
          setEvidence(`data:${data.evidence.contentType};base64,${data.evidence.data}`);
        } else {
          console.error("Evidence not found in the record.");
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };

    if (record?._id) {
      fetchSignature();
    }
  }, [record]);

  return (
    <div>
      {/* Header */}
      <header className="headerV">
        <div className="logoheaderG">
          <img src={iciT} alt="Logo" />
        </div>
        <h4 className="title">ILIGAN CITATION TICKET ONLINE</h4>
        <nav className="nav">
          <button className="navDriver" onClick={handleLogout}>
            <FontAwesomeIcon icon={faCircleUser} size="2xl" /> Logout
          </button>
        </nav>
      </header>
     
      
      <div className="viewmoreof">
        <div className="viewheader">
          {/* Back Button */}
          <button className="back-button" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <button className="file-case-button" onClick={handleOpenModal}>
              File a Case
          </button>
        </div>
        {/* Main Container */}
      <div className="view-more-container">
        
        {/* Driver Information Section */}
        <div className="section">
          <h3 className="section-title">Driver Information</h3>
          <div className="driver-info">
            <div className="driver-profile">
            <div className="profile-pic-container" onClick={() => setShowProfileModal(true)}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="profile-pic" />
          ) : ("No Profile Available"
          )}
        </div>
            </div>
            <table className="details-table">
              <tbody>
                <tr>
                  <th>Name:</th>
                  <td>{driverinfo?.name|| record.nameOfDriver || "N/A"} </td>
                </tr>
                <tr>
                  <th>Age:</th>
                  <td>{driverinfo?.age|| record.age || "N/A"}</td>
                </tr>
                <tr>
                <th>Gender:</th>
                  <td>{driverinfo?.gender|| record.gender || "N/A"}</td>
                </tr>
                <tr>
                  
                  <th>Date of Birth:</th>
                  <td>
                  {
                  (() => {
                    const dateString = driverinfo?.birthday || record.dateOfBirth;
                    
                    console.log("Raw date value:", dateString); // Debugging log

                    if (!dateString) return "N/A"; // If no date is available, return "N/A"

                    const date = new Date(dateString);
                    
                    if (isNaN(date.getTime())) {
                      console.warn("Invalid date format:", dateString); // Warn if the date is invalid
                      return "N/A";
                    }

                    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
                  })()
                }

                  </td>
                </tr>
                <tr>
                  <th>Address:</th>
                  <td>{driverinfo?.address || record?.address || "N/A"}</td>
                </tr>
                <tr>
                  <th>Phone Number:</th>
                  <td>{driverinfo?.conNum || record?.phoneNumber || "N/A"}</td>
                </tr>
                <tr>
                  <th>Email:</th>
                  <td>{driverinfo?.email || record?.email || "N/A"}</td>
                </tr>
                <tr>
                  <th>Occupation:</th>
                  <td>{driverinfo?.occu || record?.occupation || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* License Information Section */}
        <div className="section">
          <h3 className="section-title">License Information</h3>
          <table className="details-table3">
            <tbody>
              <tr>
                <th>License Number:</th>
                <td>{driverinfo?.DriLicense || record?.licenseNumber || "N/A"}</td>
              </tr>
              <tr>
                <th>License Classification:</th>
                <td>{driverinfo?.DLClass || record?.licenseClassification || "N/A"}</td>
              </tr>
              <tr>
                <th>Date of Issue:</th>
                <td>{driverinfo?.DLIssue || "N/A"}</td>
              </tr>
              <tr>
                <th>Expiration Date:</th>
                <td>{driverinfo?.DLExpireDate || record?.expirationDate || "N/A"}</td>
              </tr>
             
            </tbody>
          </table>
        </div>

        {/* Vehicle Information Section */}
        <div className="section">
          <h3 className="section-title">Vehicle Information</h3>
          <table className="details-table2">
            <tbody>
              <tr>
                <th>Plate Number:</th>
                <td>{record.plateNumber || "N/A"}</td>
              </tr>
              <tr>
                <th>Model:</th>
                <td>{record.vehicleModel || "N/A"}</td>
              </tr>
              <tr>
                <th>Year:</th>
                <td>{record.vehicleYear || "N/A"}</td>
              </tr>
              <tr>
                <th>Color:</th>
                <td>{record.vehicleColor || "N/A"}</td>
              </tr>
              <tr>
                <th>Vehicle Classification:</th>
                <td>{record.vehicleClassification || "N/A"}</td>
              </tr>

              <tr>
                <th>Owner's Name:</th>
                <td>{record.vehicleOwnerName || "N/A"}</td>
              </tr>
              <tr>
                <th>Owner's Address:</th>
                <td>{record.vehicleOwnerAddress || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Violation Information Section */}
        <div className="section">
          <h3 className="section-title">Violation Information</h3>
          <table className="details-table13">
            <tbody>
              <tr>
                <th>Ticket Number:</th>
                <td>{record.ticketNumber}</td>
              </tr>
              <tr>
                <th>Date of Apprehension:</th>
                <td>{new Date(record.dateOfApprehension).toISOString().split("T")[0]}</td>
              </tr>
              <tr>
                <th>Time of Apprehension:</th>
                <td>{new Date(record.timeOfApprehension).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</td>
              </tr>
              <tr>
                <th>Place of Violation:</th>
                <td>{record.placeOfViolation}</td>
              </tr>
              
              <tr>
                <th>Violation Type:</th>
                <td>{record.violationType}</td>
              </tr>
              <tr>
                <th>Violation Description:</th>
                <td>{record.violationDes}</td>
              </tr>
              <tr>
                <th>Fine Amount:</th>
                <td>₱{record.fineAmount || "N/A"}</td>
              </tr>
              <tr>
                <th>Fine Status:</th>
                <td>{record.fineStatus}</td>
              </tr>
              <tr>
                <th>Driver E-Signature:</th>
                <td>{signature ? (
                <img
                  src={signature}
                  alt="Driver Signature"
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              ) : (
                "No signature available"
              )}</td>
              </tr>
              <tr>
                <th>Evidential Photo</th>
                <td>{evidence ? (
                <img
                  src={evidence}
                  alt="Evidence"
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              ) : (
                "No Photo Submitted"
              )}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Apprehending Officer Section */}
        <div className="section">
          <h3 className="section-title">Apprehending Officer and Agency</h3>
          <table className="details-table14">
            <tbody>
              <tr>
                <th>Officer Name:</th>
                <td>{record.apprehendingOfficer || "N/A"}</td>
              </tr>
              <tr>
                <th>Officer Agency:</th>
                <td>{record.agency || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

       {/* Modal */}
       {showModal && (
 <div className="case-modal-overlay">
 <div className="case-modal">
   <div className="case-modal-content">
     <h3>Choose Agency</h3>
     <div className="agency-buttons">
       <button onClick={() => setAgencyModal("PNP")} className="agency-button">
         <div className="image-box">
           <img src="/npa.png" alt="PNP" className="agency-image" />
         </div>
         PNP
       </button>
       <button onClick={() => setAgencyModal("LTO")} className="agency-button">
         <div className="image-box">
           <img src="/lto.png" alt="LTO" className="agency-image" />
         </div>
         LTO
       </button>
       <button onClick={() => setAgencyModal("ICTPMO")} className="agency-button">
         <div className="image-box">
           <img src="/ictpmo.jpg" alt="ICTPMO" className="agency-image" />
         </div>
         ICTPMO
       </button>
     </div>
   </div>
   <div className="case-modal-footer">
     <button className="close-case-modal" onClick={handleCloseModal}>Close</button>
   </div>
 </div>
</div>


)}


        {/* Conditional Agency Modals */}
        {renderModal()}
      
      </div>
      </div>
      
    </div>
  ); //return
};

export default ViewMore;
