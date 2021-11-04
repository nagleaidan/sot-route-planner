/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const comb = require("js-combinatorics");

const pythagoras = (x1, x2, y1, y2) =>
  Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

const islands = JSON.parse(
  fs.readFileSync("./islands.json")
).islands;

const pairs = new comb.Combination(islands, 2).toArray();
const distances = pairs.map(
  (pair) =>
    new Object({
      islands: [pair[0].id, pair[1].id],
      distance: pythagoras(pair[0].x, pair[1].x, pair[0].y, pair[1].y),
    })
);

fs.writeFileSync(
  "./distances.json",
  JSON.stringify({ distances: distances })
);

/*
A "one-liner" version of the above code bc I think it's funny
fs.writeFileSync(
  "./distances.json",
  JSON.stringify({
    distances: new comb.Combination(
      JSON.parse(fs.readFileSync("./islands.json")).islands,
      2
    )
      .toArray()
      .map(
        (pair) =>
          new Object({
            islands: [pair[0].id, pair[1].id],
            distance: Math.sqrt(
              Math.pow(pair[0].x - pair[1].x, 2) +
                Math.pow(pair[0].y - pair[1].y, 2)
            ),
          })
      ),
  })
);
*/
