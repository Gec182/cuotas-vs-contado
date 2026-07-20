import React, { useState } from 'react';

const BENCHMARKS = [
  { nombre: 'Plazo fijo 30 días (promedio BCRA)', tasa: 2.50 },
  { nombre: 'FCI money market', tasa: 2.80 },
  { nombre: 'Plazo fijo UVA estimado', tasa: 3.20 },
];

const TASAS_FECHA = '20/07/2026';
const TASAS_FUENTE = 'BCRA';

function formatPeso(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

function calcularDescuento(lista, pct, tope) {
  if (!pct || pct <= 0) return { precio: lista, aplicado: 0, topado: false };
  const descuentoPct = lista * (pct / 100);
  const hayTope = tope > 0;
  const descuentoAplicado = hayTope ? Math.min(descuentoPct, tope) : descuentoPct;
  return {
    precio: lista - descuentoAplicado,
    aplicado: descuentoAplicado,
    topado: hayTope && descuentoPct > tope,
  };
}

function calcularTIR(contado, cuotas, totalPagado) {
  const cuotaValor = totalPagado / cuotas;
  let tir = 0.03;
  for (let iter = 0; iter < 300; iter++) {
    let f = -contado;
    let df = 0;
    for (let t = 1; t <= cuotas; t++) {
      const v = Math.pow(1 + tir, t);
      f += cuotaValor / v;
      df -= t * cuotaValor / (v * (1 + tir));
    }
    const delta = f / df;
    tir -= delta;
    if (Math.abs(delta) < 1e-9) break;
  }
  return tir;
}

function guardarHistorial(item) {
  const prev = JSON.parse(localStorage.getItem('historial') || '[]');
  const nuevo = [item, ...prev].slice(0, 20);
  localStorage.setItem('historial', JSON.stringify(nuevo));
}

export default function Calcular() {
  const [precioLista, setPrecioLista] = useState('');
  const [pctDescuento, setPctDescuento] = useState('');
  const [topeDescuento, setTopeDescuento] = useState('');
  const [numCuotas, setNumCuotas] = useState('');
  const [tipo, setTipo] = useState('sin');
  const [precioCuotas, setPrecioCuotas] = useState('');
  const [valorCuota, setValorCuota] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const lista = parseFloat(precioLista);
  const pct = parseFloat(pctDescuento);
  const tope = parseFloat(topeDescuento);
  const descuento = lista > 0 && pct > 0 && pct < 100
    ? calcularDescuento(lista, pct, tope)
    : null;
  const precioContado = descuento ? descuento.precio : lista;

  function calcular() {
    setError('');
    const contado = precioContado;
    const cuotas = parseInt(numCuotas);
    let totalPagado;

    if (tipo === 'sin') {
      totalPagado = parseFloat(precioCuotas);
    } else {
      totalPagado = parseFloat(valorCuota) * cuotas;
    }

    if (!contado || !cuotas || !totalPagado || contado <= 0 || cuotas <= 0 || totalPagado <= 0) {
      setError('Completá todos los campos con valores válidos.');
      return;
    }
    if (totalPagado < contado) {
      setError('El total en cuotas no puede ser menor al precio de contado / transferencia.');
      return;
    }

    const tir = calcularTIR(contado, cuotas, totalPagado);
    const tirPct = tir * 100;
    const recargo = ((totalPagado / contado) - 1) * 100;
    const mejorBenchmark = BENCHMARKS.reduce((a, b) => b.tasa > a.tasa ? b : a);
    const diffVeredicto = tirPct - mejorBenchmark.tasa;

    let veredicto;
    if (diffVeredicto > 0.3) {
      veredicto = 'contado';
    } else if (diffVeredicto < -0.3) {
      veredicto = 'cuotas';
    } else {
      veredicto = 'neutro';
    }

    const res = {
      tirPct,
      recargo,
      veredicto,
      mejorBenchmark,
      contado,
      cuotas,
      totalPagado,
      fecha: new Date().toLocaleDateString('es-AR'),
    };

    setResultado(res);
    guardarHistorial({
      ...res,
      precioLista: lista,
      tipo,
    });
  }

  return (
    <div>
      <div className="section-label">Datos de la compra</div>

      <div className="field-group">
        <label className="field-label">Precio de lista</label>
        <span className="field-hint">El precio que figura en el local o la web, sin aplicar ningún descuento</span>
        <div className="field-row">
          <span className="prefix">$</span>
          <input type="number" placeholder="Ej: 899.999" value={precioLista}
            onChange={e => { setPrecioLista(e.target.value); setResultado(null); }} />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">
          Descuento por contado / transferencia{' '}
          <span style={{ color: '#bbb', fontWeight: 400 }}>(opcional)</span>
        </label>
        <span className="field-hint">Si el local te ofrece un descuento por pagar en efectivo o transferencia, completá los campos que correspondan</span>
        <div className="descuento-grid">
          <div>
            <div className="field-hint" style={{ marginBottom: 4 }}>Porcentaje</div>
            <div className="field-row">
              <input type="number" className="input-pct" placeholder="Ej: 20"
                min="0" max="99" value={pctDescuento}
                onChange={e => { setPctDescuento(e.target.value); setResultado(null); }} />
              <span className="suffix">%</span>
            </div>
          </div>
          <div>
            <div className="field-hint" style={{ marginBottom: 4 }}>Tope <span style={{ color: '#bbb' }}>(si hay)</span></div>
            <div className="field-row">
              <span className="prefix">$</span>
              <input type="number" placeholder="Ej: 80.000" value={topeDescuento}
                onChange={e => { setTopeDescuento(e.target.value); setResultado(null); }} />
            </div>
          </div>
        </div>
      </div>

      {descuento && (
        <div className="precio-calculado">
          <div className="precio-calculado-label">Precio que pagás al contado / transferencia</div>
          <div className="precio-calculado-valor">{formatPeso(descuento.precio)}</div>
          <div className={`precio-calculado-disclaimer ${descuento.topado ? 'con-tope' : ''}`}>
            {descuento.topado
              ? `El descuento del ${pct}% sería de ${formatPeso(lista * pct / 100)}, pero se aplica el tope de ${formatPeso(tope)}. Verificá esta condición antes de tomar la decisión.`
              : topeDescuento
                ? `Descuento de ${formatPeso(descuento.aplicado)} aplicado. El tope no limita el descuento en este caso.`
                : `Estimado asumiendo que no hay tope en el descuento. Verificá esta condición antes de tomar la decisión.`
            }
          </div>
        </div>
      )}

      <div className="field-group" style={{ marginTop: '1.25rem' }}>
        <label className="field-label">Número de cuotas</label>
        <input type="number" placeholder="Ej: 9" min="1" max="60" value={numCuotas}
          onChange={e => { setNumCuotas(e.target.value); setResultado(null); }} />
      </div>

      <hr className="divider" />
      <div className="section-label">Tipo de financiación</div>

      <div className="tipo-btn-group">
        <button className={`tipo-btn ${tipo === 'sin' ? 'active' : ''}`}
          onClick={() => { setTipo('sin'); setResultado(null); }}>Sin interés</button>
        <button className={`tipo-btn ${tipo === 'con' ? 'active' : ''}`}
          onClick={() => { setTipo('con'); setResultado(null); }}>Con interés</button>
      </div>

      {tipo === 'sin' ? (
        <div className="field-group">
          <label className="field-label">Precio de lista en cuotas</label>
          <span className="field-hint">El precio total que figura si elegís pagar en cuotas</span>
          <div className="field-row">
            <span className="prefix">$</span>
            <input type="number" placeholder="Ej: 899.999" value={precioCuotas}
              onChange={e => { setPrecioCuotas(e.target.value); setResultado(null); }} />
          </div>
        </div>
      ) : (
        <div className="field-group">
          <label className="field-label">Valor de cada cuota</label>
          <div className="field-row">
            <span className="prefix">$</span>
            <input type="number" placeholder="Ej: 58.000" value={valorCuota}
              onChange={e => { setValorCuota(e.target.value); setResultado(null); }} />
          </div>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}
      <button className="calcular-btn" onClick={calcular}>Calcular</button>

      {resultado && <Resultado res={resultado} />}
    </div>
  );
}

function Resultado({ res }) {
  const { tirPct, recargo, veredicto, mejorBenchmark, contado, cuotas, totalPagado } = res;

  const titulos = {
    contado: 'Conviene pagar al contado o por transferencia',
    cuotas: 'Conviene tomar las cuotas',
    neutro: 'La diferencia es mínima',
  };

  const subs = {
    contado: `Financiarte en cuotas te cuesta ${tirPct.toFixed(2)}% mensual, pero si invertís ese dinero podés ganar hasta ${mejorBenchmark.tasa.toFixed(2)}% mensual. Las cuotas son más caras.`,
    cuotas: `Financiarte en cuotas te cuesta ${tirPct.toFixed(2)}% mensual, menos de lo que ganás invirtiendo (${mejorBenchmark.tasa.toFixed(2)}% mensual). Tomá las cuotas y dejá el capital trabajando.`,
    neutro: `El costo del financiamiento (${tirPct.toFixed(2)}% mensual) es muy similar al rendimiento disponible. No hay una ventaja clara en ninguna dirección.`,
  };

  const explicaciones = {
    contado: `<p>Las cuotas "sin interés" no son gratis: el vendedor subió el precio de lista para cubrir el financiamiento. Al calcular cuánto pagás de más por mes, vemos que el costo es del <strong>${tirPct.toFixed(2)}% mensual</strong>.</p><p>Si en cambio pagás al contado o por transferencia y colocás el dinero restante en un ${mejorBenchmark.nombre.toLowerCase()}, ganás <strong>${mejorBenchmark.tasa.toFixed(2)}% mensual</strong>. Como el financiamiento es más caro que lo que podrías ganar, conviene pagar de una sola vez.</p>`,
    cuotas: `<p>En este caso, el costo implícito del financiamiento (<strong>${tirPct.toFixed(2)}% mensual</strong>) es menor a lo que podés ganar colocando ese dinero en un ${mejorBenchmark.nombre.toLowerCase()} (<strong>${mejorBenchmark.tasa.toFixed(2)}% mensual</strong>).</p><p>La estrategia correcta es tomar las cuotas y dejar el capital invertido. Estás usando plata "barata" del financiamiento y haciendo que tu dinero rinda más por separado.</p>`,
    neutro: `<p>El costo de financiarte en cuotas y el rendimiento que obtendrías invirtiendo son prácticamente iguales. Financieramente, da lo mismo.</p><p>En estos casos conviene decidir por preferencia personal: si no te gusta tener deudas, pagá al contado o por transferencia. Si preferís mantener liquidez, tomá las cuotas.</p>`,
  };

  return (
    <div className="resultado">
      <div className={`veredicto-card ${veredicto}`}>
        <div className="veredicto-title">{titulos[veredicto]}</div>
        <div className="veredicto-sub">{subs[veredicto]}</div>
        <div className="supuesto">* Este análisis asume que contás con el efectivo disponible para pagar al contado.</div>
      </div>

      <div className="metricas">
        <div className="metrica">
          <div className="metrica-label">Costo mensual del financiamiento</div>
          <div className="metrica-valor">{tirPct.toFixed(2)}% mens.</div>
        </div>
        <div className="metrica">
          <div className="metrica-label">Recargo total sobre contado / transferencia</div>
          <div className="metrica-valor">+{recargo.toFixed(1)}%</div>
        </div>
      </div>

      <div className="benchmarks-card">
        <div className="benchmarks-title">¿Cómo compara con invertir ese dinero?</div>
        {BENCHMARKS.map(b => {
          const diff = tirPct - b.tasa;
          let tag, tagLabel;
          if (diff > 0.3) { tag = 'caro'; tagLabel = `${diff.toFixed(2)}% más caro`; }
          else if (diff < -0.3) { tag = 'barato'; tagLabel = `${Math.abs(diff).toFixed(2)}% más barato`; }
          else { tag = 'neutro'; tagLabel = 'Similar'; }
          return (
            <div className="benchmark-row" key={b.nombre}>
              <span className="benchmark-name">{b.nombre}</span>
              <span className="benchmark-tasa">{b.tasa.toFixed(2)}% mens.</span>
              <span className={`benchmark-tag ${tag}`}>{tagLabel}</span>
            </div>
          );
        })}
        <div className="tasas-footer">Tasas al {TASAS_FECHA} · Fuente: {TASAS_FUENTE}</div>
      </div>

      <div className="explicacion">
        <div className="explicacion-title">¿Por qué este resultado?</div>
        <div dangerouslySetInnerHTML={{ __html: explicaciones[veredicto] }} />
      </div>
    </div>
  );
}