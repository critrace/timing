import { computed, observable } from 'mobx'
import net from 'net'

const MIN_PROTOCOL_VERSION = '2.0'

export default class DecoderStore {
  @observable activeIp: string = ''
  @observable port: number = 3601
  @observable isRecording = false
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
        this.connection.write('GETMODE\n')
      }
    )
    this.connection.on('data', (data) => {
      // console.log(data.toString())
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
  }

  disconnect() {
    this.connection.end()
    this.connection = undefined
  }

  handleCommand(parts: string[] = []) {
    if (parts[0] === 'GETMODE') {
      this.isRecording = parts[1] === 'OPERATION'
    } else if (parts[0] === 'SETPROTOCOL') {
      this.activeProtocolVersion = parts[1]
    }
  }

  setProtocol(version: string) {
    this.connection.write(`SETPROTOCOL;${version}\n`)
  }

  setRecording(active: boolean = false) {
    if (active) {
      this.connection.write('STARTOPERATION\n')
    } else {
      this.connection.write('STOPOPERATION\n')
    }
    this.connection.write('GETMODE\n')
  }
}
