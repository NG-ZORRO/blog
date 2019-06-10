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

    this.state = {
      dark: false,
    }
  }

  onToggleDarkMode = () => {
    const { dark } = this.state

    this.setState({
      dark: !dark,
    })

    document.body.classList.remove(dark ? 'dark' : 'light')
    document.body.classList.add(dark ? 'light' : 'dark')
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
