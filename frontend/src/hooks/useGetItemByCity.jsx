import { useEffect } from "react";
import api from "../api/axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity } from "../redux/userSlice";

function useGetItemByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    const city = currentCity?.trim();

    if (!city) {
      dispatch(setItemsInMyCity([]));
      return;
    }

    const fetchItems = async () => {
      try {
        const result = await api.get(
          `${serverUrl}/api/item/get-by-city/${encodeURIComponent(city)}`,
          {
            withCredentials: true,
          }
        );

        dispatch(setItemsInMyCity(result.data));
      } catch (error) {
        dispatch(setItemsInMyCity([]));
      }
    };

    fetchItems();
  }, [currentCity, dispatch]);
}

export default useGetItemByCity;

