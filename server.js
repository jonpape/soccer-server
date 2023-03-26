const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/author/:type', routes.author);
app.get('/random', routes.random);
app.get('/random_teams', routes.random_teams);
app.get('/scorer/:scorer', routes.scorer);
app.get('/team/:team_name', routes.team);
//app.get('/albums', routes.albums);
//app.get('/album_songs/:album_id', routes.album_songs);
app.get('/top_scorer', routes.top_scorer);
app.get('/top_teams', routes.top_teams);
app.get('/winning_percentage', routes.winning_percentage);
app.get('/percentage_year/:team_name', routes.percentage_year);
app.get('/teams_by_year', routes.teams_by_year);
app.get('/teams_by_decade', routes.teams_by_decade);
app.get('/wdi_info', routes.wdi_info);
//app.get('/search_songs', routes.search_songs);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
