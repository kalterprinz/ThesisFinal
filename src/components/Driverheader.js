import React from "react";
import "./all2.css";
import { useNavigate } from "react-router-dom"; 
import iciT from './iciT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faRectangleList } from '@fortawesome/free-solid-svg-icons';
import { faCircleUser } from "@fortawesome/free-solid-svg-icons/faCircleUser";
import { faGamepad } from "@fortawesome/free-solid-svg-icons/faGamepad";

const DHeader = () => {
  const navigate = useNavigate();  // Initialize useNavigate
  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis
  // Function to handle button click
  const handleProfileClick = () => {
    navigate("/DriverProfile");  // Navigate to the profile page
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("driverId");
    navigate("/login");  // Redirect to login page after logout
  };
  return (
  <header className="header1">
    <div className="logoheader">
      <img src={iciT} alt="Logo" />
    </div>
    <h4 className="title">ILIGAN CITATION TICKET ONLINE</h4>
    <nav className="nav">
      <a href="/">Home<FontAwesomeIcon icon={faHouse} style={{marginLeft:"5"}}  /></a>
      <a href="DriverDashboard">Records<FontAwesomeIcon icon={faRectangleList} style={{marginLeft:"5"}} /></a>
      <a href="Game">Game <FontAwesomeIcon icon={faGamepad} style={{marginLeft:"5"}}  /></a>
      <button className="navDriver" onClick={handleProfileClick}>
      Profile  <FontAwesomeIcon icon={faCircleUser} size="xl" />
      </button> |
      <button className="logoutBtn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  </header>
  );
};

export default DHeader;
