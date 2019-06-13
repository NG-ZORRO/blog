// All languages supported by this website.
const supportedLanguages = {
  en: 'English',
  'zh-hans': '简体中文',
}

const defaultLangKey = 'zh-hans'

const withLangPrefix = (langKey, str) => {
  return langKey === defaultLangKey ? str : `/${langKey}${str}`
}

// NOTE: because of this bug of gatsby.js https://github.com/gatsbyjs/gatsby/issues/10058
// Names of category or tag cannot be inferred from `frontmatter`.
// Writers should register pairs of identifier and name here.
const categoryDict = {
  en: {
    other: 'Other',
    'dev-blog': 'Dev Blog'
  },
  'zh-hans': {
    other: '其他',
    'dev-blog': '开发日志'
  },
}

const tagDict = {
  en: {
    announcement: 'Announcement',
    carousel: 'Carousel',
    tutorial: 'Tutorial'
  },
  'zh-hans': {
    announcement: '公告',
    carousel: 'Carousel',
    tutorial: '教程'
  },
}

const getCategoryOrTagNameInLang = langKey => {
  return identifier => {
    return (
      categoryDict[langKey][identifier] ||
      tagDict[langKey][identifier] ||
      'Not Found'
    )
  }
}

module.exports = {
  supportedLanguages,
  defaultLangKey,
  withLangPrefix,
  getTranslator: getCategoryOrTagNameInLang
}
