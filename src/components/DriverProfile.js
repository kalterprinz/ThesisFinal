import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { QRCodeCanvas } from "qrcode.react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import "./DriverDash.css";

const DriverProfile = () => {
  const [driverInfo, setDriverInfo] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showFront, setShowFront] = useState(true);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef(null);


  const qrRef = useRef(null);
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
    const fetchDriverData = async () => {
      const driverId = localStorage.getItem("driverId");
      if (!driverId) {
        console.error("No driverId found in localStorage");
        return;
      }
      try {
        const response = await fetch(`http://localhost:3001/getdriver/${driverId}`);
        const data = await response.json();
        setDriverInfo(data);
        //kirk selwyn miguel fuentevilla ycong
        //normailah macala
        //cate melody dalis
        // Set profile picture if available
        if (data.profilePic && data.profilePic.data) {
          setProfilePic(`data:${data.profilePic.contentType};base64,${data.profilePic.data}`);
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
      }
    };

    fetchDriverData();
  }, []);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const driverId = localStorage.getItem("driverId");
      const response = await fetch(`http://localhost:3001/updateProfilePic/${driverId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setProfilePic(`data:${result.contentType};base64,${result.data}`);
      } else {
        console.error("Error updating profile picture.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Open modal and prepare QR code data if type is "qr"
  const toggleModal = (type) => {
    if (type === "qr" && driverInfo) {
      const dataString = JSON.stringify({
        license: driverInfo.DriLicense
      });
      setQrCodeData(dataString);
      setShowQR(true);
    } else {
      setShowQR(false);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowQR(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modalDF")) {
      closeModal();
    }
  };

  // Download QR code with padding
  const handleDownloadQRCode = () => {
    const canvas = qrRef.current || document.querySelector("canvas");
    if (!canvas) {
      console.error("QR code canvas not found.");
      return;
    }

    const padding = 20;
    const paddedCanvas = document.createElement("canvas");
    const context = paddedCanvas.getContext("2d");

    paddedCanvas.width = canvas.width + padding * 2;
    paddedCanvas.height = canvas.height + padding * 2;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
    context.drawImage(canvas, padding, padding);

    const pngUrl = paddedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${driverInfo.name}_qr_code.png`;
    downloadLink.click();
  };

  if (!driverInfo) {
    return <div className="norecord"><p>Loading driver information...</p></div>;
  }

  return (
    <div className="elearning-containerDF">
      <div className="profile">
        <div className="profile-container">
        <div className="profile-pic-container" onClick={() => setShowProfileModal(true)}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="profile-pic" />
          ) : (
            <button className="upload-btn">Upload Photo</button>
          )}
        </div>

          <input
            type="file"
            id="profilePicInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleProfilePicChange}
          />
          <div className="driver-infoDF">
            <div className="material-cardDF">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{driverInfo.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Age:</span>
                <span className="info-value">{driverInfo.age}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Gender:</span>
                <span className="info-value">{driverInfo.gender}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{driverInfo.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{driverInfo.conNum}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">{driverInfo.address}</span>
              </div>
              <div className="info-row">
                <span className="info-label">License No:</span>
                <span className="info-value">{driverInfo.DriLicense}</span>
              </div>
            </div>
            <div className="buttonsDF">
              <button onClick={() => toggleModal("license")}>Show Driver License</button>
              <button onClick={() => toggleModal("qr")}>Show QR Code</button>
            </div>
          </div>
        </div>
        {showProfileModal && (
          <div className="modalDF" onClick={() => setShowProfileModal(false)}>
            <div className="modal-contentDF" onClick={(e) => e.stopPropagation()}>
              <span className="closeDF" onClick={() => setShowProfileModal(false)}>
                <FontAwesomeIcon icon={faCircleXmark} style={{ color: "#05223e" }} />
              </span>
              <h2>Profile Picture</h2>
              <img
                src={profilePic || "/default-profile.png"}
                alt="Profile"
                className="profile-pic-large"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
              />
              <button onClick={() => fileInputRef.current.click()} className="flip-btn">
                Change Photo
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modalDF" onClick={handleOutsideClick}>
            <div className="modal-contentDF">
              <span className="closeDF" onClick={closeModal}>
                <FontAwesomeIcon icon={faCircleXmark} style={{ color: "#05223e" }} />
              </span>
              {showQR ? (
                <div>
                  <h2>Driver QR Code</h2>
                  {qrCodeData ? (
                    <div className="qr-code-wrapper">
                      <QRCodeCanvas id="qr-code" value={qrCodeData} size={200} />
                    </div>
                  ) : (
                    <p>Generating QR Code...</p>
                  )}
                  <button onClick={handleDownloadQRCode} className="download-btn">Download QR Code</button>
                </div>
              ) : (
                <div>
                  <h2>Driver License ID</h2>
                  <img
                    src={showFront ? `data:${driverInfo.front.contentType};base64,${driverInfo.front.data}`
                                  : `data:${driverInfo.back.contentType};base64,${driverInfo.back.data}`}
                    alt={showFront ? "Driver License Front" : "Driver License Back"}
                    className="liceID"
                  />
                  <button onClick={() => setShowFront(!showFront)} className="flip-btn">
                    {showFront ? "Flip to Back" : "Flip to Front"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverProfile;
