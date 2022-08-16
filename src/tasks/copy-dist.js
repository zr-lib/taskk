const { execSync, spawnSync } = require('child_process');
const { existsSync, mkdirSync } = require('fs');
const path = require('path');
const colors = require('colors');

/**
 * 复制project.dist构建输出目录到外部路径config.projectsDist下
 * @param {TaskkConfig} config
 * @param {ProjectItem[]} projects
 */
module.exports = function copyDist(config, projects) {
  if (existsSync(config.projectsDist)) execSync(`rm -rf ${config.projectsDist}`);
  mkdirSync(config.projectsDist);

  const projects_cwd = process.cwd();
  console.log(colors.blue(`\nprojectsDist => [${config.projectsDist}] => start\n`));
  try {
    const success = projects.every((item) => {
      if (!item.output) return true;

      const item_dist = path.resolve(item.name, item.output);
      if (!existsSync(item_dist)) {
        console.warn(colors.yellow(`${item_dist} 不存在!!`));
        return false;
      }

      const target_dist = path.resolve(config.projectsDist, item.name);
      console.log(`${item_dist}\n${target_dist}\n`);

      const [cp_command, ...cp_args] = `cp -r ${item_dist}/ ${target_dist}`.split(' ');
      spawnSync(cp_command, cp_args, { cwd: projects_cwd, shell: true, stdio: config.spawnStdio });
      return true;
    });

    if (success) console.log(colors.green(`projectsDist => [${config.projectsDist}] => done\n`));
    else console.log(colors.red(`\nprojectsDist => [${config.projectsDist}] => failed\n`));
  } catch (err) {
    console.log(colors.red(`\nprojectsDist => [${config.projectsDist}] => failed\n`));
    throw err;
  }
};
