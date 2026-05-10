import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// const SOCKET_URL = "http://localhost:8080";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!SOCKET_URL) {
      console.error('❌ SOCKET_URL is not defined!')
      return
    }

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    })

    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('✅ Connected to socket server:', socketInstance.id)
    })

    socketInstance.on('connect_error', (err) => {
      console.error('🚨 Connection Error:', err)
    })

    const timeout = setTimeout(() => {
      socketInstance.connect() // <== connect manually
    }, 500) // or 1000ms if needed

    return () => {
      clearTimeout(timeout)
      socketInstance.disconnect()
    }

    // return () => {
    //   socketInstance.disconnect();
    // };
  }, [])

  return socket
}

export default useSocket
