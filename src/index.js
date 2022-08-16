const path = require('path');
const { existsSync } = require('fs');
const colors = require('colors');
const main_task = require('./main-task.js');
require('../types/index.js');

/**
 * 默认配置
 * @type {TaskkConfig}
 */
const baseConfig = {
  cache_cwd: '',
  deps_install: '',
  node_modules: false,
  spawnStdio: 'inherit',
  errorToExit: false,
  forceUpdateCache: false,
  projectsDist: '',
};

module.exports = function taskk() {
  const taskkTool = path.resolve(process.cwd(), 'taskk-tool.js');
  if (!existsSync(taskkTool)) {
    console.warn(colors.yellow('请先在项目根目录创建taskk-tool.js!\n'));
    process.exit(1);
  }
  const { get_config, run_all_done } = require(taskkTool);

  if (typeof get_config !== 'function') {
    const txt = 'get_config is not a function, 请检查配置文件taskk-tool.js';
    console.warn(colors.yellow(txt), '\n');
    process.exit(1);
  }
  const { config, projects } = get_config();
  if (!Array.isArray(projects)) {
    console.warn(colors.yellow('projects is not Array! 请检查配置文件taskk-tool.js!\n'));
    process.exit(1);
  }
  console.log('config: \n', config);
  console.log('projects: ');
  console.table(projects);

  const currentConfig = Object.assign({}, baseConfig, config || {});
  main_task(currentConfig, projects, (task_results) => {
    run_all_done && run_all_done(task_results);
  });
};
