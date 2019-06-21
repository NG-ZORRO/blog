import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import { defaultLangKey, supportedLanguages } from '../../i18n'

import Layout from '../components/layout/layout'
import SEO from '../components/seo'

class BlogIndexTemplate extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const posts = get(this, 'props.data.allMarkdownRemark.edges')
    const langKey = get(this, 'props.pageContext.langKey', defaultLangKey)

    return (
      <Layout
        location={this.props.location}
        langKey={langKey}
        title={
          langKey === defaultLangKey
            ? siteTitle
            : `${siteTitle} - ${supportedLanguages[langKey]}`
        }
      >
        <SEO
          title={
            langKey === defaultLangKey
              ? 'All posts'
              : `All posts in ${supportedLanguages[langKey]}`
          }
        />
        <article>
          <h1>
            {langKey === defaultLangKey
              ? 'All posts'
              : `All posts in ${supportedLanguages[langKey]}`}
          </h1>
          {posts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            return (
              <div className="post-container" key={node.fields.slug}>
                <h3>
                  <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                    {title}
                  </Link>
                </h3>
                <small>{node.frontmatter.date}</small>
                <p
                  style={{
                    marginTop: '1em',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: node.frontmatter.description || node.excerpt,
                  }}
                />
              </div>
            )
          })}
        </article>
      </Layout>
    )
  }
}

export default BlogIndexTemplate

export const pageQuery = graphql`
  query($langKey: String!) {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(
      filter: { fields: { langKey: { eq: $langKey } } }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
            langKey
          }
          timeToRead
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
