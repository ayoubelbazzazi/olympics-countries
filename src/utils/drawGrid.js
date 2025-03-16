import interpolation from '@utils/interpolation.js';
export default function (medals, year_season, theme, break_points, maxRank) {
    const max_ranks = year_season.map((m) =>
        Math.max(...m[1].map((r) => r.rank)),
    );
    const xGrid = max_ranks.length;
    const gridMatrix = [];

    const importantYears = [1924, 1994];
    year_season = year_season.map((x) => x[0]);

    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const xSpace = canvas.width / (xGrid - 1);
    const ySpace = canvas.height / (maxRank - 1);
    const radius = 2;
    for (let i = 0; i < xGrid; i++) {
        for (let j = 0; j < maxRank; j++) {
            const xOffsetFactor = 7;
            const xOffset =
                xOffsetFactor *
                (i < break_points[0]   ? 0 : i < break_points[1]   ? 1 : 2);
            const x = i * xSpace + xOffset;
            const x_interpolated = interpolation(
                x,
                0,
                canvas.width +
                    xOffsetFactor * (Object.keys(break_points).length - 1),
                radius,
                canvas.width - radius,
            );

            const yOffsetFactor = 10;
            const y = j * ySpace + yOffsetFactor * Math.floor(j / 20);
            const y_interpolated = interpolation(
                y,
                0,
                canvas.height + yOffsetFactor * Math.floor(maxRank / 20),
                radius,
                canvas.height - radius,
            );
            const max = max_ranks[i] < j;
            gridMatrix.push([x_interpolated, y_interpolated, max]);
        }
    }

    for (const [x, y, max] of gridMatrix) {
        if (theme === 'dark') {
            ctx.fillStyle = !max
                ? 'rgba(255,255,255,.8)'
                : 'rgba(255,255,255,.3)';
        } else {
            ctx.fillStyle = !max ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.3)';
        }
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}
