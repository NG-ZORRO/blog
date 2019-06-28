import React, { Fragment } from 'react'
import { Col, Row } from 'antd'

import Header from './header/header'
import Navigation from './navigation/navigation'

import './layout.css'

class Layout extends React.Component {
  render() {
    const { children, title, langKey } = this.props

    return (
      <Fragment>
        <Header title={title} langKey={langKey} />
        <div className="wrapper">
          <Row gutter={48}>
            <Col
              xs={0}
              sm={0}
              md={8}
              lg={8}
              xl={6}
              xxl={6}
              className="side-bar"
            >
              <Navigation />
            </Col>
            <Col xs={24} sm={24} md={16} lg={16} xl={18} xxl={18}>
              <main>{children}</main>
            </Col>
          </Row>
        </div>
        <footer>
          © {new Date().getFullYear()}, NG-ZORRO Team with ❤️
          <br />
          <a
            href="https://ng.ant.design"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official Website
          </a>
          {' • '}
          <a
            href="https://github.com/NG-ZORRO"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          {' • '}
          <a
            href="https://twitter.com/NG_ZORRO"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <br />
          <a
            href="https://github.com/NG-ZORRO/blog"
            target="_blank"
            rel="noopener noreferrer"
          >
            Blog Source Code
          </a>
          {' • '}
          <a
            href="https://ng.ant.design/blog/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
          >
            RSS
          </a>
        </footer>
      </Fragment>
    )
  }
}

export default Layout
