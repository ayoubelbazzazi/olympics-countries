import chart from '@classes/line';

export default class CountryManager {
    constructor(
        countries,
        medals,
        xScale,
        yScale,
        lScale,
        break_points,
        maxRank,
    ) {
        this.countries = countries;
        this.medals = medals;
        this.count = 0;
        this.selectedCountries = [];
        this.xScale = xScale;
        this.yScale = yScale;
        this.lScale = lScale;
        this.break_points = break_points;
        this.maxRank = maxRank;
    }

    init() {
        this.events();
        this.countryList();
        this.selectorPrototype();
        this.addSelector();
        this.firstSelector();
    }

    async firstSelector() {
        const selector = document.querySelector('.country-selector');
        const country = selector.querySelector(
            '.country-item[data-country-id="163"]',
        );
        await new Promise((res) => setTimeout(res, 500));
        country.click();
    }

    addSelector() {
        const container = document.querySelector('#country-selectors');
        const selector = new Selector(this);
        selector.init();
        container.appendChild(selector.selector);
        this.count += 1;
        this.toggleAddBtn();
    }

    toggleAddBtn() {
        const addBtn = document.querySelector('#add-country');
        addBtn.classList.toggle('hide', this.count > 4);
    }

    events() {
        const addBtn = document.querySelector('#add-country');
        addBtn.addEventListener('click', () => this.addSelector());
    }

    selectorPrototype() {
        const prototype = document.querySelector('.country-selector');
        this.prototypeHtml = prototype.outerHTML;
        prototype.remove();
    }

    reIndex() {
        const selectors = document.querySelectorAll('.country-selector');
        Array.from(selectors).forEach((selector, index) => {
            selector.num = index + 1;
        });
        const points = document.querySelectorAll('svg #points .points');
        const lines = document.querySelectorAll('svg #lines .line');
        if (!points || !lines) return;
        Array.from(points).forEach((point) => {
            const countryId = point.dataset.countryId;
            const selector = document.querySelector(
                `.country-selector[data-country-id="${countryId}"]`,
            );
            point.setAttribute('id', `points-${selector.num}`);
        });
        Array.from(lines).forEach((line) => {
            const countryId = line.dataset.countryId;
            const selector = document.querySelector(
                `.country-selector[data-country-id="${countryId}"]`,
            );
            line.setAttribute('id', `line-${selector.num}`);
        });
    }

    countryList() {
        let html = '';
        this.countries.forEach((country) => {
            html += `
                 <div class="flex country-item items-center gap-3 px-4 py-4" data-enable-hide="false" data-country-id="${country.id}" data-country-name="${country.country_name}" data-country-flag="${country.country_flag}" title="${country.country_name}">
                    <img src="/assets/flags/${country.country_flag}" class="w-[20px] h-auto" data-enable-hide="false">
                    <span class="truncate" data-enable-hide="false">${country.country_name}</span>
                </div>
            `;
        });
        this.countriesHtml = html.trim();
    }
}

