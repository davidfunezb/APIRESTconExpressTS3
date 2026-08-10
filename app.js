const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Archivo que simula la base de datos
const DB_PATH = path.join(__dirname, 'libros.json');

const leerLibros = () => {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (error) {
        return [];
    }
};

const guardarLibros = (libros) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(libros, null, 2), 'utf8');
};

// GET para todos los libros que se encuentran en la base de datos
app.get("/api/books",(req, res)=>{
    const libros = leerLibros();
    res.status(200).json({status:200, message:"Success", data: libros});
    });

// GET para buscar un libro por su id
app.get("/api/books/:id",(req, res)=>{
    const id = parseInt(req.params.id);
    const libros = leerLibros();

    let libroEncontrado = null;

    libros.forEach(libro => {
        if(libro.id === id){
                libroEncontrado = libro;
        }
    });

    if(libroEncontrado){
        return res.status(200).json({status:200, message:"Success", data: libroEncontrado});
    }else{
        return res.status(404).json({status:404, message:"Libro no encontrado"});
    }
});

// POST agregar un libro nuevo 
app.post("/api/books", (req,res)=>{
    const libro = req.body;
    const libros = leerLibros();

    if(!libro.titulo || !libro.autor || !libro.genero || !libro.anioPublicacion){
        return res.status(400).json({status:400, message:"Se requiere titulo, autor, genero y anioPublicacion"});
    }

    libro.id = libros.length > 0 ? Math.max(...libros.map(l => l.id)) + 1 : 1;

    libros.push(libro);
    guardarLibros(libros);

    res.status(200).json({status:200, message:"Registro agregado", data: libro});
});

// PUT para actualizar un libro 
app.put("/api/books/:id",(req, res)=>{
    const id = parseInt(req.params.id);
    const libro = req.body;
    const libros = leerLibros();

    let isActive = false;

    libros.forEach(clibro => {
        if(clibro.id === id){
            isActive = true;
            clibro.titulo = libro.titulo || clibro.titulo;
            clibro.autor = libro.autor || clibro.autor;
            clibro.genero = libro.genero || clibro.genero;
            clibro.anioPublicacion = libro.anioPublicacion || clibro.anioPublicacion;
        }
    });

    if(isActive){
        guardarLibros(libros);
        return res.status(200).json({status:200, message:"Registro actualizado", data: libros});
    }else{
        return res.status(404).json({status:404, message:"Libro no encontrado"});
    }
});

























app.delete("/api/books/:id", (req,res)=>{
    const id = parseInt(req.params.id);
    const libros = leerLibros();
    const filtroLibros = libros.filter(libro => libro.id !== id);
    
    if (filtroLibros.length !== libros.length) {
        guardarLibros(filtroLibros);
        return res.status(200).json({status:200, message:"Registro eliminado"});
        } else {
            return res.status(404).json({status:404, message:"Libro no encontrado"});
        }
    });

app.listen(PORT, ()=>{
    console.log(`El servidor de express esta escuchando en http://localhost:${PORT}`);
});
