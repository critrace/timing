import React from 'react'
import { inject, observer } from 'mobx-react'
import PromoterStore from './stores/promoter'
import {
  RootCell,
  Input,
  HFlex,
  VFlex,
  TitleText,
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

@inject('bib', 'promoter', 'decoder', 'passing')
@observer
export default class Home extends React.Component<{
  promoter?: PromoterStore
  decoder?: DecoderStore
  passing?: PassingStore
  bib?: BibStore
}> {
  state = {
    email: '',
    password: '',
    activeRaceId: '',
    showingManualPassing: false,
    transponder: '',
    minuteOffset: '',
  }
  timer: any
  async componentDidMount() {
    await this.props.promoter.loadRaces()
    this.props.decoder.on('passing', this.passingReceived)
    this.timer = setInterval(
      () =>
        this.state.activeRaceId &&
        this.props.passing.loadByRaceId(this.state.activeRaceId),
      5000
    )
  }

  componentWillUnmount() {
    this.props.decoder.removeListener('passing', this.passingReceived)
    clearInterval(this.timer)
    this.timer = undefined
  }

  _promise = Promise.resolve()
  passingReceived = (passing: any) => {
    this._promise = this._promise
      .then(() =>
        this.props.passing.create({
          raceId: this.state.activeRaceId,
          ...passing,
        })
      )
      .then(() => console.log('Created passing'))
      .catch(() =>
        console.log('Error creating passing', JSON.stringify(passing))
      )
  }

  raceSelectionChanged = (e: any) => {
    this.setState({ activeRaceId: e.target.value })
    this.props.passing.loadByRaceId(e.target.value)
    this.props.bib.loadByRaceId(e.target.value)
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
                  onClick={() =>
                    this.props.passing
                      .create({
                        raceId: this.state.activeRaceId,
                        transponder: this.state.transponder,
                        date: moment()
                          .subtract(this.state.minuteOffset, 'minutes')
                          .toISOString(),
                      })
                      .then(() =>
                        this.setState({ showingManualPassing: false })
                      )
                      .catch(() =>
                        alert('There was a problem creating the passing')
                      )
                  }
                />
                <Button
                  title="Cancel"
                  onClick={() => this.setState({ showingManualPassing: false })}
                />
              </HFlex>
            </VFlex>
          </ModalContainer>
        </Popup>
        {this.props.promoter.authenticated ? (
          <RootCell>
            Logged in as {this.props.promoter.active.email}
            <Button title="Logout" onClick={this.props.promoter.logout} />
          </RootCell>
        ) : (
          <RootCell>
            <Input
              type="text"
              placeholder="email address"
              onChange={(e: any) => {
                this.setState({ email: e.target.value })
              }}
              value={this.state.email}
            />
            <Input
              type="password"
              placeholder="password"
              onChange={(e: any) => {
                this.setState({ password: e.target.value })
              }}
              value={this.state.password}
            />
            <Button
              title="Login"
              onClick={() =>
                this.props.promoter.login(this.state.email, this.state.password)
              }
            />
          </RootCell>
        )}
        <RootCell>
          <HFlex>
            <Input
              type="text"
              onChange={(e: any) => {
                this.props.decoder.activeIp = e.target.value
              }}
              value={this.props.decoder.activeIp}
            />
            {this.props.decoder.connected ? (
              <div style={{ color: 'green' }}>
                Connected - Active Protocol:{' '}
                {this.props.decoder.activeProtocolVersion}
              </div>
            ) : (
              <div style={{ color: 'red' }}>Disconnected</div>
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
          <select
            onChange={this.raceSelectionChanged}
            value={this.state.activeRaceId}
          >
            <option key="none" value="">
              no race selected
            </option>
            {this.props.promoter.races.map((race) => (
              <option key={race._id} value={race._id}>
                {race.series.name} - {race.event.name} - {race.name}
              </option>
            ))}
          </select>
          {this.props.decoder.connected ? (
            <>
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
                  } else if (!this.state.activeRaceId) {
                    alert('Select a race before starting a recording')
                    return
                  }
                  this.props.decoder.setRecording(true)
                  this.props.promoter
                    .startRace(this.state.activeRaceId)
                    .catch(console.log)
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
            </>
          ) : null}
        </RootCell>
        <RootCell>
          <HFlex style={{ justifyContent: 'space-between' }}>
            <TitleText>Passings</TitleText>
            <Button
              title="Add Manual"
              style={{ backgroundColor: Colors.yellow, color: Colors.black }}
              onClick={() => {
                this.setState({ showingManualPassing: true })
              }}
            />
          </HFlex>
          {this.props.passing
            .passingsByRaceId(this.state.activeRaceId)
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
