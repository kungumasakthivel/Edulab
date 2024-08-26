const express = require('express');
const db = require('../database');

const recordRoute = express.Router();
require('dotenv').config();
const audit_log = require('./audit_logs');

// get all borrow records
recordRoute.get('/borrow-records', (req, res) => {
    audit_log('Borrow records', 'fetched all borrow records');
    
    db.all(
        `SELECT * FROM borrow_records ORDER BY id DESC LIMIT 15`, (err, rows) => {
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

// get records by id
recordRoute.get('/borrow-records/:id', (req, res) => {
    const id = req.params.id;
    audit_log('Borrow records', 'fetched all borrow records');
    
    db.all(
        `SELECT * FROM borrow_records WHERE user_id = ? ORDER BY id DESC LIMIT 15`, [id], (err, rows) => {
            if(err) {
                return res.status(400).json({
                    message: "error getting borrow records",
                    status: 0
                });
            }
            if(!rows[0]) {
                return res.status(400).json({
                    message: "No records found",
                    status: 0
                });
            }
            res.json({
                data: rows
            });
        }
    );
});

module.exports = recordRoute;
