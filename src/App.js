import React, { useState } from 'react';
import Calcular from './pages/Calcular';
import Avanzado from './pages/Avanzado';
import Historial from './pages/Historial';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('calcular');

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div className="logo">¿Cuotas o contado?</div>

        <div className="tab-bar">
          <button
            className={`tab-btn ${tab === 'calcular' ? 'active' : ''}`}
            onClick={() => setTab('calcular')}
          >
            Calcular
          </button>
          <button
            className={`tab-btn ${tab === 'avanzado' ? 'active' : ''}`}
            onClick={() => setTab('avanzado')}
          >
            Avanzado
          </button>
          <button
            className={`tab-btn ${tab === 'historial' ? 'active' : ''}`}
            onClick={() => setTab('historial')}
          >
            Historial
          </button>
        </div>

        <div className="tab-content">
          {tab === 'calcular' && <Calcular />}
          {tab === 'avanzado' && <Avanzado />}
          {tab === 'historial' && <Historial />}
        </div>
      </div>
    </div>
  );
}