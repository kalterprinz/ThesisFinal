import React, { useState, useEffect } from 'react';
import './Calendar.css'; // CSS file for styling
import axios from "axios";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [dueDates, setDueDates] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Retrieve driverId from localStorage
        const driverId = localStorage.getItem('driverId');
        if (!driverId) {
          console.error("Driver ID not found in localStorage");
          return;
        }
        //kirk selwyn miguel fuentevilla ycong
        //normailah macala
        //cate melody dalis
        // Fetch driver details to get email
        const driverResponse = await fetch(`http://localhost:3001/getDriver/${driverId}`);
        const driverData = await driverResponse.json();
        const driverEmail = driverData?.email;

        if (!driverEmail) {
          console.error("Driver email not found");
          return;
        }

        // Fetch all records
        const response = await fetch('http://localhost:3001/getRecords');
        const data = await response.json();

        // Filter records matching the driver's email and unpaid status
        const unpaidDueDates = data
          .filter(record => 
            record.fineStatus !== "Paid" && 
            record.dueDate && 
            record.email === driverEmail
          )
          .map(record => ({
            date: new Date(record.dueDate),
            details: {
              ticketNumber: record.ticketNumber,
              violationType: record.violationType,
              placeOfViolation: record.placeOfViolation,
              apprehendingOfficer: record.apprehendingOfficer,
            }
          }));

        setDueDates(unpaidDueDates);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
}, []);



  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const getDayOfWeek = (date) => (date.getDay() + 6) % 7; // Adjust so Monday is the first day

  const handleDayClick = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const matchedRecord = dueDates.find(record => record.date.toDateString() === selectedDate.toDateString());
    
    setSelectedDay(day);
    setTicketDetails(matchedRecord ? matchedRecord.details : null);
    setIsFlipped(true);
  };

  const handleBackClick = () => {
    setIsFlipped(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const renderCalendar = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDay = getDayOfWeek(firstDayOfMonth);
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div className="empty-day" key={`empty-${i}`}></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === currentDay;
      const isDueDate = dueDates.some(record => 
        record.date.toDateString() === new Date(currentYear, currentMonth, i).toDateString()
      );
      
      days.push(
        <div
          className={`day ${isToday ? 'today' : ''} ${isDueDate ? 'due-date' : ''}`}
          key={i}
          onClick={() => handleDayClick(i)}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="containerCC">
      <div className={`calendar ${isFlipped ? 'flip' : ''}`}>
        {/* Front View */}
        <div className="front">
          <div className="current-date">
            <button className="months" onClick={handlePrevMonth}>Prev</button>
            <h1>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h1>
            <button className="months" onClick={handleNextMonth}>Next</button>
          </div>
          <div className="week-labels">
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
            <div>SUN</div>
          </div>
          <div className="days">{renderCalendar()}</div>
        </div>

        {/* Back View */}
        <div className="back">
          <div className="info1">
            <h1>Day Info</h1>
            {selectedDay ? (
              <>
                <p className="infop">{`${monthNames[currentDate.getMonth()]} ${selectedDay}, ${currentDate.getFullYear()}`}</p>
                {ticketDetails ? (
                  <>
                    <p>
                    Ticket #: <strong> {ticketDetails.ticketNumber}</strong><br/>
                    Violation: <strong>{ticketDetails.violationType}</strong> <br/>
                    Place of Violation: <strong>{ticketDetails.placeOfViolation}</strong> <br/>
                    Officer: <strong>{ticketDetails.apprehendingOfficer}</strong> 
                    </p>
                  </>
                ) : (
                  <p>No ticket found for this date.</p>
                )}
              </>
            ) : (
              <p>No day selected</p>
            )}
          </div>
          <button className="flipbutton" onClick={handleBackClick}>Back to Calendar</button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;