import React from "react";
import { useEffect } from "react";
import api from "../api/axios";
import { serverUrl } from "../App";
import {  useSelector } from "react-redux";

function useUpdateLocation() {
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    const updateLocation = async (lat,lon) => {
      try {
        await api.post(
          `${serverUrl}/api/user/update-location`,
          { lat, lon },
          { withCredentials: true }
        );
      } catch {
        // 401 handling is centralized in the Axios interceptor.
      }
    };

    if (!userData || !navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition((pos)=>{
      updateLocation(pos.coords.latitude,pos.coords.longitude)
    })

    return () => navigator.geolocation.clearWatch(watchId);
  }, [userData]);
}

export default useUpdateLocation;

