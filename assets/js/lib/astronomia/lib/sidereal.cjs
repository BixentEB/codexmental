'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('./base.cjs');
var nutation = require('./nutation.cjs');

/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module sidereal
 */

/**
 * JDToCFrac returns values for use in computing sidereal time at Greenwich.
 *
 * Cen is centuries from J2000 of the JD at 0h UT of argument jd.  This is
 * the value to use for evaluating the IAU sidereal time polynomial.
 * DayFrac is the fraction of jd after 0h UT.  It is used to compute the
 * final value of sidereal time.
 *
 * @param {number} jd - Julian Days
 * @return {number[]} [century, fraction] century and fraction of jd after 0h UT
 */
function JDToCFrac (jd) {
  const [j0, f] = base["default"].modf(jd + 0.5);
  return [base["default"].J2000Century(j0 - 0.5), f] // (cen, dayFrac /* float */)
}

/**
 * iau82 is a polynomial giving mean sidereal time at Greenwich at 0h UT.
 *
 * The polynomial is in centuries from J2000.0, as given by JDToCFrac.
 * Coefficients are those adopted in 1982 by the International Astronomical
 * Union and are given in (12.2) p. 87.
 */
const iau82 = [24110.54841, 8640184.812866, 0.093104, -0.0000062];

/**
 * Mean returns mean sidereal time at Greenwich for a given JD.
 *
 * Computation is by IAU 1982 coefficients.  The result is in seconds of
 * time and is in the range [0,86400).
 *
 * @param {number} jd - Julian Days
 * @return {number}
 */
function mean (jd) {
  return base["default"].pmod(_mean(jd), 86400)
}

/**
 * @private
 */
function _mean (jd) {
  const [s, f] = _mean0UT(jd);
  return s + f * 1.00273790935 * 86400
}

/**
 * Mean0UT returns mean sidereal time at Greenwich at 0h UT on the given JD.
 *
 * The result is in seconds of time and is in the range [0,86400).
 *
 * @param {number} jd - Julian Days
 * @return {number}
 */
function mean0UT (jd /* float */) {
  const [s, _] = _mean0UT(jd); // eslint-disable-line
  return base["default"].pmod(s, 86400)
}

/**
 * @private
 */
function _mean0UT (jd /* float */) {
  const [cen, f] = JDToCFrac(jd);
  // (12.2) p. 87
  return [base["default"].horner(cen, ...iau82), f] // (sidereal, dayFrac /* float */)
}

/**
 * Apparent returns apparent sidereal time at Greenwich for the given JD.
 *
 * Apparent is mean plus the nutation in right ascension.
 *
 * The result is in seconds of time and is in the range [0,86400).
 *
 * @param {number} jd - Julian Days
 * @return {number}
 */
function apparent (jd) {
  const s = _mean(jd); // seconds of time
  const n = nutation["default"].nutationInRA(jd); // angle (radians) of RA
  const ns = n * 3600 * 180 / Math.PI / 15; // convert RA to time in seconds
  return base["default"].pmod(s + ns, 86400)
}

/**
 * Apparent0UT returns apparent sidereal time at Greenwich at 0h UT
 * on the given JD.
 *
 * The result is in seconds of time and is in the range [0,86400).
 *
 * @param {number} jd - Julian Days
 * @return {number}
 */
function apparent0UT (jd) {
  const [j0, f] = base["default"].modf(jd + 0.5);
  const cen = (j0 - 0.5 - base["default"].J2000) / 36525;
  const s = base["default"].horner(cen, ...iau82) + f * 1.00273790935 * 86400;
  const n = nutation["default"].nutationInRA(j0); // angle (radians) of RA
  const ns = n * 3600 * 180 / Math.PI / 15; // convert RA to time in seconds
  return base["default"].pmod(s + ns, 86400)
}

var sidereal = {
  JDToCFrac,
  iau82,
  mean,
  mean0UT,
  apparent,
  apparent0UT
};

exports.JDToCFrac = JDToCFrac;
exports.apparent = apparent;
exports.apparent0UT = apparent0UT;
exports["default"] = sidereal;
exports.iau82 = iau82;
exports.mean = mean;
exports.mean0UT = mean0UT;
