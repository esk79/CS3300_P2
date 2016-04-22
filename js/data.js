/**
 * Created by EvanKing on 4/21/16.
 */
queue()
    .defer(d3.csv, "data/data.csv")
    .await(ready);

var countryStats;
function ready(error, data) {
    if (error)   //If error is not null, something went wrong.
        console.log(error) //Log the error.

// console.log(data);
    countryStats = data;
    console.log(countryStats);
}

console.log("outside" + countryStats)