import React from "react";
import iciT from './iciT.png';
import "./all2.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import { faRectangleList } from "@fortawesome/free-solid-svg-icons/faRectangleList";

const Header = () => {
  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis
  return (
  <header className="header1">
    <div className="logoheader">
      <img src={iciT} alt="Logo" />
    </div>
    <h4 className="title">ILIGAN CITATION TICKET ONLINE</h4>
    <nav className="nav">
      <a href="AdminDashboard">Dashboard<FontAwesomeIcon icon={faHouse} style={{marginLeft:"10"}}  /></a>
      <a href="RecordTable">Records<FontAwesomeIcon icon={faRectangleList} style={{marginLeft:"10"}}  /></a>
      <a href="map">Map <FontAwesomeIcon icon={faLocationDot} style={{marginLeft:"10"}} /></a>
      <a href="about">About <FontAwesomeIcon icon={faCircleInfo} style={{marginLeft:"10"}}  /></a>
    </nav>
  </header>
  );
};

export default Header;
