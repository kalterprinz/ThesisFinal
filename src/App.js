 import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/LoginPage'; 
import Login2 from './components/LoginPage2'; 
import LandingPage from './components/LandingPage'; 
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminMap from './components/AdminMap';
import Map from './components/map';
import Matrix from './components/matrix';
import Game from './components/Game';
import Quiz from './components/Quiz';
import Simulation from './components/Simulation';
import Signup from './components/Signup';
import DriverRecords from './components/DriverRecords';
import RecordTable from './components/recordTable';
import PaidTickets from './components/PaidTickets';
import Impound from './components/Impound';
import Clearance from './components/Clearance';
import ViewMore from "./components/ViewMore";  
import OfficerRecords from "./components/officerTable"
import OfficerMap from "./components/OfficerMap"
import Scan from "./components/QrCodeScanner"
import OfficerDashboard from './components/OfficerDashboard';
import ViolationRecords from './components/OfViolationRecords';
import TreasurerDashboard from './components/TreasurerDashboard';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
            {/* Driver Pages */}
            <Route path="/" element={<LandingPage />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/DriverDashboard" element={<DriverDashboard />} />
            <Route path="/DriverRecords" element={<DriverRecords />} />
            <Route path="/Game" element={<Game />} />
            <Route path="/Quiz" element={<Quiz />} />
            <Route path="/Simulation" element={<Simulation />} />
            <Route path="/Signup" element={<Signup />} />


            {/* Officer Pages */}
            <Route path="/OfficerDashboard" element={<OfficerDashboard />} />
            <Route path="/QrCodeScanner" element={<Scan />} />
            <Route path="/OfViolationRecords" element={<ViolationRecords />} />
            <Route path="/OfficerMap" element={<OfficerMap />} />

            {/* Admin Pages */}
            <Route path="/adoff" element={<Login2 />} />
            <Route path="/matrix" element={<Matrix />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/RecordTable" element={<RecordTable />} />
            <Route path="/PaidTickets" element={<PaidTickets />} />
            <Route path="/Impound" element={<Impound />} />
            <Route path="/Clearance" element={<Clearance />} />
            <Route path="/AdminMap" element={<AdminMap />} />
            <Route path="/viewmore" element={<ViewMore />} /> 
            <Route path="/officerTable" element={<OfficerRecords />} />  
            
            {/* City Treasurer Pages */}
            <Route path="/TreasurerDashboard" element={<TreasurerDashboard />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

//kirk selwyn miguel fuentevilla ycong
//normailah macala
//cate melody dalis