const schedule = require('node-schedule');
const { generateLeaderboard } = require('../functions/generateLeaderboard');



function updateLeaderboardJob() {
    schedule.scheduleJob('0 0 */12 * * *', function () {
        console.log("========")
        console.log("Starting leaderboard updation job...");
        console.log("========")
        generateLeaderboard();
    });
}

module.exports.updateLeaderboardJob = updateLeaderboardJob;