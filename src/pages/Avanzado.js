import React from 'react';

export default function Avanzado() {
  return (
    <div>
      <p className="avanzado-intro">
        Estas opciones permiten calcular casos más complejos que no aparecen
        en la pantalla principal. Próximamente disponibles.
      </p>

      <div className="coming-soon">
        <div className="coming-soon-title">Período de gracia</div>
        <div className="coming-soon-desc">
          Algunas promociones ofrecen que la primera cuota venza a 60 o 90 días
          en lugar de 30. Eso cambia el costo real del financiamiento y esta
          opción lo tendrá en cuenta.
        </div>
        <span className="coming-soon-badge">Próximamente</span>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-title">Promoción mixta</div>
        <div className="coming-soon-desc">
          Cuando el local ofrece simultáneamente un descuento por transferencia
          y cuotas sin interés con otra tarjeta. Podés comparar ambas opciones
          en la misma pantalla.
        </div>
        <span className="coming-soon-badge">Próximamente</span>
      </div>
    </div>
  );
}