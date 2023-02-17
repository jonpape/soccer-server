# cis5500-project-server

I'm going to apologize ahead of time because I have not yet updated the comments in the files.

Below is the routes I have been working on and they are connected to the AWS RDS.

Since there is not scorer_id or team_id, I plan on adding a '\_' to the names where there are spaces and removing the '\_' prior to making the query. 
Example: 'South Korea' would be http://localhost:8080/team/South_Korea

It might be better if the names / teams are an encoded URL format.

There are four routes working right now:

### Random
http://localhost:8080/random/

connection.query(`
    SELECT scorer 
    FROM goalscorer 
    ORDER BY RAND() 
    LIMIT 1;`

### Top teams by wins
http://localhost:8080/top_teams

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
  ORDER BY Wins DESC LIMIT 10;`

### All matches for a team (limit 100)
http://localhost:8080/team/[Team] 
(Replace spaces with underscore)

const teamName = req.params.team_name;
  const formattedText = teamName ? teamName.replace(/_/g, ' ') : '';
  connection.query(`
  SELECT *
  FROM matches
  WHERE away_team = '${formattedText}'
  OR home_team = '${formattedText}'
  LIMIT 100;`

### Top scorer
http://localhost:8080/top_scorer

connection.query(`
      SELECT scorer, 
      COUNT(scorer) AS goals 
      FROM goalscorer 
      GROUP BY scorer 
      ORDER BY goals 
      DESC limit ${pageSize};`



