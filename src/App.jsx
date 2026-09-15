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


/* ============================================================
   NAVEGACIÓN
============================================================ */

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


/* ============================================================
   PÁGINA DE INICIO
============================================================ */

function Inicio() {
  const [servicios, setServicios] = useState([]);
  const [valorDolar, setValorDolar] = useState(929.18);

  const [
    planesSeleccionados,
    setPlanesSeleccionados
  ] = useState(() => {
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

  const [
    mensajeExito,
    setMensajeExito
  ] = useState(false);

  const [
    enviando,
    setEnviando
  ] = useState(false);


  /* ==========================================================
     VALOR DEL DÓLAR
  ========================================================== */

  useEffect(() => {
    fetch(
      'https://mindicador.cl/api/dolar'
    )
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(
            'No fue posible obtener el dólar'
          );
        }

        return respuesta.json();
      })
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


  /* ==========================================================
     CARGAR PLANES DESDE DJANGO
  ========================================================== */

  useEffect(() => {
    fetch(
      '/api/planes/',
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
        if (
          data.ok &&
          Array.isArray(data.resultados)
        ) {
          setServicios(
            data.resultados
          );
        } else {
          setServicios([]);
        }
      })
      .catch((error) => {
        console.error(error);
        setServicios([]);
      });
  }, []);


  /* ==========================================================
     GUARDAR COTIZACIÓN LOCAL
  ========================================================== */

  useEffect(() => {
    localStorage.setItem(
      'planes_cotizacion',
      JSON.stringify(
        planesSeleccionados
      )
    );
  }, [planesSeleccionados]);


  /* ==========================================================
     AGREGAR PLAN
  ========================================================== */

  const agregarPlan = (servicio) => {
    setPlanesSeleccionados(
      (anteriores) => [
        ...anteriores,
        {
          ...servicio,
          uid:
            `${servicio.id}-` +
            `${Date.now()}-` +
            `${Math.random()}`
        }
      ]
    );
  };


  /* ==========================================================
     ELIMINAR PLAN
  ========================================================== */

  const eliminarPlan = (uid) => {
    setPlanesSeleccionados(
      (anteriores) =>
        anteriores.filter(
          (plan) =>
            plan.uid !== uid
        )
    );
  };


  /* ==========================================================
     TOTALES
  ========================================================== */

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


  /* ==========================================================
     FORMULARIO
  ========================================================== */

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

    if (mensajeExito) {
      setMensajeExito(false);
    }
  };


  /* ==========================================================
     OBTENER TOKEN CSRF
  ========================================================== */

  const obtenerCsrfToken = async () => {
    const respuesta = await fetch(
      '/api/csrf/',
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        'No fue posible obtener el token CSRF.'
      );
    }

    const data = await respuesta.json();

    if (
      !data.ok ||
      !data.csrfToken
    ) {
      throw new Error(
        'Django no entregó un token CSRF válido.'
      );
    }

    return data.csrfToken;
  };


  /* ==========================================================
     ENVIAR SOLICITUD
  ========================================================== */

  const handleSubmit = async (
    evento
  ) => {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    setEnviando(true);
    setMensajeExito(false);

    const payload = {
      nombre:
        formData.nombre.trim(),

      correo:
        formData.correo.trim(),

      mensaje:
        formData.mensaje.trim(),

      planes_solicitados:
        planesSeleccionados.map(
          (plan) =>
            plan.nombre
        ),

      total_estimado_clp:
        totalCLP
    };

    try {
      /* ------------------------------------------------------
         1. Obtener token CSRF desde Django
      ------------------------------------------------------ */

      const csrfToken =
        await obtenerCsrfToken();


      /* ------------------------------------------------------
         2. Enviar solicitud protegida con CSRF
      ------------------------------------------------------ */

      const respuesta =
        await fetch(
          '/api/contacto/',
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


      /* ------------------------------------------------------
         3. Leer respuesta Django
      ------------------------------------------------------ */

      const data =
        await respuesta.json();


      if (!respuesta.ok) {
        throw new Error(
          data.error ||
          'Error enviando solicitud'
        );
      }


      if (!data.ok) {
        throw new Error(
          data.error ||
          'No fue posible registrar la solicitud.'
        );
      }


      /* ------------------------------------------------------
         4. ÉXITO
      ------------------------------------------------------ */

      setMensajeExito(true);

      setFormData({
        nombre: '',
        correo: '',
        mensaje: ''
      });

      setPlanesSeleccionados([]);

      localStorage.removeItem(
        'planes_cotizacion'
      );

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        'No se pudo enviar la solicitud.'
      );

    } finally {
      setEnviando(false);
    }
  };


  /* ==========================================================
     INTERFAZ
  ========================================================== */

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


      {/* =====================================================
          PLANES
      ===================================================== */}

      <section className="section">
        <h2 className="section-title">
          Planes de Desarrollo Disponibles
        </h2>

        <div className="services-grid">
          {servicios.length === 0 ? (
            <p>
              No hay planes disponibles.
            </p>
          ) : (
            servicios.map(
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
                        servicio
                          .caracteristicas
                      }
                    </p>

                    <p>
                      Categoría:{' '}
                      {
                        servicio
                          .categoria
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
            )
          )}
        </div>
      </section>


      {/* =====================================================
          COTIZACIÓN
      ===================================================== */}

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


      {/* =====================================================
          FORMULARIO
      ===================================================== */}

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
            minLength="2"
            maxLength="150"
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
            minLength="10"
            rows="5"
          />


          <button
            className="button"
            type="submit"
            disabled={enviando}
          >
            {
              enviando
                ? 'Enviando...'
                : 'Enviar Solicitud'
            }
          </button>
        </form>
      </section>
    </>
  );
}


