import { useEffect } from "react";
// import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  useEffect(() => {
    if (!navigator.geolocation || !apiKey) {
      dispatch(setCurrentCity(null));
      dispatch(setCurrentState(null));
      dispatch(setCurrentAddress(null));
      dispatch(setAddress(null));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          dispatch(setLocation({ lat: latitude, lon: longitude }));
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );
          const address = result?.data?.results?.[0];

          dispatch(setCurrentCity(address?.city || address?.county || null));
          dispatch(setCurrentState(address?.state || null));
          dispatch(
            setCurrentAddress(address?.address_line2 || address?.address_line1 || null)
          );
          dispatch(setAddress(address?.address_line2 || address?.address_line1 || null));
        } catch (error) {
          dispatch(setCurrentCity(null));
          dispatch(setCurrentState(null));
          dispatch(setCurrentAddress(null));
          dispatch(setAddress(null));
        }
      },
      () => {
        dispatch(setCurrentCity(null));
        dispatch(setCurrentState(null));
        dispatch(setCurrentAddress(null));
        dispatch(setAddress(null));
      }
    );
  }, [dispatch, apiKey, userData]);
}

export default useGetCity;
