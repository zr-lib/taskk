const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');
const colors = require('colors');

/**
 * spawn执行任务
 * @param {TaskkConfig} config
 * @param {string} name
 * @param {string[]} tasks
 * @returns
 */
module.exports = function runTasks(config, name, tasks) {
  return new Promise((resolve, reject) => {
    spawnTask(config, name, tasks, 0, (result) => {
      if (result) resolve();
      else reject();
    });
  });
};

/**
 * spawn执行任务
 * @param {TaskkConfig} config
 * @param {string} name
 * @param {string[]} tasks
 * @param {number} index
 * @param {(result: boolean) => void} callback
 * @returns
 */
function spawnTask(config, name, tasks, index, callback) {
  const task = tasks[index];
  if (!task) return callback(false);

  const cwd = path.resolve(process.cwd(), config.projectsDir, name);
  if (!existsSync(cwd)) {
    console.warn(colors.yellow(`\n路径不存在: ${cwd}\n`));
    return callback(false);
  }

  // 默认spawn执行task
  const [cmd, ...args] = task.split(' ');
  const task_sp = spawn(cmd, args, { shell: true, stdio: config.spawnStdio, cwd });
  task_sp.on('error', (error) => {
    console.warn(error);
    callback(false);
  });
  task_sp.on('close', (code) => {
    if (code !== 0) return callback(false);
    if (index === tasks.length - 1) {
      callback(true);
    } else {
      spawnTask(config, name, tasks, index + 1, callback);
    }
  });
}
