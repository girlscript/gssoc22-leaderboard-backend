//starter express file
const express = require('express');
const app = express();
const { generateLeaderboard } = require('./functions/generateLeaderboard');
const { updateLeaderboardJob } = require('./jobs/updateOSLeaderboard');
//const leaderboard = require('./leaderboard.json');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config()

app.use(express.json());
app.use(cors());

generateLeaderboard();
updateLeaderboardJob();

let default_json = { "leaderboard": [], "success": true, "updatedAt": null, "generated": false };
fs.writeFile('leaderboard.json', JSON.stringify(default_json), 'utf8', function (err) {
    if (err) throw err;
    console.log('leaderboard.json was reset');
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get("/OSLeaderboard", (req, res) => {
    fs.readFile('leaderboard.json', 'utf8', function (err, data) {
        if (err) throw err;
        let obj = JSON.parse(data);
        res.send(obj);
    });
});


app.listen(process.env.PORT || 3000, () => {
    console.log('Server started on port 3000');
});
