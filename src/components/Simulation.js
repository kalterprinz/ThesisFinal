import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation to access URL params
import "./Game.css";
import Driverheader from "./Driverheader";
import iciT from './iciT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faCircleInfo, faGamepad, faHouse,faCircleUser } from "@fortawesome/free-solid-svg-icons";

const Simulation = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tid = queryParams.get("data-tid");
  const [loading, setLoading] = useState(true);

  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis
  
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000); // Adjust the time as needed (3000ms = 3 seconds)
  }, []);
  return (
    <div>
      {/* Header */}
      <header className={localStorage.getItem("driverId") ? "headerdriver" : "headerlan"}>
                <div className={localStorage.getItem("driverId") ? "logoheader" : "logoheader1"}>
                    <img src={iciT} alt="Logo" />
                </div>
                <h4 className="titlel1">ILIGAN CITATION TICKET ONLINE</h4>
                <nav className={localStorage.getItem("driverId") ? "nav" : "navlan"}>
                    {localStorage.getItem("driverId") ? (
                    <>
                    <div class="buton">
                        <a href="/">Home<FontAwesomeIcon icon={faHouse} style={{ marginLeft: "5px" }} /></a>
                        <a href="/Game">Game <FontAwesomeIcon icon={faGamepad} style={{ marginLeft: "5px" }} /></a>
                        <a href="/DriverDashboard">Profile<FontAwesomeIcon icon={faCircleUser} style={{ marginLeft: "5px" }} /></a>
                        |
                        <button className="logoutBtn" onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("driverId");
                        window.location.reload();
                        }}>
                        Logout
                        </button>
                    </div>
                    </>
                    ) : (
                    <>
                        <button ><a href="/" style={{ marginRight:"15px", color:"#05223e", fontWeight:"bold"}}>Home<FontAwesomeIcon icon={faHouse} style={{marginLeft:"5", color:"#05223e"}}/></a></button>
                        <button > <a href="/Game" style={{ marginRight:"15px", color:"#05223e", fontWeight:"bold"}}>Game <FontAwesomeIcon icon={faGamepad} style={{marginLeft:"5", color:"#05223e"}}  /></a></button>
                        <a href="/login" className="login-button">Login</a>
                    </>
                    )}
                </nav>
                </header>
      <div className="elearning-container5">
        <div className="page-header">
          <h1>Simulation</h1>
          <p>Start your Simulation here! Choose which Simulation you want to play.</p>
        </div>
        <div className="game-container">
          {tid === "1099" && (
            <>
              <h2 className="gametitle">Distracted Driving Simulation</h2>
              <div className="material-card1">
              <iframe
                  src="https://www.onlinegames.io/games/2022/unity/highway-traffic/index.html"
                  width="100%" 
                  height="600px" 
                  style={{ border: 'none', margin: '0 auto' }}
                  title="Highway Traffic Game"
                ></iframe>
              </div>
            </>
          )}
          {tid === "1100" && (
            <>
              <h2 className="gametitle">Drinking and Driving Simulation</h2>
              <div className="material-card1">
              <iframe
                src="https://www.onlinegames.io/games/2021/unity/dockyard-tank-parking/index.html"
                width="100%" 
                height="600px" 
                style={{ border: 'none', margin: '0 auto' }}
                title="Dockyard Tank Parking"
              ></iframe>
              </div>
            </>
          )}
          {tid === "1101" && (
            <>
              <h2 className="gametitle">Road Signs Simulation</h2>
              <div className="material-card1">
                <iframe 
                  src="https://www.jopi.com/embed.php?game=extreme-car-parking" 
                  width="100%" 
                  height="600px" 
                  style={{ border: 'none', margin: '0 auto' }}
                  title="Extreme Car Parking"
                  ></iframe>

              </div>
            </>
          )}
          {tid === "1104" && (
            <>
              <h2 className="gametitle">Cross Road Exit</h2>
              <div className="material-card1">
                <iframe 
                  src="https://www.jopi.com/embed.php?game=cross-road-exit"
                  width="100%" 
                  height="600px" 
                  style={{ border: 'none', margin: '0 auto' }}
                  title="Cross Road Exit"
                  ></iframe>

              </div>
            </>
          )}
           {tid === "1105" && (
            <>
              <h2 className="gametitle">Traffic Go</h2>
              <div className="material-card1">
                <iframe 
                  src="https://www.jopi.com/embed.php?game=traffic-go" 
                  width="100%" 
                  height="600px" 
                  style={{ border: 'none', margin: '0 auto' }}
                  title="Traffic Go"
                  ></iframe>

              </div>
            </>
          )}
          
          {!tid && <p>Please select a Simulation from the e-learning materials page.</p>}
        </div>
      </div>
    </div>
  );
};

export default Simulation;
