import React from 'react'
import { inject, observer } from 'mobx-react'
import PassingStore from '../stores/passing'
import { HFlex, VFlex } from './Shared'
import Button from './Button'
import RiderStore from '../stores/rider'
import BibStore from '../stores/bib'
import Colors from '../Colors'

@inject('bib', 'rider', 'passing', 'promoter', 'decoder')
@observer
export default class PassingCell extends React.Component<{
  passingId: string
  style?: any
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
      <HFlex
        style={{
          margin: 4,
          justifyContent: 'space-between',
          padding: 4,
          ...(this.props.style || {}),
        }}
      >
        <VFlex>{passing.transponder}</VFlex>
        <VFlex>{passing.date && passing.date.toString()}</VFlex>
        <VFlex style={{ minWidth: 100 }}>
          {bib ? bib.bibNumber : 'Bib Unknown'}
        </VFlex>
        <VFlex style={{ minWidth: 150 }}>
          {passing.riderId ? rider.lastname : 'No riderId!'}
        </VFlex>
        <VFlex style={{ minWidth: 200 }}>
          Lap {`${passing.lapNumber}` || 'Unknown'}
        </VFlex>
        <Button
          title="Delete"
          style={{ backgroundColor: Colors.pink }}
          onClick={() => {
            if (!confirm('Delete passing?')) return
            return this.props.passing
              .delete(this.props.passingId)
              .then(() => this.props.passing.loadByRaceId(passing.raceId))
              .catch(() => alert('There was a problem deleting this passing.'))
          }}
        />
      </HFlex>
    )
  }
}
