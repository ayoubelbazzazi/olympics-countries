export default function (arr, filter, key) {
    return arr.filter((element) => !filter.includes(element[key]));
}
