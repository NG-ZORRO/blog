import React from 'react'
import { Row, Col, Switch } from 'antd'
import { Link } from 'gatsby'

import './header.css'

/**
 * The header component.
 */
export default class Header extends React.Component {
  constructor(props) {
    super(props)

    const dark = this.loadDarkModeAsIs()

    this.state = { dark }
    this.toggleDark(dark)
  }

  onToggleDarkMode = () => {
    const { dark } = this.state

    this.setState({ dark: !dark })
    this.storeDarkMode(!dark)
    this.toggleDark(!dark)
  }

  toggleDark = dark => {
    document.body.classList.add(dark ? 'dark' : 'light')
    document.body.classList.remove(dark ? 'light' : 'dark')
  }

  loadDarkModeAsIs = () => {
    return localStorage.getItem('ng-zorro-blog.darkMode') === 'true'
  }

  storeDarkMode = dark => {
    localStorage.setItem('ng-zorro-blog.darkMode', dark)
  }

  render() {
    const { dark } = this.state

    return (
      <header id="header" className="clearfix">
        <Row>
          <Col xs={24} sm={24} md={10} lg={10} xl={10} xxl={8}>
            <Link to={`/`} id="logo">
              <img
                id="logo"
                alt="logo"
                src="https://img.alicdn.com/tfs/TB1TFFaHAvoK1RjSZFwXXciCFXa-106-120.svg"
              />
              <span id="name">NG-ZORRO BLOG</span>
            </Link>
          </Col>
          <Col xs={0} sm={0} md={14} lg={14} xl={14} xxl={16}>
            <Switch
              id="dark-switch"
              checked={dark}
              onChange={() => this.onToggleDarkMode()}
            />
          </Col>
        </Row>
      </header>
    )
  }
}
