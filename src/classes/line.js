import * as d3 from 'd3';
import interpolation from '../utils/interpolation';
import capitalize from '@utils/capitalize.js'
import gsap from 'gsap';

export default class chart {
    constructor(
        medals,
        id,
        country_id,
        xScale,
        yScale,
        lScale,
        break_points,
        maxRank,
    ) {
        this.medals = medals;
        this.id = id;
        this.country_id = country_id;
        this.xScale = xScale;
        this.yScale = yScale;
        this.lScale = lScale;
        this.break_points = break_points;
        this.maxRank = maxRank;
    }
    render() {
        this.containers();
        this.line();
        this.points();
    }

    containers() {
        const svg = d3.select('svg');
        console.log(svg)
        const lines = svg.node().querySelector('#lines')
        const points = svg.node().querySelector('#points')
        if(lines && points) return
        svg.append('g').attr('id', 'lines');
        svg.append('g').attr('id', 'points');
    }
    points() {
        const break_points = Object.values(this.break_points);
        const canvas = document.querySelector('canvas');
        const { width, height } = canvas.getBoundingClientRect();
        const svg = d3.select('svg');
        const radius = 4;
        const xScale = this.xScale;
        const yScale = this.yScale;
        const maxRank = this.maxRank;
        const tooltip = document.querySelector('#tooltip');
        const tooltipControls = this.tooltipControls;

        const container = svg
            .select('#points')
            .append('g')
            .attr('id', `points-${this.id}`)
            .attr('data-country-id', this.country_id)
            .attr('class', 'points');
        container
            .selectAll()
            .data(this.medals)
            .join('circle')
            .each(function (d) {
                const xOffsetFactor = 7;
                const xOffset =
                    xOffsetFactor *
                    (d.index <= break_points[0]
                        ? 0
                        : d.index <= break_points[1]
                          ? 1
                          : 2);
                const year_season = `${d['year']}-${d['season']}`;
                const x = interpolation(
                    xScale(year_season) + xOffset,
                    0,
                    width + xOffsetFactor * (break_points.length - 1),
                    radius / 2,
                    width - radius / 2,
                );

                const yOffsetFactor = 10;
                const yBreakPoint = Math.floor((d.rank - 1) / 20);
                const yOffset = yBreakPoint * yOffsetFactor;
                const y = interpolation(
                    yScale(d.rank) + yOffset,
                    0,
                    height + Math.floor(maxRank / 20) * yOffsetFactor,
                    radius / 2,
                    height - radius / 2,
                );
                d3.select(this).attr('cx', x).attr('cy', y);

                this.addEventListener('mouseover', (e) =>
                    tooltipControls(e, d),
                );
                this.addEventListener('mouseleave', () => {
                    tooltip.classList.remove('show');
                });
            })
            .attr('r', radius);
    }

    line() {
        const svg = d3.select('svg');
        const break_points = Object.values(this.break_points);
        const canvas = document.querySelector('canvas');
        const { width, height } = canvas.getBoundingClientRect();
        const xOffsetFactor = 7;
        const radius = 4;
        const xScale = this.xScale;
        const lScale = this.lScale;
        const yOffsetFactor = 10;
        const maxRank = this.maxRank;
        const container = svg.select('#lines');
        const line = d3
            .line()
            .x((d) =>
                this.x_interpolated(
                    d,
                    xScale,
                    xOffsetFactor,
                    width,
                    break_points,
                    radius,
                ),
            )
            .y((d) =>
                this.y_interpolated(
                    d,
                    lScale,
                    yOffsetFactor,
                    height,
                    radius,
                    maxRank,
                ),
            )
            .curve(d3.curveStepAfter);
        container
            .append('path')
            .attr('id', `line-${this.id}`)
            .attr('data-country-id', this.country_id)
            .attr('class', 'line')
            .attr('d', line(this.medals))
            .attr('fill', 'none');
    }

    x_interpolated(d, xScale, xOffsetFactor, width, break_points, radius) {
        const year_season = `${d['year']}-${d['season']}`;
        const xOffset =
            xOffsetFactor *
            (d.index <= break_points[0]
                ? 0
                : d.index <= break_points[1]
                  ? 1
                  : 2);
        const x = interpolation(
            xScale(year_season) + xOffset,
            0,
            width + xOffsetFactor * (break_points.length - 1),
            radius / 2,
            width - radius / 2,
        );
        return x;
    }

    y_interpolated(d, lScale, yOffsetFactor, height, radius, maxRank) {
        const yBreakPoint = Math.floor((d.rank - 1) / 20);
        const yOffset = yBreakPoint * yOffsetFactor;
        const y = interpolation(
            lScale(d.rank) + yOffset,
            0,
            height + Math.floor(maxRank / 20) * yOffsetFactor,
            radius / 2,
            height - radius / 2,
        );
        return y;
    }
    async tooltipControls(e, d) {
        const viz = document.querySelector('#viz');
        const tooltip = document.querySelector('#tooltip');

        tooltip.innerHTML = '';
        tooltip.innerHTML = `
                        <div class="heading flex justify-between gap-6 mb-4">
                            <div class="details flex flex-col">
                                <h3 class="text-sm mb-2 max-w-[200px]">${d.country_name}</h3>
                                <span>Rank: ${d.rank}</span>
                                <span>Olympics: ${d.season !== 'none' ? capitalize(d.season) + ' ':''}${d.year}</span>
                                <span>Location: ${d.location}</span>
                            </div>
                            <img
                                src="/assets/flags/${d.country_flag}"
                                class="w-[55px] h-fit"
                                alt="${d.country_name} flag"
                            />
                        </div>

                        <div class="medals flex flex-col">
                            <h4 class="mb-2">Medals:</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th class="">
                                            <div
                                                class="flex items-center justify-center"
                                            >
                                                <i class="gold"></i>                                                
                                            </div>
                                        </th>
                                        <th class="">
                                            <div
                                                class="flex items-center justify-center"
                                            >
                                                <i class="px-1 silver"></i>
                                            </div>
                                        </th>
                                        <th class="">
                                            <div
                                                class="flex items-center justify-center"
                                            >
                                                <i class="px-1 bronze"></i>
                                            </div>
                                        </th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center p-1">${d.gold}</td>
                                        <td class="text-center">${d.silver}</td>
                                        <td class="text-center">${d.bronze}</td>
                                        <td class="text-center">${d.total}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
        `;
        const { width, height } = tooltip.getBoundingClientRect();
        const { top, left } = viz.getBoundingClientRect();
        let x = e.clientX - left + 20;
        let y = e.clientY - top + 20;

        if (x > window.innerWidth - width - left) {
            x = x - width - 40;
        }

        if (y > window.innerHeight - height - top) {
            y = y - height - 40;
        }

        gsap.to('#tooltip', {
            x: x,
            y: y,
            duration: 0,
        });
        tooltip.classList.add('show');
    }
}
