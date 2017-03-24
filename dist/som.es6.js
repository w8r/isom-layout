function randomize (nodes, ref) {
  var minX = ref[0];
  var minY = ref[1];
  var maxX = ref[2];
  var maxY = ref[3];

  var random = Math.random;
  var dx = maxX - minX;
  var dy = maxY - minY;

  for (var i = 0, len = nodes.length; i < len; i++) {
    var node = nodes[i];
    node.x = minX + random() * dx;
    node.y = minY + random() * dy;
  }
}


function som (data, ref) {
  var maxIterations = ref.maxIterations; if ( maxIterations === void 0 ) maxIterations = 4000;
  var adaption = ref.adaption; if ( adaption === void 0 ) adaption = 0.8;
  var radius = ref.radius; if ( radius === void 0 ) radius = 3;
  var coolingFactor = ref.coolingFactor; if ( coolingFactor === void 0 ) coolingFactor = 2;
  var iterationsPerRadiusStep = ref.iterationsPerRadiusStep; if ( iterationsPerRadiusStep === void 0 ) iterationsPerRadiusStep = 70;
  var iterationsPerUpdate = ref.iterationsPerUpdate; if ( iterationsPerUpdate === void 0 ) iterationsPerUpdate = 100;
  var onUpdate = ref.onUpdate; if ( onUpdate === void 0 ) onUpdate = function () {};
  var onEnd = ref.onEnd; if ( onEnd === void 0 ) onEnd = function () {};
  var updateDelay = ref.updateDelay; if ( updateDelay === void 0 ) updateDelay = 0;
  var map = ref.map;
  var bounds = ref.bounds;
  var dontRandomize = ref.dontRandomize;


  if (!map) {
    map = data.nodes.reduce(function (acc, n, i) {
      acc[n.id] = i;
      return acc;
    }, {});
  }

  if (!bounds) {
    var min = Math.min;
    var max = Math.max;
    bounds = data.nodes.reduce(function (acc, node) {
      var x = node.x;
      var y = node.y;

      acc[0] = min(acc[0], x);
      acc[1] = min(acc[1], y);
      acc[2] = max(acc[2], x);
      acc[3] = max(acc[3], y);

      return acc;
    }, [Infinity, Infinity, -Infinity, -Infinity]);
  }

  var t               = 1;
  var minRadius       = 1;
  var currAdaption    = adaption;
  var minAdaption   = 0.15;

  function update (data, map, bounds) {
    var nodes = data.nodes;
    var edges = data.edges;
    // Generate random position in graph space
    var tmp = {
      x: bounds[0] + Math.random() * (bounds[2] - bounds[0]),
      y: bounds[1] + Math.random() * (bounds[3] - bounds[1])
    };

    // Get closest vertex to random position
    var winner;
    var dist = Infinity;
    for (var i = 0, len = nodes.length; i < len; i++) {
      var node = nodes[i];
      var dx = tmp.x - node.x;
      var dy = tmp.y - node.y;
      var localSqDist = dx * dx + dy * dy;
      if (localSqDist < dist) {
        dist   = localSqDist;
        winner = node;
      }
    }

    // relax positions
    var queue = [[winner, 1]];
    var visited = {};

    while (queue.length) {
      var ref = queue.pop();
      var w = ref[0];
      var dist$1 = ref[1];

      var f = currAdaption / Math.pow(2, dist$1);

      w.x = w.x - f * (w.x - tmp.x);
      w.y = w.y - f * (w.y - tmp.y);

      // enqueue neighbours
      if (dist$1 <= radius) {
        for (var i$1 = 0, len$1 = edges.length; i$1 < len$1; i$1++) {
          var edge = edges[i$1];
          var nb     = null;
          if      (edge.source === w.id) { nb = nodes[map[edge.target]]; }
          else if (edge.target === w.id) { nb = nodes[map[edge.source]]; }
          if (nb && !visited[nb.id]) {
            queue.push([nb, dist$1 + 1]);
            visited[nb.id] = true;
          }
        }
      }
    }
  }

  function step () {
    t++;
    update(data, map, bounds);
    var factor = Math.exp(-1 * coolingFactor * (t / maxIterations));
    currAdaption = Math.max(minAdaption, factor * adaption);
    if (currAdaption === minAdaption) { // last step of cool down
      minRadius = 0;
    }
    if (radius > minRadius && t % iterationsPerRadiusStep === 0) { radius--; }
  }

  if (!dontRandomize) { randomize(data, bounds); }

  var timer = setInterval(function () {
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
  }, updateDelay);
}

som.randomize = randomize;

export default som;
//# sourceMappingURL=som.es6.js.map
