const _ = require('lodash')
const path = require(`path`)
const Promise = require('bluebird')
const { createFilePath } = require(`gatsby-source-filesystem`)
const { supportedLanguages, defaultLangKey, withLangPrefix } = require('./i18n')

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (_.get(node, 'internal.type') === `MarkdownRemark`) {
    const absPath = _.get(node, 'fileAbsolutePath')
    const dirname = path.basename(path.dirname(absPath))
    const fileName = path.basename(absPath)
    const fileNameSegs = fileName.split('.')
    const maybeLangKey = fileNameSegs[1]

    let rawSlug = createFilePath({ node, getNode })
    let parsedSlug = rawSlug

    if (rawSlug.match(/index\./)) {
      rawSlug = rawSlug.trim().split('/')
      rawSlug[0] = maybeLangKey
      rawSlug.splice(rawSlug.length - 2, 2, '')
      parsedSlug = '/' + rawSlug.join('/')
    }

    createNodeField({
      node,
      name: 'directoryName',
      value: dirname,
    })
    createNodeField({
      name: `slug`,
      node,
      value: parsedSlug,
    })
    createNodeField({
      node,
      name: 'langKey',
      value: maybeLangKey === 'md' ? defaultLangKey : maybeLangKey,
    })
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  // Create pages of pages of this blog.
  return new Promise((resolve, reject) => {
    const postIndex = path.resolve('./src/templates/blog-index.js')

    // Generate index page for each supported language.
    Object.keys(supportedLanguages).forEach(langKey => {
      createPage({
        // Every blog should have a Simplified Chinese translation.
        // Chinese (posts) is the default.
        path: withLangPrefix(langKey, `/`),
        component: postIndex,
        context: {
          langKey,
        },
      })
    })

    resolve(
      graphql(
        `
          {
            allMarkdownRemark(
              sort: { fields: [frontmatter___date], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  fields {
                    slug
                    langKey
                    directoryName
                  }
                  frontmatter {
                    title
                    category
                    tags
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        // Create blog posts pages.
        const posts = result.data.allMarkdownRemark.edges
        const postTemplate = path.resolve('./src/templates/blog-post.js')

        // Collect posts by article.
        const translationsByArticle = _.reduce(
          posts,
          (result, post) => {
            const directoryName = _.get(post, 'node.fields.directoryName')
            const langKey = _.get(post, 'node.fields.langKey')

            if (directoryName && langKey && langKey !== defaultLangKey) {
              ;(result[directoryName] || (result[directoryName] = [])).push(
                langKey
              )
            }

            return result
          },
          {}
        )

        const postsOfDefaultLangKey = posts.filter(({ node }) => {
          return node.fields.langKey === defaultLangKey
        })

        const postsOfOtherLangs = posts.filter(({ node }) => {
          return node.fields.langKey !== defaultLangKey
        })

        // Generate for the default language.
        _.each(postsOfDefaultLangKey, (post, index) => {
          const previous =
            index === postsOfDefaultLangKey.length - 1
              ? null
              : postsOfDefaultLangKey[index + 1].node
          const next =
            index === 0 ? null : postsOfDefaultLangKey[index - 1].node

          const translations =
            translationsByArticle[_.get(post, 'node.fields.directoryName')] ||
            []

          createPage({
            path: post.node.fields.slug,
            component: postTemplate,
            context: {
              slug: post.node.fields.slug,
              previous,
              next,
              translations,
            },
          })
        })

        // Generate translations of this post.
        // NOTE: this may be moved into the `each` above to build connections between different translations.
        _.each(postsOfOtherLangs, post => {
          createPage({
            path: post.node.fields.slug,
            component: postTemplate,
            context: {
              slug: post.node.fields.slug,
            },
          })
        })

        // Category.
        const noCategorySymbol = Symbol('no-category')

        const postsByLangAndCategories = _.reduce(
          posts,
          (result, post) => {
            const directoryName = _.get(post, 'node.fields.directoryName')
            const langKey = _.get(post, 'node.fields.langKey') || defaultLangKey
            const category =
              _.get(post, 'node.frontmatter.category') || noCategorySymbol

            if (directoryName) {
              ;(
                result[langKey][category] || (result[langKey][category] = [])
              ).push(post)
            }

            return result
          },
          (() => {
            const r = {}
            Object.keys(supportedLanguages).forEach(langKey => {
              r[langKey] = {}
            })
            return r
          })()
        )

        const categoryIndexTemplate = path.resolve(
          './src/templates/category-index.js'
        )
        const categoryPageTemplate = path.resolve('./src/templates/category.js')

        _.forEach(Object.keys(postsByLangAndCategories), langKey => {
          const categoryNames = Object.keys(postsByLangAndCategories[langKey])

          createPage({
            path: withLangPrefix(langKey, `/categories`),
            component: categoryIndexTemplate,
            context: {
              categoryNames,
              langKey,
            },
          })

          _.forEach(categoryNames, categoryName => {
            createPage({
              path: withLangPrefix(langKey, `/categories/${categoryName}`),
              component: categoryPageTemplate,
              context: {
                categoryName,
                langKey,
              },
            })
          })
        })

        // Tags.
        const noTagSymbol = Symbol('no tag')

        const postsByLangAndTags = _.reduce(
          posts,
          (result, post) => {
            const directoryName = _.get(post, 'node.fields.directoryName')
            const langKey = _.get(post, 'node.fields.langKey') || defaultLangKey
            const tagNames = _.get(post, 'node.frontmatter.tags') || noTagSymbol

            _.forEach(tagNames, tagName => {
              if (directoryName && tagName !== noTagSymbol) {
                ;(
                  result[langKey][tagName] || (result[langKey][tagName] = [])
                ).push(post)
              }
            })

            return result
          },
          (() => {
            const r = {}
            Object.keys(supportedLanguages).forEach(langKey => {
              r[langKey] = {}
            })
            return r
          })()
        )

        const tagIndexTemplate = path.resolve('./src/templates/tag-index.js')
        const tagPageTemplate = path.resolve('./src/templates/tag.js')

        _.forEach(Object.keys(postsByLangAndTags), langKey => {
          const tagNames = Object.keys(postsByLangAndTags[langKey])

          createPage({
            path: withLangPrefix(langKey, `/tags`),
            component: tagIndexTemplate,
            context: {
              tagNames,
              langKey,
            },
          })

          _.forEach(tagNames, tagName => {
            createPage({
              path: withLangPrefix(langKey, `/tags/${tagName}`),
              component: tagPageTemplate,
              context: {
                tagName,
                langKey,
              },
            })
          })
        })
      })
    )
  })
}