class Selector {
    constructor(countryManager) {
        this.num = countryManager.count;
        this.parent = countryManager;
    }
    init() {
        this.makeSelector();
        this.removeSelector();
        this.showCountries();
        this.fillCountries();
        this.countryClick();
    }
    makeSelector() {
        const temp = document.createElement('div');
        temp.innerHTML = this.parent.prototypeHtml;
        this.selector = temp.firstElementChild;
        this.selector.num = this.num + 1;
    }
    removeSelector() {
        const removeBtn = this.selector.querySelector('.delete-selector');
        removeBtn.addEventListener('click', () => {
            this.selector.remove();
            this.parent.count -= 1;
            this.parent.toggleAddBtn();
            this.parent.selectedCountries =
                this.parent.selectedCountries.filter((country) => {
                    return country.selectorNum.num !== this.selector.num;
                });
            const previousChartPoints = document.querySelector(
                `svg #points #points-${this.selector.num}`,
            );
            const previousChartLines = document.querySelector(
                `svg #lines #line-${this.selector.num}`,
            );
            previousChartPoints?.remove();
            previousChartLines?.remove();
            this.parent.reIndex();
        });
    }
    showCountries() {
        const content = this.selector.querySelector('.content');
        content.addEventListener('click', () => {
            const previous = document.querySelector('.show-country-list');
            if (previous && previous !== this.selector) {
                previous.classList.toggle('show-country-list');
                const icon2 = previous.querySelector('.icon');
                this.showIcon(icon2);
            }
            this.selector.classList.toggle('show-country-list');
            const icon = this.selector.querySelector('.icon');
            this.showIcon(icon);
        });
        document.addEventListener('click', (e) => {
            if (e.target.dataset.enableHide) return;
            if (!this.selector.classList.contains('show-country-list')) return;
            this.selector.classList.remove('show-country-list');
            const icon = this.selector.querySelector('.icon');
            this.showIcon(icon);
        });
    }
    fillCountries() {
        const container = this.selector.querySelector('.country-list');
        container.innerHTML = this.parent.countriesHtml;
    }
    countryClick() {
        const countries = this.selector.querySelectorAll(
            '.country-list .country-item',
        );
        const content = this.selector.querySelector('.content');
        countries.forEach((country) => {
            country.addEventListener('click', () => {
                const isDuplicate = this.checkDuplicate(country)
                if (isDuplicate){
                    return 
                }
                this.countrySelectionController(country, content)
                this.vizController(country)
            });
        });
    }
    checkDuplicate(country){
        let duplicate = this.parent.selectedCountries.find((item) => {
            return (
                item.countryId === country.dataset.countryId &&
                item.selectorNum.num === this.selector.num
            );
        });
        if (duplicate) {
            this.selector.classList.toggle('show-country-list');
            const icon = this.selector.querySelector('.icon')
            this.showIcon(icon)
            return true;
        }
        duplicate = this.parent.selectedCountries.find((item) => {
            return item.countryId === country.dataset.countryId;
        });
        if (duplicate) {
            alert(
                `${country.dataset.countryName} has already been selected`,
            );
            return true;
                }
    }
    countrySelectionController(country, content){
                this.selector.classList.remove('show-country-list');
                const icon = this.selector.querySelector('.icon');
                this.showIcon(icon);
                content.innerHTML = `
                    <img src="/assets/flags/${country.dataset.countryFlag}" class="w-[20px] h-auto" data-enable-hide="false">
                    <span class="truncate max-w-[85px]" data-enable-hide="false">${country.dataset.countryName}</span>
                    <i class="icon open-selector text-[9px]" data-enable-hide="false"></i>
                    <i class="icon delete-selector absolute cursor-pointer -right-9 text-[19px]" data-enable-hide="false"></i>
            `;
                this.removeSelector();
                const previousActive = this.parent.selectedCountries.find(
                    (item) => {
                        return item.selectorNum.num === this.selector.num;
                    },
                );
                if (previousActive) {
                    const previousCountry = this.selector.querySelector(
                        '.country-item.active',
                    );
                    previousCountry.classList.remove('active');
                    this.parent.selectedCountries =
                        this.parent.selectedCountries.filter((item) => {
                            return !(
                                previousActive.countryId === item.countryId &&
                                item.selectorNum.num ===
                                    previousActive.selectorNum.num
                            );
                        });
                }
                this.parent.selectedCountries.push({
                    selectorNum: this.selector,
                    countryId: country.dataset.countryId,
                });
                country.classList.add('active');
                this.selector.dataset.countryId = country.dataset.countryId;

    }
    vizController(country){
        const medals = this.filterMedals(country.dataset.countryId);
        const previousChartPoints = document.querySelector(
            `svg #points #points-${this.selector.num}`,
        );
        const previousChartLines = document.querySelector(
            `svg #lines #line-${this.selector.num}`,
        );
        previousChartPoints?.remove();
        previousChartLines?.remove();
        const viz = new chart(
            medals,
            this.selector.num,
            country.dataset.countryId,
            this.parent.xScale,
            this.parent.yScale,
            this.parent.lScale,
            this.parent.break_points,
            this.parent.maxRank,
        );
        viz.render();
    }
    filterMedals(id) {
        const medals = this.parent.medals.filter(
            (medal) => medal.country_id === parseInt(id),
        );
        return medals;
    }
    showIcon(icon) {
        icon.classList.toggle('open-selector');
        icon.classList.toggle('close-selector');
    }
}
