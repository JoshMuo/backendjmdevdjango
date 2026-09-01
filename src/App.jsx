import { useState, useEffect } from 'react';
import './App.css';

const SERVICIOS_DEFAULT = [
  {
    id: 1,
    nombre: 'Plan Emprendedor',
    descripcion: 'Ideal para validar ideas de negocios en etapas iniciales. Landing page rápida y responsiva.',
    precio_clp: 450000
  },
  {
    id: 2,
    nombre: 'Plan Corporativo',
    descripcion: 'Perfecto para empresas que requieren integraciones con sistemas locales y bases de datos.',
    precio_clp: 850000
  },
  {
    id: 3,
    nombre: 'Plan Premium E-Commerce',
    descripcion: 'Aplicaciones transaccionales robustas con pasarelas de pago y soporte full-stack.',
    precio_clp: 1350000
  }
];

function App() {
  const [servicios, setServicios] = useState([]);
  const [valorDolar, setValorDolar] = useState(929.18);
  const [planesSeleccionados, setPlanesSeleccionados] = useState(() => {
    const saved = localStorage.getItem('planes_cotizacion');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    mensaje: ''
  });
  const [mensajeExito, setMensajeExito] = useState(false);

  // Obtener valor del dólar en tiempo real vía API
  useEffect(() => {
    fetch('https://mindicador.cl/api/dolar')
      .then((res) => res.json())
      .then((data) => {
        if (data.serie && data.serie[0]) {
          setValorDolar(data.serie[0].valor);
        }
      })
      .catch(() => {
        setValorDolar(929.18);
      });
  }, []);

  // Obtener catálogo desde backend Django o cargar datos por defecto
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/servicios/')
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar');
        return res.json();
      })
      .then((data) => {
        setServicios(data.length > 0 ? data : SERVICIOS_DEFAULT);
      })
      .catch(() => {
        setServicios(SERVICIOS_DEFAULT);
      });
  }, []);

  // Guardar en LocalStorage cada vez que cambie la selección
  useEffect(() => {
    localStorage.setItem('planes_cotizacion', JSON.stringify(planesSeleccionados));
  }, [planesSeleccionados]);

  // Manejador para agregar plan al cotizador
  const agregarPlan = (servicio) => {
    setPlanesSeleccionados((prev) => [...prev, { ...servicio, uid: Date.now() + Math.random() }]);
  };

  // Manejador para eliminar plan del cotizador
  const eliminarPlan = (uid) => {
    setPlanesSeleccionados((prev) => prev.filter((item) => item.uid !== uid));
  };

  // Cálculos de totales
  const totalCLP = planesSeleccionados.reduce((acc, curr) => acc + curr.precio_clp, 0);
  const totalUSD = valorDolar > 0 ? (totalCLP / valorDolar).toFixed(2) : '0.00';

  // Manejo del formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      planes_solicitados: planesSeleccionados.map((p) => p.nombre),
      total_estimado_clp: totalCLP
    };

    fetch('http://127.0.0.1:8000/api/contacto/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al enviar');
        return res.json();
      })
      .then(() => {
        setMensajeExito(true);
        setFormData({ nombre: '', correo: '', mensaje: '' });
      })
      .catch(() => {
        setMensajeExito(true);
        setFormData({ nombre: '', correo: '', mensaje: '' });
      });
  };

  return (
    <div className="container">
      {/* Encabezado */}
      <header className="header">
        <h1 className="title">JMDevStudio</h1>
        <p className="subtitle">Desarrollo de Software y Soluciones Web Modernas</p>
      </header>

      {/* Banner Dólar en Vivo */}
      <div className="dolar-banner">
        <span>💵 Estado actual del Dólar hoy: ${valorDolar.toLocaleString('es-CL')} CLP (Actualizado vía API)</span>
      </div>

      {/* Catálogo de Planes Disponibles */}
      <section className="services-section">
        <h2 className="section-title">Planes de Desarrollo Disponibles</h2>
        <div className="services-grid">
          {servicios.map((s) => {
            const precioUSD = (s.precio_clp / valorDolar).toFixed(2);
            return (
              <div key={s.id} className="service-card">
                <h3 className="service-title">{s.nombre}</h3>
                <div className="service-price-usd">${precioUSD} USD</div>
                <div className="service-price-clp">Ref: ${s.precio_clp.toLocaleString('es-CL')} CLP</div>
                <p className="service-desc">{s.descripcion}</p>
                <button type="button" onClick={() => agregarPlan(s)} className="btn-select">
                  Seleccionar Plan
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Planes Seleccionados (CRUD LocalStorage) */}
      <section className="carrito-section">
        <h2 className="section-title">Planes Seleccionados para Cotizar (CRUD LocalStorage)</h2>
        {planesSeleccionados.length === 0 ? (
          <p className="carrito-empty">No has seleccionado ningún plan aún</p>
        ) : (
          <ul className="carrito-list">
            {planesSeleccionados.map((item) => (
              <li key={item.uid} className="carrito-item">
                <span>{item.nombre} - ${(item.precio_clp / valorDolar).toFixed(2)} USD</span>
                <button type="button" onClick={() => eliminarPlan(item.uid)} className="btn-delete">
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="total-container">
          <div>
            <div className="total-label">Total Estimado Base:</div>
            <div className="total-clp">Equivalente en pesos: ${totalCLP.toLocaleString('es-CL')} CLP</div>
          </div>
          <div className="total-usd">${totalUSD} USD</div>
        </div>
      </section>

      {/* Formulario de Cotización Formal */}
      <section className="contact-section">
        <h2 className="section-title">Solicitar Cotización Formal</h2>

        {mensajeExito && (
          <div className="alert-success">
            ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
          </div>
        )}

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre o Empresa:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre o razón social"
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico:</label>
            <input
              type="email"
              id="correo"
              name="correo"
              required
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje:</label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows="4"
              required
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Detalles adicionales sobre tu proyecto..."
            ></textarea>
          </div>

          <button type="submit" className="btn-submit">
            Enviar Solicitud
          </button>
        </form>
      </section>
    </div>
  );
}

export default App;