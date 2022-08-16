# taskk

中文 | [English](./README.md)

多进程执行多项目+项目tasks顺序执行

> TODO: 代码运行图

最简单的`projects`配置如下

```js
const projects_build_prod = [
  { name: 'my-vue-app', tasks: ['npm run build:prod'] },
  { name: 'my-react-app', tasks: ['npm run build:prod'] },
];
```

> `projects`每个`item`之间是相互独立的**多进程并行执行**，每个`item`下的`tasks`**按顺序同步执行**


## 前置

终端或者`git bash`执行

`node >= 10`


## 安装

- 局部安装

```shell
npm i -D taskk
```

然后配置`npm scripts`执行`taskk`，可见`_example`案例

```json
  "scripts": {
    "build:prod": "cross-env BUILD_ENV=prod taskk"
  }
```

- 全局安装

```shell
npm i -g taskk
```

这个就不需要在`npm scripts`配置执行`taskk`，全局都有`taskk`


## 功能

- 使用简单: 按要求提供一个`taskk-tool.js`文件，全局安装后可在终端执行`taskk`
- 动态配置: `taskk-tool.js`->`get_config函数`返回`config/projects`
- 多进程执行: `child_process.fork`创建子进程；`projects`的子项`item.tasks`顺序执行
- 依赖安装管理: `config.deps_install`，检测`package.json`更新，重新下载依赖（在`config.cache_cwd`有效时起作用）
- node_modules缓存管理: `config.node_modules`，处理`node_modules`缓存与备份等（在`config.cache_cwd`有效时起作用）
- 任一tasks执行失败处理: `config.errorToExit: true`，需要全部成功才是为成功时可启用，将杀死主进程的所有子孙进程，退出所有任务
- 纯净执行: `config.spawnStdio: 'ignore'`，此时`item.tasks`的执行将不会打印内容，只有少量流程相关内容打印
- 执行时间统计: 打印`projects`的子项`item.tasks`全部执行完的时间
- 统一输出: 方便将`projects`所有子项的构建产物`item.output`，复制到外部指定路径`config.projectsDist`
- 执行完成的回调`run_all_done`: `taskk-tool.js`->`run_all_done函数`将在正常执行后调用


## 参数说明

可以手动`require('taskk/types/index.js')`，然后`jsDoc`语法注释时可用

- `TaskkConfig`: config 配置信息类型

| 字段             | 类型               | 必填项 | 默认值       | 说明 |
| ---------------- | ----------------- | ----- | ----------- | --------------------------------------- |
| cache_cwd        | string            | 否    | ""          | 缓存路径，不包含name；与`deps_install`/`node_modules`结合使用 |
| deps_install     | string            | 否    | ""          | 依赖安装命令，如`npm install`/`yarn`/`pnpm install`等；检测`package.json`更新，重新下载依赖；不配置的话，需要手动下载依赖，或者在`tasks`添加依赖下载命令；`cache_cwd`有效时起作用； |
| node_modules     | boolean           | 否    | false       | `cache_cwd`有效时起作用；处理`node_modules`缓存与备份等 |
| spawnStdio       | inherit \| ignore | 否    | inherit     | `spawn`执行`tasks`任务的输出方式(`option.stdio`)；`ignore`则不会打印`tasks执行任务`的输出，此时只有少量的流程提示打印 |
| errorToExit      | boolean           | 否    | false       | `true`时，任一个 `tasks` 执行失败则会杀死主进程的所有子孙进程；`run_all_done`**不会执行** |
| projectsDist     | string            | 否    | ""          | 全部执行完成后，`projects`每个 item 的`output`都会复制到这里来 |
| forceUpdateCache | boolean           | 否    | false       | 有时候`node_modules`从缓存目录解压不报错，但是项目跑不起来时，此时可以**手动启用**；将删除缓存重新下载依赖后更新缓存（记住成功后需要**关掉**，否则后续缓存将**不起作用**！！！） |

- `ProjectItem`: projects 每一个 item 类型

