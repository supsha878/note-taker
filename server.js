// import dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const uniqid = require('uniqid');

// port declaration for roku or for localhost
const PORT = process.env.PORT || 3001;

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));

// HTML routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

// functions to read, write, and edit database file

// send a promise response to a fetch request
const readFromFile = util.promisify(fs.readFile);

// write content to JSON file and format
const writeToFile = (file, content) => {
    fs.writeFile(file, JSON.stringify(content, null, 4), (err) =>
    err ? console.log(err) : console.log('success')
    );
}

// append new note object onto database
const appendAndWrite = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
}

// delete a note object from database based on id argument
const deleteFromFile = (id, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.splice(parsedData.findIndex((id) => id === parsedData.id), 1);
            writeToFile(file, parsedData);
        }
    });
}

// API routes - CRUD

// R - retrieve data
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received to get notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// C - create data
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to post note`);
    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uniqid()
        };

        appendAndWrite(newNote, './db/db.json');
        res.json(`note added successfully`);
    } else {
        res.error('error adding note');
    }
});

// D - delete data
app.delete('/api/notes/:id', (req, res) => {
    console.info(`${req.method} request received to delete note`);
    const id = req.body;

    if (req.body) {
        deleteFromFile(id, './db/db.json');
        res.json('note deleted successfully');
    } else {
        res.error('error deleting note');
    }
});

// port listener
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);