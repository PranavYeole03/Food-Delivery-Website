import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemByCity from "./hooks/useGetItemByCity";
import CartPages from "./pages/CartPages";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrderPage from "./pages/TrackOrderPage";
import ShopItems from "./pages/ShopItems";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { setSocket } from "./redux/userSlice";

export const serverUrl = "https://food-delivery-website-backend-y8v8.onrender.com";

const App = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyOrders();
  useUpdateLocation();

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));
    socketInstance.on("connect", (socket) => {
      if (userData) {
        socketInstance.emit("identity", { userId: userData._id });
      }
    });
    return ()=>{
      socketInstance.disconnect()
    }
  }, [userData?._id]);
  return (
    <Routes>
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/"} />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to={"/"} />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/create-edit-Shop"
        element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/add-items"
        element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/edit-items/:itemId"
        element={userData ? <EditItem /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/cart"
        element={userData ? <CartPages /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/checkOut"
        element={userData ? <CheckOut /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/order-place"
        element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/my-order"
        element={userData ? <MyOrders /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/shop-items/:shopId"
        element={userData ? <ShopItems /> : <Navigate to={"/signin"} />}
      />
    </Routes>
  );
};

export default App;
