import React from 'react'

export default (props: { visible: boolean; children?: any }) => (
  <>
    {props.visible ? (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {props.children}
      </div>
    ) : null}
  </>
)
