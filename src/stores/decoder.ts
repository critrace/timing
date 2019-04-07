import { computed, observable } from 'mobx'
import net from 'net'
import throttle from 'lodash.throttle'

// Version where full push mode introduced
const MIN_PROTOCOL_VERSION = '2.0'

export default class DecoderStore {
  @observable activeIp: string = ''
  @observable port: number = 3601
  @observable isRecording = false
  @observable isPushEnabled = false
  @observable activeProtocolVersion = '1.0'

  @observable connection?: net.Socket
  timer?: any
  commandPromise = Promise.resolve()

  @computed
  get connected() {
    return !!this.connection
  }

  queuedData: any = ''

  connect() {
    if (this.connection) return
    this.connection = net.createConnection(
      {
        host: this.activeIp,
        port: this.port,
      },
      () => {
        console.log('connected')
        this.setProtocolVersion(MIN_PROTOCOL_VERSION)
        this.loadMode()
        this.setPushPassings(true)
      }
    )
    this.connection.on('data', (data) => {
      console.log(data.toString())
      this.queuedData += data
      let breakIndex = this.queuedData.toString().indexOf('\n')
      while (breakIndex !== -1) {
        const command = this.queuedData
          .toString()
          .slice(0, breakIndex)
          .trim()
        this.queuedData = this.queuedData.toString().slice(breakIndex, -1)
        this.handleCommand(command.split(';'))
        breakIndex = this.queuedData.toString().indexOf('\n')
      }
    })
    // this.timer = setInterval(() => {
    //   this.connection.write('PING\n')
    // }, 5000)
  }

  send(command: string) {
    // Use a long chained promise to ensure commands are only sent once every
    // WAIT_INTERVAL
    const WAIT_INTERVAL = 1000
    this.commandPromise = this.commandPromise.then(() => {
      if (!this.connected) {
        console.log(`Not connected, can't send command: ${command}`)
        return
      }
      console.log('sending', command)
      this.connection.write(`${command}\r\n`)
      return new Promise((r) => setTimeout(r, WAIT_INTERVAL))
    })
  }

  disconnect() {
    clearInterval(this.timer)
    this.timer = undefined
    this.connection.end()
    this.connection = undefined
  }

  handleCommand(parts: string[] = []) {
    if (parts[0] === 'PING') {
      console.log('Received', parts[1])
    } else if (parts[0] === 'GETMODE') {
      this.isRecording = parts[1] === 'OPERATION'
    } else if (parts[0] === 'SETPROTOCOL') {
      this.activeProtocolVersion = parts[1]
    } else if (parts[0] === 'SETPUSHPASSINGS') {
      console.log(parts[1])
      this.isPushEnabled = +parts[1] === 1
      if (parts[1] === 'ERROR') console.log('Error setting push mode')
    } else {
      console.log(parts.join(';'))
    }
  }

  loadMode() {
    this.send('GETMODE')
  }

  setProtocolVersion(version: string) {
    this.send(`SETPROTOCOL;${version}`)
  }

  setRecording(active: boolean = false) {
    this.send(active ? 'STARTOPERATION' : 'STOPOPERATION')
    if (active) {
      this.setPushPassings(true)
    } else {
      this.setPushPassings(false)
    }
    this.send('GETMODE')
  }

  setPushPassings(enabled = false, pushExisting = true) {
    this.send(`SETPUSHPASSINGS;${enabled ? 1 : 0};${pushExisting ? 1 : 0}`)
  }
}
