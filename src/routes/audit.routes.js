const express = require('express');
const db = require('../database');

const auditRoute = express.Router();
require('dotenv').config();

// get all audits
auditRoute.get('/audit-logs', (req, res) => {
    const {passcode} = req.body;

    if(passcode !== process.env.ADMIN_PASSWORD) {
        return res.status(404).json({
            message: 'Unauthorized access',
            stauts: 0
        });
    }
    
    db.all(
        `SELECT * FROM audit_logs ORDER BY id DESC LIMIT 5`, (err, rows) => {
            if(err) {
                return res.status(400).json({
                    message: "Error getting audit",
                    status: 0
                });
            }
            res.json({
                data: rows
            });
        }
    )
})

module.exports = auditRoute;
