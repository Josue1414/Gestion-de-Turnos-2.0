// src/App.js



import React, { useState, useEffect, useRef, useCallback } from "react";

import TurnosTable from "./components/TurnosTable";

import AgregarPersonaForm from "./components/AgregarPersonaForm";

import AdminPanel from "./components/AdminPanel";

import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap/dist/js/bootstrap.bundle.min.js";

import ParticipantesPanel from "./components/ParticipantesPanel";

import MapViewer from "./components/MapViewer";

import defaultCroquis from "./images/default_croquis.jpg";

import html2canvas from "html2canvas";

import LoginModal from "./components/LoginModal";



const dias = ["viernes", "sábado", "domingo"];

const API_URL =

    "https://script.google.com/macros/s/AKfycbzIHRB1u69pJOLQPUlKzyGUUyVmNudW-g6lzE-iJmiA55m4nEyw1SrbfLJ57gQhXbvc/exec";



function App() {

    const [selectedDay, setSelectedDay] = useState("viernes");

    // MODIFICACIÓN CLAVE AQUÍ: Inicializa asignaciones directamente desde localStorage

    const [asignaciones, setAsignaciones] = useState(() => {

        const savedAsignaciones = localStorage.getItem("asignaciones");

        return savedAsignaciones ? JSON.parse(savedAsignaciones) : {};

    });

    // ELIMINA EL useEffect para cargar asignaciones (el que tenía [] como dependencia)

    // porque la inicialización ya lo hace.



    const [modoEdicion, setModoEdicion] = useState(null);

    const [alerta, setAlerta] = useState(null);

    const [confirmarEliminar, setConfirmarEliminar] = useState(null);

    const [mostrarDisponibles, setMostrarDisponibles] = useState(false);

    const [showAdmin, setShowAdmin] = useState(false);

    const [mostrarPanel, setMostrarPanel] = useState(false);

    const [showMapModal, setShowMapModal] = useState(false);



    // NUEVO ESTADO: Para la autenticación del administrador

    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {

        // Lee el estado de login del localStorage al iniciar

        return localStorage.getItem('isAdminLoggedIn') === 'true';

    });

    const [showLoginModal, setShowLoginModal] = useState(false); // Para controlar la visibilidad del formulario de login



    const [personas, setPersonas] = useState(() => {

        const data = localStorage.getItem("personas");

        return data ? JSON.parse(data) : [];

    });



    const [turnosPorDia, setTurnosPorDia] = useState(() => {

        const savedTurnos = localStorage.getItem("turnosPorDia");

        if (savedTurnos) {

            return JSON.parse(savedTurnos);

        }

        return {

            viernes: [

                { id: 1, hora: "8:30 AM - 9:40 AM" },

                { id: 2, hora: "11:45 AM - 12:50 PM" },

                { id: 3, hora: "12:50 PM - 1:50 PM" },

                { id: 4, hora: "4:20 PM - 5:30 PM" },

                { id: 5, hora: "Permanente 9:40 AM - 11:45 AM" },

                { id: 6, hora: "Permanente 1:50 PM - 4:20 PM" },

            ],

            sábado: [

                { id: 1, hora: "8:30 AM - 9:40 AM" },

                { id: 2, hora: "11:45 AM - 12:50 PM" },

                { id: 3, hora: "12:50 PM - 1:50 PM" },

                { id: 4, hora: "4:10 PM - 5:20 PM" },

                { id: 5, hora: "Permanente 9:40 AM - 11:45 AM" },

                { id: 6, hora: "Permanente 1:50 PM - 4:10 PM" },

            ],

            domingo: [

                { id: 1, hora: "8:30 AM - 9:40 AM" },

                { id: 2, hora: "11:45 AM - 12:50 PM" },

                { id: 3, hora: "12:50 PM - 1:50 PM" },

                { id: 4, hora: "3:15 PM - 4:30 PM" },

                { id: 5, hora: "Permanente 9:40 AM - 11:45 AM" },

                { id: 6, hora: "Permanente 1:50 PM - 3:15 PM" },

            ],

        };

    });



    const [cajasPorDia, setCajasPorDia] = useState(() => {

        const savedCajas = localStorage.getItem("cajasPorDia");

        if (savedCajas) {

            return JSON.parse(savedCajas);

        }

        return {

            viernes: ["Caja 1", "Caja 2", "Caja 3"],

            sábado: ["Caja 1", "Caja 2", "Caja 3"],

            domingo: ["Caja 1", "Caja 2", "Caja 3"],

        };

    });



    // REFERENCIA PARA LA TABLA DE TURNOS (para la descarga PNG de la vista actual)

    const turnosTableRef = useRef(null);



    // Referencia para el contenedor del reporte por persona (oculto)

    const reportePersonasRef = useRef(null);



    // Colores para los días (para el listado PNG por persona)

    const dayColors = {

        viernes: "#c1fdffff",

        sábado: "#bdfcd9ff",

        domingo: "#f3ccffff",

    };



    const [mapImageUrl, setMapImageUrl] = useState(() => {

        const savedMapUrl = localStorage.getItem("mapImageUrl");

        return savedMapUrl || null;

    });





    // NUEVO: useEffect para persistir el estado de login del admin

    useEffect(() => {

        localStorage.setItem('isAdminLoggedIn', isAdminLoggedIn);

    }, [isAdminLoggedIn]);



    useEffect(() => {

        localStorage.setItem("mapImageUrl", mapImageUrl || "");

    }, [mapImageUrl]);



    useEffect(() => {

        localStorage.setItem("personas", JSON.stringify(personas));

    }, [personas]);







    // Mantén este useEffect para guardar 'asignaciones' cada vez que cambie

    useEffect(() => {

        localStorage.setItem("asignaciones", JSON.stringify(asignaciones));

    }, [asignaciones]);



    useEffect(() => {

        localStorage.setItem("turnosPorDia", JSON.stringify(turnosPorDia));

    }, [turnosPorDia]);



    useEffect(() => {

        localStorage.setItem("cajasPorDia", JSON.stringify(cajasPorDia));

    }, [cajasPorDia]);



    // ... (el resto de tus funciones y JSX)



    const mostrarAlerta = (mensaje, tipo = "danger") => {

        setAlerta({ mensaje, tipo });

        setTimeout(() => setAlerta(null), 4000);

    };



    // Función de Login del Administrador

    const handleAdminLogin = (username, password) => {

        // Aquí deberías implementar tu lógica de autenticación.

        // Por ejemplo, con credenciales fijas o llamando a una API.

        if (username === 'admin' && password === 'admin123') { // <-- ¡IMPORTANTE! Cambia 'tuContraseñaAdmin' por la contraseña real

            setIsAdminLoggedIn(true);

            setShowLoginModal(false); // Cierra el modal de login

            mostrarAlerta("Inicio de sesión de administrador exitoso.", "success");

        } else {

            mostrarAlerta("Credenciales de administrador incorrectas.", "danger");

        }

    };





    // Función de Logout del Administrador

    const handleAdminLogout = () => {

        setIsAdminLoggedIn(false);

        setShowAdmin(false); // Cierra el panel si estaba abierto

        mostrarAlerta("Sesión de administrador cerrada.", "info");

    };



    // Manejador del clic en el botón "Menú Admin"

    const handleAdminButtonClick = () => {

        if (isAdminLoggedIn) {

            setShowAdmin(true);

        } else {

            setShowLoginModal(true); // Muestra el modal de login si no está logueado

        }

    };



    const agregarAsignacion = ({ nombre, turno, caja }) => {

        const asignacionesDia = asignaciones[selectedDay] || {};

        const asignacionTurno = asignacionesDia[turno] || {};



        const esEdicion =

            modoEdicion && modoEdicion.turno === turno && modoEdicion.caja === caja;



        if (esEdicion) {

            const nueva = {

                ...asignaciones,

                [selectedDay]: {

                    ...asignacionesDia,

                    [turno]: { ...asignacionTurno, [caja]: nombre },

                },

            };

            setAsignaciones(nueva);

            setModoEdicion(null);

            return;

        }



        if (Object.values(asignacionTurno).includes(nombre)) {

            mostrarAlerta(`"${nombre}" ya está asignado en el turno ${turno}.`);

            return;

        }



        if (!asignacionTurno[caja]) {

            const nueva = {

                ...asignaciones,

                [selectedDay]: {

                    ...asignacionesDia,

                    [turno]: { ...asignacionTurno, [caja]: nombre },

                },

            };

            setAsignaciones(nueva);

            return;

        }



        const cajaDisponible = cajasPorDia[selectedDay].find(

            (c) => !asignacionTurno[c]

        );

        if (cajaDisponible) {

            mostrarAlerta(

                `La ${caja} ya está ocupada. Se reasignó a ${cajaDisponible}.`,

                "warning"

            );

            const nueva = {

                ...asignaciones,

                [selectedDay]: {

                    ...asignacionesDia,

                    [turno]: { ...asignacionTurno, [cajaDisponible]: nombre },

                },

            };

            setAsignaciones(nueva);

        } else {

            mostrarAlerta(`No hay cajas disponibles para el turno ${turno}.`);

        }

    };



    const eliminarAsignacion = ({ turno, caja }) => {

        setConfirmarEliminar({ turno, caja });

    };



    const confirmarEliminarAsignacion = () => {

        const { turno, caja } = confirmarEliminar;

        const copia = { ...asignaciones };

        if (copia[selectedDay]?.[turno]?.[caja]) {

            delete copia[selectedDay][turno][caja];

            setAsignaciones(copia);

        }

        setConfirmarEliminar(null);

    };



    const obtenerDisponibles = () => {

        const disponibles = {};

        const asignacionesDia = asignaciones[selectedDay] || {};



        turnosPorDia[selectedDay].forEach((turno) => {

            const turnoId = `T${turno.id}`;

            const asignacionTurno = asignacionesDia[turnoId] || {};

            const cajasDisponibles = cajasPorDia[selectedDay].filter(

                (caja) => !asignacionTurno[caja]

            );

            disponibles[turnoId] = {

                hora: turno.hora,

                cajas: cajasDisponibles,

            };

        });



        return disponibles;

    };



    const editarAsignacion = (datos) => setModoEdicion(datos);



    const turnos = turnosPorDia[selectedDay];

    const cajas = cajasPorDia[selectedDay];

    const asignacionesDia = asignaciones[selectedDay] || {};



    const setCajasParaDiaSeleccionado = (nuevasCajas) => {

        setCajasPorDia((prev) => ({

            ...prev,

            [selectedDay]: nuevasCajas,

        }));

    };



    const handleDownloadPng = async () => {
        const tempTableContainer = document.createElement('div');
        tempTableContainer.style.position = 'absolute';
        tempTableContainer.style.left = '-9999px';
        tempTableContainer.style.width = 'fit-content';
        tempTableContainer.style.backgroundColor = 'white';
        tempTableContainer.style.padding = '30px';
        tempTableContainer.style.fontFamily = 'Arial, sans-serif';

        // Cambia esta URL por la de tu logo si lo deseas
        const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg";

        // Detectar si un turno es permanente (puedes ajustar esto según tus datos)
        const esTurnoPermanente = (hora) => hora.toLowerCase().includes("permanente");

        let tableHtml = `
    <div style="text-align: center; margin-bottom: 18px;">
        <img src="${logoUrl}" alt="Logo" style="height: 48px; margin-bottom: 8px;" />
        <h2 style="font-size: 26px; color: #0056b3; margin: 0;">Calendario de Asignaciones: ${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</h2>
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <thead>
            <tr style="background-color: #3498db; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Turno</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Horario</th>
                ${cajas.map(caja => 
                    `<th style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">${caja}</th>`
                ).join('')}
            </tr>
        </thead>
        <tbody>
