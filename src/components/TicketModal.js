import React, { useState, useEffect } from "react";

const TicketModal = ({ isModalOpen, handleCloseModal, qrCodeData }) => {
  const [formState, setFormState] = useState({
    ticketNumber: '',
    dateOfApprehension: '',
    timeOfApprehension: '',
    nameOfDriver: '',
    gender: '',
    age: '',
    vehicleClassification: '',
    placeOfViolation: '',
    violationType: '',
    recordSource: '',
    violationDes: '',
    fineStatus: '',
    dateOfBirth: '',
  });

  //kirk selwyn miguel fuentevilla ycong
  //normailah macala
  //cate melody dalis
  
  // Update form state when qrCodeData is available
  useEffect(() => {
    if (qrCodeData) {
      setFormState((prevState) => ({
        ...prevState,
        ticketNumber: qrCodeData.ticketNumber || prevState.ticketNumber,
        dateOfApprehension: qrCodeData.dateOfApprehension || prevState.dateOfApprehension,
        timeOfApprehension: qrCodeData.timeOfApprehension || prevState.timeOfApprehension,
        nameOfDriver: qrCodeData.name || prevState.nameOfDriver, // Setting the name from QR code
        gender: qrCodeData.gender || prevState.gender,
        age: qrCodeData.age || prevState.age,
        vehicleClassification: qrCodeData.vehicleClassification || prevState.vehicleClassification,
        placeOfViolation: qrCodeData.placeOfViolation || prevState.placeOfViolation,
        violationType: qrCodeData.violationType || prevState.violationType,
        recordSource: qrCodeData.recordSource || prevState.recordSource,
        violationDes: qrCodeData.violationDes || prevState.violationDes,
        fineStatus: qrCodeData.fineStatus || prevState.fineStatus,
        dateOfBirth: qrCodeData.dateOfBirth || prevState.dateOfBirth,
      }));
    }
  }, [qrCodeData]); // Trigger when qrCodeData changes


  const handleQrCodeScan = (data) => {
    // Assuming `data` contains the parsed QR code info
    setQrCodeData(data);
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility
  const [records, setRecords] = useState([]);
  const [ticketNumber, setTicketNumber] = useState("");
  const [dateOfApprehension, setDateOfApprehension] = useState("");
  const [timeOfApprehension, setTimeOfApprehension] = useState("");
  const [nameOfDriver, setNameOfDriver] = useState("");
  const [placeOfViolation, setPlaceOfViolation] = useState("");
  const [violationType, setViolationType] = useState("");
  const [violationTypes, setViolationTypes] = useState([
    "Driving without a valid license",
    "Unregistered vehicles",
    "Invalid or tampered vehicle plates",
    "Failure to carry the Official Receipt (OR) and Certificate of Registration (CR).",
    "Driving without a valid license",
    "No or expired vehicle insurance",
    "Failure to install early warning devices (EWDs)",
    "Non-compliance with seatbelt laws",
    "Overspeeding",
    "Reckless Driving",
    "Driving under the influence (DUI)",
    "Counterflow or overtaking in prohibited areas",
    "Disobeying traffic signs or signals",
    "Illegal parking",
    "Obstruction violations",
    "Use of a private vehicle for public transport without proper franchise",
    "Worn-out tires or other safety hazards",
    "No helmet ",
    "Carrying children under 7 years old as passengers",
    "Illegal use of motorcycle lanes",
    "Riding with more than one passenger",
    "Use of mobile phones while driving",
    "Operating other distracting devices while driving",
    "Failure to yield to pedestrians at marked crossings",
    "Parking on sidewalks, pedestrian lanes, or bike lanes",
    "Blocking fire lanes or emergency exits",
    "No loading/unloading in designated zones",
    "Unauthorized tricycle routes",
    "Illegal use of restricted roads for certain vehicles",
    "Failure to follow one-way street designations",
    "Smoke belching",
    "Idling for extended periods in prohibited zones",
    "Illegal dumping of waste from vehicles",
    "Fake or forged documents",
    "Failure to renew driver’s license or vehicle registration on time",
    "Carrying firearms or illegal substances in vehicles",
    "Transporting contraband or overloaded vehicles",
  ]);
  const [violationDes, setViolationDes]= useState("");
  const [fineStatus, setFineStatus] = useState("");
  const [apprehendingOfficer, setApprehendingOfficer] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [vehicleClassification, setVehicleClassification] = useState("");
  const navigate = useNavigate();

  const generateTicketNumber = () => {
    return `T-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  };
  const handleViewMore = (record) => {
    navigate(`/viewmore/${record.id}`, { state: record }); // Redirect with data
  };

   // Function to toggle sidebar
   const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
   };

  const handleAddViolation = () => {
    if (
      formState.violationType?.trim() && // Safeguard for non-string values
      !violationTypes.includes(formState.violationType)
    ) {
      setViolationTypes([...violationTypes, formState.violationType]);
    }
  };

  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const openModal = () => {
    setFormState({
      ...formState,
      ticketNumber: generateTicketNumber(),
    });
    setSelectedData(null);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleCsvData = (data) => {
    setRecords(data);
  };

  const [genderData, setGenderData] = useState({ Male: 0, Female: 0 });
  const [ageData, setAgeData] = useState([0, 0, 0, 0, 0]); // [0-18, 19-30, 31-40, 41-50, 51+]
  const [fineStatusData, setFineStatusData] = useState({ Paid: 0, Unpaid: 0 });
  const [vehicleClassificationData, setVehicleClassificationData] = useState({});//doughnut
  const [violationTypeData, setViolationTypeData] = useState({});//doughnut
  const [vehicleClassificationDataC, setVehicleClassificationDataC] = useState({}); //card
  const [violationTypeDataC, setViolationTypeDataC] = useState({});//card



  const [filteredData, setFilteredData] = useState([]);
// Function to fetch data for gender, fine status, and age groups
const fetchDemographicData = async (dataList) => {
  // Process gender data
  const genderCounts = dataList.reduce(
    (acc, record) => {
      if (record.gender === "Male") acc.Male += 1;
      if (record.gender === "Female") acc.Female += 1;
      return acc;
    },
    { Male: 0, Female: 0 }
  );
  setGenderData(genderCounts);

  // Process fine status data
  const fineStatusCounts = dataList.reduce(
    (acc, record) => {
      if (record.fineStatus === "Paid") acc.Paid += 1;
      if (record.fineStatus === "Unpaid") acc.Unpaid += 1;
      return acc;
    },
    { Paid: 0, Unpaid: 0 }
  );
  setFineStatusData(fineStatusCounts);

  // Process age data (grouping by age ranges)
  const ageCounts = [0, 0, 0, 0, 0]; // [0-18, 19-30, 31-40, 41-50, 51+]
  dataList.forEach((record) => {
    const age = record.age;
    if (age >= 0 && age <= 18) ageCounts[0] += 1;
    else if (age >= 19 && age <= 30) ageCounts[1] += 1;
    else if (age >= 31 && age <= 40) ageCounts[2] += 1;
    else if (age >= 41 && age <= 50) ageCounts[3] += 1;
    else if (age >= 51) ageCounts[4] += 1;
  });
  setAgeData(ageCounts);
};

// Function to fetch data for doughnut charts
const fetchDoughnutData = async (dataList) => {
  // Process vehicle classification data
  const vehicleCounts = {};
  dataList.forEach((record) => {
    const vehicle = record.vehicleClassification;
    if (vehicle) {
      vehicleCounts[vehicle] = vehicleCounts[vehicle] ? vehicleCounts[vehicle] + 1 : 1;
    }
  });
  setVehicleClassificationData(vehicleCounts);

  // Process violation type data dynamically
  const violationCounts = {};
  dataList.forEach((record) => {
    const violation = record.violationType;
    if (violation) {
      violationCounts[violation] = violationCounts[violation] ? violationCounts[violation] + 1 : 1;
    }
  });
  setViolationTypeData(violationCounts);
};

// Function to fetch data for cards
const fetchCardData = async (dataList) => {
  // Process vehicle classification data for cards
  const vehicleCountsC = {};
  dataList.forEach((record) => {
    const vehicle = record.vehicleClassification;
    if (vehicle) {
      vehicleCountsC[vehicle] = vehicleCountsC[vehicle] ? vehicleCountsC[vehicle] + 1 : 1;
    }
  });
  const highestVehicleClassification = Object.keys(vehicleCountsC).reduce((a, b) =>
    vehicleCountsC[a] > vehicleCountsC[b] ? a : b
  );
  const highestVehicleCountC = vehicleCountsC[highestVehicleClassification];
  setMostCommonVehicle({ count: highestVehicleCountC, classification: highestVehicleClassification });

  // Process violation type data for cards
  const violationCountsC = {};
  dataList.forEach((record) => {
    const violation = record.violationType;
    if (violation) {
      violationCountsC[violation] = violationCountsC[violation] ? violationCountsC[violation] + 1 : 1;
    }
  });
  const highestViolationTypeC = Object.keys(violationCountsC).reduce((a, b) =>
    violationCountsC[a] > violationCountsC[b] ? a : b
  );
  const highestViolationCount = violationCountsC[highestViolationTypeC];
  setMostCommonViolation({ count: highestViolationCount, type: highestViolationTypeC });

  // Calculate the total number of violations per place of violation
  const placeCounts = {};
  dataList.forEach((record) => {
    const place = record.placeOfViolation;
    if (place) {
      placeCounts[place] = placeCounts[place] ? placeCounts[place] + 1 : 1;
    }
  });
  const top3Places = Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([place, count]) => ({ place, count }));
  setTop3Places(top3Places);
};

// Main fetch function
const fetchData = async () => {
  const recordsCollection = collection(db, "records");
  const recordsSnapshot = await getDocs(recordsCollection);
  const dataList = recordsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setRecords(dataList);
  setFilteredData(dataList);

  // Fetch data for different purposes
  fetchDemographicData(dataList);
  fetchDoughnutData(dataList);
  fetchCardData(dataList);
};

useEffect(() => {
  fetchData();
}, []);

const [mostCommonViolation, setMostCommonViolation] = useState({ count: 0, type: "" });
const [mostCommonVehicle, setMostCommonVehicle] = useState({ count: 0, classification: "" });
const [top3Places, setTop3Places] = useState([]);
const totalViolations = records.length; // Use `records` state to calculate this.

  const handleDelete = async (id) => {
    const recordsDocRef = doc(db, "records", id);
    try {
      await deleteDoc(recordsDocRef);
      setRecords(records.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (selectedData) {
        const recordDocRef = doc(db, "records", selectedData.id);
        await updateDoc(recordDocRef, formState);
        alert("Data updated successfully!");
      } else {
        await addDoc(collection(db, "records"), formState);
        alert("Data added successfully!");
      }
  
      setFormState({
        ticketNumber: "",
        dateOfApprehension: "",
        timeOfApprehension: "",
        nameOfDriver: "",
        gender: "",
        age: "",
        vehicleClassification: "",
        placeOfViolation: "",
        violationType: "",
        violationDes: "",
        fineStatus: "",
        apprehendingOfficer: ""
      });
      setSelectedData(null);
      closeModal();
    } catch (error) {
      console.error("Error adding/updating document: ", error);
    }
  };

  const handleEdit = (record) => {
    setSelectedData(record);
    setFormState({
      ticketNumber: record.ticketNumber,
      dateOfApprehension: record.dateOfApprehension,
      timeOfApprehension: record.timeOfApprehension,
      nameOfDriver: record.nameOfDriver,
      gender: record.gender,
      age: record.age,
      vehicleClassification: record.vehicleClassification,
      placeOfViolation: record.placeOfViolation,
      violationType: record.violationType,
      violationDes: record.violationDes,
      fineStatus: record.fineStatus,
      apprehendingOfficer: record.apprehendingOfficer
    });
    openModal();
  };

  //search
  const [searchQuery, setSearchQuery] = useState("");
// Handle search input change
const handleSearchChange = (event) => {
  setSearchQuery(event.target.value);
  setCurrentPage(1); // Reset to first page when searching
};

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const filteredRecords = records.filter((record) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      record.ticketNumber.toString().toLowerCase().includes(lowerCaseQuery) ||
      record.nameOfDriver.toLowerCase().includes(lowerCaseQuery) ||
      record.vehicleClassification.toLowerCase().includes(lowerCaseQuery) ||
      record.placeOfViolation.toLowerCase().includes(lowerCaseQuery) ||
      record.violationType.toLowerCase().includes(lowerCaseQuery) ||
      record.apprehendingOfficer.toLowerCase().includes(lowerCaseQuery)
    );
  });

  // Sort the filtered records dynamically
const sortedRecords = [...filteredRecords].sort((a, b) => {
  if (!sortConfig.key) return 0; // No sorting if no key is selected
  if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1;
  if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1;
  return 0;
});


  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPageData = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

const goToNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage((prevPage) => prevPage + 1);
  }
};

const goToPreviousPage = () => {
  if (currentPage > 1) {
    setCurrentPage((prevPage) => prevPage - 1);
  }
};

const handlePageClick = (pageNumber) => {
  setCurrentPage(pageNumber);
};

useEffect(()=> {
  setFilteredData(records);
},[records]);

useEffect(() => {
  const lowerCaseQuery = searchQuery.toLowerCase();

  // Filter records based on the search query
  const filtered = records.filter((record) => {
    return (
      record.ticketNumber.toString().toLowerCase().includes(lowerCaseQuery) ||
      record.nameOfDriver.toLowerCase().includes(lowerCaseQuery) ||
      record.vehicleClassification.toLowerCase().includes(lowerCaseQuery) ||
      record.placeOfViolation.toLowerCase().includes(lowerCaseQuery) ||
      record.violationType.toLowerCase().includes(lowerCaseQuery) ||
      record.apprehendingOfficer.toLowerCase().includes(lowerCaseQuery)
    );
  });

  setFilteredData(filtered);
  setCurrentPage(1); // Reset to the first page when filtering
}, [searchQuery, records]);

useEffect(() => {
  if (sortConfig.key) {
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    setFilteredData(sortedData);
  }
}, [sortConfig, filteredData]);
  

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    isModalOpen && (
      <div className="modal">
        <div className="modal-content">
          <button onClick={handleCloseModal}>Close</button>
          <form onSubmit={handleSubmit}>
            {/* Ticket Number */}
            <label htmlFor="ticket-id">Ticket Number/ID</label>
            <input
              id="ticket-id"
              type="text"
              value={formState.ticketNumber || ''}
              disabled
              required
            />

            {/* Date of Apprehension */}
            <label htmlFor="dateOfApprehension">Date of Apprehension</label>
            <input
              id="dateOfApprehension"
              type="text"
              value={formState.dateOfApprehension || ''}
              onChange={(e) => setFormState({ ...formState, dateOfApprehension: e.target.value })}
            />

            {/* Name of Driver */}
            <label htmlFor="nameOfDriver">Name of Driver</label>
            <input
              id="nameOfDriver"
              type="text"
              value={formState.nameOfDriver || ''}
              onChange={(e) => setFormState({ ...formState, nameOfDriver: e.target.value })}
            />

            {/* Other form fields... */}

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    )
  );
};

export default TicketModal;