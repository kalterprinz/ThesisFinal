

import React, { useState } from "react";

import "./all.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faLocationDot, faBars, faTimes, faClose, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo, faRectangleList, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

//kirk selwyn miguel fuentevilla ycong
//normailah macala
//cate melody dalis

const SidebarOfficer =  ({ isOpen, toggleSidebar }) => {

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Toggle Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isOpen ? faClose : faBars} style={{marginTop:"5px"}}  />
      </button>

      {isOpen ? (
        // Navigation Links
        <nav className="sidebar-nav">
          <a href="OfficerDashboard" className="sidebar-link">
            <FontAwesomeIcon icon={faHouse} className="sidebar-icon" />
            Dashboard
          </a>
          <a href="OfViolationRecords" className="sidebar-link">
            <FontAwesomeIcon icon={faRectangleList} className="sidebar-icon" />
            Violation Records
          </a>
          <a href="OfficerMap" className="sidebar-link">
            <FontAwesomeIcon icon={faLocationDot} className="sidebar-icon" />
            Map
          </a>
          <a href="QrCodeScanner" className="sidebar-link">
            <FontAwesomeIcon icon={faQrcode} className="sidebar-icon" />
            Scan
          </a><br/><br/>
          {/* <a href="login" className="sidebar-link">
            <FontAwesomeIcon icon={faRightFromBracket} className="sidebar-icon" />
            Logout
          </a> */}
        </nav>
      ) : (
        // Navigation Icons
        <nav className="sidebar-nav">
          <a href="OfficerDashboard" className="sidebar-link">
            <FontAwesomeIcon icon={faHouse} className="sidebar-icon" />
          </a>
          <a href="OfViolationRecords" className="sidebar-link">
            <FontAwesomeIcon icon={faRectangleList} className="sidebar-icon" />
          </a>
          <a href="OfficerMap" className="sidebar-link">
            <FontAwesomeIcon icon={faLocationDot} className="sidebar-icon" />
          </a>
          <a href="QrCodeScanner" className="sidebar-link">
            <FontAwesomeIcon icon={faQrcode} className="sidebar-icon" />
          </a><br/><br/>
          {/* <a href="login" className="sidebar-link">
            <FontAwesomeIcon icon={faRightFromBracket} className="sidebar-icon" />
          </a> */}
        </nav>
      )}
    </div>
  );
};

export default SidebarOfficer;
