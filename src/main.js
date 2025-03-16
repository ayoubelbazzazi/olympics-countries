import { Dashboard } from '@classes/dashboard.js';

const dashboard = new Dashboard('#dashboard', 1200, 800);
const loadingIcon = document.querySelector(".loading-icon")
const errorContainer = document.querySelector('#loading .loading-error')
dashboard
    .init()
    .then(() => {
        dashboard.render();
    })
    .catch((e) => {
        loadingIcon.classList.toggle('hide')
        errorContainer.classList.toggle('show')
    });

