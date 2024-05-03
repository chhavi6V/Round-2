const express  = require('express');
const app = express();

const multer = require('multer');

const diskStorage = multer.diskStorage({ destination: 'uploads'} );

const upload = multer({ storage: diskStorage });

app.post('/upload-file', upload.single('file'), (req, res) => { 
    console.log(req.file);
    res.send("Succesfully uploaded")
});

app.listen(8080, () => {
    console.log("Server started at port 8080")
})