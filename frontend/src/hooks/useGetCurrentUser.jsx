import React from "react";
import { useEffect } from "react";
import { serverUrl } from "../App";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { clearAuthStorage, getAuthToken } from "../utils/authToken";

function useGetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      if (!getAuthToken()) {
        dispatch(setUserData(null));
        return;
      }

      try {
        const result = await api.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data));
      } catch {
        clearAuthStorage();
        dispatch(setUserData(null));
      }
    };
    fetchUser();
  }, [dispatch]);
}

export default useGetCurrentUser;

