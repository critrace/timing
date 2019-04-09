import React from 'react'
import { HFlex, VFlex, Input, ModalContainer } from './Shared'
import Button from './Button'
import { inject, observer } from 'mobx-react'
import PromoterStore from '../stores/promoter'
import emailValidator from 'email-validator'

@inject('promoter')
@observer
export default class Signup extends React.Component<{
  onAuthenticated?: () => void
  onCancelled?: (event: React.MouseEvent) => void
  promoter?: PromoterStore
}> {
  state = {
    email: '',
    password: '',
    isLoading: false,
  }

  inputRef = React.createRef<any>()

  componentDidMount() {
    this.inputRef.current.focus()
  }

  login = () => {
    this.setState({ isLoading: true })
    this.props.promoter
      .login(this.state.email, this.state.password)
      .then(() => {
        this.resetFields()
        this.props.onAuthenticated()
      })
      .catch((err) => {
        this.resetFields()
        alert(err.response.data.message)
      })
  }

  resetFields = () =>
    this.setState({
      email: '',
      password: '',
      isLoading: false,
    })

  render() {
    return (
      <ModalContainer>
        <VFlex style={{ padding: 10 }}>
          <HFlex>
            Email:{' '}
            <Input
              ref={this.inputRef}
              valid={emailValidator.validate(this.state.email)}
              type="text"
              onChange={(e: any) => {
                this.setState({ email: e.target.value })
              }}
              value={this.state.email}
            />
          </HFlex>
          <HFlex>
            Password:{' '}
            <Input
              valid={this.state.password.length >= 6}
              type="password"
              onChange={(e: any) => {
                this.setState({ password: e.target.value })
              }}
              value={this.state.password}
            />
          </HFlex>
          <HFlex>
            <Button
              animating={this.state.isLoading}
              title="Login"
              onClick={this.login}
            />
            <Button title="Cancel" onClick={this.props.onCancelled} />
          </HFlex>
        </VFlex>
      </ModalContainer>
    )
  }
}
