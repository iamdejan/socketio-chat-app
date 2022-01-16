import '../styles/globals.css'
import type { AppProps } from 'next/app'
import SocketProvider from "../context/socket.context";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  )
}

export default MyApp
