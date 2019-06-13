import React from 'react'
import { Icon, List } from 'antd'
import { Link } from 'gatsby'

import './navigation.css'

class Navigation extends React.Component {
  render() {
    return (
      <List className="navigation" itemLayout="horizontal">
        {this.props.children}
        <List.Item>
          <List.Item.Meta
            title={<Icon type="home" />}
          />
          <Link to={'/'}>Homepage</Link>
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title={<Icon type="container" />}
          />
          <Link to={'/categories'}>Categories</Link>
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title={<Icon type="tag" />}
          />
          <Link to={'/tags'}>Tags</Link>
        </List.Item>
      </List>
    )
  }
}

export default Navigation
