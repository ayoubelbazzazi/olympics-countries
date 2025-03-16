import * as d3 from 'd3'
import interpolation from './interpolation';
export function drawLabels(unique_year_seasons, maxRank, break_points, xScale, yScale) {
    const svg = d3
        .select('#viz')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('overflow', 'visible');

    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    //ranks
    const yBreakPoint = 20;
    const yOffset = 10;

    const importantYears = [
        { year: 1896, season: 'none' },
        { year: 1924, season: 'winter' },
        { year: 1994, season: 'winter' },
    ];

    const year_season = unique_year_seasons;
    year_season.sort((a, b) => {
        const year_a = parseInt(a.split('-')[0]);
        const year_b = parseInt(b.split('-')[0]);
        return year_a - year_b;
    });
    const ranks_bk = [...Array(Math.floor(maxRank / 20)).keys()].map(
        (x) => (x + 1) * yBreakPoint + 1,
    );
    ranks_bk.unshift(1);

    const rankLabels = svg.append('g').attr('id', 'rank-labels');
    const radius = 2;
    rankLabels
        .selectAll()
        .data(ranks_bk)
        .join('text')
        .each(function (d) {
            const y = interpolation(
                yScale(d) + yOffset * Math.floor((d - 1) / 20),
                0,
                height + yOffset * Math.floor(maxRank / 20),
                radius,
                height - radius,
            );
            d3.select(this)
                .text(d)
                .attr('x', -20)
                .attr('y', y + 4)
                .attr('font-size', 12);
        });
    // years

    const year_bk = Object.values(break_points);
    const xOffset = 7;

    const yearLabels = svg.append('g').attr('id', 'year-labels');
    const xlabels = [
        '1896: First olympics held|in Athens-Greece',
        '1924: Inauguration of|winter games',
        '1994: Winter and summer games|held in different years',
    ];
    yearLabels
        .selectAll()
        .data(year_bk)
        .join('line')
        .each(function (d, i) {
            const x = interpolation(
                xScale(year_season[year_bk[i - 1] || 0]) + i * xOffset,
                0,
                width + (year_bk.length - 1) * xOffset,
                radius,
                width - radius,
            );
            d3.select(this).attr('x1', x).attr('x2', x);
        })
        .attr('y1', -40)
        .attr('y2', -10)
        .attr('stroke', 'white');

    yearLabels
        .selectAll()
        .data(year_bk)
        .join('text')
        .each(function (d, i) {
            const x = interpolation(
                xScale(year_season[year_bk[i - 1] || 0]) + i * xOffset,
                0,
                width + (year_bk.length - 1) * xOffset,
                radius,
                width - radius,
            );
            d3.select(this)
                .attr('x', x)
                .attr('text-anchor', i === 0 ? 'end' : 'middle')
                .selectAll('tspan')
                .data(xlabels[i].split('|'))
                .join('tspan')
                .text((d) => d)
                .each(function (f, j) {
                    d3.select(this)
                        .attr('dy', j * 15)
                        .attr('x', x);
                });
        })
        .attr('y', -70)
        .attr('font-size', 12)
        .attr('fill', 'white');
}
