import React, { useState, useEffect } from 'react';

function formatPeso(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

const etiquetas = {
  contado: 'Conviene contado / transferencia',
  cuotas: 'Conviene cuotas',
  neutro: 'Diferencia mínima',
};

export default function Historial() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('historial') || '[]');
    setItems(data);
  }, []);

  function limpiar() {
    localStorage.removeItem('historial');
    setItems([]);
  }

  if (items.length === 0) {
    return (
      <div className="historial-empty">
        <div className="historial-empty-icon">🧾</div>
        <div className="historial-empty-text">
          Todavía no hiciste ningún cálculo.<br />
          Los resultados van a aparecer acá automáticamente.
        </div>
      </div>
    );
  }

  return (
    <div>
      {items.map((item, i) => (
        <div className="historial-item" key={i}>
          <div className="historial-item-header">
            <div className="historial-item-monto">
              {formatPeso(item.precioLista)}
            </div>
            <div className="historial-item-fecha">{item.fecha}</div>
          </div>
          <div className="historial-item-detalle">
            {item.cuotas} cuotas · TIR {item.tirPct.toFixed(2)}% mensual · Recargo +{item.recargo.toFixed(1)}%
          </div>
          <div className={`historial-item-veredicto ${item.veredicto}`}>
            {etiquetas[item.veredicto]}
          </div>
        </div>
      ))}
      <button className="historial-clear" onClick={limpiar}>
        Borrar historial
      </button>
    </div>
  );
}