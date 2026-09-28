// Demo core: torque from power and speed (OpenStax University Physics Vol. 1, 10.8).
const DemoCore = (function () {
  'use strict';
  function solve(inp) {
    const omega = inp.N * 2 * Math.PI / 60;          // rad/s
    const T = inp.P / omega;                          // N·m
    return { omega, T };
  }
  return { solve };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DemoCore;
