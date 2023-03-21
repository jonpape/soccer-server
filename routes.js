const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

/******************
 * WARM UP ROUTES *
 ******************/

// Route 1: GET /author/:type
const author = async function(req, res) {
  // TODO (TASK 1): replace the values of name and pennKey with your own
  const name = 'Jon Pape';
  const pennKey = 'jonpape';

  // checks the value of type the request parameters
  // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
  if (req.params.type === 'name') {
    // res.send returns data back to the requester via an HTTP response
    res.send(`Created by ${name}`);
  } else if (null) {
    // TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back response 'Created by [pennkey]'
  } else {
    // we can also send back an HTTP status code to indicate an improper request
    res.status(400).send(`'${req.params.type}' is not a valid author type. Valid types are 'name' and 'pennkey'.`);
  }
}

// Route 2: GET /random
const random = async function(req, res) {
  // Return a random scorer from the database
  connection.query(`
    SELECT scorer 
    FROM goalscorer 
    ORDER BY RAND() 
    LIMIT 1;
  `, (err, data) => {
    if (err || data.length === 0) {
      // if there is an error for some reason, or if the query is empty (this should not be possible)
      // print the error message and return an empty object instead
      console.log(err);
      res.json({});
    } else {
      // Here, we return results of the query as an object, keeping only relevant data
      res.json({
        //soccer name: data[0].soccer_name,
        scorer: data[0].scorer,
      });
    }
  });
}

// Route 3: GET /random_teams
const random_teams = async function(req, res) {
  // Return a series of matches by random teams from the database
  connection.query(`
  WITH cte AS (SELECT away_team as team1, home_team as team2
    FROM matches
    ORDER BY RAND()
    LIMIT 1)
  SELECT Away_team, Home_team, Away_score, Home_score, Date
  FROM matches JOIN cte ON cte.team1 = matches.away_team
  WHERE (Away_team = team1 AND Home_team = team2) OR (Away_team = team2 AND Home_team = team1)
    UNION
  SELECT Away_team, Home_team, Away_score, Home_score, Date
  FROM matches JOIN cte ON cte.team1 = matches.home_team
  WHERE (Away_team = team1 AND Home_team = team2) OR (Away_team = team2 AND Home_team = team1)
    ORDER By date;
  `, (err, data) => {
    if (err || data.length === 0) {
      // if there is an error for some reason, or if the query is empty (this should not be possible)
      // print the error message and return an empty object instead
      console.log(err);
      res.json({});
    } else {
      // Here, we return results of the query as an object, keeping only relevant data
      res.json(data);
    }
  });
}

/********************************
 * BASIC Scorer/Game INFO ROUTES *
 ********************************/

