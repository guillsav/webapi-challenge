const express = require('express');
const actDb = require('../data/helpers/actionModel.js');
const projDb = require('../data/helpers/projectModel.js');

const router = express.Router();

// Custom Middleware
function checkRequired(req, res, next) {
  const projectId = req.body.project_id;
  const description = req.body.description;
  const notes = req.body.notes;
  if (
    !projectId ||
    !description ||
    !notes ||
    (description.length === 0 && notes.length === 0)
  ) {
    res.status(400).json({
      errorMessage:
        'Please provide a project ID, a description and notes for the action.'
    });
  } else if (description.length > 128) {
    res.status(400).json({
      errorMessage: 'Description should not be longer than 128 characters.'
    });
  } else {
    next();
  }
}

router.post('/', checkRequired, async (req, res) => {
  const project = await projDb.get(req.body.project_id);
  if (project) {
    try {
      const newAction = await actDb.insert(req.body);
      res.status(201).json(newAction);
    } catch (error) {
      res.status(500).json({
        error: 'There was an error while saving the action to the database.'
      });
    }
  } else {
    res.status(400).json({
      message: `The project with the specified ID of ${
        req.body.project_id
      } does not exist.`
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const actions = await actDb.get();
    res.status(200).json(actions);
  } catch (error) {
    res
      .status(500)
      .json({error: 'The actions information could not be retrieved.'});
  }
});

router.get('/:id', async (req, res) => {
  try {
    const action = await actDb.get(req.params.id);
    if (action) {
      res.status(200).json(action);
    } else {
      res
        .status(404)
        .json({message: `The action with the specified ID does not exist.`});
    }
  } catch (error) {
    res
      .status(500)
      .json({error: 'The action information could not be retrieved.'});
  }
});

router.put('/:id', checkRequired, async (req, res) => {
  try {
    const editedAction = await actDb.update(req.params.id, req.body);
    if (editedAction) {
      res.status(201).json(editedAction);
    } else {
      res
        .status(404)
        .json({message: `The action with the specified ID does not exist.`});
    }
  } catch (error) {
    res
      .status(500)
      .json({error: 'The action information could not be modified.'});
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedAction = await actDb.remove(req.params.id);
    if (deletedAction) {
      res.status(204).end();
    } else {
      res
        .status(404)
        .json({message: `The action with the specified ID does not exist.`});
    }
  } catch (error) {
    res.status(500).json({error: 'The action could not be removed'});
  }
});

module.exports = router;
