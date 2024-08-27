import React from "react";
import AllUserTable from "./AllUserTable";
import AdminCharts from "./AdminCharts";
const AdminDashboard = () => {
  return (
    <>
      <h1 className='text-3xl font-bold mb-4'>Admin Dashboard</h1>
      <div className='w-full grid grid-cols-2 p-4 gap-4'>
        <AllUserTable />
        <AdminCharts />
      </div>
    </>
  );
};

export default AdminDashboard;
