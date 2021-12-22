let currentYear = 2010;
let currentSong = 0;
let processedData = null;

function incrementYear() {
  if (currentYear < 2019) {
    currentYear++;
    updateViz();
  }
}

function decrementYear() {
  if (currentYear > 2010) {
    currentYear--;
    updateViz();
  }
}

function goToFirst() {
  currentYear = 2019;
  updateViz();
}

function goToLast() {
  currentYear = 2010;
  updateViz();
}

function incrementSong() {
  if (currentSong < 24) {
    lastSong = currentSong;
    currentSong++;
    updateSongViz(lastSong);
  }
}

function decrementSong() {
  if (currentSong > 0) {
    lastSong = currentSong;
    currentSong--;
    updateSongViz(lastSong);
  }
}

function goToFirstSong() {
  lastSong = currentSong;
  currentSong = 24;
  updateSongViz(lastSong);
}

function goToLastSong() {
  lastSong = currentSong;
  currentSong = 0;
  updateSongViz(lastSong);
}

function processData(data) {
  let processedData = {};
  data.forEach((el) => {
    if (processedData[el.year]) {
      processedData[el.year].push({
        title: el.title,
        artist: el.artist,
        topGenre: el['top genre'],
        bpm: el.bpm,
        nrgy: el.nrgy,
        dnce: el.dnce,
        dB: el.dB,
        live: el.live,
        val: el.val,
        dur: el.dur,
        acous: el.acous,
        spch: el.spch,
        pop: el.pop,
      });
    } else {
      processedData[el.year] = [
        {
          title: el.title,
          artist: el.artist,
          topGenre: el['top genre'],
          bpm: el.bpm,
          nrgy: el.nrgy,
          dnce: el.dnce,
          dB: el.dB,
          live: el.live,
          val: el.val,
          dur: el.dur,
          acous: el.acous,
          spch: el.spch,
          pop: el.pop,
        },
      ];
    }
  });
  Object.keys(processedData).forEach((key) => {
    processedData[key] = processedData[key].slice(0, 25);
  });
  return processedData;
}

function getTopGenres(data) {
  const result = {};
  for (const year in data) {
    const genres = {};
    data[year].forEach((el) => {
      if (el.topGenre in genres) {
        genres[el.topGenre]++;
      } else {
        genres[el.topGenre] = 1;
      }
    });
    const sortable = [];
    for (const genre in genres) {
      sortable.push([genre, genres[genre]]);
    }

    sortable.sort((a, b) => {
      return b[1] - a[1];
    });
    result[year] = sortable;
  }
  return result;
}

const titleMap = {
  bpm: 'BPM (Beats Per Minute)',
  nrgy: 'Energy',
  dnce: 'Danceability',
  dB: 'Loudness (dB)',
  live: 'Liveness',
  val: 'Valence',
  dur: 'Duration (Seconds)',
  acous: 'Acousticness',
  spch: 'Speechness',
};

