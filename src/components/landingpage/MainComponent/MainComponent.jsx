import React from 'react'
import "./styles.css"
import Button from '../../common/button/Button'
import iphone from '../../../assets/iphone.png'
import gradient from '../../../assets/gradient.png'
import { motion } from "framer-motion"

const MainComponent = () => {
  return (
    <div className='flex-info'>
        <div className='left-component'>
            <motion.h1 className="track-crypto-heading" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                Track Crypto
            </motion.h1>
            <motion.h1 className="real-time-heading" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>                Real Time.
            </motion.h1>
            <motion.p className='info-text' initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}>
                Track famous crypto-currencies using a public api real-time
            </motion.p>
            <motion.div className="btn-flex" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.5 }}>
                <Button text={"DashBoard"}/>
                <Button text={"Share"} outlined={true}/>
            </motion.div>
        </div>
        <div className='phone-container'>
            <motion.img src={iphone} className='iphone' initial={{ y: -20 }} animate={{ y: 20 }} transition={{ type: "smooth", repeatType: "mirror", duration: 2, repeat: Infinity}}/>
            <img src={gradient} className='gradient'/>
        </div>
    </div>
  )
}

export default MainComponent