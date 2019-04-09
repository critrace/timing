import React from 'react'
import styled from 'styled-components'
import Colors from '../Colors'
import { HFlex, VFlex, Input, ModalContainer, LargeText } from './Shared'
import Popup from './Popup'
import { inject, observer } from 'mobx-react'
import PromoterStore from '../stores/promoter'
import Login from './Login'
import Button from './Button'

const UpperHeader = styled(HFlex)`
  background-color: ${Colors.blue};
  justify-content: space-between;
  font-family: Helvetica;
  padding: 20px;
  color: ${Colors.white};
  border-bottom: solid 2px ${Colors.black};
`

const LowerHeader = styled(HFlex)`
  border-bottom: solid 1px ${Colors.blue};
  background-color: ${Colors.black};
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
`

const TitleSpan = styled.div`
  font-size: 25px;
  color: ${Colors.white};
  text-decoration: none;
`

@inject('promoter')
@observer
export default class Header extends React.Component<{
  promoter?: PromoterStore
}> {
  state = {
    authVisible: false,
    editUserVisible: false,
    email: '',
    password: '',
    oldPassword: '',
  }
  onAuthenticated = () => this.setState({ authVisible: false })
  onCancelled = () => this.setState({ authVisible: false })

  render() {
    return (
      <>
        <Popup visible={this.state.authVisible}>
          <VFlex>
            <HFlex style={{ borderRadius: 5 }}>
              <Login
                onAuthenticated={this.onAuthenticated}
                onCancelled={this.onCancelled}
              />
            </HFlex>
          </VFlex>
        </Popup>
        <Popup visible={this.state.editUserVisible}>
          <ModalContainer>
            <VFlex>
              <LargeText>Update Info</LargeText>
              <Input
                type="text"
                placeholder="email"
                onChange={(e: any) => this.setState({ email: e.target.value })}
              />
              <Input
                type="password"
                placeholder="old password"
                onChange={(e: any) =>
                  this.setState({ oldPassword: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="new password"
                onChange={(e: any) =>
                  this.setState({ password: e.target.value })
                }
              />
              <HFlex>
                <Button
                  title="Update"
                  onClick={() =>
                    this.props.promoter
                      .update({
                        email: this.state.email,
                        oldPassword: this.state.oldPassword,
                        password: this.state.password,
                      })
                      .then(() => this.props.promoter.loadPromoter())
                      .then(() => this.setState({ editUserVisible: false }))
                      .catch(() =>
                        alert('There was a problem updating your info.')
                      )
                  }
                />
                <Button
                  title="Cancel"
                  onClick={() => this.setState({ editUserVisible: false })}
                />
              </HFlex>
            </VFlex>
          </ModalContainer>
        </Popup>
        <UpperHeader>
          <VFlex style={{ alignItems: 'flex-start' }}>
            <TitleSpan>critrace</TitleSpan>
            <span style={{ fontSize: 15 }}>Easy Criterium racing</span>
          </VFlex>
          <VFlex style={{ alignItems: 'flex-end' }}>
            <HFlex>
              {this.props.promoter.userId ? (
                <Button
                  onClick={() => this.setState({ editUserVisible: true })}
                >
                  {this.props.promoter.active.email || ''}
                </Button>
              ) : (
                <Button onClick={() => this.setState({ authVisible: true })}>
                  Signup or Login
                </Button>
              )}
              {this.props.promoter.userId ? (
                <Button
                  style={{ marginLeft: 5 }}
                  onClick={() => this.props.promoter.logout()}
                >
                  Logout
                </Button>
              ) : null}
            </HFlex>
          </VFlex>
        </UpperHeader>
        <LowerHeader />
      </>
    )
  }
}
