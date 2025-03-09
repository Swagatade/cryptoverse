const express = require('express');
const getAi = require('./ai');
const app = express();
const cors = require('cors');
app.use(cors());    
const port = process.env.port || 4000;

app.use(express.json());
app.use((req,res,next)=> {
    console.log(req.url);
    next();
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/ai', async (req, res) => {
    console.log(req.body);
    const prompt = req.body;

    const aians = await getAi(JSON.stringify(prompt));
    console.log(aians);
    
res.json({response: aians});
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

