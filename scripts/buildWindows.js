const electronInstaller = require('electron-winstaller')

electronInstaller.createWindowsInstaller({
  appDirectory: './timing-win32-x64',
  outputDirectory: './build',
  authors: 'Chance Hudson',
  exe: 'timing.exe',
})
