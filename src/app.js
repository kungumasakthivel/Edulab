const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const usersRoute = require('./routes/users.routes');
const booksRoute = require('./routes/books.routes');
const authorsRoute = require('./routes/authors.routes');
const borrowBooks = require('./routes/borrowing.routes');
const recordRoute = require('./routes/records.routes');
const auditRoute = require('./routes/audit.routes')

app.use('/', usersRoute);
app.use('/', booksRoute);
app.use('/', authorsRoute);
app.use('/', borrowBooks);
app.use('/', recordRoute);
app.use('/', auditRoute);

app.get('/test', (req,res) => {
    return res.send("API working");
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}, http://localhost:${PORT}`));
