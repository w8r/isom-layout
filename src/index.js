function randomize (nodes, [minX, minY, maxX, maxY]) {
  const { random } = Math;
  const dx = maxX - minX;
  const dy = maxY - minY;

  for (let i = 0, len = nodes.length; i < len; i++) {
    let node = nodes[i];
    node.x = minX + random() * dx;
    node.y = minY + random() * dy;
  }
}


export default function som (data, {
  maxIterations           = 4000,
  adaption                = 0.8,
  radius                  = 3,
  coolingFactor           = 2,
  iterationsPerRadiusStep = 70,
  iterationsPerUpdate     = 10,
  onUpdate                = () => {},
  onEnd                   = () => {},
  map, bounds
}) {

  if (!map) {
    map = data.nodes.reduce((acc, n, i) => {
      acc[n.id] = i;
      return acc;
    }, {});
  }

  if (!bounds) {
    const { min, max } = Math;
    bounds = data.nodes.reduce((acc, node) => {
      const { x, y } = node;

      acc[0] = min(acc[0], x);
      acc[1] = min(acc[1], y);
      acc[2] = max(acc[2], x);
      acc[3] = max(acc[3], y);

      return acc;
    }, [Infinity, Infinity, -Infinity, -Infinity]);
  }

  let t               = 1;
  let minRadius       = 1;
  let currAdaption    = adaption;
  const minAdaption   = 0.15;

  function update (data, map, bounds) {
    let { nodes, edges } = data;
    // Generate random position in graph space
    let tmp = {
      x: bounds[0] + Math.random() * (bounds[2] - bounds[0]),
      y: bounds[1] + Math.random() * (bounds[3] - bounds[1])
    };

    // Get closest vertex to random position
    let winner, dist = Infinity;
    for (let i = 0, len = nodes.length; i < len; i++) {
      let node = nodes[i];
      let dx = tmp.x - node.x;
      let dy = tmp.y - node.y;
      let localSqDist = dx * dx + dy * dy;
      if (localSqDist < dist) {
        dist   = localSqDist;
        winner = node;
      }
    }

    // relax positions
    let queue = [[winner, 1]], visited = {};

    while (queue.length) {
      let [w, dist] = queue.pop();

      let f = currAdaption / Math.pow(2, dist);

      w.x = w.x - f * (w.x - tmp.x);
      w.y = w.y - f * (w.y - tmp.y);

      // enqueue neighbours
      if (dist <= radius) {
        for (let i = 0, len = edges.length; i < len; i++) {
          let edge = edges[i];
          let nb   = (edge.source === w.id) ?
            nodes[map[edge.target]] :
            (edge.target === w.id) ? nodes[map[edge.source]] : null;
          if (nb && !visited[nb.id]) {
            queue.push([nb, dist + 1]);
            visited[nb.id] = true;
          }
        }
      }
    }
  }

  function step () {
    t++;
    update(data, map, bounds);
    const factor = Math.exp(-1 * coolingFactor * (t / maxIterations));
    currAdaption = Math.max(minAdaption, factor * adaption);
    if (currAdaption === minAdaption) {
      console.log('cool down', radius);
      minRadius = 0;
    }
    if (radius > minRadius && t % iterationsPerRadiusStep === 0) radius--;
  }

  randomize(data, bounds);
  let iter = 0;
  let timer = setInterval(() => {
    while (t < maxIterations) {
      step();
      if (t % iterationsPerUpdate === 0) {
        onUpdate();
        break;
      }
    }
    if (t >= maxIterations) {
      clearInterval(timer);
      onUpdate();
      onEnd();
    }
  }, 10)
  //while (!done() && iter < 1000) step();
}

som.randomize = randomize;
