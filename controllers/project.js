'use strict'
var Project = require('../models/project');
var fs = require('fs');
var path = require('path');
var controller = {

    home: function(req, res){
        return res.status(200).send({
            message: 'Soy home'
        });
    },

    test: function(req, res){
        return res.status(200).send({
            message: 'Soy test'
        });
    },

    saveProject: function(req, res){
        var project = new Project();
        var params = req.body;
        project.name = params.name;
        project.description = params.description;
        project.category = params.category;
        project.year = params.year;
        project.langs = params.langs;
        project.image = null;
        project.save((err, projectStored) => {
            if(err) return res.status(500).send({success: false, message: "Error al guardar."});
            if(!projectStored) return res.status(404).send({success: false, message: "No se ha podido guardar el proyecto."});
            return res.status(200).send({
                success: true,
                message: "Se guardó el proyecto con exito.",
                data: projectStored
            });
        });
    },

    getProject: function(req, res){
        var projectId = req.params.id;
        if(projectId == null){
            return res.status(404).send({success: false, message: "El proyecto no existe."});
        }
        Project.findById(projectId, (err, project) => {
            if(err) return res.status(500).send({success: false, message: "Error al devolver los datos."});
            if(!project) return res.status(404).send({success: false, message: "El proyecto no existe."});
            return res.status(200).send({
                success: true,
                message: "Se obtuvo el proyecto con exito.",
                data: project
            });
        });
    },

    getProjects: function(req, res){
        Project.find({}).sort('+year').exec((err, projects) => {
            if(err) return res.status(500).send({success: false, message: "Error al devolver los datos."});
            if(!projects) return res.status(404).send({success: false, message: "El proyecto no existe."});
            return res.status(200).send({
                success: true,
                message: "Se obtuvo el proyecto con exito.",
                data: projects
            });
        });
    },

    updateProject: function(req, res){
        var projectId = req.params.id;
        var update = req.body;
        Project.findByIdAndUpdate(projectId, update, {new: true}, (err, projectUpdated) => {
            if(err) return res.status(500).send({success: false, message: "Error al actualizar los datos."});
            if(!projectUpdated) return res.status(404).send({success: false, message: "El proyecto no se pudo actualizar."});
            return res.status(200).send({
                success: true,
                message: "Se actualizó el proyecto con exito.",
                data: projectUpdated
            });
        });
    },

    deleteProject: function(req, res){
        var projectId = req.params.id;
        Project.findByIdAndDelete(projectId, (err, projectDeleted) => {
            if(err) return res.status(500).send({success: false, message: "Error al eliminar los datos."});
            if(!projectDeleted) return res.status(404).send({success: false, message: "El proyecto no se pudo eliminar."});
            return res.status(200).send({
                success: true,
                message: "Se eliminó el proyecto con exito.",
                data: projectDeleted
            });
        });
    },

    uploadImagen: function(req, res){
        var projectId = req.params.id;
        var fileName = "Imagen no subida..";
        if(req.files){
            var filePath = req.files.image.path;
            var fileSplit = filePath.split('\\');
            fileName = fileSplit[1];
            var extSplit = fileName.split('.');
            var fileExt = extSplit[1];
            if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
                Project.findByIdAndUpdate(projectId, {image: fileName}, (err, projectUpdated) => {
                    if(err) return res.status(500).send({success: false, message: "Error al subir la imágen."});
                    if(!projectUpdated) return res.status(404).send({success: false, message: "La imagen no se pudo subir."});
                    return res.status(200).send({
                        success: true,
                        message: "Se cargó la imagen con exito.",
                        data: projectUpdated
                    });
                });
            }else{
                fs.unlink(filePath, (err) => {
                    return res.status(401).send({
                        success: false,
                        message: "La extensión " + fileExt + " no es válida."
                    });
                });
            }

        }else{
            return res.status(500).send({
                success: false,
                message: "No se pudo obtener la información de forma correcta.",
            });
        }
    },

    getImageFile: function(req, res){
        var file = req.params.image;
        var path_file = './uploads/' + file;
        fs.access(path_file, fs.constants.F_OK, err => {
            if(err){
                return res.status(401).send({success: false, message: "No existe la imágen..."});
            }else{
                return res.sendFile(path.resolve(path_file));
            }
        });
    }
};

module.exports = controller;