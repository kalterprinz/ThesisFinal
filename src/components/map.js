import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import iliganData from './iliganmap.json';
import "./all2.css";
import "leaflet/dist/leaflet.css";

const MapPage = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [geoJsonData] = useState(iliganData);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
      const fetchTrafficData = async () => {
          try {
              const trafficCollection = collection(db, "records");
              const snapshot = await getDocs(trafficCollection);

              const aggregated = snapshot.docs.reduce((acc, doc) => {
                  const place = normalizeString(doc.data().placeOfViolation);
                  if (place) {
                      acc[place] = (acc[place] || 0) + 1;
                  }
                  return acc;
              }, {});

              const trafficList = Object.keys(aggregated).map(barangay => ({
                  barangay,
                  count: aggregated[barangay],
              }));

              setTrafficData(trafficList);
              setIsLoading(false); // Data loaded
          } catch (error) {
              console.error("Error fetching traffic data: ", error);
          }
      };

      fetchTrafficData();
  }, []);

  const normalizeString = (str) => str?.toUpperCase().trim();
        //kirk selwyn miguel fuentevilla ycong
        //normailah macala
        //cate melody dalis
  const getTrafficCount = (barangayName) => {
      const normalizedBarangay = normalizeString(barangayName);
      const found = trafficData.find(data => normalizeString(data.barangay) === normalizedBarangay);
      return found ? found.count : 0;
  };

  const getColor = (count) => {
      if (count > 50) return '#800026';
      if (count > 30) return '#BD0026';
      if (count > 10) return '#E31A1C';
      if (count > 5) return '#FC4E2A';
      if (count > 0) return '#FEB24C';
      return '#FFEDA0';
  };

  const styleFeature = (feature) => {
    const barangayName = normalizeString(feature.properties.adm4_en);
    const trafficCount = getTrafficCount(barangayName);

    return {
        fillColor: getColor(trafficCount),
        weight: 1,
        color: 'gray',
        fillOpacity: 0.7
    };
};

const onEachFeature = (feature, layer) => {
    const barangayName = normalizeString(feature.properties.adm4_en);
    const trafficCount = getTrafficCount(barangayName);

    layer.bindTooltip(
        `<strong>${feature.properties.adm4_en}</strong><br>Traffic Violations: ${trafficCount}`,
        { direction: "center", className: "custom-tooltip", permanent: false }
    );
};

  return (
    <div className="map-page">
      <div className="map-description">
        <h3>Traffic Violation Map of Iligan City</h3>
        <p>Explore the traffic violation data for various barangays in Iligan City.</p>
        <p>This interactive map displays traffic violation data across the 44 barangays of Iligan City. 
          Each barangay is represented on the map, and you can hover over any barangay to view the number of traffic violations that have taken place there. 
          The data shown on the map helps to visualize the distribution of traffic violations throughout the city, 
          providing insights into areas with higher or lower rates of traffic offenses.
        </p>
        <p>
          Hover over each barangay to view the number of traffic violations that have taken place.
        </p>
      </div>
      <div style={{ flex: 2 }}>
      <div className="map-container"> 
        <MapContainer center={[8.246, 124.268]} zoom={12} className="leaflet-container">
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
            />
            {!isLoading && (
                <GeoJSON
                    data={geoJsonData}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                />
            )}
        </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
