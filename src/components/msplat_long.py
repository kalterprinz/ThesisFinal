import json 
from shapely.geometry import shape

# Load GeoJSON file
geojson_file = '/src/components/iliganmap.json'
with open(geojson_file, 'r') as f:
    data = json.load(f)

# Extract centroids for each feature
barangay_centroids = []
for feature in data['features']:
    polygon = shape(feature['geometry'])
    centroid = polygon.centroid
    barangay_centroids.append({
        "name": feature['properties']['adm4_en'],
        "latitude": centroid.y,
        "longitude": centroid.x
    })

# Display the centroids
barangay_centroids
