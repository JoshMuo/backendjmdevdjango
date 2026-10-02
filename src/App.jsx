import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import { useEffect, useState } from 'react';

import './App.css';


const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? ''
    : '/backend';


/* ============================================================
   NAVEGACIÓN PRINCIPAL
============================================================ */

function Navegacion() {
  return (
    <nav className="nav">

      <Link className="nav-link" to="/">
        Inicio
      </Link>

      <Link className="nav-link" to="/solicitudes">
        Solicitudes
      </Link>

      <Link className="nav-link" to="/api">
        API REST
      </Link>

    </nav>
  );
}


/* ============================================================
   LOGIN ADMINISTRADOR
============================================================ */

function LoginAdministrador({ onLoginCorrecto }) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');


  const obtenerCsrf = async () => {

    const respuesta = await fetch(
      `${API_BASE_URL}/api/csrf/`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        'No se pudo obtener el token CSRF.'
      );
    }

    const datos = await respuesta.json();

    if (!datos.csrfToken) {
      throw new Error(
        'El backend no entregó el token CSRF.'
      );
    }

    return datos.csrfToken;
  };


  const handleSubmit = async (evento) => {

    evento.preventDefault();

    setError('');
    setCargando(true);

    try {

      const csrfToken = await obtenerCsrf();


      const respuesta = await fetch(
        `${API_BASE_URL}/api/login/`,
        {
          method: 'POST',
          credentials: 'include',

          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );


      const datos = await respuesta.json();


      if (!respuesta.ok || !datos.ok) {

        throw new Error(
          datos.error ||
          'Usuario o contraseña incorrectos.'
        );

      }


      if (!datos.usuario?.es_staff) {

        await fetch(
          `${API_BASE_URL}/api/logout/`,
          {
            method: 'POST',
            credentials: 'include',

            headers: {
              'X-CSRFToken': csrfToken,
            },
          }
        );


        throw new Error(
          'El usuario debe tener permisos de administrador/staff.'
        );

      }


      onLoginCorrecto(datos.usuario);

      setPassword('');

    } catch (errorLogin) {

      setError(
        errorLogin.message ||
        'No fue posible iniciar sesión.'
      );

    } finally {

      setCargando(false);

    }

  };


  return (

    <section className="section panel">

      <h1 className="title">
        Acceso de Administrador
      </h1>


      <p className="counter">
        Inicia sesión para revisar las solicitudes recibidas.
      </p>


      {error && (

        <div className="error-message">
          ⚠️ {error}
        </div>

      )}


      <form
        className="form"
        onSubmit={handleSubmit}
      >

        <label>
          Usuario:
        </label>


        <input
          type="text"
          value={username}
          onChange={(evento) =>
            setUsername(evento.target.value)
          }
          autoComplete="username"
          required
        />


        <label>
          Contraseña:
        </label>


        <input
          type="password"
          value={password}
          onChange={(evento) =>
            setPassword(evento.target.value)
          }
          autoComplete="current-password"
          required
        />


        <button
          className="button"
          type="submit"
          disabled={cargando}
        >

          {cargando
            ? 'Iniciando sesión...'
            : 'Iniciar sesión'}

        </button>

      </form>

    </section>

  );

}


/* ============================================================
   PÁGINA INICIO
============================================================ */

