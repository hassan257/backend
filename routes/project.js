'use strict'
var express = require('express');
const ProjectController = require('../controllers/project');

var router = express.Router();
var multiPart = require('connect-multiparty');
var multipartMiddleware = multiPart({uploadDir: './uploads'});
router.get('/home', ProjectController.home);
router.post('/test', ProjectController.test);
router.post('/save-project', ProjectController.saveProject);
router.get('/project/:id', ProjectController.getProject);
router.get('/projects', ProjectController.getProjects);
router.put('/project/:id', ProjectController.updateProject);
router.delete('/project/:id', ProjectController.deleteProject);
router.post('/uploadimage/:id', multipartMiddleware,ProjectController.uploadImagen);
router.get('/get-image/:image', ProjectController.getImageFile);

module.exports = router;