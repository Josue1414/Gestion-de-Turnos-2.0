// src/components/TurnosTable.jsx

import React, { useState } from "react";

import { Form, Button } from "react-bootstrap"; // Importa Form y Button de react-bootstrap



const TurnosTable = ({ asignaciones, turnos, cajas, onEditar, onEliminar, tableRef, isAdminLoggedIn, personas, onAsignarDirecto, setPersonas }) => {

  // Estado para la celda que se está editando directamente (turnoId, caja)

  const [editingCell, setEditingCell] = useState(null); // { turnoId: 'T1', caja: 'Caja1' }

  const [currentInputValue, setCurrentInputValue] = useState("");



  const handleCellClick = (turnoId, caja) => {

    if (isAdminLoggedIn) {

      setEditingCell({ turnoId, caja });

      setCurrentInputValue(""); // Limpiar el input al empezar a editar una celda vacía

    }

  };



  const handleSaveDirectAsignacion = (turnoId, caja) => {

    const nombre = currentInputValue.trim();

    if (!nombre) return;



    // Si el nombre no está en la lista, lo agregas

    if (!personas.includes(nombre)) {

      setPersonas([...personas, nombre]);

    }



    onAsignarDirecto({

      nombre,

      turno: turnoId,

      caja: caja,

    });

    setEditingCell(null); // Salir del modo de edición

    setCurrentInputValue(""); // Limpiar el input

  };



  const handleCancelDirectAsignacion = () => {

    setEditingCell(null);

    setCurrentInputValue("");

  };



  const handleKeyPress = (e, turnoId, caja) => {

    if (e.key === 'Enter') {

      e.preventDefault(); // Evita el comportamiento por defecto de Enter en formularios

      handleSaveDirectAsignacion(turnoId, caja);

    } else if (e.key === 'Escape') {

      handleCancelDirectAsignacion();

    }

  };



  return (

    <div className="table-responsive mb-4">

      <table ref={tableRef} className="table table-bordered text-center align-middle">

        <thead className="table-dark">

          <tr>

            <th>Turno</th>

            <th>Horario</th>

            {cajas.map((caja) => (

              <th key={caja}>{caja}</th>

            ))}

          </tr>

        </thead>

        <tbody>

          {turnos.map((turno) => {

            const turnoId = `T${turno.id}`;

            const fila = asignaciones[turnoId] || {};

            return (

              <tr key={turno.id}>

                <td>{turnoId}</td>

                <td>{turno.hora}</td>

                {cajas.map((caja) => {

                  const personaAsignada = fila[caja];

                  const isEditingThisCell = editingCell && editingCell.turnoId === turnoId && editingCell.caja === caja;



                  return (

                    <td key={caja}>

                      {personaAsignada ? (

                        // Caso: Hay una persona asignada (mantén la edición/eliminación vía modal)

                        <div className="d-flex justify-content-between align-items-center">

                          <span>{personaAsignada}</span>

                          {isAdminLoggedIn && (

                            <div className="btn-group btn-group-sm ms-2">

                              <button

                                className="btn btn-outline-primary"

                                onClick={() =>

                                  onEditar({

                                    nombre: fila[caja],

                                    turno: turnoId,

                                    caja,

                                  })

                                }

                              >

                                ✏️

                              </button>

                              <button

                                className="btn btn-outline-danger"

                                onClick={() =>

                                  onEliminar({ turno: turnoId, caja })

                                }

                              >

                                🗑️

                              </button>

                            </div>

                          )}

                        </div>

                      ) : (

                        // Caso: NO hay persona asignada

                        <React.Fragment>

                          {isAdminLoggedIn ? (

                            isEditingThisCell ? (

                              // Si es administrador y esta celda está en modo de edición en línea

                              <div className="d-flex flex-column align-items-stretch">

                                <Form.Control

                                  as="input"

                                  list="participantes-list"

                                  type="text"

                                  placeholder="Nombre..."

                                  value={currentInputValue}

                                  onChange={(e) => setCurrentInputValue(e.target.value)}

                                  onKeyDown={(e) => handleKeyPress(e, turnoId, caja)}

                                  autoFocus // Para que el cursor esté listo al aparecer

                                  className="mb-1"

                                />

                                <datalist id="participantes-list">

                                  {personas.map((p) => (

                                    <option key={p} value={p} />

                                  ))}

                                </datalist>

                                <div className="d-flex justify-content-between">

                                  <Button

                                    variant="success"

                                    size="sm"

                                    onClick={() => handleSaveDirectAsignacion(turnoId, caja)}

                                    disabled={!currentInputValue.trim()} // Deshabilitar si el input está vacío

                                  >

                                    ✔️ Guardar

                                  </Button>

                                  <Button

                                    variant="secondary"

                                    size="sm"

                                    onClick={handleCancelDirectAsignacion}

                                  >

                                    ✖️ Cancelar

                                  </Button>

                                </div>

                              </div>

                            ) : (

                              // Si es administrador y la celda está vacía, mostrar un indicador clicable

                              <div

                                className="d-flex justify-content-center align-items-center w-100 h-100"

                                style={{ minHeight: '38px', cursor: 'pointer' }} // minHeight para que el div tenga un tamaño clickeable

                                onClick={() => handleCellClick(turnoId, caja)}

                              >

                                <span className="text-muted">➕ Asignar (clic)</span>

                              </div>

                            )

                          ) : (

                            // Si es público, mostrar un guion estático

                            <span className="text-muted">—</span>

                          )}

                        </React.Fragment>

                      )}

                    </td>

                  );

                })}

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  );

};



export default TurnosTable;