import { useState, useEffect } from 'react';

export default function Prices({ agregarAlCarrito, carrito, eliminarDelCarrito }) {
  const [cargando, setCargando] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [valorDolar, setValorDolar] = useState(null);

  // Precios oficiales de los planes en CLP
  const precioEmprendedorCLP = 250000;
  const precioCorporativoCLP = 600000;
  const precioPremiumCLP = 450000;

  // Consumo de API externa usando Async/Await + Try/Catch
  useEffect(() => {
    const obtenerDolarActual = async () => {
      try {
        setCargando(true);
        setErrorApi(null);

        const respuesta = await fetch('https://mindicador.cl/api/dolar');

        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        if (datos.serie && datos.serie.length > 0) {
          setValorDolar(datos.serie[0].valor);
        } else {
          throw new Error('La API no devolvió información del dólar.');
        }
      } catch (error) {
        console.error('Error al obtener el dólar:', error);
        setErrorApi(
          error.message || 'No fue posible obtener la tasa de cambio.'
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerDolarActual();
  }, []);

  if (cargando) {
    return (
      <p
        style={{
          textAlign: 'center',
          color: '#00d9ff',
          fontStyle: 'italic',
          padding: '30px',
        }}
      >
        Sincronizando tasa de cambio en tiempo real...
      </p>
    );
  }

  if (errorApi) {
    return (
      <p
        style={{
          textAlign: 'center',
          color: '#ff4081',
          fontWeight: 'bold',
          padding: '30px',
        }}
      >
        ⚠️ Error al obtener el dólar: {errorApi}
      </p>
    );
  }

  // Conversión CLP → USD
  const usdEmprendedor = parseFloat(
    (precioEmprendedorCLP / valorDolar).toFixed(2)
  );

  const usdCorporativo = parseFloat(
    (precioCorporativoCLP / valorDolar).toFixed(2)
  );

  const usdPremium = parseFloat(
    (precioPremiumCLP / valorDolar).toFixed(2)
  );

  const seleccionarPlan = (plan) => {
    if (typeof agregarAlCarrito === 'function') {
      agregarAlCarrito(plan);
    }
  };

  const estiloTarjeta = {
    background: '#111827',
    border: '1px solid #00d9ff',
    borderRadius: '18px',
    padding: '32px 28px',
    width: '100%',
    maxWidth: '390px',
    minHeight: '390px',
    boxSizing: 'border-box',
    textAlign: 'left',
    boxShadow: '0 0 20px rgba(0, 217, 255, 0.08)',
  };

  const estiloBoton = {
    width: '100%',
    background: '#00e5a0',
    color: '#07111f',
    padding: '14px 18px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '25px',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ width: '100%' }}>

      {/* Estado actual del dólar */}
      <div
        style={{
          background: '#0d1728',
          padding: '12px 20px',
          borderRadius: '8px',
          maxWidth: '500px',
          margin: '0 auto 25px auto',
          border: '1px solid #00a650',
          fontSize: '14px',
          textAlign: 'center',
          color: '#dbeafe',
        }}
      >
        💵 Dólar actualizado vía API:{' '}
        <strong style={{ color: '#00e5a0' }}>
          ${Number(valorDolar).toLocaleString('es-CL')} CLP
        </strong>
      </div>

      {/* Título */}
      <h2
        style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '30px 0',
          color: '#ff008c',
          textShadow: '0 0 10px rgba(255, 0, 140, 0.35)',
        }}
      >
        PLANES DE DESARROLLO DISPONIBLES
      </h2>

      {/* Tarjetas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '28px',
          width: '100%',
          maxWidth: '1250px',
          margin: '0 auto 40px auto',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}
      >

        {/* PLAN EMPRENDEDOR */}
        <div style={estiloTarjeta}>
          <h3
            style={{
              fontSize: '25px',
              fontWeight: 'bold',
              color: '#00d9ff',
              margin: '0 0 18px 0',
            }}
          >
            Plan Emprendedor
          </h3>

          <p
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#00e5a0',
              margin: '0 0 8px 0',
              textShadow: '0 0 10px rgba(0, 229, 160, 0.25)',
            }}
          >
            ${usdEmprendedor.toLocaleString('en-US')} USD
          </p>

          <p
            style={{
              color: '#ffffff',
              fontSize: '16px',
              margin: '0 0 20px 0',
            }}
          >
            ${precioEmprendedorCLP.toLocaleString('es-CL')} CLP
          </p>

          <p
            style={{
              color: '#b7c5d9',
              fontSize: '16px',
              lineHeight: '1.7',
              minHeight: '80px',
              margin: 0,
            }}
          >
            Frontend React 19, integración de divisas y formulario de contacto.
          </p>

          <button
            onClick={() =>
              seleccionarPlan({
                name: 'Plan Emprendedor',
                priceUSD: usdEmprendedor,
                priceCLP: precioEmprendedorCLP,
              })
            }
            style={estiloBoton}
          >
            Seleccionar Plan
          </button>
        </div>

        {/* PLAN CORPORATIVO */}
        <div style={estiloTarjeta}>
          <h3
            style={{
              fontSize: '25px',
              fontWeight: 'bold',
              color: '#00d9ff',
              margin: '0 0 18px 0',
            }}
          >
            Plan Corporativo Full-Stack
          </h3>

          <p
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#00e5a0',
              margin: '0 0 8px 0',
              textShadow: '0 0 10px rgba(0, 229, 160, 0.25)',
            }}
          >
            ${usdCorporativo.toLocaleString('en-US')} USD
          </p>

          <p
            style={{
              color: '#ffffff',
              fontSize: '16px',
              margin: '0 0 20px 0',
            }}
          >
            ${precioCorporativoCLP.toLocaleString('es-CL')} CLP
          </p>

          <p
            style={{
              color: '#b7c5d9',
              fontSize: '16px',
              lineHeight: '1.7',
              minHeight: '80px',
              margin: 0,
            }}
          >
            Backend Django, arquitectura MVC, panel administrativo y base de
            datos relacional.
          </p>

          <button
            onClick={() =>
              seleccionarPlan({
                name: 'Plan Corporativo Full-Stack',
                priceUSD: usdCorporativo,
                priceCLP: precioCorporativoCLP,
              })
            }
            style={estiloBoton}
          >
            Seleccionar Plan
          </button>
        </div>

        {/* PLAN PREMIUM */}
        <div style={estiloTarjeta}>
          <h3
            style={{
              fontSize: '25px',
              fontWeight: 'bold',
              color: '#00d9ff',
              margin: '0 0 18px 0',
            }}
          >
            Plan API & Microservicios
          </h3>

          <p
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#00e5a0',
              margin: '0 0 8px 0',
              textShadow: '0 0 10px rgba(0, 229, 160, 0.25)',
            }}
          >
            ${usdPremium.toLocaleString('en-US')} USD
          </p>

          <p
            style={{
              color: '#ffffff',
              fontSize: '16px',
              margin: '0 0 20px 0',
            }}
          >
            ${precioPremiumCLP.toLocaleString('es-CL')} CLP
          </p>

          <p
            style={{
              color: '#b7c5d9',
              fontSize: '16px',
              lineHeight: '1.7',
              minHeight: '80px',
              margin: 0,
            }}
          >
            Endpoints JSON, autenticación de usuarios y estructura modular.
          </p>

          <button
            onClick={() =>
              seleccionarPlan({
                name: 'Plan API & Microservicios',
                priceUSD: usdPremium,
                priceCLP: precioPremiumCLP,
              })
            }
            style={estiloBoton}
          >
            Seleccionar Plan
          </button>
        </div>

      </div>
    </div>
  );
}