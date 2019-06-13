import React from 'react'
import { graphql, Link } from 'gatsby'
import get from 'lodash/get'
import Layout from '../components/layout/layout'
import { defaultLangKey, supportedLanguages, getTranslator } from '../../i18n'
import SEO from '../components/seo'

class TagIndexTemplate extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const tagNames = get(this, 'props.pageContext.tagNames')
    const langKey = get(this, 'props.pageContext.langKey', defaultLangKey)

    return (
      <Layout
        location={this.props.location}
        langKey={langKey}
        title={
          langKey === defaultLangKey
            ? `${siteTitle} | Categories`
            : `${siteTitle} - ${supportedLanguages[langKey]} | Categories`
        }
      >
        <SEO
          title={
            langKey === defaultLangKey
              ? 'Categories'
              : `Categories in ${supportedLanguages[langKey]}`
          }
        />
        <ul>
          {tagNames.map(name => (
            <li key={name}>
              <Link
                to={
                  langKey === defaultLangKey
                    ? `/tags/${name}`
                    : `/${langKey}/tags/${name}`
                }
              >
                {getTranslator(langKey)(name)}
              </Link>
            </li>
          ))}
        </ul>
      </Layout>
    )
  }
}

export default TagIndexTemplate

export const pageQuery = graphql`
    query {
        site {
            siteMetadata {
                title
            }
        }
    }
`
