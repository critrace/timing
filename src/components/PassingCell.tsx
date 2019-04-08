import React from 'react'
import { inject, observer } from 'mobx-react'
import PassingStore from '../stores/passing'
import { HFlex, VFlex } from './Shared'
import Button from './Button'
import RiderStore from '../stores/rider'
import BibStore from '../stores/bib'

@inject('bib', 'rider', 'passing', 'promoter', 'decoder')
@observer
export default class PassingCell extends React.Component<{
  passingId: string
  passing?: PassingStore
  rider?: RiderStore
  bib?: BibStore
}> {
  async componentDidMount() {
    const passing = this.props.passing.passingById(this.props.passingId)
    if (passing.riderId) {
      await this.props.rider.loadIfNeeded(passing.riderId)
    }
  }
  render() {
    const passing = this.props.passing.passingById(this.props.passingId)
    const rider = this.props.rider.ridersById(passing.riderId)
    const bibsForRaceId = this.props.bib.bibsByRaceId(passing.raceId)
    const bib = bibsForRaceId.find((b) => b.riderId === passing.riderId)
    return (
      <HFlex style={{ margin: 4, justifyContent: 'space-between' }}>
        <VFlex>{passing.transponder}</VFlex>
        <VFlex>{passing.date.toString()}</VFlex>
        <VFlex>{bib ? bib.bibNumber : 'Bib Unknown'}</VFlex>
        <VFlex>{passing.riderId ? rider.lastname : 'No riderId!'}</VFlex>
        <VFlex>Lap {`${passing.lapNumber}` || 'Unknown'}</VFlex>
        <Button
          title="Delete"
          style={{ backgroundColor: 'red' }}
          onClick={() =>
            this.props.passing
              .delete(this.props.passingId)
              .then(() => this.props.passing.loadByRaceId(passing.raceId))
              .catch(() => alert('There was a problem deleting this passing.'))
          }
        />
      </HFlex>
    )
  }
}
