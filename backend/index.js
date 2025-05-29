const net = require('net');
const { exec } = require('child_process');
const open = require('open'); // npm install open

const FRONTEND_PORT = 3000;
const BACKEND_PORT = 3001;

/*------------------------------------------------------
  Helper: Kill any process using a specific port
------------------------------------------------------*/
function killProcessOnPort(port, callback) {
  if (process.platform === 'win32') {
    // Windows: find PIDs with netstat and kill them.
    exec(`netstat -ano | findstr :${port}`, (err, stdout, stderr) => {
      if (err || !stdout) {
        console.log(`No process found on port ${port} (Windows) or error: ${err}`);
        return callback();
      }
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid) pids.add(pid);
      });
      if (pids.size === 0) return callback();
      const killCommands = Array.from(pids)
        .map(pid => `taskkill /PID ${pid} /F`)
        .join(' && ');
      exec(killCommands, (killErr, killStdout, killStderr) => {
        if (killErr) {
          console.error(`Error killing process(es) on port ${port}: ${killErr}`);
        } else {
          console.log(`Killed process(es) using port ${port}: ${Array.from(pids).join(', ')}`);
        }
        callback();
      });
    });
  } else {
    // Unix-based systems: use lsof and kill.
    exec(`lsof -t -i:${port}`, (err, stdout, stderr) => {
      if (err || !stdout) {
        console.log(`No process found on port ${port} (Unix) or error: ${err}`);
        return callback();
      }
      const pid = stdout.trim();
      if (pid) {
        exec(`kill -9 ${pid}`, (killErr, killStdout, killStderr) => {
          if (killErr) {
            console.error(`Error killing process with PID ${pid}: ${killErr}`);
          } else {
            console.log(`Killed process with PID ${pid} using port ${port}`);
          }
          callback();
        });
      } else {
        callback();
      }
    });
  }
}

/*------------------------------------------------------
  Helper: Check if a port is in use
------------------------------------------------------*/
function checkPort(port, callback) {
  const tester = net.createServer()
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        callback(true);
      } else {
        callback(false);
      }
    })
    .once('listening', () => {
      tester.once('close', () => callback(false)).close();
    })
    .listen(port);
}

/*------------------------------------------------------
  Backend Server: Start your Express backend
  (This code is based on your previous backend code)
------------------------------------------------------*/
function startBackendInstance() {
  const express = require('express'); 
  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');
  const multer = require('multer');
  const storage = multer.memoryStorage();
  const upload = multer({ storage });
  const bodyParser = require('body-parser');
  const DriverModel = require('./userDriver');
  const OfficerModel = require('./officer');
  const RecordModel = require('./records');
  const ClearanceModel = require('./clearance');
  const jwt = require('jsonwebtoken');
  const cors = require('cors');
  const nodemailer = require('nodemailer');


  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(bodyParser.json());

  // Connect to MongoDB
  mongoose.connect('mongodb://localhost:27017/thesis')
    .then(() => console.log('DB is connected'))
    .catch(err => console.error('Connection error:', err));

    
    app.post(
      "/signup",
      upload.fields([{ name: "front" }, { name: "back" }, { name: "profilePic" }]),
      async (req, res) => {
        const {
          name,
          age,
          gender,
          birthday,
          address,
          conNum,
          email,
          occu,
          DriLicense,
          DLClass,
          DLIssue,
          DLExpireDate,
          password,
        } = req.body;
    
        try {
          const { files } = req;
    
          // Validate required fields
          if (!name || !age || !gender || !birthday || !address || !conNum || !email || !occu || !DriLicense || !password) {
            return res.status(400).json({ error: "All fields are required." });
          }
    
          // Check for duplicate email or other unique fields
          const existingDriver = await DriverModel.findOne({ email });
          if (existingDriver) {
            return res.status(400).json({ error: "Email is already registered." });
          }
    
          // Extract uploaded files
          const front = files.front ? files.front[0] : null;
          const back = files.back ? files.back[0] : null;
          const profilePic = files.profilePic ? files.profilePic[0] : null;
    
          // Hash the password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
    
          // Create new driver
          const newDriver = new DriverModel({
            name,
            age,
            gender,
            birthday,
            address,
            conNum,
            email,
            occu,
            DriLicense,
            DLClass,
            DLIssue,
            DLExpireDate,
            front: front
              ? {
                  data: front.buffer,
                  contentType: front.mimetype,
                }
              : undefined,
            back: back
              ? {
                  data: back.buffer,
                  contentType: back.mimetype,
                }
              : undefined,
            profilePic: profilePic
              ? {
                  data: profilePic.buffer,
                  contentType: profilePic.mimetype,
                }
              : undefined,
            password: hashedPassword,
          });
    
          await newDriver.save();
    
          res.status(201).json({
            message: "Driver registered successfully!",
            _id: newDriver._id, // Send ID for QR code generation
          });
        } catch (err) {
          console.error("Error creating driver:", err);
          res.status(500).json({ error: "Failed to register driver." });
        }
      }
    );
    
  
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const driver = await DriverModel.findOne({ email });
        if (!driver) {
            return res.status(401).json({ message: "Invalid email or password" }); // Generalized message for security
        }

        const isPasswordValid = await bcrypt.compare(password, driver.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" }); // Generalized message for security
        }

        const token = jwt.sign(
            { id: driver._id }, 
            process.env.JWT_SECRET || 'your_secret_key', 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            driverId: driver._id, 
            name: driver.name 
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

app.post('/login2', async (req, res) => {
  const { email, password } = req.body;

  try {
      if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
      }

      const driver = await OfficerModel.findOne({ email });
      if (!driver) {
          return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, driver.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
          { id: driver._id, role: driver.role },  // Include role in token payload
          process.env.JWT_SECRET || 'your_secret_key', 
          { expiresIn: '1h' }
      );

      res.status(200).json({ 
          message: "Login successful", 
          token, 
          driverId: driver._id, 
          name: driver.name,
          role: driver.role  // ✅ Include role in the response
      });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "An error occurred during login" });
  }
});


