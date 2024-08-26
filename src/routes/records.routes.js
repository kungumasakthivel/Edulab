const express = require('express');
const db = require('../database');

const recordRoute = express.Router();
require('dotenv').config();

// get all borrow records
recordRoute.get('/borrow-records', (req, res) => {
    db.all(
        `SELECT * FROM borrow_records`, (err, rows) => {
            if(err) {
                return res.status(400).json({
                    message: "error getting borrow records",
                    status: 0
                })
            }
            res.json({
                data: rows
            });
        }
    );
});

module.exports = recordRoute;
