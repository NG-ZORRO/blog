import React, { Fragment } from 'react'
import { Link } from 'gatsby'
import { supportedLanguages } from '../../../i18n'

import './translation-box.css'

class TranslationBox extends React.Component {
  render() {
    const { slug, translations, langKey } = this.props
    const isDefaultLang = langKey === 'zh-hans'

    const originalSlug = isDefaultLang ? slug : slug.replace(`/${langKey}`, '')
    const originalDest = `https://github.com/NG-ZORRO/blog/tree/master/content/blog${originalSlug}index.md`
    const sourceCodeDest = `https://github.com/NG-ZORRO/blog/tree/master/content/blog${originalSlug}index.${langKey}.md`

    return isDefaultLang ? (
      <div className="translation-box">
        {translations.length ? (
          <Fragment>
            <span className={'translated-hint'}>
              This article has been translated into these languages:
            </span>
            {translations.map(t => (
              <span>
                <Link to={`/${t}${slug}`}>{supportedLanguages[t]}</Link>
              </span>
            ))}
          </Fragment>
        ) : (
          <Fragment>
            <span className="translated-hint">
              There are currently no translations for this article.
            </span>
            <br />
            <br />
            <span>
              <a href={originalDest} target="_blank" rel="noopener noreferrer">
                Help us to translate it into a language that you are good with!
              </a>
            </span>
          </Fragment>
        )}
      </div>
    ) : (
      <div className="translation-box">
        <span className={'translated-hint'}>
          This article is translated into {supportedLanguages[langKey]}.
        </span>
        <br />
        <br />
        <span>
          <Link to={originalSlug}>See the original version in Chinese</Link>
          {' • '}
          <a href={sourceCodeDest} target={'_blank'} rel="noopener noreferrer">
            Help us to make this translation even better
          </a>
          {' • '}
          <Link to={`/${langKey}`}>
            See all translations in {supportedLanguages[langKey]}
          </Link>
        </span>
      </div>
    )
  }
}

export default TranslationBox
