import React from 'react'
import { Link } from 'gatsby'
import { supportedLanguages } from '../../../i18n'

import './translation-box.css'
import { Alert } from 'antd'

class TranslationBox extends React.Component {
  render() {
    const { slug, translations, langKey } = this.props
    const isDefaultLang = langKey === 'zh-hans'

    const originalSlug = isDefaultLang ? slug : slug.replace(`/${langKey}`, '')
    const originalDest = `https://github.com/NG-ZORRO/blog/tree/master/content/blog${originalSlug}index.md`
    const sourceCodeDest = `https://github.com/NG-ZORRO/blog/tree/master/content/blog${originalSlug}index.${langKey}.md`

    return isDefaultLang ? (
      <Alert
        type="warning"
        className="translation-box"
        description={
          translations.length ? (
            <p style={{ margin: 0 }}>
              <span className={'translated-hint'}>
                This article has been translated into these languages:
              </span>
              {translations.map((t, index) => (
                <span key={t}>
                  <Link to={`/${t}${slug}`}>{supportedLanguages[t]}</Link>
                  {index === translations.length - 1 ? '.' : ', '}
                </span>
              ))}
            </p>
          ) : (
            <p>
              <span className="translated-hint">
                There are currently no translations for this article.
              </span>
              <br />
              <br />
              <span>
                <a
                  href={originalDest}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Help us to translate it into a language that you are good
                  with!
                </a>
              </span>
            </p>
          )
        }
      />
    ) : (
      <Alert
        type="warning"
        className="translation-box"
        description={
          <p style={{ margin: 0 }}>
            <span className={'translated-hint'}>
              This article is translated into {supportedLanguages[langKey]}.
            </span>
            <br />
            <br />
            <span>
              <Link to={originalSlug}>See the original version in Chinese</Link>
              {' • '}
              <a
                href={sourceCodeDest}
                target={'_blank'}
                rel="noopener noreferrer"
              >
                Help us to make this translation even better
              </a>
              {' • '}
              <Link to={`/${langKey}`}>
                See all translations in {supportedLanguages[langKey]}
              </Link>
            </span>
          </p>
        }
      />
    )
  }
}

export default TranslationBox
