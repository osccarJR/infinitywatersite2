import type { ContentPage } from '../types';

/**
 * Guias (pilar de agua de pozo, agua de ciudad, pozo despues del huracan)
 * y paginas de problemas (olor a huevo podrido, manchas de hierro, sabor a
 * cloro, agua dura). Datos tomados de fuentes oficiales citadas en cada
 * bloque `facts`.
 */

const SRC = {
  dohLee: {
    url: "https://lee.floridahealth.gov/programs-and-services/environmental-health/drinking-water/",
  },
  ifasSulfur: {
    url: "https://blogs.ifas.ufl.edu/leeco/2017/05/13/q-open-aerator-water-system-now-smells-like-rotten-eggs-ideas-troubleshooting-problem/",
  },
  fdohFlood: {
    url: "https://palmbeach.floridahealth.gov/wp-content/uploads/sites/52/2025/06/what-to-do-if-well-is-flooded.pdf",
  },
  fortMyers: {
    url: "https://fortmyers.gov/DocumentCenter/View/25656/2025-Annual-Water-Quality-Report-PDF",
  },
  capeCoral: {
    url: "https://www.capecoral.gov/Documents/Document%20Hub/Water%20Quality%20Report/2024%20Water%20Quality%20Report%205.13.2025.pdf",
  },
  lcu: { url: "https://www.leegov.com/utilities/Documents/WaterQualityReport.pdf" },
  collier: {
    url: "https://www.collier.gov/files/assets/county/v/1/public-utilities/documents/water-division/2024-collier-county-water-quality-report-5-23-25.pdf",
  },
};

