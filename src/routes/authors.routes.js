const express = require('express');
const db = require('../database');

const authorsRoute = express.Router();
require('dotenv').config();

// get authors route
authorsRoute.get('/authors', (req, res) => {
    db.all('SELECT * FROM authors', (err, rows) => {
        if(err) {
            return res.status(400).json({
                message: "error getting authors",
                status: 0
            });
        }
        res.json({"data": rows});
    });
});

// get author by id
authorsRoute.get('/authors/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        'SELECT * FROM authors WHERE id = ?',
        [id],
        (err, row) => {
            if(err) {
                return res.status(400).json({
                    message: "error getting author by id: " + id,
                    status: 0
                });
            }
            if(!row) {
                return res.status(400).json({
                    message: "No author with id: " + id,
                    status: 0
                });
            }
            res.json({
                "data": row
            });
        }
    );
});

// create author with unique id and passcode to give access to create author
authorsRoute.post('/authors', (req, res) => {
    const {name, bio, passcode} = req.body;

    if(passcode !== process.env.ADMIN_PASSWORD) {
        return res.status(404).json({
            message: "Unauthorized access to create author",
            status: 0
        });
    }

    if(!name || !bio) {
        return res.status(400).json({
            message: "Bad request name or bio is empty",
            status: 0
        });
    }

    db.run(
        `INSERT INTO authors (name, bio)
        VALUES (?, ?)`,
        [name.trim(), bio.trim()],
        function(err) {
            if(err) {
                return res.status(400).json({
                    message: "Error in inserting",
                    status: 0
                });
            }
            res.status(200).json({
                id: this.lastID,
                message: "Author created successfully",
                status: 1
            })
        }
    )
});

// edit author info with admin passcode
authorsRoute.patch('/authors', (req, res) => {
    const {id, passcode, name, bio} = req.body;

    if(!id || !passcode || !name || !bio) {
        return res.status(400).json({
            message: "Bad request: Invalid input, information are missing",
            status: 0
        });
    }

    if(passcode !== process.env.ADMIN_PASSWORD) {
        return res.status(404).json({
            message: "Unauthorized access to edit author",
            status: 0
        });
    }

    db.get(
        'SELECT COUNT(*) FROM authors WHERE id = ?', [id], (err, row) => {
            if(err) {
                return res.status(400).json({
                    message: "No author with id: " + id,
                    status: 0
                });
            }
            if(row['COUNT(*)'] > 0) {
                db.run(
                    'UPDATE authors SET name = ?, bio = ? WHERE id = ?',
                    [name, bio, id],
                    function(err) {
                        if(err) {
                            return res.status(400).json({
                                message: "error in updating author",
                                status: 0
                            });
                        }
                        res.status(200).json({
                            message: "Author updated successfully",
                            status: 1
                        });
                    }
                );
            } else {
                return res.status(404).json({
                    message: "author not found",
                    status: 0
                });
            }
        }
    )
});

// delete author with admin passcode
authorsRoute.delete('/authors', (req, res) => {
    const {id, passcode} = req.body;

    if(!id || !passcode) {
        if(!id) return res.status(404).json({message: "Id not found", status: 0});

        return res.status(400).json({
            message: "Passcode not found, need admin passcode",
            status: 0
        });
    }

    if(passcode !== process.env.ADMIN_PASSWORD) {
        return res.status(404).json({
            message: "Access denied",
            status: 0
        });
    }
    db.run(
        'DELETE FROM authors WHERE id = ?',
        [id],
        function(err) {
            if(err) {
                return res.status(400).json({
                    message: "Error deleting author",
                    status: 0
                })
            }
            if(this.changes === 0) {
                return res.status(404).json({ 
                    message: 'Author not found',
                    status: 0 
                });
            }
            res.status(200).json({
                message: "Author successfully deleted",
                status: 1
            })
        }
    )
});

module.exports = authorsRoute;
