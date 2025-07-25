'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('./base.cjs');
var interpolation = require('./interpolation.cjs');
var deltat$1 = require('./data/deltat.cjs');

/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module deltat
 */

// avoids ciclic import { LeapYearGregorian } from './julian.js'
function LeapYearGregorian (y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

/**
 * deltaT returns the difference ΔT = TD - UT between Dynamical Time TD and
 * Univeral Time (GMT+12) in seconds
 *
 * Polynoms are from <http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html>
 * and <http://www.staff.science.uu.nl/~gent0113/deltat/deltat_old.htm>
 *
 * @param {Number} dyear - decimal year
 * @returns {Number} ΔT in seconds.
 */
function deltaT (dyear) {
  let ΔT;
  if (dyear < -500) {
    ΔT = base["default"].horner((dyear - 1820) * 0.01, -20, 0, 32);
  } else if (dyear < 500) {
    ΔT = base["default"].horner(dyear * 0.01,
      10583.6, -1014.41, 33.78311, -5.952053, -0.1798452, 0.022174192, 0.0090316521
    );
  } else if (dyear < 1600) {
    ΔT = base["default"].horner((dyear - 1000) * 0.01,
      1574.2, -556.01, 71.23472, 0.319781, -0.8503463, -0.005050998, 0.0083572073
    );
  } else if (dyear < deltat$1["default"].historic.first) {
    ΔT = base["default"].horner((dyear - 1600), 120, -0.9808, -0.01532, 1 / 7129);
  } else if (dyear < deltat$1["default"].data.first) {
    ΔT = interpolate(dyear, deltat$1["default"].historic);
  } else if (dyear < deltat$1["default"].data.last - 0.25) { // -0.25 ~= do not consider last 3 months in dataset
    ΔT = interpolateData(dyear, deltat$1["default"].data);
  } else if (dyear < deltat$1["default"].prediction.last) {
    ΔT = interpolate(dyear, deltat$1["default"].prediction);
  } else if (dyear < 2050) {
    ΔT = base["default"].horner((dyear - 2000) / 100, 62.92, 32.217, 55.89);
  } else if (dyear < 2150) {
    ΔT = base["default"].horner((dyear - 1820) / 100, -205.72, 56.28, 32);
  } else {
    const u = (dyear - 1820) / 100;
    ΔT = -20 + 32 * u * u;
  }
  return ΔT
}

/**
 * interpolation of dataset
 * @private
 * @param {Number} dyear - julian year
 * @returns {Number} ΔT in seconds.
 */
function interpolate (dyear, data) {
  const d3 = interpolation["default"].len3ForInterpolateX(dyear,
    data.first, data.last, data.table
  );
  return d3.interpolateX(dyear)
}

/**
 * interpolation of dataset from finals2000A with is one entry per month
 * linear interpolation over whole dataset is inaccurate as points per month
 * are not equidistant. Therefore points are approximated using 2nd diff. interpolation
 * from current month using the following two points
 *
 * @private
 * @param {Number} dyear - julian year
 * @returns {Number} ΔT in seconds.
 */
function interpolateData (dyear, data) {
  const [fyear, fmonth] = data.firstYM;
  const { year, month, first, last } = monthOfYear(dyear);
  const pos = 12 * (year - fyear) + (month - fmonth);
  const table = data.table.slice(pos, pos + 3);
  const d3 = new interpolation["default"].Len3(first, last, table);
  return d3.interpolateX(dyear)
}

/**
 * Get month of Year from fraction. Fraction differs at leap years.
 * @private
 * @param {Number} dyear - decimal year
 * @return {Object} `{year: Number, month: Number, first: Number, last}`
 */
function monthOfYear (dyear) {
  // if (!monthOfYear.data) { // memoize yearly fractions per month
  //   monthOfYear.data = { 0: [], 1: [] }
  //   for (let m = 0; m <= 12; m++) {
  //     monthOfYear.data[0][m] = new Calendar(1999, m, 1).toYear() - 1999 // non leap year
  //     monthOfYear.data[1][m] = new Calendar(2000, m, 1).toYear() - 2000 // leap year
  //   }
  // }
  // console.log(monthOfYear)
  const year = dyear | 0;
  const f = dyear - year;
  const d = LeapYearGregorian(year) ? 1 : 0;
  const data = monthOfYear.data[d];

  let month = 12; // TODO loop could be improved
  while (month > 0 && data[month] > f) {
    month--;
  }
  const first = year + data[month];
  const last = month < 11 ? year + data[month + 2] : year + 1 + data[(month + 2) % 12];
  return { year, month, first, last }
}
/**
  monthOfYear.data[0][m] = new Calendar(1999, m, 1).toYear() - 1999 // non leap year
  monthOfYear.data[1][m] = new Calendar(2000, m, 1).toYear() - 2000 // leap year
 */
monthOfYear.data = [
  [ // non leap year
    0,
    0,
    0.08493150684921602,
    0.16164383561635987,
    0.24657534246580326,
    0.3287671232876619,
    0.4136986301368779,
    0.4958904109589639,
    0.5808219178081799,
    0.6657534246576233,
    0.747945205479482,
    0.832876712328698,
    0.915068493150784
  ],
  [ // leap year
    0,
    0,
    0.08743169398917416,
    0.1639344262296163,
    0.24863387978143692,
    0.3306010928961314,
    0.4153005464481794,
    0.49726775956287383,
    0.5819672131146945,
    0.6666666666667425,
    0.7486338797814369,
    0.8333333333332575,
    0.9153005464481794
  ]
];

var deltat = {
  deltaT
};

exports["default"] = deltat;
exports.deltaT = deltaT;
