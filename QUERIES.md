# Working Queries
## Random
http://34.217.64.79:8080/random/
```
connection.query(`
    SELECT scorer 
    FROM goalscorer 
    ORDER BY RAND() 
    LIMIT 1;`)
```
## Matches for Random Teams
http://34.217.64.79:8080/random_teams/
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
http://34.217.64.79:8080/top_teams
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
http://34.217.64.79:8080/team/[Team] 
(Replace spaces with underscore)
http://34.217.64.79:8080/team/South_Korea

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
http://34.217.64.79:8080/top_scorer
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
http://34.217.64.79:8080/winning_percentage
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
http://34.217.64.79:8080/percentage_year/[Team] 
(Replace spaces with underscore)
http://34.217.64.79:8080/percentage_year?team=South_Korea
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
http://34.217.64.79:8080/teams_by_year?team=South_Korea

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
http://34.217.64.79:8080/teams_by_decade?team=South_Korea

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
    
```
users are given list of CountryName, ,Series_Name and Year as Slider and we are taking this as input to show information
And then compare winrate of the year for that team(country) which asoociated series and winrate is correlated
ex) if GDP estimates high then win rate on that Team is also high?

```
const countryname = req.query.countryname ?? 'United States'; //Drop down list given to User
  const seriesName = req.query.seriesName ?? 'GDP (current US$)'; //Drop down list given to User
  const yearLow = req.query.yearLow ?? 2000; //Slider
  const yearHigh = req.query.yearHigh ?? 2005; //Slider

  connection.query(`
  with country as (
    select distinct home_team as countryname from matches
        union
    select distinct away_team from matches
    )
    , WDIInfo as
    (
    select c.countryname, wd.year, wd.series_name, wd.estimates, ifnull(ws.short_definition, 'No Explanation') indicator_definition
    from country c
    join WDI_Data wd
        on c.countryname = wd.country_name
    join WDI_Series ws
        on ws.indicator_Name = wd.series_name
    where wd.year between ${yearLow} and ${yearHigh}
    and c.countryname = '${countryname}'
    and wd.series_name = '${seriesName}'
    group by wd.country_name, year, wd.series_name
    )
    , WinLossTieInfo AS (
    SELECT
    t.country_name
    ,year(r.date) as year
    ,count(*) as total_played
    ,SUM(CASE
        WHEN r.home_team = t.country_name AND home_score > away_score THEN 1
                WHEN r.away_team = t.country_name AND home_score < away_score THEN 1
                ELSE 0
                END) AS Wins
    ,SUM(CASE
        WHEN r.home_team = t.country_name AND home_score < away_score THEN 1
                WHEN r.away_team = t.country_name AND home_score > away_score THEN 1
                ELSE 0
                END) AS losses
    ,SUM(CASE WHEN home_score = away_score then 1 else 0 end) as Ties
    FROM matches r
    INNER JOIN Country_v2 t
        ON t.country_name = r.home_team OR t.country_name = r.away_team
    where year(r.date) between ${yearLow} and ${yearHigh}
    and country_name = '${seriesName}'
    GROUP BY country_name, year(r.date)
    )
    select wdi.countryname, wdi.year, series_name, estimates, indicator_definition, Wins/total_played as WinRate
    from WDIInfo wdi
    left join WinLossTieInfo wlt
        on wdi.countryname = wlt.country_name
        and wdi.year = wlt.year;
    `
    
    
```
##  To see how many home team goals and away goals scored per Team on that year
```
select year(m.date)
,SUM(CASE WHEN m.home_team = {CountryName} THEN home_score  END) AS home_goals
,SUM(CASE WHEN m.away_team = {CountryName} THEN away_score  END) AS away_goals
from matches m
left join Country_v2 c1 on m.home_team = c1.country_name
left join Country_v2 c2 on m.away_team = c2.country_name
where m.home_team = {CountryName} or m.away_team = {CountryName}
group by year(m.date);


# Example Query
# select year(m.date)
# ,ifnull(SUM(CASE WHEN m.home_team = 'South Korea' THEN home_score  END),0) AS home_goals
# ,ifnull(SUM(CASE WHEN m.away_team = 'South Korea' THEN away_score  END),0) AS away_goals
# from matches m
# left join Country c1 on m.home_team = c1.name
# left join Country c2 on m.away_team = c2.name
# where m.home_team = 'South Korea' or m.away_team = 'South Korea'
# group by year(m.date)

```
##  Calculating game points based on Win: 3points Tie:1poin Loss:0point
```
WITH CTE AS (
    SELECT
    t.name
    ,count(*) as total_played
    ,SUM(CASE
        WHEN r.home_team = t.name AND home_score > away_score THEN 1
                WHEN r.away_team = t.name AND home_score < away_score THEN 1
                ELSE 0
                END) AS Wins
    ,SUM(CASE
        WHEN r.home_team = t.name AND home_score < away_score THEN 1
                WHEN r.away_team = t.name AND home_score > away_score THEN 1
                ELSE 0
                END) AS losses
    ,SUM(CASE WHEN home_score = away_score then 1 else 0 end) as Ties
    FROM matches r
    INNER JOIN Country t
        ON t.name = r.home_team OR t.name = r.away_team
    GROUP BY name
    )
# --calculate points
SELECT *, (3 * Wins + 1 * Ties) as points, Wins/total_played
FROM CTE
order by points desc
