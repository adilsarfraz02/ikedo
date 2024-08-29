import React from "react";
import AllUserTable from "./AllUserTable";
import AdminCharts from "./AdminCharts";
import UserSession from "@/lib/UserSession";
const AdminDashboard = () => {
  const { data: user, loading, error } = UserSession();
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <>
      <h1 className='text-3xl text-start font-bold mb-4 py-4'>
        Welcome {user.username}
      </h1>
      <div className='w-full grid grid-cols-1 md:grid-cols-2  p-4 gap-4'>
        <AllUserTable />
        <AdminCharts />
      </div>
    </>
  );
};

export default AdminDashboard;
