const electron = require('electron')
const { app, BrowserWindow } = electron
require('electron-debug')({
  enabled: true,
  devToolsMode: 'right',
  showDevTools: false,
})

app.on('ready', () => {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  const win = new BrowserWindow({
    width: Math.min(1000, width),
    height: Math.min(700, height),
  })
  win.loadFile('build/index.html')
})
