import React from "react";
import sccooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: sccooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const custeomerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const DeliveryBoyTracking = ({ data }) => {
  const deliveryBoyLat = data.deliveryBoyLocation.lat;
  const deliveryBoyLon = data.deliveryBoyLocation.lon;
  const customerLatitude = data.customerLocation.lat;
  const customerLongitude = data.customerLocation.lon;

  const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [customerLatitude, customerLongitude],
  ];

  const center = [deliveryBoyLat, deliveryBoyLon];

  return (
    <div className="w-full h-64 mt-3 rounded-xl overflow-hidden shadow-md">
    {/* <div className="h-64 w-full flex items-center justify-center"> */}
      <MapContainer className="w-full h-full" center={center} zoom={16}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[deliveryBoyLat, deliveryBoyLon]}
          icon={deliveryBoyIcon}
        >
          <Popup>Delivery Boy</Popup>
        </Marker>

        <Marker
          position={[customerLatitude, customerLongitude]}
          icon={custeomerIcon}
        >
          <Popup>Customer</Popup>
        </Marker>
        <Polyline positions={path} color="blue" fontWeight={4} />
      </MapContainer>
    </div>
  );
};

export default DeliveryBoyTracking;
