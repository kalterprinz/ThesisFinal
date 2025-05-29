import React, {useState} from "react";
import { Link, useNavigate} from "react-router-dom";
import "./login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie } from "@fortawesome/free-solid-svg-icons/faUserTie";
import { faArrowRightFromBracket, faBriefcase, faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import axios from "axios";

const LoginPage2 = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      console.log("Payload:", { email, password });
      const response = await axios.post("http://localhost:3001/login2", {
        email,
        password,
      });

      console.log("Response Data:", response.data);
      const { token, driverId, name, role } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("driverId", driverId);

      if (!role) {
        console.error("Role is missing from response data!");
        setError("Unable to determine role. Please contact support.");
        return;
      }

      // Debugging role before navigation
      console.log("User Role:", role);

      // Navigate based on role
      switch (role) {
        case "Officer":
          navigate("/OfficerDashboard");
          break;
        case "Treasurer":
          navigate("/");
          break;
        case "Admin":
          navigate("/AdminDashboard");
          break;
        default:
          setError("Invalid role. Please contact support.");
      }

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
   return (
    <div className="login-container">
      <div className="illustration">
        <img
          src="/cardash4.gif"
          alt="illustration"
          className="illustration-image"
        />
      </div>
      <div className="login-form2">
        <div className="logo1">
          <Link to="/login" className="hidden-link">  
            <img src="/iciT.png" alt="City Logo" className="logo-img" /> 
          </Link>
            <h3 className="text2">ILIGAN CITATION TICKET ONLINE</h3>
        </div>
        <h1 className="welcome">Welcome Back!</h1>
        <p className="text5">
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
          {/*<div className="role-buttons">
          <button
            type="button"
            className={`role-btn admin-btn ${selectedRole === "Admin" ? "selected" : ""}`}
            onClick={() => setSelectedRole("Admin")}
          >
            <FontAwesomeIcon icon={faBriefcase} style={{marginRight:"10"}}  />Admin
          </button>
          <button
            type="button"
            className={`role-btn officer-btn ${selectedRole === "Officer" ? "selected" : ""}`}
            onClick={() => setSelectedRole("Officer")}
          >
           <FontAwesomeIcon icon={faUserTie} style={{marginRight:"10"}}  /> Officer
          </button>
        </div>*/}
          <div className="form-options2">
            <label>
              <input type="checkbox" />
              Remember Me
            </label>
            {/* <a href="#forgot">Forgot Password?</a> */}
          </div>
           <button className="btn btn-primary"><FontAwesomeIcon icon={faArrowRightFromBracket} style={{marginLeft:"10"}}  /> Login Now</button>
        </form>
      </div>
    </div>
  );
}


export default LoginPage2;
