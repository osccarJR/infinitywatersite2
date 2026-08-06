import { Link } from 'react-router-dom';
import { localizedPath } from '../i18n/routes';

/**
 * Renderiza un documento legal (privacidad o terminos) desde su estructura
 * de datos.
 *
 * Existe para que el texto viva en src/content/ y no dentro del JSX: asi el
 * contenido legal se puede revisar y comparar contra la especificacion A2P
 * sin leer marcado, y las dos paginas no divergen en presentacion.
 */
export default function LegalDocument({ doc, language, linkLanguage = language }) {
  return (
    <article className="legal-document">
      <h1 className="text-3xl md:text-4xl text-slate-900 mb-2">{doc.title}</h1>
      <p className="text-sm text-slate-500 mb-8">
        {doc.effectiveLabel}: {doc.effectiveDate}
      </p>

      <p className="text-slate-700 leading-relaxed mb-10">{doc.intro}</p>

      <div className="space-y-9">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl md:text-2xl text-slate-900 mb-3">{section.heading}</h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-slate-700 leading-relaxed mb-3">
                {paragraph}
              </p>
            ))}

            {section.items && (
              <ul className="list-disc pl-6 space-y-1.5 text-slate-700 leading-relaxed">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {section.address && (
              <address className="not-italic bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-1 text-slate-700">
                {section.address.map((line, index) => (
                  <p key={line} className={index === 0 ? 'font-semibold text-slate-900' : undefined}>
                    {line}
                  </p>
                ))}
              </address>
            )}

            {section.termsLink && (
              <p className="text-slate-700 leading-relaxed mt-4">
                {section.termsLink.before}
                <Link
                  to={localizedPath('terms', linkLanguage)}
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  {section.termsLink.label}
                </Link>
                {section.termsLink.after}
              </p>
            )}

            {section.smsPolicyLink && (
              <p className="text-slate-700 leading-relaxed">
                {section.smsPolicyLink.before}
                <Link
                  to={localizedPath('smsPolicy', linkLanguage)}
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  {section.smsPolicyLink.label}
                </Link>
                {section.smsPolicyLink.after}
              </p>
            )}

            {section.privacyLink && (
              <p className="text-slate-700 leading-relaxed">
                {section.privacyLink.before}
                <Link
                  to={localizedPath('privacy', linkLanguage)}
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  {section.privacyLink.label}
                </Link>
                {section.privacyLink.after}
              </p>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
