const express  = require('express');
const fs = require('fs')
const multer = require('multer');
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


const CHUNKS_DIR = './chunks';
app.post('/upload/chunk', upload.single('file'), (req, res) => {
  const { file, body: { totalChunks, currentChunk } } = req;
  const chunkFilename = `${file.originalname}.${currentChunk}`;
  const chunkPath = `${CHUNKS_DIR}/${chunkFilename}`;
  fs.rename(file.path, chunkPath, (err) => {
    if (err) {
      console.error('Error moving chunk file:', err);
      res.status(500).send('Error uploading chunk');
    } else {
      if (+currentChunk === +totalChunks) {
        // All chunks have been uploaded, assemble them into a single file
        assembleChunks(file.originalname, totalChunks)
          .then(() => res.send('File uploaded successfully'))
          .catch((err) => {
            console.error('Error assembling chunks:', err);
            res.status(500).send('Error assembling chunks');
          });
      } else {
        res.send('Chunk uploaded successfully');
      }
    }
  });
});


async function assembleChunks(filename, totalChunks) {
  const writer = fs.createWriteStream(`./uploads/${filename}`);
  for (let i = 1; i <= totalChunks; i++) {
    const chunkPath = `${CHUNKS_DIR}/${filename}.${i}`;
    await pipeline(pump(fs.createReadStream(chunkPath)), pump(writer));
    fs.unlink(chunkPath, (err) => {
      if (err) {
        console.error('Error deleting chunk file:', err);
      }
    });
  }
}


app.listen(1337, () => {
    console.log("Server started at port 1337")
})