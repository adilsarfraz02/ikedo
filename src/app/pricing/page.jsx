import React from "react";
import PrincingComponent from "../../components/Pricing";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";

const page = () => {
  return (
    <>
      <Navbar />
      <div className='py-20'>
        <PrincingComponent />
      </div>
      <SimpleFooter notBanner/>
    </>
  );
};

export default page;
