import React, { useState, useMemo, useCallback } from "react";

import {

  Offcanvas,

  Button,

  Form,

  ListGroup,

  InputGroup,

  Alert,

  Modal,

  Collapse,

} from "react-bootstrap";



const ParticipantesPanel = ({

  show,

  onClose,

  personas,

  setPersonas,

  asignaciones,

  setAsignaciones,

  turnosPorDia,

  isAdminLoggedIn, // <--- ¡MODIFICACIÓN CLAVE! Añade esta prop aquí

}) => {

  const [nuevaPersona, setNuevaPersona] = useState("");

  const [filtro, setFiltro] = useState("");

  const [alerta, setAlerta] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [personaAEliminarConfirm, setPersonaAEliminarConfirm] = useState(null);

  const [editingPersona, setEditingPersona] = useState(null);

  const [editedName, setEditedName] = useState("");

  const [openCollapse, setOpenCollapse] = useState(null);



  // Calcula el total de participantes sin filtro

  const totalParticipantesSinFiltro = personas.length; // Ya lo tienes así, ¡perfecto!



  // MODIFICACIÓN: Calcular el total de participantes filtrados (usando useMemo)

  const totalParticipantesFiltrados = useMemo(() => {

    // Si el filtro está vacío, el número de filtrados es igual al total sin filtro

    if (!filtro) {

      return personas.length;

    }

    // Si hay filtro, cuenta cuántos coinciden

    return personas.filter((persona) =>

      persona.toLowerCase().includes(filtro.toLowerCase())

    ).length;

  }, [personas, filtro]);





  const contarAsignaciones = useCallback(

    (personaNombre) => {

      let count = 0;

      for (const dia in asignaciones) {

        for (const turnoId in asignaciones[dia]) {

          for (const caja in asignaciones[dia][turnoId]) {

            if (asignaciones[dia][turnoId][caja] === personaNombre) {

              count++;

            }

          }

        }

      }

      return count;

    },

    [asignaciones]

  );



  const personaTieneAsignaciones = useCallback(

    (persona) => {

      return contarAsignaciones(persona) > 0;

    },

    [contarAsignaciones]

  );



  const obtenerAsignacionesDePersona = useCallback(

    (personaNombre) => {

      const asignacionesEncontradas = [];

      const diasOrdenados = ["viernes", "sábado", "domingo"]; // Para un orden consistente

      diasOrdenados.forEach((dia) => {

        if (asignaciones[dia]) {

          const turnosDelDia = turnosPorDia[dia] || [];

          const turnosOrdenados = [...turnosDelDia].sort((a, b) => a.id - b.id);



          turnosOrdenados.forEach((turnoDef) => {

            const turnoId = `T${turnoDef.id}`;

            const asignacionTurno = asignaciones[dia][turnoId] || {};



            for (const caja in asignacionTurno) {

              if (asignacionTurno[caja] === personaNombre) {

                asignacionesEncontradas.push({

                  dia: dia.charAt(0).toUpperCase() + dia.slice(1),

                  turno: turnoId,

                  hora: turnoDef.hora,

                  caja: caja,

                });

              }

            }

          });

        }

      });

      return asignacionesEncontradas;

    },

    [asignaciones, turnosPorDia]

  );



  const mostrarAlerta = (mensaje, variante = "warning") => {

    setAlerta({ mensaje, variante });

    setTimeout(() => setAlerta(null), 3000);

  };



  const agregarPersona = () => {

    if (nuevaPersona.trim() && !personas.includes(nuevaPersona.trim())) {

      setPersonas([...personas, nuevaPersona.trim()]);

      setNuevaPersona("");

      mostrarAlerta("Persona agregada exitosamente.", "success");

    } else if (personas.includes(nuevaPersona.trim())) {

      mostrarAlerta("¡Esa persona ya existe!", "danger");

    } else {

      mostrarAlerta("El nombre de la persona no puede estar vacío.", "warning");

    }

  };



  const iniciarEdicion = (persona) => {

    setEditingPersona(persona);

    setEditedName(persona);

  };



  const guardarEdicion = (oldName) => {

    const newName = editedName.trim();



    if (!newName) {

      mostrarAlerta("El nombre no puede estar vacío.", "warning");

      return;

    }

    if (newName === oldName) {

      mostrarAlerta("No se realizaron cambios.", "info");

      setEditingPersona(null);

      return;

    }

    if (personas.includes(newName)) {

      mostrarAlerta(

        "Ese nombre ya existe. Por favor, elige uno diferente.",

        "danger"

      );

      return;

    }



    setPersonas(personas.map((p) => (p === oldName ? newName : p)));



    const nuevasAsignaciones = { ...asignaciones };

    let asignacionesActualizadas = false;

    for (const dia in nuevasAsignaciones) {

      for (const turnoId in nuevasAsignaciones[dia]) {

        // Asegúrate de que asignaciones[dia][turnoId] sea un objeto antes de iterar

        if (typeof nuevasAsignaciones[dia][turnoId] === 'object' && nuevasAsignaciones[dia][turnoId] !== null) {

          for (const caja in nuevasAsignaciones[dia][turnoId]) {

            if (nuevasAsignaciones[dia][turnoId][caja] === oldName) {

              nuevasAsignaciones[dia][turnoId][caja] = newName;

              asignacionesActualizadas = true;

            }

          }

        }

      }

    }

    if (asignacionesActualizadas) {

      setAsignaciones(nuevasAsignaciones);

    }



    mostrarAlerta(

      `"${oldName}" ha sido actualizado a "${newName}".`,

      "success"

    );

    setEditingPersona(null);

  };



  const cancelarEdicion = () => {

    setEditingPersona(null);

    setEditedName("");

  };



  const iniciarEliminacion = (persona) => {

    setPersonaAEliminarConfirm(persona);

    setShowConfirmModal(true);

  };



  const confirmarEliminacion = () => {

    const personaAEliminar = personaAEliminarConfirm;

    let tieneAsignaciones = false;

    const nuevasAsignaciones = { ...asignaciones };



    for (const dia in nuevasAsignaciones) {

      for (const turnoId in nuevasAsignaciones[dia]) {

        const cajasActualizadas = {};

        let turnoVacio = true;

        // Asegúrate de que asignaciones[dia][turnoId] sea un objeto antes de iterar

        if (typeof nuevasAsignaciones[dia][turnoId] === 'object' && nuevasAsignaciones[dia][turnoId] !== null) {

          for (const caja in nuevasAsignaciones[dia][turnoId]) {

            if (nuevasAsignaciones[dia][turnoId][caja] === personaAEliminar) {

              tieneAsignaciones = true;

            } else {

              cajasActualizadas[caja] = nuevasAsignaciones[dia][turnoId][caja];

              turnoVacio = false;

            }

          }

        }



        if (turnoVacio) {

          delete nuevasAsignaciones[dia][turnoId];

        } else {

          nuevasAsignaciones[dia][turnoId] = cajasActualizadas;

        }

      }

      if (Object.keys(nuevasAsignaciones[dia]).length === 0) {

        delete nuevasAsignaciones[dia];

      }

    }



    setAsignaciones(nuevasAsignaciones);

    setPersonas(personas.filter((p) => p !== personaAEliminar));



    if (tieneAsignaciones) {

      mostrarAlerta(

        `"${personaAEliminar}" eliminada y sus asignaciones limpiadas.`,

        "info"

      );

    } else {

      mostrarAlerta(`"${personaAEliminar}" eliminada.`, "info");

    }



    setShowConfirmModal(false);

    setPersonaAEliminarConfirm(null);

  };



  const cancelarEliminacion = () => {

    setShowConfirmModal(false);

    if (personaAEliminarConfirm) {

      mostrarAlerta(

        `Eliminación de "${personaAEliminarConfirm}" cancelada.`,

        "secondary"

      );

    }

    setPersonaAEliminarConfirm(null);

  };



  // Participantes filtrados y ordenados

  const participantesConEstado = useMemo(() => {

    // Si el filtro está vacío, solo ordena el array completo de personas.

    const participantesFiltrados = personas.filter((persona) =>

      filtro ? persona.toLowerCase().includes(filtro.toLowerCase()) : true // <--- MODIFICACIÓN: Filtra solo si hay texto en 'filtro'

    );



    const sortedParticipantes = [...participantesFiltrados].sort((a, b) =>

      a.localeCompare(b)

    );



    return sortedParticipantes.map((persona) => ({

      nombre: persona,

      asignado: personaTieneAsignaciones(persona),

    }));

  }, [personas, filtro, personaTieneAsignaciones]); // Asegúrate de que todas las dependencias estén aquí





  return (

    <Offcanvas show={show} onHide={onClose} placement="start">

      <Offcanvas.Header closeButton>

        <Offcanvas.Title>

          Participantes

          <span className="ms-3 badge bg-info">

            Total: {totalParticipantesSinFiltro}

            {filtro && ` (Filtrados: ${totalParticipantesFiltrados})`}

          </span>

        </Offcanvas.Title>

      </Offcanvas.Header>

      <Offcanvas.Body>

        <Form className="mb-3">

          {/* Formulario de agregar persona: Solo visible para administradores */}

          {isAdminLoggedIn && ( // <--- MODIFICACIÓN: Condicional para Administrador

            <InputGroup className="mb-3">

              <Form.Control

                type="text"

                placeholder="Agregar nuevo participante"

                value={nuevaPersona}

                onChange={(e) => setNuevaPersona(e.target.value)}

                onKeyPress={(e) => {

                  if (e.key === "Enter") {

                    e.preventDefault();

                    agregarPersona();

                  }

                }}

              />

              <Button variant="primary" onClick={agregarPersona}>

                Agregar

              </Button>

            </InputGroup>

          )}



          <InputGroup className="mb-3">

            <Form.Control

              type="text"

              placeholder="Buscar participante..."

              value={filtro}

              onChange={(e) => setFiltro(e.target.value)}

            />

            <InputGroup.Text>🔍</InputGroup.Text>

          </InputGroup>

        </Form>



        <ListGroup className="mb-3">

          {participantesConEstado.length > 0 ? (

            participantesConEstado.map((participante, index) => (

              <React.Fragment key={index}>

                <ListGroup.Item

                  as="div"

                  role="button"

                  tabIndex="0"

                  onClick={() =>

                    setOpenCollapse(

                      openCollapse === participante.nombre

                        ? null

                        : participante.nombre

                    )

                  }

                  className="d-flex justify-content-between align-items-center list-group-item-action-custom"

                  aria-controls={`collapse-asignaciones-${participante.nombre}`}

                  aria-expanded={openCollapse === participante.nombre}

                >

                  {/* Edición: Solo si es admin y está en modo edición */}

                  {editingPersona === participante.nombre && isAdminLoggedIn ? ( // <--- MODIFICACIÓN: Condicional para Administrador

                    <InputGroup className="flex-grow-1 me-2">

                      <Form.Control

                        type="text"

                        value={editedName}

                        onChange={(e) => setEditedName(e.target.value)}

                        onKeyPress={(e) => {

                          if (e.key === "Enter") {

                            e.preventDefault();

                            guardarEdicion(participante.nombre);

                          }

                        }}

                      />

                      <Button

                        variant="success"

                        onClick={() => guardarEdicion(participante.nombre)}

                      >

                        Guardar

                      </Button>

                      <Button

                        variant="outline-secondary"

                        onClick={cancelarEdicion}

                      >

                        Cancelar

                      </Button>

                    </InputGroup>

                  ) : (

                    <>

                      <span className="ms-2">

                        {openCollapse === participante.nombre ? "▲" : "▼"}

                      </span>

                      {participante.nombre}

                      <div>

                        <Button

                          variant={

                            participante.asignado ? "success" : "secondary"

                          }

                          size="sm"

                          className="me-2"

                          disabled

                        >

                          {participante.asignado

                            ? `Asignado [${contarAsignaciones(

                                participante.nombre

                              )}]`

                            : "Libre"}

                        </Button>

                        {/* Botones de Editar y Eliminar: Solo visibles para administradores */}

                        {isAdminLoggedIn && ( // <--- MODIFICACIÓN: Condicional para Administrador

                          <>

                            <Button

                              variant="outline-info"

                              size="sm"

                              className="me-2"

                              onClick={(e) => {

                                e.stopPropagation();

                                iniciarEdicion(participante.nombre);

                              }}

                            >

                              ✏️

                            </Button>

                            <Button

                              variant="outline-danger"

                              size="sm"

                              onClick={(e) => {

                                e.stopPropagation();

                                iniciarEliminacion(participante.nombre);

                              }}

                            >

                              🗑️

                            </Button>

                          </>

                        )}

                      </div>

                    </>

                  )}

                </ListGroup.Item>

                {/* Contenido colapsable (visible para todos) */}

                <Collapse in={openCollapse === participante.nombre}>

                  <div

                    id={`collapse-asignaciones-${participante.nombre}`}

                    className="ms-3 me-3 mt-1 mb-2 border-start ps-3 py-1"

                  >

                    <h6>Asignaciones:</h6>

                    {obtenerAsignacionesDePersona(participante.nombre).length >

                    0 ? (

                      <ListGroup variant="flush">

                        {obtenerAsignacionesDePersona(participante.nombre).map(

                          (asig, idx) => (

                            <ListGroup.Item key={idx} className="py-1 px-0 border-0">

                              <p className="mb-1">

                                <span className="me-2">🗓️</span>

                                <strong className="me-1">Día:</strong>{" "}

                                <span className="badge bg-primary">

                                  {asig.dia}

                                </span>

                                <span className="me-2">📦</span>

                                <strong className="me-1">Caja:</strong>{" "}

                                <span className="badge bg-success">

                                  {asig.caja}

                                </span>

                              </p>

                              <p className="mb-1">

                                <span className="me-2">⏰</span>

                                <strong className="me-1">Turno:</strong>{" "}

                                <span className="badge bg-info text-dark">

                                  {asig.turno} ({asig.hora})

                                </span>

                              </p>

                            </ListGroup.Item>

                          )

                        )}

                      </ListGroup>

                    ) : (

                      <p className="text-muted">No tiene asignaciones.</p>

                    )}

                  </div>

                </Collapse>

              </React.Fragment>

            ))

          ) : (

            <ListGroup.Item>Sin resultados.</ListGroup.Item>

          )}

        </ListGroup>



        {alerta && (

          <Alert variant={alerta.variante} className="mt-3">

            {alerta.mensaje}

          </Alert>

        )}

      </Offcanvas.Body>



      <Modal show={showConfirmModal} onHide={cancelarEliminacion} centered>

        <Modal.Header closeButton>

          <Modal.Title>Confirmar eliminación</Modal.Title>

        </Modal.Header>

        <Modal.Body>

          ¿Estás seguro de que deseas eliminar a "

          {personaAEliminarConfirm || ""}"?{" "}

          {personaAEliminarConfirm &&

          personaTieneAsignaciones(personaAEliminarConfirm)

            ? " Todas sus asignaciones serán borradas."

            : ""}

        </Modal.Body>

        <Modal.Footer>

          <Button variant="secondary" onClick={cancelarEliminacion}>

            Cancelar

          </Button>

          <Button variant="danger" onClick={confirmarEliminacion}>

            Eliminar

          </Button>

        </Modal.Footer>

      </Modal>

    </Offcanvas>

  );

};



export default ParticipantesPanel;