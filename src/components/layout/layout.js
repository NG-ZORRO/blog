import React from 'react'

import { rhythm } from '../../utils/typography'
import Header from './header/header'
import Navigation from './navigation/navigation'

import './layout.css'
import { Col, Row } from 'antd'

class Layout extends React.Component {
  render() {
    const { children, title, langKey } = this.props

    return (
      <div
        className="wrapper"
        style={{
          padding: `0 ${rhythm(3 / 4)} ${rhythm(1.5)}`,
        }}
      >
        <Header title={title} langKey={langKey} />
        <Row gutter={48}>
          <Col xs={0} sm={0} md={8} lg={8} xl={8} xxl={8} className="side-bar">
            <Navigation />
          </Col>
          <Col xs={24} sm={24} md={16} lg={16} xl={16} xxl={16}>
            <main>{children}</main>
          </Col>
        </Row>
        {/* TODO: add sticky footer effect */}
        <footer>
          © {new Date().getFullYear()}, NG-ZORRO Team with ❤️
          <br />
          <a href="https://ng.ant.design">Official Website</a>
          {' • '}
          <a href="https://github.com/NG-ZORRO">GitHub</a>
          {' • '}
          <a href="https://twitter.com/NG_ZORRO">Twitter</a>
          <br />
          <a href="https://github.com/NG-ZORRO/blog">Blog Source Code</a>
          {' • '}
          <a href="https://ng.ant.design/blog/rss.xml">RSS</a>
        </footer>
      </div>
    )
  }
}

export default Layout
