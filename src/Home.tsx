import React from 'react'
import { inject, observer } from 'mobx-react'
import PromoterStore from './stores/promoter'
import { RootCell, Input } from './components/Shared'
import Button from './components/Button'

@inject('promoter')
@observer
export default class Home extends React.Component<{
  promoter: PromoterStore
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
      </>
    )
  }
}
