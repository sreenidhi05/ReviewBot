import './App.css';
import React from'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import AboutUs from './components/AboutUs';
import LinkInput from './components/LinkInput';

function App() {
  return (
    <div className="min-h-screen bg-[#bcd4d3"> {/* Apply background globally */}
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element = {<Login/>}/>
        <Route path = "/register" element={<Register/>}/>
        <Route path="/aboutUs" element={<AboutUs />}/>
        <Route path = '/linkInput' element={<LinkInput/>}/>
      </Routes>
    </Router>
    </div>
  );
}

export default App;
