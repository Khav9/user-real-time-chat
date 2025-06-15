import React from 'react'
import { ChatApp } from './components/chat-app'

const RootLayot: React.FC = () => {
  return (
    <div className='h-screen bg-gray-800'>
        <ChatApp/>
    </div>
  )
}

export default RootLayot