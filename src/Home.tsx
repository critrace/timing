import React from 'react'
import { inject, observer } from 'mobx-react'
import PromoterStore from './stores/promoter'
import { RootCell, Input } from './components/Shared'
import Button from './components/Button'
import DecoderStore from '../stores/decoder'

@inject('promoter', 'decoder')
@observer
export default class Home extends React.Component<{
  promoter: PromoterStore
  decoder: DecoderStore
}> {
  state = {
    email: '',
    password: '',
  }
  render() {
    return (
      <>
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
              onClick={() => {
                this.props.promoter.login(this.state.email, this.state.password)
              }}
            />
          </RootCell>
        )}
        <RootCell>
          <Input
            type="text"
            onChange={(e: any) => {
              this.props.decoder.activeIp = e.target.value
            }}
            value={this.props.decoder.activeIp}
          />
          <Button
            title={this.props.decoder.connected ? 'Disconnect' : 'Connect'}
            onClick={() => {
              if (this.props.decoder.connected) {
                this.props.decoder.disconnect()
              } else {
                this.props.decoder.connect()
              }
            }}
          />
          {this.props.decoder.connected ? (
            <div>
              Connected - Active Protocol:{' '}
              {this.props.decoder.activeProtocolVersion}
            </div>
          ) : (
            <div>Disconnected</div>
          )}
          <Button
            title={
              this.props.decoder.isRecording
                ? 'Stop Recording'
                : 'Start Recording'
            }
            onClick={() => {
              if (this.props.decoder.isRecording) {
                this.props.decoder.setRecording(false)
              } else {
                this.props.decoder.setRecording(true)
              }
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
      </>
    )
  }
}
