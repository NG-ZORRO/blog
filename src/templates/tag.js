import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout/layout'
import get from 'lodash/get'
import { defaultLangKey, supportedLanguages } from '../../i18n'
import SEO from '../components/seo'
import { rhythm } from '../utils/typography'

class TagPageTemplate extends React.Component {
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
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <div className="post-container" key={node.fields.slug}>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
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
      </Layout>
    )
  }
}

export default TagPageTemplate

export const pageQuery = graphql`
    query BlogPostByTagAndLangKey(
        $langKey: String!
        $tagName: String!
    ) {
        site {
            siteMetadata {
                title
            }
        }
        allMarkdownRemark(
            filter: {
                frontmatter: { tags: { in: [$tagName] } }
                fields: { langKey: { eq: $langKey } }
            }
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