function Inicio() {

  const [servicios, setServicios] = useState([]);

  const [valorDolar, setValorDolar] =
    useState(929.18);


  const [
    planesSeleccionados,
    setPlanesSeleccionados,
  ] = useState(() => {

    const guardados =
      localStorage.getItem(
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
    mensaje: '',
  });


  const [
    mensajeExito,
    setMensajeExito,
  ] = useState(false);


  /* ==========================================================
     OBTENER DÓLAR
  ========================================================== */

  useEffect(() => {

    const obtenerDolar = async () => {

      try {

        const respuesta = await fetch(
          'https://mindicador.cl/api/dolar'
        );


        if (!respuesta.ok) {

          throw new Error(
            'No fue posible obtener el dólar.'
          );

        }


        const data =
          await respuesta.json();


        if (
          data.serie &&
          data.serie.length > 0
        ) {

          setValorDolar(
            data.serie[0].valor
          );

        }

      } catch (error) {

        console.error(error);

        setValorDolar(929.18);

      }

    };


    obtenerDolar();

  }, []);


  /* ==========================================================
     CARGAR PLANES DESDE API DJANGO
  ========================================================== */

  useEffect(() => {

    const cargarPlanes = async () => {

      try {

        const respuesta = await fetch(
          `${API_BASE_URL}/api/planes/`,
          {
            credentials: 'include',
          }
        );


        if (!respuesta.ok) {

          throw new Error(
            'Error cargando planes.'
          );

        }


        const data =
          await respuesta.json();


        const resultados =
          Array.isArray(data)
            ? data
            : data.resultados || [];


        setServicios(resultados);

      } catch (error) {

        console.error(error);

        setServicios([]);

      }

    };


    cargarPlanes();

  }, []);


  /* ==========================================================
     GUARDAR CARRITO
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
            `${servicio.id}-${Date.now()}-${Math.random()}`,

        },

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
     CAMBIO FORMULARIO
  ========================================================== */

  const handleChange = (evento) => {

    const {
      name,
      value,
    } = evento.target;


    setFormData(
      (anterior) => ({

        ...anterior,

        [name]: value,

      })
    );

  };


  /* ==========================================================
     ENVIAR SOLICITUD
  ========================================================== */

  const handleSubmit = async (evento) => {

    evento.preventDefault();

    setMensajeExito(false);


    const payload = {

      nombre:
        formData.nombre,

      correo:
        formData.correo,

      mensaje:
        formData.mensaje,

      planes_solicitados:
        planesSeleccionados.map(
          (plan) =>
            plan.nombre
        ),

      total_estimado_clp:
        totalCLP,

    };


    try {

      const respuestaCsrf =
        await fetch(
          `${API_BASE_URL}/api/csrf/`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );


      if (!respuestaCsrf.ok) {

        throw new Error(
          'No se pudo obtener el token CSRF.'
        );

      }


      const datosCsrf =
        await respuestaCsrf.json();


      if (!datosCsrf.csrfToken) {

        throw new Error(
          'El backend no entregó un token CSRF.'
        );

      }


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
                datosCsrf.csrfToken,

            },

            body:
              JSON.stringify(
                payload
              ),

          }
        );


      const datosRespuesta =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datosRespuesta.error ||
          datosRespuesta.mensaje ||
          'Error enviando solicitud.'
        );

      }


      setMensajeExito(true);


      setFormData({

        nombre: '',
        correo: '',
        mensaje: '',

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
          Desarrollo de Software y Soluciones Web Modernas
        </p>

      </header>


      <div className="dolar-banner">

        💵 Estado actual del Dólar hoy: $

        {valorDolar.toLocaleString(
          'es-CL'
        )}

        {' '}CLP

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
                    )}
                    {' '}CLP
                  </p>


                  <p>
                    {servicio.caracteristicas}
                  </p>


                  <p>
                    Categoría:{' '}
                    {servicio.categoria}
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


        {planesSeleccionados.length === 0 ? (

          <p>
            No has seleccionado ningún plan aún.
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
              )}

              {' '}CLP

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


/* ============================================================
   SOLICITUDES
============================================================ */

