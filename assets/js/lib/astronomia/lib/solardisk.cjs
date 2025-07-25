'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('./base.cjs');
var nutation = require('./nutation.cjs');
var solar = require('./solar.cjs');

/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 * @module solardisk
 */

/**
 * Ephemeris returns the apparent orientation of the sun at the given jd.
 *
 * Results:
 *  P:  Position angle of the solar north pole.
 *  B0: Heliographic latitude of the center of the solar disk.
 *  L0: Heliographic longitude of the center of the solar disk.
 *
 * All results in radians.
 */
function ephemeris (jd, earth) { // (jd float64, e *pp.V87Planet)  (P, B0, L0 float64)
  const θ = (jd - 2398220) * 2 * Math.PI / 25.38;
  const I = 7.25 * Math.PI / 180;
  const K = 73.6667 * Math.PI / 180 +
    1.3958333 * Math.PI / 180 * (jd - 2396758) / base["default"].JulianCentury;

  const solarPos = solar["default"].trueVSOP87(earth, jd);
  const L = solarPos.lon;
  const R = solarPos.range;
  const [Δψ, Δε] = nutation["default"].nutation(jd);
  const ε0 = nutation["default"].meanObliquity(jd);
  const ε = ε0 + Δε;
  const λ = L - 20.4898 / 3600 * Math.PI / 180 / R;
  const λp = λ + Δψ;

  const [sλK, cλK] = base["default"].sincos(λ - K);
  const [sI, cI] = base["default"].sincos(I);

  const tx = -Math.cos(λp) * Math.tan(ε);
  const ty = -cλK * Math.tan(I);
  const P = Math.atan(tx) + Math.atan(ty);
  const B0 = Math.asin(sλK * sI);
  const η = Math.atan2(-sλK * cI, -cλK);
  const L0 = base["default"].pmod(η - θ, 2 * Math.PI);
  return [P, B0, L0]
}

/**
 * Cycle returns the jd of the start of the given synodic rotation.
 *
 * Argument c is the "Carrington" cycle number.
 *
 * Result is a dynamical time (not UT).
 */
function cycle (c) { // (c int)  (jde float64)
  const jde = 2398140.227 + 27.2752316 * c;
  const m = 281.96 * Math.PI / 180 + 26.882476 * Math.PI / 180 * c;
  const [s2m, c2m] = base["default"].sincos(2 * m);
  return jde + 0.1454 * Math.sin(m) - 0.0085 * s2m - 0.0141 * c2m
}

var solardisk = {
  ephemeris,
  cycle
};

exports.cycle = cycle;
exports["default"] = solardisk;
exports.ephemeris = ephemeris;
