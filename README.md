# cis5500-project-server

I'm going to apologize ahead of time because I have not yet updated the comments in the files.

Below is the routes I have been working on and they are connected to the AWS RDS.

Since there is not scorer_id or team_id, I plan on adding a '\_' to the names where there are spaces and removing the '\_' prior to making the query. 
Example: 'South Korea' would be http://localhost:8080/team/South_Korea

It might be better if the names / teams are an encoded URL format.

Other queries I would like to develop:
- Scorer: /scorer/[Scorer]
- Opponents for a team by number of matches: /opponents/[Team]
- Top team by points for each year (win: 3, tie: 1, lose: 0): /years/  << cool to graph
- Top team by points for each decade (win: 3, tie: 1, lose: 0): /decade/ << cool to graph
- Number of countries per year and a list of all countries that year: /countries/

There is more ideas in the [inspiration](https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017?) section of the dataset.