function Solicitudes() {

  const [usuario, setUsuario] =
    useState(null);


  const [
    verificandoSesion,
    setVerificandoSesion,
  ] = useState(true);


  const [
    solicitudes,
    setSolicitudes,
  ] = useState([]);


  const [pagina, setPagina] =
    useState(1);


  const [
    totalPaginas,
    setTotalPaginas,
  ] = useState(1);


  const [
    totalRegistros,
    setTotalRegistros,
  ] = useState(0);


  const [error, setError] =
    useState('');


  /* ==========================================================
     COMPROBAR SESIÓN
  ========================================================== */

  const comprobarSesion =
    async () => {

      try {

        setVerificandoSesion(true);


        const respuesta =
          await fetch(
            `${API_BASE_URL}/api/sesion/`,
            {
              method: 'GET',
              credentials: 'include',
            }
          );


        const data =
          await respuesta.json();


        if (
          data.ok &&
          data.autenticado &&
          data.usuario?.es_staff
        ) {

          setUsuario(
            data.usuario
          );

        } else {

          setUsuario(null);

        }


      } catch (errorSesion) {

        console.error(
          errorSesion
        );

        setUsuario(null);

      } finally {

        setVerificandoSesion(false);

      }

    };


  useEffect(() => {

    comprobarSesion();

  }, []);


  /* ==========================================================
     CARGAR SOLICITUDES
  ========================================================== */

  useEffect(() => {

    if (!usuario) {
      return;
    }


    const cargarSolicitudes =
      async () => {

        try {

          setError('');


          const respuesta =
            await fetch(
              `${API_BASE_URL}/api/solicitudes/?page=${pagina}&page_size=3`,
              {
                credentials: 'include',
              }
            );


          const data =
            await respuesta.json();


          if (!respuesta.ok) {

            throw new Error(
              data.error ||
              'Error cargando solicitudes.'
            );

          }


          setSolicitudes(
            data.resultados || []
          );


          setTotalPaginas(
            data.total_paginas || 1
          );


          setTotalRegistros(
            data.total_registros || 0
          );


        } catch (
          errorSolicitudes
        ) {

          console.error(
            errorSolicitudes
          );


          setSolicitudes([]);

          setTotalPaginas(1);

          setTotalRegistros(0);


          setError(
            errorSolicitudes.message ||
            'No fue posible cargar las solicitudes.'
          );

        }

      };


    cargarSolicitudes();

  }, [
    pagina,
    usuario,
  ]);


  /* ==========================================================
     CERRAR SESIÓN
  ========================================================== */

  const cerrarSesion =
    async () => {

      try {

        const respuestaCsrf =
          await fetch(
            `${API_BASE_URL}/api/csrf/`,
            {
              credentials: 'include',
            }
          );


        const datosCsrf =
          await respuestaCsrf.json();


        await fetch(
          `${API_BASE_URL}/api/logout/`,
          {
            method: 'POST',
            credentials: 'include',

            headers: {
              'X-CSRFToken':
                datosCsrf.csrfToken || '',
            },

          }
        );


      } catch (errorLogout) {

        console.error(
          errorLogout
        );

      } finally {

        setUsuario(null);

        setSolicitudes([]);

        setPagina(1);

        setTotalPaginas(1);

        setTotalRegistros(0);

      }

    };


  /* ==========================================================
     VERIFICANDO SESIÓN
  ========================================================== */

  if (verificandoSesion) {

    return (

      <section className="section">

        <h1 className="title">
          Verificando acceso...
        </h1>

      </section>

    );

  }


  /* ==========================================================
     LOGIN
  ========================================================== */

  if (!usuario) {

    return (

      <LoginAdministrador
        onLoginCorrecto={
          (usuarioAutenticado) => {

            setError('');

            setPagina(1);

            setUsuario(
              usuarioAutenticado
            );

          }
        }
      />

    );

  }


  /* ==========================================================
     PAGINACIÓN
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
     VISTA SOLICITUDES
  ========================================================== */

  return (

    <section className="section">

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >

        <div>

          <h1 className="title">
            Solicitudes recibidas
          </h1>


          <p className="counter">

            Total de solicitudes:{' '}

            {totalRegistros}

          </p>

        </div>


        <div>

          <p
            style={{
              margin: '0 0 8px 0',
            }}
          >

            Administrador:{' '}

            <strong>
              {usuario.username}
            </strong>

          </p>


          <button
            className="delete-button"
            type="button"
            onClick={
              cerrarSesion
            }
          >

            Cerrar sesión

          </button>

        </div>

      </div>


      {error && (

        <div className="error-message">
          ⚠️ {error}
        </div>

      )}


      <div className="requests">

        {solicitudes.length === 0 &&
          !error && (

            <p>
              No existen solicitudes registradas.
            </p>

        )}


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
                )}

                {' '}CLP

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
                setPagina(numero)
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


/* ============================================================
   DETALLE DE SOLICITUD
============================================================ */

function DetalleSolicitud() {

  const { id } =
    useParams();


  const [
    solicitud,
    setSolicitud,
  ] = useState(null);


  const [error, setError] =
    useState('');


  const [
    verificando,
    setVerificando,
  ] = useState(true);


  useEffect(() => {

    const cargarDetalle =
      async () => {

        try {

          const respuesta =
            await fetch(
              `${API_BASE_URL}/api/solicitudes/${id}/`,
              {
                credentials: 'include',
              }
            );


          const data =
            await respuesta.json();


          if (!respuesta.ok) {

            throw new Error(
              data.error ||
              'No tienes autorización para ver esta solicitud.'
            );

          }


          setSolicitud(
            data.solicitud || data
          );


        } catch (
          errorDetalle
        ) {

          console.error(
            errorDetalle
          );


          setError(
            errorDetalle.message ||
            'No se pudo cargar la solicitud.'
          );


        } finally {

          setVerificando(false);

        }

      };


    cargarDetalle();

  }, [id]);


  if (verificando) {

    return (

      <div className="section">

        <h2>
          Cargando solicitud...
        </h2>

      </div>

    );

  }


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
          Volver a Solicitudes
        </Link>

      </div>

    );

  }


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


        <ul>

          {(
            solicitud.planes_solicitados ||
            []
          ).map(
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
          )}

          {' '}CLP

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


        <Link
          className="detail-link"
          to="/solicitudes"
        >
          Volver a Solicitudes
        </Link>

      </div>

    </section>

  );

}


