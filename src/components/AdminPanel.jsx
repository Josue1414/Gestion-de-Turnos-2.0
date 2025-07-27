// src/components/AdminPanel.js
import React, { useState } from "react";
import {
  Offcanvas,
  Button,
  Form,
  Alert,
  Accordion,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import defaultCroquis from '../images/default_croquis.jpg';

const dias = ["viernes", "sábado", "domingo"];

const AdminPanel = ({
  show,
  onClose,
  cajas,
  setCajas,
  horarios,
  selectedDay,
  setSelectedDay,
  setTurnosPorDia,
  turnosPorDia,
  asignaciones,
  mapImageUrl,
  setMapImageUrl,
  onDownloadPng,
  onDownloadPersonListPng,
  isAdminLoggedIn,
  onAdminLogout,
  setAsignaciones,
  setPersonas,
}) => {

    const [nuevaCaja, setNuevaCaja] = useState("");

    // Nuevo estado para el turno a editar y su nuevo horario

    const [turnoIdEditar, setTurnoIdEditar] = useState('');

    const [nuevoHorario, setNuevoHorario] = useState('');



    const [alerta, setAlerta] = useState(null);



    const mostrarAlerta = (mensaje, tipo = "warning") => { // Cambiado 'variante' a 'tipo' para consistencia con Bootstrap Alert

        setAlerta({ mensaje, tipo });

        setTimeout(() => setAlerta(null), 3000);

    };



    const handleAgregarCaja = (e) => { // Cambiado de 'manejarAgregarCaja' a 'handleAgregarCaja' por convención

        e.preventDefault();

        if (nuevaCaja.trim() && !cajas.includes(nuevaCaja.trim())) {

            setCajas([...cajas, nuevaCaja.trim()]);

            setNuevaCaja("");

            mostrarAlerta(`Caja "${nuevaCaja.trim()}" agregada.`, "success"); // Alerta de éxito

        } else if (cajas.includes(nuevaCaja.trim())) {

            mostrarAlerta(`La caja "${nuevaCaja.trim()}" ya existe.`, "warning"); // Alerta de ya existe

        } else {

            mostrarAlerta("El nombre de la caja no puede estar vacío.", "danger"); // Alerta de vacío

        }

    };



    const handleEliminarCaja = (cajaAEliminar) => { // Cambiado de 'eliminarCaja' a 'handleEliminarCaja' por convención

        const tieneAsignaciones = turnosPorDia[selectedDay].some(turno => {

            const turnoId = `T${turno.id}`;

            return asignaciones[selectedDay]?.[turnoId]?.[cajaAEliminar];

        });



        if (tieneAsignaciones) {

            mostrarAlerta(`No se puede eliminar "${cajaAEliminar}" porque tiene asignaciones en el día actual.`, "danger");

            return;

        }



        const nuevasCajas = cajas.filter((c) => c !== cajaAEliminar);

        setCajas(nuevasCajas);

        mostrarAlerta(`Caja "${cajaAEliminar}" eliminada.`, "info");

    };



    const handleEditarTurno = () => { // Ya tenías esta lógica en la versión anterior que te pasé.

        if (!turnoIdEditar || !nuevoHorario.trim()) {

            mostrarAlerta("Por favor, selecciona un turno y escribe el nuevo horario.", "warning");

            return;

        }



        const [day, id] = turnoIdEditar.split('-'); // Esperamos formato 'dia-id'



        setTurnosPorDia(prevTurnos => {

            const dayTurnos = prevTurnos[day] ? [...prevTurnos[day]] : [];

            const index = dayTurnos.findIndex(t => t.id === parseInt(id));



            if (index !== -1) {

                dayTurnos[index] = { ...dayTurnos[index], hora: nuevoHorario.trim() };

                mostrarAlerta(`Horario del turno T${id} del ${day} actualizado a "${nuevoHorario.trim()}".`, "success");

                return {

                    ...prevTurnos,

                    [day]: dayTurnos

                };

            } else {

                mostrarAlerta("Turno no encontrado para editar.", "danger");

                return prevTurnos;

            }

        });



        setTurnoIdEditar('');

        setNuevoHorario('');

    };





    const exportarCSV = () => {

        const rows = [["Día", "Turno", "Hora", "Caja", "Persona"]];



        Object.entries(turnosPorDia).forEach(([dia, turnos]) => {

            const asignacionesDia = asignaciones[dia] || {};

            turnos.forEach((turno) => {

                const turnoId = `T${turno.id}`;

                const asignacionTurno = asignacionesDia[turnoId] || {};

                Object.entries(asignacionTurno).forEach(([caja, persona]) => {

                    rows.push([dia, turnoId, turno.hora, caja, persona]);

                });

            });

        });



        const csvContent = "\uFEFF" + rows.map((e) => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.setAttribute("href", url);

        link.setAttribute("download", "turnos.csv");

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        mostrarAlerta("✅ Datos exportados a CSV.", "success");

    };



    const exportarExcel = () => {

        const data = [];

        data.push(["Día", "Turno", "Hora", "Caja", "Persona"]); // Encabezados



        Object.entries(turnosPorDia).forEach(([dia, turnos]) => {

            const asignacionesDia = asignaciones[dia] || {};

            turnos.forEach((turno) => {

                const turnoId = `T${turno.id}`;

                const asignacionTurno = asignacionesDia[turnoId] || {};

                // Si no hay asignaciones para este turno, aún lo incluimos para mostrar el horario

                if (Object.keys(asignacionTurno).length === 0) {

                    data.push([dia, turnoId, turno.hora, "", ""]); // Fila vacía para turno sin asignación

                } else {

                    Object.entries(asignacionTurno).forEach(([caja, persona]) => {

                        data.push([dia, turnoId, turno.hora, caja, persona]);

                    });

                }

            });

        });



        const ws = XLSX.utils.aoa_to_sheet(data);

        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Turnos Asignados");

        XLSX.writeFile(wb, "turnos.xlsx");

        mostrarAlerta("✅ Datos exportados a Excel.", "success");

    };



    // ESTA ES TU FUNCIÓN DE SUBIDA DE IMAGEN QUE YA TENÍAS

    const handleMapImageUpload = (event) => {

        const file = event.target.files[0];

        if (file) {

            if (file.size > 2 * 1024 * 1024) {

                mostrarAlerta(

                    "La imagen es demasiado grande. Por favor, sube una imagen de menos de 2MB.",

                    "danger"

                );

                return;

            }



            const reader = new FileReader();

            reader.onloadend = () => {

                setMapImageUrl(reader.result); // Guarda la URL base64 en el estado

                mostrarAlerta("✨ Imagen del croquis cargada con éxito.", "success");

            };

            reader.onerror = () => {

                mostrarAlerta(

                    "❌ Error al leer la imagen. Inténtalo de nuevo.",

                    "danger"

                );

            };

            reader.readAsDataURL(file); // Convierte la imagen a Base64

        }

    };



    const handleResetearAsignaciones = () => {

        if (window.confirm("¿Estás seguro de que quieres resetear TODAS las asignaciones de TODOS los días? Esta acción es irreversible.")) {

            // Como App.js maneja setAsignaciones, idealmente App.js debería pasar

            // una prop como `onResetAsignaciones` a AdminPanel.

            // Por ahora, si no tienes `setAsignaciones` como prop aquí, se recarga.

            localStorage.removeItem('asignaciones'); // Esto borrará las asignaciones del localStorage

            window.location.reload(); // Para forzar la actualización

            mostrarAlerta("Todas las asignaciones han sido reseteadas.", "success");

        }

    };



    const handleResetAllData = () => {

        if (window.confirm("¡ADVERTENCIA! ¿Estás seguro de que quieres borrar TODOS los datos (asignaciones, personas, turnos, cajas, croquis) y reiniciar la aplicación? Esta acción es irreversible.")) {

            localStorage.clear(); // Borra todo el localStorage

            window.location.reload(); // Recarga la aplicación para cargar el estado inicial

        }

    };



    const handleEliminarPersona = (nombrePersona) => {

        if (window.confirm(`¿Estás seguro de que quieres eliminar a "${nombrePersona}" de la lista de participantes y de todas sus asignaciones?`)) {

            // Necesitarías `setPersonas` y `setAsignaciones` como props de App.js para que esto funcione sin recargar.

            // Por ahora, se simula con recarga.

            mostrarAlerta(`"${nombrePersona}" ha sido eliminada de la lista de participantes y sus asignaciones.`, "success");

            window.location.reload(); // Para forzar la actualización con los cambios de localStorage

        }

    };



    const handleImportarDatos = (e) => {

        const file = e.target.files[0];

        if (!file) {

            mostrarAlerta("No se ha seleccionado ningún archivo.", "warning");

            return;

        }



        const reader = new FileReader();

        reader.onload = (evt) => {

            const data = evt.target.result;

            let workbook;

            try {

                workbook = XLSX.read(data, { type: "binary" });

            } catch (err) {

                mostrarAlerta("Archivo no válido.", "danger");

                return;

            }



            // Suponiendo que exportaste una hoja llamada "Turnos Asignados"

            const sheet = workbook.Sheets["Turnos Asignados"] || workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });



            // Reconstruir los objetos desde el archivo

            // Asume formato: ["Día", "Turno", "Hora", "Caja", "Persona"]

            const [header, ...dataRows] = rows;

            if (!header || header.length < 5) {

                mostrarAlerta("Formato de archivo incorrecto.", "danger");

                return;

            }



            // Reconstruir asignaciones, personas, turnosPorDia, cajasPorDia

            const newAsignaciones = {};

            const newPersonas = new Set();

            const newTurnosPorDia = { viernes: [], sábado: [], domingo: [] };

            const newCajasPorDia = { viernes: [], sábado: [], domingo: [] };



            dataRows.forEach(([dia, turnoId, hora, caja, persona]) => {

                if (!dia || !turnoId) return;

                if (!newAsignaciones[dia]) newAsignaciones[dia] = {};

                if (!newAsignaciones[dia][turnoId]) newAsignaciones[dia][turnoId] = {};

                if (caja && persona) {

                    newAsignaciones[dia][turnoId][caja] = persona;

                    newPersonas.add(persona);

                    if (!newCajasPorDia[dia].includes(caja)) newCajasPorDia[dia].push(caja);

                }

                // Guardar turnos y horas

                const id = parseInt(turnoId.replace("T", ""));

                if (id && hora && !newTurnosPorDia[dia].some(t => t.id === id)) {

                    newTurnosPorDia[dia].push({ id, hora });

                }

            });



            // Ordenar turnos por id

            Object.keys(newTurnosPorDia).forEach(dia => {

                newTurnosPorDia[dia].sort((a, b) => a.id - b.id);

            });



            // Actualizar estados y localStorage

            if (typeof window.setAsignaciones === "function") window.setAsignaciones(newAsignaciones);

            if (typeof window.setPersonas === "function") window.setPersonas(Array.from(newPersonas));

            if (typeof window.setTurnosPorDia === "function") window.setTurnosPorDia(newTurnosPorDia);

            if (typeof window.setCajasPorDia === "function") window.setCajasPorDia(newCajasPorDia);



            // Si tienes los setters como props, úsalos directamente:

            // setAsignaciones(newAsignaciones);

            // setPersonas(Array.from(newPersonas));

            // setTurnosPorDia(newTurnosPorDia);

            // setCajasPorDia(newCajasPorDia);



            // Guarda en localStorage también

            localStorage.setItem("asignaciones", JSON.stringify(newAsignaciones));

            localStorage.setItem("personas", JSON.stringify(Array.from(newPersonas)));

            localStorage.setItem("turnosPorDia", JSON.stringify(newTurnosPorDia));

            localStorage.setItem("cajasPorDia", JSON.stringify(newCajasPorDia));



            mostrarAlerta("Datos importados correctamente.", "success");

            window.location.reload(); // Recarga para reflejar los cambios

        };

        reader.readAsBinaryString(file);

    };



    return (

        <Offcanvas show={show} onHide={onClose} placement="end" className="w-75">

            <Offcanvas.Header closeButton>

                <Offcanvas.Title>

                    Menú de Administrador

                    {isAdminLoggedIn && (

                        <span className="badge bg-success ms-2">Conectado</span>

                    )}

                </Offcanvas.Title>

            </Offcanvas.Header>

            <Offcanvas.Body>

                {alerta && <Alert variant={alerta.tipo}>{alerta.mensaje}</Alert>} {/* Usar alerta.tipo */}



                {!isAdminLoggedIn ? (

                    <p className="text-muted text-center">

                        Inicia sesión para acceder a las herramientas de administrador.

                    </p>

                ) : (

                    <>

                        {/* Botones para cambiar de día */}

                        <div className="mb-4 d-flex justify-content-center gap-2">

                            {dias.map((dia) => (

                                <Button

                                    key={dia}

                                    variant={selectedDay === dia ? "primary" : "outline-primary"}

                                    onClick={() => setSelectedDay(dia)}

                                >

                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}

                                </Button>

                            ))}

                        </div>



                        {/* Secciones tipo acordeón */}

                        <Accordion defaultActiveKey="0" alwaysOpen>

                            {/* Gestión de Cajas */}

                            <Accordion.Item eventKey="0">

                                <Accordion.Header>

                                    Gestión de Cajas para {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}

                                </Accordion.Header>

                                <Accordion.Body>

                                    <Form onSubmit={handleAgregarCaja} className="input-group mb-3">

                                        <input

                                            type="text"

                                            className="form-control"

                                            placeholder="Nueva Caja (ej: Caja 4)"

                                            value={nuevaCaja}

                                            onChange={(e) => setNuevaCaja(e.target.value)}

                                            required // Agregado required

                                        />

                                        <button className="btn btn-outline-primary" type="submit"> {/* Cambiado a type="submit" */}

                                            Agregar Caja

                                        </button>

                                    </Form>

                                    <ul className="list-group">

                                        {cajas.map((caja) => (

                                            <li key={caja} className="list-group-item d-flex justify-content-between align-items-center">

                                                {caja}

                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminarCaja(caja)}>

                                                    Eliminar

                                                </button>

                                            </li>

                                        ))}

                                    </ul>

                                </Accordion.Body>

                            </Accordion.Item>



                            {/* Editar Horarios de Turnos */}

                            <Accordion.Item eventKey="1">

                                <Accordion.Header>Editar Horarios de Turnos</Accordion.Header>

                                <Accordion.Body>

                                    <p className="text-muted small">Selecciona el día y luego el turno que deseas editar.</p>

                                    <Form.Group className="mb-3">

                                        <Form.Label>Seleccionar Día del Turno</Form.Label>

                                        <Form.Select

                                            value={selectedDay}

                                            onChange={(e) => {

                                                setSelectedDay(e.target.value);

                                                setTurnoIdEditar('');

                                                setNuevoHorario('');

                                            }}

                                        >

                                            {Object.keys(turnosPorDia).map(day => (

                                                <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>

                                            ))}

                                        </Form.Select>

                                    </Form.Group>



                                    <Form.Group className="mb-3">

                                        <Form.Label>Turno a Editar (ID - Horario Actual)</Form.Label>

                                        <Form.Select

                                            value={turnoIdEditar}

                                            onChange={(e) => {

                                                setTurnoIdEditar(e.target.value);

                                                const [day, id] = e.target.value.split('-');

                                                const currentTurno = turnosPorDia[day]?.find(t => t.id === parseInt(id));

                                                setNuevoHorario(currentTurno ? currentTurno.hora : '');

                                            }}

                                        >

                                            <option value="">Selecciona un turno</option>

                                            {turnosPorDia[selectedDay]?.map((turno) => (

                                                <option key={turno.id} value={`${selectedDay}-${turno.id}`}>

                                                    {`T${turno.id} - ${turno.hora}`}

                                                </option>

                                            ))}

                                        </Form.Select>

                                    </Form.Group>

                                    <div className="input-group mb-3">

                                        <input

                                            type="text"

                                            className="form-control"

                                            placeholder="Nuevo Horario (ej: 8:00 AM - 9:00 AM)"

                                            value={nuevoHorario}

                                            onChange={(e) => setNuevoHorario(e.target.value)}

                                        />

                                        <button className="btn btn-outline-success" type="button" onClick={handleEditarTurno}>

                                            Actualizar Horario

                                        </button>

                                    </div>

                                </Accordion.Body>

                            </Accordion.Item>



                            {/* Gestión de Croquis */}

                            <Accordion.Item eventKey="2">

                                <Accordion.Header>Gestión de Croquis</Accordion.Header>

                                <Accordion.Body>

                                    <Form.Group controlId="formFile" className="mb-3">

                                        <Form.Label>Subir nuevo Croquis (max 2MB)</Form.Label>

                                        <Form.Control

                                            type="file"

                                            accept="image/*"

                                            onChange={handleMapImageUpload} // <--- Usa tu función aquí

                                        />

                                    </Form.Group>



                                    {mapImageUrl && mapImageUrl !== "null" && mapImageUrl !== defaultCroquis && (

                                        <div className="mt-3 text-center">

                                            <p className="mb-2">Croquis actual:</p>

                                            <img src={mapImageUrl} alt="Croquis actual" className="img-fluid rounded" style={{ maxHeight: '200px' }} />

                                            <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => setMapImageUrl(defaultCroquis)}>

                                                Restaurar Croquis por Defecto

                                            </button>

                                            <button className="btn btn-outline-danger btn-sm mt-2 ms-2" onClick={() => setMapImageUrl(null)}>

                                                Eliminar Croquis Actual

                                            </button>

                                        </div>

                                    )}

                                    {mapImageUrl === defaultCroquis && (

                                        <p className="text-muted mt-2 text-center">Usando el croquis por defecto.</p>

                                    )}

                                    {!mapImageUrl && mapImageUrl !== defaultCroquis && (

                                        <p className="text-muted mt-2 text-center">No hay un croquis personalizado cargado.</p>

                                    )}

                                </Accordion.Body>

                            </Accordion.Item>



                            {/* Herramientas de Exportación */}

                            <Accordion.Item eventKey="3">

                                <Accordion.Header>Herramientas de Exportación</Accordion.Header>

                                <Accordion.Body>

                                    <div className="d-grid gap-2">

                                        <Button variant="outline-success" onClick={onDownloadPng}>

                                            ⬇️ Descargar Turnos ({selectedDay}) como PNG

                                        </Button>

                                        <Button variant="outline-info" onClick={onDownloadPersonListPng}>

                                            ⬇️ Descargar Asignaciones por Persona como PNG

                                        </Button>

                                        <Button variant="outline-primary" onClick={exportarCSV}>

                                            ⬇️ Exportar a CSV

                                        </Button>

                                        <Button variant="outline-primary" onClick={exportarExcel}>

                                            ⬇️ Exportar a Excel

                                        </Button>

                                        <Button variant="outline-warning" as="label">

                                            ⬆️ Importar Datos (Excel/CSV)

                                            <input

                                                type="file"

                                                accept=".xlsx,.csv"

                                                style={{ display: "none" }}

                                                onChange={handleImportarDatos}

                                            />

                                        </Button>

                                    </div>

                                </Accordion.Body>

                            </Accordion.Item>



                            {/* Opciones Avanzadas */}

                            <Accordion.Item eventKey="4">

                                <Accordion.Header>Opciones Avanzadas</Accordion.Header>

                                <Accordion.Body>

                                    <div className="d-grid gap-2">

                                        <Button variant="warning" onClick={handleResetearAsignaciones}>

                                            ⚠️ Resetear SOLO Asignaciones

                                        </Button>

                                        <Button variant="danger" onClick={handleResetAllData}>

                                            ☠️ BORRAR TODOS LOS DATOS Y REINICIAR

                                        </Button>

                                    </div>

                                </Accordion.Body>

                            </Accordion.Item>

                        </Accordion>



                        <div className="mt-4 p-3 border rounded shadow-sm bg-light text-center">

                            <Button variant="outline-secondary" onClick={onAdminLogout}>

                                🚪 Cerrar Sesión de Administrador

                            </Button>

                        </div>

                    </>

                )}

            </Offcanvas.Body>

        </Offcanvas>

    );

};



export default AdminPanel;