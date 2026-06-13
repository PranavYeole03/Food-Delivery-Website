import { useEffect } from "react";
import { serverUrl } from "../App";
import api from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity } from "../redux/userSlice";

function useGetShopByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    const city = currentCity?.trim();

    if (!city) {
      dispatch(setShopsInMyCity([]));
      return;
    }

    const fetchShop = async () => {
      try {
        const result = await api.get(
          `${serverUrl}/api/shop/get-by/city/${encodeURIComponent(city)}`,
          {
            withCredentials: true,
          }
        );
        dispatch(setShopsInMyCity(result.data));
        // 
      } catch (error) {
        dispatch(setShopsInMyCity([]));
      }
    };
    fetchShop();
  }, [currentCity, dispatch]);
}

export default useGetShopByCity;

