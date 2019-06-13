import React, { Fragment } from 'react'
import { graphql, Link } from 'gatsby'

import Bio from '../components/bio'
import Layout from '../components/layout/layout'
import SEO from '../components/seo'
import { withLangPrefix } from '../../i18n'
import { rhythm, scale } from '../utils/typography'
import TranslationBox from '../components/translation-box/translation-box'

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const { title: siteTitle } = this.props.data.site.siteMetadata
    const { previous, next, translations } = this.props.pageContext
    const { langKey, slug } = post.fields
    const { category, tags } = post.frontmatter

    return (
      <Fragment>
        <Layout location={this.props.location} title={siteTitle}>
          <SEO
            title={post.frontmatter.title}
            description={post.frontmatter.description || post.excerpt}
          />

          <header style={{ marginBottom: rhythm(1) }}>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
              }}
            >
              {post.frontmatter.title}
            </h1>
            <p
              style={{
                ...scale(-1 / 5),
                display: `block`,
                marginBottom: rhythm(0.5),
                marginTop: rhythm(-0.5),
              }}
            >
              {post.frontmatter.date}
            </p>
            <p
              style={{
                ...scale(-1 / 5),
                marginBottom: rhythm(1),
              }}
            >
              Category:{' '}
              <Link to={withLangPrefix(langKey, `/categories/${category}`)}>
                {category}
              </Link>
              <br />
              Tags: {tags}
            </p>

            <TranslationBox
              slug={slug}
              langKey={langKey}
              translations={translations}
            />
          </header>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          <hr />
          <ul
            style={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `space-between`,
              listStyle: `none`,
              marginLeft: 0,
              marginBottom: 24,
            }}
          >
            <li>
              {previous && (
                <Link to={previous.fields.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={next.fields.slug} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </li>
          </ul>
          <Bio />
        </Layout>
      </Fragment>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160) # A trunc of article.
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        category
        tags
      }
      fields {
        slug
        langKey
      }
    }
  }
`