/* ============================================================
   PÁGINA API REST
============================================================ */

function ApiRest() {

  const endpoints = [

    {
      metodo: 'GET',

      ruta: '/api/planes/',

      descripcion:
        'Obtiene el catálogo de planes disponibles. Endpoint público.',

      protegido: false,
    },


    {
      metodo: 'POST',

      ruta: '/api/contacto/',

      descripcion:
        'Registra una nueva solicitud de cotización en el backend.',

      protegido: false,
    },


    {
      metodo: 'POST',

      ruta: '/api/login/',

      descripcion:
        'Inicia sesión mediante usuario y contraseña Django.',

      protegido: false,
    },


    {
      metodo: 'GET',

      ruta: '/api/sesion/',

      descripcion:
        'Consulta el estado actual de la sesión.',

      protegido: false,
    },


    {
      metodo: 'GET',

      ruta: '/api/solicitudes/',

      descripcion:
        'Lista las solicitudes con paginación. Requiere administrador/staff.',

      protegido: true,
    },


    {
      metodo: 'GET',

      ruta: '/api/solicitudes/{id}/',

      descripcion:
        'Obtiene el detalle de una solicitud. Requiere administrador/staff.',

      protegido: true,
    },


    {
      metodo: 'PUT',

      ruta: '/api/solicitudes/{id}/',

      descripcion:
        'Actualiza una solicitud. Requiere administrador/staff.',

      protegido: true,
    },


    {
      metodo: 'DELETE',

      ruta: '/api/solicitudes/{id}/',

      descripcion:
        'Elimina una solicitud. Requiere administrador/staff.',

      protegido: true,
    },

  ];


  const abrirEndpoint =
    (ruta) => {

      const rutaReal =
        ruta.replace(
          '{id}',
          '1'
        );


      window.open(
        `${API_BASE_URL}${rutaReal}`,
        '_blank',
        'noopener,noreferrer'
      );

    };


  return (

    <section className="section">

      <h1 className="title">
        API RESTful - JMDevStudio
      </h1>


      <p className="counter">

        Esta sección permite revisar visualmente los
        endpoints REST implementados para la evaluación.

      </p>


      <div className="request-card">

        <h2>
          Arquitectura de la API
        </h2>


        <p>

          <strong>
            Backend:
          </strong>{' '}

          Django

        </p>


        <p>

          <strong>
            Formato:
          </strong>{' '}

          JSON

        </p>


        <p>

          <strong>
            Autenticación:
          </strong>{' '}

          sesión Django + CSRF

        </p>


        <p>

          <strong>
            Protección:
          </strong>{' '}

          los endpoints de solicitudes requieren usuario
          autenticado con permisos staff.

        </p>


        <p>

          <strong>
            Frontend:
          </strong>{' '}

          React

        </p>

      </div>


      <div className="requests">

        {endpoints.map(
          (endpoint) => (

            <article
              className="request-card"
              key={
                `${endpoint.metodo}-${endpoint.ruta}`
              }
            >

              <h3>

                {endpoint.metodo}{' '}

                {endpoint.ruta}

              </h3>


              <p>
                {endpoint.descripcion}
              </p>


              <p>

                <strong>

                  {endpoint.protegido

                    ? '🔐 Requiere administrador'

                    : '🌐 Endpoint disponible'}

                </strong>

              </p>


              {(
                endpoint.metodo === 'GET' ||
                endpoint.ruta === '/api/planes/'
              ) && (

                <button
                  className="button"
                  type="button"
                  onClick={() =>
                    abrirEndpoint(
                      endpoint.ruta
                    )
                  }
                >

                  Abrir endpoint

                </button>

              )}

            </article>

          )
        )}

      </div>


      <div className="request-card">

        <h2>
          Para revisar solicitudes
        </h2>


        <p>

          Primero ingresa a la sección{' '}

          <strong>
            Solicitudes
          </strong>{' '}

          e inicia sesión como administrador.

        </p>


        <Link
          className="button"
          to="/solicitudes"
        >
          Ir a Solicitudes
        </Link>

      </div>

    </section>

  );

}


/* ============================================================
   APP PRINCIPAL
============================================================ */

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


          <Route
            path="/api"
            element={<ApiRest />}
          />

        </Routes>

      </div>

    </BrowserRouter>

  );

}


export default App;