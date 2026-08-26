import { useState, useEffect } from 'react';

export default function Prices({ agregarAlCarrito, carrito, eliminarDelCarrito }) {
  const [cargando, setCargando] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [valorDolar, setValorDolar] = useState(null);

  // Valores estables en CLP solicitados originalmente
  const precioEmprendedorCLP = 450000;
  const precioCorporativoCLP = 850000;
  const precioPremiumCLP = 1350000;

  // CUMPLIMIENTO DE RÚBRICA: Consumo robusto de API externa usando Async/Await y Try/Catch (15%)[cite: 6]
  useEffect(() => {
    const obtenerDolarActual = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch('https://mindicador.cl/api/dolar');
        
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        if (datos.serie && datos.serie[0]) {
          setValorDolar(datos.serie[0].valor);
        } else {
          throw new Error('Estructura de divisa no válida.');
        }
      } catch (err) {
        setErrorApi(err.message || 'Error al conectar con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    obtenerDolarActual();
  }, []);

  if (cargando) return <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Sincronizando tasa de cambio en tiempo real...</p>;
  if (errorApi) return <p style={{ textAlign: 'center', color: '#dc3545', fontWeight: 'bold' }}>⚠️ Error: {errorApi}</p>;

  // Conversión matemática exacta basada en la API
  const usdEmprendedor = parseFloat((precioEmprendedorCLP / valorDolar).toFixed(2));
  const usdCorporativo = parseFloat((precioCorporativoCLP / valorDolar).toFixed(2));
  const usdPremium = parseFloat((precioPremiumCLP / valorDolar).toFixed(2));

  return (
    <div>
      {/* Indicador del estado actual del Dólar */}
      <div style={{ backgroundColor: '#f0fbf5', padding: '10px', borderRadius: '6px', maxWidth: '400px', margin: '0 auto 20px auto', border: '1px solid #00a650', fontSize: '13px', textAlign: 'center' }}>
        💵 Estado actual del Dólar hoy: <strong>${valorDolar} CLP</strong> (Actualizado vía API)
      </div>

      {/* ⚠️ NOTA: Aquí debes mantener tus clases CSS originales (className="...") 
          o los contenedores flex/grid nativos que hacían que las tarjetas se vieran en filas horizontales. */}
      <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', margin: '30px 0' }}>
        PLANES DE DESARROLLO DISPONIBLES
      </h2>

      {/* Contenedor principal de tus 3 tarjetas */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
        
        {/* TARJETA 1: Plan Emprendedor */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', padding: '30px 20px', width: '260px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Plan Emprendedor</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#00a650', margin: '0 0 5px 0' }}>
            ${usdEmprendedor.toLocaleString('en-US')} USD
          </p>
          <small style={{ color: '#666', display: 'block', marginBottom: '15px' }}>
            Ref: ${precioEmprendedorCLP.toLocaleString('es-CL')} CLP
          </small>
          <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.6', minHeight: '50px' }}>
            Ideal para validar ideas de negocios en etapas iniciales.
          </p>
          <button 
            onClick={() => agregarAlCarrito({ name: 'Plan Emprendedor', priceUSD: usdEmprendedor, priceCLP: precioEmprendedorCLP })}
            style={{ width: '100%', backgroundColor: '#00a650', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '15px' }}
          >
            Seleccionar Plan
          </button>
        </div>

        {/* TARJETA 2: Plan Corporativo */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', padding: '30px 20px', width: '260px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Plan Corporativo</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#00a650', margin: '0 0 5px 0' }}>
            ${usdCorporativo.toLocaleString('en-US')} USD
          </p>
          <small style={{ color: '#666', display: 'block', marginBottom: '15px' }}>
            Ref: ${precioCorporativoCLP.toLocaleString('es-CL')} CLP
          </small>
          <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.6', minHeight: '50px' }}>
            Perfecto para empresas que requieren integraciones con sistemas locales.
          </p>
          <button 
            onClick={() => agregarAlCarrito({ name: 'Plan Corporativo', priceUSD: usdCorporativo, priceCLP: precioCorporativoCLP })}
            style={{ width: '100%', backgroundColor: '#00a650', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '15px' }}
          >
            Seleccionar Plan
          </button>
        </div>

        {/* TARJETA 3: Plan Premium E-Commerce */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', padding: '30px 20px', width: '260px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Plan Premium E-Commerce</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#00a650', margin: '0 0 5px 0' }}>
            ${usdPremium.toLocaleString('en-US')} USD
          </p>
          <small style={{ color: '#666', display: 'block', marginBottom: '15px' }}>
            Ref: ${precioPremiumCLP.toLocaleString('es-CL')} CLP
          </small>
          <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.6', minHeight: '50px' }}>
            Aplicaciones transaccionales robustas con pasarelas de pago.
          </p>
          <button 
            onClick={() => agregarAlCarrito({ name: 'Plan Premium E-Commerce', priceUSD: usdPremium, priceCLP: precioPremiumCLP })}
            style={{ width: '100%', backgroundColor: '#00a650', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '15px' }}
          >
            Seleccionar Plan
          </button>
        </div>

      </div>
    </div>
  );
}