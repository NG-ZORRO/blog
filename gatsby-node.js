const _ = require('lodash')
const path = require(`path`)
const Promise = require('bluebird')
const { createFilePath } = require(`gatsby-source-filesystem`)
const { supportedLanguages } = require('./i18n')

const defaultLang = 'zh-hans'

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  // Create pages of pages of this blog.
  // TODO: generate categories and tags.
  // TODO: generate pagination.
  return new Promise((resolve, reject) => {
    const postTemplate = path.resolve('./src/templates/blog-post.js')
    const postIndex = path.resolve('./src/templates/blog-index.js')

    // Generate index page for each supported language.
    Object.keys(supportedLanguages).forEach(langKey => {
      createPage({
        // Every blog should have a Simplified Chinese translation.
        // Chinese (posts) is the default.
        path: langKey === defaultLang ? '/' : `/${langKey}/`,
        component: postIndex,
        context: {
          langKey,
        },
      })
    })

    // Query posts translated into different languages,
    // and generate a page for each.
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

        // Collect posts by article.
        const translationsByArticle = _.reduce(
          posts,
          (result, post) => {
            const articleName = _.get(post, 'node.fields.directoryName')
            const langKey = _.get(post, 'node.fields.langKey')

            if (articleName && langKey && langKey !== defaultLang) {
              (result[articleName] || (result[articleName] = [])).push(langKey)
            }

            return result
          },
          {}
        )

        const postsOfDefaultLang = posts.filter(({ node }) => {
          return node.fields.langKey === defaultLang
        })

        const postsOfOtherLangs = posts.filter(({ node }) => {
          return node.fields.langKey !== defaultLang
        })

        _.each(postsOfDefaultLang, (post, index) => {
          // Generate for the default language.
          const previous =
            index === postsOfDefaultLang.length - 1
              ? null
              : postsOfDefaultLang[index + 1].node
          const next = index === 0 ? null : postsOfDefaultLang[index - 1].node

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
              translatedLinks: [],
            },
          })

          // Generate for other languages.
          _.each(postsOfOtherLangs, (post, index) => {
            const translations =
              translationsByArticle[_.get(post, 'node.fields.directoryName')]
            let translatedLinks = []
            const { langKey, maybeAbsoluteLinks } = post.node.fields

            // maybeAbsoluteLinks.forEach(link => {
            //   if (allSlugs.has(link)) {
            //     if (allSlugs.has('/' + langKey + link)) {
            //       // This is legit an internal post link,
            //       // and it has been already translated.
            //       translatedLinks.push(link)
            //     } else if (link.startsWith('/' + langKey + '/')) {
            //       console.log('-----------------')
            //       console.error(
            //         `It looks like "${langKey}" translation of "${
            //           post.node.frontmatter.title
            //         }" ` +
            //           `is linking to a translated link: ${link}. Don't do this. Use the original link. ` +
            //           `The blog post renderer will automatically use a translation if it is available.`
            //       )
            //       console.log('-----------------')
            //     }
            //   }
            // })

            createPage({
              path: post.node.fields.slug,
              component: postTemplate,
              context: {
                slug: post.node.fields.slug,
                translations,
                translatedLinks,
              },
            })
          })
        })

        return null
      })
    )
  })
}

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
      value: maybeLangKey === 'md' ? defaultLang : maybeLangKey,
    })

    // Capture a list of what looks to be absolute internal links.
    // We'll later remember which of them have translations,
    // and use that to render localized internal links when available.

    // or that already link to translations.
    // const markdown = node.internal.content
    // let maybeAbsoluteLinks = []
    // let linkRe = /\]\((\/[^\)]+\/)\)/g
    // let match = linkRe.exec(markdown)
    // while (match != null) {
    //   maybeAbsoluteLinks.push(match[1])
    //   match = linkRe.exec(markdown)
    // }

    // createNodeField({
    //   node,
    //   name: 'maybeAbsoluteLinks',
    //   value: _.uniq(maybeAbsoluteLinks),
    // })
  }
}
