var h = document.documentElement.clientHeight;
var w = document.documentElement.clientWidth;
var canvas = document.querySelector('canvas');
var ctx    = canvas.getContext('2d');

var pxRatio = window.devicePixelRatio;

var W = w * pxRatio;
var H = h * pxRatio;

canvas.width        = W;
canvas.height       = H;
canvas.style.width  = w + 'px';
canvas.style.height = h + 'px';

ctx.translate(W / 2, H / 2);

var N     = data.nodes.length;
var idMap = data.nodes.reduce(function (acc, node, i) {
  acc[node.id] = i;
  return acc;
}, {});
var Rmax = 5 * pxRatio;
var bounds = [-W / 2 + Rmax, -H / 2 + Rmax, W / 2 - Rmax, H / 2 - Rmax];

// gonna be randomized anyway, that's just for the demo
som.randomize(data.nodes, bounds);
render();


function render() {
  var nodes = data.nodes;
  var edges = data.edges;

  ctx.clearRect(-W/2, -H/2, W, H);

  ctx.beginPath();
  edges.forEach(function (e) { drawLink(e, ctx, idMap); });
  ctx.strokeStyle = '#aaa';
  ctx.stroke();

  ctx.beginPath();
  nodes.forEach(function (n) { drawNode(n, ctx); });
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.stroke();
}

function drawLink(d, ctx, idMap) {
  var source = data.nodes[idMap[d.source]];
  var target = data.nodes[idMap[d.target]];
  ctx.moveTo(source.x, source.y);
  ctx.lineTo(target.x, target.y);
}

function drawNode(d, ctx) {
  var r = d.size || Rmax;
  ctx.moveTo(d.x + r, d.y);
  ctx.arc(d.x, d.y, r, 0, 2 * Math.PI);
}


function circle (p, r, color, filled) {
  ctx.moveTo(p.x, p.y);
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle = '';
}

function rect (b, color, filled) {
  ctx.moveTo(b[0], b[1]);
  ctx.beginPath();
  ctx.rect(b[0], b[1], b[2] - b[1], b[3] - b[1]);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle = '';
}

function line (u, v, color) {
  ctx.beginPath();
  ctx.moveTo(u.x, u.y);
  ctx.lineTo(v.x, v.y);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
}


setTimeout(function () {
  som(data, {
    bounds: bounds,
    onUpdate: render,
    onEnd: function () {
      console.log('done');
    }
  });
}, 500);

var dragging    = false;
var tolerance   = Rmax * 2;
var draggedNode = null;
var dragTimer   = 0;

canvas.addEventListener('mousedown', function (evt) {
  dragging = true;
  var ex = bounds[0] + evt.clientX * pxRatio,
      ey = bounds[1] + evt.clientY * pxRatio;

  setTimeout(function () {
    for (var i = 0, len = data.nodes.length; i < len; i++) {
      var node = data.nodes[i];
      var dx = ex - node.x,
          dy = ey - node.y;

      if (Math.sqrt(dx * dx + dy * dy) < tolerance) {
        draggedNode = node;
        break;
      }
    }
  }, 0)
});

canvas.addEventListener('mousemove', function (evt) {
  if (dragging && draggedNode) {
    draggedNode.x = bounds[0] + evt.clientX * pxRatio;
    draggedNode.y = bounds[1] + evt.clientY * pxRatio;

    clearTimeout(dragTimer);
    dragTimer = setTimeout(render, 16);
  }
});

canvas.addEventListener('mouseup', function (evt) {
  dragging    = false;
  draggedNode = null;
});
