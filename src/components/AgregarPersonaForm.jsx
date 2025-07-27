// src/components/AgregarPersonaForm.js

import React, { useState, useEffect } from "react";

import { Alert } from "react-bootstrap";



const AgregarPersonaForm = ({

  cajas,

  turnos,

  onAgregar,

  modoEdicion,

  setModoEdicion,

  personas,

  setPersonas,

  // setTurnosPorDia, // Este prop ya no es necesario aquí

}) => {

  const [nombre, setNombre] = useState("");

  const [turno, setTurno] = useState(turnos[0]?.id || 1);

  const [caja, setCaja] = useState(cajas[0]);

  const [alerta, setAlerta] = useState(null);



  useEffect(() => {

    if (modoEdicion) {

      setNombre(modoEdicion.nombre);

      setTurno(parseInt(modoEdicion.turno.replace("T", "")));

      setCaja(modoEdicion.caja);

    }

  }, [modoEdicion]);



  // Se añadió `turnos` y `cajas` como dependencias para que se actualicen las selecciones

  // si el día cambia y se selecciona un nuevo `selectedDay` en `App.js`

  useEffect(() => {

    setTurno(turnos[0]?.id || 1);

    setCaja(cajas[0]);

  }, [turnos, cajas]);





  const mostrarAlerta = (mensaje, tipo = "warning") => {

    setAlerta({ mensaje, tipo });

    setTimeout(() => setAlerta(null), 3000);

  };



  const handleSubmit = (e) => {

    e.preventDefault();

    const nombreTrim = nombre.trim();

    if (!nombreTrim) {

      mostrarAlerta("El nombre no puede estar vacío.", "danger");

      return;

    }



    // Validar duplicado en lista de personas (se agrega solo si no existe)

    const yaExistePersona = personas.some(

      (p) => p.toLowerCase() === nombreTrim.toLowerCase()

    );



    if (!yaExistePersona) {

      setPersonas([...personas, nombreTrim]);

    }



    // `onAgregar` ahora devuelve un objeto con `error` si falla

    const result = onAgregar({ nombre: nombreTrim, turno: `T${turno}`, caja });



    // Aquí ya no es necesario el `if (resultado?.error)` porque `App.js` maneja la alerta directamente.

    // Solo limpiamos si no estamos en modo edición (ya que en edición el nombre se mantiene para una posible nueva edición)

    // y si la asignación fue "exitosa" (no hubo error retornado).

    if (!modoEdicion) {

      setNombre("");

      setCaja(cajas[0]); // Restablecer a la primera caja

      setTurno(turnos[0]?.id || 1); // Restablecer al primer turno

    }

    setModoEdicion(null); // Siempre salir del modo edición después de intentar agregar/actualizar

  };



  const handleCancelEdit = () => {

    setModoEdicion(null);

    setNombre("");

    setTurno(turnos[0]?.id || 1);

    setCaja(cajas[0]);

  };



  return (

    <>

      {alerta && (

        <Alert variant={alerta.tipo} className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3">

          {alerta.mensaje}

        </Alert>

      )}



      <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded shadow-sm">

        <h5 className="mb-3">{modoEdicion ? "Editar Asignación" : "Agregar Nueva Asignación"}</h5>

        <div className="row g-2">

          <div className="col-md-4">

            <input

              type="text"

              className="form-control"

              placeholder="Nombre"

              value={nombre}

              onChange={(e) => setNombre(e.target.value)}

              required

              list="sugerencias-personas"

            />

            <datalist id="sugerencias-personas">

              {personas.map((p, i) => (

                <option key={i} value={p} />

              ))}

            </datalist>

          </div>



          <div className="col-md-3">

            <select

              className="form-select"

              value={turno}

              onChange={(e) => setTurno(parseInt(e.target.value))}

            >

              {turnos.map((t) => (

                <option key={t.id} value={t.id}>

                  {`T${t.id} - ${t.hora}`}

                </option>

              ))}

            </select>

          </div>



          <div className="col-md-3">

            <select

              className="form-select"

              value={caja}

              onChange={(e) => setCaja(e.target.value)}

            >

              {cajas.map((c) => (

                <option key={c} value={c}>

                  {c}

                </option>

              ))}

            </select>

          </div>



          <div className="col-md-2 d-flex">

            <button className="btn btn-success flex-grow-1 me-1" type="submit">

              {modoEdicion ? "Actualizar" : "Agregar"}

            </button>

            {modoEdicion && (

              <button className="btn btn-outline-secondary" type="button" onClick={handleCancelEdit}>

                Cancelar

              </button>

            )}

          </div>

        </div>

      </form>

    </>

  );

};



export default AgregarPersonaForm;

///