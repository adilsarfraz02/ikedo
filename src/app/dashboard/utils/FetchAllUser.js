"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

const FetchAllUser = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users");
        setData(response.data);
        console.log(response.data);

        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return { loading, data, error };
};

export default FetchAllUser;
