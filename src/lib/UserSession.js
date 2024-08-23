"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const UserSession = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState("nothing");
  const [error, setError] = useState();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users/me");
        setData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch data", error.message);
        toast.error(error.message);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return { loading, data, error };
};

export default UserSession;