export const GUIDE_PAGES: ContentPage[] = [
  /* ------------------------------------------------------------------ */
  /* AGUA DE POZO (página pilar)                                         */
  /* ------------------------------------------------------------------ */
  {
    key: "well-water",
    kind: "guide",
    slug: { en: "well-water", es: "agua-de-pozo" },
    icon: "Droplets",
    photo: "family",
    related: ["well-water-systems", "rotten-egg-smell", "iron-stains", "hurricane-well-care"],
    en: {
      metaTitle: "Well Water in Southwest Florida: The Complete Guide",
      metaDescription:
        "Everything SW Florida well owners need: common problems like sulfur and iron, how testing works, solutions by problem and upkeep. Free in-home water test.",
      eyebrow: "Well water guide",
      title: "Your well, tested and under control.",
      lead: "No one tests a private well for you, so we find what's in your water and fix only what needs fixing.",
      highlights: ["Well water specialists", "Free in-home test", "Honest, no-pressure advice"],
      blocks: [
        {
          type: "prose",
          heading: "Your well, your responsibility",
          paragraphs: [
            "City water is tested and reported every year. A private well isn't. Our aquifers are rich in minerals and sulfur, and water changes with seasons, storms and construction. Our founder has 25+ years treating well water. We test first, then advise.",
          ],
        },
        {
          type: "facts",
          heading: "Florida well water, by numbers",
          items: [
            { label: "Floridians on private wells", value: "2.6 million+", detail: "Per the Florida Department of Environmental Protection (FDEP)." },
            { label: "How often to test", value: "At least once a year", detail: "For bacteria and chemicals, per the Department of Health." },
            { label: "Who is responsible", value: "The well owner", detail: "No agency tests a private well for you." },
            { label: "Certified lab in Lee County", value: "DOH-Lee", detail: "Certified lab for well water testing." },
          ],
          source: { label: "Florida Department of Health in Lee County — Drinking Water", url: SRC.dohLee.url },
        },
        {
          type: "facts",
          heading: "How much sulfur is too much?",
          items: [
            { label: "You start smelling it", value: "~0.1 mg/L", detail: "Even a tiny amount smells like rotten eggs." },
            { label: "It stains and corrodes", value: "~1 mg/L", detail: "Black stains, tarnished silverware, damaged plumbing." },
          ],
          source: { label: "UF/IFAS Extension Lee County", url: SRC.ifasSulfur.url },
        },
        {
          type: "features",
          heading: "The right fix for each problem",
          items: [
            { icon: "Wind", title: "Sulfur smell", text: "Air injection and catalytic carbon oxidize the sulfur and remove the odor." },
            { icon: "Shirt", title: "Orange iron stains", text: "An oxidation filter traps the iron and backwashes it away." },
            { icon: "Gauge", title: "Hard water scale", text: "A softener reduces calcium and magnesium to protect fixtures and your water heater." },
            { icon: "FlaskConical", title: "Bacteria", text: "UV systems are designed to disinfect water. We confirm it with a lab test." },
          ],
        },
        {
          type: "faq",
          heading: "Well water questions",
          items: [
            {
              q: "Is my well water safe to drink?",
              a: "Only a test can tell. Bacteria and many chemicals have no smell, color or taste.",
            },
            {
              q: "Is the in-home test really free?",
              a: "Yes. We test, explain the results in plain language and tell you honestly if you don't need a system.",
            },
            {
              q: "Who takes care of the system?",
              a: "We do. Equipment is made in the USA, we manage the manufacturer's warranty, and you get lifetime support while maintenance and payments stay current and the system is used correctly.",
            },
            {
              q: "What if I change my mind?",
              a: "Florida law lets you cancel an in-home sale until midnight of the third business day.",
            },
          ],
        },
        {
          type: "cta",
          title: "Find out what's in your well",
          text: "Book a free in-home water test. No pressure, no commitment.",
        },
      ],
    },
    es: {
      metaTitle: "Agua de pozo en el suroeste de Florida: guía completa",
      metaDescription:
        "Todo sobre el agua de pozo en el suroeste de Florida: azufre, hierro, dureza, cómo se analiza, soluciones por problema y mantenimiento. Análisis gratis en casa.",
      eyebrow: "Guía: agua de pozo",
      title: "Tu pozo, analizado y bajo control.",
      lead: "Nadie analiza un pozo privado por ti, así que vemos qué tiene tu agua y tratamos solo lo necesario.",
      highlights: ["Especialistas en pozos", "Análisis gratis en casa", "Consejo honesto, sin presión"],
      blocks: [
        {
          type: "prose",
          heading: "Tu pozo, tu responsabilidad",
          paragraphs: [
            "El agua de ciudad se analiza y se reporta cada año. Un pozo privado, no. Nuestros acuíferos tienen muchos minerales y azufre, y el agua cambia con temporadas, tormentas y obras. Nuestro fundador tiene más de 25 años tratándola. Primero analizamos, después aconsejamos.",
          ],
        },
        {
          type: "facts",
          heading: "El pozo en Florida, en cifras",
          items: [
            { label: "Floridanos con pozo privado", value: "Más de 2.6 millones", detail: "Según el Departamento de Protección Ambiental (FDEP)." },
            { label: "Cada cuánto analizarla", value: "Al menos una vez al año", detail: "Bacterias y químicos, según el Departamento de Salud." },
            { label: "Quién es responsable", value: "El dueño del pozo", detail: "Ninguna agencia analiza un pozo privado por ti." },
            { label: "Laboratorio certificado en Lee", value: "DOH-Lee", detail: "Laboratorio certificado para agua de pozo." },
          ],
          source: { label: "Departamento de Salud de Florida en Lee — Agua potable", url: SRC.dohLee.url },
        },
        {
          type: "facts",
          heading: "¿Cuánto azufre es demasiado?",
          items: [
            { label: "Empiezas a notar el olor", value: "~0.1 mg/L", detail: "Basta muy poco para oler a huevo podrido." },
            { label: "Empieza a manchar y corroer", value: "~1 mg/L", detail: "Manchas negras, cubiertos oscuros y tuberías dañadas." },
          ],
          source: { label: "UF/IFAS Extensión del condado de Lee", url: SRC.ifasSulfur.url },
        },
        {
          type: "features",
          heading: "La solución para cada problema",
          items: [
            { icon: "Wind", title: "Olor a azufre", text: "La inyección de aire y el carbón catalítico oxidan el azufre y quitan el olor." },
            { icon: "Shirt", title: "Manchas de hierro", text: "Un filtro de oxidación atrapa el hierro y lo desecha en el retrolavado." },
            { icon: "Gauge", title: "Sarro por dureza", text: "Un suavizador reduce el calcio y el magnesio y protege llaves y calentador." },
            { icon: "FlaskConical", title: "Bacterias", text: "Los sistemas UV están diseñados para desinfectar el agua. Lo confirmamos con laboratorio." },
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre agua de pozo",
          items: [
            {
              q: "¿El agua de mi pozo es segura para tomar?",
              a: "Solo un análisis lo dice. Las bacterias y muchos químicos no tienen olor, color ni sabor.",
            },
            {
              q: "¿De verdad el análisis en casa es gratis?",
              a: "Sí. Analizamos tu agua, te explicamos el resultado con palabras sencillas y te decimos si no necesitas un sistema.",
            },
            {
              q: "¿Quién se encarga del sistema?",
              a: "Nosotros. Equipos fabricados en EE. UU., garantía del fabricante gestionada por nosotros y soporte de por vida con mantenimientos y pagos al día y uso correcto.",
            },
            {
              q: "¿Y si me arrepiento?",
              a: "La ley de Florida te permite cancelar una venta hecha en tu casa hasta la medianoche del tercer día hábil.",
            },
          ],
        },
        {
          type: "cta",
          title: "Descubre qué tiene tu pozo",
          text: "Agenda tu análisis de agua gratis en casa. Sin presión y sin compromiso.",
        },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* AGUA DE CIUDAD                                                      */
  /* ------------------------------------------------------------------ */
  {
    key: "city-water",
    kind: "guide",
    slug: { en: "city-water", es: "agua-de-ciudad" },
    icon: "Building2",
    photo: "contaminants",
    related: ["whole-house-filtration", "chlorine-taste", "reverse-osmosis", "fort-myers"],
    en: {
      metaTitle: "City Water in SW Florida: What a Filter Can Improve",
      metaDescription:
        "City water in Fort Myers, Cape Coral, Lee and Collier is safe and usually soft. What a whole-house filter actually improves: chlorine, chloramines, taste.",
      eyebrow: "City water guide",
      title: "City water is safe. Taste can improve.",
      lead: "Your city water meets federal and state standards and is usually soft; a good filter improves taste, smell and byproducts.",
      highlights: ["Data from official reports", "Chlorine and chloramines explained", "Usually no softener needed"],
      blocks: [
        {
          type: "compare",
          heading: "Fort Myers, Cape Coral and Bonita",
          intro: "From each utility's latest water quality report. TTHM federal limit: 80 ppb.",
          columns: ["Treatment · disinfectant", "Key numbers"],
          rows: [
            { label: "Fort Myers", values: ["Reverse osmosis · chlorine 1.99 ppm", "Hardness ~30 ppm · sodium 114 ppm · TTHM 3.7 ppb"] },
            { label: "Cape Coral", values: ["Reverse osmosis · chlorine 1.34 ppm", "Hardness 5.5–6.5 gpg · sodium 86 ppm · TTHM 33.47 ppb"] },
            { label: "Bonita Springs", values: ["Lime + RO · chlorine/chloramines 3.44 ppm", "Sodium 83.1 ppm · TTHM 45 ppb"] },
          ],
        },
        {
          type: "facts",
          heading: "Collier: the number to watch",
          intro: "Every utility meets the limit. Collier's average comes closest.",
          items: [
            { label: "TTHM average", value: "60.4 ppb", detail: "Range 34.1–75.4 ppb. Federal limit: 80 ppb." },
            { label: "Disinfectant", value: "Chloramines, 3.4 ppm", detail: "Range 1.6–4.1. Free chlorine Jul 31–Aug 28, 2026." },
            { label: "Hardness", value: "2.4–5.5 gpg", detail: "42–94 mg/L: soft to moderately hard." },
            { label: "PFAS", value: "Not detected", detail: "UCMR5 sampling, October 2024." },
          ],
          source: { label: "Collier County 2024 Water Quality Report", url: SRC.collier.url },
        },
        {
          type: "facts",
          heading: "Why taste changes each spring",
          intro: "Chloramine utilities flush with free chlorine yearly. Taste and smell change for weeks.",
          items: [
            { label: "Lee County Utilities disinfectant", value: "Chloramines, 3.4 ppm", detail: "Range 0.6–4.0 ppm." },
            { label: "2025 chlorine flush", value: "May 1–21", detail: "Temporary free chlorine: stronger taste and odor." },
            { label: "Sodium", value: "36.7–67.8 ppm" },
            { label: "TTHM", value: "19.5 ppb", detail: "Federal limit: 80 ppb." },
          ],
          source: { label: "Lee County Utilities Water Quality Report", url: SRC.lcu.url },
        },
        {
          type: "features",
          heading: "What a filter actually improves",
          items: [
            { icon: "GlassWater", title: "Chlorine taste", text: "Whole-house catalytic carbon cuts the pool taste at every tap and shower." },
            { icon: "Filter", title: "Chloramines", text: "They need catalytic carbon. Regular carbon doesn't handle them well." },
            { icon: "FlaskConical", title: "Disinfection byproducts", text: "Carbon filtration and reverse osmosis can reduce TTHM." },
            { icon: "Droplet", title: "Sodium", text: "Reverse osmosis at the kitchen sink reduces sodium in your drinking water." },
          ],
        },
        {
          type: "faq",
          heading: "City water questions",
          items: [
            {
              q: "Do I need a softener on city water?",
              a: "Usually not. Water here is soft or moderately hard, and Cape Coral says homes on city water don't need a softener.",
            },
            {
              q: "Is my city water safe?",
              a: "Yes. It meets federal and state standards. A filter improves taste, smell and specific concerns.",
            },
            {
              q: "Is the free test for city water too?",
              a: "Yes. We test your tap, compare it with your utility's report and tell you if a system is worth it.",
            },
          ],
        },
        {
          type: "cta",
          title: "Is a filter worth it?",
          text: "Free in-home test. We compare your tap with your utility's report.",
        },
      ],
    },
    es: {
      metaTitle: "Agua de ciudad en SW Florida: qué mejora un filtro",
      metaDescription:
        "El agua municipal de Fort Myers, Cape Coral, Lee y Collier es segura y suele ser blanda. Te contamos qué mejora de verdad un filtro: cloro, cloraminas y sabor.",
      eyebrow: "Guía: agua de ciudad",
      title: "Agua de ciudad segura, con mejor sabor.",
      lead: "Tu agua de ciudad cumple las normas federales y estatales y suele ser blanda; un filtro mejora sabor, olor y subproductos.",
      highlights: ["Datos de reportes oficiales", "Cloro y cloraminas, explicados", "Casi nunca necesitas suavizador"],
      blocks: [
        {
          type: "compare",
          heading: "Fort Myers, Cape Coral y Bonita",
          intro: "Del reporte más reciente de cada empresa. Límite federal de TTHM: 80 ppb.",
          columns: ["Tratamiento · desinfectante", "Datos clave"],
          rows: [
            { label: "Fort Myers", values: ["Ósmosis inversa · cloro 1.99 ppm", "Dureza ~30 ppm · sodio 114 ppm · TTHM 3.7 ppb"] },
            { label: "Cape Coral", values: ["Ósmosis inversa · cloro 1.34 ppm", "Dureza 5.5–6.5 gpg · sodio 86 ppm · TTHM 33.47 ppb"] },
            { label: "Bonita Springs", values: ["Cal + ósmosis · cloro/cloraminas 3.44 ppm", "Sodio 83.1 ppm · TTHM 45 ppb"] },
          ],
        },
        {
          type: "facts",
          heading: "Collier: el dato a vigilar",
          intro: "Todas cumplen el límite. Collier es la que más se acerca.",
          items: [
            { label: "TTHM promedio", value: "60.4 ppb", detail: "Rango 34.1–75.4 ppb. Límite federal: 80 ppb." },
            { label: "Desinfectante", value: "Cloraminas, 3.4 ppm", detail: "Rango 1.6–4.1. Cloro libre: 31 jul–28 ago 2026." },
            { label: "Dureza", value: "2.4–5.5 gpg", detail: "42–94 mg/L: de blanda a moderadamente dura." },
            { label: "PFAS", value: "No detectados", detail: "Muestreo UCMR5, octubre de 2024." },
          ],
          source: { label: "Reporte de calidad del agua 2024 del condado de Collier", url: SRC.collier.url },
        },
        {
          type: "facts",
          heading: "Por qué cambia el sabor",
          intro: "Las empresas con cloraminas purgan con cloro libre cada año. Cambian sabor y olor.",
          items: [
            { label: "Desinfectante de Lee County Utilities", value: "Cloraminas, 3.4 ppm", detail: "Rango 0.6–4.0 ppm." },
            { label: "Purga con cloro en 2025", value: "1 al 21 de mayo", detail: "Cloro libre temporal: sabor y olor más fuertes." },
            { label: "Sodio", value: "36.7–67.8 ppm" },
            { label: "TTHM", value: "19.5 ppb", detail: "Límite federal: 80 ppb." },
          ],
          source: { label: "Reporte de calidad del agua de Lee County Utilities", url: SRC.lcu.url },
        },
        {
          type: "features",
          heading: "Lo que un filtro sí mejora",
          items: [
            { icon: "GlassWater", title: "Sabor a cloro", text: "Carbón catalítico en toda la casa: adiós al sabor a piscina." },
            { icon: "Filter", title: "Cloraminas", text: "Necesitan carbón catalítico. El carbón normal no las maneja bien." },
            { icon: "FlaskConical", title: "Subproductos de desinfección", text: "El carbón y la ósmosis inversa pueden reducir los TTHM." },
            { icon: "Droplet", title: "Sodio", text: "La ósmosis inversa en la cocina reduce el sodio del agua que tomas." },
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre agua de ciudad",
          items: [
            {
              q: "¿Necesito suavizador con agua de ciudad?",
              a: "Casi nunca. Aquí es blanda o moderadamente dura, y Cape Coral dice que con agua municipal no hace falta.",
            },
            {
              q: "¿El agua de mi ciudad es segura?",
              a: "Sí. Cumple las normas federales y estatales. Un filtro mejora sabor, olor y preocupaciones concretas.",
            },
            {
              q: "¿El análisis gratis sirve con agua de ciudad?",
              a: "Sí. Analizamos tu llave, la comparamos con el reporte oficial y te decimos si vale la pena un sistema.",
            },
          ],
        },
        {
          type: "cta",
          title: "¿Vale la pena un filtro?",
          text: "Análisis gratis en casa. Comparamos tu llave con el reporte oficial.",
        },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* POZO DESPUÉS DEL HURACÁN                                            */
  /* ------------------------------------------------------------------ */
  {
    key: "hurricane-well-care",
    kind: "guide",
    slug: { en: "hurricane-well-care", es: "pozo-despues-del-huracan" },
    icon: "CloudLightning",
    related: ["well-water", "maintenance", "well-water-systems", "cape-coral"],
    en: {
      metaTitle: "Well Flooded After a Hurricane? What to Do Next",
      metaDescription:
        "If storm water covered your well, don't drink it until it's tested. Step-by-step Florida Health guidance: disinfection, filter changes and retesting your water.",
      eyebrow: "Hurricane guide",
      title: "Flooded well? Here's what to do.",
      lead: "If flood water covered your well, it may be contaminated even if the water looks clear.",
      highlights: ["Official Florida Health guidance", "Test before you drink", "Disinfection and retesting"],
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "Don't drink your well water until it's tested",
          text: "If flood water covered your wellhead, use bottled or boiled water for drinking, cooking, brushing teeth and baby formula until a lab rules out bacteria.",
        },
        {
          type: "steps",
          heading: "What Florida Health recommends",
          intro: "Once flood water drops and power is safely back:",
          items: [
            { title: "Check pump and wiring", text: "If they were under water, have them inspected before turning anything on." },
            { title: "Pull cartridges and membranes", text: "Remove filter cartridges and RO membranes. Replace them after chlorinating; never reuse." },
            { title: "Shock chlorinate", text: "Disinfect well and plumbing. Backwash softeners and iron filters with chlorinated water." },
            { title: "Retest before drinking", text: "Flush the chlorine, install new cartridges, then confirm with a lab bacteria test." },
          ],
        },
        {
          type: "facts",
          heading: "Key points from the official guidance",
          items: [
            { label: "If the well was flooded", value: "Don't drink it", detail: "Use bottled or boiled water until it's tested." },
            { label: "Disinfection", value: "Shock chlorination", detail: "Well and plumbing. Backwash softeners and iron filters." },
            { label: "Filters and membranes", value: "Remove and replace", detail: "Out before chlorinating; new ones after." },
            { label: "Before drinking again", value: "Retest for bacteria" },
          ],
          source: { label: "Florida Department of Health — What to do if your well is flooded", url: SRC.fdohFlood.url },
        },
        {
          type: "features",
          heading: "How we help after a storm",
          intro: "In English and Spanish, 7 days a week.",
          items: [
            { icon: "Droplets", title: "Well disinfection", text: "Shock chlorination of well and plumbing, following health department guidance." },
            { icon: "Filter", title: "New cartridges, membranes", text: "We pull them before chlorinating and install new ones after." },
            { icon: "Settings", title: "Equipment check", text: "Softener and iron filter backwash, plus an honest look at what's salvageable." },
            { icon: "TestTube", title: "Retesting", text: "We retest your water and help you get the lab bacteria test." },
          ],
        },
        {
          type: "faq",
          heading: "Hurricane and well questions",
          items: [
            {
              q: "My water looks clear. Do I still need to disinfect?",
              a: "If flood water covered the wellhead, yes. Bacteria aren't visible.",
            },
            {
              q: "Can a filter or RO replace disinfection?",
              a: "No. Exposed filters and membranes get replaced, and the well must be disinfected and retested.",
            },
            {
              q: "What if my well didn't flood?",
              a: "The risk is lower. If smell, color or taste changed after the storm, test before drinking.",
            },
          ],
        },
        {
          type: "cta",
          title: "Need help after the storm?",
          text: "Message or call us. We'll disinfect, replace what's needed and retest.",
        },
      ],
    },
    es: {
      metaTitle: "¿Se inundó tu pozo tras el huracán? Qué hacer",
      metaDescription:
        "Si el agua de la tormenta cubrió tu pozo, no la tomes hasta analizarla. Guía paso a paso del Departamento de Salud: desinfección, filtros nuevos y reanálisis.",
      eyebrow: "Guía para huracanes",
      title: "¿Pozo inundado? Sigue estos pasos.",
      lead: "Si el agua de la inundación cubrió tu pozo, puede estar contaminado aunque el agua se vea limpia.",
      highlights: ["Guía oficial de Salud", "Analízala antes de tomarla", "Desinfección y nuevo análisis"],
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "No tomes el agua del pozo hasta analizarla",
          text: "Si la inundación cubrió el pozo, usa agua embotellada o hervida para tomar, cocinar, lavarte los dientes y preparar fórmula, hasta que un laboratorio descarte bacterias.",
        },
        {
          type: "steps",
          heading: "Lo que recomienda Salud",
          intro: "Cuando el agua baje y vuelva la electricidad de forma segura:",
          items: [
            { title: "Revisa bomba y cableado", text: "Si quedaron bajo el agua, haz que los revisen antes de encender nada." },
            { title: "Retira cartuchos y membranas", text: "Saca cartuchos y membranas de ósmosis. Se reemplazan después de clorar; no se reutilizan." },
            { title: "Haz una cloración de choque", text: "Desinfecta pozo y tubería. Retrolava suavizadores y filtros de hierro con agua clorada." },
            { title: "Analiza antes de tomarla", text: "Enjuaga el cloro, pon cartuchos nuevos y confirma con un análisis de bacterias." },
          ],
        },
        {
          type: "facts",
          heading: "Claves de la guía oficial",
          items: [
            { label: "Si el pozo se inundó", value: "No la tomes", detail: "Usa agua embotellada o hervida hasta analizarla." },
            { label: "Desinfección", value: "Cloración de choque", detail: "Pozo y tubería. Retrolavar suavizadores y filtros de hierro." },
            { label: "Filtros y membranas", value: "Retirar y reemplazar", detail: "Fuera antes de clorar; nuevos después." },
            { label: "Antes de volver a tomarla", value: "Nuevo análisis de bacterias" },
          ],
          source: { label: "Departamento de Salud de Florida — Qué hacer si tu pozo se inundó", url: SRC.fdohFlood.url },
        },
        {
          type: "features",
          heading: "Cómo te ayudamos tras la tormenta",
          intro: "En español y en inglés, los 7 días de la semana.",
          items: [
            { icon: "Droplets", title: "Desinfección del pozo", text: "Cloración de choque del pozo y la tubería, según la guía de Salud." },
            { icon: "Filter", title: "Cartuchos y membranas nuevos", text: "Los retiramos antes de clorar e instalamos nuevos después." },
            { icon: "Settings", title: "Revisión de equipos", text: "Retrolavado de suavizador y filtro de hierro, y te decimos qué se salva." },
            { icon: "TestTube", title: "Nuevo análisis", text: "Volvemos a analizar tu agua y te ayudamos con el análisis de bacterias." },
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre huracanes y pozos",
          items: [
            {
              q: "Mi agua se ve limpia. ¿Igual tengo que desinfectar?",
              a: "Si la inundación cubrió la cabeza del pozo, sí. Las bacterias no se ven.",
            },
            {
              q: "¿Un filtro o la ósmosis reemplazan la desinfección?",
              a: "No. Los filtros y membranas expuestos se reemplazan, y el pozo se desinfecta y se reanaliza.",
            },
            {
              q: "¿Y si mi pozo no se inundó?",
              a: "El riesgo es menor. Si cambió el olor, el color o el sabor tras la tormenta, analízala antes de tomarla.",
            },
          ],
        },
        {
          type: "cta",
          title: "¿Necesitas ayuda tras la tormenta?",
          text: "Escríbenos o llámanos. Desinfectamos, cambiamos lo necesario y volvemos a analizar.",
        },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* PROBLEMA: OLOR A HUEVO PODRIDO                                      */
  /* ------------------------------------------------------------------ */
  {
    key: "rotten-egg-smell",
    kind: "problem",
    slug: { en: "rotten-egg-smell", es: "olor-a-huevo-podrido" },
    icon: "Wind",
    photo: "smell",
    related: ["well-water", "well-water-systems", "iron-stains"],
    en: {
      metaTitle: "Rotten Egg Smell in Your Water? Causes and Fixes",
      metaDescription:
        "Water that smells like rotten eggs usually means hydrogen sulfide from your well. Learn what causes it, whether it's harmful and how to fix it. Free water test.",
      eyebrow: "Water problem",
      title: "Rotten egg smell? It has a fix.",
      lead: "That sulfur smell is the top complaint from Southwest Florida well owners, and it has a clear cause and proven fixes.",
      highlights: ["Natural hydrogen sulfide", "Smells at tiny levels", "Oxidation plus catalytic carbon"],
      blocks: [
        {
          type: "signs",
          heading: "Sound familiar?",
          items: [
            "Rotten egg smell at the tap or shower",
            "Stronger after water sits overnight",
            "Black stains in sinks and toilets",
            "Silverware and copper turn dark",
            "Smell only in hot water",
          ],
        },
        {
          type: "facts",
          heading: "How much it takes",
          items: [
            { label: "Noticeable smell", value: "~0.1 mg/L", detail: "You smell it at very low levels." },
            { label: "Staining and corrosion", value: "~1 mg/L", detail: "It stains and corrodes plumbing and fixtures." },
          ],
          source: { label: "UF/IFAS Extension Lee County", url: SRC.ifasSulfur.url },
        },
        {
          type: "callout",
          tone: "info",
          title: "Is it dangerous?",
          text: "At typical household levels, it's mainly a nuisance: smell, taste, stains and corrosion. But smell doesn't reveal what else is there. Test for bacteria too.",
        },
        {
          type: "features",
          heading: "How we fix it",
          intro: "It depends on your sulfur level and what else is in your water.",
          items: [
            { icon: "Wind", title: "Air injection", text: "Oxidizes the sulfur so a filter can remove it. The most common fix here." },
            { icon: "Filter", title: "Catalytic carbon", text: "Removes remaining odor and polishes the water after oxidation." },
            { icon: "ThermometerSun", title: "Water heater check", text: "Smell only in hot water? The fix may be the heater, not a system." },
            { icon: "GlassWater", title: "Reverse osmosis", text: "An extra stage for the water you drink and cook with." },
          ],
        },
        {
          type: "faq",
          heading: "Rotten egg smell questions",
          items: [
            { q: "Why is it worse in the morning?", a: "Water sitting in the pipes overnight builds up the gas. The first water of the day smells strongest." },
            { q: "Will a regular carbon filter fix it?", a: "Rarely on well water. Most wells here need oxidation first, then catalytic carbon." },
            { q: "Do I need a system for sure?", a: "Not necessarily. We check hot and cold water, test first and tell you honestly." },
          ],
        },
        {
          type: "cta",
          title: "Get rid of that smell",
          text: "Free in-home water test. We find the cause and tell you honestly.",
        },
      ],
    },
    es: {
      metaTitle: "¿Tu agua huele a huevo podrido? Causas y solución",
      metaDescription:
        "Si tu agua huele a huevo podrido, casi siempre es sulfuro de hidrógeno del pozo. Conoce la causa, si es peligroso y cómo se soluciona. Análisis gratis en casa.",
      eyebrow: "Problema del agua",
      title: "¿Olor a huevo podrido? Tiene solución.",
      lead: "Ese olor a azufre es la queja número uno de los dueños de pozo, y tiene causa clara y solución probada.",
      highlights: ["Sulfuro de hidrógeno natural", "Basta muy poco", "Oxidación y carbón catalítico"],
      blocks: [
        {
          type: "signs",
          heading: "¿Te suena conocido?",
          items: [
            "Olor a huevo podrido en la llave",
            "Huele más tras pasar la noche",
            "Manchas negras en lavamanos e inodoros",
            "Cubiertos y cobre que se oscurecen",
            "El olor solo sale con agua caliente",
          ],
        },
        {
          type: "facts",
          heading: "Cuánto hace falta",
          items: [
            { label: "Olor perceptible", value: "~0.1 mg/L", detail: "Se huele en concentraciones muy bajas." },
            { label: "Manchas y corrosión", value: "~1 mg/L", detail: "Mancha y corroe tuberías y accesorios." },
          ],
          source: { label: "UF/IFAS Extensión del condado de Lee", url: SRC.ifasSulfur.url },
        },
        {
          type: "callout",
          tone: "info",
          title: "¿Es peligroso?",
          text: "En los niveles habituales en casa, es sobre todo una molestia: olor, sabor, manchas y corrosión. Pero el olor no te dice qué más hay. Analiza también las bacterias.",
        },
        {
          type: "features",
          heading: "Cómo lo solucionamos",
          intro: "Depende de cuánto azufre tengas y de qué más tenga tu agua.",
          items: [
            { icon: "Wind", title: "Inyección de aire", text: "Oxida el azufre para que un filtro lo retenga. Es la solución más común aquí." },
            { icon: "Filter", title: "Carbón catalítico", text: "Quita el olor que queda y afina el agua después de la oxidación." },
            { icon: "ThermometerSun", title: "Revisión del calentador", text: "¿Solo huele el agua caliente? La solución puede ser el calentador, no un sistema." },
            { icon: "GlassWater", title: "Ósmosis inversa", text: "Una etapa extra para el agua que tomas y con la que cocinas." },
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre el olor",
          items: [
            { q: "¿Por qué huele peor en la mañana?", a: "El agua que pasa la noche en la tubería acumula el gas. La primera agua del día huele más fuerte." },
            { q: "¿Un filtro de carbón normal lo resuelve?", a: "Con agua de pozo, rara vez. La mayoría de los pozos de aquí necesitan primero oxidación y después carbón catalítico." },
            { q: "¿Seguro que necesito un sistema?", a: "No necesariamente. Revisamos el agua fría y la caliente, analizamos primero y te decimos la verdad." },
          ],
        },
        {
          type: "cta",
          title: "Despídete de ese olor",
          text: "Análisis de agua gratis en casa. Encontramos la causa y te decimos la verdad.",
        },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* PROBLEMA: MANCHAS DE HIERRO                                         */
  /* ------------------------------------------------------------------ */
  {
    key: "iron-stains",
    kind: "problem",
    slug: { en: "iron-stains", es: "manchas-de-hierro" },
    icon: "Shirt",
    photo: "stains",
    related: ["well-water", "well-water-systems", "rotten-egg-smell", "lehigh-acres"],
    en: {
      metaTitle: "Orange Iron Stains From Well Water? How to Fix Them",
      metaDescription:
        "Orange stains on laundry, sinks and walls hit by sprinklers usually mean iron in your well water. Causes, risks and real solutions. Free in-home water test.",
      eyebrow: "Water problem",
      title: "Iron stains, stopped at the source.",
      lead: "If laundry, sinks or sprinkler-hit walls are turning orange, your well water probably has iron, and it can be fixed.",
      highlights: ["Common in local wells", "Stains laundry and walls", "Fixed with oxidation filtration"],
      blocks: [
        {
          type: "prose",
          heading: "Why it happens",
          paragraphs: [
            "Groundwater picks up iron from rock and soil. In the well it's dissolved and invisible. When it meets air, it oxidizes into orange particles that stain everything, including walls hit by sprinklers.",
          ],
        },
        {
          type: "signs",
          heading: "Signs of iron",
          items: [
            "Orange or brown stains on laundry",
            "Rust rings in toilets and sinks",
            "Orange sprinkler streaks on walls",
            "Water turns cloudy after sitting",
            "Metallic taste in water or coffee",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Is iron dangerous?",
          text: "At typical well levels, it's mostly aesthetic: stains, taste and clogged fixtures. Problems often come together, so we test for more than iron.",
        },
        {
          type: "features",
          heading: "How we fix it",
          items: [
            { icon: "Wind", title: "Oxidation filter", text: "Turns dissolved iron into particles the filter traps and backwashes away." },
            { icon: "Filter", title: "Catalytic carbon", text: "Works alongside oxidation when sulfur is also present." },
            { icon: "Gauge", title: "Softener, if needed", text: "If your water is also hard, it protects fixtures from scale." },
            { icon: "Home", title: "Irrigation treatment", text: "If sprinklers stain your walls, we evaluate treating irrigation water too." },
          ],
        },
        {
          type: "faq",
          heading: "Iron stain questions",
          items: [
            { q: "Can't I just use a stain remover?", a: "It treats the symptom. Stains return every time you wash or water. Treating the water stops them at the source." },
            { q: "Why are my walls orange if my tap water looks fine?", a: "Irrigation often comes straight from the well, untreated. The iron oxidizes when it hits the wall." },
            { q: "Will a softener remove iron?", a: "Small amounts, but it isn't designed for it. At common local levels, an oxidation filter is usually the right tool." },
          ],
        },
        {
          type: "cta",
          title: "Stop the orange stains",
          text: "Free in-home test. We measure your iron and tell you honestly what it takes.",
        },
      ],
    },
    es: {
      metaTitle: "Manchas naranjas de hierro en el agua: solución",
      metaDescription:
        "Las manchas naranjas en la ropa, el lavamanos y las paredes del riego suelen ser hierro en el agua de pozo. Causas, riesgos y soluciones. Análisis gratis.",
      eyebrow: "Problema del agua",
      title: "Adiós a las manchas de hierro.",
      lead: "Si tu ropa, tus lavamanos o las paredes del riego se ponen naranjas, tu pozo probablemente tiene hierro, y tiene solución.",
      highlights: ["Común en pozos locales", "Mancha ropa y paredes", "Filtración por oxidación"],
      blocks: [
        {
          type: "prose",
          heading: "Por qué pasa",
          paragraphs: [
            "El agua subterránea recoge hierro de la roca y la tierra. En el pozo está disuelto y no se ve. Al tocar el aire, se oxida en partículas naranjas que manchan todo, incluso las paredes donde llega el riego.",
          ],
        },
        {
          type: "signs",
          heading: "Señales de hierro",
          items: [
            "Manchas naranjas o cafés en la ropa",
            "Aros de óxido en inodoros y lavamanos",
            "Rayas naranjas del riego en paredes",
            "Agua turbia después de reposar",
            "Sabor metálico en el agua o el café",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "¿El hierro es peligroso?",
          text: "En los niveles habituales de pozo, es sobre todo estético: manchas, sabor y accesorios tapados. Los problemas suelen venir juntos, así que analizamos más que el hierro.",
        },
        {
          type: "features",
          heading: "Cómo lo solucionamos",
          items: [
            { icon: "Wind", title: "Filtro de oxidación", text: "Convierte el hierro disuelto en partículas que el filtro atrapa y desecha en el retrolavado." },
            { icon: "Filter", title: "Carbón catalítico", text: "Trabaja junto con la oxidación cuando también hay azufre." },
            { icon: "Gauge", title: "Suavizador, si hace falta", text: "Si tu agua además es dura, protege baños y electrodomésticos del sarro." },
            { icon: "Home", title: "Tratamiento del riego", text: "Si los aspersores manchan tus paredes, evaluamos tratar también el agua de riego." },
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre las manchas de hierro",
          items: [
            { q: "¿No basta con un quitamanchas?", a: "Trata el síntoma. Las manchas vuelven cada vez que lavas o riegas. Tratar el agua las detiene desde el origen." },
            { q: "¿Por qué mis paredes están naranjas si el agua de la casa se ve bien?", a: "El riego muchas veces sale directo del pozo, sin tratar. El hierro se oxida al tocar la pared." },
            { q: "¿Un suavizador quita el hierro?", a: "Puede con poco, pero no está diseñado para eso. Con los niveles comunes aquí, lo indicado suele ser un filtro de oxidación." },
          ],
        },
        {
          type: "cta",
          title: "Acaba con las manchas naranjas",
          text: "Análisis gratis en casa. Medimos el hierro y te decimos qué hace falta.",
        },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* PROBLEMA: SABOR A CLORO                                             */
  /* ------------------------------------------------------------------ */
  {
    key: "chlorine-taste",
    kind: "problem",
    slug: { en: "chlorine-taste", es: "sabor-a-cloro" },
    icon: "GlassWater",
    photo: "contaminants",
    related: ["city-water", "whole-house-filtration", "reverse-osmosis"],
    en: {
      metaTitle: "Chlorine Taste in Tap Water? Why and How to Fix It",
      metaDescription:
        "Tap water that tastes or smells like a pool is safe, but unpleasant. Learn about chlorine vs. chloramines in SW Florida and which filter reduces them.",
      eyebrow: "Water problem",
      title: "Lose the pool taste at home.",
      lead: "It's the disinfectant your utility adds to keep water safe: not dangerous, but you don't have to live with it.",
      highlights: ["Safe, just unpleasant", "Chlorine or chloramines", "Catalytic carbon handles both"],
      blocks: [
        {
          type: "prose",
          heading: "Where it comes from",
          paragraphs: [
            "Every utility adds a disinfectant. Fort Myers and Cape Coral use chlorine. Lee County Utilities, Collier County and Bonita Springs use chloramines, a chlorine-ammonia mix. Chloramine utilities also do a yearly chlorine flush, when the taste gets stronger.",
          ],
        },
        {
          type: "facts",
          heading: "Disinfectant in Lee County Utilities",
          items: [
            { label: "Disinfectant", value: "Chloramines", detail: "Average 3.4 ppm (range 0.6–4.0 ppm)." },
            { label: "2025 chlorine flush", value: "May 1–21", detail: "Free chlorine: taste, odor and color can change." },
          ],
          source: { label: "Lee County Utilities Water Quality Report", url: SRC.lcu.url },
        },
        {
          type: "callout",
          tone: "success",
          title: "Is it dangerous?",
          text: "No. Disinfectant levels are regulated and utilities stay within limits. Filtering at home is about taste, smell and comfort, and can reduce disinfection byproducts.",
        },
        {
          type: "features",
          heading: "How we fix it",
          items: [
            { icon: "Home", title: "Whole-house catalytic carbon", text: "Reduces chlorine and chloramines at every tap and shower." },
            { icon: "GlassWater", title: "Reverse osmosis", text: "Great-tasting drinking water under the sink, with optional remineralization." },
            { icon: "CalendarCheck", title: "Scheduled maintenance", text: "We replace media and filters on time so the taste stays away." },
          ],
        },
        {
          type: "faq",
          heading: "Chlorine taste questions",
          items: [
            { q: "Will a pitcher filter do?", a: "It helps a little with chlorine in your glass. For chloramines and the shower, you need catalytic carbon where water enters the house." },
            { q: "Why does it taste worse some weeks?", a: "Your utility may be doing its yearly chlorine flush. It's temporary and planned." },
            { q: "Do I need a softener too?", a: "Usually not. City water here is soft or only moderately hard." },
          ],
        },
        {
          type: "cta",
          title: "Enjoy your tap water again",
          text: "Free in-home test. We check your disinfectant and recommend only what you need.",
        },
      ],
    },
    es: {
      metaTitle: "¿Tu agua sabe a cloro? Por qué pasa y cómo quitarlo",
      metaDescription:
        "Si el agua de la llave sabe o huele a piscina, es segura pero molesta. Te explicamos el cloro, las cloraminas y qué filtro los reduce. Análisis gratis.",
      eyebrow: "Problema del agua",
      title: "Adiós al sabor a piscina.",
      lead: "Es el desinfectante que añade tu empresa de agua para mantenerla segura: no es peligroso, pero no tienes por qué aguantarlo.",
      highlights: ["Segura, pero desagradable", "Cloro o cloraminas", "Carbón catalítico para ambos"],
      blocks: [
        {
          type: "prose",
          heading: "De dónde viene",
          paragraphs: [
            "Toda empresa de agua añade un desinfectante. Fort Myers y Cape Coral usan cloro. Lee County Utilities, el condado de Collier y Bonita Springs usan cloraminas, una mezcla de cloro y amoníaco. Estas hacen una purga anual con cloro, cuando el sabor se intensifica.",
          ],
        },
        {
          type: "facts",
          heading: "Desinfectante en Lee County Utilities",
          items: [
            { label: "Desinfectante", value: "Cloraminas", detail: "Promedio 3.4 ppm (rango 0.6–4.0 ppm)." },
            { label: "Purga con cloro en 2025", value: "1 al 21 de mayo", detail: "Cloro libre: pueden cambiar sabor, olor y color." },
          ],
          source: { label: "Reporte de calidad del agua de Lee County Utilities", url: SRC.lcu.url },
        },
        {
          type: "callout",
          tone: "success",
          title: "¿Es peligroso?",
          text: "No. Los niveles de desinfectante están regulados y las empresas cumplen los límites. Filtrar en casa es cuestión de sabor, olor y comodidad, y puede reducir subproductos.",
        },
        {
          type: "features",
          heading: "Cómo lo solucionamos",
          items: [
            { icon: "Home", title: "Carbón catalítico, toda casa", text: "Reduce el cloro y las cloraminas en todas las llaves y la ducha." },
            { icon: "GlassWater", title: "Ósmosis inversa", text: "Agua de muy buen sabor bajo el fregadero, con opción de remineralización." },
            { icon: "CalendarCheck", title: "Mantenimiento programado", text: "Cambiamos el medio y los filtros a tiempo para que el sabor no regrese." },
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre el sabor a cloro",
          items: [
            { q: "¿Una jarra con filtro sirve?", a: "Ayuda un poco con el cloro en tu vaso. Para las cloraminas y la ducha, necesitas carbón catalítico en la entrada de agua de la casa." },
            { q: "¿Por qué sabe peor algunas semanas?", a: "Puede que tu empresa de agua esté haciendo su purga anual con cloro. Es temporal y planificada." },
            { q: "¿También necesito un suavizador?", a: "Casi nunca. El agua de ciudad aquí es blanda o apenas moderadamente dura." },
          ],
        },
        {
          type: "cta",
          title: "Vuelve a disfrutar tu agua",
          text: "Análisis gratis en casa. Revisamos tu desinfectante y recomendamos solo lo necesario.",
        },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* PROBLEMA: AGUA DURA                                                 */
  /* ------------------------------------------------------------------ */
  {
    key: "hard-water",
    kind: "problem",
    slug: { en: "hard-water", es: "agua-dura" },
    icon: "Gauge",
    related: ["well-water", "well-water-systems", "city-water", "maintenance"],
    en: {
      metaTitle: "Hard Water From Your Well? Signs and Solutions",
      metaDescription:
        "Scale on faucets and a struggling water heater usually mean hard well water. Learn the signs, when a softener makes sense and when it doesn't. Free water test.",
      eyebrow: "Water problem",
      title: "Hard water: soften only if needed.",
      lead: "Southwest Florida limestone makes many wells hard, but city water here is usually soft; a free test shows your case.",
      highlights: ["Common in private wells", "City water: usually soft", "Softener only when needed"],
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "On city water? You likely don't need a softener",
          text: "City water here is treated with reverse osmosis, nanofiltration or lime. Fort Myers is about 30 ppm. If someone pushes a softener without testing, ask why.",
        },
        {
          type: "facts",
          heading: "Example: Cape Coral city water",
          items: [
            { label: "Hardness", value: "5.5–6.5 gpg", detail: "Reverse osmosis from the Upper Floridan aquifer." },
            { label: "Softener on city water", value: "Not needed", detail: "The city suggests a carbon filter for taste and odor." },
          ],
          source: { label: "City of Cape Coral 2024 Water Quality Report", url: SRC.capeCoral.url },
        },
        {
          type: "signs",
          heading: "Signs of hard water",
          items: [
            "White crust on faucets and shower glass",
            "Spots on dishes and glasses",
            "Soap that barely lathers",
            "Water heater noisy or heating less",
            "Clogged shower heads and aerators",
          ],
        },
        {
          type: "features",
          heading: "How we fix it",
          items: [
            { icon: "Gauge", title: "Water softener", text: "Reduces calcium and magnesium house-wide to prevent scale on fixtures and appliances." },
            { icon: "Filter", title: "Combined well treatment", text: "With iron or sulfur too, the softener joins a complete well system." },
            { icon: "CalendarCheck", title: "Salt and maintenance", text: "We tell you how much salt to expect and handle the upkeep." },
          ],
        },
        {
          type: "faq",
          heading: "Hard water questions",
          items: [
            { q: "Is hard water bad for my health?", a: "No. It's a problem for plumbing, appliances and cleaning, not a health risk." },
            { q: "How much salt does a softener use?", a: "It depends on your hardness and water use. We calculate it from your test, so there are no surprises." },
            { q: "Will you sell me a softener anyway?", a: "No. If your water is soft enough, we tell you, even if that means no sale." },
          ],
        },
        {
          type: "cta",
          title: "How hard is your water, really?",
          text: "Free in-home test. We measure hardness and tell you honestly if you need a softener.",
        },
      ],
    },
    es: {
      metaTitle: "Agua dura en tu pozo: señales y soluciones",
      metaDescription:
        "El sarro en las llaves y un calentador que rinde menos suelen indicar agua de pozo dura. Conoce las señales y cuándo conviene un suavizador. Análisis gratis.",
      eyebrow: "Problema del agua",
      title: "Agua dura: suavizador solo si hace falta.",
      lead: "La caliza de la zona endurece muchos pozos, pero el agua de ciudad aquí suele ser blanda; un análisis aclara tu caso.",
      highlights: ["Común en pozos privados", "Ciudad: casi siempre blanda", "Suavizador solo si conviene"],
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "¿Tienes agua de ciudad? Probablemente no necesitas suavizador",
          text: "El agua de ciudad aquí se trata con ósmosis inversa, nanofiltración o cal. La de Fort Myers ronda los 30 ppm. Si te venden suavizador sin analizar, pregunta por qué.",
        },
        {
          type: "facts",
          heading: "Ejemplo: agua de Cape Coral",
          items: [
            { label: "Dureza", value: "5.5–6.5 gpg", detail: "Ósmosis inversa desde el acuífero Floridano superior." },
            { label: "Suavizador con agua municipal", value: "No hace falta", detail: "La ciudad sugiere filtro de carbón para sabor y olor." },
          ],
          source: { label: "Reporte de calidad del agua 2024 de la ciudad de Cape Coral", url: SRC.capeCoral.url },
        },
        {
          type: "signs",
          heading: "Señales de agua dura",
          items: [
            "Costra blanca en llaves y vidrio de ducha",
            "Manchas en platos y vasos",
            "El jabón casi no hace espuma",
            "El calentador hace ruido o calienta menos",
            "Cabezales y aireadores tapados",
          ],
        },
        {
          type: "features",
          heading: "Cómo lo solucionamos",
          items: [
            { icon: "Gauge", title: "Suavizador de agua", text: "Reduce calcio y magnesio en toda la casa y evita el sarro en baños y electrodomésticos." },
            { icon: "Filter", title: "Tratamiento combinado", text: "Si también hay hierro o azufre, el suavizador va en un sistema completo para pozo." },
            { icon: "CalendarCheck", title: "Sal y mantenimiento", text: "Te decimos cuánta sal usarás y nos encargamos del mantenimiento." },
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre el agua dura",
          items: [
            { q: "¿El agua dura hace daño a la salud?", a: "No. Es un problema para la plomería, los electrodomésticos y la limpieza, no un riesgo para la salud." },
            { q: "¿Cuánta sal usa un suavizador?", a: "Depende de la dureza y de cuánta agua uses. Lo calculamos con tu análisis para que no haya sorpresas." },
            { q: "¿Igual me van a vender un suavizador?", a: "No. Si tu agua es lo bastante blanda, te lo decimos, aunque eso signifique no venderte nada." },
          ],
        },
        {
          type: "cta",
          title: "¿Qué tan dura es tu agua?",
          text: "Análisis gratis en casa. Medimos la dureza y te decimos si necesitas suavizador.",
        },
      ],
    },
  },
];
