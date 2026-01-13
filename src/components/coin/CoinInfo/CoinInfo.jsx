import React from 'react'
import './styles.css'

const CoinInfo = ({ heading, desc }) => {
  return (
    <div className='grey-wrapper'>
        <h2 className='coin-info-heading'>
            {heading}
        </h2>
        <p />
        <p className='coin-info-desc' dangerouslySetInnerHTML={{__html: desc}}></p>
    </div>
  )
}

export default CoinInfo