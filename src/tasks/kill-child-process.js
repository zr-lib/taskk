/**
 * @file 根据pid查找子孙进程并kill掉
 */

const { exec } = require('child_process');
const { writeFile, existsSync, unlinkSync } = require('fs');

const logFile = 'ps-f__child.log';
if (existsSync(logFile)) unlinkSync(logFile);

/**
 * 根据pid杀掉所有子孙进程
 * @param {string} pid
 * @returns
 */
module.exports = function killChildProcess(pid) {
  // windows
  if (process.platform === 'win32') {
    return exec(`taskkill -t -f -pid ${pid}`, (err, stdout) => {
      if (err) throw err;
      console.log(stdout);
    });
  }
  // unix
  exec('ps -f', (err, stdout) => {
    if (err) throw err;
    const rawProcessList = stdout.split('\n');
    const child = getChildByPid(rawProcessList, `${pid}`);
    if (!child.length) return;
    try {
      writeFile(logFile, JSON.stringify(child, null, 2), { encoding: 'utf-8' }, () => {});
      // 杀进程的时候要从最远的开始
      child.reverse().forEach((item) => {
        if (item.CMD === 'ps -f') return;
        const result = process.kill(Number(item.PID), 'SIGKILL');
        console.log('kill', item.PID, result);
      });
    } catch (err) {
      throw err;
    }
  });
};

// rawProcessList: [
//   '  UID   PID  PPID   C STIME   TTY           TIME CMD',
//   '  501   537   533   0  3:18PM ttys000    0:00.12 -bash',
//   '  501 27212   537   0  2:49PM ttys000    0:00.36 npm  ',
//   '',
// ];

/**
 * @typedef {Object} ProcessItem 格式化的进程数据
 * @property {string} UID UID
 * @property {string} PID PID
 * @property {string} PPID PPID
 * @property {string} C C
 * @property {string} STIME STIME
 * @property {string} TTY TTY
 * @property {string} TIME TIME
 * @property {string} CMD CMD
 */

/**
 * 查找子孙进程
 * @param {string[]} rawProcessList
 * @param {string} pid
 * @returns {ProcessItem[]} childs
 */
function getChildByPid(rawProcessList, pid) {
  /** @type {ProcessItem[]} processList */
  const processList = rawProcessList.reduce((acc, cur) => {
    const [UID, PID, PPID, C, STIME, TTY, TIME, ...CMD] = cur.split(' ').filter(Boolean);
    if (UID && UID !== 'UID') acc.push({ UID, PID, PPID, C, STIME, TTY, TIME, CMD: CMD.join(' ') });
    return acc;
  }, []);
  /**
   * @param {ProcessItem[]} acc
   * @param {string} ppid
   * @returns {ProcessItem[]}
   */
  function getChildItems(acc, ppid) {
    let childItems = processList.filter((i) => i.PPID === ppid);
    if (childItems.length) {
      acc.push(...childItems);
      childItems.forEach((item) => getChildItems(acc, item.PID));
    }
    return acc;
  }
  return getChildItems([], pid);
}
