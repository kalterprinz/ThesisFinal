import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faEnvelope, faKey, faUserPlus, faBackspace } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const LoginPage = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      console.log("Payload:", { email, password });
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });

      console.log("Response Data:", response.data);
      const { token, driverId } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("driverId", driverId);

      navigate("/");
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };
//kirk selwyn miguel fuentevilla ycong
//normailah macala
//cate melody dalis
  const handleRegister = () => {
    navigate("/Signup");
  };

  return (
    <div className="login-container">
      
      <div className="illustration">
        <img src="/car4.gif" alt="illustration" className="illustration-image" />
      </div>
      
      <div className="login-form">
        <div className="logo5">
           <Link to="/" className="loginback">
              <FontAwesomeIcon icon={faBackspace} style={{ marginLeft: "5px" }} /> Back 
          </Link>
          <div className="logo">
            <Link to="/adoff" className="hidden-link">
              <img src="/iciT.png" alt="City Logo" className="logo-img" />
            </Link>
            <h3 className="text">ILIGAN CITATION TICKET ONLINE</h3>
          </div>
          
        </div>
        <h1 className="welcome">Welcome Back!</h1>
        <p className="welcomep">
          To keep connected with us please login with your personal information
          by email address and password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-container">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon1" />
              <input
                type="email"
                placeholder="Enter Email Address"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-container">
              <FontAwesomeIcon icon={faKey} className="input-icon1" />
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-options">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            {/* <a href="#forgot">Forgot Password?</a> */}
          </div>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faArrowRightFromBracket} style={{ marginLeft: "10px" }} /> Login Now
          </button>
          <button className="btn btn-secondary" onClick={handleRegister} type="button">
            <FontAwesomeIcon icon={faUserPlus} style={{ marginLeft: "10px" }} /> Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
