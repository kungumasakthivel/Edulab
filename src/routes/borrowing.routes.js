const express = require('express');
const db = require('../database');

const borrowRoute = express.Router();
require('dotenv').config();

// check book is availabel
borrowRoute.get('/available-books', (req, res) => {

    db.all(
        'SELECT id, title, available_copies FROM books WHERE available_copies > 1',
        (err, rows) => {
            if(err) {
                return res.status(400).json({
                    message: "error getting book",
                    status: 0
                });
            }
            if(!rows) {
                return res.status(400).json({
                    message: "No books",
                    status: 0
                });
            }
            res.json({
                "data": rows
            });
        }
    )
});

// get available books by id
borrowRoute.get('/available-books/:id', (req, res) => {

    const id = req.params.id;

    db.get(
        'SELECT id, title, available_copies FROM books WHERE id = ? AND available_copies > 1',
        [id],
        (err, row) => {
            if(err) {
                return res.status(400).json({
                    message: "error getting book with id: " + id,
                    status: 0
                });
            }
            if(!row) {
                return res.status(400).json({
                    message: "No book available to borrow",
                    status: 0
                });
            }
            res.json({
                "data": row
            });
        }
    )
});

// increase available book copies
borrowRoute.patch('/available-books', (req, res) => {
    const {id, available_copies, passcode} = req.body;

    if(passcode !== process.env.ADMIN_PASSWORD) {
        return res.status(404).json({
            message: "Access denied",
            status: 0
        });
    }

    if(!id || !available_copies) {
        return res.status(400).json({
            message: "Bad request, parameters missing",
            status: 0
        });
    }

    db.get(
        'SELECT COUNT(*) FROM books WHERE id = ?', [id], (err, row) => {
            if(err) {
                return res.status(400).json({
                    message: "No book with id: " + id,
                    status: 0
                });
            }
            if(row['COUNT(*)'] > 0) {
                db.run(
                    'UPDATE books SET available_copies = ? WHERE id = ?',
                    [available_copies, id],
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
                )
            } else {
                return res.status(404).json({
                    message: "author not found",
                    status: 0
                });
            }
        }
    )

})

// borrow book
borrowRoute.patch('/borrow-book', (req, res) => {
    const {id, passcode} = req.body;

    if(passcode !== process.env.ADMIN_PASSWORD) {
        return res.status(404).json({
            message: "Unauthorized access to edit author",
            status: 0
        });
    }

    if(!id) {
        return res.status(400).json({
            message: "Bad request: Invalid input, information are missing [id]",
            status: 0
        });
    }

    db.get(
        'SELECT available_copies FROM books WHERE id = ? AND available_copies > 1',
        [id], (err, row) => {
            if(err) {
                return res.status(400).json({
                    message: "Book not found",
                    status: 0
                });
            }
            console.log(row);
            if(row['available_copies'] > 1) {
                db.run(
                    'UPDATE books SET available_copies = ? WHERE id = ?',
                    [row['available_copies'] - 1, id],
                    function(err) {
                        if(err) {
                            return res.status(400).json({
                                message: "error in borrowing book",
                                status: 0
                            });
                        }
                        res.status(200).json({
                            message: "Borrowed BOok successfully",
                            status: 1
                        });
                    }
                );
            } else {
                return res.status(404).json({
                    message: "book not available",
                    status: 0
                });
            }
        }
    )
});

// return book, increase book count
borrowRoute.patch('/return-book', (req, res) => {
    const {id, passcode} = req.body;
    
    if(passcode !== process.env.ADMIN_PASSWORD) {
        return res.status(404).json({
            message: "Unauthorized access to edit author",
            status: 0
        });
    }

    if(!id) {
        return res.status(400).json({
            message: "Bad request: Invalid input, information are missing [id]",
            status: 0
        });
    }

    db.get(
        'SELECT available_copies FROM books WHERE id = ?',
        [id], (err, row) => {
            if(err) {
                return res.status(400).json({
                    message: "Book not found",
                    status: 0
                });
            }
            console.log(row);
            if(row['available_copies']) {
                db.run(
                    'UPDATE books SET available_copies = ? WHERE id = ?',
                    [row['available_copies'] + 1, id],
                    function(err) {
                        if(err) {
                            return res.status(400).json({
                                message: "error in returning book",
                                status: 0
                            });
                        }
                        res.status(200).json({
                            message: "Book returned successfully",
                            status: 1
                        });
                    }
                );
            } else {
                return res.status(404).json({
                    message: "book not returned",
                    status: 0
                });
            }
        }
    )

});

module.exports = borrowRoute;