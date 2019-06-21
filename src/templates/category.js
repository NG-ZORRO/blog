import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout/layout'
import get from 'lodash/get'
import { defaultLangKey, getTranslator, supportedLanguages } from '../../i18n'
import SEO from '../components/seo'

class CategoryPageTemplate extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const posts = get(this, 'props.data.allMarkdownRemark.edges')
    const langKey = get(this, 'props.pageContext.langKey', defaultLangKey)
    const categoryName = get(this, 'props.pageContext.categoryName')
    const t = getTranslator(langKey)

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
          <h1>Category: {t(categoryName)}</h1>
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

export default CategoryPageTemplate

export const pageQuery = graphql`
  query BlogPostByCategoryAndLangKey(
    $langKey: String!
    $categoryName: String!
  ) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: {
        frontmatter: { category: { eq: $categoryName } }
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
