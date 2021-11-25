/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const pythagoras = (x1, x2, y1, y2) =>
  Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

const islands = JSON.parse(fs.readFileSync('./data/islands.json')).islands;

const distances = [];

for (let i = 0; i < islands.length - 1; i++) {
  const temp = { a: islands[i].id, islands: [] };
  for (let j = i; j < islands.length; j++) {
    if (i === j) continue;
    temp.islands.push({
      b: islands[j].id,
      distance: pythagoras(
        islands[i].x,
        islands[j].x,
        islands[i].y,
        islands[j].y
      ),
    });
  }
  distances.push(temp);
}

fs.writeFileSync(
  './data/distances.json',
  JSON.stringify({ distances: distances })
);
