# DIGITAL TRANSFORMATION OF TRAFFIC VIOLATION TICKETING:
Implementing a QR Code-Based Platform in Iligan City

Project Description

A web application that streamlines traffic ticketing processes by incorporating a QR code-based system for efficient tracking and documentation. 
It also features officer management, report and clearance generation, and digital communication with violators.

----------------------------------

Contributors

Cate Melody Dalis

Normailah Macala

Kirk Selwyn Miguel Ycong

----------------------------------

Tech Stack

- **Frontend**: React  
- **Backend**: Node.js  
- **Database**: MongoDB  

----------------------------------

Installation Instructions

1. Install the following prerequisites:
   - [MongoDB](https://www.mongodb.com/try/download/community)
   - [Node.js](https://nodejs.org/)
   - [VSCode](https://code.visualstudio.com/)

2. Transfer or extract the source code into your desired folder.

----------------------------------

Usage Instructions

1. Open **VSCode** and navigate to the project folder.

2. Open a terminal and go to the backend directory:
///////////////////////////////////
   cd backend
   node index.js
///////////////////////////////////

3. Open another terminal for the frontend:
///////////////////////////////////
   npm start
///////////////////////////////////

The frontend will launch in your browser at http://localhost:3000/.

----------------------------------

Features

User Registration: Drivers can sign up with personal and license details.

QR Code Generation: Each user gets a unique QR code containing personal and vehicle data.

QR Code Scanner: Officers scan QR codes to retrieve violator information instantly.

E-Ticketing: Enforcement officers can issue e-tickets upon scanning.

User & Officer Record Access: Both users and officers can view relevant violation records.

Email Notifications: Automatic notifications for payment deadlines and violations.

Fine Settlement Timer: Tracks deadlines before legal actions are triggered.

Electronic Paperwork: Automatically generates legal documents (e.g., Affidavit, Transmittal).

Data Visualization: Interactive charts and statistics on violations and payments.

Map Integration:

View officer deployment in Iligan City.

Visualize violation density by barangay.

----------------------------------
Penalty Viewer: Displays fine amounts and categories.

Point Accumulation: Tracks accumulated violation points for each user.

Printable Reports: Ready-to-print versions of tickets, reports, clearances, and paperwork.