// Route 3: GET /player/:scorer
const scorer = async function(req, res) {
  // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
  // Most of the code is already written for you, you just need to fill in the query
  connection.query(`
  SELECT scorer FROM goalscorer ORDER BY RAND() LIMIT 1;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 4: GET /team/:team_name
const team = async function(req, res) {
  // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
  const teamName = req.params.team_name;
  const formattedText = teamName ? teamName.replace(/_/g, ' ') : '';
  connection.query(`
  SELECT *
  FROM matches
  WHERE away_team = '${formattedText}'
  OR home_team = '${formattedText}'
  LIMIT 100; 
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 5: GET /albums
const albums = async function(req, res) {
  // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
  // Note that in this case you will need to return multiple albums, so you will need to return an array of objects
  res.json([]); // replace this with your implementation
}

// Route 6: GET /album_songs/:album_id
const album_songs = async function(req, res) {
  // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
  res.json([]); // replace this with your implementation
}

/************************
 * ADVANCED INFO ROUTES *
 ************************/

// Route 7: GET /top_scorer
const top_scorer = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
    connection.query(`
    SELECT scorer, COUNT(scorer) AS goals FROM goalscorer GROUP BY scorer ORDER BY goals DESC limit ${pageSize};
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  } else {
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
    connection.query(`
    SELECT scorer, COUNT(scorer) AS goals FROM goalscorer GROUP BY scorer ORDER BY goals DESC limit ${pageSize} offset ${page} * ${pageSize} - ${pageSize};
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
  }
}

// Route 8: GET /top_teams
const top_teams = async function(req, res) {
  // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
  // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
  connection.query(`
  WITH cte1 AS (
    SELECT DISTINCT home_team AS Team FROM matches
    UNION
    SELECT DISTINCT away_team AS Team FROM matches),
  cte2 AS (
     SELECT
      CASE
        WHEN home_score > away_score THEN home_team
        WHEN home_score < away_score THEN away_team
        ELSE 'Tie'
      END AS winner
    FROM matches)
SELECT DISTINCT Team,
                COUNT(winner) AS Wins
FROM cte1 LEFT JOIN cte2
ON cte1.Team = cte2.winner
GROUP BY Team
ORDER BY Wins DESC LIMIT 10;
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
}

// Route 9: GET /winning_percentage
const winning_percentage = async function(req, res) {
  // Win Percentage = (Number of wins) / (Number of games played)
  connection.query(`
  WITH cte1 AS (
    SELECT DISTINCT home_team AS Team FROM matches
    UNION
    SELECT DISTINCT away_team AS Team FROM matches),
  cte2 AS (
     SELECT
      CASE
        WHEN home_score > away_score THEN home_team
        WHEN home_score < away_score THEN away_team
        ELSE 'Tie'
      END AS winner
    FROM matches),
  cte3 AS (
  SELECT
        team_name,
        COUNT(*) AS total_matches
    FROM
        (SELECT home_team AS team_name FROM matches
         UNION ALL
         SELECT away_team AS team_name FROM matches) AS subquery
    GROUP BY
        team_name
  )
  SELECT DISTINCT Team,
                  COUNT(winner) AS Wins,
                  total_matches AS Total_Games,
                  COUNT(winner) / total_matches AS Win_Percentage
  FROM cte1 LEFT JOIN cte2
  ON cte1.Team = cte2.winner
  JOIN cte3
  ON cte1.Team = cte3.team_name
  GROUP BY Team
  ORDER BY Total_Games DESC LIMIT 10;
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
}

// Route 10: GET /percentage_year/:team_name
const percentage_year = async function(req, res) {
  // Win Percentage = (Number of wins) / (Number of games played)
  const teamName = req.params.team_name;
  console.log(teamName)
  const formattedText = teamName ? teamName.replace(/_/g, ' ') : '';

  connection.query(`
  WITH cte1 AS (
      SELECT DISTINCT home_team AS Team, YEAR(date) AS Year FROM matches
      UNION
      SELECT DISTINCT away_team AS Team, YEAR(date) AS Year FROM matches),
    cte2 AS (
      SELECT YEAR(date) as Year,
        CASE
          WHEN home_score > away_score THEN home_team
          WHEN home_score < away_score THEN away_team
          ELSE 'Tie'
        END AS winner
      FROM matches),
    cte3 AS (
    SELECT
          team_name,
          COUNT(*) AS total_matches,
          Year
      FROM
          (SELECT home_team AS team_name, YEAR(date) AS Year FROM matches
          UNION ALL
          SELECT away_team AS team_name, YEAR(date) AS Year FROM matches) AS subquery
      GROUP BY
          team_name, year
  )
  SELECT DISTINCT cte3.Year,
                  Team,
                  COUNT(winner) AS Wins,
                  total_matches AS Total_Games,
                  COUNT(winner) / total_matches AS Win_Percentage
  FROM cte1 LEFT JOIN cte2
  ON cte1.Team = cte2.winner and cte1.Year = cte2.Year
  JOIN cte3
  ON cte1.Team = cte3.team_name and cte1.Year = cte3.Year
  WHERE Team = '${formattedText}'
  GROUP BY Year, Team
  ORDER BY Year ASC, Win_Percentage DESC
  LIMIT 100;
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
}

// Route 11: GET /teams_by_year
const teams_by_year = async function(req, res) {
  // Win Percentage = (Number of wins) / (Number of games played)
  connection.query(`
  WITH cte1 AS (
      SELECT DISTINCT home_team AS Team, YEAR(date) AS Year FROM matches
      UNION
      SELECT DISTINCT away_team AS Team, YEAR(date) AS Year FROM matches),
    cte2 AS (
      SELECT YEAR(date) as Year,
        CASE
          WHEN home_score > away_score THEN home_team
          WHEN home_score < away_score THEN away_team
          ELSE 'Tie'
        END AS winner
      FROM matches),
    cte3 AS (
    SELECT
          team_name,
          COUNT(*) AS total_matches,
          Year
      FROM
          (SELECT home_team AS team_name, YEAR(date) AS Year FROM matches
          UNION ALL
          SELECT away_team AS team_name, YEAR(date) AS Year FROM matches) AS subquery
      GROUP BY
          team_name, year
  )
  SELECT DISTINCT cte3.Year,
                  Team,
                  COUNT(winner) AS Wins,
                  total_matches AS Total_Games,
                  COUNT(winner) / total_matches AS Win_Percentage
  FROM cte1 LEFT JOIN cte2
  ON cte1.Team = cte2.winner and cte1.Year = cte2.Year
  JOIN cte3
  ON cte1.Team = cte3.team_name and cte1.Year = cte3.Year
  GROUP BY Year, Team
  ORDER BY Year ASC, Win_Percentage DESC
  LIMIT 100;
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
}

// Route 12: GET /teams_by_decade
const teams_by_decade = async function(req, res) {
  // Win Percentage = (Number of wins) / (Number of games played)
  connection.query(`
  WITH cte1 AS (
    SELECT DISTINCT home_team AS Team,
                    CONCAT(FLOOR(YEAR(date) / 10) * 10, '-', FLOOR(YEAR(date) / 10) * 10 + 9) AS Decade
    FROM matches
    UNION
    SELECT DISTINCT away_team AS Team,
                    CONCAT(FLOOR(YEAR(date) / 10) * 10, '-', FLOOR(YEAR(date) / 10) * 10 + 9) AS Decade
    FROM matches),
  cte2 AS (
     SELECT CONCAT(FLOOR(YEAR(date) / 10) * 10, '-', FLOOR(YEAR(date) / 10) * 10 + 9) AS Decade,
      CASE
        WHEN home_score > away_score THEN home_team
        WHEN home_score < away_score THEN away_team
        ELSE 'Tie'
      END AS winner
    FROM matches),
  cte3 AS (
  SELECT
        team_name,
        COUNT(*) AS total_matches,
        Decade
    FROM
        (SELECT home_team AS team_name,
                CONCAT(FLOOR(YEAR(date) / 10) * 10, '-', FLOOR(YEAR(date) / 10) * 10 + 9) AS Decade FROM matches
         UNION ALL
         SELECT away_team AS team_name,
                CONCAT(FLOOR(YEAR(date) / 10) * 10, '-', FLOOR(YEAR(date) / 10) * 10 + 9) AS Decade FROM matches) AS subquery
    GROUP BY
        team_name, Decade
  )
  SELECT DISTINCT cte3.Decade,
                  Team,
                  COUNT(winner) AS Wins,
                  total_matches AS Total_Games,
                  COUNT(winner) / total_matches AS Win_Percentage
  FROM cte1 LEFT JOIN cte2
  ON cte1.Team = cte2.winner and cte1.Decade = cte2.Decade
  JOIN cte3
  ON cte1.Team = cte3.team_name and cte1.Decade = cte3.Decade
  #WHERE Team = 'England'
  GROUP BY Decade, Team
  ORDER BY Decade ASC, Win_Percentage DESC
  LIMIT 100;
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    });
}

// Route 9: GET /search_albums
const search_songs = async function(req, res) {
  // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
  // Some default parameters have been provided for you, but you will need to fill in the rest
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;

  res.json([]); // replace this with your implementation
}

module.exports = {
  author,
  random,
  random_teams,
  scorer,
  team,
  albums,
  album_songs,
  top_scorer,
  top_teams,
  winning_percentage,
  percentage_year, // by team
  teams_by_year, // all teams
  teams_by_decade, // all teams
  search_songs,
}
