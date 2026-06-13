import React from "react";
import { useEffect } from "react";
import api from "../api/axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await api.get(`${serverUrl}/api/order/my-order`, {
          withCredentials: true,
        });

        dispatch(setMyOrders(result.data));
        // 
      } catch (error) {
        
      }
    };

    fetchOrder();
  }, [dispatch, userData]);
};

export default useGetMyOrders;

