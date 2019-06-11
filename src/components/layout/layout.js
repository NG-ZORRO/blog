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
          maxWidth: rhythm(28),
          padding: `0 ${rhythm(3 / 4)} ${rhythm(1.5)}`,
        }}
      >
        <Header />
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, NG-ZORRO Team with ❤️
          <br />
          <a href="https://github.com/NG-ZORRO">GitHub</a>
          {' • '}
          <a href="https://twitter.com/NG_ZORRO">Twitter</a>
          {' • '}
          <a href="https://github.com/NG-ZORRO/blog">Blog Source Code</a>
          {' • '}
          <a href="https://ng.ant.design/blog/rss.xml">RSS</a>
        </footer>
      </div>
    )
  }
}

export default Layout
