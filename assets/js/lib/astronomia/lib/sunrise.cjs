'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('./base.cjs');
var eqtime = require('./eqtime.cjs');
var sexagesimal = require('./sexagesimal.cjs');
var solar = require('./solar.cjs');
var julian = require('./julian.cjs');
var rise = require('./rise.cjs');

/**
 * @copyright 2016 commenthol
 * @license MIT
 * @module sunrise
 */

const stdh0 = {
  sunrise:          new sexagesimal["default"].Angle(true, 0, 50, 0).rad(),
  sunriseEnd:       new sexagesimal["default"].Angle(true, 0, 18, 0).rad(),
  twilight:         new sexagesimal["default"].Angle(true, 6, 0, 0).rad(),
  nauticalTwilight: new sexagesimal["default"].Angle(true, 12, 0, 0).rad(),
  night:            new sexagesimal["default"].Angle(true, 18, 0, 0).rad(),
  goldenHour:       new sexagesimal["default"].Angle(false, 6, 0, 0).rad()
};

const stdh0Sunrise = (refraction) => rise["default"].refraction(stdh0.sunrise, refraction);
const stdh0SunriseEnd = (refraction) => rise["default"].refraction(stdh0.sunriseEnd, refraction);
const stdh0Twilight = (refraction) => rise["default"].refraction(stdh0.twilight, refraction);
const stdh0NauticalTwilight = (refraction) => rise["default"].refraction(stdh0.nauticalTwilight, refraction);
const stdh0Night = (refraction) => rise["default"].refraction(stdh0.night, refraction);
const stdh0GoldenHour = (refraction) => rise["default"].refraction(stdh0.goldenHour, refraction);

class Sunrise {
  /**
   * Computes time of sunrise, sunset for a given day `date` of an observer on earth given by latitude and longitude.
   * Methods may return `undefined` instead of `julian.Calendar` for latitudes very near the poles.
   * @param {julian.Calendar} date - calendar date
   * @param {number} lat - latitude of observer in the range of (-89.6, 89.6)
   * @param {number} lon - longitude of observer (measured positively westwards, New York = 40.7° lat, 74° lon)
   * @param {number} [refraction] - optional refraction
   */
  constructor (date, lat, lon, refraction) {
    this.date = date;
    this.jde = date.midnight().toJDE();
    this.lat = sexagesimal["default"].angleFromDeg(lat);
    this.lon = sexagesimal["default"].angleFromDeg(lon);
    this.refraction = refraction;
  }

  _calcNoon (jde) {
    const etime = sexagesimal["default"].secFromHourAngle(eqtime["default"].eSmart(jde));
    const delta = sexagesimal["default"].secFromHourAngle(this.lon);
    const time = 43200 /* noon */ + delta - etime; // in seconds
    return base["default"].pmod(time / 86400, 86400)
  }

  _calcRiseOrSet (jde, h0, isSet) {
    const etime = sexagesimal["default"].secFromHourAngle(eqtime["default"].eSmart(jde));
    const solarDec = solar["default"].apparentEquatorial(jde).dec;
    let ha = rise["default"].hourAngle(this.lat, h0, solarDec);
    if (isSet) ha = -ha;
    const delta = sexagesimal["default"].secFromHourAngle(ha - this.lon);
    const time = 43200 /* noon */ - delta - etime; // in seconds
    return time / 86400
  }

  _calcPolarDayNight (h0, isSet, step) {
    let jde = this.jde;
    let t;
    let failCnt = 0;
    while (failCnt < 190) { // a bit more than days of half a year
      jde += step;
      try {
        t = this._calcRiseOrSet(jde, h0, isSet);
        t = this._calcRiseOrSet(jde + t, h0, isSet);
        break
      } catch (e) {
        t = undefined;
        failCnt++;
      }
    }
    if (t === undefined) {
      return
    }
    return new julian["default"].Calendar().fromJDE(jde + t)
  }

