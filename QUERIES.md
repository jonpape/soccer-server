There are four routes working right now:

## Random
http://localhost:8080/random/
```
connection.query(`
    SELECT scorer 
    FROM goalscorer 
    ORDER BY RAND() 
    LIMIT 1;`)
```
## Matches for Random Teams
http://localhost:8080/random_teams/
```
connection.query(`
  WITH cte AS (SELECT away_team as team1, home_team as team2
    FROM matches
    ORDER BY RAND()
    LIMIT 1)
  SELECT Away_team, Home_team, Away_score, Home_score, date AS Date
  FROM matches JOIN cte ON cte.team1 = matches.away_team
  WHERE (Away_team = team1 AND Home_team = team2) OR (Away_team = team2 AND Home_team = team1)
    UNION
  SELECT Away_team, Home_team, Away_score, Home_score, date AS Date
  FROM matches JOIN cte ON cte.team1 = matches.home_team
  WHERE (Away_team = team1 AND Home_team = team2) OR (Away_team = team2 AND Home_team = team1)
    ORDER By date;`)
  ```


## Top teams by wins
http://localhost:8080/top_teams
```
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
  ORDER BY Wins DESC LIMIT 10;`)
```
## All matches for a team (limit 100)
http://localhost:8080/team/[Team] 
(Replace spaces with underscore)
http://localhost:8080/team/South_Korea

```
const teamName = req.params.team_name;
  const formattedText = teamName ? teamName.replace(/_/g, ' ') : '';
  connection.query(`
  SELECT *
  FROM matches
  WHERE away_team = '${formattedText}'
  OR home_team = '${formattedText}'
  LIMIT 100;)
```
## Top scorer
http://localhost:8080/top_scorer
```
connection.query(`
      SELECT scorer, 
      COUNT(scorer) AS goals 
      FROM goalscorer 
      GROUP BY scorer 
      ORDER BY goals 
      DESC limit ${pageSize};`)
```
## Win percentage per team
http://localhost:8080/winning_percentage
```
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
  ORDER BY Total_Games DESC LIMIT 10;)
```
## Win percentage per team for a given year
http://localhost:8080/percentage_year/[Team] 
(Replace spaces with underscore)
http://localhost:8080/percentage_year/South_Korea
```
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
    LIMIT 100;)
  ```

## Teams by year
http://localhost:8080/teams_by_year

```
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
  LIMIT 100;)
```

## Teams by decade
http://localhost:8080/teams_by_decade

```
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
  LIMIT 100;)
```

## Implements a route that given a team_id, returns the team player's name, nationality that have higher than the average player rating, ordered by rating
```
  const teamName = req.params.team_name;
  const formattedText = teamName ? teamName.replace(/_/g, ' ') : '';
    connection.query(`
    SELECT full_name AS name, overall_rating AS rating, height_cm AS height, weight_kgs AS weight
    FROM players
    INNER JOIN team ON players.national_team = team.team_name
    WHERE national_team = '${formattedText}' AND overall_rating > (SELECT AVG(overall_rating) FROM players)
    ORDER BY overall_rating
    LIMIT 100;`
```
## Implements a route that returns the top scorer by player name, nationality, overall_rating, position, and count
```
SELECT full_name, nationality, overall_rating, positions, COUNT(full_name) AS num_goals
  FROM players
  INNER JOIN goalscorer ON goalscorer.scorer = players.full_name
  GROUP BY full_name
 ORDER BY num_goals desc


