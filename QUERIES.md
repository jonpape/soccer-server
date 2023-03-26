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





```
##  Implements a route that returns the winning rate for a group of countries with specified indicator in the specified year range
```
  const year_low = req.query.year_low ?? 1960;
  const year_high = req.query.year_high ?? 2021;
  const wdi_serie = req.query.serie ?? 'NY.GDP.PCAP.CD';
  const page = req.query.page ?? 1;
  const page_size = req.query.page_size ?? 10;
  

  connection.query(`
    WITH cte AS(
    SELECT  Country.name AS country_name, AVG(estimates) as indicator_value
    FROM WDI_Data wd JOIN Country ON wd.country_code = Country.alpha3
    WHERE
        series_code = ${wdi_serie}
        AND
        (year BETWEEN ${year_low} AND ${year_high})
    GROUP BY country_name
    ),


    cte1 AS (
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
      FROM matches
      WHERE YEAR(date) BETWEEN ${year_low} AND ${year_high}),

    cte3 AS (
      SELECT
        team_name,
        COUNT(*) AS total_matches,
        Year
      FROM
        (SELECT home_team AS team_name, YEAR(date) AS Year 
        FROM matches
        WHERE YEAR(date) BETWEEN ${year_low} AND ${year_high}
        
        UNION ALL
        
        SELECT away_team AS team_name, YEAR(date) AS Year 
        FROM matches
        WHERE YEAR(date) BETWEEN ${year_low} AND ${year_high}) AS subquery

      GROUP BY
        team_name, year
    )
    
    SELECT DISTINCT
      Team,
      indicator_value AS Indicator_Value,
      COUNT(winner) AS Wins,
      SUM(total_matches) AS Total_Games,
      COUNT(winner) / SUM(total_matches) AS Win_Percentage
    FROM cte1 LEFT JOIN cte2
    ON cte1.Team = cte2.winner and cte1.Year = cte2.Year
    JOIN cte3
    ON cte1.Team = cte3.team_name and cte1.Year = cte3.Year
    JOIN cte
    ON cte1.Team = cte.country_name
    GROUP BY Team
    ORDER BY cte.indicator_value DESC, Win_Percentage DESC
    LIMIT ${page_size} OFFSET ${ (page-1) * page_size}; `



```
##  Implements a route that returns the population, population growth rate, GDP, GDP growth rate of a given country, calculated from averages of up to 10 years of latest available data(Country Card) 
```

  const country = req.params.country_name;
  
    connection.query(`
    WITH CTE AS(
    SELECT series_name, series_code, estimates, year
    FROM WDI_Data wd JOIN Country ON wd.country_code = Country.alpha3
    WHERE Country.name = ${country}
    )

    (SELECT 'region' AS info, CONCAT(region, '/', intermediate_region) AS estimates
    FROM Country
    WHERE Country.name = ${country})

    UNION

    (SELECT 'country_code' AS info, Country.alpha3 AS estimates
    FROM Country
    WHERE Country.name = ${country})

    UNION

    (SELECT 'population' AS info, FLOOR(AVG(estimates)) AS estimates
    FROM CTE
    WHERE series_code = 'SP.POP.TOTL'
    ORDER BY year DESC
    LIMIT 10)

    UNION

    (SELECT 'population growth (annual %)' AS info, AVG(estimates) AS estimates
    FROM CTE
    WHERE series_code = 'SP.POP.GROW'
    ORDER BY year DESC
    LIMIT 10)

    UNION

    (SELECT 'GDP per capita(US$)' AS info, FLOOR(AVG(estimates)) AS estimates
    FROM CTE
    WHERE series_code = 'NY.GDP.PCAP.CD'
    ORDER BY year DESC
    LIMIT 10)

    UNION

    (SELECT 'GDP growth (annual %)' AS info, AVG(estimates) AS estimates
    FROM CTE
    WHERE series_code = 'NY.GDP.MKTP.KD.'
    ORDER BY year DESC
    LIMIT 10)
    ;`