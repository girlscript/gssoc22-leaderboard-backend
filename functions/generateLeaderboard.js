var fs = require("fs");
var axios = require('axios');
const { type } = require("os");
require('dotenv').config()

const timer = ms => new Promise(res => setTimeout(res, ms))
let leaderboard = {};

async function generateLeaderboard() {
    let projects = await axios.get(`https://opensheet.elk.sh/1OC5gOWCpUrDXI8HAPEM9iOohoznBfAVF9d-rSMO7FXM/Project2022`)
    leaderboard = {};
    projects = projects.data;
    let identifyingLabel = "GSSoC22";
    let labels = [{
        label: "Level0",
        points: 5
    }, {
        label: "Level1",
        points: 15
    }, {
        label: "Level2",
        points: 25
    }, {
        label: "Level3",
        points: 45
    }]
    for (let m = 0; m < projects.length; m++) {
        projects[m].project_link = projects[m].project_link.split("/")[3] + "/" + projects[m].project_link.split("/")[4]
        //console.log(projects[m].project_link);
        //console.log(`https://api.github.com/search/issues?q=repo:${projects[m].project_link}+is:pr+label:${identifyingLabel}+is:merged&per_page=100`);
        await axios.get(`https://api.github.com/search/issues?q=repo:${projects[m].project_link}+is:pr+label:${identifyingLabel}+is:merged&per_page=100`, {
            headers: {
                Authorization: 'token ' + process.env.GIT_KEY
            }
        }).then(async function (response) {
            if (response.data.items && response.data.items.length > 0) {
                let prs = response.data.items;
                //console.log(prs);
                for (let i = 0; i < prs.length; i++) {
                    for (let j = 0; j < prs[i].labels.length; j++) {
                        if (!leaderboard[prs[i].user.id]) {
                            leaderboard[prs[i].user.id] = {
                                avatar_url: prs[i].user.avatar_url,
                                login: prs[i].user.login,
                                url: prs[i].user.html_url,
                                score: 0,
                                pr_urls: [],
                            }
                            //convert labels to keys

                        }
                        if (leaderboard[prs[i].user.id].pr_urls.indexOf(prs[i].html_url) == -1) {
                            leaderboard[prs[i].user.id].pr_urls.push(prs[i].html_url);
                        }
                        let obj = labels.find(o => o.label === prs[i].labels[j].name);
                        if (obj) {
                            leaderboard[prs[i].user.id].score += obj.points;
                        }

                    }
                }
                if (response.data.total_count > 100) {
                    //calculate number of pages
                    let pages = Math.ceil(response.data.total_count / 100);
                    console.log("========")
                    console.log("No. of pages: " + pages);
                    console.log(`https://api.github.com/search/issues?q=repo:${projects[m].project_link}+is:pr+label:${identifyingLabel}+is:merged`);
                    console.log("========")
                    for (let i = 2; i <= pages; i++) {
                        console.log("Page: " + i);
                        let paginated = await axios.get(`https://api.github.com/search/issues?q=repo:${projects[m].project_link}+is:pr+label:${identifyingLabel}+is:merged&per_page=100&page=${i}`, {
                            headers: {
                                Authorization: 'token ' + process.env.GIT_KEY
                            }
                        }).then(async function (response) {
                            console.log("*****" + response.data.items.length);
                            if (response.data.items && response.data.items.length > 0) {
                                let prs = response.data.items
                                for (let i = 0; i < prs.length; i++) {
                                    for (let j = 0; j < prs[i].labels.length; j++) {
                                        if (!leaderboard[prs[i].user.id]) {
                                            leaderboard[prs[i].user.id] = {
                                                avatar_url: prs[i].user.avatar_url,
                                                login: prs[i].user.login,
                                                url: prs[i].user.html_url,
                                                score: 0,
                                                pr_urls: [],
                                            }
                                        }
                                        if (leaderboard[prs[i].user.id].pr_urls.indexOf(prs[i].html_url) == -1) {
                                            leaderboard[prs[i].user.id].pr_urls.push(prs[i].html_url);
                                        }
                                        let obj = labels.find(o => o.label === prs[i].labels[j].name);
                                        if (obj) {
                                            leaderboard[prs[i].user.id].score += obj.points;
                                        }

                                    }
                                }
                            }
                            console.log("Completed page: " + (i + 1));

                        })
                        await timer(7000);
                    }
                }

            }
        }).catch(function (err) {
            // console.log(err);
        }
        )
        console.log("Completed " + (m + 1) + " of " + projects.length);
        await timer(7000);
    }
    // wait for all the prs to be fetched
    console.log("Leaderboard generated");
    //sort the leaderboard by score
    let leaderboardArray = Object.keys(leaderboard).map(key => leaderboard[key]);
    leaderboardArray.sort((a, b) => b.score - a.score);
    let json = {
        leaderboard: leaderboardArray,
        success: true,
        updatedAt: +new Date(),
        generated: true,
        updatedTimestring: new Date().toLocaleString()
    }
    fs.truncate('leaderboard.json', 0, function () { console.log('done') })
    fs.writeFile('leaderboard.json', JSON.stringify(json), 'utf8', function (err) {
        if (err) throw err;
        console.log('leaderboard.json was updated');
    });
}

module.exports.generateLeaderboard = generateLeaderboard;
