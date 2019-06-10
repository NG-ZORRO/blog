import React from 'react'

import { rhythm } from '../../utils/typography'
import Header from '../header/header'

class Layout extends React.Component {
  render() {
    const { children } = this.props

    return (
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(36),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <Header />
        <main>{children}</main>
        <footer>© {new Date().getFullYear()}, NG-ZORRO Team with ❤️</footer>
      </div>
    )
  }
}

export default Layout
