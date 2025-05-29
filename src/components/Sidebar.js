import React, { useState, useEffect } from "react";
import "./all.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faLocationDot, faBars, faTimes,
  faQrcode, faTicket, faCar,
  faCircleInfo, faRectangleList,
  faRightFromBracket, faCertificate
} from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [adminAgency, setAdminAgency] = useState(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis
  
  useEffect(() => {
    const fetchAdminAgency = async () => {
      const driverId = localStorage.getItem("driverId");
      if (!driverId) return;

      try {
        const res = await axios.get(`http://localhost:3001/getOfficerById/${driverId}`);
        setAdminAgency(res.data.agency);
      } catch (error) {
        console.error("Failed to fetch admin agency:", error);
      }
    };

    fetchAdminAgency();
  }, []);

  const renderClearanceLink = () => {
    if (adminAgency === "ICTPMO") {
      return (
        <a href="Clearance" className="sidebar-link">
          <FontAwesomeIcon icon={faCertificate} className="sidebar-icon" />
          {isOpen && "Clearance"}
        </a>
      );
    }
    return null;
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} style={{ marginTop: "5px" }} />
      </button>

      <nav className="sidebar-nav">
        <a href="AdminDashboard" className="sidebar-link">
          <FontAwesomeIcon icon={faHouse} className="sidebar-icon" />
          {isOpen && "Dashboard"}
        </a>
        <a href="RecordTable" className="sidebar-link">
          <FontAwesomeIcon icon={faRectangleList} className="sidebar-icon" />
          {isOpen && "Violation Records"}
        </a>
        <a href="Impound" className="sidebar-link">
          <FontAwesomeIcon icon={faCar} className="sidebar-icon" />
          {isOpen && "Impound Vehicles"}
        </a>
        <a href="PaidTickets" className="sidebar-link">
          <FontAwesomeIcon icon={faTicket} className="sidebar-icon" />
          {isOpen && "Paid Tickets"}
        </a>
        <a href="officerTable" className="sidebar-link">
          <FontAwesomeIcon icon={faRectangleList} className="sidebar-icon" />
          {isOpen && "Officer Records"}
        </a>
        {renderClearanceLink()}
      </nav>
    </div>
  );
};

export default Sidebar;