`;

        turnos.forEach((turno, index) => {
            const asignacionesDiaTurno = asignacionesDia[`T${turno.id}`] || {};
            const rowBg = index % 2 === 0 ? '#f8f9fa' : 'white';
            const esPermanente = esTurnoPermanente(turno.hora);
            tableHtml += `
        <tr style="background-color: ${rowBg};">
            <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; text-align: center;">T${turno.id}</td>
            <td style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">
                ${esPermanente
                    ? `<span style="font-weight:bold;">Permanente</span><br><span style="font-size:12px;">${turno.hora.replace("Permanente ", "")}</span>`
                    : turno.hora
                }
            </td>
            ${cajas.map(caja => {
                const personaAsignada = asignacionesDiaTurno[caja] || '';
                return `<td style="padding: 10px; border: 1px solid #dee2e6; text-align: center;">${personaAsignada || '—'}</td>`;
            }).join('')}
        </tr>
    `;
        });

        tableHtml += `
        </tbody>
    </table>
    <p style="text-align: right; margin-top: 24px; font-size: 12px; color: #777;">
        © Gestión de Turnos - ${new Date().getFullYear()}
    </p>
`;

        tempTableContainer.innerHTML = tableHtml;
        document.body.appendChild(tempTableContainer);

        try {
            const canvas = await html2canvas(tempTableContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: null,
            });

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `turnos_${selectedDay}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            mostrarAlerta("Tabla de turnos exportada como PNG.", "success");
        } catch (error) {
            mostrarAlerta("Error al exportar la tabla como PNG.", "danger");
        } finally {
            document.body.removeChild(tempTableContainer);
        }
    };



    const handleDownloadPersonListPng = async () => {
  const container = document.createElement("div");
  container.style.padding = "20px";
  container.style.backgroundColor = "white";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "16px";
  container.style.lineHeight = "1.5";
  container.style.width = "1100px";
  container.style.boxSizing = "border-box";

  // Colores por día
  const dayColors = {
    viernes: "#c1fdff",
    sábado: "#bdfcd9",
    domingo: "#f3ccff",
  };

  // Iconos
  const iconClipboard = `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4cb.png" style="height:38px;vertical-align:middle;margin-right:12px;" alt="clipboard"/>`;
  const iconAlarm = `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/23f0.png" style="height:22px;vertical-align:middle;margin-right:6px;" alt="alarm"/>`;
  const iconBox = `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4e6.png" style="height:22px;vertical-align:middle;margin-right:6px;" alt="box"/>`;

  let contentHtml = `
    <h2 style="text-align: center; margin-bottom: 20px; color: #222; font-size: 2em;">Listado de Asignaciones por Persona</h2>
    <div style="margin-bottom: 18px; text-align: right; font-size: 13px; color: #666;">
      Fecha de Generación: ${new Date().toLocaleDateString("es-ES")}
    </div>
  `;

  // Obtener personas con asignaciones
  const personasConAsignaciones = new Set();
  Object.values(asignaciones).forEach((dayAsign) => {
    Object.values(dayAsign).forEach((turnoAsign) => {
      Object.values(turnoAsign).forEach((persona) => {
        if (persona) personasConAsignaciones.add(persona);
      });
    });
  });
  const personasOrdenadas = Array.from(personasConAsignaciones).sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  );

  if (personasOrdenadas.length === 0) {
    contentHtml += `<p style="text-align: center; color: gray; margin-top: 30px;">No hay personas con asignaciones actualmente.</p>`;
  } else {
    personasOrdenadas.forEach((persona) => {
      contentHtml += `
        <div style="margin-bottom: 32px; border: 1.5px solid #ccc; padding: 22px 22px 18px 22px; border-radius: 16px; background-color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; margin-bottom: 18px;">
            ${iconClipboard}
            <span style="font-size: 2em; color: #1976d2; font-weight: 600;">${persona}</span>
          </div>
          <div style="display: flex; gap: 18px; flex-wrap: wrap;">
      `;
      let hasAssignments = false;
      dias.forEach((day) => {
        const asignacionesDia = asignaciones[day] || {};
        // Recolectar todos los turnos de este día para la persona
        const turnosDeEsteDia = [];
        turnosPorDia[day].forEach((turnoDef) => {
          const turnoId = `T${turnoDef.id}`;
          const asignacionTurno = asignacionesDia[turnoId] || {};
          const cajasDePersonaEnTurno = Object.entries(asignacionTurno)
            .filter(([, asignado]) => asignado === persona)
            .map(([caja]) => caja);

          if (cajasDePersonaEnTurno.length > 0) {
            hasAssignments = true;
            turnosDeEsteDia.push({
              turnoId,
              hora: turnoDef.hora,
              cajas: cajasDePersonaEnTurno,
            });
          }
        });

        if (turnosDeEsteDia.length > 0) {
          // Tarjeta horizontal por día
          contentHtml += `
            <div style="flex:1 1 380px; min-width:380px; max-width:520px; background-color: ${dayColors[day]} !important; border-radius: 18px; padding: 18px 24px 18px 24px; margin-bottom: 10px; display: flex; flex-direction: column;">
              <span style="font-weight: bold; color: #222; font-size: 1.25em; margin-bottom: 14px;">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <div style="display: flex; flex-direction: row; gap: 48px;">
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                  <div>${iconAlarm}</div>
                  <div style="margin-left: 0; margin-top: 8px;">
                    ${turnosDeEsteDia.map(t =>
                      `<div style="font-weight: bold; margin-bottom: 4px;">${t.turnoId} (${t.hora})</div>`
                    ).join('')}
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                  <div>${iconBox}</div>
                  <div style="margin-left: 0; margin-top: 8px;">
                    ${turnosDeEsteDia.map(t =>
                      `<div style="font-weight: bold; margin-bottom: 4px;">${t.cajas.join(", ")}</div>`
                    ).join('')}
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      });

      if (!hasAssignments) {
        contentHtml += `<p class="text-center text-muted p-3" style="color: #888;">(Sin asignaciones para esta persona)</p>`;
      }

      contentHtml += `
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = contentHtml;
  document.body.appendChild(container);
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";

  try {
    const canvas = await html2canvas(container, {
      useCORS: true,
      scale: 2,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `listado_personas_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarAlerta("✅ Listado de participantes descargado como PNG.", "success");
  } catch (error) {
    console.error("Error al descargar el listado de participantes PNG:", error);
    mostrarAlerta("❌ Error al descargar el listado de participantes como PNG.", "danger");
  } finally {
    document.body.removeChild(container);
  }
};





    const handleAsignarDirecto = useCallback(({ nombre, turno, caja }) => {

        // Aquí implementas la lógica para agregar la asignación directamente

        // al estado 'asignaciones'. Necesitas saber el día del turno.

        // Una forma simple es buscar el día del turnoId

        const diaDelTurno = Object.keys(turnosPorDia).find(dia =>

            turnosPorDia[dia].some(t => `T${t.id}` === turno)

        );



        if (diaDelTurno) {

            setAsignaciones((prevAsignaciones) => {

                const newAsignaciones = { ...prevAsignaciones };

                if (!newAsignaciones[diaDelTurno]) {

                    newAsignaciones[diaDelTurno] = {};

                }

                if (!newAsignaciones[diaDelTurno][turno]) {

                    newAsignaciones[diaDelTurno][turno] = {};

                }

                newAsignaciones[diaDelTurno][turno][caja] = nombre;

                return newAsignaciones;

            });

            // Opcional: mostrar una alerta de éxito

            mostrarAlerta(`"${nombre}" asignado a ${caja} en ${turno}.`, "success");

        } else {

            mostrarAlerta("No se pudo encontrar el día para el turno.", "danger");

        }

    }, [setAsignaciones, turnosPorDia, mostrarAlerta]);





    return (

        <div className="d-flex">

            <ParticipantesPanel

                show={mostrarPanel}

                onClose={() => setMostrarPanel(false)}

                personas={personas}

                setPersonas={setPersonas}

                asignaciones={asignaciones}

                setAsignaciones={setAsignaciones}

                turnosPorDia={turnosPorDia}

                isAdminLoggedIn={isAdminLoggedIn}

            />



            <div className="container mt-4 flex-grow-1">

                <h1 className="mb-4 text-center">Gestión de Turnos</h1>

                <div className="d-flex justify-content-between mb-2">

                    <button

                        className="btn btn-outline-primary"

                        onClick={() => setMostrarPanel(true)}

                    >

                        👤 Participantes

                    </button>



                    <button

                        className="btn btn-outline-info"

                        onClick={() => setShowMapModal(!showMapModal)}

                    >

                        🗺️ {showMapModal ? "Ocultar Croquis" : "Ver Croquis"}

                    </button>



                    <button

                        className="btn btn-outline-dark"

                        onClick={handleAdminButtonClick} // <--- ¡CAMBIA ESTO AQUÍ!

                    >

                        ☰ Menú Admin

                    </button>

                </div>



                <AdminPanel

                    show={showAdmin}

                    onClose={() => setShowAdmin(false)}

                    cajas={cajas}

                    setCajas={setCajasParaDiaSeleccionado}

                    horarios={turnos}

                    selectedDay={selectedDay}

                    setTurnosPorDia={setTurnosPorDia}

                    turnosPorDia={turnosPorDia}

                    asignaciones={asignaciones}

                    setSelectedDay={setSelectedDay}

                    mapImageUrl={mapImageUrl}

                    setMapImageUrl={setMapImageUrl}

                    onDownloadPng={handleDownloadPng}

                    onDownloadPersonListPng={handleDownloadPersonListPng}

                    isAdminLoggedIn={isAdminLoggedIn} //estado de login

                    onAdminLogout={handleAdminLogout} //función de logout

                    setAsignaciones={setAsignaciones}

                    setPersonas={setPersonas}
                />



                {showMapModal && (

                    <div className="mb-4">

                        <MapViewer

                            imageUrl={mapImageUrl}

                            show={showMapModal}

                            onClose={() => setShowMapModal(false)}

                        />

                    </div>

                )}



                <div className="d-flex justify-content-center mb-4 flex-wrap">

                    {dias.map((dia) => (

                        <button

                            key={dia}

                            className={`btn mx-1 mb-2 ${selectedDay === dia ? "btn-primary" : "btn-outline-primary"

                                }`}

                            onClick={() => {

                                setSelectedDay(dia);

                                setModoEdicion(null);

                            }}

                        >

                            {dia.charAt(0).toUpperCase() + dia.slice(1)}

                        </button>

                    ))}

                </div>



                {alerta && (

                    <div

                        className={`alert alert-${alerta.tipo} position-fixed top-0 start-50 translate-middle-x mt-3 z-3`}

                        style={{ minWidth: "300px", maxWidth: "80%" }}

                    >

                        {alerta.mensaje}

                    </div>

                )}



                <div className="d-flex justify-content-center mb-3">

                    <button

                        className="btn btn-outline-secondary"

                        onClick={() => setMostrarDisponibles(!mostrarDisponibles)}

                    >

                        {mostrarDisponibles

                            ? "Ocultar lugares disponibles"

                            : "Ver lugares disponibles"}{" "}

                        <span>{mostrarDisponibles ? "▲" : "▼"}</span>

                    </button>

                </div>



                {mostrarDisponibles && (

                    <div className="mb-4">

                        <div className="card card-body">

                            <h5 className="mb-3 text-center">

                                Lugares disponibles - {selectedDay}

                            </h5>

                            <div className="table-responsive">

                                <table className="table table-bordered text-center">

                                    <thead className="table-light">

                                        <tr>

                                            <th>Turno</th>

                                            <th>Horario</th>

                                            <th>Cajas disponibles</th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {Object.entries(obtenerDisponibles()).map(

                                            ([turnoId, info]) => (

                                                <tr key={turnoId}>

                                                    <td>{turnoId}</td>

                                                    <td>{info.hora}</td>

                                                    <td>

                                                        {info.cajas.length > 0 ? (

                                                            info.cajas.join(", ")

                                                        ) : (

                                                            <span className="text-danger">Sin espacios</span>

                                                        )}

                                                    </td>

                                                </tr>

                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                )}



                {isAdminLoggedIn && (

                    <AgregarPersonaForm

                        cajas={cajas}

                        turnos={turnos}

                        onAgregar={agregarAsignacion}

                        modoEdicion={modoEdicion}

                        setModoEdicion={setModoEdicion}

                        personas={personas}

                        setPersonas={setPersonas}

                        setTurnosPorDia={setTurnosPorDia}

                    />

                )}



                <TurnosTable

                    asignaciones={asignacionesDia}

                    turnos={turnos}

                    cajas={cajas}

                    onEditar={editarAsignacion}

                    onEliminar={eliminarAsignacion}

                    tableRef={turnosTableRef}

                    isAdminLoggedIn={isAdminLoggedIn}

                    onAsignarDirecto={handleAsignarDirecto}

                    personas={personas}

                    setPersonas={setPersonas}

                />



                {confirmarEliminar && (

                    <div className="modal fade show d-block" tabIndex="-1">

                        <div className="modal-dialog modal-dialog-centered">

                            <div className="modal-content">

                                <div className="modal-header">

                                    <h5 className="modal-title">Confirmar eliminación</h5>

                                    <button

                                        type="button"

                                        className="btn-close"

                                        onClick={() => setConfirmarEliminar(null)}

                                    ></button>

                                </div>

                                <div className="modal-body">

                                    ¿Estás seguro de que deseas eliminar esta asignación?

                                </div>

                                <div className="modal-footer">

                                    <button

                                        className="btn btn-secondary"

                                        onClick={() => setConfirmarEliminar(null)}

                                    >

                                        Cancelar

                                    </button>

                                    <button

                                        className="btn btn-danger"

                                        onClick={confirmarEliminarAsignacion}

                                    >

                                        Eliminar

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

                <LoginModal

                    show={showLoginModal}

                    onClose={() => setShowLoginModal(false)}

                    onLogin={handleAdminLogin}

                />

            </div>

        </div>

    );

}



export default App;

////////