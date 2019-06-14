import React from 'react'
import { graphql, Link } from 'gatsby'
import get from 'lodash/get'
import Layout from '../components/layout/layout'
import { defaultLangKey, supportedLanguages, getTranslator } from '../../i18n'
import SEO from '../components/seo'

class CategoryIndexTemplate extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const categoryNames = get(this, 'props.pageContext.categoryNames')
    const langKey = get(this, 'props.pageContext.langKey', defaultLangKey)
    const t = getTranslator(langKey)

    return (
      <Layout
        location={this.props.location}
        langKey={langKey}
        title={
          langKey === defaultLangKey
            ? `${siteTitle}`
            : `${siteTitle} - ${supportedLanguages[langKey]}`
        }
      >
        <SEO
          title={
            langKey === defaultLangKey
              ? 'Categories'
              : `Categories in ${supportedLanguages[langKey]}`
          }
        />
        <article>
          <h1>Categories</h1>
          <ul>
            {categoryNames.map(name => (
              <li key={name}>
                <Link
                  to={
                    langKey === defaultLangKey
                      ? `/categories/${name}`
                      : `/${langKey}/categories/${name}`
                  }
                >
                  {t(name)}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </Layout>
    )
  }
}

export default CategoryIndexTemplate

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
