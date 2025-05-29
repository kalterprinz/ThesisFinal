import React, { useState, useEffect } from "react";
import "./Game.css";
import { useNavigate } from "react-router-dom"; 
import iciT from './iciT.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DOMPurify from "dompurify";
import { faBookOpen, faCircleInfo, faGamepad, faHouse,faCircleUser } from "@fortawesome/free-solid-svg-icons";

const Game = () => {
const navigate = useNavigate();  // Initialize useNavigate

//kirk selwyn miguel fuentevilla ycong
//normailah macala
//cate melody dalis

// useEffect(() => {
//     const checkAuthentication = async () => {
//       const driverId = localStorage.getItem('driverId');

//       if (driverId) {
//         // Check if driverId exists in the drivers' database
//         const driverResponse = await fetch(`http://localhost:3001/getDriverById2/${driverId}`);
//         if (driverResponse.ok) {
//             console.log(`Driver found with id ${driverId}.`);
          
//           return;
//         }

//         // If not found in drivers, check in officers' database
//         const officerResponse = await fetch(`http://localhost:3001/getOfficerById/${driverId}`);
//         if (officerResponse.ok) {
//           const officerData = await officerResponse.json();
//           // Navigate based on officer's role
//           if (officerData.role === 'Admin') {
//             console.log(`Admin found with id ${driverId}.`);
//             navigate('/adminDashboard');
//           } else if (officerData.role === 'Officer') {
//             console.log(`Officer found with id ${driverId}.`);
//             navigate('/officerDashboard');
//           } else if (officerData.role === 'Treasurer') {
//             console.log(`Treasurer found with id ${driverId}.`);
//             navigate('/treasurerdashboard');
//           } else {
//             // Role not recognized; remove driverId and navigate to home
//             localStorage.removeItem('driverId');
//             navigate('/');
//           }
//           return;
//         }
//       }

//       // If driverId is not found in either database
//       localStorage.removeItem('driverId');
//       navigate('/');
//     };

//     checkAuthentication();
//   }, [navigate]);

//   // Function to handle button click
//   const handleProfileClick = () => {
//     navigate("/DriverDashboard");  // Navigate to the profile page
//   };
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("driverId");
//     navigate("/login");  // Redirect to login page after logout
//   };


// Simulating a delay for loading
useEffect(() => {
  setTimeout(() => {
    setLoading(false);
  }, 3000); // Adjust the time as needed (3000ms = 3 seconds)
}, []);
const [loggedIn, setLoggedIn] = useState(false);
const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGameCategory, setSelectedGameCategory] = useState("All");

  const categories = ["All", "Traffic Rules", "Driving Tips", "Road Signs", "Licensing", "Vehicle Registration"];
  const materials = [
    {
      id: 1,
      category: "Road Signs",
      title: "64 Important ROAD SIGNS ",
      description: "Road signs are an essential part of driving and play a vital role in ensuring the safety of drivers, passengers, and pedestrians. There are numerous road signs that drivers need to be aware of to stay safe on the road.",
      video: "https://www.youtube.com/embed/gPrM9tc-3Lw?si=4wMDE9ij-9ZAOYkZ", 
    },
    {
      id: 2,
      category: "Road Signs",
      title: "How to understand traffic signs? What are the important road signs?",
      description: "Learn your traffic signs and their meanings, it is important to road safety.",
      video: "https://www.youtube.com/embed/KxrfkcDAgsY?si=CiniZlGDRbakfZHi",
    },
    {
      id: 3,
      category: "Road Signs",
      title: "ROAD SIGNS and MEANINGS",
      description: "Most Common Road Signs and Meanings in the Philippines",
      video: "https://www.youtube.com/embed/pW6ywgfNRXc?si=IybVjIsaNXY1mKsQ", 
    },
    {
      id: 4,
      category: "Road Signs",
      title: "40 Key Traffic Signs to Help You Crush Your Driving Test! ",
      description: "This video is your ultimate guide to 40 key traffic signs and road signs for the driving test!",
      video: "https://www.youtube.com/embed/r7ca2zsyJwA?si=cx3JcUebu9_JGQhk", 
    },
    {
      id: 5,
      category: "Traffic Rules",
      title: "Rules on Turning, Overtaking, and Right of Way ",
      description: "Turning and overtaking carefully will save us from all kinds of road crashes and incidents. There are pedestrians, and there are other drivers. Turning and overtaking the right way will help other road users anticipate our next move.",
      video: "https://www.youtube.com/embed/GVmtu7niGUY?si=DXjLtgl3JJfZ3ioi", 
    },
    {
      id: 6,
      category: "Traffic Rules",
      title: "Traffic Signs, Rules and Regulations",
      description: "Learn your traffic signs, rules, and regulations.",
      video: "https://www.youtube.com/embed/V8aHCYzWWD4?si=7OYaPtwvmYICJxsU",
    },
    {
      id: 7,
      category: "Traffic Rules",
      title: "Right of way rules on Intersection",
      description: "Right of way rules on Intersection",
      video: "https://www.youtube.com/embed/YIz1bkeibuM?si=1eDS8iZb_6kYpRko", 
    },
    {
      id: 8,
      category: "Driving Tips",
      title: "10 Tips For New Drivers",
      description: "Here's a video with some cool driving tips for new and not so new drivers, and some of the most frequently asked questions during driving lessons.",
      video: "https://www.youtube.com/embed/7ClH977D0Yg?si=jCGEYmVvq_mvTXB9", 
    },
    {
      id: 9,
      category: "Licensing",
      title: "How to get a driver's license in the Philippines? TIPS AND PROCESS!",
      description: "Here's how to to process your driver's license at LTO.",
      video: "https://www.youtube.com/embed/LoDARzAz_58?si=OXPEMUKEyVBo-1ZF", 
    },
    {
      id: 10,
      category: "Vehicle Registration",
      title: "How to RENEW you Car Registration",
      description: "Simple steps to ensure a smooth renewal process for your vehicle.",
      video: "https://www.youtube.com/embed/7cYaF55P7JA?si=-d8ucjnvecgvbzuZ", 
    },
    {
      id: 11,
      category: "Driving Tips",
      title: "How to Use Driving Hand Signals",
      description: "All drivers must know and understand the hand signals that are used to communicate different actions like changing lanes or stopping. ",
      video: "https://www.youtube.com/embed/0vCaFpJcvdk?si=Rx_KqACMJ6hEsKmZ", 
    },
    {
      id: 12,
      category: "Road Signs",
      title: "Learn Traffic Signs and Their Meanings",
      description: "Drive along with a driving instructor and learn the meaning of traffic signs and how to read them.",
      video: "https://www.youtube.com/embed/G3_1Yh0Lb_E?si=sCxvEcPGbBhPEa3p", 
    },
  ];
  const textMaterials = [
    {
      id: 1,
      category: "Licensing",
      title: "Licensing Overview",
      description: "Brief overview of driver’s license type.",
      details: `
        <h3>STUDENT-DRIVER’S PERMIT (SP)</h3>
        <p>An authority granted by the LTO to a person who desires to learn to operate a motor vehicle. The student-driver must be accompanied by a duly licensed driver, acting as driving instructor, possessing the appropriate license code/s for the desired type of motor vehicle.</p>
        
        <h4>VALIDITY OF STUDENT-DRIVER’S PERMIT (SP)</h4>
        <ul>
          <li>The SP is valid for one (1) year from the date of its issuance. After one (1) year, it cannot be used for purposes of the practical driving course. However, it can be used to apply for NPDL if the practical driving course has been completed within the one (1) year validity period.</li>
          <li>After two (2) years from the date of issuance of SP, the holder is required to acquire a new SP bearing the same SP number and undergo the required apprenticeship period reckoned from the date of issuance of the new SP. All records of training courses are retained.</li>
          <li>SP may be renewed on or before the expiry date if the holder is not ready to apply for DL. Except for settlement of penalties due to traffic violations, only the basic fee is to be collected for the renewal of SP after the expiry date.</li>
        </ul>
        
        <h3>CONDUCTOR'S LICENSE (CL)</h3>
        <p>An authority granted by the LTO to a qualified person to assist the driver of a public utility vehicle in fare collection and/or ensuring the safety of the passengers and/or cargo while the said vehicle is in operation.</p>
        
        <h4>VALIDITY OF CONDUCTOR’S LICENSE (CL)</h4>
        <ul>
          <li>A new CL is valid for five (5) years reckoned from the date of birth of the licensee, unless sooner revoked or suspended. A holder of CL who has not committed any violation/s during the five (5) year period preceding its expiration is entitled to renewal of such license valid for ten (10) years.</li>
          <li>Renewal of CL after two (2) years from the expiry date shall require the holder to take and pass the written examination and pay the corresponding penalty in addition to the basic fee.</li>
        </ul>
        
        <h3>DRIVER'S LICENSE (DL)</h3>
        <p>An authority in the form prescribed by the LTO granted to a person to operate a motor vehicle that is either nonprofessional or professional driver’s license.</p>
        
        <ul>
          <li><strong>NONPROFESSIONAL DL (NPDL)</strong> – an authority in the form prescribed by the LTO granted to a person to operate a private motor vehicle.</li>
          <li><strong>PROFESSIONAL DL (PDL)</strong> – an authority in the form prescribed by the LTO granted to any driver hired or paid for driving or operating a motor vehicle whether for private use or for hire to the public.</li>
        </ul>
        
        <h3>DRIVER’S LICENSE CODE (DL Code)</h3>
        <p>Refers to the collective code representing the vehicle category/ies that a licensed person is allowed to operate.</p>
    
        <h3>DRIVING ENHANCEMENT PROGRAM (DEP)</h3>
        <p>An updated road safety seminar designed by LTO for DL holders. Drivers are required to attend this seminar prior to renewal of the initial five (5) year license. An intervention program is required for those habitual traffic violators depending on the accumulated demerit points.</p>
    
        <h3>VEHICLE CATEGORY (VC)</h3>
        <p>Refers to motor vehicle category as specified in the Philippine National Standard on Road Vehicles-Classification and Definition.</p>
    
        <h3>RESTRICTION CODE (RC)</h3>
        <p>Refers to previous code representing the vehicle category/ies that a licensed person is allowed to operate.</p>
      `,
    },
    {
      id: 2,
      category: "Licensing",
      title: "Qualifications and Requirements",
      description: "Must bring during applications.",
      details: `
        <h3>Obtaining a Driver's License</h3>
        <p>Obtaining a driver's license involves a structured process managed by the Land Transportation Office (LTO). The process typically begins with acquiring a Student Permit, followed by a Non-Professional or Professional Driver's License, depending on your needs. Below are the qualifications and documentary requirements for each type:</p>
        
        <h4>1. Student Permit</h4>
        <h5>Qualifications:</h5>
        <ul>
          <li>Age: At least 16 years old.</li>
          <li>Physical and Mental Fitness: Must be physically and mentally fit to operate a motor vehicle.</li>
          <li>Literacy: Able to read and write in Filipino or English.</li>
        </ul>
        <h5>Documentary Requirements:</h5>
        <ul>
          <li>Application Form: Duly accomplished Application for Permits and License (APL) Form.</li>
          <li>Proof of Identity: Original and photocopy of any of the following:
            <ul>
              <li>PSA/NSO Birth Certificate</li>
              <li>Philippine Identification Card</li>
              <li>Passport</li>
              <li>Local Civil Registry (for areas without PSA)</li>
              <li>PSA Certificate of Marriage (if applicable)</li>
            </ul>
          </li>
          <li>Medical Certificate: Electronically transmitted medical certificate from an LTO-accredited medical clinic.</li>
          <li>Parental Consent: For applicants below 18 years old, a parent’s consent with a photocopy of any valid government-issued ID of the parent/guardian with photo and signature.</li>
        </ul>
        
        <h4>2. Non-Professional Driver's License</h4>
        <h5>Qualifications:</h5>
        <ul>
          <li>Age: At least 17 years old.</li>
          <li>Physical and Mental Fitness: Must be physically and mentally fit to operate a motor vehicle.</li>
          <li>Literacy: Able to read and write in Filipino or English.</li>
          <li>Student Permit Holding Period: Must have held a valid Student Permit for at least 30 days prior to application.</li>
        </ul>
        <h5>Documentary Requirements:</h5>
        <ul>
          <li>Application Form: Duly accomplished Application for Driver's License (ADL) Form.</li>
          <li>Valid Student Permit: Original and photocopy.</li>
          <li>Medical Certificate: Electronically transmitted medical certificate from an LTO-accredited medical clinic.</li>
          <li>Practical Driving Course (PDC) Certificate: Electronically transmitted Certificate of Completion from an LTO Driver's Education Center or any LTO-accredited driving school.</li>
        </ul>
        
        <h4>3. Professional Driver's License</h4>
        <h5>Qualifications:</h5>
        <ul>
          <li>Age: At least 18 years old.</li>
          <li>Physical and Mental Fitness: Must be physically and mentally fit to operate a motor vehicle.</li>
          <li>Literacy: Able to read and write in Filipino or English.</li>
          <li>Driving Experience:
            <ul>
              <li>For Restriction Codes 1, 2, 4, and 6: Must have held a valid Student Permit issued at least six months prior to application.</li>
              <li>For Restriction Codes 3, 5, 7, and 8: Must have held a valid Non-Professional Driver's License for at least one year prior to application.</li>
            </ul>
          </li>
          <li>Driving Record: Must not have been charged with two or more counts of reckless driving during the current validity of the existing license.</li>
        </ul>
        <h5>Documentary Requirements:</h5>
        <ul>
          <li>Application Form: Duly accomplished Application for Driver's License (ADL) Form.</li>
          <li>Valid License:
            <ul>
              <li>For Restriction Codes 1, 2, 4, and 6: Original and photocopy of valid Student Permit.</li>
              <li>For Restriction Codes 3, 5, 7, and 8: Original and photocopy of valid Non-Professional Driver's License.</li>
            </ul>
          </li>
          <li>Medical Certificate: Electronically transmitted medical certificate from an LTO-accredited medical clinic.</li>
          <li>Practical Driving Course (PDC) Certificate: Electronically transmitted Certificate of Completion from an LTO Driver's Education Center or any LTO-accredited driving school.</li>
          <li>Clearances:
            <ul>
              <li>National Bureau of Investigation (NBI) Clearance.</li>
              <li>Police Clearance.</li>
            </ul>
          </li>
        </ul>
        
        <h4>Additional Notes</h4>
        <p>Please note that fees are associated with each application, including application fees, computer fees, and license fees. Additionally, attending driving courses may incur separate costs. Ensure all documents are complete and accurate to facilitate a smooth application process.</p>
        
        <p>For the most current information, it's advisable to consult the official LTO website or visit the nearest LTO office, as requirements and procedures may change over time.</p>
      `,
    },
    {
      id: 3,
      category: "Licensing",
      title: "License Renewal",
      description: "License renewal…",
      details: `
        <h3>License Renewal</h3>
        <p>Below are the qualifications and documentary requirements for renewal:</p>
        
        <h4>Qualifications</h4>
        <ul>
          <li>License Status: Your driver's license should be valid or expired for less than two years. Licenses expired for more than two years require additional steps, including re-examination.</li>
          <li>Physical and Mental Fitness: You must be physically and mentally fit to operate a motor vehicle.</li>
          <li>Traffic Violations: Ensure all traffic violations, if any, are settled before renewal.</li>
        </ul>
        
        <h4>Documentary Requirements</h4>
        <ul>
          <li>Application Form: Duly accomplished Application for Permits and Licenses (APL) Form.</li>
          <li>Current Driver's License: Present your valid or expired driver's license.</li>
          <li>Medical Certificate: Obtain a medical certificate from an LTO-accredited medical clinic. The certificate should be electronically transmitted to the LTO.</li>
          <li>Certificate of Comprehensive Driver's Education (CDE): Completion of the CDE is mandatory for renewal. The certificate should be electronically transmitted to the LTO.</li>
        </ul>
        
        <h4>Additional Requirements for Licenses Expired Over Two Years</h4>
        <ul>
          <li>Theoretical Examination: Pass the automated theoretical examination.</li>
          <li>Practical Driving Test: Pass the practical driving test.</li>
          <li>Driver's Reorientation Course: Complete the Driver's Reorientation Course.</li>
        </ul>
        
        <h4>For Overseas Filipino Workers (OFWs) and Filipinos Abroad</h4>
        <ul>
          <li>Special Power of Attorney (SPA): Authorize a representative to renew your license on your behalf. The SPA must be notarized by the Philippine Embassy or Consulate.</li>
          <li>Passport Photocopies: Provide photocopies of the passport's first page, visa page, departure from the Philippines, and latest arrival overseas.</li>
          <li>Letter of Authority: A letter authorizing your representative to process the renewal.</li>
        </ul>
        
        <h4>Renewal Process</h4>
        <ul>
          <li>Complete the CDE: Attend the Comprehensive Driver's Education seminar, available online or at LTO offices.</li>
          <li>Medical Examination: Undergo a medical examination at an LTO-accredited clinic.</li>
          <li>Submit Application: Visit the nearest LTO office with the required documents and submit your application.</li>
          <li>Biometric Capture and Payment: Have your photo and biometrics taken, then pay the necessary fees.</li>
          <li>Release of License: After processing, your renewed license will be issued.</li>
        </ul>
        
        <h4>Fees</h4>
        <p>License Fee: ₱585.00</p>
        
        <h4>Penalties for Late Renewal</h4>
        <ul>
          <li>1 day to 1 year expired: Additional ₱75.00</li>
          <li>More than 1 year to 2 years expired: Additional ₱150.00</li>
          <li>More than 2 years expired: Additional ₱225.00</li>
        </ul>
        
        <h4>Important Notes</h4>
        <p>Please note that fees and procedures may change over time. For the most current information, it's advisable to consult the official LTO website or visit the nearest LTO office.</p>
      `,
    },
    {
      id: 4,
      category: "Licensing",
      title: "Fees and Other Charges",
      description: "List of fees and other charges when applying for a driver's license",
      details: `
        <h3>Fees and Other Charges</h3>
        <p>Applying for a driver's license in the Philippines involves several fees and charges, which vary depending on the type of license and the specific application process. Below is a breakdown of the costs associated with each type of license:</p>
        
        <h4>1. Student Permit</h4>
        <ul>
          <li>Application Fee: ₱100</li>
          <li>Permit Fee: ₱150</li>
          <li>Computer Fee: ₱67.63</li>
          <li><strong>Total Cost: ₱317.63</strong></li>
        </ul>
        <p>These fees cover the processing of your student permit, which is valid for one year.</p>
    
        <h4>2. Non-Professional Driver's License</h4>
        <ul>
          <li>Application Fee: ₱100</li>
          <li>License Fee: ₱585</li>
          <li>Computer Fee: ₱67.63</li>
          <li><strong>Total Cost: ₱752.63</strong></li>
        </ul>
        <p>This license is typically valid for five years, with the possibility of a ten-year validity for drivers with clean records.</p>
    
        <h4>3. Professional Driver's License</h4>
        <ul>
          <li>Application Fee: ₱100</li>
          <li>License Fee: ₱585</li>
          <li>Computer Fee: ₱67.63</li>
          <li><strong>Total Cost: ₱752.63</strong></li>
        </ul>
        <p>Professional licenses are also valid for five years, extendable to ten years for drivers without violations.</p>
    
        <h4>Additional Costs</h4>
        <ul>
          <li>Medical Examination: Fees for the required medical examination vary depending on the accredited clinic.</li>
          <li>Theoretical Driving Course (TDC): Some driving schools may charge fees for the mandatory TDC, while LTO Driver's Education Centers may offer it for free.</li>
          <li>Practical Driving Course (PDC): Fees vary by driving school and vehicle type.</li>
        </ul>
    
        <h4>Penalties for Late Renewal</h4>
        <ul>
          <li>1 Day to 1 Year Expired: Additional ₱75 penalty</li>
          <li>More than 1 Year to 2 Years Expired: Additional ₱150 penalty</li>
          <li>More than 2 Years Expired: Additional ₱225 penalty, plus re-examination fees</li>
        </ul>
        
        <h4>Important Notes</h4>
        <ul>
          <li><strong>Payment Methods:</strong> LTO offices accept cash payments; some may offer electronic payment options.</li>
          <li><strong>Official Receipts:</strong> Always request and keep official receipts for all payments made.</li>
          <li><strong>Fee Updates:</strong> Fees are subject to change; it's advisable to verify the latest fees through the official LTO website or by contacting the nearest LTO office.</li>
        </ul>
        <p>For the most accurate and up-to-date information, please refer to the official Land Transportation Office (LTO) website or visit the nearest LTO branch.</p>
      `,
    },
    {
      id: 5,
      category: "Traffic Rules",
      title: "Traffic Rules and Regulations",
      description: "Must know Traffic Rules and Regulations in the Philippines",
      details: `
        <h3>Traffic Rules and Regulations</h3>
        <p>Understanding and following traffic rules and regulations in the Philippines is essential for safe and lawful driving. Here are the must-know traffic rules and regulations:</p>
        
        <h4>General Driving Rules</h4>
        <ul>
          <li><strong>Valid Driver’s License:</strong> Always carry your valid driver’s license while driving. Ensure it is appropriate for the type of vehicle you are operating.</li>
          <li><strong>Vehicle Registration and Insurance:</strong> Drive only registered vehicles with updated registration and Comprehensive Third-Party Liability (CTPL) insurance.</li>
          <li><strong>Seat Belt Law (RA 8750):</strong> All passengers in the front and rear seats must wear seat belts. Failure to comply results in fines and penalties.</li>
          <li><strong>Speed Limits:</strong> 
            <ul>
              <li>Urban areas: 30–60 km/h</li>
              <li>Rural roads: 50–80 km/h</li>
              <li>Expressways: 60–100 km/h</li>
            </ul>
            Follow the specific speed limit signs on different roads.
          </li>
          <li><strong>Driving Under the Influence (RA 10586):</strong> Strictly avoid driving under the influence of alcohol or drugs. Violators are subjected to fines, imprisonment, and suspension of the license.</li>
          <li><strong>Obey Traffic Signals and Signs:</strong> Stop at red lights and proceed only when green. Yield to pedestrians and follow all road signs.</li>
        </ul>
    
        <h4>Pedestrian and Road Sharing Rules</h4>
        <ul>
          <li><strong>Pedestrian Crossings:</strong> Yield to pedestrians at designated crossings. Avoid stopping vehicles on pedestrian lanes.</li>
          <li><strong>Right of Way:</strong> Yield to vehicles already on the main road when entering from side streets. Emergency vehicles (ambulances, fire trucks) always have the right of way.</li>
        </ul>
    
        <h4>Motorcycle-Specific Rules</h4>
        <ul>
          <li><strong>Helmet Law (RA 10054):</strong> Riders and passengers must wear standard protective helmets.</li>
          <li><strong>No Backriding for Minors:</strong> Children are not allowed to ride on motorcycles unless they can comfortably reach the foot pegs and hold on securely.</li>
        </ul>
    
        <h4>Prohibited Activities While Driving</h4>
        <ul>
          <li><strong>Using Mobile Devices (RA 10913):</strong> Texting or calling while driving is prohibited unless using hands-free devices. Fines range from ₱5,000 to ₱15,000.</li>
          <li><strong>Overloading:</strong> Do not exceed the vehicle’s seating or weight capacity.</li>
          <li><strong>Illegal Parking:</strong> Avoid parking in prohibited areas, including sidewalks, intersections, and in front of driveways.</li>
        </ul>
    
        <h4>Road Safety and Vehicle Maintenance</h4>
        <ul>
          <li><strong>Maintain Roadworthiness:</strong> Regularly check brakes, lights, tires, and other essential parts. Faulty vehicles are prohibited from operating on public roads.</li>
          <li><strong>Hazard Lights:</strong> Use hazard lights only when necessary, such as in emergencies or during vehicle breakdowns.</li>
        </ul>
    
        <h4>Penalties for Common Violations</h4>
        <ul>
          <li><strong>No Seat Belt:</strong> Fine: ₱1,000 (1st offense)</li>
          <li><strong>Speeding:</strong> Fine: ₱2,000–₱3,000 depending on the severity of the violation.</li>
          <li><strong>Illegal Parking:</strong> Fine: ₱1,000 for obstruction and ₱2,000 for dangerous parking.</li>
          <li><strong>Driving Without a License:</strong> Fine: ₱3,000 and potential suspension of vehicle registration.</li>
          <li><strong>Reckless Driving:</strong> Fine: ₱2,000–₱10,000 and license suspension for repeated offenses.</li>
        </ul>
    
        <h4>Additional Key Laws</h4>
        <ul>
          <li><strong>Anti-Distracted Driving Act (RA 10913):</strong> Avoid activities that distract from driving, including using gadgets or eating.</li>
          <li><strong>Anti-Overloading Act (RA 8794):</strong> Prohibits overloading of trucks and buses, with corresponding penalties.</li>
          <li><strong>Anti-Smoke Belching Law:</strong> Vehicles emitting excessive smoke are prohibited and subject to penalties.</li>
        </ul>
    
        <h4>Tips for Compliance</h4>
        <ul>
          <li>Always stay updated on traffic rules and regulations.</li>
          <li>Be aware of local ordinances, as some cities have specific traffic laws (e.g., coding schemes).</li>
          <li>Respect traffic enforcers and follow their instructions.</li>
        </ul>
    
        <p>By adhering to these rules, drivers and road users can contribute to safer roads and avoid penalties.</p>
      `,
    },
    {
      id: 6,
      category: "Driving Tips",
      title: "Tips for New Drivers",
      description: "Helpful advice for beginner drivers.",
      details: `
        <h3>Tips for New Drivers</h3>
        <p>Helpful advice for beginner drivers:</p>
    
        <h4>Before Driving</h4>
        <ul>
          <li><strong>Know Your Vehicle:</strong> Familiarize yourself with the vehicle's controls (lights, wipers, mirrors, etc.). Adjust the seat, steering wheel, and mirrors for comfort and visibility.</li>
          <li><strong>Check Your Vehicle:</strong> Inspect tires, brakes, fuel level, and lights before driving. Ensure your car is roadworthy and has updated registration and insurance.</li>
          <li><strong>Plan Your Route:</strong> Use navigation apps to avoid traffic or unfamiliar areas. Leave early to allow time for delays.</li>
        </ul>
    
        <h4>While Driving</h4>
        <ul>
          <li><strong>Follow Traffic Rules:</strong> Obey speed limits, traffic signs, and signals. Yield the right of way when required.</li>
          <li><strong>Keep a Safe Distance:</strong> Maintain a 3-second rule between your car and the vehicle in front to allow ample stopping time.</li>
          <li><strong>Be Aware of Your Surroundings:</strong> Continuously scan mirrors and blind spots for pedestrians, cyclists, and vehicles.</li>
          <li><strong>Drive Defensively:</strong> Anticipate potential hazards and the actions of other drivers. Avoid aggressive driving and always stay calm.</li>
          <li><strong>Avoid Distractions:</strong> Keep your hands on the wheel and eyes on the road. Avoid using your phone, eating, or engaging in distracting activities.</li>
        </ul>
    
        <h4>Safety Practices</h4>
        <ul>
          <li><strong>Wear Your Seat Belt:</strong> Ensure everyone in the car is buckled up, regardless of seating position.</li>
          <li><strong>Use Turn Signals:</strong> Indicate your intentions early when changing lanes or making turns.</li>
          <li><strong>Drive at a Comfortable Speed:</strong> Avoid driving too fast or too slow for the road and weather conditions.</li>
          <li><strong>Be Extra Cautious at Night:</strong> Use your headlights properly and reduce speed in low visibility conditions.</li>
          <li><strong>Be Prepared for Emergencies:</strong> Keep a basic toolkit, flashlight, and emergency contacts in your vehicle.</li>
        </ul>
    
        <h4>For Parking and Maneuvering</h4>
        <ul>
          <li><strong>Practice Parking:</strong> Start in low-traffic areas to master parallel and reverse parking.</li>
          <li><strong>Use Caution When Backing Up:</strong> Check mirrors and blind spots, and use a rear-view camera if available.</li>
          <li><strong>Park in Designated Areas:</strong> Avoid obstructing driveways or parking in prohibited zones.</li>
        </ul>
    
        <h4>Building Confidence</h4>
        <ul>
          <li><strong>Practice Regularly:</strong> Drive in different conditions (rain, traffic, highways) to improve skills.</li>
          <li><strong>Start in Low-Traffic Areas:</strong> Gradually move to busier roads as you gain confidence.</li>
          <li><strong>Ask for Feedback:</strong> Drive with an experienced driver who can provide guidance.</li>
        </ul>
    
        <h4>Avoid Common Pitfalls</h4>
        <ul>
          <li><strong>Don’t Rush:</strong> Speeding or taking shortcuts can increase the risk of accidents.</li>
          <li><strong>Avoid Driving When Tired or Stressed:</strong> Stay alert and focused at all times.</li>
          <li><strong>Don’t Tailgate:</strong> Tailgating increases the risk of rear-end collisions.</li>
        </ul>
    
        <h4>Stay Calm in Stressful Situations</h4>
        <ul>
          <li><strong>Handling Road Rage:</strong> Stay composed and avoid engaging with aggressive drivers.</li>
          <li><strong>Dealing with Mistakes:</strong> If you make an error, signal your intentions, and correct it safely.</li>
          <li><strong>Emergency Situations:</strong> If your car breaks down, pull over safely, turn on hazard lights, and call for help.</li>
        </ul>
    
        <p>By following these tips, you can build good driving habits, gain confidence, and ensure a safe driving experience.</p>
      `,
    },
    {
      id: 7,
      category: "Driving Tips",
      title: "Rights, Duties, Responsibilities of Driver",
      description: "Must know Rights, Duties, Responsibilities of Driver",
      details: `
        <h3>Rights, Duties, Responsibilities of Driver</h3>
        <p>As a driver, you have specific rights, duties, and responsibilities that ensure not only your safety but also the safety of other road users. Below is a breakdown of your rights, duties, and responsibilities while driving in the Philippines:</p>
    
        <h4>Driver's Rights</h4>
        <ul>
          <li><strong>Right to Safe Travel:</strong> You have the right to travel safely, provided you follow the road rules and regulations. You can expect other road users to adhere to traffic laws and not engage in dangerous driving behavior.</li>
          <li><strong>Right to Fair Treatment:</strong> You have the right to be treated fairly by traffic enforcers and authorities during inspections, ticketing, and traffic stops. You can contest traffic violations in court if you believe you were wrongfully cited.</li>
          <li><strong>Right to Privacy:</strong> You are entitled to the privacy of your personal information, such as your driver’s license and vehicle registration, unless required by law enforcement officers during an official check.</li>
          <li><strong>Right to Due Process:</strong> If you face a penalty or fine for a traffic violation, you have the right to a fair hearing and the opportunity to appeal or challenge the violation.</li>
        </ul>
    
        <h4>Driver's Duties</h4>
        <ul>
          <li><strong>Obey Traffic Laws:</strong> Always follow traffic signs, signals, and road markings. Adhere to speed limits, stopping distances, and parking rules.</li>
          <li><strong>Maintain a Valid Driver’s License:</strong> Ensure your driver’s license is valid, and renew it on time. Only drive the vehicles your license permits.</li>
          <li><strong>Respect Pedestrians and Cyclists:</strong> Yield to pedestrians at crosswalks and give cyclists enough space on the road.</li>
          <li><strong>Adhere to Vehicle Safety Standards:</strong> Regularly check your vehicle’s condition, including tires, brakes, lights, and signals, to ensure it is roadworthy.</li>
          <li><strong>Use Seat Belts:</strong> Ensure that all passengers wear seat belts at all times while driving.</li>
          <li><strong>Avoid Driving Under the Influence:</strong> Never drive while intoxicated by alcohol, drugs, or other substances that impair your ability to drive safely.</li>
          <li><strong>Use Turn Signals:</strong> Always signal when turning or changing lanes to inform other drivers of your intentions.</li>
          <li><strong>Observe Proper Parking:</strong> Park only in designated areas and avoid blocking driveways, fire lanes, or pedestrian walkways.</li>
        </ul>
    
        <h4>Driver's Responsibilities</h4>
        <ul>
          <li><strong>Drive Defensively:</strong> Be aware of your surroundings at all times. Expect other drivers to make mistakes and be prepared to react to prevent accidents.</li>
          <li><strong>Drive Safely in All Conditions:</strong> Adjust your driving according to road conditions, weather, and traffic. Slow down when driving in rain, fog, or during nighttime.</li>
          <li><strong>Respect the Rights of Other Road Users:</strong> Yield to vehicles that have the right of way. Be courteous to other drivers and avoid road rage.</li>
          <li><strong>Provide Assistance in Case of an Accident:</strong> If involved in an accident, stop, and provide assistance or call emergency services. Report accidents to the appropriate authorities, especially in cases of injury or damage.</li>
          <li><strong>Comply with Road Safety Measures:</strong> Always use seat belts, helmets (for motorcycle riders), and follow safety rules for transporting passengers.</li>
          <li><strong>Keep the Roads Free of Hazardous Behaviors:</strong> Do not use your phone, engage in distracted driving, or drive recklessly.</li>
          <li><strong>Notify Authorities of Unsafe Driving Conditions:</strong> Report road hazards, traffic violations, or any unsafe conditions that may affect other drivers.</li>
        </ul>
    
        <h4>Legal Responsibilities of Drivers</h4>
        <ul>
          <li><strong>Responsibility for Vehicle Inspections:</strong> Ensure that your vehicle is regularly inspected (e.g., emission testing, roadworthiness).</li>
          <li><strong>Responsibility for Road Tolls and Fees:</strong> Pay tolls or fees for using tollways, expressways, and other private roads.</li>
          <li><strong>Responsibility to Follow Law Enforcement:</strong> Obey the instructions of traffic enforcers and provide necessary documents when requested (e.g., driver’s license, vehicle registration).</li>
          <li><strong>Responsibility in Case of Violations:</strong> If you violate traffic laws, you are responsible for paying fines, attending traffic seminars, or facing other penalties as required by law.</li>
        </ul>
    
        <h4>Consequences of Violating Duties and Responsibilities</h4>
        <ul>
          <li><strong>Fines and Penalties:</strong> Traffic violations, such as speeding, illegal parking, or driving without a license, result in fines.</li>
          <li><strong>License Suspension or Revocation:</strong> Repeated violations can lead to the suspension or revocation of your driver’s license.</li>
          <li><strong>Criminal Charges:</strong> Serious violations, such as driving under the influence (DUI), reckless driving, or involvement in a hit-and-run accident, can lead to criminal charges and imprisonment.</li>
        </ul>
    
        <p>By understanding your rights, duties, and responsibilities as a driver, you can contribute to safer roads and avoid penalties while ensuring a smoother driving experience for everyone.</p>
      `,
    },
    {
      id: 8,
      category: "Vehicle Registration",
      title: "Vehicle Registration Requirements and Process",
      description: "Helpful Vehicle Registration Requirements and Process Guide.",
      details: `
      <h3>Vehicle Registration Requirements:</h3>
         <ul>  
           <li><strong>Documents Required:</strong></li>  <br/>
           <ul>  
             <li><strong>Original Certificate of Ownership (CPO):</strong> Issued by the Land Transportation Office (LTO) or the dealer if the vehicle is newly purchased.</li>  
             <li><strong>Certificate of Insurance (CTPL):</strong> Comprehensive Third-Party Liability (CTPL) insurance is mandatory for all motor vehicles. The certificate must be issued by an accredited insurance company.</li>  
             <li><strong>Proof of Payment of Applicable Fees:</strong> Payment for registration fees, such as motor vehicle tax, clearance fee, and other related charges.</li>  
             <li><strong>Official Receipt (OR) and Certificate of Payment (CP):</strong> For vehicles previously registered, an official receipt for the payment of previous registration must be provided.</li>  
             <li><strong>LTO Forms:</strong> Completed LTO form (Application for Registration of Motor Vehicle). This can be obtained at any LTO office or downloaded from the LTO website.</li>  
             <li><strong>Valid Government-Issued ID:</strong> A valid ID of the vehicle owner for verification of identity.</li>  
             <li><strong>Emission Test Certificate:</strong> An emission test certificate from an accredited emission testing center, confirming the vehicle passes emission standards.</li>  
             <li><strong>Motor Vehicle Inspection Report (MVIR):</strong> For new vehicles, an inspection report is required, typically provided by the dealer. For used vehicles, a roadworthiness inspection must be done at an LTO office.</li>  
             <li><strong>Deed of Sale (if applicable):</strong> If you’ve purchased the vehicle from a private seller, the Deed of Sale is required as proof of transfer of ownership.</li>  
             <li><strong>Taxpayer Identification Number (TIN):</strong> For first-time registrants, your TIN must be submitted to the LTO.</li>  
             <li><strong>Proof of Payment of Local Taxes:</strong> Depending on the vehicle type and location, you may be required to submit proof of payment of local taxes (e.g., barangay clearance or other local government fees).</li>  
           </ul>  <br/>
           <li><strong>Payment of Fees:</strong></li>  <br/>
           <ul>  
             <li><strong>Motor Vehicle Tax:</strong> Vehicle tax is calculated based on the type, weight, and engine displacement of the vehicle. This tax is typically paid annually.</li>  
             <li><strong>Registration Fees:</strong> Includes registration processing fees, emission test fees, and other applicable fees.</li>  
             <li><strong>LTO Penalty Fees:</strong> If you are registering your vehicle after the expiration of its registration, you will incur a penalty fee.</li>  
           </ul>  
         </ul>  
         <h3>Vehicle Registration Process:</h3>  
         <ul>  
           <li><strong>Step 1:</strong> <strong>Prepare the Required Documents:</strong> Ensure that you have all the necessary documents mentioned above, such as the Certificate of Ownership, proof of insurance, emission test certificate, LTO forms, and any required government ID.</li>  <br/>
           <li><strong>Step 2:</strong> <strong>Visit an LTO Office or LTO Satellite Office:</strong> You can go to the nearest LTO office or an accredited LTO satellite office to process the registration. You can also inquire online if your LTO office offers online appointment scheduling.</li> <br/> 
           <li><strong>Step 3:</strong> <strong>Submit Documents and Pay Fees:</strong> Submit your documents to the LTO clerk and pay the registration fees. The LTO will process your vehicle’s registration after verifying the information provided.</li>  <br/>
           <li><strong>Step 4:</strong> <strong>Vehicle Inspection (if applicable):</strong> If required, your vehicle will undergo a roadworthiness inspection to ensure it is safe to operate. This inspection may include checking the engine, brakes, lights, and other essential systems.</li>  <br/>
           <li><strong>Step 5:</strong> <strong>Emission Test:</strong> Submit the emission test result if it hasn't been provided earlier. Ensure that your vehicle complies with emission standards before proceeding with registration.</li>  <br/>
           <li><strong>Step 6:</strong> <strong>Obtain Official Receipt and Plate Number:</strong> Once your registration is complete, the LTO will issue the official receipt (OR) and Certificate of Registration (CR), and you will be given your license plate number (if not already issued). Plates are usually available after processing, but sometimes, they may be delivered later.</li>  <br/>
           <li><strong>Step 7:</strong> <strong>Stick the New Sticker on Your Vehicle:</strong> Once you receive your registration sticker, make sure to affix it to your vehicle’s windshield as required by LTO regulations.</li>  
         </ul>  
         <h3>Registration Fees Breakdown (Estimates):</h3>  
         <ul>  
           <li><strong>Registration Fees:</strong></li>  
           <ul>  
             <li>For motorcycles: ₱300–₱1,000</li>  
             <li>For light vehicles (e.g., sedans, compact cars): ₱1,000–₱3,500</li>  
             <li>For heavy vehicles (e.g., trucks, buses): ₱5,000 and above</li>  
           </ul>  <br/>
           <li><strong>Motor Vehicle Tax:</strong> Tax varies based on the engine displacement or weight. It can range from ₱500 to ₱10,000 or more.</li>  <br/>
           <li><strong>Emission Test Fee:</strong> Approximately ₱400–₱800 depending on the emission testing center.</li>  <br/>
           <li><strong>Late Registration Penalty:</strong> A penalty of ₱100–₱1,000 depending on how long the vehicle has been overdue for registration.</li>  
         </ul>  `
    },
    {
      id: 9,
      category: "Traffic Rules",
      title: "Fines and Penalties for Violations",
      description: "Fines and Penalties for Violations",
      details: `
      <h3>TEMPORARY OPERATOR'S PERMIT (TOP):</h3>  
         <ul>  
           <li>Serves as a permit to operate a motor vehicle for a period of seventy-two (72) hours only. All apprehensions are deemed admitted unless contested by filing a written contest within five (5) days from the date of apprehension.</li>  
           <li>Failure of the driver to pay the corresponding penalty within fifteen (15) days from the date of apprehension shall cause automatic suspension of his driver's license for a period of thirty (30) days from the date of apprehension, in addition to the fines and penalties prescribed hereunder.</li>  
           <li>The LTO shall resolve a contested case within five (5) days from receipt of said written contest.</li>  
           <li>The imposition of the fines and penalties shall be without prejudice to any criminal action that may be instituted under existing laws, rules, and regulations.</li>  
         </ul>  
         <br><strong>Traffic Violations and Fines:</strong><br>
         <ul>  
           <li><strong>Running a Red Light:</strong> ₱3,000 to ₱5,000</li>  
           <li><strong>Speeding:</strong> ₱1,000 to ₱2,000</li>  
           <li><strong>Illegal Parking:</strong> ₱500 to ₱2,000</li>  
           <li><strong>Driving Under the Influence:</strong> ₱20,000 to ₱80,000</li>  
           <li><strong>Not Wearing Seat Belts:</strong> ₱1,000 to ₱5,000</li>  
           <li><strong>Using a Mobile Phone While Driving:</strong> ₱5,000 to ₱10,000</li>  
           <li><strong>Not Wearing a Helmet:</strong> ₱1,500</li>  
           <li><strong>Reckless Driving:</strong> ₱500 to ₱5,000 and suspension of the driver’s license</li>  
           <li><strong>Unauthorized U-Turns:</strong> ₱500 to ₱5,000</li>  
           <li><strong>Failure to Obey Traffic Signs:</strong> ₱500 to ₱5,000</li>  
           <li><strong>Driving Without a License:</strong> ₱3,000 to ₱10,000</li>  
           <li><strong>Using Expired License Plates:</strong> ₱2,000 to ₱5,000</li>  
         </ul>  
         <strong>Other Information:</strong>
         <ul>  
           <li>In some cases, vehicles may be impounded or towed.</li>  
           <li>Payment can be made at LTO offices or accredited centers.</li>  
           <li>Drivers may appeal tickets if necessary.</li>  
           <li>Multiple offenses may result in license suspension or revocation.</li>  
         </ul>  
         <strong>Important Note:</strong><br>It’s important to follow traffic rules to avoid fines and ensure safety on the road. `
    },
      
  ];
  const [expandedCard, setExpandedCard] = useState(null);
  const filteredTextMaterials =
  selectedCategory === "All"
    ? textMaterials
    : textMaterials.filter((item) => item.category === selectedCategory);
  
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);

    const toggleDetails = (id) => {
      console.log("Toggling Details for ID:", id);
      setSelectedMaterialId((prevId) => (prevId === id ? null : id));
    };
    
    
    const fixHTML = (htmlString) => {
      return htmlString.replace(/\\n/g, "<br>").replace(/"/g, "'");
    };


  const filteredMaterials =
  selectedCategory === "All"
    ? materials
    : materials.filter((item) => item.category === selectedCategory);
 
  const gameCategories = ["All", "Quiz", "Simulation"];
  const games = [
    { id: 1, category: "Quiz", title: "Distracted Driving Quiz", description: "Test your knowledge about distracted driving.", link: "/Quiz", "data-tid": "1096" },
    { id: 2, category: "Quiz", title: "Drinking and Driving Quiz", description: "Learn the risks and consequences of drinking and driving.", link: "/Quiz", "data-tid": "1097" },
    { id: 3, category: "Quiz", title: "Road Signs Quiz", description: "Test your understanding of road signs and their meanings.", link: "/Quiz", "data-tid": "1098" },
    { id: 4, category: "Simulation", title: "Highway Traffic", description: "Experience the challenges of managing traffic in busy highway scenarios.", link: "/Simulation", "data-tid": "1099" },
    { id: 5, category: "Simulation", title: "Dockyard Tank Parking", description: "Test your precision driving skills by parking heavy vehicles in tight dockyard spaces.", link: "/Simulation", "data-tid": "1100" },
    { id: 6, category: "Simulation", title: "Extreme Car Parking", description: "Navigate challenging terrains and park your car with expert precision in extreme scenarios.", link: "/Simulation", "data-tid": "1101" },
    { id: 7, category: "Quiz", title: "Match the Road Signs", description: "Match the memory: Follow the road signs game.", link: "/Quiz", "data-tid": "1102" },
    { id: 8, category: "Quiz", title: "Traffic Sign Quiz", description: "Test your knowledge of traffic signs and their meanings.", link: "/Quiz", "data-tid": "1103" },
    { id: 9, category: "Simulation", title: "Cross Road Exit", description: "Simulate crossing busy roads and safely navigating intersections.", link: "/Simulation", "data-tid": "1104" },
    { id: 10, category: "Simulation", title: "Traffic Go", description: "Simulate driving in traffic and make quick decisions on the road.", link: "/Simulation", "data-tid": "1105" },
    { id: 11, category: "Quiz", title: "Car Logos Quiz", description: "Test your knowledge of car logos and their corresponding brands.", link: "/Quiz", "data-tid": "1106" },
    { id: 12, category: "Quiz", title: "Do I Have Road Rage?", description: "Find out if you have road rage with this fun personality quiz.", link: "/Quiz", "data-tid": "1107" },
    { id: 13, category: "Quiz", title: "Rules Of The Road", description: "Test your understanding of the rules of the road and driving regulations.", link: "/Quiz", "data-tid": "1108" },
    { id: 14, category: "Quiz", title: "Road Safety", description: "Learn about road safety measures and how to stay safe on the road.", link: "/Quiz", "data-tid": "1109" },
    { id: 15, category: "Quiz", title: "Road Sign", description: "Test your knowledge of different road signs and their meanings.", link: "/Quiz", "data-tid": "1110" },
  ];


  const filteredGames =
    selectedGameCategory === "All"
      ? games
      : games.filter((game) => game.category === selectedGameCategory);

  // Game section with embedded script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://driving-tests.org/embed/test.js#v=1";
    script.async = true;
    script.id = 'dto-jssdk';
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


        <div className="elearning-container">
          {/* Page Title */}
          <div className="page-header">
            <h1>ICITicket E-Learning</h1>
            <p>Your go-to platform for driving and traffic-related knowledge.</p>
          </div>

          {/* Category Buttons */}
          <h2> <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: "20px" , marginLeft: "5px" }} />Learning Materials</h2>
          <h3>Videos</h3>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* E-Learning Materials */}
          <div className="elearning-materials">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="material-card">
                <h2>{material.title}</h2>
                <p>{material.description}</p>
                <iframe
                  src={material.video}
                  title={material.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>

          <h3>Text Materials</h3>
            <div className="elearning-materials3">
            {filteredTextMaterials.map((material) => (
          <div key={material.id} className="material-card3">
            <h2>{material.title}</h2>
            <p>{material.description}</p>
            <button onClick={() => toggleDetails(material.id)}>
              {selectedMaterialId === material.id ? "Show Less" : "View Details"}
            </button>
            {selectedMaterialId === material.id && (
              <>
                <div
                  className="material-details3"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(material.details),
                  }}
                ></div>
              </>
            )}
          </div>
        ))}
            </div>

          {/* Games */}
          <div className="game">
            <h2><FontAwesomeIcon icon={faGamepad} style={{ marginRight: "20px" , marginLeft: "5px" }} />Games</h2>
            
            {/* Game Category Buttons */}
            <div className="category-buttons">
              {gameCategories.map((category) => (
                <button
                  key={category}
                  className={`category-button ${selectedGameCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedGameCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Display Filtered Games */}
            <div className="elearning-materials">
            {filteredGames.map((game) => (
              <div key={game.id} className="material-card">
                <h2>{game.title}</h2>
                <p>{game.description}</p>
                <a href={`${game.link}?data-tid=${game["data-tid"]}`}>Play</a> {/* Pass data-tid as query parameter */}
              </div>
            ))}
            </div>

          </div>
        </div>
      </>
      )}
    </div>
  );
};

export default Game;
