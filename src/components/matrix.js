  import React, { useState, useEffect } from "react";
  import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faXmark,faArrowUpAZ, faArrowDownAZ, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
  import axios from "axios";
  import "./matrix.css";
  import { useNavigate } from "react-router-dom";


  const barangaysList = [
      { id: "barangay-1", name: "ABUNO", assignedOfficer: [] },
      { id: "barangay-2", name: "ACMAC-MARIANO BADELLES SR.", assignedOfficer: [] },
      { id: "barangay-3", name: "BAGONG SILANG", assignedOfficer: [] },
      { id: "barangay-4", name: "BONBONON", assignedOfficer: [] },
      { id: "barangay-5", name: "BUNAWAN", assignedOfficer: [] },
      { id: "barangay-6", name: "BURU-UN", assignedOfficer: [] },
      { id: "barangay-7", name: "DALIPUGA", assignedOfficer: [] },
      { id: "barangay-8", name: "DEL CARMEN", assignedOfficer: [] },
      { id: "barangay-9", name: "DIGKILAAN", assignedOfficer: [] },
      { id: "barangay-10", name: "DITUCALAN", assignedOfficer: [] },
      { id: "barangay-11", name: "DULAG", assignedOfficer: [] },
      { id: "barangay-12", name: "HINAPLANON", assignedOfficer: [] },
      { id: "barangay-13", name: "HINDANG", assignedOfficer: [] },
      { id: "barangay-14", name: "KABACSANAN", assignedOfficer: [] },
      { id: "barangay-15", name: "KALILANGAN", assignedOfficer: [] },
      { id: "barangay-16", name: "KIWALAN", assignedOfficer: [] },
      { id: "barangay-17", name: "LANIPAO", assignedOfficer: [] },
      { id: "barangay-18", name: "LUINAB", assignedOfficer: [] },
      { id: "barangay-19", name: "MAHAYAHAY", assignedOfficer: [] },
      { id: "barangay-20", name: "MAINIT", assignedOfficer: [] },
      { id: "barangay-21", name: "MANDULOG", assignedOfficer: [] },
      { id: "barangay-22", name: "MARIA CRISTINA", assignedOfficer: [] },
      { id: "barangay-23", name: "PALAO", assignedOfficer: [] },
      { id: "barangay-24", name: "PANOROGANAN", assignedOfficer: [] },
      { id: "barangay-25", name: "POBLACION", assignedOfficer: [] },
      { id: "barangay-26", name: "PUGA-AN", assignedOfficer: [] },
      { id: "barangay-27", name: "ROGONGON", assignedOfficer: [] },
      { id: "barangay-28", name: "SAN MIGUEL", assignedOfficer: [] },
      { id: "barangay-29", name: "SAN ROQUE", assignedOfficer: [] },
      { id: "barangay-30", name: "SANTA ELENA", assignedOfficer: [] },
      { id: "barangay-31", name: "SANTA FILOMENA", assignedOfficer: [] },
      { id: "barangay-32", name: "SANTIAGO", assignedOfficer: [] },
      { id: "barangay-33", name: "SANTO ROSARIO", assignedOfficer: [] },
      { id: "barangay-34", name: "SARAY", assignedOfficer: [] },
      { id: "barangay-35", name: "SUAREZ", assignedOfficer: [] },
      { id: "barangay-36", name: "TAMBACAN", assignedOfficer: [] },
      { id: "barangay-37", name: "TIBANGA", assignedOfficer: [] },
      { id: "barangay-38", name: "TIPANOY", assignedOfficer: [] },
      { id: "barangay-39", name: "TOMAS CABILI", assignedOfficer: [] },
      { id: "barangay-40", name: "TUBOD", assignedOfficer: [] },
      { id: "barangay-41", name: "UBALDO LAYA", assignedOfficer: [] },
      { id: "barangay-42", name: "UPPER HINAPLANON", assignedOfficer: [] },
      { id: "barangay-43", name: "UPPER TOMINOBO", assignedOfficer: [] },
      { id: "barangay-44", name: "VILLA VERDE", assignedOfficer: [] },
    ];  

  const OfficerMatrix = () => {
    const [officers, setOfficers] = useState([]);
    const [barangays, setBarangays] = useState(barangaysList);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAsc, setIsAsc] = useState(true);
    const navigate = useNavigate();

    //kirk selwyn miguel fuentevilla ycong
    //normailah macala
    //cate melody dalis

    useEffect(() => {
          const checkAuthentication = async () => {
            const driverId = localStorage.getItem('driverId');
      
            if (driverId) {
              // Check if driverId exists in the drivers' database
              const driverResponse = await fetch(`http://localhost:3001/getDriverById2/${driverId}`);
              if (driverResponse.ok) {
                  console.log(`Driver found with id ${driverId}.`);
                  navigate('/');
                return;
              }
      
              // If not found in drivers, check in officers' database
              const officerResponse = await fetch(`http://localhost:3001/getOfficerById/${driverId}`);
              if (officerResponse.ok) {
                const officerData = await officerResponse.json();
                // Navigate based on officer's role
                if (officerData.role === 'Admin') {
                  console.log(`Admin found with id ${driverId}.`);
                  
                } else if (officerData.role === 'Officer') {
                  console.log(`Officer found with id ${driverId}.`);
                  navigate('/officerDashboard');
                } else if (officerData.role === 'Treasurer') {
                  console.log(`Treasurer found with id ${driverId}.`);
                  navigate('/treasurerdashboard');
                } else {
                  // Role not recognized; remove driverId and navigate to home
                  localStorage.removeItem('driverId');
                  navigate('/');
                }
                return;
              }
            }
      
            // If driverId is not found in either database
            localStorage.removeItem('driverId');
            navigate('/');
          };
      
          checkAuthentication();
        }, [navigate]);
    

    useEffect(() => {
      const fetchAdminAndOfficers = async () => {
        try {
          const adminId = localStorage.getItem("driverId");
          if (!adminId) {
            console.error("No admin ID found in local storage.");
            return;
          }
    
          // Get the admin details
          const adminRes = await axios.get(`http://localhost:3001/getOfficerById/${adminId}`);
          const adminAgency = adminRes.data.agency;
    
          // Get all officers
          const response = await axios.get("http://localhost:3001/getOfficer");
    
          // Filter officers based on matching agency
          const filteredByAgency = response.data.filter(officer => officer.agency === adminAgency);
    
          const simplifiedOfficers = filteredByAgency.map((officer) => ({
            id: officer._id,
            name: officer.name,
            assign: officer.assign,
            agency: officer.agency,
          }));
    
          // Split into unassigned and assigned
          const unassigned = simplifiedOfficers.filter(o => !o.assign);
          const updatedBarangays = barangaysList.map(barangay => {
            const matchingOfficers = simplifiedOfficers.filter(
              (officer) =>
                officer.assign &&
                officer.assign.toLowerCase() === barangay.name.toLowerCase()
            );
            return { ...barangay, assignedOfficers: matchingOfficers };
          });
    
          setOfficers(unassigned);
          setBarangays(updatedBarangays);
        } catch (error) {
          console.error("Error fetching admin or officers:", error);
        }
      };
    
      fetchAdminAndOfficers();
    }, []);
    
    
    const capitalize = (str) =>
      str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

        
        const updateOfficerAssign = async (officerId, barangayName) => {
          console.log("Updating assign for", officerId, "to", barangayName);

          try {
            await axios.put("http://localhost:3001/updateAssign", {
              id: officerId,
              assign: barangayName,
            });
          } catch (error) {
            console.error("Failed to update officer assign:", error);
          }
        };
        
        const updateOfficerDutyStatus = async (officerId, status) => {
          try {
            await axios.put(`http://localhost:3001/updateOfficerDutyStatus/${officerId}`, {
              dutyStatus: status,
            });
          } catch (error) {
            console.error("Failed to update officer duty status:", error);
          }
        };
        

        const filteredOfficers = officers
        .filter((officer) =>
          officer.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) =>
          isAsc
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
      

      const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || !draggableId) return;
      
        // No change in position
        if (
          source.droppableId === destination.droppableId &&
          source.index === destination.index
        ) {
          return;
        }
      
        const draggedOfficer =
          barangays
            .flatMap((b) => b.assignedOfficers || [])
            .concat(officers)
            .find((o) => o.id === draggableId);
      
        if (!draggedOfficer) return;
      
        // Remove officer from current location
        let updatedOfficers = [...officers];
        let updatedBarangays = barangays.map((b) => ({
          ...b,
          assignedOfficers: (b.assignedOfficers || []).filter((o) => o.id !== draggableId),
        }));
      
        if (destination.droppableId === "officers") {
          // Move back to unassigned list
          updatedOfficers.push({ ...draggedOfficer, assign: null });
        
          await updateOfficerAssign(draggedOfficer.id, null);
          await updateOfficerDutyStatus(draggedOfficer.id, "Off Duty");
        }
        else {
          const barangayName = barangays.find(
            (b) => b.id === destination.droppableId
          )?.name;
        
          updatedOfficers = updatedOfficers.filter((o) => o.id !== draggableId);
        
          updatedBarangays = updatedBarangays.map((b) =>
            b.id === destination.droppableId
              ? {
                  ...b,
                  assignedOfficers: [
                    ...(b.assignedOfficers || []),
                    { ...draggedOfficer, assign: capitalize(barangayName) },
                  ],
                }
              : b
          );
        
          await updateOfficerAssign(draggedOfficer.id, capitalize(barangayName));
          await updateOfficerDutyStatus(draggedOfficer.id, "On Duty");
        }
        
        
      
        setOfficers(updatedOfficers);
        setBarangays(updatedBarangays);
      };
      
      
    
      const removeOfficerFromBarangay = async (barangayId, officerId) => {
        await updateOfficerAssign(officerId, null);
      
        const barangay = barangays.find((b) => b.id === barangayId);
        const officer = barangay.assignedOfficers.find((o) => o.id === officerId);
      
        setBarangays((prev) =>
          prev.map((b) =>
            b.id === barangayId
              ? {
                  ...b,
                  assignedOfficers: b.assignedOfficers.filter((o) => o.id !== officerId),
                }
              : b
          )
        );
        setOfficers((prev) => [...prev, { ...officer, assign: null }]);
      };
      

      const resetBarangay = async (barangayId) => {
        const barangay = barangays.find((b) => b.id === barangayId);
        if (!barangay || !barangay.assignedOfficers) return;
      
        // Update all assigned officers' status and assign
        const updates = barangay.assignedOfficers.map(async (officer) => {
          await updateOfficerAssign(officer.id, null);
          await updateOfficerDutyStatus(officer.id, "Off Duty");
        });
      
        await Promise.all(updates);
      
        // Move them to the unassigned officer list and reset the barangay
        setOfficers((prev) => [
          ...prev,
          ...barangay.assignedOfficers.map((o) => ({ ...o, assign: null })),
        ]);
      
        setBarangays((prev) =>
          prev.map((b) =>
            b.id === barangayId ? { ...b, assignedOfficers: [] } : b
          )
        );
      };
      
    

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="container">
          {/* Officers List */}
          
        <Droppable droppableId="officers">
        {(provided) => (
          <div className="officer-list" ref={provided.innerRef} {...provided.droppableProps}>
            <div className="officer-header">
              <h3>Officers</h3>
              <div className="search-sort-bar">
                <input
                  type="text"
                  placeholder="Search officer..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="officer-scroll-area">
            {filteredOfficers.map((officer, index) => (
              <Draggable key={officer.id} draggableId={officer.id} index={index}>
                {(provided) => (
                  <div
                    className="officer"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {officer.name}
                  </div>
                )}
              </Draggable>
            ))}

              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable> 

          {/* Barangay Grid */}
          <div className="barangay-grid-container">
              <div className="barangay-grid">
                {barangays.map((barangay) => (
                  <Droppable key={barangay.id} droppableId={barangay.id}>
                    {(provided) => (
                      <div className="barangay-box" ref={provided.innerRef} {...provided.droppableProps}>
                        <p>{barangay.name}</p>
                          <div className="barangay-officers-scroll">
                            {barangay.assignedOfficers && barangay.assignedOfficers.length > 0 ? (
                              barangay.assignedOfficers.map((officer, index) => (
                                <Draggable key={officer.id} draggableId={officer.id} index={index}>
                                  {(provided) => (
                                    <div
                                      className="assigned-officer"
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      {officer.name}
                                      <span
                                        className="remove-officer"
                                        onClick={() => removeOfficerFromBarangay(barangay.id, officer.id)}
                                      >
                                        <FontAwesomeIcon icon={faXmark} style={{ color: "#ffffff", marginLeft: "10px" }} />
                                      </span>
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <div className="empty">Drop Here</div>
                            )}
                          </div>
                          <div className="barangay-footer">
                            <span className="officer-count">
                              {barangay.assignedOfficers?.length || 0} Officer{barangay.assignedOfficers?.length === 1 ? '' : 's'}
                            </span>
                            <button className="reset-btn" onClick={() => resetBarangay(barangay.id)}>
                              Reset
                            </button>
                          </div>

                          {provided.placeholder}

                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
          </div>    
        </div>
      </DragDropContext>
    );
  };

  export default OfficerMatrix;