const multer = require('multer');
const multerConfig = require('../utils/multerConfig');
const Products = require('../models/Products');

const upload = multer(multerConfig).single('image');

exports.fileUpload = (req, res, next)=> {
    upload(req, res, function(error){
        if (error){
            res.json({mesagge: error});
        }
        return next();
    });
};

//Agregar producto
exports.add = async (req, res) => {
    const product = new Products(req.body);
    try {
        if(req.file && req.file.filename){
            product.image = req.file.filename;
        }
        await product.save();
        res.json({ message: 'Nuevo producto agregado' });

    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                message: `Ya existe un producto con el sku: ${req.body.sku}`,
            });
        } else {
            res.status(400).json({
                mesagge: 'Error al procesar la peticion'
            });
        }
    }
};


//primera accion: list
exports.list = async (req, res) => {
    try {
        const product = await Products.find({});
        res.json(product);
    } catch (error) {
        res.status(400).json({
            mesagge: 'Error al procesar la petición'
        });
        next();
    }
};

// leer producto por id
exports.show = async (req, res, next) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'El producto no existe' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error al procesar la peticion' });
    }
};

//Actualizar producto
exports.update = async (req, res, next) => {
    try {
        let newProduct = req.body;
        if(req.file && req.file.filename){
            newProduct.image = req.file.filename;
        }else{
            const product = await Products.findById(req.params.id);
            newProduct.image = product.image;
        }
        const productUpdated = await Products.findOneAndUpdate(
            { _id: req.params.id },
            newProduct,
            { new: true }
        );
        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                message: `Ya existe un producto con el sku: ${req.body.sku}`,
            });
        } else {
            res.status(400).json({
                mesagge: 'Error al procesar la peticion'
            });
        }   
    }

};

//eliminar producto
exports.delete = async (req, res, next) => {
    try {
        await Products.findByIdAndDelete({ _id: req.params.id });
        res.json({ mesagge: 'El producto ha sido eliminado' })
    } catch (error) {
        res.status(400).json({
            mesagge: 'Error al procesar la petición'
        });
    }
}