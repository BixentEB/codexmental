'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module stellar
 */
/**
 * Stellar: Chapter 56, Stellar Magnitudes.
 */

/**
 * Sum returns the combined apparent magnitude of two stars.
 */
function sum (m1, m2) { // (m1, m2 float64)  float64
  const x = 0.4 * (m2 - m1);
  return m2 - 2.5 * Math.log10(Math.pow(10, x) + 1)
}

/**
 * SumN returns the combined apparent magnitude of a number of stars.
 */
function sumN (m) { // (m ...float64)  float64
  let s = 0;
  for (const mi of m) {
    s += Math.pow(10, -0.4 * mi);
  }
  return -2.5 * Math.log10(s)
}

/**
 * Ratio returns the brightness ratio of two stars.
 *
 * Arguments m1, m2 are apparent magnitudes.
 */
function ratio (m1, m2) { // (m1, m2 float64)  float64
  const x = 0.4 * (m2 - m1);
  return Math.pow(10, x)
}

/**
 * Difference returns the difference in apparent magnitude of two stars
 * given their brightness ratio.
 */
function difference (ratio) { // (ratio float64)  float64
  return 2.5 * Math.log10(ratio)
}

/**
 * AbsoluteByParallax returns absolute magnitude given annual parallax.
 *
 * Argument m is apparent magnitude, π is annual parallax in arc seconds.
 */
function absoluteByParallax (m, π) { // (m, π float64)  float64
  return m + 5 + 5 * Math.log10(π)
}

/**
 * AbsoluteByDistance returns absolute magnitude given distance.
 *
 * Argument m is apparent magnitude, d is distance in parsecs.
 */
function absoluteByDistance (m, d) { // (m, d float64)  float64
  return m + 5 - 5 * Math.log10(d)
}

var stellar = {
  sum,
  sumN,
  ratio,
  difference,
  absoluteByParallax,
  absoluteByDistance
};

exports.absoluteByDistance = absoluteByDistance;
exports.absoluteByParallax = absoluteByParallax;
exports["default"] = stellar;
exports.difference = difference;
exports.ratio = ratio;
exports.sum = sum;
exports.sumN = sumN;
