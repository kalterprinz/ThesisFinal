import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { QRCodeCanvas } from "qrcode.react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faEnvelope, faKey, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import axios from "axios"; 

const Signup = () => {
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis

  // Individual state values for each input
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [address, setAddress] = useState("");
  const [conNum, setConNum] = useState("");
  const [email, setEmail] = useState("");
  const [occu, setOccu] = useState("");
  const [DriLicense, setDriLicense] = useState("");
  const [DLClass, setDLClass] = useState("");
  const [DLIssue, setDLIssue] = useState("");
  const [DLExpireDate, setDLExpireDate] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleDriverSignup = async (e) => {
    e.preventDefault();
    setError(null);
  
    const formatDateToMMDDYYYY = (dateStr) => {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      return `${month}/${day}/${year}`;
    };
  
    const formattedDLIssue = formatDateToMMDDYYYY(DLIssue);
    const formattedDLExpireDate = formatDateToMMDDYYYY(DLExpireDate);

    // Create FormData for submission
    const submissionData = new FormData();
    submissionData.append("name", name);
    submissionData.append("age", age);
    submissionData.append("gender", gender);
    submissionData.append("birthday", birthday);
    submissionData.append("address", address);
    submissionData.append("conNum", conNum);
    submissionData.append("email", email);
    submissionData.append("occu", occu);
    submissionData.append("DriLicense", DriLicense);
    submissionData.append("DLClass", DLClass);
    submissionData.append("DLIssue", formattedDLIssue);
    submissionData.append("DLExpireDate", formattedDLExpireDate); 
    submissionData.append("password", password);
  
    // Append images
    if (front) submissionData.append("front", front);
    if (back) submissionData.append("back", back);
    if (profilePic) submissionData.append("profilePic", profilePic); // New profile pic
  
    if (password !== confirmPassword) {
      setError("*Passwords do not match.*");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3001/signup", submissionData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.status === 201) {
        const userId = response.data._id; // Get the ID from the response
        console.log("User ID:", userId);
  
        // Generate QR code data
        const qrData = JSON.stringify({ id: userId, license: DriLicense });
        setQrCodeData(qrData);
        setShowModal(true);
  
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting info:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Error submitting info. Please check your input.");
    }
  };
  

  const handleDownloadQRCode = () => {
    const canvas = document.getElementById("qr-code");
    const padding = 20; // padding in pixels
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
    downloadLink.download = "account_qr_code.png";
    downloadLink.click();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/login");
  };


  useEffect(() => {
    if (birthday && DLIssue) {
      const [birthYear, birthMonth, birthDay] = birthday.split("-").map(Number);
      const [issueYear, issueMonth, issueDay] = DLIssue.split("-").map(Number);
  
      // Add 5 years to issue year
      const expireYear = issueYear + 5;
  
      // Create the expiration date manually (no timezone issues)
      let expireDate = new Date(expireYear, birthMonth - 1, birthDay);
  
      // Handle invalid dates (e.g. Feb 30 will become March 2, fix back to last Feb day)
      if (expireDate.getMonth() !== birthMonth - 1) {
        expireDate = new Date(expireYear, birthMonth, 0); // last day of birth month
      }
  
      // Format to YYYY-MM-DD manually
      const formattedExpireDate = `${expireDate.getFullYear()}-${String(expireDate.getMonth() + 1).padStart(2, "0")}-${String(expireDate.getDate()).padStart(2, "0")}`;
  
      setDLExpireDate(formattedExpireDate);
    }
  }, [birthday, DLIssue]);
  

  return (
    <div className="login-container"> 
      <div className="signup-form">
        <div className="back-buttonof">
          <Link to="/login" className="back-linkof">
            <FontAwesomeIcon icon={faArrowLeft} className="back-iconof" /> Back
          </Link>
        </div>
        <div className="logosign">
          <Link to="/login" className="hidden-link">
            <img src="/iciT.png" alt="City Logo" className="logo-img" />
          </Link>
          <h3 className="text">ILIGAN CITATION TICKET ONLINE</h3>
        </div>
        
        <form onSubmit={handleDriverSignup}>
          <div className="form-columns">
            <div className="form-column">
              <h1>Driver Signup</h1>
              <p>Fill in the details to create your account.</p>
              <h4>Personal Information</h4>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Full Name"
                  className="input-fieldsign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-row"> 
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Enter Age"
                    className="input-fieldsign"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    className="input-fieldsign"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="input-fieldsign"
                    required
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter Address"
                  className="input-fieldsign"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Enter Contact Number"
                  className="input-fieldsign"
                  required
                  value={conNum}
                  onChange={(e) => setConNum(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email Address"
                  className="input-fieldsign"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  placeholder="Enter Occupation"
                  className="input-fieldsign"
                  value={occu}
                  onChange={(e) => setOccu(e.target.value)}
                  required
                />
              </div>
            </div>
    
            <div className="form-column">
              <h4>License Information</h4>
              <div className="form-group">
                <label>Driver's License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  placeholder="Enter License Number"
                  className="input-fieldsign"
                  value={DriLicense}
                  onChange={(e) => setDriLicense(e.target.value)}
                  required
                />
              </div>
              <div className="form-row"> 
                <div className="form-group">
                  <label>License Classification</label>
                  <input
                    type="text"
                    name="licenseClassification"
                    placeholder="Enter License Classification (e.g. SP, NPDL, PDL)"
                    className="input-fieldsign"
                    value={DLClass}
                    onChange={(e) => setDLClass(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Issue</label>
                  <input
                    type="date"
                    name="dateOfIssue"
                    placeholder="Enter Date of Issue"
                    className="input-fieldsign"
                    value={DLIssue}
                    onChange={(e) => setDLIssue(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    name="expirationDate"
                    placeholder="Enter Expiration Date"
                    className="input-fieldsign"
                    value={DLExpireDate}
                    onChange={(e) => setDLExpireDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Upload Driver's License Front</label>
                <input 
                  type="file" 
                  className="input-fieldsign" 
                  name="front"  
                  onChange={(e) => handleFileChange(e, setFront)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Upload Driver's License Back</label>
                <input 
                  type="file" 
                  className="input-fieldsign" 
                  name="back"  
                  onChange={(e) => handleFileChange(e, setBack)}
                  required 
                />
              </div>
              <div className="form-group">
              <label>Profile Picture:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files[0])}
              />
              </div>
              <h4>Password</h4>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  className="input-fieldsign"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="input-fieldsign"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
    
              <button className="btn1 btn-primary" type="submit">
                <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: "10px" }} />
                Create Account
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Modal for QR Code */}
      {showModal && (
        <div className="modalsign">
          <div className="modal-contentsign">
            <h2>Account QR Code</h2>
            <p>Scan this QR code to view your account details.</p>
            <div className="qr-code-wrapper">
              {qrCodeData && (
                <QRCodeCanvas id="qr-code" value={qrCodeData} size={200} />
              )}
            </div>
            <div className="modal-actionssign">
              <button onClick={handleDownloadQRCode}>Download</button>
              <button onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
