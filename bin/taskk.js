#!/usr/bin/env node

const figlet = require('figlet');
const colors = require('colors');
const taskk = require('../src/index.js');
const { name, version } = require('../package.json');

(function () {
  figlet(name.toUpperCase(), function (err, data) {
    if (err) throw err;

    console.log(data, colors.cyan(`${name} | v${version}`));
    console.log(`[${new Date().toLocaleString()}]`);
    console.log(`[${process.cwd()}]\n`);

    try {
      taskk();
    } catch (err) {
      console.error(err);
    }
  });
})();