function drawScatter(canvas, data, key, position, yrange) {
  // code for scatter plot adapted from
  // https://www.d3-graph-gallery.com/graph/scatter_basic.html
  const height = 200;
  const width = 200;
  const margin = { left: 50, top: 50, right: 50, bottom: 40 };
  const positions = {
    1: [margin.left, margin.top],
    2: [margin.left * 2 + margin.right + width, margin.top],
    3: [margin.left * 3 + margin.right * 2 + width * 2, margin.top],
    4: [margin.left, margin.top * 2 + margin.bottom + height],
    5: [
      margin.left * 2 + margin.right + width,
      margin.top * 2 + margin.bottom + height,
    ],
    6: [
      margin.left * 3 + margin.right * 2 + width * 2,
      margin.top * 2 + margin.bottom + height,
    ],
    7: [margin.left, margin.top * 3 + margin.bottom * 2 + height * 2],
    8: [
      margin.left * 2 + margin.right + width,
      margin.top * 3 + margin.bottom * 2 + height * 2,
    ],
    9: [
      margin.left * 3 + margin.right * 2 + width * 2,
      margin.top * 3 + margin.bottom * 2 + height * 2,
    ],
  };

  const x = d3.scaleLinear().domain([50, 100]).range([0, width]);
  canvas
    .append('g')
    .attr(
      'transform',
      'translate(' +
        positions[position][0] +
        ',' +
        (height + positions[position][1]) +
        ')'
    )
    .call(d3.axisBottom(x));

  const y = d3.scaleLinear().domain(yrange).range([height, 0]);
  canvas
    .append('g')
    .attr(
      'transform',
      'translate(' + positions[position][0] + ',' + positions[position][1] + ')'
    )
    .call(d3.axisLeft(y));

  canvas
    .append('text')
    .attr('x', positions[position][0] + width / 2)
    .attr('y', positions[position][1] - margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text(`${titleMap[key]} vs Popularity`);

  canvas
    .append('g')
    .attr(
      'transform',
      'translate(' + positions[position][0] + ',' + positions[position][1] + ')'
    )
    .selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function (d) {
      return x(d.pop);
    })
    .attr('cy', function (d) {
      return y(d[key]);
    })
    .attr('class', function (d) {
      return d.title.replace(/[^a-z0-9]/gi, '');
    })
    .attr('r', 2.5)
    .style('fill', function (d) {
      if (data[currentSong].title === d.title) {
        return '#cd2026';
      } else {
        return '#0071bc';
      }
    });
}

function drawBar(canvas, data) {
  // code for bar chart adapted from
  // https://www.d3-graph-gallery.com/graph/barplot_horizontal.html
  // https://www.d3-graph-gallery.com/graph/barplot_animation_start.html
  const margin = { left: 100, top: 50, right: 50, bottom: 50 };
  const width = 950 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const x = d3.scaleLinear().domain([0, 18]).range([0, width]);

  canvas
    .append('g')
    .attr(
      'transform',
      'translate(' + margin.left + ',' + (height + margin.top) + ')'
    )
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  const y = d3
    .scaleBand()
    .range([0, height])
    .domain(data.map((d) => d[0]))
    .padding(0.1);
  canvas
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(d3.axisLeft(y));

  canvas
    .selectAll('myBars')
    .data(data)
    .join('rect')
    .attr('x', x(0))
    .attr('y', (d) => y(d[0]))
    .attr('width', (d) => x(0))
    .attr('height', y.bandwidth())
    .attr('fill', '#0071bc')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  canvas
    .selectAll('rect')
    .transition()
    .duration(800)
    .attr('x', function (d) {
      return x(0);
    })
    .attr('width', function (d) {
      return x(d[1]);
    })
    .delay(function (d, i) {
      return i * 100;
    });

  canvas
    .append('text')
    .attr('x', margin.left + width / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '24px')
    .text('Top Genres');

  canvas
    .append('text')
    .attr('x', margin.left + width / 2)
    .attr('y', margin.top + height + margin.bottom)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text('Number of Songs in the Top 25');
}