app.post('/addRecord', upload.fields([
  { name: 'evidence' },
  { name: 'signature' }
]), async (req, res) => {
  try {
    console.log('Received form fields:', req.body);
    console.log('Received files:', req.files);

    const {
      ticketNumber, nameOfDriver, placeOfViolation, timeOfApprehension,
      dateOfApprehension, vehicleClassification, violationDes,
      violationType, gender, age, fineStatus, apprehendingOfficer,
      address, dateOfBirth, phoneNumber, email, occupation,
      licenseNumber, plateNumber, vehicleModel, vehicleYear, vehicleColor,
      vehicleOwnerName, vehicleOwnerAddress, fineAmount, expirationDate,
      licenseClassification, dueDate, agency
    } = req.body;

    const files = req.files;
    const processedSignature = files?.signature?.[0] || null;
    const processedEvidence = files?.evidence?.[0] || null;
    console.log("Processed Evidence:", processedEvidence);

    const newRecord = new RecordModel({
      ticketNumber,
      nameOfDriver,
      placeOfViolation,
      timeOfApprehension,
      dateOfApprehension,
      vehicleClassification,
      violationDes,
      violationType,
      gender,
      age,
      fineStatus,
      apprehendingOfficer,
      address,
      dateOfBirth,
      phoneNumber,
      email,
      occupation,
      licenseNumber,
      plateNumber,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleOwnerName,
      vehicleOwnerAddress,
      fineAmount,
      expirationDate,
      licenseClassification,
      dueDate,
      agency,
      signature: processedSignature
        ? {
            data: processedSignature.buffer,
            contentType: processedSignature.mimetype,
          }
        : undefined,
      evidence: processedEvidence
        ? {
            data: processedEvidence.buffer,
            contentType: processedEvidence.mimetype,
          }
        : undefined,
    });

    await newRecord.save();

    res.status(201).json({
      message: 'Record added successfully!',
      record: newRecord,
    });

  } catch (error) {
    console.error('Error submitting record:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request.',
      details: error.message
    });
  }
});

