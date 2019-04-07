import { action, computed, decorate, observable } from 'mobx'
import net from 'net'
import moment from 'moment'
import EventEmitter from 'events'

// Version where full push mode introduced
const MIN_PROTOCOL_VERSION = '2.0'

interface Passing {
  transponder: string
  date: Date
  riderId: string
  raceId: string
  seriesId: string
}

export default class DecoderStore extends EventEmitter {
  @observable activeIp: string = '192.168.2.2'
  @observable port: number = 3601
  @observable isRecording = false
  @observable isPushEnabled = false
  @observable activeProtocolVersion = '1.0'
  @observable activeRaceId: string

  @observable connection?: net.Socket
  @computed
  get connecting() {
    if (!this.connection) return false
    return this.connection.connecting === true
  }
  @computed
  get connected() {
    if (!this.connection) return false
    return this.connection.connecting === false
  }
  timer?: any
  commandPromise = Promise.resolve()

  queuedData: any = ''

  @action
  connect() {
    if (this.connection) return
    const _connection = net.createConnection({
      host: this.activeIp,
      port: this.port,
    })
    this.connection = decorate(_connection, {
      connecting: observable,
    })
    this.connection.setTimeout(60000)
    this.connection.on('connect', () => {
      console.log('connected')
      this.setProtocolVersion(MIN_PROTOCOL_VERSION)
      this.loadMode()
    })
    this.connection.on('close', () => {
      clearInterval(this.timer)
      this.timer = undefined
      this.connection = undefined
      this.isRecording = false
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
      this.send('PING')
    }, 30000)
  }

  handleCommand(parts: string[] = []) {
    console.log('receiving', parts.join(';'))
    if (parts[0] === 'GETMODE') {
      this.isRecording = parts[1] === 'OPERATION'
    } else if (parts[0] === 'SETPROTOCOL') {
      // eslint-disable-next-line prefer-destructuring
      this.activeProtocolVersion = parts[1]
    } else if (parts[0] === 'SETPUSHPASSINGS') {
      this.isPushEnabled = +parts[1] === 1
      if (parts[1] === 'ERROR') console.log('Error setting push mode')
    } else if (parts[0] === '#P') {
      const [_, passingNumber, transponder, _date, time] = parts
      const date = moment(
        `${_date};${time}`,
        'YYYY-MM-DD;HH:mm:ss:SSS'
      ).toDate()
      this.emit('passing', {
        date,
        transponder,
      })
    }
  }

  disconnect() {
    clearInterval(this.timer)
    this.timer = undefined
    this.connection.end()
  }

  send(command: string) {
    if (!this.connected) {
      console.log(`Not connected, can't send command: ${command}`)
      return
    }
    console.log('sending', command)
    this.connection.write(`${command}\r\n`)
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
