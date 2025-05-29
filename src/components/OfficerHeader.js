import React from "react";
import { useNavigate } from "react-router-dom"; 
import iciT from './iciT.png';
import "./all2.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from "@fortawesome/free-solid-svg-icons/faCircleUser";

const OfficerHeader = ({ isSidebarOpen }) => {
  const navigate = useNavigate();  // Initialize useNavigate

  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("driverId");
    navigate("/login");  // Redirect to login page after logout
  };
  return (
    <header className={`headerG ${isSidebarOpen ? 'header-shift' : 'header-normal'}`}>
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
  );
};

export default OfficerHeader;
