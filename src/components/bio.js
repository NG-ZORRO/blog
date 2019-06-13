/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from 'react'
import { StaticQuery, graphql } from 'gatsby'

import { rhythm } from '../utils/typography'

function Bio(props) {
  const { isMember, au } = props

  return (
    <StaticQuery
      query={bioQuery}
      render={data => {
        const { author, social } = data.site.siteMetadata
        return (
          <div
            style={{
              display: `flex`,
              marginBottom: rhythm(2.5),
            }}
          >
            <img
              src="https://img.alicdn.com/tfs/TB1TFFaHAvoK1RjSZFwXXciCFXa-106-120.svg"
              alt={author}
              style={{
                marginRight: rhythm(1 / 2),
                marginBottom: 0,
                minWidth: 50,
                height: 64,
              }}
            />
            <p style={{ marginTop: 0 }}>
              {au
                ? isMember
                  ? `Written by NG-ZORRO team member ${author}.`
                  : `Written by ${author}.`
                : 'You are reading blogs published on NG-ZORRO Blog.'}{' '}
              <br />
              <a
                href={`https://twitter.com/${social.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow us on Twitter
              </a>
            </p>
          </div>
        )
      }}
    />
  )
}

const bioQuery = graphql`
  query BioQuery {
    avatar: file(absolutePath: { regex: "/logo.png/" }) {
      childImageSharp {
        fixed(width: 50, height: 50) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    site {
      siteMetadata {
        author
        social {
          twitter
        }
      }
    }
  }
`

export default Bio
