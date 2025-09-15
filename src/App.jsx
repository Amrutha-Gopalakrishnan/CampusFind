// import React from 'react'
// import './App.css'
// import Navbar from './Navbar'
// import Hero from './Hero'
// import Work from './Work'
// import Secure from './Secure'

// function App() {

//   return (
//     <>
//     <Navbar />
//     <Hero />
//     <Work />
//     <Secure />
//     </>
//   )
// }

// export default App

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Work from "./Work";
import Secure from "./Secure";
import Footer from "./Footer";
import Dashboard from './Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Hero />
              <Work />
              <Secure />
              <Footer />
            </>
          }
        />

        {/* Home route (alias of '/') */}
        <Route
          path="/home"
          element={
            <>
              <Navbar />
              <Hero />
              <Work />
              <Secure />
              <Footer />
            </>
          }
        />

        {/* Dashboard single-page view */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
