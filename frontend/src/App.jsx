
import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { socket } from "./socket";
import { Toaster } from "react-hot-toast";

// Pages
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import CartPages from "./pages/CartPages";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import TrackOrderPage from "./pages/TrackOrderPage";
import ShopItems from "./pages/ShopItems";
import Analytics from "./pages/Analytics";
import AppInfo from "./pages/AppInfo";
import Wallet from "./pages/Wallet";

// Hooks
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemByCity from "./hooks/useGetItemByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import useNetwork from "./hooks/useNetwork";

// Layout
import OwnerLayout from "./components/OwnerLayout";
import OwnerDashboard from "./components/OwnerDashboard";
import { serverUrl } from "./config";

export { serverUrl };

const App = () => {
  const { userData } = useSelector((state) => state.user);
  const isOnline = useNetwork();

  // Hooks
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyOrders();
  useUpdateLocation();

  // ✅ Socket
  useEffect(() => {
    if (userData) {
      socket.connect();

      socket.emit("identity", {
        userId: userData._id,
        role: userData.role,
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [userData]);

  return (
    <>
      <div className={!isOnline ? "pt-10" : ""}>
        <Routes>

          {/* AUTH */}
          <Route
            path="/signup"
            element={!userData ? <SignUp /> : <Navigate to="/" />}
          />
          <Route
            path="/signin"
            element={!userData ? <SignIn /> : <Navigate to="/" />}
          />
          <Route
            path="/forgot-password"
            element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
          />



          {/* USER */}
          <Route
            path="/"
            element={
              userData
                ? userData.role === "owner"
                  ? <Navigate to="/owner" />
                  : <Home />
                : <Navigate to="/signin" />
            }
          />

          <Route path="/cart" element={<CartPages />} />
          <Route path="/checkOut" element={<CheckOut />} />
          <Route path="/order-placed" element={<OrderPlaced />} />
          <Route path="/track-order/:orderId" element={<TrackOrderPage />} />
          <Route path="/shop-items/:shopId" element={<ShopItems />} />
          <Route path="/wallet" element={userData ? <Wallet /> : <Navigate to="/signin" />} />

          {/* ✅ USER MY ORDERS */}
          <Route
            path="/my-order"
            element={userData ? <MyOrders /> : <Navigate to="/signin" />}
          />

          {/* OWNER */}
          <Route element={userData ? <OwnerLayout /> : <Navigate to="/signin" />}>

            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/add-items" element={<AddItem />} />
            <Route path="/owner/edit-items/:itemId" element={<EditItem />} />
            <Route path="/owner/create-shop" element={<CreateEditShop />} />
            <Route path="/owner/analytics" element={<Analytics />} />
            <Route path="/owner/app-info" element={<AppInfo />} />
            {/* ✅ THIS LINE MUST BE HERE */}

          </Route>

        </Routes>
      </div>
    </>
  );
};
  
export default App;
