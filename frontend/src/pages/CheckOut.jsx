import axios from "axios";
import api from "../api/axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaCreditCard,
  FaMinus,
  FaPhoneAlt,
  FaPlus,
  FaStar,
  FaTrash,
  FaShoppingBag,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoArrowBack, IoSearch } from "react-icons/io5";
import { MdDeliveryDining } from "react-icons/md";
import { TbCurrentLocation } from "react-icons/tb";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ClipLoader } from "react-spinners";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { serverUrl } from "../App";
import { setAddress, setLocation } from "../redux/mapSlice";
import { addMyOrder, removeCartItem, updateQuantity, clearCart } from "../redux/userSlice";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [18.5204, 73.8567];

const money = (value = 0) => `₹${Math.round(Number(value || 0))}`;

const getDistanceKm = (from, to) => {
  if (!from?.lat || !from?.lon || !to?.lat || !to?.lon) return 0;
  const radius = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lon - from.lon) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function FitMap({ customer }) {
  const map = useMap();

  useEffect(() => {
    if (customer?.lat && customer?.lon) {
      map.setView([customer.lat, customer.lon], 15);
    }
    setTimeout(() => map.invalidateSize(), 140);
  }, [customer, map]);

  return null;
}

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const Radio = ({ active }) => (
  <span
    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
      active ? "border-[#ff5a36] bg-[#ff5a36]/5" : "border-gray-300 bg-white"
    }`}
  >
    {active && <span className="h-2 w-2 rounded-full bg-[#ff5a36]" />}
  </span>
);

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector((state) => state.user);

  const [orderType, setOrderType] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [pickupPayment, setPickupPayment] = useState("pickup_advance");
  const [addressInput, setAddressInput] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [pickupForm, setPickupForm] = useState({
    name: userData?.fullName || "",
    mobile: userData?.mobile || "",
    instructions: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch suggestions when addressInput changes (debounced autocomplete)
  useEffect(() => {
    if (!addressInput || addressInput.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (addressInput === address) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
        );
        const features = response.data?.features || [];
        setSuggestions(features);
        setShowSuggestions(features.length > 0);
      } catch (err) {
        console.error("Error fetching autocomplete suggestions:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [addressInput, apiKey, address]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get(`${serverUrl}/api/wallet/my-wallet`, {
          withCredentials: true,
        });
        setWalletBalance(res.data?.balance || 0);
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
      }
    };
    if (userData) {
      fetchWallet();
    }
  }, [userData]);

  const firstShopId = cartItems?.[0]?.shop;
  const mainItem = cartItems?.[0];
  const km = useMemo(() => getDistanceKm(location, restaurantLocation), [location, restaurantLocation]);
  
  // Est Delivery Fee: 5% of order subtotal rounded, if under ₹500
  const deliveryFee = (orderType === "delivery" && totalAmount < 500) ? Math.round(totalAmount * 0.05) : 0;
  const deliveryTotal = Number(totalAmount || 0) + deliveryFee;
  
  const packagingFee = orderType === "selfPickup" ? 10 : 0;
  const pickupTotal = Number(totalAmount || 0) + packagingFee;
  const advance = Math.round(pickupTotal * 0.2);
  
  const pickupPayNow =
    pickupPayment === "pickup_advance"
      ? advance
      : pickupPayment === "pickup_full"
        ? pickupTotal
        : pickupPayment === "wallet_razorpay"
          ? Math.max(0, pickupTotal - walletBalance)
          : 0;
          
  const pickupRemaining = Math.max(pickupTotal - pickupPayNow - (pickupPayment === "wallet_razorpay" ? walletBalance : 0), 0);
  const finalTotal = orderType === "delivery" ? deliveryTotal : pickupTotal;

  useEffect(() => setAddressInput(address || ""), [address]);

  useEffect(() => {
    if (!firstShopId) return;
    const loadShop = async () => {
      try {
        const result = await api.get(`${serverUrl}/api/item/get-by-shop/${firstShopId}`, {
          withCredentials: true,
        });
        const shop = result.data.shop;
        setRestaurant(shop);
        if (shop?.address && apiKey) {
          const geo = await axios.get(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
              `${shop.address}, ${shop.city || ""}, ${shop.state || ""}`,
            )}&apiKey=${apiKey}`,
          );
          const props = geo.data.features?.[0]?.properties;
          if (props) setRestaurantLocation({ lat: props.lat, lon: props.lon });
        }
      } catch (err) {
        console.log(err);
      }
    };
    loadShop();
  }, [firstShopId, apiKey]);

  const reverseGeocode = async (lat, lon) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`,
      );
      const text =
        result?.data?.results?.[0]?.address_line2 ||
        result?.data?.results?.[0]?.formatted ||
        "";
      dispatch(setAddress(text));
      setAddressInput(text);
    } catch {
      setError("Unable to read this address.");
    }
  };

  const searchAddress = async () => {
    if (!addressInput.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    try {
      setError("");
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`,
      );
      const props = result.data.features?.[0]?.properties;
      if (!props) {
        setError("Address not found.");
        return;
      }
      const fullAddress = props.formatted || addressInput;
      dispatch(setLocation({ lat: props.lat, lon: props.lon }));
      dispatch(setAddress(fullAddress));
      setAddressInput(fullAddress);
      setSuggestions([]);
      setShowSuggestions(false);
    } catch {
      setError("Address search failed.");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const props = suggestion.properties;
    if (props) {
      const fullAddress = props.formatted || props.address_line2 || props.address_line1 || addressInput;
      dispatch(setLocation({ lat: props.lat, lon: props.lon }));
      dispatch(setAddress(fullAddress));
      setAddressInput(fullAddress);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleMapClick = async (lat, lon) => {
    setSuggestions([]);
    setShowSuggestions(false);
    dispatch(setLocation({ lat, lon }));
    await reverseGeocode(lat, lon);
  };

  const useCurrentLocation = () => {
    setSuggestions([]);
    setShowSuggestions(false);
    if (userData?.location?.coordinates?.length === 2) {
      const lat = userData.location.coordinates[1];
      const lon = userData.location.coordinates[0];
      dispatch(setLocation({ lat, lon }));
      reverseGeocode(lat, lon);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dispatch(setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }));
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      () => setError("Location permission is required."),
    );
  };

  const validate = () => {
    if (!cartItems?.length) return "Your cart is empty.";
    if (orderType === "delivery" && (!addressInput || !location?.lat || !location?.lon)) {
      return "Please select a delivery location.";
    }
    if (orderType === "selfPickup" && (!pickupForm.name || !pickupForm.mobile)) {
      return "Please complete pickup details.";
    }
    return "";
  };

  const orderPayload = () =>
    orderType === "delivery"
      ? {
          orderType: "delivery",
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount: deliveryTotal,
          cartItems,
        }
      : {
          orderType: "selfPickup",
          paymentMethod: pickupPayment,
          totalAmount: pickupTotal,
          pickupTimeSlot: "09:00 AM - 10:00 PM",
          pickupCustomerName: pickupForm.name,
          pickupCustomerMobile: pickupForm.mobile,
          specialInstructions: pickupForm.instructions,
          cartItems,
        };

  const openRazorpay = (orderId, razororder) => {
    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razororder.amount,
      currency: "INR",
      name: "Fletto",
      description: orderType === "selfPickup" ? "Self pickup order" : "Food delivery order",
      order_id: razororder.id,
      handler: async (response) => {
        const result = await api.post(
          `${serverUrl}/api/order/verify-payment`,
          { razorpay_payment_id: response.razorpay_payment_id, orderId },
          { withCredentials: true },
        );
        dispatch(addMyOrder(result.data));
        dispatch(clearCart());
        localStorage.removeItem("cart");
        navigate("/order-placed");
      },
    }).open();
  };

  const placeOrder = async () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    const payload = orderPayload();
    try {
      setLoading(true);
      setError("");
      const result = await api.post(`${serverUrl}/api/order/place-order`, payload, {
        withCredentials: true,
      });
      if (!result.data.razorpayOrder) {
        dispatch(addMyOrder(result.data));
        dispatch(clearCart());
        localStorage.removeItem("cart");
        navigate("/order-placed");
        return;
      }
      openRazorpay(result.data.orderId, result.data.razorpayOrder);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to place order.");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUB-COMPONENTS =================

  const Stepper = () => (
    <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-full border border-gray-150 shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-xs font-black text-emerald-600">
          1
        </span>
        <span className="text-xs font-bold text-gray-800">Cart</span>
      </div>
      <span className="text-gray-300 font-bold">•</span>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5a36] text-xs font-black text-white shadow-sm">
          2
        </span>
        <span className="text-xs font-black text-[#ff5a36]">Checkout</span>
      </div>
      <span className="text-gray-300 font-bold">•</span>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-xs font-bold text-gray-400">
          3
        </span>
        <span className="text-xs font-bold text-gray-400">Order Placed</span>
      </div>
    </div>
  );

  const DeliveryMethodSwitch = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Choose Order Method</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setOrderType("delivery")}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 duration-100 border cursor-pointer ${
            orderType === "delivery"
              ? "bg-[#ff5a36] text-white border-[#ff5a36] shadow-md shadow-orange-500/20"
              : "bg-white text-gray-500 hover:text-gray-800 border-gray-200 hover:border-gray-300"
          }`}
        >
          <span>🛵</span>
          <span>Home Delivery</span>
        </button>
        <button
          type="button"
          onClick={() => setOrderType("selfPickup")}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 duration-100 border cursor-pointer ${
            orderType === "selfPickup"
              ? "bg-[#ff5a36] text-white border-[#ff5a36] shadow-md shadow-orange-500/20"
              : "bg-white text-gray-500 hover:text-gray-800 border-gray-200 hover:border-gray-300"
          }`}
        >
          <span>🏪</span>
          <span>Self Pickup</span>
        </button>
      </div>
    </div>
  );

  const DeliveryLocationCard = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2">
          <FaLocationDot className="text-[#ff5a36]" size={16} />
          Delivery Location
        </h3>
        {/* <button type="button" className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button> */}
      </div>

      <div className="relative">
        <input
          value={addressInput}
          onChange={(event) => {
            setAddressInput(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              searchAddress();
              setShowSuggestions(false);
            }
          }}
          placeholder="123, FLAME University Path, Bavdhan Budruk, Pune"
          className="h-13.5 w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-[#ff5a36] focus:ring-1 focus:ring-orange-500/10 transition-all duration-200"
        />

        {showSuggestions && suggestions.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSuggestions(false)}
            />
            <ul className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto bg-white border border-gray-150 rounded-xl shadow-xl z-50 divide-y divide-gray-50 animate-fadeIn">
              {suggestions.map((suggestion, index) => {
                const props = suggestion.properties;
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-[#fff8f4] transition duration-150 flex items-start gap-3 cursor-pointer"
                    >
                      <span className="text-[#ff5a36] mt-0.5 shrink-0">📍</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-gray-800 leading-tight truncate">
                          {props.address_line1 || props.name || "Address match"}
                        </p>
                        {props.address_line2 && (
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">
                            {props.address_line2}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={searchAddress}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#ff5a36]/30 hover:border-[#ff5a36] bg-white text-[#ff5a36] font-bold text-xs transition active:scale-95 duration-100 shadow-sm hover:bg-[#ff5a36]/5 cursor-pointer"
        >
          <IoSearch size={15} />
          Search Location
        </button>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#ff5a36]/30 hover:border-[#ff5a36] bg-white text-[#ff5a36] font-bold text-xs transition active:scale-95 duration-100 shadow-sm hover:bg-[#ff5a36]/5 cursor-pointer"
        >
          <TbCurrentLocation size={15} />
          Use Current Location
        </button>
      </div>

      <div className="h-72 overflow-hidden rounded-2xl border border-gray-150 shadow-inner relative z-10">
        <MapContainer
          className="h-full w-full"
          center={location?.lat ? [location.lat, location.lon] : DEFAULT_CENTER}
          zoom={15}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitMap customer={location} />
          <MapClickHandler onClick={handleMapClick} />
          {location?.lat && <Marker position={[location.lat, location.lon]} />}
        </MapContainer>
      </div>

      {/* Two side-by-side metric boxes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-full shrink-0 flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-black text-gray-800 tracking-tight block">25–35 mins</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 block">Delivery Time</span>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-full shrink-0 flex items-center justify-center">
            <span className="text-lg">🛵</span>
          </div>
          <div>
            <span className="text-sm font-black text-gray-800 tracking-tight block">
              {deliveryFee > 0 ? `₹${deliveryFee}` : "FREE"}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 block">Delivery Fee</span>
          </div>
        </div>
      </div>
    </div>
  );

  const DeliveryPaymentCard = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
      <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2">
        <svg className="h-5 w-5 text-[#ff5a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Payment Method
      </h3>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setPaymentMethod("cod")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
            paymentMethod === "cod" ? "border-[#ff5a36] bg-[#fff8f4] shadow-xs" : "border-gray-150 bg-white hover:border-gray-300"
          }`}
        >
          <Radio active={paymentMethod === "cod"} />
          <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            💵
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-[#111827]">Cash On Delivery</p>
            <p className="text-xs text-gray-500 mt-0.5">Pay when your food arrives</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("online")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
            paymentMethod === "online" ? "border-[#ff5a36] bg-[#fff8f4] shadow-xs" : "border-gray-150 bg-white hover:border-gray-300"
          }`}
        >
          <Radio active={paymentMethod === "online"} />
          <div className="h-10 w-10 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            💳
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-[#111827]">UPI / Credit / Debit Card</p>
            <p className="text-xs text-gray-500 mt-0.5">Pay securely online</p>
          </div>
        </button>

        {walletBalance >= deliveryTotal ? (
          <button
            type="button"
            onClick={() => setPaymentMethod("wallet")}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
              paymentMethod === "wallet" ? "border-[#ff5a36] bg-[#fff8f4] shadow-xs" : "border-gray-150 bg-white hover:border-gray-300"
            }`}
          >
            <Radio active={paymentMethod === "wallet"} />
            <div className="h-10 w-10 shrink-0 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
              💼
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-[#111827]">Fletto Wallet</p>
                <span className="rounded-full bg-[#ccefd4] px-2 py-0.5 text-[9px] font-black text-[#18823a] uppercase">100% Paid</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Pay fully using wallet (Balance: ₹{walletBalance})</p>
            </div>
          </button>
        ) : (
          walletBalance > 0 && (
            <button
              type="button"
              onClick={() => setPaymentMethod("wallet_razorpay")}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                paymentMethod === "wallet_razorpay" ? "border-[#ff5a36] bg-[#fff8f4] shadow-xs" : "border-gray-150 bg-white hover:border-gray-300"
              }`}
            >
              <Radio active={paymentMethod === "wallet_razorpay"} />
              <div className="h-10 w-10 shrink-0 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                💼
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-[#111827]">Wallet + Online Payment</p>
                  <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-700 uppercase">Partial Wallet</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Pay ₹{walletBalance} from Wallet & remaining ₹{deliveryTotal - walletBalance} online</p>
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );

  const RestaurantDetailsCard = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2">
        <FaLocationDot className="text-[#ff5a36]" size={16} />
        Restaurant Details
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-5">
        <img
          src={restaurant?.image || mainItem?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&fit=crop&q=60"}
          alt={restaurant?.name || "Restaurant"}
          className="h-32 w-full sm:w-44 rounded-xl border border-gray-100 shadow-sm shrink-0 object-cover"
        />
        <div className="space-y-3 flex-1 min-w-0">
          <h4 className="text-lg font-black text-gray-800 tracking-tight">
            {restaurant?.name || "Surya Cafe"}
          </h4>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <FaStar className="text-emerald-600" />
            <span>4.5 (230+ reviews)</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            {restaurant?.address || "Bavdhan, Pune - 411021"}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <FaPhoneAlt className="text-gray-400" size={11} />
            <span>{restaurant?.owner?.mobile || "+91 98765 43210"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const PickupWindowCard = () => (
    <div className="bg-[#fff8f4] border border-[#ffe6dc] rounded-2xl p-5 space-y-2.5 animate-fadeIn">
      <h4 className="text-xs uppercase font-black tracking-wider text-[#ff5a36] flex items-center gap-1.5">
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Pickup Window
      </h4>
      <div className="space-y-1">
        <p className="text-xs text-gray-400 font-extrabold">Today</p>
        <p className="text-base font-black text-gray-800">09:00 AM – 10:00 PM</p>
        <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
          Please collect your order within the above time.
        </p>
      </div>
    </div>
  );

  const CustomerDetailsCard = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
      <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2">
        <svg className="h-4.5 w-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Your Details
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-black text-gray-800 block">
          Your Name
          <input
            value={pickupForm.name}
            onChange={(event) => setPickupForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Enter your name"
            className="mt-2 h-12 w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-[#ff5a36] focus:ring-1 focus:ring-orange-500/10 transition-all duration-200"
          />
        </label>
        <label className="text-xs font-black text-gray-800 block">
          Mobile Number
          <input
            value={pickupForm.mobile}
            onChange={(event) => setPickupForm((prev) => ({ ...prev, mobile: event.target.value }))}
            placeholder="Enter mobile number"
            className="mt-2 h-12 w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-[#ff5a36] focus:ring-1 focus:ring-orange-500/10 transition-all duration-200"
          />
        </label>
      </div>

      <label className="text-xs font-black text-gray-800 block">
        Special Instructions (Optional)
        <div className="relative mt-2">
          <textarea
            maxLength={100}
            value={pickupForm.instructions}
            onChange={(event) =>
              setPickupForm((prev) => ({ ...prev, instructions: event.target.value }))
            }
            placeholder="E.g. Don't add onion, extra sauce, etc."
            rows={3}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white focus:border-[#ff5a36] focus:ring-1 focus:ring-orange-500/10 transition-all duration-200 resize-none"
          />
          <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-bold">
            {pickupForm.instructions.length}/100
          </span>
        </div>
      </label>
    </div>
  );

  const PickupPaymentCard = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
      <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2">
        <svg className="h-5 w-5 text-[#ff5a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Payment Method
      </h3>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setPickupPayment("pickup_advance")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
            pickupPayment === "pickup_advance" ? "border-[#ff5a36] bg-[#fff8f4] shadow-xs" : "border-gray-150 bg-white hover:border-gray-300"
          }`}
        >
          <Radio active={pickupPayment === "pickup_advance"} />
          <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            💵
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-extrabold text-[#111827]">Pay 20% Advance</p>
              <span className="rounded-full bg-[#ccefd4] px-2 py-0.5 text-[9px] font-black text-[#18823a] uppercase">Recommended</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Pay now 20% of the total amount. Remaining at pickup.</p>
          </div>
          <span className="shrink-0 text-sm font-extrabold text-[#ff5a36]">{money(advance)}</span>
        </button>

        <button
          type="button"
          onClick={() => setPickupPayment("pickup_full")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
            pickupPayment === "pickup_full" ? "border-[#ff5a36] bg-[#fff8f4] shadow-xs" : "border-gray-150 bg-white hover:border-gray-300"
          }`}
        >
          <Radio active={pickupPayment === "pickup_full"} />
          <div className="h-10 w-10 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            💳
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-[#111827]">Pay Full Amount Online</p>
            <p className="text-xs text-gray-500 mt-0.5">Pay full amount now and skip payment at pickup.</p>
          </div>
          <span className="shrink-0 text-sm font-extrabold text-[#ff5a36]">{money(pickupTotal)}</span>
        </button>

        {walletBalance >= pickupTotal ? (
          <button
            type="button"
            onClick={() => setPickupPayment("wallet")}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
              pickupPayment === "wallet" ? "border-[#ff5a36] bg-[#fff8f4] shadow-xs" : "border-gray-150 bg-white hover:border-gray-300"
            }`}
          >
            <Radio active={pickupPayment === "wallet"} />
            <div className="h-10 w-10 shrink-0 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
              💼
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-[#111827]">Fletto Wallet</p>
                <span className="rounded-full bg-[#ccefd4] px-2 py-0.5 text-[9px] font-black text-[#18823a] uppercase">100% Paid</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Pay fully using wallet (Balance: ₹{walletBalance})</p>
            </div>
            <span className="shrink-0 text-sm font-extrabold text-[#ff5a36]">{money(pickupTotal)}</span>
          </button>
        ) : (
          walletBalance > 0 && (
            <button
              type="button"
              onClick={() => setPickupPayment("wallet_razorpay")}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                pickupPayment === "wallet_razorpay" ? "border-[#ff5a36] bg-[#fff8f4] shadow-xs" : "border-gray-150 bg-white hover:border-gray-300"
              }`}
            >
              <Radio active={pickupPayment === "wallet_razorpay"} />
              <div className="h-10 w-10 shrink-0 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                💼
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-[#111827]">Wallet + Online Payment</p>
                  <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-700 uppercase">Partial Wallet</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Pay ₹{walletBalance} from Wallet & remaining ₹{pickupTotal - walletBalance} online</p>
              </div>
              <span className="shrink-0 text-sm font-extrabold text-[#ff5a36]">{money(pickupTotal)}</span>
            </button>
          )
        )}
      </div>
    </div>
  );

  const PickupOtpInfoCard = () => (
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex gap-3.5 items-start animate-fadeIn">
      <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-black text-emerald-900">Pickup OTP</h4>
        <p className="text-xs text-emerald-700 leading-normal font-semibold">
          A secure OTP will be sent to your email after payment. Show OTP to restaurant staff during collection.
        </p>
      </div>
    </div>
  );

  const OrderCard = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
      <h3 className="text-sm font-black text-gray-800 tracking-tight">
        My Order ({cartItems.length} Item{cartItems.length === 1 ? "" : "s"})
      </h3>
      
      <div className="space-y-4 divide-y divide-gray-50">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`flex gap-4 ${index > 0 ? "pt-4" : ""}`}>
            <img
              src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop&q=60"}
              alt={item.name}
              className="h-16 w-16 rounded-xl object-cover shrink-0 border border-gray-100 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="text-sm font-black text-gray-800 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">₹{item.price} × {item.quantity}</p>
                </div>
                <span className="text-sm font-black text-gray-800">₹{Math.round(item.price * item.quantity)}</span>
              </div>
              
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 border border-gray-150 hover:bg-gray-100 text-gray-700 transition active:scale-90"
                >
                  <FaMinus size={10} />
                </button>
                <span className="text-xs font-black text-gray-800 w-4 text-center">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 border border-gray-150 hover:bg-gray-100 text-gray-700 transition active:scale-90"
                >
                  <FaPlus size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(removeCartItem(item.id))}
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition active:scale-90"
                >
                  <FaTrash size={9} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BillDetailsCard = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-gray-800 tracking-tight">Bill Details</h3>
      
      <div className="space-y-3.5 text-xs font-bold text-gray-600">
        <div className="flex justify-between">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-gray-800 font-extrabold">₹{Math.round(totalAmount)}</span>
        </div>

        {orderType === "delivery" ? (
          <div className="flex justify-between">
            <span className="text-gray-400">Delivery Fee</span>
            {totalAmount >= 500 ? (
              <span className="text-green-600 font-black bg-green-50 px-2 py-0.5 rounded text-[10px]">FREE</span>
            ) : (
              <span className="text-gray-800 font-extrabold">₹{deliveryFee}</span>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Packaging Fee</span>
              <span className="text-gray-800 font-extrabold">₹10</span>
            </div>
            <div className="flex justify-between text-[#ff5a36] font-bold">
              <span className="text-gray-400">To Pay Now (20%)</span>
              <span>- ₹{pickupPayNow}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-bold">
              <span className="text-gray-400 font-bold">Remaining at Pickup</span>
              <span>₹{pickupRemaining}</span>
            </div>
          </>
        )}

        {((orderType === "delivery" && ["wallet", "wallet_razorpay"].includes(paymentMethod)) ||
          (orderType === "selfPickup" && ["wallet", "wallet_razorpay"].includes(pickupPayment))) && (
          <div className="flex justify-between text-emerald-600 border-t border-gray-50 pt-3">
            <span className="text-gray-400">Paid via Wallet</span>
            <span>-₹{orderType === "delivery" ? (paymentMethod === "wallet" ? finalTotal : walletBalance) : (pickupPayment === "wallet" ? finalTotal : walletBalance)}</span>
          </div>
        )}

        <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center text-sm font-black">
          <span className="text-gray-800">Total Amount</span>
          <span className="text-xl text-[#ff5a36]">₹{orderType === "delivery" ? deliveryTotal : pickupTotal}</span>
        </div>
      </div>
    </div>
  );

  const FreeDeliveryCard = () => {
    if (orderType !== "delivery" || totalAmount >= 500) return null;
    const diff = 500 - totalAmount;
    const progressPercent = Math.min(100, (totalAmount / 500) * 100);

    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-3.5 animate-fadeIn">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-xs font-black text-gray-800 leading-tight">
              You're <span className="text-[#ff5a36]">₹{diff}</span> away from
            </p>
            <p className="text-xs font-black text-gray-800 uppercase tracking-wider mt-0.5">
              FREE DELIVERY!
            </p>
          </div>
          <div className="text-orange-500 text-lg shrink-0">
            🎁
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-wider">
            <span>₹{Math.round(totalAmount)} / ₹500</span>
          </div>
        </div>
      </div>
    );
  };

  const SafeSecureCard = () => (
    <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex gap-3.5 items-center">
      <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <div>
        <h4 className="text-xs font-black text-gray-800">Safe & Secure</h4>
        <p className="text-[11px] text-gray-400 font-semibold leading-relaxed mt-0.5">
          Your details are secured with 256-bit encryption
        </p>
      </div>
    </div>
  );

  const PickupBenefitsCard = () => {
    if (orderType !== "selfPickup") return null;
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
        <h4 className="text-xs uppercase font-black tracking-wider text-gray-400">Pickup Benefits</h4>
        <div className="space-y-3">
          {[
            "No delivery charges",
            "Faster order ready time",
            "No waiting for delivery",
            "Confirm your order with advance"
          ].map((benefit, idx) => (
            <div key={idx} className="flex gap-2.5 items-center text-xs font-bold text-gray-700">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shrink-0 flex items-center justify-center">✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TrustBar = () => (
    <div className="flex justify-center gap-6 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-4">
      <span className="flex items-center gap-1.5">
        🛡️ 100% Safe Payments
      </span>
      <span className="flex items-center gap-1.5">
        {orderType === "delivery" ? "🛵 On-time Delivery" : "🏪 On-time Ready"}
      </span>
      <span className="flex items-center gap-1.5">
        🏷️ Best Price Guaranteed
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-8">
      {/* Top Header Section */}
      <header className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/cart")}
            className="text-[#ff5a36] hover:text-[#e64c29] p-2 transition active:scale-95 duration-100 cursor-pointer text-2xl font-bold flex items-center"
            aria-label="Back to cart"
          >
            ←
          </button>
          {Stepper()}
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-2 tracking-tight">Checkout</h1>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {walletBalance > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 p-5 flex items-center justify-between shadow-xs rounded-2xl mb-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-green-500/20 shrink-0">
                ₹
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-wider text-green-700/80">Wallet Balance Available</p>
                <p className="text-2xl font-black text-green-900 leading-tight mt-0.5">₹{walletBalance}</p>
                <p className="text-xs font-semibold text-green-600/90 mt-0.5">Will be automatically applied at checkout</p>
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-green-500 text-white shadow-xs">
                Active
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[65%_35%] items-start max-w-[1400px] mx-auto">
          
          {/* LEFT COLUMN: 65% width */}
          <main className="space-y-6">
            {DeliveryMethodSwitch()}

            <AnimatePresence mode="wait">
              <motion.div
                key={orderType}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {orderType === "delivery" ? (
                  <>
                    {DeliveryLocationCard()}
                    {DeliveryPaymentCard()}
                  </>
                ) : (
                  <>
                    {RestaurantDetailsCard()}
                    {PickupWindowCard()}
                    {CustomerDetailsCard()}
                    {PickupPaymentCard()}
                    {PickupOtpInfoCard()}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Sticky/Inline Action Button & Trust Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 md:relative md:bottom-auto md:left-auto md:right-auto md:bg-transparent md:border-t-0 md:p-0 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
              <button
                type="button"
                disabled={loading}
                onClick={placeOrder}
                className="w-full bg-[#ff5a36] hover:bg-[#e64c29] text-white font-black py-4.5 rounded-2xl text-base shadow-lg shadow-orange-500/20 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 group active:scale-98"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <ClipLoader size={16} color="#ffffff" />
                    Processing Order...
                  </span>
                ) : (
                  <>
                    <span>
                      {orderType === "delivery"
                        ? `Proceed to Payment • ₹${deliveryTotal}`
                        : `Place Self Pickup Order • ₹${pickupPayNow}`}
                    </span>
                    <span className="transition-transform group-hover:translate-x-1 duration-150">➔</span>
                  </>
                )}
              </button>
              <div className="hidden md:block">
                {TrustBar()}
              </div>
            </div>
            <div className="block md:hidden pb-4">
              {TrustBar()}
            </div>
          </main>

          {/* RIGHT COLUMN: 35% width */}
          <aside className="space-y-6">
            {OrderCard()}
            {BillDetailsCard()}
            {FreeDeliveryCard()}
            {SafeSecureCard()}
            {PickupBenefitsCard()}
          </aside>
        </div>

        {error && (
          <div className="mt-6 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-rose-700 font-bold text-xs animate-fadeIn max-w-2xl mx-auto">
            <svg className="h-5 w-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="flex-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckOut;
