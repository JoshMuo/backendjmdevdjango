import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams
} from 'react-router-dom';

import {
  useEffect,
  useState
} from 'react';

import './App.css';


const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? ''
    : '/backend';


function Navegacion() {
  return (
    <nav className="nav">
      <Link
        className="nav-link"
        to="/"
      >
        Inicio
      </Link>

      <Link
        className="nav-link"
        to="/solicitudes"
      >
        Solicitudes
      </Link>
    </nav>
  );
}


function Inicio() {
  const [servicios, setServicios] = useState([]);
  const [valorDolar, setValorDolar] = useState(929.18);

  const [planesSeleccionados, setPlanesSeleccionados] = useState(() => {
    const guardados = localStorage.getItem(
      'planes_cotizacion'
    );

    if (!guardados) {
      return [];
    }

    try {
      return JSON.parse(guardados);
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    mensaje: ''
  });

  const [mensajeExito, setMensajeExito] = useState(false);


  useEffect(() => {
    fetch(
      'https://mindicador.cl/api/dolar'
    )
      .then((respuesta) =>
        respuesta.json()
      )
      .then((data) => {
        if (
          data.serie &&
          data.serie.length > 0
        ) {
          setValorDolar(
            data.serie[0].valor
          );
        }
      })
      .catch(() => {
        setValorDolar(929.18);
      });
  }, []);


  useEffect(() => {
    fetch(
      `${API_BASE_URL}/api/planes/`,
      {
        credentials: 'include'
      }
    )
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(
            'Error cargando planes'
          );
        }

        return respuesta.json();
      })
      .then((data) => {
        /*
         * Compatibilidad:
         * - backend antiguo: [...]
         * - backend nuevo: { ok: true, resultados: [...] }
         */
        const resultados =
          Array.isArray(data)
            ? data
            : data.resultados || [];

        setServicios(resultados);
      })
      .catch((error) => {
        console.error(error);
        setServicios([]);
      });
  }, []);


  useEffect(() => {
    localStorage.setItem(
      'planes_cotizacion',
      JSON.stringify(
        planesSeleccionados
      )
    );
  }, [planesSeleccionados]);


  const agregarPlan = (servicio) => {
    setPlanesSeleccionados(
      (anteriores) => [
        ...anteriores,
        {
          ...servicio,
          uid: `${servicio.id}-${Date.now()}-${Math.random()}`
        }
      ]
    );
  };


  const eliminarPlan = (uid) => {
    setPlanesSeleccionados(
      (anteriores) =>
        anteriores.filter(
          (plan) =>
            plan.uid !== uid
        )
    );
  };


  const totalCLP =
    planesSeleccionados.reduce(
      (total, plan) =>
        total +
        Number(
          plan.precio_clp || 0
        ),
      0
    );


  const totalUSD =
    valorDolar > 0
      ? (
          totalCLP /
          valorDolar
        ).toFixed(2)
      : '0.00';


  const handleChange = (evento) => {
    const {
      name,
      value
    } = evento.target;

    setFormData(
      (anterior) => ({
        ...anterior,
        [name]: value
      })
    );
  };


  const handleSubmit = async (
    evento
  ) => {
    evento.preventDefault();

    setMensajeExito(false);

    const payload = {
      nombre: formData.nombre,
      correo: formData.correo,
      mensaje: formData.mensaje,

      planes_solicitados:
        planesSeleccionados.map(
          (plan) =>
            plan.nombre
        ),

      total_estimado_clp:
        totalCLP
    };

    try {
      /*
       * Primero solicitamos el token CSRF
       * al backend Django.
       */
      const respuestaCsrf =
        await fetch(
          `${API_BASE_URL}/api/csrf/`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );

      if (!respuestaCsrf.ok) {
        throw new Error(
          'No se pudo obtener el token CSRF'
        );
      }

      const datosCsrf =
        await respuestaCsrf.json();

      const csrfToken =
        datosCsrf.csrfToken;

      if (!csrfToken) {
        throw new Error(
          'El backend no entregó un token CSRF'
        );
      }

      /*
       * Enviamos la solicitud utilizando
       * el token CSRF obtenido.
       */
      const respuesta =
        await fetch(
          `${API_BASE_URL}/api/contacto/`,
          {
            method: 'POST',

            credentials: 'include',

            headers: {
              'Content-Type':
                'application/json',

              'X-CSRFToken':
                csrfToken
            },

            body: JSON.stringify(
              payload
            )
          }
        );

      if (!respuesta.ok) {
        let detalleError = '';

        try {
          const datosError =
            await respuesta.json();

          detalleError =
            datosError.error ||
            datosError.mensaje ||
            '';
        } catch {
          detalleError = '';
        }

        throw new Error(
          detalleError ||
          'Error enviando solicitud'
        );
      }

      setMensajeExito(true);

      setFormData({
        nombre: '',
        correo: '',
        mensaje: ''
      });

      setPlanesSeleccionados([]);

    } catch (error) {
      console.error(error);

      alert(
        `No se pudo enviar la solicitud.${
          error.message
            ? ` ${error.message}`
            : ''
        }`
      );
    }
  };


  return (
    <>
      <header className="header">
        <h1 className="title">
          JMDevStudio
        </h1>

        <p className="subtitle">
          Desarrollo de Software y
          Soluciones Web Modernas
        </p>
      </header>


      <div className="dolar-banner">
        💵 Estado actual del Dólar hoy: $
        {valorDolar.toLocaleString(
          'es-CL'
        )}{' '}
        CLP
      </div>


      <section className="section">
        <h2 className="section-title">
          Planes de Desarrollo Disponibles
        </h2>

        <div className="services-grid">
          {servicios.length === 0 && (
            <p>
              No hay planes disponibles.
            </p>
          )}

          {servicios.map(
            (servicio) => {
              const precioCLP =
                Number(
                  servicio.precio_clp ||
                    0
                );

              const precioUSD =
                valorDolar > 0
                  ? (
                      precioCLP /
                      valorDolar
                    ).toFixed(2)
                  : '0.00';

              return (
                <article
                  key={servicio.id}
                  className="card"
                >
                  <h3>
                    {servicio.nombre}
                  </h3>

                  <div className="usd">
                    ${precioUSD} USD
                  </div>

                  <p>
                    $
                    {precioCLP.toLocaleString(
                      'es-CL'
                    )}{' '}
                    CLP
                  </p>

                  <p>
                    {
                      servicio.caracteristicas
                    }
                  </p>

                  <p>
                    Categoría:{' '}
                    {
                      servicio.categoria
                    }
                  </p>

                  <button
                    className="button"
                    type="button"
                    onClick={() =>
                      agregarPlan(
                        servicio
                      )
                    }
                  >
                    Seleccionar Plan
                  </button>
                </article>
              );
            }
          )}
        </div>
      </section>


      <section className="section panel">
        <h2 className="section-title">
          Planes seleccionados
        </h2>

        {planesSeleccionados.length ===
        0 ? (
          <p>
            No has seleccionado
            ningún plan aún.
          </p>
        ) : (
          <>
            {planesSeleccionados.map(
              (plan) => (
                <div
                  key={plan.uid}
                  className="selected-plan"
                >
                  <span>
                    {plan.nombre}
                  </span>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() =>
                      eliminarPlan(
                        plan.uid
                      )
                    }
                  >
                    Eliminar
                  </button>
                </div>
              )
            )}

            <h3>
              Total: $
              {totalCLP.toLocaleString(
                'es-CL'
              )}{' '}
              CLP
            </h3>

            <p>
              Aproximadamente $
              {totalUSD} USD
            </p>
          </>
        )}
      </section>


      <section className="section panel">
        <h2 className="section-title">
          Solicitar Cotización Formal
        </h2>

        {mensajeExito && (
          <div className="success">
            ¡Mensaje enviado con éxito!
          </div>
        )}

        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <label>
            Nombre o Empresa:
          </label>

          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

          <label>
            Correo Electrónico:
          </label>

          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />

          <label>
            Mensaje:
          </label>

          <textarea
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            required
            rows="5"
          />

          <button
            className="button"
            type="submit"
          >
            Enviar Solicitud
          </button>
        </form>
      </section>
    </>
  );
}