app.get('/getRecords', async (req, res) => {
  try {
    const { defaultStatus } = req.query;
    const filter = defaultStatus ? { defaultStatus } : {};

    const records = await RecordModel.find(filter).sort({ _id: -1 });

    const updatedRecords = records.map(record => {
      const updatedRecord = { ...record._doc };

      // Convert signature if present
      if (record.signature?.data) {
        updatedRecord.signature = {
          data: record.signature.data.toString("base64"),
          contentType: record.signature.contentType,
        };
      }

      if (record.evidence?.data) {
        updatedRecord.evidence = {
          data: record.evidence.data.toString("base64"),
          contentType: record.evidence.contentType,
        };
      }
      return updatedRecord;
    });

    res.status(200).json(updatedRecords);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ message: 'Failed to retrieve records' });
  }
});

app.get('/unpaid/:licenseNumber', async (req, res) => {
  try {
    const violations = await RecordModel.find({
      licenseNumber: req.params.licenseNumber,
      fineStatus: 'Unpaid'
    });

    res.json(violations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching records' });
  }
});

app.get('/getSignature/:id', async (req, res) => {
  try {
    const record = await RecordModel.findById(req.params.id).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }

    if (record.signature && record.signature.data) {
      record.signature = {
        data: record.signature.data.toString("base64"),
        contentType: record.signature.contentType,
      };
    }

      res.status(200).json(record);
  } catch (err) {
      console.error('Error fetching records:', err);
      res.status(500).json({ message: 'Failed to retrieve records' });
  }
});

app.get('/getClearances', async (req, res) => {
  try {
      const { defaultStatus } = req.query;

      // Create filter object if defaultStatus is provided
      const filter = defaultStatus ? { defaultStatus } : {};

      // Fetch the clearances, and sort by _id in descending order (most recent first)
      const clearances = await ClearanceModel.find(filter).sort({ _id: -1 }); // Sorting by _id in descending order

      res.status(200).json(clearances);
  } catch (err) {
      console.error('Error fetching clearances:', err);
      res.status(500).json({ message: 'Failed to retrieve clearances' });
  }
});


