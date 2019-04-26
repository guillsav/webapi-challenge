const express = require('express');
const db = require('../data/helpers/projectModel.js');

const router = express.Router();

// Custom Middleware
function checkRequired(req, res, next) {
  const name = req.body.name;
  const description = req.body.description;
  if (
    !name ||
    !description ||
    (name.length === 0 && description.length === 0)
  ) {
    res.status(400).json({
      errorMessage: 'Please provide a name and a description for the project.'
    });
  } else {
    next();
  }
}

router.post('/', checkRequired, async (req, res) => {
  try {
    const newProject = await db.insert(req.body);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({
      error: 'There was an error while saving the project to the database.'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const projects = await db.get();
    res.status(200).json(projects);
  } catch (error) {
    res
      .status(500)
      .json({error: 'The projects information could not be retrieved.'});
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await db.get(req.params.id);
    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({
        message: `The project with the specified ID of ${
          req.params.id
        } does not exist.`
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({error: 'The project information could not be retrieved.'});
  }
});

router.put('/:id', checkRequired, async (req, res) => {
  try {
    const editedProject = await db.update(req.params.id, req.body);
    if (editedProject) {
      res.status(201).json(editedProject);
    } else {
      res.status(404).json({
        message: `The project with the specified ID of ${
          req.params.id
        } does not exist.`
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({error: 'The project information could not be modified.'});
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await db.remove(req.params.id);
    if (deletedPost) {
      res.status(204).end();
    } else {
      res.status(404).json({
        message: `The project with the specified ID of ${
          req.params.id
        } does not exist.`
      });
    }
  } catch (error) {
    res.status(500).json({error: 'The project could not be removed'});
  }
});

module.exports = router;