| 字段   | 类型    | 必填项  | 说明 |
| ------ | ------ | ------ | ------------------------------------------------ |
| name   | string | 是     | 与项目文件夹名保持一致，执行`shell`命令时需要获取`cwd`   |
| tasks  | string | 是     | 需要执行的`shell`命令列表                            |
| output | string | 否     | 执行构建输出的目录名，与`config.projectsDist`结合使用  |

- `TaskResult`: 执行结果

| 字段     | 类型    | 说明              |
| ------- | ------- | ---------------- |
| type    | string  | 任务的执行阶段标记  |
| name    | string  | 项目名称          |
| succeed | boolean | 是否成功          |


## 使用

一般用于多项目构建管理，有如下目录结构：

```
.
├── my-react-app
├── my-vue-app
├── package.json
└── taskk-tool.js
```

其中`my-react-app`, `my-vue-app`是两个独立的项目，`taskk-tool.js` 是配置文件

### 配置文件

多项目顶层文件夹下，新建文件`taskk-tool.js`，需要导出几个数据：

- get_config: `() => {config, projects}`
  - config `TaskkConfig`: 配置信息，可看**参数说明**
  - projects `ProjectItem[]`: 多项目配置，可看**参数说明**
- run_all_done: `(task_results: TaskResult[]) => void`
  - 全部执行正常后执行
  - `config.errorToExit: true` 时将不会调用


以下为`config.spawnStdio: 'ignore'`时的输出：

```shell
xxx@xxxdeMacBook-Pro _example $ taskk
  _____  _    ____  _  ___  __
 |_   _|/ \  / ___|| |/ / |/ /
   | | / _ \ \___ \| ' /| ' / 
   | |/ ___ \ ___) | . \| . \ 
   |_/_/   \_\____/|_|\_\_|\_\
                               taskk | v0.1.0
[2022/8/16 下午4:31:42]
[/Users/xxx/Desktop/FE/taskk/_example]

config: 
 {
  spawnStdio: 'ignore',
  deps_install: 'npm install --registry=http://registry.npmmirror.com',
  cache_cwd: '/Users/xxx/Desktop/FE/taskk/_example/_example-cache',
  projectsDist: '/Users/xxx/Desktop/FE/taskk/_example/_example-dist'
}
projects: 
┌─────────┬────────────────┬──────────────────────────┬─────────┐
│ (index) │      name      │          tasks           │ output  │
├─────────┼────────────────┼──────────────────────────┼─────────┤
│    0    │  'my-vue-app'  │ [ 'npm run build:prod' ] │ 'dist'  │
│    1    │ 'my-react-app' │ [ 'npm run build:prod' ] │ 'build' │
└─────────┴────────────────┴──────────────────────────┴─────────┘
[my-react-app] => ["npm run build:prod"] => start
[my-vue-app] => ["npm run build:prod"] => start

[my-vue-app] => ["npm run build:prod"] => done, used:3.981s

[my-react-app] => ["npm run build:prod"] => done, used:6.421s

projectsDist => [/Users/xxx/Desktop/FE/taskk/_example/_example-dist] => start

/Users/xxx/Desktop/FE/taskk/_example/my-vue-app/dist
/Users/xxx/Desktop/FE/taskk/_example/_example-dist/my-vue-app

/Users/xxx/Desktop/FE/taskk/_example/my-react-app/build
/Users/xxx/Desktop/FE/taskk/_example/_example-dist/my-react-app

projectsDist => [/Users/xxx/Desktop/FE/taskk/_example/_example-dist] => done


开始时间: Tue Aug 16 2022 16:31:42 GMT+0800 (中国标准时间)
结束时间: Tue Aug 16 2022 16:31:49 GMT+0800 (中国标准时间)

====== build_done ======

```

`taskk-tool.js`文件内容大致如下：

```js
// _example\taskk-tool.js
const path = require('path');
const { exec } = require('child_process');
const { writeFile } = require('fs');
const colors = require('colors');
require('taskk/types/index.js');

const start = new Date();

/**
 * 配置信息
 * @type {TaskkConfig}
 */
const config = {
  spawnStdio: 'ignore',
  // node_modules: true,
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
  } else {
    console.warn(colors.red('====== 构建失败 ======\n'));
  }
};
```


## 结尾

到此结束