app.get('/getRecordD/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const record = await RecordModel.findById(id);
      if (record) {
        res.status(200).json(record);
      } else {
        res.status(404).json({ message: 'Record not found' });
      }
    } catch (err) {
      console.error('Error fetching record:', err);
      res.status(500).json({ message: 'Failed to retrieve record' });
    }
  });


  app.put("/editRecords/:id", async (req, res) => {
    try {
      const { id } = req.params; 
  
      const updatedData = req.body;
  
      const updatedRecord = await RecordModel.findByIdAndUpdate(id, updatedData, {
        new: true, // Ensure the updated record is returned, not the old one
        runValidators: true, // Validate the data before updating
      });
  
      if (!updatedRecord) {
        return res.status(404).json({ message: "Record not found" });
      }
      console.log(updatedRecord)
      // Send back the updated record in the response
      res.json(updatedRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/deleteRecord/:id", async (req, res) => {
  
    try {
      const { id } = req.params;
  
      const result = await RecordModel.findByIdAndDelete(id);
      if (result) {
        res.status(200).send("Record deleted successfully.");
      } else {
        res.status(404).send("Record not found.");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      res.status(500).send("Internal server error.");
    }
  });
  

  app.put('/updateFine/:fineId', async (req, res) => {
    try {
        const { fineId } = req.params;
        
        // Convert fineId to ObjectId if necessary
        const objectIdFineId = new mongoose.Types.ObjectId(fineId);

        const updatedFine = await RecordModel.findOneAndUpdate(
            { _id: objectIdFineId }, // Match by _id, not fineId
            { fineStatus: "Paid" }, 
            { new: true }
        );

        if (!updatedFine) {
            console.log("Fine not found in DB");
            return res.status(404).json({ message: "Fine not found" });
        }

        res.json({ message: "Fine status updated", fine: updatedFine });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get("/traffic-data", async (req, res) => {
  try {
      const records = await RecordModel.find({}, "placeOfViolation"); // Fetch only placeOfViolation field
      res.json(records);
  } catch (error) {
      console.error("Error fetching traffic data:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/csvUpload', async (req, res) => {
  try {
    const { data } = req.body; // Extract data from request

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'No data provided' });
    }

    const result = await RecordModel.insertMany(data); // Insert into MongoDB
    res.status(200).json({ message: 'Data uploaded successfully', insertedRecords: result });
  } catch (error) {
    console.error("MongoDB Insert Error:", error);
    res.status(500).json({ message: 'Error inserting data', error: error.message });
  }
});

app.post("/addClearance", async (req, res) => {
  try {
    const newRecord = new ClearanceModel(req.body);
    await newRecord.save();
    res.status(201).json({ message: "Clearance saved successfully!" });
  } catch (error) {
    console.error("Error saving record:", error);
    res.status(500).json({ message: "Failed to save clearance" });
  }
});

app.post('/addOfficer', upload.none(), async (req, res) => {
  const { name, idnum, age, gender, conNum, email, agency, assign, dutyStatus, role, password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newOfficer = new OfficerModel({
      name,
      idnum,
      age,
      gender,
      conNum,
      email,
      agency,
      assign,
      dutyStatus,
      role,
      password: hashedPassword
    });
    
    await newOfficer.save();
    
    res.status(201).json({
      message: 'Officer added successfully!',
      record: newOfficer,
    });
    
  } catch (error) {
    console.error('Error submitting officer:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request.',
      details: error.message
    });
  }
});

app.get('/getOfficer', async (req, res) => {
  try {
      const { defaultStatus } = req.query;

      // Create filter object
      const filter = { role: { $nin: ["Admin", "Treasurer"] } }; // Exclude role=Admin
      if (defaultStatus) {
          filter.defaultStatus = defaultStatus;
      }

      // Fetch the records, and sort by _id in descending order (most recent first)
      const records = await OfficerModel.find(filter).sort({ _id: -1 });

      res.status(200).json(records);
  } catch (err) {
      console.error('Error fetching records:', err);
      res.status(500).json({ message: 'Failed to retrieve records' });
  }
});

// Update officer duty status endpoint
app.put('/updateOfficerDutyStatus/:id', async (req, res) => {
  const { id } = req.params;
  const { dutyStatus } = req.body; // expect "On Duty" or "Off Duty"
  try {
    const updatedOfficer = await OfficerModel.findByIdAndUpdate(
      id,
      { dutyStatus },
      { new: true }
    );
    if (!updatedOfficer) {
      return res.status(404).json({ error: "Officer not found" });
    }
    res.json({ message: "Duty status updated", officer: updatedOfficer });
  } catch (error) {
    console.error("Error updating duty status:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/getOfficerById/:id', async (req, res) => {
  try {
    const officer = await OfficerModel.findOne({ _id: req.params.id });

    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    res.json(officer);
  } catch (error) {
    console.error("Error fetching officer:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getdriver/:driverId", async (req, res) => {
  try {
    const driver = await DriverModel.findById(req.params.driverId).lean();
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Convert the 'front' buffer to a base64 string, if it exists
    if (driver.front && driver.front.data) {
      driver.front = {
        data: driver.front.data.toString("base64"),
        contentType: driver.front.contentType,
      };
    }

    // Convert the 'back' buffer to a base64 string, if it exists
    if (driver.back && driver.back.data) {
      driver.back = {
        data: driver.back.data.toString("base64"),
        contentType: driver.back.contentType,
      };
    }

    // Convert the 'profilePic' buffer to a base64 string, if it exists
    if (driver.profilePic && driver.profilePic.data) {
      driver.profilePic = {
        data: driver.profilePic.data.toString("base64"),
        contentType: driver.profilePic.contentType,
      };
    }

    res.json(driver);
  } catch (error) {
    console.error("Error retrieving driver:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/getdriver4/:driverId", async (req, res) => {
  try {
    const driver = await DriverModel.findOne({ DriLicense: req.params.driverId }).lean();
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Convert the 'front' buffer to a base64 string, if it exists
    if (driver.front && driver.front.data) {
      driver.front = {
        data: driver.front.data.toString("base64"),
        contentType: driver.front.contentType,
      };
    }

    // Convert the 'back' buffer to a base64 string, if it exists
    if (driver.back && driver.back.data) {
      driver.back = {
        data: driver.back.data.toString("base64"),
        contentType: driver.back.contentType,
      };
    }

    // Convert the 'profilePic' buffer to a base64 string, if it exists
    if (driver.profilePic && driver.profilePic.data) {
      driver.profilePic = {
        data: driver.profilePic.data.toString("base64"),
        contentType: driver.profilePic.contentType,
      };
    }

    res.json(driver);
  } catch (error) {
    console.error("Error retrieving driver:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post('/updateProfilePic/:driverId', upload.single('profilePic'), async (req, res) => {
  try {
      const { driverId } = req.params;
      const profilePic = req.file;

      if (!profilePic) {
          return res.status(400).json({ error: "No file uploaded" });
      }

      const updatedDriver = await DriverModel.findByIdAndUpdate(driverId, {
          profilePic: {
              data: profilePic.buffer,
              contentType: profilePic.mimetype,
          }
      }, { new: true });

      if (!updatedDriver) {
          return res.status(404).json({ error: "Driver not found" });
      }

      res.json({
          message: "Profile picture updated successfully!",
          data: updatedDriver.profilePic.data.toString("base64"),
          contentType: updatedDriver.profilePic.contentType
      });

  } catch (err) {
      console.error("Error updating profile picture:", err);
      res.status(500).json({ error: "Failed to update profile picture" });
  }
});

app.put('/editOfficer/:id', upload.none(), async (req, res) => {
  const { name, idnum, age, gender, conNum, email, agency, assign, dutyStatus, role, password } = req.body;

  try {
    // Find officer by ID
    const officer = await OfficerModel.findById(req.params.id);
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found.' });
    }

    // Update fields
    officer.name = name || officer.name;
    officer.idnum = idnum || officer.idnum;
    officer.age = age || officer.age;
    officer.gender = gender || officer.gender;
    officer.conNum = conNum || officer.conNum;
    officer.email = email || officer.email;
    officer.agency = agency || officer.agency;
    officer.assign = assign || officer.assign;
    officer.dutyStatus = dutyStatus || officer.dutyStatus;
    officer.role = role || officer.role;

    // If password is provided, hash it before updating
    if (password) {
      const salt = await bcrypt.genSalt(10);
      officer.password = await bcrypt.hash(password, salt);
    }

    await officer.save();

    res.status(200).json({
      message: 'Officer updated successfully!',
      record: officer,
    });
    
  } catch (error) {
    console.error('Error updating officer:', error);
    return res.status(500).json({
      error: 'An error occurred while processing your request.',
      details: error.message,
    });
  }
});

app.get("/getdriverfromrecords/:email", async (req, res) => {
  try {
    const driver = await DriverModel.findOne({ email: req.params.email }).lean();
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    if (driver.front && driver.front.data) {
      driver.front = {
        data: driver.front.data.toString("base64"),
        contentType: driver.front.contentType,
      };
    }

    // Convert the 'back' buffer to a base64 string, if it exists
    if (driver.back && driver.back.data) {
      driver.back = {
        data: driver.back.data.toString("base64"),
        contentType: driver.back.contentType,
      };
    }

    // Convert the 'profilePic' buffer to a base64 string, if it exists
    if (driver.profilePic && driver.profilePic.data) {
      driver.profilePic = {
        data: driver.profilePic.data.toString("base64"),
        contentType: driver.profilePic.contentType,
      };
    }

    res.json(driver);
  } catch (error) {
    console.error("Error retrieving driver:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/getrecordemail/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("Searching for records with email:", email);

    if (!email) return res.status(400).json({ error: "Email is required" });

    const regex = new RegExp(email, "i");
    console.log("Using regex:", regex);

    const records = await RecordModel.find({ email: { $regex: regex } });

    console.log("Found records:", records);

    if (records.length === 0) {
      return res.status(404).json({ message: "No records found for this email" });
    }

    res.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/updateAssign", async (req, res) => { 
  try {
    const { id, assign } = req.body;

    console.log(id, assign);
    
    const updated = await OfficerModel.findByIdAndUpdate(
      id,
      { assign }, // assigns the value to the `assign` field
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Officer not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating assignment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/getDriverById2/:id', async (req, res) => {
  try {
    const driver = await DriverModel.findOne({ _id: req.params.id });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ message: "Server error" });
  }
});



const server = app.listen(BACKEND_PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${BACKEND_PORT}`);
});

return server;
}

/*------------------------------------------------------
Frontend Server: Start your frontend server
For example, serve static files from a "public" folder.
------------------------------------------------------*/
function startFrontendInstance() {
const express = require('express');
const app = express();

// Serve static files from the "public" folder (adjust as needed)
app.use(express.static('public'));

// Optionally, add other frontend middleware or routes

const server = app.listen(FRONTEND_PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${FRONTEND_PORT}`);
});

return server;
}

/*------------------------------------------------------
Function: Start Backend with Retry Logic
------------------------------------------------------*/
function startBackendWithRetry(retryCount = 0) {
checkPort(BACKEND_PORT, (inUse) => {
  if (inUse) {
    console.log(`Backend port ${BACKEND_PORT} is in use. Attempting to free it... (attempt ${retryCount + 1})`);
    killProcessOnPort(BACKEND_PORT, () => {
      setTimeout(() => {
        checkPort(BACKEND_PORT, (inUseAfterKill) => {
          if (inUseAfterKill) {
            if (retryCount < 3) {
              console.log(`Backend port ${BACKEND_PORT} still in use after kill attempt. Retrying...`);
              startBackendWithRetry(retryCount + 1);
            } else {
              console.error(`Failed to free backend port ${BACKEND_PORT} after ${retryCount + 1} attempts.`);
              process.exit(1);
            }
          } else {
            console.log(`Backend port ${BACKEND_PORT} is free after kill attempt. Starting backend server...`);
            try {
              const server = startBackendInstance();
              server.on('error', (err) => {
                console.error('Backend server error:', err);
              });
            } catch (err) {
              console.error('Error starting backend server instance:', err);
              process.exit(1);
            }
          }
        });
      }, 2000);
    });
  } else {
    console.log(`Backend port ${BACKEND_PORT} is free. Starting backend server...`);
    try {
      const server = startBackendInstance();
      server.on('error', (err) => {
        console.error('Backend server error:', err);
      });
    } catch (err) {
      console.error('Error starting backend server instance:', err);
      process.exit(1);
    }
  }
});
}

/*------------------------------------------------------
Function: Start Frontend with Retry Logic
------------------------------------------------------*/
function startFrontendWithRetry(retryCount = 0) {
checkPort(FRONTEND_PORT, (inUse) => {
  if (inUse) {
    console.log(`Frontend port ${FRONTEND_PORT} is in use. Attempting to free it... (attempt ${retryCount + 1})`);
    killProcessOnPort(FRONTEND_PORT, () => {
      setTimeout(() => {
        checkPort(FRONTEND_PORT, (inUseAfterKill) => {
          if (inUseAfterKill) {
            if (retryCount < 3) {
              console.log(`Frontend port ${FRONTEND_PORT} still in use after kill attempt. Retrying...`);
              startFrontendWithRetry(retryCount + 1);
            } else {
              console.error(`Failed to free frontend port ${FRONTEND_PORT} after ${retryCount + 1} attempts.`);
              process.exit(1);
            }
          } else {
            console.log(`Frontend port ${FRONTEND_PORT} is free after kill attempt. Starting frontend server...`);
            try {
              const server = startFrontendInstance();
              server.on('error', (err) => {
                console.error('Frontend server error:', err);
              });
            } catch (err) {
              console.error('Error starting frontend server instance:', err);
              process.exit(1);
            }
          }
        });
      }, 2000);
    });
  } else {
    console.log(`Frontend port ${FRONTEND_PORT} is free. Starting frontend server...`);
    try {
      const server = startFrontendInstance();
      server.on('error', (err) => {
        console.error('Frontend server error:', err);
      });
    } catch (err) {
      console.error('Error starting frontend server instance:', err);
      process.exit(1);
    }
  }
});
}

/*------------------------------------------------------
Launcher: Start Both Frontend and Backend
------------------------------------------------------*/
killProcessOnPort(FRONTEND_PORT, () => {
  console.log(`Frontend process on port ${FRONTEND_PORT} has been terminated.`);
});
startBackendWithRetry();