/* ============================================================
   SOLICITUDES
============================================================ */

function Solicitudes() {
  const [
    solicitudes,
    setSolicitudes
  ] = useState([]);

  const [
    pagina,
    setPagina
  ] = useState(1);

  const [
    totalPaginas,
    setTotalPaginas
  ] = useState(1);

  const [
    totalRegistros,
    setTotalRegistros
  ] = useState(0);

  const [
    error,
    setError
  ] = useState('');


  /* ==========================================================
     CARGAR SOLICITUDES
  ========================================================== */

  useEffect(() => {
    setError('');

    fetch(
      `/api/solicitudes/?page=${pagina}&page_size=3`,
      {
        credentials: 'include'
      }
    )
      .then(async (respuesta) => {
        const data =
          await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            data.error ||
            'Error cargando solicitudes'
          );
        }

        return data;
      })
      .then((data) => {
        setSolicitudes(
          Array.isArray(
            data.resultados
          )
            ? data.resultados
            : []
        );

        setTotalPaginas(
          Number(
            data.total_paginas ||
            1
          )
        );

        setTotalRegistros(
          Number(
            data.total_registros ||
            0
          )
        );
      })
      .catch((errorCarga) => {
        console.error(
          errorCarga
        );

        setSolicitudes([]);

        setError(
          errorCarga.message ||
          'No se pudieron cargar las solicitudes.'
        );
      });
  }, [pagina]);


  /* ==========================================================
     NÚMEROS DE PÁGINA
  ========================================================== */

  const numerosPagina = [];

  for (
    let numero = 1;
    numero <= totalPaginas;
    numero += 1
  ) {
    numerosPagina.push(
      numero
    );
  }


  /* ==========================================================
     INTERFAZ
  ========================================================== */

  return (
    <section className="section">
      <h1 className="title">
        Solicitudes recibidas
      </h1>

      <p className="counter">
        Total de solicitudes:{' '}
        {totalRegistros}
      </p>


      {error && (
        <div className="error">
          {error}
        </div>
      )}


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
                  solicitud
                    .total_estimado_clp ||
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


      {/* =====================================================
          PAGINACIÓN
      ===================================================== */}

      {totalPaginas > 0 && (
        <div className="pagination">
          <button
            type="button"
            disabled={
              pagina === 1
            }
            onClick={() =>
              setPagina(
                (anterior) =>
                  Math.max(
                    1,
                    anterior - 1
                  )
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
              pagina >=
              totalPaginas
            }
            onClick={() =>
              setPagina(
                (anterior) =>
                  Math.min(
                    totalPaginas,
                    anterior + 1
                  )
              )
            }
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
}


/* ============================================================
   DETALLE DE SOLICITUD
============================================================ */

function DetalleSolicitud() {
  const {
    id
  } = useParams();

  const [
    solicitud,
    setSolicitud
  ] = useState(null);

  const [
    error,
    setError
  ] = useState('');


  /* ==========================================================
     CARGAR DETALLE
  ========================================================== */

  useEffect(() => {
    setError('');
    setSolicitud(null);

    fetch(
      `/api/solicitudes/${id}/`,
      {
        credentials: 'include'
      }
    )
      .then(async (respuesta) => {
        const data =
          await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            data.error ||
            'Solicitud no encontrada'
          );
        }

        return data;
      })
      .then((data) => {
        if (
          !data.ok ||
          !data.solicitud
        ) {
          throw new Error(
            'Respuesta de solicitud no válida'
          );
        }

        setSolicitud(
          data.solicitud
        );
      })
      .catch((errorCarga) => {
        console.error(
          errorCarga
        );

        setError(
          errorCarga.message ||
          'No se pudo cargar la solicitud.'
        );
      });
  }, [id]);


  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="section">
        <h2>
          {error}
        </h2>

        <Link
          className="detail-link"
          to="/solicitudes"
        >
          Volver a solicitudes
        </Link>
      </div>
    );
  }


  /* ==========================================================
     CARGANDO
  ========================================================== */

  if (!solicitud) {
    return (
      <div className="section">
        <h2>
          Cargando solicitud...
        </h2>
      </div>
    );
  }


  /* ==========================================================
     PLANES
  ========================================================== */

  const planes =
    Array.isArray(
      solicitud.planes_solicitados
    )
      ? solicitud.planes_solicitados
      : [];


  /* ==========================================================
     INTERFAZ
  ========================================================== */

  return (
    <section
      className="section detail-page"
    >
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


        {planes.length > 0 ? (
          <ul>
            {planes.map(
              (plan, indice) => (
                <li
                  key={
                    `${plan}-${indice}`
                  }
                >
                  {plan}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>
            No hay planes asociados.
          </p>
        )}


        <p>
          <strong>
            Total:
          </strong>{' '}
          $
          {Number(
            solicitud
              .total_estimado_clp ||
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

          {
            solicitud.fecha_creacion
              ? new Date(
                  solicitud
                    .fecha_creacion
                ).toLocaleString(
                  'es-CL'
                )
              : 'Sin fecha'
          }
        </p>
      </div>
    </section>
  );
}


/* ============================================================
   APLICACIÓN
============================================================ */

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Navegacion />

        <Routes>
          <Route
            path="/"
            element={
              <Inicio />
            }
          />

          <Route
            path="/solicitudes"
            element={
              <Solicitudes />
            }
          />

          <Route
            path="/solicitudes/:id"
            element={
              <DetalleSolicitud />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


export default App;