import React from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CartItemCard from "../components/CartItemCard";
import addtocart from  "../assets/addtocart.webp"

const CartPages = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);
  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-200">
        <div className="flex items-center gap-5 mb-6">
          <div className="z-10" onClick={() => navigate("/")}>
            <IoArrowBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">Your Cart</h1>
        </div>
        {cartItems?.length == 0 ? (
         <div className="flex flex-col items-center justify-center mt-20 text-center">
    <img
      src={addtocart}
      alt="Empty cart"
      className="w-60 mb-6 opacity-90"
    />
    <p className="text-gray-600 text-lg font-medium">
      Your cart is empty
    </p>
    <p className="text-gray-400 text-sm mt-1">
      Add some delicious food to get started
    </p>
    <button
      onClick={() => navigate("/")}
      className="mt-5 bg-[#ff4d2d] text-white px-6 py-2 rounded-lg hover:bg-[#e64526]"
    >
      Browse Food
    </button>
  </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems?.map((item, index) => (
                <CartItemCard key={item._id || index} data={item} />
              ))}
            </div>
            <div className="mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border">
              <h1 className="text-lg font-semibold">Total Amount</h1>
              <span className="text-xl font-bold text-[#ff4d2d]">
                ₨.{totalAmount}
              </span>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer" onClick={()=>navigate("/checkOut")}>
                Proceed to CheckOut
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPages;
