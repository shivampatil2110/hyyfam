const express = require("express")
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
const auth = require("./routes/auth.route")
const collection = require("./routes/collection.route")
const instagram = require("./routes/instagram.route")
const analytics = require("./routes/analytics.route")
const products = require("./routes/products.route")
const home = require("./routes/home.route")
const fs = require('fs');
require('./logger')

const PORT = process.env.PORT || 6300
const corsOptions = {
    origin: ["http://localhost:3152", "https://grateful-lately-feline.ngrok-free.app"],
    method: ["GET", "POST"],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/assets/images', express.static(path.join('/var/www/hyfam.com/assets/images')));
app.get('/api/assets/videos/:videoName', (req, res) => {
    const videoPath = path.join('/var/www/hyfam.com/assets/videos', req.params.videoName);

    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = end - start + 1;
        const videoStream = fs.createReadStream(videoPath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/x-matroska',
        });

        videoStream.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/x-matroska',
        });

        fs.createReadStream(videoPath).pipe(res);
    }
});
app.use("/api/user/auth", require("./routes/common_functions/authorize"), auth)
app.use("/api/collection", require("./routes/common_functions/authorize"), collection)
app.use("/api/instagram", require("./routes/common_functions/authorize"), instagram)
app.use("/api/analytics", require("./routes/common_functions/authorize"), analytics)
app.use("/api/products", require("./routes/common_functions/authorize"), products)
app.use("/api/home", require("./routes/common_functions/authorize"), home)
app.use("/api/confirmation", auth);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
