// src/App.js


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import DispositionForm from './components/DispositionForm';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DispositionForm />} />
          <Route path="/forms" element={<DispositionForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;