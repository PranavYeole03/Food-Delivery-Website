import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-order`, {
          withCredentials: true,
        });

        dispatch(setMyOrders(result.data));
        console.log(result.data)
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrder();
  }, [dispatch, userData]);
};

export default useGetMyOrders;
