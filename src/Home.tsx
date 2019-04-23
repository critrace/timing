import React from 'react'
import { inject, observer } from 'mobx-react'
import PromoterStore from './stores/promoter'
import {
  RootCell,
  Input,
  HFlex,
  VFlex,
  ModalContainer,
  LargeText,
} from './components/Shared'
import Button from './components/Button'
import DecoderStore from '../stores/decoder'
import PassingStore from '../stores/passing'
import PassingCell from './components/PassingCell'
import BibStore from '../stores/bib'
import Colors from './Colors'
import Popup from './components/Popup'
import moment from 'moment'
import Header from './components/Header'
import throttle from 'lodash.throttle'

@inject('bib', 'promoter', 'decoder', 'passing')
@observer
export default class Home extends React.Component<{
  promoter?: PromoterStore
  decoder?: DecoderStore
  passing?: PassingStore
  bib?: BibStore
}> {
  state = {
    activeEventId: '',
    showingManualPassing: false,
    transponder: '',
    minuteOffset: '',
  }
  timer: any
  async componentDidMount() {
    await this.props.promoter.loadEvents()
    this.props.decoder.on('passing', this.passingReceived)
  }

  componentWillUnmount() {
    this.props.decoder.removeListener('passing', this.passingReceived)
  }

  _promise = Promise.resolve()
  _createPassing = async (passing: any, eventId: string) => {
    try {
      await this.props.passing.create({
        eventId,
        ...passing,
      })
      console.log('Created passing')
    } catch (err) {
      console.log('Error creating passing', err)
      await new Promise((r) => setTimeout(r, 5000))
      await this._createPassing(passing, eventId)
    }
    this.loadPassings()
  }

  passingReceived = (passing: any) => {
    this._promise = this._promise.then(() =>
      this._createPassing(passing, this.state.activeEventId)
    )
    return this._promise
  }

  loadPassings = throttle(
    () => this.props.passing.loadByEventId(this.state.activeEventId),
    5000
  )

  eventSelectionChanged = (e: any) => {
    this.setState({ activeEventId: e.target.value })
    this.props.passing.loadByEventId(e.target.value)
    this.props.bib.loadByEventId(e.target.value)
  }

  render() {
    return (
      <>
        <Popup visible={this.state.showingManualPassing}>
          <ModalContainer>
            <VFlex>
              <LargeText>Create Manual</LargeText>
              <Input
                type="text"
                placeholder="transponder"
                onChange={(e: any) =>
                  this.setState({ transponder: e.target.value })
                }
              />
              <Input
                type="text"
                placeholder="X minutes ago"
                onChange={(e: any) =>
                  this.setState({ minuteOffset: e.target.value })
                }
              />
              <HFlex>
                <Button
                  title="Create"
                  onClick={() => {
                    this.passingReceived({
                      transponder: this.state.transponder,
                      date: moment()
                        .subtract(this.state.minuteOffset, 'minutes')
                        .toISOString(),
                    })
                    this.setState({ showingManualPassing: false })
                  }}
                />
                <Button
                  title="Cancel"
                  onClick={() => this.setState({ showingManualPassing: false })}
                />
              </HFlex>
            </VFlex>
          </ModalContainer>
        </Popup>
        <Header />
        <RootCell>
          <LargeText>Decoder Configuration</LargeText>
          <HFlex>
            <Input
              type="text"
              onChange={(e: any) => {
                this.props.decoder.activeIp = e.target.value
              }}
              value={this.props.decoder.activeIp}
            />
            {this.props.decoder.connected ? (
              <div style={{ color: Colors.green }}>
                Connected - Active Protocol:{' '}
                {this.props.decoder.activeProtocolVersion}
              </div>
            ) : (
              <div style={{ color: Colors.pink }}>Disconnected</div>
            )}
          </HFlex>
          <Button
            animating={this.props.decoder.connecting}
            title={this.props.decoder.connected ? 'Disconnect' : 'Connect'}
            onClick={() => {
              if (this.props.decoder.connected) {
                this.props.decoder.disconnect()
              } else {
                this.props.decoder.connect()
              }
            }}
          />
        </RootCell>
        <RootCell>
          <LargeText>Race Configuration</LargeText>
          <HFlex style={{ justifyContent: 'space-around' }}>
            <VFlex>
              <select
                onChange={this.eventSelectionChanged}
                value={this.state.activeEventId}
              >
                <option key="none" value="">
                  no event selected
                </option>
                {this.props.promoter.events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.series.name} - {event.name}
                  </option>
                ))}
              </select>
            </VFlex>
          </HFlex>
          <Button
            title={
              this.props.decoder.isRecording
                ? 'Stop Recording'
                : 'Start Recording'
            }
            onClick={() => {
              if (this.props.decoder.isRecording) {
                this.props.decoder.setRecording(false)
                return
              } else if (!this.state.activeEventId) {
                alert('Select a race before starting a recording')
                return
              } else if (!this.props.decoder.connected) {
                alert('Connect decoder box to start recording')
                return
              }
              this.props.decoder.setRecording(true)
            }}
          />
          {this.props.decoder.isRecording ? (
            <div>
              Recording - Push{' '}
              {this.props.decoder.isPushEnabled ? 'enabled' : 'disabled'}
            </div>
          ) : (
            <div>Not recording</div>
          )}
        </RootCell>
        <RootCell>
          <HFlex style={{ justifyContent: 'space-between' }}>
            <LargeText>Passings</LargeText>
            <Button
              title="Add Manual"
              style={{
                backgroundColor: Colors.yellow,
                color: Colors.black,
              }}
              onClick={() => {
                this.setState({ showingManualPassing: true })
              }}
            />
          </HFlex>
          {this.props.passing
            .passingsByEventId(this.state.activeEventId)
            .map((passing: any, index: number) => (
              <PassingCell
                key={index}
                passingId={passing._id}
                style={{
                  backgroundColor:
                    index % 2 === 1 ? Colors.white : Colors.whiteDark,
                }}
              />
            ))}
        </RootCell>
      </>
    )
  }
}
