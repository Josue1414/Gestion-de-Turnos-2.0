// src/components/LoginModal.js

import React, { useState } from 'react';

import { Modal, Button, Form, Alert } from 'react-bootstrap';



const LoginModal = ({ show, onClose, onLogin }) => {

 const [username, setUsername] = useState(''); // Nuevo estado para el usuario

 const [password, setPassword] = useState('');

 const [error, setError] = useState('');



 const handleSubmit = (e) => {

  e.preventDefault();

  setError(''); // Limpiar errores previos

  // La validación real se hará en App.js a través de onLogin

  onLogin(username, password); // Pasa tanto el usuario como la contraseña

  setPassword(''); // Limpiar campo después del intento de login

  setUsername(''); // Limpiar campo de usuario también

 };



 const handleClose = () => {

  setUsername('');

  setPassword('');

  setError('');

  onClose();

 };



 return (

  <Modal show={show} onHide={handleClose} centered>

   <Modal.Header closeButton>

    <Modal.Title>Acceso de Administrador</Modal.Title>

   </Modal.Header>

   <Modal.Body>

    {error && <Alert variant="danger">{error}</Alert>}

    <Form onSubmit={handleSubmit}>

     {/* Campo para el nombre de usuario */}

     <Form.Group className="mb-3" controlId="formBasicUsername">

      <Form.Label>Usuario</Form.Label>

      <Form.Control

       type="text"

       placeholder="Ingresa el usuario"

       value={username}

       onChange={(e) => setUsername(e.target.value)}

       autoFocus

      />

     </Form.Group>



     {/* Campo para la contraseña */}

     <Form.Group className="mb-3" controlId="formBasicPassword">

      <Form.Label>Contraseña</Form.Label>

      <Form.Control

       type="password"

       placeholder="Ingresa la contraseña"

       value={password}

       onChange={(e) => setPassword(e.target.value)}

      />

     </Form.Group>



     <Button variant="primary" type="submit" className="w-100">

      Ingresar

     </Button>

    </Form>

   </Modal.Body>

  </Modal>

 );

};



export default LoginModal;