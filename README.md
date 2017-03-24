# Self-Organizing maps layout - SOM [![npm version](https://badge.fury.io/js/isom-layout.svg)](https://badge.fury.io/js/isom-layout)

![Thumb](https://w8r.github.io/isom-layout/demo/thumbnail.png)

After [Self-Organizing Graphs: A Neural Network Perspective of Graph Layout](https://pdfs.semanticscholar.org/a0e4/2f00c86df822d2caa0796b2b04d63c6ec96b.pdf) by Bernd Meyer.

## Usage

```
npm install `isom-layout`;
```

```js
import som from 'isom-layout';

const graph = {
  nodes: [
    { id: 0, data: ...},
    { id: 1, data: ...},
    ...
  ],
  edges: [
    { source: 0, target: 1, data: ...},
    ...
  ]
};

// if your nodes have no initial positions
som.randomize(graph, bounds);

// modifies coord in-place
som(graph, {
  // other options, see below
  bounds: bounds,  // [xmin, ymin, xmax, ymax],
  onUpdate: () => {
    // do your rendering here
  },
  onEnd: () => {
    // converged
  }
});
```

## Options

To understand the options you need to know a bit about how algorithm works.
Basically, it

  1. picks random points in the graph space
  2. finds the closest node to this random location
  3. using kind of BFS it continiously pulls the nodes and its neighbours in the direction of the random point.
  4. while sweeps are repeated, cooling effect takes place, reducing the pulling force
  5. also the radius gets gradually reduced so that during the last stage smaller areas of graph are getting changed

`som(graph, options)`

* **`maxIterations`** Maximum algorithm sweeps. default `2000`
* **`adaption`** Initial force value. default `0.8`
* **`radius`** Maximum graph-theoretical distance of the nodes involved in one sweep. default `3`
* **`coolingFactor`** Cooling speed, see the cooling equation, default `2`
* **`iterationsPerRadiusStep`** How fast the radius is decreased. default `70`
* **`iterationsPerUpdate`** How many iterations to perform between the "ticks", default `10` - for demo purposes. For the default params it means that the algorithm will re-render every 10ms, 200 renders in total
* **`updateDelay`** Delay between the update groups. default `0`
* **`onUpdate`** Update callback. Put your rendering here
* **`onEnd`** Complete callback
* **`bounds`** Coordinate space boundaries. `[xmin,ymin,xmax,ymax]`. If not provided, algorithm will attempt to calculate them from the current nodes positions. So either `bounds` or initial coordinates have to be provided
* **`dontRandomize`** Don't re-shuffle the node positions. default `false`

## Notes

My impression - useless. The only thing it shows more or less is the nodes with
highest degrees. Maybe it can be good on simple chains. You can endlessly tweak
the parametres, but it doesn't give you a nice comprehensible layout. So this a
mere exercise in understanding the parameters and nature of the algorithms like
this one.

Also funny observation: it works as if an impatient person was untangling a
threadball by randomly pulling the outstanding knots and strings.

## License

MIT
