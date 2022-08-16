const path = require('path');
const child_process = require('child_process');
const colors = require('colors');
const killChildProcess = require('./tasks/kill-child-process.js');
const copyDist = require('./tasks/copy-dist.js');
require('../types/index.js');

const main_pid = process.pid;
let hasKillRun = false;

/**
 * 主进程执行
 * @param {TaskkConfig} config
 * @param {ProjectItem[]} projects
 * @param {(task_results: TaskResult[]) => void} cb 全部构建完后执行
 */
module.exports = function main_task(config, projects, cb) {
  const task_results = [];

  projects.forEach(async (project_item) => {
    const worker = child_process.fork(path.resolve(__dirname, './workers/project-task.js'));
    worker.on('message', (e) => {
      if (e.type === 'ready') worker.send({ ...project_item, config });
      if (e.type === 'update_node_modules_cache') {
        process.nextTick(() => updateDepsCache(project_item.name, config));
      }
      if (e.type === 'done') projectWorkerDone(worker, e);
    });
    worker.on('close', () => worker.kill());
  });

  /**
   * project-worker进程结束处理
   * @param {Worker} worker
   * @param {TaskResult} task_result
   */
  function projectWorkerDone(worker, task_result) {
    task_results.push(task_result);
    // console.log(`\n${project_item.name} 工作进程 ${worker.pid} 已退出\n`);
    if (!hasKillRun && !task_result.succeed) {
      // 构建失败，杀掉主进程的所有子孙进程
      if (config.errorToExit) {
        hasKillRun = true;
        console.warn(colors.red(`\n${task_result.name} 执行失败，将结束所有任务\n`));
        killChildProcess(main_pid);
        return;
      }
    }
    // console.log('\n', task_results);
    if (task_results.length === projects.length) {
      const failedTasks = task_results.filter((item) => !item.succeed);
      if (!config.errorToExit && failedTasks.length) {
        console.warn(colors.red(`\n${failedTasks.map((i) => i.name).join(', ')}执行失败\n`));
        process.exit(1);
      } else {
        // 构建结束
        if (config.projectsDist) copyDist(config, projects);
        cb(task_results);
      }
    }
    worker && worker.kill();
  }
};

/**
 * 更新node_modules缓存
 * @param {string} name
 * @param {TaskkConfig} config
 */
function updateDepsCache(name, config) {
  if (!config.cache_cwd || !config.node_modules) return;
  const worker = child_process.fork(path.resolve(__dirname, './workers/update-cache.js'));
  worker.on('message', (e) => {
    if (e.type === 'ready') worker.send({ name, config });
    if (e.type === 'done') worker.kill();
  });
  worker.on('close', () => worker.kill());
}
