import React, { Fragment } from 'react'
import { graphql, Link } from 'gatsby'
import { Tag } from 'antd'

import Bio from '../components/bio'
import Layout from '../components/layout/layout'
import SEO from '../components/seo'
import { getTranslator, withLangPrefix } from '../../i18n'
import { rhythm } from '../utils/typography'
import TranslationBox from '../components/translation-box/translation-box'

const availableTagColors = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
]

const colorCounts = availableTagColors.length

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const { title: siteTitle } = this.props.data.site.siteMetadata
    const { previous, next, translations } = this.props.pageContext
    const { langKey, slug } = post.fields
    const { category, tags } = post.frontmatter
    const t = getTranslator(langKey)

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <article>
          <header style={{ marginBottom: rhythm(1) }}>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
              }}
            >
              {post.frontmatter.title}
            </h1>
            <div className="info-box">
              {post.frontmatter.date}
              <br />
              <span className="category-title">Category</span>
              <Link to={withLangPrefix(langKey, `/categories/${category}`)}>
                <Tag className="tag">{t(category)}</Tag>
              </Link>
              <br />
              <span className="tag-title">Tags</span>
              {tags.map((tag, index) => (
                <Link to={withLangPrefix(langKey, `/tags/${tag}`)}>
                  <Tag
                    className="tag"
                    color={
                      availableTagColors[(index + colorCounts) % colorCounts]
                    }
                  >
                    {t(tag)}
                  </Tag>
                </Link>
              ))}
            </div>
            <TranslationBox
              slug={slug}
              langKey={langKey}
              translations={translations}
            />
          </header>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
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
