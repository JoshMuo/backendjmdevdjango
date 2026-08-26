import { useState, useEffect } from 'react';
import Prices from './components/Prices';
import ContactForm from './components/ContactForm';

export default function App() {
  // Estado para el cotizador de planes (CRUD LocalStorage)
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem('cotizacion_jm_usd');
      return guardado ? JSON.parse(guardado) : [];
    } catch (e) {
      console.error('Error al leer Local Storage', e);
      return [];
    }
  });

  // Estado adicional para almacenar los envíos del Formulario Formal
  const [solicitudesFormales, setSolicitudesFormales] = useState(() => {
    try {
      const guardadoForm = localStorage.getItem('solicitudes_formales_jm');
      return guardadoForm ? JSON.parse(guardadoForm) : [];
    } catch (e) {
      console.error('Error al leer solicitudes formales', e);
      return [];
    }
  });

  // Estado para controlar la visibilidad del panel de inspección docente
  const [mostrarArregloDocente, setMostrarArregloDocente] = useState(false);

  // Sincronizar el carrito en Local Storage
  useEffect(() => {
    try {
      localStorage.setItem('cotizacion_jm_usd', JSON.stringify(carrito));
    } catch (e) {
      console.error('Error al guardar carrito en Local Storage', e);
    }
  }, [carrito]);

  // Sincronizar las solicitudes formales en Local Storage
  useEffect(() => {
    try {
      localStorage.setItem('solicitudes_formales_jm', JSON.stringify(solicitudesFormales));
    } catch (e) {
      console.error('Error al guardar formulario en Local Storage', e);
    }
  }, [solicitudesFormales]);

  // CRUD - CREAR: Añadir plan seleccionado a la cotización
  const handleAgregarAlCarrito = (plan) => {
    const nuevoItem = {
      id: Date.now().toString(),
      name: plan.name,
      priceUSD: plan.priceUSD,
      priceCLP: plan.priceCLP
    };
    setCarrito([...carrito, nuevoItem]);
  };

  // CRUD - ELIMINAR: Quitar un plan de la lista de cotizaciones
  const handleEliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // CRUD - ACTUALIZAR: Añadir requerimiento extra vía prompt básico
  const handleAgregarNota = (id) => {
    const nota = prompt('Añade un requerimiento o nota especial para este plan:');
    if (nota !== null) {
      setCarrito(carrito.map(item => item.id === id ? { ...item, nota: nota.trim() } : item));
    }
  };

  // Acción para registrar los datos del Formulario Comercial Formal
  const handleRegistrarSolicitudFormal = (datosFormulario) => {
    const nuevaSolicitud = {
      id: 'form_' + Date.now(),
      ...datosFormulario,
      fecha: new Date().toLocaleDateString()
    };
    setSolicitudesFormales([...solicitudesFormales, nuevaSolicitud]);
    alert('¡Solicitud formal registrada en el Local Storage con éxito!');
  };

  // Cálculos de totales dinámicos
  const totalUSD = carrito.reduce((sum, item) => sum + (item.priceUSD || 0), 0);
  const totalCLP = carrito.reduce((sum, item) => sum + (item.priceCLP || 0), 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Barra de Navegación Superior */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ color: '#00a650', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>JMDevStudio</h1>
        <nav style={{ display: 'flex', gap: '20px', fontWeight: 'bold', fontSize: '14px', color: '#222' }}>
          <span>Precios</span>
          <span style={{ color: '#555' }}>Contacto</span>
        </nav>
      </header>

      {/* Sección Comercial de Tarjetas de Planes (API Tipo de Cambio) */}
      <Prices 
        agregarAlCarrito={handleAgregarAlCarrito} 
        carrito={carrito} 
        eliminarDelCarrito={handleEliminarDelCarrito} 
      />

      {/* Contenedor del Cotizador (Exactamente como se ve en tu captura de pantalla) */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '25px',
        maxWidth: '750px',
        margin: '30px auto',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 20px 0', textAlign: 'center' }}>
          Planes Seleccionados para Cotizar (CRUD LocalStorage)
        </h4>

        {carrito.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px', margin: '20px 0', textAlign: 'center' }}>
            No has seleccionado ningún plan aún
          </p>
        ) : (
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            {carrito.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #e9ecef',
                fontSize: '14px'
              }}>
                <div>
                  <strong>{item.name}</strong> — <span style={{ color: '#00a650', fontWeight: 'bold' }}>${item.priceUSD.toFixed(2)} USD</span>
                  <span style={{ fontSize: '11px', color: '#888', marginLeft: '10px' }}>(Ref: ${item.priceCLP.toLocaleString('es-CL')} CLP)</span>
                  {item.nota && <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic', marginTop: '4px' }}>Nota: {item.nota}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleAgregarNota(item.id)}
                    style={{ backgroundColor: '#ffc107', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    Nota
                  </button>
                  <button 
                    onClick={() => handleEliminarDelCarrito(item.id)}
                    style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
        
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', textAlign: 'left' }}>
          Total Estimado Base: <span style={{ color: '#00a650' }}>${totalUSD.toFixed(2)} USD</span>
          <div style={{ fontSize: '12px', color: '#777', fontWeight: 'normal', marginTop: '4px' }}>
            Equivalente en pesos: ${totalCLP.toLocaleString('es-CL')} CLP
          </div>
        </div>
      </div>

      {/* Sección Inferior: Solicitar Cotización Formal */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#444', marginBottom: '20px', textTransform: 'uppercase' }}>
          Solicitar Cotización Formal
        </h3>
        
        {/* Formulario que maneja los campos comerciales */}
        <ContactForm onSubmitFormal={handleRegistrarSolicitudFormal} />

        {/* Botón Gris de la Captura: Ver Datos del Arreglo (Evaluación Docente) */}
        <button 
          onClick={() => setMostrarArregloDocente(!mostrarArregloDocente)}
          style={{ backgroundColor: '#424242', color: '#fff', padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '20px' }}
        >
          {mostrarArregloDocente ? 'Ocultar Datos del Arreglo' : 'Ver Datos del Arreglo (Evaluación Docente)'}
        </button>

        {/* Panel de inspección en crudo para que el profesor vea los arreglos del CRUD */}
        {mostrarArregloDocente && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1a1a1a', color: '#00ff66', fontFamily: 'monospace', fontSize: '12px', borderRadius: '6px', textAlign: 'left' }}>
            <h5>[Inspección de Estados y Arreglos en LocalStorage]</h5>
            <h6>• Arreglo Cotización actual (Planes):</h6>
            <pre>{JSON.stringify(carrito, null, 2)}</pre>
            <h6>• Arreglo Solicitudes de Formularios Registrados:</h6>
            <pre>{JSON.stringify(solicitudesFormales, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Footer Oficial */}
      <footer style={{ marginTop: '60px', padding: '20px 0', borderTop: '1px solid #eee', fontSize: '12px', color: '#999', textAlign: 'center' }}>
        © 2026 JMDevStudio. Todos los derechos reservados.
      </footer>
    </div>
  );
}