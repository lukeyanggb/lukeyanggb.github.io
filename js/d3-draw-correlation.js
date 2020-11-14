function drawCorrelation(dataPath, tipId, correlationId, legendId, margin) {
    const padding = 0.1;
    const dim = d3.min([1000 * 0.6, 1000 * 0.6]);
    const width = dim - margin.left - margin.right;
    const height = dim - margin.top - margin.bottom;

    d3.dsv(',', dataPath, (data) => {
        const cleaned = {};
        Object.keys(data).forEach((key) => {
            cleaned[key] = +data[key];
        });
        return cleaned;
    }).then((data) => {
        const cols = Object.keys(data[0]).filter((d) => d !== 'index');
        // console.log(data);
        // console.log(cols);

        const corr = jz.arr.correlationMatrix(data, cols);
        const extent = d3.extent(corr.map((d) => d.correlation));
        const grid = data2grid.grid(corr);
        const rows = d3.max(grid, (d) => d.row);

        const tip = d3.tip()
            .attr('class', 'correlation-tip')
            .attr('id', tipId)
            .offset([-5, 0])
            .html((d) => `<span>X: ${d.column_x}</span><br>` +
                `<span>Y: ${d.column_y}</span><br>` +
                `<span>Correlation: ${d.correlation.toFixed(2)}</span>`);

        const svg = d3.select(`#${correlationId}`).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .paddingInner(padding)
            .domain(d3.range(1, rows + 1));

        const y = d3.scaleBand()
            .range([0, height])
            .paddingInner(padding)
            .domain(d3.range(1, rows + 1));

        const c = chroma.scale(['white', 'steelblue'])
            .domain([extent[0], extent[1]]);

        const x_axis = d3.axisTop(y).tickFormat((d, i) => cols[i]);
        const y_axis = d3.axisLeft(x).tickFormat((d, i) => cols[i]);

        svg.append('g')
            .attr('class', `x axis correlation ${correlationId}`)
            .call(x_axis)
            .selectAll('text')
            .attr('class', 'mdc-typography--body2')
            .style('font-size', 11)
            .style('text-anchor', 'start')
            .call((t) => {
                t.each((_, i, v) => {
                    const e = v[i];
                    const self = d3.select(e);
                    const s = self.text().split(' ');
                    if (s.length > 1) {
                        const splitAt = Math.ceil(s.length / 2);
                        self.text('');
                        self.append('tspan')
                            .attr('x', Math.abs(e.getAttribute('y')))
                            .attr('y', e.getAttribute('y'))
                            .attr('dy', e.getAttribute('dy'))
                            .text(s.splice(0, splitAt).join(' '));
                        self.append('tspan')
                            .attr('x', Math.abs(e.getAttribute('y')))
                            .attr('y', e.getAttribute('y'))
                            .attr('dy', '1em')
                            .text(s.splice(-splitAt).join(' '));
                    }
                });
            })
            .attr('transform', 'rotate(-65)');

        svg.append('g')
            .attr('class', `y axis correlation ${correlationId}`)
            .call(y_axis)
            .selectAll('text')
            .attr('class', 'mdc-typography--body2')
            .style('font-size', 11)
            .call((t) => {
                t.each((_, i, v) => {
                    const e = v[i];
                    const self = d3.select(e);
                    const s = self.text().split(' ');
                    if (s.length > 1) {
                        const splitAt = Math.ceil(s.length / 2);
                        self.text('');
                        self.append('tspan')
                            .attr('x', e.getAttribute('x'))
                            .attr('dy', `${Number(e.getAttribute('dy').slice(0, -2)) / 2}em`)
                            .text(s.splice(0, splitAt).join(' '));
                        self.append('tspan')
                            .attr('x', e.getAttribute('x'))
                            .attr('dy', '1em')
                            .text(s.splice(-splitAt).join(' '));
                    }
                });
            });

        svg.selectAll('rect')
            .data(grid, (d) => d.column_a + d.column_b)
            .enter()
            .append('rect')
            .attr('class', `rect-correlation ${correlationId}`)
            .attr('x', (d) => x(d.column))
            .attr('y', (d) => y(d.row))
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .style('fill', (d) => c(d.correlation))
            .style('opacity', 1e-6)
            .style('opacity', 1)
            .transition()
            .call(tip);

        d3.selectAll(`.${correlationId}`)
            .on('mouseover', function (d) {
                if (d !== undefined) {
                    tip.show(d);
                    d3.select(this).classed('selected', true);
                    d3.select(`.x.axis.correlation.${correlationId} .tick:nth-of-type(${d.column}) text`).classed('selected', true);
                    d3.select(`.y.axis.correlation.${correlationId} .tick:nth-of-type(${d.row}) text`).classed('selected', true);
                    d3.select(`.x.axis.correlation.${correlationId} .tick:nth-of-type(${d.column}) line`).classed('selected', true);
                    d3.select(`.y.axis.correlation.${correlationId} .tick:nth-of-type(${d.row}) line`).classed('selected', true);
                }
            })
            .on('mouseout', () => {
                tip.hide();
                d3.selectAll('rect').classed('selected', false);
                d3.selectAll('.axis .tick text').classed('selected', false);
                d3.selectAll('.axis .tick line').classed('selected', false);
            });

        // legend scale
        const legend_top = 15;
        const legend_height = 15;

        const legend_svg = d3.select(`#${legendId}`).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', legend_height + legend_top)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${legend_top})`);

        const defs = legend_svg.append('defs');

        const gradient = defs.append('linearGradient')
            .attr('id', `${legendId}-linear-gradient`);

        const stops = [{
            offset: 0,
            color: 'white',
            value: extent[0],
        }, {
            offset: 1,
            color: 'steelblue',
            value: extent[1],
        }];

        gradient.selectAll('stop')
            .data(stops)
            .enter().append('stop')
            .attr('offset', (d) => `${100 * d.offset}%`)
            .attr('stop-color', (d) => d.color);

        legend_svg.append('rect')
            .attr('width', width)
            .attr('height', legend_height)
            .style('fill', `url(#${legendId}-linear-gradient)`);

        legend_svg.selectAll('text')
            .data(stops)
            .enter()
            .append('text')
            .attr('class', 'mdc-typography--body2')
            .attr('x', (d) => width * d.offset)
            .attr('dy', -3)
            .style('text-anchor', (d, i) => (i === 0 ? 'start' : 'end'))
            .text((d) => d.value.toFixed(2));
    });
}
