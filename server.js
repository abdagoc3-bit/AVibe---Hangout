const express = require('express');
const app = express();
const PORT = 3000;

// middleware para mabasa ng server ang JSON data
app.use(express.json());

// 1. GET
app.get('/', (req, res) => {
    res.send('Hello! Active na ang backend ko!');
});

// 2. POST
app.get('/api/greet', (req, res) => {
    res.json({ message: `Hello, ${name}!` });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});