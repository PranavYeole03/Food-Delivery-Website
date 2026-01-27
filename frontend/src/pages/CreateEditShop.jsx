import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { setmyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";
import { FaS } from "react-icons/fa6";

const CreateEditShop = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user,
  );

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!myShopData) {
      setAddress(currentAddress || "");
      setCity(currentCity || "");
      setState(currentState || "");
      return;
    }

    setName(myShopData.name || "");
    setAddress(myShopData.address || "");
    setCity(myShopData.city || "");
    setState(myShopData.state || "");
    setFrontendImage(myShopData.image || null);
  }, [myShopData, currentAddress, currentCity, currentState]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return; // safety
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true },
      );

      dispatch(setmyShopData(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center flex-col items-center p-6 bg-linear-to-br from-orange-50 relative to-white min-h-screen">
      <div
        className="absolute top-5 left-5 z-10 mb-2.5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoArrowBack size={35} className="text-[#ff4d2d]" />
      </div>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Restaurant Image
            </label>

            <div className="relative w-full border-2 border-dashed border-orange-300 rounded-xl bg-orange-50 hover:bg-orange-100 transition cursor-pointer overflow-hidden">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleImage}
              />

              {/* NO IMAGE */}
              {!frontendImage && (
                <div className="h-56 sm:h-64 lg:h-72 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-100 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-7 h-7 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v7m0-7l-3 3m3-3l3 3M16 8a4 4 0 10-8 0"
                      />
                    </svg>
                  </div>

                  <p className="text-sm font-medium text-gray-700">
                    Click to upload restaurant image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB (16:9 recommended)
                  </p>
                </div>
              )}

              {/* IMAGE PREVIEW */}
              {frontendImage && (
                <div className="w-full bg-white">
                  <img
                    src={frontendImage}
                    alt="Restaurant Preview"
                    className="w-full h-56 sm:h-64 lg:h-72 object-contain bg-white"
                  />
                </div>
              )}
            </div>

            {frontendImage && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click on image to change
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="State"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Address"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-[#ff4d2d] text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-70"
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