  _calc (h0, isSet) {
    let t;
    const jde = this.jde;
    // calc 2times for higher accuracy
    try {
      t = this._calcRiseOrSet(jde, h0, isSet);
      t = this._calcRiseOrSet(jde + t, h0, isSet);
      return new julian["default"].Calendar().fromJDE(jde + t)
    } catch (e) {
      let step = (isSet ? -1 : 1);
      const doy = this.date.dayOfYear();
      if ( // overlap with march, september equinoxes
        (this.lat > 0 && (doy > 76 && doy < 267)) || // northern hemisphere
        (this.lat < 0 && (doy < 83 || doy > 262)) // southern hemisphere
      ) {
        step = -step;
      }
      return this._calcPolarDayNight(h0, isSet, step)
    }
  }

  /**
   * time of solar transit
   * @return {julian.Calendar} time of noon
   */
  noon () {
    const jde = this.jde;
    // calc 2times for higher accuracy
    let t = this._calcNoon(jde + this.lon / (2 * Math.PI));
    t = this._calcNoon(jde + t);
    return new julian["default"].Calendar().fromJDE(jde + t)
  }

  /**
   * Solar limb appears over the easter horizon in the morning
   * @return {julian.Calendar} time of sunrise
   */
  rise () {
    return this._calc(stdh0Sunrise(this.refraction), false)
  }

  /**
   * @return {julian.Calendar} time of sunset
   * Solar limb disappears on the western horizon in the evening
   */
  set () {
    return this._calc(stdh0Sunrise(this.refraction), true)
  }

  /**
   * Solar limb is fully visible at the easter horizon
   * @return {julian.Calendar} time of sunrise end
   */
  riseEnd () {
    return this._calc(stdh0SunriseEnd(this.refraction), false)
  }

  /**
   * Solar limb starts disappearing on the western horizon in the evening
   * @return {julian.Calendar} time of sunset start
   */
  setStart () {
    return this._calc(stdh0SunriseEnd(this.refraction), true)
  }

  /**
   * Dawn, there is still enough light for objects to be distinguishable,
   * @return {julian.Calendar} time of dawn
   */
  dawn () {
    return this._calc(stdh0Twilight(this.refraction), false)
  }

  /**
   * Dusk, there is still enough light for objects to be distinguishable
   * Bright stars and planets are visible by naked eye
   * @return {julian.Calendar} time of dusk
   */
  dusk () {
    return this._calc(stdh0Twilight(this.refraction), true)
  }

  /**
   * nautical dawn - Horizon gets visible by naked eye
   * @return {julian.Calendar} time of nautical dawn
   */
  nauticalDawn () {
    return this._calc(stdh0NauticalTwilight(this.refraction), false)
  }

  /**
   * nautical dusk - Horizon is no longer visible by naked eye
   * @return {julian.Calendar} time of nautical dusk
   */
  nauticalDusk () {
    return this._calc(stdh0NauticalTwilight(this.refraction), true)
  }

  /**
   * night starts - No sunlight illumination of the sky, such no intereferance
   * with astronomical observations.
   * @return {julian.Calendar} time of start of night
   */
  nightStart () {
    return this._calc(stdh0Night(this.refraction), true)
  }

  /**
   * night end - Sunlight starts illumination of the sky and interferes
   * with astronomical observations.
   * @return {julian.Calendar} time of end of night
   */
  nightEnd () {
    return this._calc(stdh0Night(this.refraction), false)
  }

  /**
   * Start of "golden hour" before sunset
   * @return {julian.Calendar} time of start of golden hour
   */
  goldenHourStart () {
    return this._calc(stdh0GoldenHour(this.refraction), true)
  }

  /**
   * End of "golden hour" after sunrise
   * @return {julian.Calendar} time of end of golden hour
   */
  goldenHourEnd () {
    return this._calc(stdh0GoldenHour(this.refraction), false)
  }
}

var sunrise = {
  Sunrise
};

exports.Sunrise = Sunrise;
exports["default"] = sunrise;
