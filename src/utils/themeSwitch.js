import lightLogo from '@icons/logo light.svg';
import darkLogo from '@icons/logo dark.svg';

const logo = document.querySelector('#logo');
const canvas = document.querySelector('#canvas');
export function lightTheme(d_obj) {
    document.body.dataset.theme = 'light';
    d_obj.theme = 'light';
    logo.setAttribute('src', lightLogo);
    localStorage.setItem('userPreferences', JSON.stringify({ theme: 'light' }));
    canvas.classList.toggle("invert")
}

export function darkTheme(d_obj) {
    document.body.dataset.theme = 'dark';
    d_obj.theme = 'dark';
    logo.setAttribute('src', darkLogo);
    localStorage.setItem('userPreferences', JSON.stringify({ theme: 'dark' }));
    canvas.classList.toggle("invert")
}
