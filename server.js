const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '.')));

const connection = mysql.createConnection({
    host: '127.0.0.1',        // Asegúrate de que este sea el host correcto
    user: 'root',             // Usuario de MySQL
    password: '',             // Contraseña (déjalo en blanco si no tienes una)
    database: 'POS'           // Asegúrate de que el nombre de la base de datos sea correcto
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos POS');
});

app.get('/productos', (req, res) => {
    const query = 'SELECT * FROM productos';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            res.status(500).send('Error al obtener los productos');
        } else {
            res.json(results);
        }
    });
});

app.post('/productos', (req, res) => {
    const { NombreProducto, Descripcion, Precio, Stock } = req.body;
    console.log('Datos recibidos para crear:', req.body);

    const query = 'INSERT INTO productos (NombreProducto, Descripcion, Precio, Stock) VALUES (?, ?, ?, ?)';
    connection.query(query, [NombreProducto, Descripcion, Precio, Stock], (err, result) => {
        if (err) {
            console.error('Error al crear el producto:', err);
            res.status(500).send('Error al crear el producto');
        } else {
            res.status(201).json({ id: result.insertId, NombreProducto, Descripcion, Precio, Stock });
        }
    });
});

app.put('/productos/:id', (req, res) => {
    const { id } = req.params;
    const { NombreProducto, Descripcion, Precio, Stock } = req.body;
    console.log('Datos recibidos para actualizar:', req.body);

    const query = 'UPDATE productos SET NombreProducto = ?, Descripcion = ?, Precio = ?, Stock = ? WHERE IDProducto = ?';
    connection.query(query, [NombreProducto, Descripcion, Precio, Stock, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            res.status(500).send('Error al actualizar el producto');
        } else {
            res.json({ message: 'Producto actualizado' });  // Aquí devolvemos un objeto JSON
        }
    });
});

app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    console.log('ID para eliminar:', id);

    const query = 'DELETE FROM productos WHERE IDProducto = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            res.status(500).send('Error al eliminar el producto');
        } else {
            res.send('Producto eliminado');
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});