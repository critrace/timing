const electron = require('electron')
const { app, BrowserWindow } = electron

app.on('ready', () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })
  win.loadFile('build/index.html')
})
