import { computed, observable } from 'mobx'
import net from 'net'
import throttle from 'lodash.throttle'

// Version where full push mode introduced
const MIN_PROTOCOL_VERSION = '2.0'

export default class DecoderStore {
  @observable activeIp: string = '192.168.2.2'
  @observable port: number = 3601
  @observable isRecording = false
  @observable isPushEnabled = false
  @observable activeProtocolVersion = '1.0'

  @observable connection?: net.Socket
  @observable connected = false
  @computed
  get connecting() {
    return this.connected === false && this.connection
  }
  timer?: any
  commandPromise = Promise.resolve()

  queuedData: any = ''

  connect() {
    if (this.connection) return
    this.connection = net.createConnection({
      host: this.activeIp,
      port: this.port,
    })
    this.connection.on('connect', () => {
      this.connected = true
      this.setProtocolVersion(MIN_PROTOCOL_VERSION)
      this.loadMode()
      this.setPushPassings(true)
    })
    this.connection.on('end', () => {
      this.connected = false
    })
    this.connection.on('data', (data) => {
      this.queuedData += data
      this.queuedData.split('\n').forEach((response: string) => {
        if (response.trim().length === 0) return
        this.handleCommand(response.trim().split(';'))
      })
      this.queuedData = this.queuedData.split('\n').pop()
    })
    this.timer = setInterval(() => {
      this.connection.write('PING\n')
    }, 30000)
  }

  handleCommand(parts: string[] = []) {
    console.log('receiving', parts.join(';'))
    if (parts[0] === 'GETMODE') {
      this.isRecording = parts[1] === 'OPERATION'
    } else if (parts[0] === 'SETPROTOCOL') {
      this.activeProtocolVersion = parts[1]
    } else if (parts[0] === 'SETPUSHPASSINGS') {
      this.isPushEnabled = +parts[1] === 1
      if (parts[1] === 'ERROR') console.log('Error setting push mode')
    }
  }

  disconnect() {
    clearInterval(this.timer)
    this.timer = undefined
    this.connection.end()
    this.connection = undefined
  }

  send(command: string) {
    const WAIT_INTERVAL = 50
    // Use a long chained promise to ensure commands are only sent once every
    // WAIT_INTERVAL ms
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
