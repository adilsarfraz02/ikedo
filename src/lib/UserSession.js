"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function UserSession() {
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
        console.log("Failed to fetch data", error);
        setError(error.response.data.error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return { loading, data, error };
}

