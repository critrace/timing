import { computed, observable } from 'mobx'
import net from 'net'

const MIN_PROTOCOL_VERSION = '2.0'

export default class DecoderStore {
  @observable activeIp: string = ''
  @observable port: number = 3601
  @observable recording = false
  @observable activeProtocolVersion = '1.0'

  @observable connection?: net.Socket

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
        this.setProtocol(MIN_PROTOCOL_VERSION)
        this.connection.write('GETMODE;')
      }
    )
    this.connection.on('data', (data) => {
      this.queuedData += data
      let breakIndex = this.queuedData.toString().indexOf('\n')
      while (breakIndex !== -1) {
        const command = this.queuedData.toString().slice(0, breakIndex)
        this.queuedData = this.queuedData.toString().slice(breakIndex, -1)
        breakIndex = this.queuedData.toString().indexOf('\n')
        this.handleCommand(...command.split(';'))
      }
    })
  }

  disconnect() {
    this.connection.end()
    this.connection = undefined
  }

  handleCommand(...parts: string[]) {
    if (parts[0] === 'GETMODE') {
      this.recording = parts[1] !== 'TEST'
    } else if (parts[0] === 'SETPROTOCOL') {
      this.activeProtocolVersion = parts[1]
    }
  }

  setProtocol(version: string) {
    this.connection.write(`SETPROTOCOL;${version}\n`)
  }
}
