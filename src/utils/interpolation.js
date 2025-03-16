export default function (t, old_min, old_max, new_min, new_max){
    return  (t - old_min) / (old_max - old_min) * (new_max - new_min) + new_min;
}