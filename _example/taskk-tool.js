const path = require('path');
const { exec } = require('child_process');
const { writeFile } = require('fs');
const colors = require('colors');
require('../types/index.js');

const start = new Date();

/**
 * 配置信息
 * @type {TaskkConfig}
 */
const config = {
  spawnStdio: 'ignore',
  node_modules: true,
  deps_install: 'npm install --registry=http://registry.npmmirror.com',
  cache_cwd: path.join(process.cwd(), '_example-cache'),
  projectsDist: path.resolve(process.cwd(), '_example-dist'),
  // forceUpdateCache: true,
  // errorToExit: true,
};

/**
 * @type {ProjectItem[]}
 */
const projects_build_dev = [
  { name: 'my-vue-app', tasks: ['npm run build:dev'], output: 'dist' },
  { name: 'my-react-app', tasks: ['npm run build:dev'], output: 'build' },
];
const projects_build_prod = [
  { name: 'my-vue-app', tasks: ['npm run build:prod'], output: 'dist' },
  { name: 'my-react-app', tasks: ['npm run build:prod'], output: 'build' },
];

/**
 * 获取配置的方法
 * @returns {{config: TaskkConfig, projects: ProjectItem[]}}
 */
exports.get_config = function get_config() {
  if (process.env.BUILD_ENV === 'dev') {
    return { config, projects: projects_build_dev };
  }
  return { config, projects: projects_build_prod };
};

/**
 * 构建结束后执行
 * @description errorToExit: true时不执行，此时某一个执行失败将会杀掉所有相关子进程
 * @param {TaskResult[]} task_results 执行结果
 */
exports.run_all_done = function run_all_done(task_results) {
  console.log(`\n开始时间: ${start}\n结束时间: ${new Date()}\n`);
  if (task_results.every((i) => i.succeed)) {
    console.log(colors.cyan('====== build_done ======\n'));
    // genVERSION(config);
  } else {
    console.warn(colors.red('====== 构建失败 ======\n'));
  }
};

/**
 * 生成构建信息，包含构建时间、构建分支、代码commit等信息
 * @param {TaskkConfig} config
 */
function genVERSION(config) {
  if (!config.projectsDist) return;
  const command =
    'date "+%Y/%m/%d %H:%M:%S" && node -v && git symbolic-ref --short -q HEAD && git rev-parse HEAD';
  exec(command, (err, stdout) => {
    if (err) throw err;
    const [DATE, NODEVER, BRANCH, COMMIT] = stdout.split('\n');
    const output = `\nVERSION\nDATE: ${DATE}\nNODEVER: ${NODEVER}\nBRANCH: ${BRANCH}\nCOMMIT: ${COMMIT}\n`;
    console.log(output);
    const VERSION = path.resolve(__dirname, config.projectsDist, 'VERSION.md');
    writeFile(VERSION, output, (err) => {
      if (err) throw err;
    });
  });
}
