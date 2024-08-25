const express = require('express');
const db = require('../database');

const booksRoute = express.Router();
require('dotenv').config();

// get all books
booksRoute.get('/books', (req, res) => {
    db.all(`SELECT * FROM books`, (err, rows) => {
        if(err) {
            return res.status(400).json({
                message: "Error getting books",
                status: 0
            });
        }
        res.json({"data": rows});
    });
});

// get books by id
booksRoute.get('/books/:id', (req, res) => {
    const id = req.params.id;

    db.get(`SELECT * FROM books WHERE id = ?`, [id], (err, row) => {
        if(err) {
            return res.status(400).json({
                message: "Error getting books by id: " + id,
                status: 0
            });
        }
        if(!row) {
            return res.status(400).json({
                message: "No such book with id: " + id,
                status: 0
            });
        }
        res.send({"data": row});
    });
});

// create a new book
booksRoute.post('/books', (req, res) => {
    const {title, author_id, published_date, available_copies} = req.body;

    db.run(`
        INSERT INTO books (title, author_id, published_date, available_copies)
        VALUES (?, ?, ?, ?)`,
        [title, author_id, published_date, available_copies],
        function(err) {
            if(err){
                return res.status(400).json({
                    message: "Error inserting book with author_id: " + author_id,
                    status: 0
                });
            }
            res.status(200).json({
                id: this.lastID,
                message: "Book inserted successfully",
                status: 1
            });
        }
    );

});

// edit book info by book id and author id
booksRoute.patch('/books', (req, res) => {
    const {id, author_id, title, published_date, available_copies} = req.body;
    
    db.get('SELECT COUNT(*) FROM books WHERE id = ? AND author_id = ?', [id, author_id], (err, row) => {
        if(err) {
            return res.status(400).json({
                message: "No book with id: " + id,
                status: 0
            });
        }
        if(row['COUNT(*)'] > 0) {
            db.run(
                'UPDATE books SET title = ?, published_date = ?, available_copies = ? WHERE id = ? AND author_id', 
                [title, published_date, available_copies, id, author_id],
                function(err) {
                    if(err) {
                        return res.status(400).json({
                            message: "error in updating book",
                            status: 0
                        });
                    }
                    res.status(200).json({
                        message: "Book updated successfully",
                        status: 1
                    });
                }
            );
        } else {
            return res.status(404).json({
                message: "book not found or author and book not matched",
                status: 0
            });
        }
    });
});

// delete book with id, with admin password
booksRoute.delete('/books', (req, res) => {
    const {id, passcode} = req.body;

    if(passcode !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({
            message: "Unauthorized to delete book with id: " + id,
            status: 0
        })
    } else {
        db.run(
            `DELETE FROM books WHERE id = ?`,
            [id],
            function(err) {
                if(err) {
                    return res.status(400).json({
                        message: "Error deleting book",
                        status: 0
                    });
                }
                if(this.changes === 0) {
                    return res.status(404).json({ 
                        message: 'User not found',
                        status: 0 
                    });
                }
                res.status(200).json({
                    message: "Book successfully deleted",
                    status: 1
                })
            }
        );
    }
});

module.exports = booksRoute;