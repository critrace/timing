import React from 'react'
import { inject, observer } from 'mobx-react'
import PromoterStore from './stores/promoter'

@inject('promoter')
@observer
export default class Home extends React.Component<{
  promoter: PromoterStore
}> {
  render() {
    return <div>Home screen</div>
  }
}
