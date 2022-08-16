const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

/**
 * 依赖安装处理
 * @param {string} name 项目名称
 * @param {TaskkConfig} config 配置项
 */
module.exports = function depsInstall(name, config) {
  const cwd = path.join(process.cwd(), name);
  if (!existsSync(cwd)) return Promise.reject();

  const [command, ...args] = config.deps_install.split(' ');
  return new Promise((resolve, reject) => {
    const task_sp = spawn(command, args, { shell: true, stdio: config.spawnStdio, cwd });
    task_sp.on('error', (data) => console.log(data));
    task_sp.on('close', (code) => {
      if (code !== 0) return reject();
      resolve();
    });
  });
};
