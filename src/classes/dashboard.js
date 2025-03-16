import * as d3 from 'd3';
import gsap from 'gsap';

import CountryManager from './countrymanager';
import drawGrid from '@utils/drawGrid';
import { darkTheme, lightTheme } from '../utils/themeSwitch';
import lightLogo from '@icons/logo light.svg';
import darkLogo from '@icons/logo dark.svg';
import { drawLabels } from '../utils/drawLabels';

export class Dashboard {
    constructor(selector, width, height) {
        this.selector = selector;
        this.width = width;
        this.height = height;
    }

    async init() {
        this.theme();
        this.themeUpdate();

        let countries = await d3.csv('/data/countries.csv');
        let medals = await d3.csv('/data/medals.csv', this.process);

        this.filter(countries, medals);
        this.common();
        const countryManager = new CountryManager(
            this.countries,
            this.medals,
            this.xScale,
            this.yScale,
            this.lScale,
            this.break_points,
            this.maxRank,
        );
        countryManager.init();
    }

    theme() {
        const userPreferences = localStorage.getItem('userPreferences');
        const logo = document.querySelector('#logo');
        if (!userPreferences) {
            localStorage.setItem(
                'userPreferences',
                JSON.stringify({ theme: 'light' }),
            );
            this.theme = 'light';
        } else {
            this.theme = JSON.parse(userPreferences).theme;
            document.body.dataset.theme = this.theme;
        }
        if (this.theme === 'dark') {
            logo.setAttribute('src', darkLogo);
        } else {
            logo.setAttribute('src', lightLogo);
        }
    }

    themeUpdate() {
        const logo = document.querySelector('#logo');
        const themeSwitcher = document.querySelector('#theme-switch');
        themeSwitcher.addEventListener('click', () => {
            if (this.theme === 'dark') {
                lightTheme(this);
            } else {
                darkTheme(this);
            }
        });
    }

    filter(countries, medals) {
        const nonCountries = [
            'Mixed team',
            'Bohemia',
            'Unified Team',
            'Serbia and Montenegro',
            'Independent Olympic Athletes',
            'ROC',
            'Refugee Olympic Team',
            'Olympic Athletes from Russia',
            'Individual Neutral Athletes',
        ];
        countries = countries.filter(
            (country) => !nonCountries.includes(country.country_name),
        );
        medals = medals.filter(
            (medal) => !nonCountries.includes(medal.country_name),
        );

        this.countries = countries;
        this.medals = medals;
    }

    process(d) {
        Object.keys(d).forEach((key) => {
            d[key] = isNaN(Number(d[key])) ? d[key] : Number(d[key]);
        });
        return d;
    }
    common() {
        let year_season = d3.groups(
            this.medals,
            (d) => `${d.year}-${d.season}`,
        );
        const unique_year_season = year_season.map((y) => y[0]);
        this.year_season = year_season;
        const yGrid = Math.max(...this.medals.map((m) => m.rank));
        const maxRank = yGrid;
        this.unique_year_season = unique_year_season;
        this.maxRank = yGrid;

        const importantYears = [1924, 1994];
        year_season = year_season.map((x) => x[0]);
        let break_points = year_season.reduce((acc, season, index) => {
            const year = parseInt(season.split('-')[0]);
            let key = year < 1924 ? 0 : year < 1994 ? 1 : 2;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        break_points = Object.values(break_points).reduce((acc, b, i) => {
            acc[i] = b + (acc[i - 1] || 0);
            return acc;
        }, []);
        this.break_points = break_points;

        const canvas = document.querySelector('canvas');
        const { width, height } = canvas.getBoundingClientRect();
        const ranks = [...Array(Math.floor(maxRank)).keys()].map((x) => x + 1);
        const yScale = d3.scalePoint().domain(ranks).range([0, height]);
        year_season.sort((a, b) => {
            const year_a = parseInt(a.split('-')[0]);
            const year_b = parseInt(b.split('-')[0]);
            return year_a - year_b;
        });
        const xScale = d3
            .scalePoint()
            .domain(unique_year_season)
            .range([0, width]);
        this.xScale = xScale;
        this.yScale = yScale;

        const lScale = d3.scaleLinear().range([0, height]).domain([1, maxRank]);
        this.lScale = lScale;
    }

    grid() {
        drawGrid(
            this.medals,
            this.year_season,
            this.theme,
            this.break_points,
            this.maxRank,
        );
    }

    labels() {
        drawLabels(
            this.unique_year_season,
            this.maxRank,
            this.break_points,
            this.xScale,
            this.yScale,
        );
    }

    render() {
        this.grid();
        this.labels();
        this.loading();
    }

    loading() {
        const loading = document.querySelector('#loading');
        gsap.to('#loading', {
            opacity: 0,
            duration: 0,
            delay:.7,
            onComplete: () => {
                loading.classList.add('hide');
            },
        });
    }
}
