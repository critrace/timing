import React from 'react'
import Colors from '../Colors'
import { VFlex, PuffAnimation } from './Shared'

export default class Button extends React.Component<{
  title?: string
  animating?: boolean
  style?: any
  onClick?: (...args: any[]) => void | Promise<any>
}> {
  // Tracking isMounted helps prevent making state changes in async functions
  // once we've been unmounted
  _isMounted = false
  state = {
    internallyAnimating: false,
  }

  componentDidMount() {
    this._isMounted = true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  handleClick = () => {
    if (!this.props.onClick) return
    const ret = this.props.onClick()
    this.setState({ internallyAnimating: true })
    Promise.resolve(ret)
      .then(
        () => this._isMounted && this.setState({ internallyAnimating: false })
      )
      .catch(
        () => this._isMounted && this.setState({ internallyAnimating: false })
      )
  }

  render() {
    const animating = this.state.internallyAnimating || this.props.animating
    return (
      <div
        onClick={this.handleClick}
        style={{
          margin: 4,
          padding: 4,
          paddingLeft: 8,
          paddingRight: 8,
          fontFamily: 'Helvetica',
          cursor: 'pointer',
          backgroundColor: Colors.black,
          borderRadius: 5,
          color: Colors.white,
          ...(this.props.style || {}),
        }}
      >
        <VFlex style={{ justifyContent: 'center' }}>
          <div
            style={{
              opacity: animating ? 0 : 1,
            }}
          >
            {this.props.title || this.props.children}
          </div>
          <div
            style={{
              position: 'absolute',
              opacity: animating ? 1 : 0,
            }}
          >
            <PuffAnimation height="15" />
          </div>
        </VFlex>
      </div>
    )
  }
}
