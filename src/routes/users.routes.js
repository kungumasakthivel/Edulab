const express = require('express');
const db = require('../database');

const usersRoute = express.Router();

// get all users 
usersRoute.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, (err, rows) => {
        if(err) {
            return res.send(400).json({
                message: "Error in getting users",
                status: 0
            });
        }
        res.json({"data": rows});
    });
});

// get user by id
usersRoute.get('/users/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        `SELECT * FROM users WHERE id = ?`,
        [id],
        (err, row) => {
            if(err) {
                return res.send(400).json({
                    message: "Error in getting book by id: " + id,
                    status: 0
                });
            }
            if(!row) {
                return res.status(400).json({
                    message: 'error no such post found from id: ' + id,
                    status: 0
                });
            }
            res.json({"data": row});
        }
    );
});

// create new user
usersRoute.post('/users', (req, res) => {
    const {username, email} = req.body;
    
    db.get(`SELECT * FROM users WHERE username = ? OR email = ?`, [username, email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        if(user) {
            return res.send(400).json({
                message: 'user already exist with given username or email, use unique username and email',
                status: 0
            });
        }
    });

    if(username === undefined || email === undefined) {
        return res.status(400).json({
            message: 'username or email is not defined',
            status: 0
        })
    }
    if(username.length === 0 || email.length === 0) {
        return res.status(400).json({
            message: "username or email is empty",
            status: 0
        })
    }

    db.run(`INSERT INTO users (username, email) VALUES (?, ?)`, [username, email], function(err) {
        if(err) {
            return res.status(400).json({
                message: 'user not created',
                status: 0
            });
        }
        res.status(201).json({
            id: this.lastID,
            message: 'user created successfully',
            status: 1
        });
    })
});

// delete user
usersRoute.delete('/users', (req, res) => {
    const {email} = req.body;

    db.run(
        `DELETE FROM users WHERE email = ?`,
        [email],
        function(err) {
            if (err) {
                return res.status(400).json({ 
                    message: 'Error deleting user',
                    status: 0
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({ 
                    message: 'User not found',
                    status: 0 
                });
            }
            res.status(200).json({
                message: 'Deleted the post successfully, email: ' + email,
                status: 1 
            })
        }
    )
})

module.exports = usersRoute;