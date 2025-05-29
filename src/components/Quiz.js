import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation to access URL params
import "./Game.css";
import Driverheader from "./Driverheader";
import iciT from './iciT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faCircleInfo, faGamepad, faHouse,faCircleUser } from "@fortawesome/free-solid-svg-icons";

const Quiz = () => {
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
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://driving-tests.org/embed/test.js#v=1";
    script.async = true;
    script.id = "dto-jssdk";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <div>
      {/* Header */}
      {loading ? (
        <div class="loading-container">
          <div class="carAnimation">
            <div class="road"></div>
            <div class="car">
              <div class="colour"></div>
              <div class="windows"></div>
              <div class="leftWheel">
                <div class="wheel"></div>
              </div>
              <div class="rightWheel">
                <div class="wheel"></div>
              </div>
            </div>
            <div class="clouds"></div>
          </div>
        </div>
      ) : (
          <>
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
          <h1>Quiz</h1>
          <p>Start your quiz here! Choose which quiz you want to take.</p>
        </div>
        <div className="game-container">
          {tid === "1096" && (
            <>
              <h2 className="gametitle">Distracted Driving Quiz</h2>
              <div className="material-card1">
                <div
                  className="dto-test"
                  data-tid="1096"
                  data-limit="20"
                  data-width="100%"
                  data-bcolor="#cfcfcf"
                  style={{ margin: "0 auto" }}
                ></div>
              </div>
            </>
          )}
          {tid === "1097" && (
            <>
              <h2 className="gametitle">Drinking and Driving Quiz</h2>
              <div className="material-card1">
                <div
                  className="dto-test"
                  data-tid="1097"
                  data-limit="20"
                  data-width="100%"
                  data-bcolor="#cfcfcf"
                  style={{ margin: "0 auto" }}
                ></div>
              </div>
            </>
          )}
          {tid === "1098" && (
            <>
              <h2 className="gametitle">Road Signs Quiz</h2>
              <div className="material-card1">
                <div
                  className="dto-test"
                  data-tid="1098"
                  data-limit="20"
                  data-width="100%"
                  data-bcolor="#cfcfcf"
                  style={{ margin: "0 auto" }}
                ></div>
              </div>
            </>
          )}
          {tid === "1102" && (
            <>
               <h2 className="gametitle">Match the Memory - Road Trip Game</h2>
              <div className="material-cardsimu1">
                <iframe 
                  src="https://matchthememory.com/Roatrip"
                  width="100%" 
                  height="600px" 
                  style={{ border: 'none', margin: '0 auto' }}
                  title="Match the Memory - Road Trip Game"
                  ></iframe>

              </div>
            </>
          )}
          {tid === "1103" && (
            <>
               <h2 className="gametitle">Traffic Sign Quiz</h2>
              <div className="material-card1">
              <iframe name="proprofs" id="proprofs"
              width="100%" 
              height="600px" 
              style={{ border: 'none', margin: '0 auto' }}
              title="Traffic Sign Quiz"
              src="https://www.proprofs.com/quiz-school/story.php?title=calgary_2&ew=430'">

              </iframe>
              </div>
            </>
          )}
          {tid === "1106" && (
            <>
               <h2 className="gametitle">Car Logos Quiz</h2>
              <div className="material-card1">
              <iframe name="proprofs" id="proprofs"
                width="100%" 
                height="600px" 
                style={{ border: 'none', margin: '0 auto' }}
                title="Car Logos Quiz"
                src="https://www.jopi.com/embed.php?game=car-logos-quiz">

              </iframe>
              </div>
            </>
          )}
          {tid === "1107" && (
            <>
               <h2 className="gametitle">Do I Have Road Rage?</h2>
              <div className="material-card1">
              <iframe name="proprofs" id="proprofs"
                width="100%" 
                height="600px" 
                style={{ border: 'none', margin: '0 auto' }}
                title="Do I Have Road Rage?"
                src="https://www.proprofs.com/quiz-school/story.php?title=do-i-have-road-rage&ew=430">

              </iframe>
              </div>
            </>
          )}
          {tid === "1108" && (
            <>
               <h2 className="gametitle">Rules Of The Road</h2>
              <div className="material-card1">
              <iframe name="proprofs" id="proprofs"
                width="100%" 
                height="600px" 
                style={{ border: 'none', margin: '0 auto' }}
                title="Rules Of The Road"
                src="https://www.proprofs.com/quiz-school/story.php?title=nzu0mduzpycy&ew=430">

              </iframe>
              </div>
            </>
          )}
           {tid === "1109" && (
            <>
               <h2 className="gametitle">Road Safety</h2>
              <div className="material-card1">
              <iframe name="proprofs" id="proprofs"
                width="100%" 
                height="600px" 
                style={{ border: 'none', margin: '0 auto' }}
                title="Road Safety"
                src="https://www.proprofs.com/quiz-school/story.php?title=road-safety-quiz-2016-mumbai-zone_2rh&ew=430">

              </iframe>
              </div>
            </>
          )}
          {tid === "1110" && (
            <>
               <h2 className="gametitle">Road Safety</h2>
              <div className="material-card1">
              <iframe name="proprofs" id="proprofs"
                width="100%" 
                height="600px" 
                style={{ border: 'none', margin: '0 auto' }}
                title="Road Safety"
                src="https://www.proprofs.com/quiz-school/story.php?title=_97026&ew=430">

              </iframe>
              </div>
            </>
          )}
          {!tid && <p>Please select a quiz from the e-learning materials page.</p>}
        </div>

      </div>
      </>
      )}
   </div>
  );
};

export default Quiz;