function Solicitudes() {
  const [solicitudes, setSolicitudes] =
    useState([]);

  const [pagina, setPagina] =
    useState(1);

  const [totalPaginas, setTotalPaginas] =
    useState(1);

  const [totalRegistros, setTotalRegistros] =
    useState(0);


  useEffect(() => {
    fetch(
      `${API_BASE_URL}/api/solicitudes/?page=${pagina}&page_size=3`,
      {
        credentials: 'include'
      }
    )
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(
            'Error cargando solicitudes'
          );
        }

        return respuesta.json();
      })
      .then((data) => {
        setSolicitudes(
          data.resultados || []
        );

        setTotalPaginas(
          data.total_paginas || 1
        );

        setTotalRegistros(
          data.total_registros || 0
        );
      })
      .catch((error) => {
        console.error(error);

        setSolicitudes([]);
        setTotalPaginas(1);
        setTotalRegistros(0);
      });
  }, [pagina]);


  const numerosPagina = [];

  for (
    let numero = 1;
    numero <= totalPaginas;
    numero += 1
  ) {
    numerosPagina.push(numero);
  }


  return (
    <section className="section">
      <h1 className="title">
        Solicitudes recibidas
      </h1>

      <p className="counter">
        Total de solicitudes:{' '}
        {totalRegistros}
      </p>


      <div className="requests">
        {solicitudes.map(
          (solicitud) => (
            <article
              key={solicitud.id}
              className="request-card"
            >
              <h3>
                {solicitud.nombre}
              </h3>

              <p>
                {solicitud.correo}
              </p>

              <p>
                {solicitud.mensaje}
              </p>

              <p>
                Total: $
                {Number(
                  solicitud.total_estimado_clp ||
                  0
                ).toLocaleString(
                  'es-CL'
                )}{' '}
                CLP
              </p>

              <a
                className="detail-link"
                href={
                  `/solicitudes/${solicitud.id}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir detalle en nueva pestaña
              </a>
            </article>
          )
        )}
      </div>


      <div className="pagination">
        <button
          type="button"
          disabled={pagina === 1}
          onClick={() =>
            setPagina(
              (anterior) =>
                anterior - 1
            )
          }
        >
          Anterior
        </button>


        {numerosPagina.map(
          (numero) => (
            <button
              type="button"
              key={numero}
              className={
                pagina === numero
                  ? 'active-page'
                  : ''
              }
              onClick={() =>
                setPagina(
                  numero
                )
              }
            >
              {numero}
            </button>
          )
        )}


        <button
          type="button"
          disabled={
            pagina === totalPaginas
          }
          onClick={() =>
            setPagina(
              (anterior) =>
                anterior + 1
            )
          }
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}


function DetalleSolicitud() {
  const {
    id
  } = useParams();

  const [solicitud, setSolicitud] =
    useState(null);

  const [error, setError] =
    useState('');


  useEffect(() => {
    fetch(
      `${API_BASE_URL}/api/solicitudes/${id}/`,
      {
        credentials: 'include'
      }
    )
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(
            'Solicitud no encontrada'
          );
        }

        return respuesta.json();
      })
      .then((data) => {
        setSolicitud(data);
      })
      .catch(() => {
        setError(
          'No se pudo cargar la solicitud.'
        );
      });
  }, [id]);


  if (error) {
    return (
      <div className="section">
        <h2>{error}</h2>
      </div>
    );
  }


  if (!solicitud) {
    return (
      <div className="section">
        <h2>
          Cargando solicitud...
        </h2>
      </div>
    );
  }


  return (
    <section className="section detail-page">
      <h1 className="title">
        Detalle de solicitud
      </h1>

      <div className="request-card">
        <h2>
          {solicitud.nombre}
        </h2>

        <p>
          <strong>
            Correo:
          </strong>{' '}
          {solicitud.correo}
        </p>

        <p>
          <strong>
            Mensaje:
          </strong>{' '}
          {solicitud.mensaje}
        </p>

        <p>
          <strong>
            Planes:
          </strong>
        </p>

        <ul>
          {(
            solicitud.planes_solicitados ||
            []
          ).map(
            (plan) => (
              <li key={plan}>
                {plan}
              </li>
            )
          )}
        </ul>

        <p>
          <strong>
            Total:
          </strong>{' '}
          $
          {Number(
            solicitud.total_estimado_clp ||
            0
          ).toLocaleString(
            'es-CL'
          )}{' '}
          CLP
        </p>

        <p>
          <strong>
            Fecha:
          </strong>{' '}
          {solicitud.fecha_creacion
            ? new Date(
                solicitud.fecha_creacion
              ).toLocaleString(
                'es-CL'
              )
            : 'Sin fecha'}
        </p>
      </div>
    </section>
  );
}


function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Navegacion />

        <Routes>
          <Route
            path="/"
            element={<Inicio />}
          />

          <Route
            path="/solicitudes"
            element={<Solicitudes />}
          />

          <Route
            path="/solicitudes/:id"
            element={<DetalleSolicitud />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


export default App;