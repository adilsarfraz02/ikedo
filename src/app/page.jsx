import React from "react";
import HeroSection from "../components/sections/Hero";
import SimpleFooter from "../components/SimpleFooter";
import Navbar from "../components/Header";
const Home = () => {
  return (
    <React.Fragment>
      <Navbar />
      <HeroSection />
      <SimpleFooter />
    </React.Fragment>
  );
};

export default Home;