function drawSongSection(data) {
  // code for radial chart adapted from
  // https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart
  const year = d3
    .select('.song')
    .append('text')
    .attr('text-anchor', 'middle')
    .style('text-align', 'center')
    .style('width', '500px')
    .style('font-size', '26px')
    .style('text-overflow', 'ellipsis')
    .style('white-space', 'nowrap')
    .style('overflow', 'hidden')
    .style('font-weight', 'bold')
    .style('padding', '1px')
    .text('#' + (currentSong + 1) + ' ' + data[currentSong].title);

  const radial = d3
    .select('.radial')
    .append('svg')
    .attr('width', 950)
    .attr('height', 350);

  const radialScale = d3.scaleLinear().domain([0, 100]).range([0, 150]);
  const ticks = [20, 40, 60, 80, 100];

  ticks.forEach((tick) => {
    radial
      .append('circle')
      .attr('cx', 950 / 2)
      .attr('cy', 350 / 2)
      .attr('fill', 'none')
      .attr('stroke', 'gray')
      .attr('r', radialScale(tick));

    radial
      .append('text')
      .attr('x', 950 / 2)
      .attr('y', 350 / 2 - radialScale(tick) - 5)
      .attr('text-anchor', 'middle')
      .text(tick.toString());
  });

  const attributes = ['nrgy', 'dnce', 'live', 'val', 'acous', 'spch'];
  const coordinates = [];
  for (let index in attributes) {
    const angle = Math.PI + (2 * Math.PI * index) / attributes.length;
    const line_coordinate = angleToCoordinate(angle, 100, radialScale);
    const label_coordinate = angleToCoordinate(angle, 115, radialScale);
    coordinates.push(
      angleToCoordinate(
        angle,
        data[currentSong][attributes[index]],
        radialScale
      )
    );

    radial
      .append('line')
      .attr('x1', 950 / 2)
      .attr('y1', 350 / 2)
      .attr('x2', line_coordinate.x)
      .attr('y2', line_coordinate.y)
      .attr('stroke', 'black');

    radial
      .append('text')
      .attr('x', label_coordinate.x)
      .attr('y', label_coordinate.y)
      .attr('text-anchor', 'middle')
      .text(attributes[index]);
  }

  const line = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y);

  radial
    .append('path')
    .datum(coordinates)
    .attr('d', line)
    .attr('stroke-width', 3)
    .attr('stroke', '#cd2026')
    .attr('fill', '#cd2026')
    .attr('stroke-opacity', 1)
    .attr('opacity', 0.5);
}

function angleToCoordinate(angle, value, radialScale) {
  const x = Math.cos(angle) * radialScale(value);
  const y = Math.sin(angle) * radialScale(value);
  return { x: 950 / 2 + x, y: 350 / 2 - y };
}

function draw() {
  const width = 950,
    height = 900 - 45;
  const bar = d3
    .select('.bar')
    .append('svg')
    .attr('width', width)
    .attr('height', height / 2);
  const scatter = d3
    .select('.scatter')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  const year = d3
    .select('.year')
    .append('text')
    .attr('text-anchor', 'middle')
    .style('font-size', '26px')
    .style('font-weight', 'bold')
    .style('padding', '1px')
    .text(currentYear);

  d3.csv('data.csv').then((data) => {
    processedData = processData(data);
    topGenres = getTopGenres(processedData);

    drawBar(bar, topGenres[currentYear]);
    drawScatter(scatter, processedData[currentYear], 'bpm', 2, [0, 220]);
    drawScatter(scatter, processedData[currentYear], 'nrgy', 4, [0, 100]);
    drawScatter(scatter, processedData[currentYear], 'dnce', 8, [0, 100]);
    drawScatter(scatter, processedData[currentYear], 'dB', 1, [-10, 0]);
    drawScatter(scatter, processedData[currentYear], 'spch', 5, [0, 100]);
    drawScatter(scatter, processedData[currentYear], 'live', 6, [0, 100]);
    drawScatter(scatter, processedData[currentYear], 'val', 7, [0, 100]);
    drawScatter(scatter, processedData[currentYear], 'dur', 3, [120, 360]);
    drawScatter(scatter, processedData[currentYear], 'acous', 9, [0, 100]);
    drawSongSection(processedData[currentYear]);
  });
}

function updateViz() {
  d3.select('.bar').html('');
  d3.select('.scatter').html('');
  d3.select('.year').html('');
  currentSong = 0;
  d3.select('.song').html('');
  d3.select('.radial').html('');
  draw();
}

function updateSongViz(lastSong) {
  d3.select('.song').html('');
  d3.select('.radial').html('');
  let nodes = d3
    .selectAll(
      `.${processedData[currentYear][lastSong].title.replace(
        /[^a-z0-9]/gi,
        ''
      )}`
    )
    .nodes();
  for (let index in nodes) {
    nodes[index].style.fill = '#0071bc';
  }
  nodes = d3
    .selectAll(
      `.${processedData[currentYear][currentSong].title.replace(
        /[^a-z0-9]/gi,
        ''
      )}`
    )
    .nodes();
  for (let index in nodes) {
    nodes[index].style.fill = '#cd2026';
  }
  drawSongSection(processedData[currentYear]);
}
