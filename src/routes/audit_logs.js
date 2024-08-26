// const express = require('express');
const db = require('../database');

const audit_log = (action, details) => {
    const date = new Date();
    console.log(date.toLocaleDateString());
    const result = db.run(
        `INSERT INTO audit_logs(action, timestamp, details)
        VALUES (?, ?, ?)`, 
        [action, date.toLocaleDateString('en-GB'), details],
        function(err) {
            if(err) return "error in audit creating"
            return "success";
        }
    )
    return result;
}

module.exports = audit_log;
