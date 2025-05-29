import React, { useState, useEffect } from "react";
import "./timelip.css";

const TopSection = ({ formattedDate }) => {
  const [time, setTime] = useState({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: new Date().getSeconds(),
  });

  const [flipping, setFlipping] = useState(false); // Track if we are flipping the digit

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setFlipping(true); // Trigger flip
      setTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (num) => (num < 10 ? `0${num}` : num);

  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis
  
  return (
    <div className="flip-clock-container">
    <div className="date-time-display">
      <div className="weekday-display">
        {new Date().toLocaleDateString("en-US", { weekday: "long" })}
      </div>
      <h5 className="formatted-date">{formattedDate}</h5>
    </div>
  
    <div className="flip-clock">
      <div className="flip-digit">
        <span className={`front ${flipping ? "flipping" : ""}`}>
          {formatTime(time.hours)}
        </span>
        <span className={`back ${flipping ? "flipping" : ""}`}>
          {formatTime(time.hours)}
        </span>
      </div>
      :
      <div className="flip-digit">
        <span className={`front ${flipping ? "flipping" : ""}`}>
          {formatTime(time.minutes)}
        </span>
        <span className={`back ${flipping ? "flipping" : ""}`}>
          {formatTime(time.minutes)}
        </span>
      </div>
      :
      <div className="flip-digit">
        <span className={`front ${flipping ? "flipping" : ""}`}>
          {formatTime(time.seconds)}
        </span>
        <span className={`back ${flipping ? "flipping" : ""}`}>
          {formatTime(time.seconds)}
        </span>
      </div>
    </div>
  </div>
  
  );
};

export default TopSection;
