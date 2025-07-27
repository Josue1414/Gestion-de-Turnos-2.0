// src/components/ImageUploader.js

import React, { useState } from 'react';

import { Form, Button, Alert } from 'react-bootstrap';



const ImageUploader = ({ setMapImageUrl }) => {

    const [file, setFile] = useState(null);

    const [previewUrl, setPreviewUrl] = useState(null);

    const [error, setError] = useState(null);



    const handleFileChange = (event) => {

        setError(null);

        const selectedFile = event.target.files[0];

        if (selectedFile) {

            if (selectedFile.type.startsWith('image/')) {

                setFile(selectedFile);

                const reader = new FileReader();

                reader.onloadend = () => {

                    setPreviewUrl(reader.result);

                };

                reader.readAsDataURL(selectedFile);

            } else {

                setFile(null);

                setPreviewUrl(null);

                setError('Por favor, selecciona un archivo de imagen válido.');

            }

        } else {

            setFile(null);

            setPreviewUrl(null);

        }

    };



    const handleUpload = () => {

        if (file && previewUrl) {

            setMapImageUrl(previewUrl); // Actualiza la URL de la imagen en el estado de App.js

            setError(null);

            // Opcional: limpiar la selección del archivo y la previsualización después de subir

            // setFile(null);

            // setPreviewUrl(null);

            // alert('Croquis subido correctamente!'); // Esto lo manejará App.js con su alerta principal

        } else {

            setError('Por favor, selecciona una imagen para subir.');

        }

    };



    return (

        <div className="mb-3">

            <Form.Group controlId="formFile" className="mb-3">

                <Form.Label>Subir nuevo Croquis</Form.Label>

                <Form.Control type="file" accept="image/*" onChange={handleFileChange} />

            </Form.Group>



            {error && <Alert variant="danger">{error}</Alert>}



            {previewUrl && (

                <div className="text-center mb-3">

                    <h6>Previsualización:</h6>

                    <img src={previewUrl} alt="Previsualización" className="img-fluid rounded" style={{ maxHeight: '150px', border: '1px solid #ddd' }} />

                    <Button variant="success" className="mt-2" onClick={handleUpload}>

                        Cargar Croquis

                    </Button>

                </div>

            )}

        </div>

    );

};



export default ImageUploader;