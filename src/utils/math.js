

/**
 * Covnerts the number to a fixed number
 * Example: toFixedNumber(10.12345, 3) --> 10.123
 *
 * @param  {float} num to be fixed
 * @param  {int} digits total number after separator
 * @param  {float} base (default: 10)
 * @return {float} fixed number as number
 */
function toFixedNumber(num, digits, base) {
    var pow = Math.pow(base || 10, digits);
    return Math.round(num * pow) / pow;
}

function calcDegAngle(adjacent, opposite) {
    return Math.atan2(adjacent, opposite) * 180 / Math.PI;
}

function calcHypotenuse(opposite, adjacent) {
    let hypotenuseSquared = Math.pow(opposite, 2) + Math.pow(adjacent, 2);

    return Math.sqrt(hypotenuseSquared);
}

/**
 * Normalize a radian angle
 *
 * @param  {float} angle
 * @return {float} normalized angle
 * @remarks https://stackoverflow.com/a/36222552
 */
function normalizeRadAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/**
 * Converts an angle to 0-360 based angle.
 *
 * @param  {float} angle in degree
 * @return {float} angle in degrees between 0-360
 */
function convertDegAngleTo360Based(angle) {
    return (angle + 360) % 360;
}

/**
 * Converts an degrees angle to radians.
 *
 * @param  {float} angle in degree
 * @return {float} angle in radian
 * @see https://stackoverflow.com/a/45317121
 */
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Converts an radians angle to degrees.
 *
 * @param  {float} angle in degree
 * @return {float} angle in radian
 */
function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

export default {
    toFixedNumber,
    normalizeRadAngle,
    convertDegAngleTo360Based,
    degToRad,
    radToDeg,
    calcDegAngle,
    calcHypotenuse
}