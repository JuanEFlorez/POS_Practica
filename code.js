document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const productList = document.querySelector('tbody');
    let productos = [];
    let idProductoAEliminar = null;  // Variable para guardar el ID del producto a eliminar

    // Instanciar los modales una vez
    const modalArticulo = new bootstrap.Modal(document.getElementById('modalArticulo'));
    const modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));

    // Función para cargar productos desde la base de datos
    const cargarProductos = () => {
        fetch('/productos')
            .then(response => response.json())
            .then(data => {
                productos = data;
                renderizarProductos();
            })
            .catch(error => console.error('Error al cargar productos:', error));
    };

    // Renderizar productos en la tabla
    const renderizarProductos = () => {
        productList.innerHTML = '';
        productos.forEach((producto) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.IDProducto}</td>
                <td>${producto.NombreProducto}</td>
                <td>${producto.Descripcion}</td>
                <td>${producto.Precio}</td>
                <td>${producto.Stock}</td>
                <td>
                    <button class="btn btn-warning btn-sm btn-editar" data-id="${producto.IDProducto}">Editar</button>
                    <button class="btn btn-danger btn-sm btn-eliminar" data-id="${producto.IDProducto}">Eliminar</button>
                </td>
            `;
            productList.appendChild(tr);
        });

        // Asociar eventos a los botones de edición y eliminación
        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', (e) => {
                editarProducto(parseInt(e.target.dataset.id));
            });
        });

        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', (e) => {
                prepararEliminarProducto(parseInt(e.target.dataset.id));
            });
        });
    };

    // Crear o editar producto
    productForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nombreProducto = document.getElementById('nombreProducto').value;
        const descripcion = document.getElementById('descripcion').value;
        const precio = document.getElementById('precio').value;
        const stock = document.getElementById('stock').value;
        const id = document.getElementById('productForm').dataset.productId;

        const url = id ? `/productos/${id}` : '/productos';
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                NombreProducto: nombreProducto, 
                Descripcion: descripcion, 
                Precio: precio, 
                Stock: stock 
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(() => {
            modalArticulo.hide();
            location.reload(); // Recargar la página para reflejar cambios
        })
        .catch(error => {
            console.error('Error al guardar producto:', error);
            alert("Ocurrió un error al guardar el producto.");
        });
    });

    // Configuración del botón Crear
    document.getElementById('btnCrear').addEventListener('click', () => {
        // Limpia el formulario y borra cualquier ID de producto para crear uno nuevo
        productForm.reset();
        delete productForm.dataset.productId;
        document.getElementById('modalArticulo').querySelector('.modal-title').textContent = 'Crear Producto';
        modalArticulo.show();
    });

    // Editar producto
    const editarProducto = (id) => {
        const producto = productos.find(p => p.IDProducto === id);
        if (!producto) {
            console.error(`Producto con ID ${id} no encontrado.`);
            return;
        }
        document.getElementById('nombreProducto').value = producto.NombreProducto;
        document.getElementById('descripcion').value = producto.Descripcion;
        document.getElementById('precio').value = producto.Precio;
        document.getElementById('stock').value = producto.Stock;
        productForm.dataset.productId = id;  // Guarda el ID para actualizar
        document.getElementById('modalArticulo').querySelector('.modal-title').textContent = 'Editar Producto';
        modalArticulo.show();
    };

    // Preparar la eliminación del producto
    const prepararEliminarProducto = (id) => {
        const producto = productos.find(p => p.IDProducto === id);
        if (!producto) {
            console.error(`Producto con ID ${id} no encontrado.`);
            return;
        }

        // Almacenar el ID del producto a eliminar
        idProductoAEliminar = id;
        
        // Mostrar el nombre del producto a eliminar en el modal
        document.getElementById('productoAEliminar').textContent = `${producto.NombreProducto} (${producto.Descripcion})`;

        // Mostrar el modal de confirmación de eliminación
        modalEliminar.show();
    };

    // Confirmar eliminación del producto
    document.getElementById('btnConfirmarEliminar').addEventListener('click', () => {
        if (idProductoAEliminar) {
            fetch(`/productos/${idProductoAEliminar}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud de eliminación');
                }
                modalEliminar.hide();
                location.reload(); // Recargar la página después de la eliminación
            })
            .catch(error => console.error('Error al eliminar producto:', error));
        }
    });

    // Cargar productos al inicio
    cargarProductos();
});
