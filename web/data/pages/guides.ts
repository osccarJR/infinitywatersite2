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
      title: "Well water in Southwest Florida: everything you need to know",
      lead:
        "If your home runs on a private well, nobody tests that water for you. This guide walks you through the most common problems in Lee and Collier, how to find out what's really in your water and which solutions make sense for each case.",
      highlights: [
        "Well water is our specialty",
        "Free in-home test, no pressure",
        "Honest advice, even if you don't need a system",
      ],
      blocks: [
        {
          type: "prose",
          heading: "Your well, your responsibility",
          paragraphs: [
            "City water is treated, monitored and reported on every year. A private well is different: no utility tests it, nobody sends you a report and nobody calls you when something changes. In Florida, the well owner is the one responsible for the quality of that water.",
            "That doesn't mean well water is bad. Many wells in Southwest Florida give plenty of good water. But the aquifers here are rich in minerals and sulfur, and water can change with the seasons, droughts, storms and nearby construction. The only way to know is to test it.",
            "That's where we come in. Well water is our specialty, and our founder brings more than 25 years of experience treating it. We test, explain the results in plain language and tell you honestly whether you need a system or not.",
          ],
        },
        {
          type: "facts",
          heading: "Well water in Florida, by the numbers",
          items: [
            {
              label: "Floridians on private wells",
              value: "2.6 million+",
              detail: "According to the Florida Department of Environmental Protection (FDEP).",
            },
            {
              label: "How often to test",
              value: "At least once a year",
              detail: "The Department of Health recommends testing for bacteria and chemicals every year.",
            },
            {
              label: "Who is responsible",
              value: "The well owner",
              detail: "No agency tests a private well for you.",
            },
            {
              label: "Certified lab in Lee County",
              value: "DOH-Lee",
              detail: "The county health department runs a certified lab for well water testing.",
            },
          ],
          source: { label: "Florida Department of Health in Lee County — Drinking Water", url: SRC.dohLee.url },
        },
        {
          type: "features",
          heading: "The most common well water problems here",
          intro: "Most wells in Lee and Collier have one or more of these. Many have several at once, which is why testing comes before any recommendation.",
          items: [
            {
              icon: "Wind",
              title: "Sulfur (rotten egg smell)",
              text: "Hydrogen sulfide gives water that rotten egg smell. At higher levels it also stains and corrodes fixtures and plumbing.",
            },
            {
              icon: "Shirt",
              title: "Iron (orange stains)",
              text: "Orange and brown stains on clothes, sinks, toilets and on walls and driveways hit by sprinklers.",
            },
            {
              icon: "Gauge",
              title: "Hardness (scale)",
              text: "Calcium and magnesium leave white buildup on faucets, shower glass and inside your water heater.",
            },
            {
              icon: "Leaf",
              title: "Color and tannins",
              text: "Yellowish or tea-colored water from organic matter in the ground. Harmless in most cases, but unpleasant.",
            },
            {
              icon: "FlaskConical",
              title: "Bacteria",
              text: "You can't see, smell or taste them. Only a lab test can tell you if your well has bacteria.",
            },
            {
              icon: "Waves",
              title: "Salinity and chlorides",
              text: "Some older wells have salty water. The USGS measured 500–1,000 mg/L of chlorides in old agricultural wells in Lee County.",
            },
          ],
        },
        {
          type: "facts",
          heading: "How much sulfur is too much?",
          intro: "Hydrogen sulfide is the most common complaint we hear from well owners. Here's what the University of Florida says about it.",
          items: [
            {
              label: "You start smelling it",
              value: "~0.1 mg/L",
              detail: "Even a tiny amount is enough to notice the rotten egg odor.",
            },
            {
              label: "It starts staining and corroding",
              value: "~1 mg/L",
              detail: "Black stains, tarnished silverware and damage to plumbing and fixtures.",
            },
          ],
          source: { label: "UF/IFAS Extension Lee County", url: SRC.ifasSulfur.url },
        },
        {
          type: "steps",
          heading: "How we test your well water",
          intro: "The test is free, happens at your home and comes with no pressure to buy anything.",
          items: [
            {
              title: "We come to your home",
              text: "We schedule a visit at a time that works for you, in English or Spanish.",
            },
            {
              title: "We look at the whole system",
              text: "We check your well setup, pressure tank and any equipment you already have, and ask what you're noticing: smell, stains, taste, scale.",
            },
            {
              title: "We test on site",
              text: "We measure things like hardness, iron, sulfur, pH and dissolved solids right there, with you watching.",
            },
            {
              title: "Lab testing when it matters",
              text: "Bacteria can only be confirmed by a certified lab. If there's any reason for concern, we tell you and help you get a lab test.",
            },
            {
              title: "We explain the results",
              text: "Plain language, real numbers. If your water is fine, we say so. If it needs treatment, we show you exactly why.",
            },
          ],
        },
        {
          type: "compare",
          heading: "Solutions by problem",
          intro: "Every well is different, so the final design depends on your test. These are the usual starting points.",
          columns: ["Typical solution", "What it does"],
          rows: [
            {
              label: "Sulfur (rotten egg smell)",
              values: ["Air injection / oxidation + catalytic carbon", "Oxidizes the sulfur so it can be filtered out, and removes the odor."],
            },
            {
              label: "Iron (orange stains)",
              values: ["Air injection / oxidation filter", "Turns dissolved iron into particles the filter traps and backwashes away."],
            },
            {
              label: "Hardness (scale)",
              values: ["Water softener", "Reduces calcium and magnesium to protect fixtures, appliances and your water heater."],
            },
            {
              label: "Bacteria",
              values: ["UV system", "UV systems are designed to disinfect water. We confirm the result with a lab test."],
            },
            {
              label: "Salinity, taste, drinking water",
              values: ["Reverse osmosis at the kitchen sink", "Reduces dissolved solids, sodium and chlorides in the water you drink and cook with."],
            },
            {
              label: "Color and tannins",
              values: ["Depends on your test", "We design the treatment based on what's causing the color."],
            },
          ],
        },
        {
          type: "prose",
          heading: "Maintenance: what keeps a well system working",
          paragraphs: [
            "A well water system isn't install-and-forget. Softeners need salt, filters need their media and cartridges replaced on schedule, UV systems need their lamp and sleeve serviced, and reverse osmosis units need new filters and eventually a new membrane.",
            "We handle that maintenance for you and remind you when it's due. Our equipment is made in the USA, every part carries the manufacturer's warranty (which we manage for you), and you get lifetime support as long as your system stays up to date on maintenance and payments and is used correctly.",
          ],
        },
        {
          type: "signs",
          heading: "When to test your well",
          intro: "Beyond the yearly test the Department of Health recommends, test again if any of these happen:",
          items: [
            "It's been more than a year since your last test",
            "The smell, color or taste of your water changes",
            "You see new stains on fixtures, laundry or walls",
            "Your well was flooded or covered by storm water",
            "The well, pump or pressure tank was repaired",
            "You just bought a home with a well",
            "Someone in your home is pregnant, a baby is on the way or someone gets sick often",
            "Water pressure or volume drops, or nearby wells have run low",
          ],
        },
        {
          type: "faq",
          heading: "Well water questions",
          items: [
            {
              q: "Is my well water safe to drink?",
              a: "It may be, but the only way to know is to test it. Bacteria and many chemicals have no smell, color or taste. The Department of Health recommends testing at least once a year.",
            },
            {
              q: "Is the in-home test really free?",
              a: "Yes. We test, explain the results and give you our honest recommendation. No pressure and no commitment. If your water doesn't need a system, we'll tell you.",
            },
            {
              q: "Do I need one system or several?",
              a: "It depends on your water. Some wells only need a softener; others need sulfur and iron treatment plus a softener. We design it around your test, not around a package.",
            },
            {
              q: "What if I buy a system and change my mind?",
              a: "Under Florida law, for sales made in your home you can cancel until midnight of the third business day. We'd rather you decide calmly.",
            },
          ],
        },
        {
          type: "cta",
          title: "Find out what's really in your well",
          text: "Book a free in-home water test. We'll explain the results in plain language and tell you honestly whether you need a system.",
        },
      ],
    },
    es: {
      metaTitle: "Agua de pozo en el suroeste de Florida: guía completa",
      metaDescription:
        "Todo sobre el agua de pozo en el suroeste de Florida: azufre, hierro, dureza, cómo se analiza, soluciones por problema y mantenimiento. Análisis gratis en casa.",
      eyebrow: "Guía de agua de pozo",
      title: "Agua de pozo en el suroeste de Florida: todo lo que necesitas saber",
      lead:
        "Si tu casa usa pozo privado, nadie analiza esa agua por ti. En esta guía te explicamos los problemas más comunes en Lee y Collier, cómo saber qué tiene de verdad tu agua y qué solución tiene sentido en cada caso.",
      highlights: [
        "El agua de pozo es nuestra especialidad",
        "Análisis gratis en casa, sin presión",
        "Te decimos con honestidad si no necesitas nada",
      ],
      blocks: [
        {
          type: "prose",
          heading: "Tu pozo, tu responsabilidad",
          paragraphs: [
            "El agua de la ciudad se trata, se vigila y se reporta cada año. Un pozo privado es otra historia: ninguna empresa de agua lo analiza, nadie te manda un reporte y nadie te avisa si algo cambia. En Florida, el responsable de la calidad del agua del pozo es su dueño.",
            "Eso no quiere decir que el agua de pozo sea mala. Muchos pozos del suroeste de Florida dan agua abundante y buena. Pero los acuíferos de aquí tienen muchos minerales y azufre, y el agua puede cambiar con las temporadas, las sequías, las tormentas y las obras cercanas. La única forma de saberlo es analizarla.",
            "Ahí entramos nosotros. El agua de pozo es nuestra especialidad y nuestro fundador tiene más de 25 años de experiencia tratándola. Analizamos tu agua, te explicamos el resultado en palabras sencillas y te decimos con honestidad si necesitas un sistema o no.",
          ],
        },
        {
          type: "facts",
          heading: "El agua de pozo en Florida, en cifras",
          items: [
            {
              label: "Floridanos que dependen de pozo privado",
              value: "Más de 2.6 millones",
              detail: "Según el Departamento de Protección Ambiental de Florida (FDEP).",
            },
            {
              label: "Cada cuánto analizarla",
              value: "Al menos una vez al año",
              detail: "El Departamento de Salud recomienda analizar bacterias y químicos cada año.",
            },
            {
              label: "Quién es responsable",
              value: "El dueño del pozo",
              detail: "Ninguna agencia analiza un pozo privado por ti.",
            },
            {
              label: "Laboratorio certificado en Lee",
              value: "DOH-Lee",
              detail: "El Departamento de Salud del condado tiene un laboratorio certificado para analizar agua de pozo.",
            },
          ],
          source: { label: "Departamento de Salud de Florida en Lee — Agua potable", url: SRC.dohLee.url },
        },
        {
          type: "features",
          heading: "Los problemas más comunes del agua de pozo aquí",
          intro: "La mayoría de los pozos de Lee y Collier tienen uno o varios de estos. Muchos tienen varios a la vez; por eso primero se analiza y después se recomienda.",
          items: [
            {
              icon: "Wind",
              title: "Azufre (olor a huevo podrido)",
              text: "El sulfuro de hidrógeno le da al agua ese olor a huevo podrido. En niveles altos también mancha y corroe grifos y tuberías.",
            },
            {
              icon: "Shirt",
              title: "Hierro (manchas naranjas)",
              text: "Manchas naranjas o cafés en la ropa, el lavamanos, el inodoro y en paredes y entradas donde llega el riego.",
            },
            {
              icon: "Gauge",
              title: "Dureza (sarro)",
              text: "El calcio y el magnesio dejan costras blancas en las llaves, en el vidrio de la ducha y dentro del calentador.",
            },
            {
              icon: "Leaf",
              title: "Color y taninos",
              text: "Agua amarillenta o color té por materia orgánica del subsuelo. Casi siempre es inofensiva, pero desagradable.",
            },
            {
              icon: "FlaskConical",
              title: "Bacterias",
              text: "No se ven, no huelen y no saben a nada. Solo un análisis de laboratorio te dice si tu pozo tiene bacterias.",
            },
            {
              icon: "Waves",
              title: "Salinidad y cloruros",
              text: "Algunos pozos viejos dan agua salada. El USGS midió entre 500 y 1,000 mg/L de cloruros en pozos agrícolas antiguos de Lee.",
            },
          ],
        },
        {
          type: "facts",
          heading: "¿Cuánto azufre es demasiado?",
          intro: "El sulfuro de hidrógeno es la queja número uno que escuchamos de los dueños de pozo. Esto dice la Universidad de Florida.",
          items: [
            {
              label: "Empiezas a notar el olor",
              value: "~0.1 mg/L",
              detail: "Basta una cantidad mínima para sentir el olor a huevo podrido.",
            },
            {
              label: "Empieza a manchar y corroer",
              value: "~1 mg/L",
              detail: "Manchas negras, cubiertos oscurecidos y daño en tuberías y accesorios.",
            },
          ],
          source: { label: "UF/IFAS Extensión del condado de Lee", url: SRC.ifasSulfur.url },
        },
        {
          type: "steps",
          heading: "Cómo analizamos el agua de tu pozo",
          intro: "El análisis es gratis, se hace en tu casa y no te compromete a comprar nada.",
          items: [
            {
              title: "Vamos a tu casa",
              text: "Agendamos la visita a la hora que te quede mejor, en español o en inglés.",
            },
            {
              title: "Revisamos todo el sistema",
              text: "Miramos el pozo, el tanque de presión y los equipos que ya tengas, y te preguntamos qué notas: olor, manchas, sabor o sarro.",
            },
            {
              title: "Hacemos pruebas ahí mismo",
              text: "Medimos dureza, hierro, azufre, pH y sólidos disueltos frente a ti, para que veas cada resultado.",
            },
            {
              title: "Laboratorio cuando hace falta",
              text: "Las bacterias solo se confirman en un laboratorio certificado. Si hay motivo de preocupación, te lo decimos y te ayudamos a hacer ese análisis.",
            },
            {
              title: "Te explicamos el resultado",
              text: "Con palabras sencillas y números reales. Si tu agua está bien, te lo decimos. Si necesita tratamiento, te mostramos exactamente por qué.",
            },
          ],
        },
        {
          type: "compare",
          heading: "Soluciones según el problema",
          intro: "Cada pozo es distinto y el diseño final depende de tu análisis. Estos son los puntos de partida más comunes.",
          columns: ["Solución típica", "Para qué sirve"],
          rows: [
            {
              label: "Azufre (olor a huevo podrido)",
              values: ["Inyección de aire / oxidación + carbón catalítico", "Oxida el azufre para poder filtrarlo y quita el olor."],
            },
            {
              label: "Hierro (manchas naranjas)",
              values: ["Filtro de inyección de aire / oxidación", "Convierte el hierro disuelto en partículas que el filtro atrapa y desecha en el retrolavado."],
            },
            {
              label: "Dureza (sarro)",
              values: ["Suavizador de agua", "Reduce el calcio y el magnesio para proteger llaves, electrodomésticos y el calentador."],
            },
            {
              label: "Bacterias",
              values: ["Sistema UV", "Los sistemas UV están diseñados para desinfectar el agua. Lo confirmamos con un análisis de laboratorio."],
            },
            {
              label: "Salinidad, sabor, agua para beber",
              values: ["Ósmosis inversa bajo el fregadero", "Reduce sólidos disueltos, sodio y cloruros en el agua que tomas y con la que cocinas."],
            },
            {
              label: "Color y taninos",
              values: ["Según tu análisis", "Diseñamos el tratamiento según lo que esté causando el color."],
            },
          ],
        },
        {
          type: "prose",
          heading: "Mantenimiento: lo que mantiene funcionando tu sistema",
          paragraphs: [
            "Un sistema para agua de pozo no es de instalar y olvidar. El suavizador necesita sal, los filtros necesitan cambio de medio y cartuchos a tiempo, el sistema UV necesita servicio de lámpara y camisa, y la ósmosis inversa necesita filtros nuevos y, con el tiempo, una membrana nueva.",
            "Nosotros nos encargamos de ese mantenimiento y te avisamos cuando toca. Nuestros equipos son fabricados en EE. UU., cada pieza tiene la garantía del fabricante (que gestionamos por ti) y tienes soporte de por vida mientras tu sistema esté al día en mantenimientos y pagos y se use correctamente.",
          ],
        },
        {
          type: "signs",
          heading: "Cuándo analizar tu pozo",
          intro: "Además del análisis anual que recomienda el Departamento de Salud, vuelve a analizarlo si pasa algo de esto:",
          items: [
            "Pasó más de un año desde el último análisis",
            "Cambió el olor, el color o el sabor del agua",
            "Aparecen manchas nuevas en baños, ropa o paredes",
            "El pozo se inundó o lo cubrió el agua de una tormenta",
            "Se reparó el pozo, la bomba o el tanque de presión",
            "Acabas de comprar una casa con pozo",
            "Hay un embarazo, viene un bebé o alguien en casa se enferma seguido",
            "Baja la presión o el caudal, o los pozos vecinos se están quedando sin agua",
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre agua de pozo",
          items: [
            {
              q: "¿El agua de mi pozo es segura para tomar?",
              a: "Puede que sí, pero la única forma de saberlo es analizarla. Las bacterias y muchos químicos no tienen olor, color ni sabor. El Departamento de Salud recomienda analizar el pozo al menos una vez al año.",
            },
            {
              q: "¿De verdad el análisis en casa es gratis?",
              a: "Sí. Analizamos tu agua, te explicamos el resultado y te damos nuestra recomendación honesta, sin presión y sin compromiso. Si tu agua no necesita un sistema, te lo decimos.",
            },
            {
              q: "¿Necesito un solo equipo o varios?",
              a: "Depende de tu agua. Hay pozos que solo necesitan un suavizador y otros que necesitan tratamiento de azufre y hierro además del suavizador. Lo diseñamos según tu análisis, no según un paquete.",
            },
            {
              q: "¿Y si compro un sistema y me arrepiento?",
              a: "La ley de Florida te da derecho a cancelar una venta hecha en tu casa hasta la medianoche del tercer día hábil. Preferimos que decidas con calma.",
            },
          ],
        },
        {
          type: "cta",
          title: "Descubre qué tiene de verdad el agua de tu pozo",
          text: "Agenda tu análisis de agua gratis en casa. Te explicamos el resultado con palabras sencillas y te decimos con honestidad si necesitas un sistema.",
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
      title: "City water in Southwest Florida: an honest guide",
      lead:
        "Your city water is safe and meets federal and state standards. It's also usually soft here. So what can a filtration system actually improve? Here's the straight answer, with numbers from each utility's official report.",
      highlights: [
        "Real data from official water reports",
        "Chlorine and chloramines, explained",
        "We'll tell you if you don't need a system",
      ],
      blocks: [
        {
          type: "prose",
          heading: "First, the honest part",
          paragraphs: [
            "Public water in Lee and Collier counties is treated, tested constantly and reported on every year. It meets the law. Anyone who tells you your city water is dangerous to scare you into buying something isn't being straight with you.",
            "It's also soft or only moderately hard in most of the area, because several utilities treat it with reverse osmosis, nanofiltration or lime softening. Cape Coral itself says homes on city water don't need a softener.",
            "What a good system can improve is different: the taste and smell of chlorine or chloramines, disinfection byproducts, sodium in your drinking water and the effects of old pipes inside your home. That's where we focus.",
          ],
        },
        {
          type: "compare",
          heading: "How local city water compares",
          intro: "Summary of each utility's most recent Annual Water Quality Report (CCR). TTHM are disinfection byproducts; the federal limit is 80 ppb.",
          columns: ["Treatment and disinfectant", "Key numbers"],
          rows: [
            {
              label: "Fort Myers (city)",
              values: ["Reverse osmosis · chlorine (avg 1.99 ppm)", "Hardness ~30 ppm (soft) · sodium 114 ppm · TTHM 3.7 ppb"],
            },
            {
              label: "Cape Coral",
              values: ["Reverse osmosis · chlorine (1.34 ppm)", "Hardness 5.5–6.5 gpg · sodium 86 ppm · TTHM 33.47 ppb"],
            },
            {
              label: "Lee County Utilities (Lehigh, Estero and more)",
              values: ["Lime, RO, nanofiltration and river water · chloramines (3.4 ppm)", "Sodium 36.7–67.8 ppm · TTHM 19.5 ppb · yearly chlorine burn"],
            },
            {
              label: "Collier County (CCWSD)",
              values: ["Nanofiltration, RO and lime · chloramines (3.4 ppm)", "Hardness 2.4–5.5 gpg · TTHM 60.4 ppb avg"],
            },
            {
              label: "Bonita Springs Utilities",
              values: ["Lime + RO · chlorine/chloramines (3.44 ppm)", "Sodium 83.1 ppm · TTHM 45 ppb"],
            },
          ],
        },
        {
          type: "facts",
          heading: "The number worth watching: byproducts in Collier",
          intro: "Every utility meets the limit. Collier County's average is the closest to it, which is why some families choose to filter.",
          items: [
            { label: "TTHM average", value: "60.4 ppb", detail: "Range 34.1–75.4 ppb. Federal limit: 80 ppb (about 75% of the limit)." },
            { label: "Disinfectant", value: "Chloramines, 3.4 ppm", detail: "Range 1.6–4.1 ppm. In 2026 it temporarily switched to free chlorine (Jul 31–Aug 28)." },
            { label: "Hardness", value: "2.4–5.5 gpg", detail: "42–94 mg/L: soft to moderately hard." },
            { label: "PFAS", value: "Not detected", detail: "UCMR5 sampling, October 2024." },
          ],
          source: { label: "Collier County 2024 Water Quality Report", url: SRC.collier.url },
        },
        {
          type: "features",
          heading: "What a system can actually improve",
          items: [
            {
              icon: "GlassWater",
              title: "Chlorine and chloramine taste",
              text: "A whole-house catalytic carbon filter reduces the pool-like taste and smell in every tap and shower.",
            },
            {
              icon: "FlaskConical",
              title: "Disinfection byproducts",
              text: "Carbon filtration and reverse osmosis can reduce TTHM in the water you drink and bathe in.",
            },
            {
              icon: "Droplet",
              title: "Sodium",
              text: "Fort Myers water has 114 ppm of sodium. If you're on a low-sodium diet, reverse osmosis at the kitchen sink reduces it.",
            },
            {
              icon: "CookingPot",
              title: "Better taste for cooking and drinking",
              text: "Reverse osmosis gives you clean-tasting water for coffee, formula and cooking, with an optional remineralization stage.",
            },
            {
              icon: "Wrench",
              title: "Old pipes inside your home",
              text: "The utility is responsible up to your meter. Older plumbing inside the house can affect the water you actually get.",
            },
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Chloramines need catalytic carbon",
          text: "Lee County Utilities, Collier County and Bonita Springs use chloramines, which regular carbon doesn't handle well. If your utility uses chloramines, your filter should use catalytic carbon. We check which disinfectant your utility uses before recommending anything.",
        },
        {
          type: "facts",
          heading: "Why your water tastes different every spring",
          intro: "Utilities that use chloramines do an annual free-chlorine flush to keep the pipe network clean. During those weeks, taste, smell and even color can change.",
          items: [
            { label: "Lee County Utilities disinfectant", value: "Chloramines, 3.4 ppm", detail: "Range 0.6–4.0 ppm." },
            { label: "2025 chlorine flush", value: "May 1–21", detail: "Temporary switch to free chlorine; stronger taste and odor." },
            { label: "Sodium", value: "36.7–67.8 ppm" },
            { label: "TTHM", value: "19.5 ppb", detail: "Federal limit: 80 ppb." },
          ],
          source: { label: "Lee County Utilities Water Quality Report", url: SRC.lcu.url },
        },
        {
          type: "signs",
          heading: "Signs a filter could make sense for you",
          items: [
            "Your water tastes or smells like a swimming pool",
            "You buy bottled water because you don't like the tap",
            "Your skin or hair feels dry after showering",
            "Someone at home is on a low-sodium diet",
            "You notice changes during the yearly chlorine flush",
            "Your home has old plumbing",
          ],
        },
        {
          type: "faq",
          heading: "City water questions",
          items: [
            {
              q: "Do I need a water softener on city water?",
              a: "Usually not. City water in this area is soft or only moderately hard. Cape Coral itself says a softener isn't needed on municipal water. If someone pushes a softener on city water without testing, ask why.",
            },
            {
              q: "Is my city water safe?",
              a: "Yes. It meets federal and state standards and is tested continuously. A filter is about improving taste, smell and specific concerns, not about making unsafe water safe.",
            },
            {
              q: "Will any carbon filter remove chloramines?",
              a: "Not well. Chloramines need catalytic carbon. That's why we check your utility's disinfectant first.",
            },
            {
              q: "Does the free test apply to city water too?",
              a: "Yes. We test at your home, compare it with your utility's report and tell you honestly whether a system is worth it for you.",
            },
          ],
        },
        {
          type: "cta",
          title: "Not sure a filter is worth it?",
          text: "Book a free in-home test. We'll compare your tap water with your utility's report and give you a straight answer.",
        },
      ],
    },
    es: {
      metaTitle: "Agua de ciudad en SW Florida: qué mejora un filtro",
      metaDescription:
        "El agua municipal de Fort Myers, Cape Coral, Lee y Collier es segura y suele ser blanda. Te contamos qué mejora de verdad un filtro: cloro, cloraminas y sabor.",
      eyebrow: "Guía de agua de ciudad",
      title: "Agua de ciudad en el suroeste de Florida: una guía honesta",
      lead:
        "El agua de tu ciudad es segura y cumple las normas federales y estatales. Además, aquí suele ser blanda. Entonces, ¿qué puede mejorar de verdad un sistema de filtración? Te lo contamos claro, con datos del reporte oficial de cada empresa de agua.",
      highlights: [
        "Datos reales de los reportes oficiales",
        "Cloro y cloraminas, explicados",
        "Te decimos si no necesitas un sistema",
      ],
      blocks: [
        {
          type: "prose",
          heading: "Primero, lo honesto",
          paragraphs: [
            "El agua pública de los condados de Lee y Collier se trata, se analiza todo el tiempo y se reporta cada año. Cumple la ley. Si alguien te dice que el agua de tu ciudad es peligrosa para asustarte y venderte algo, no está siendo sincero contigo.",
            "Además, en casi toda la zona es blanda o apenas moderadamente dura, porque varias empresas de agua la tratan con ósmosis inversa, nanofiltración o ablandamiento con cal. La propia ciudad de Cape Coral dice que con agua municipal no necesitas suavizador.",
            "Lo que sí puede mejorar un buen sistema es otra cosa: el sabor y el olor a cloro o cloraminas, los subproductos de la desinfección, el sodio del agua que tomas y el efecto de las tuberías viejas dentro de tu casa. Ahí es donde nos enfocamos.",
          ],
        },
        {
          type: "compare",
          heading: "Cómo se compara el agua de ciudad de la zona",
          intro: "Resumen del reporte anual de calidad del agua (CCR) más reciente de cada empresa. Los TTHM son subproductos de la desinfección; el límite federal es 80 ppb.",
          columns: ["Tratamiento y desinfectante", "Datos clave"],
          rows: [
            {
              label: "Fort Myers (ciudad)",
              values: ["Ósmosis inversa · cloro (prom. 1.99 ppm)", "Dureza ~30 ppm (blanda) · sodio 114 ppm · TTHM 3.7 ppb"],
            },
            {
              label: "Cape Coral",
              values: ["Ósmosis inversa · cloro (1.34 ppm)", "Dureza 5.5–6.5 gpg · sodio 86 ppm · TTHM 33.47 ppb"],
            },
            {
              label: "Lee County Utilities (Lehigh, Estero y más)",
              values: ["Cal, ósmosis inversa, nanofiltración y agua de río · cloraminas (3.4 ppm)", "Sodio 36.7–67.8 ppm · TTHM 19.5 ppb · purga anual con cloro"],
            },
            {
              label: "Condado de Collier (CCWSD)",
              values: ["Nanofiltración, ósmosis inversa y cal · cloraminas (3.4 ppm)", "Dureza 2.4–5.5 gpg · TTHM 60.4 ppb prom."],
            },
            {
              label: "Bonita Springs Utilities",
              values: ["Cal + ósmosis inversa · cloro/cloraminas (3.44 ppm)", "Sodio 83.1 ppm · TTHM 45 ppb"],
            },
          ],
        },
        {
          type: "facts",
          heading: "El dato que vale la pena vigilar: subproductos en Collier",
          intro: "Todas las empresas cumplen el límite. El promedio del condado de Collier es el que más se acerca, y por eso algunas familias prefieren filtrar.",
          items: [
            { label: "TTHM promedio", value: "60.4 ppb", detail: "Rango 34.1–75.4 ppb. Límite federal: 80 ppb (cerca del 75 % del límite)." },
            { label: "Desinfectante", value: "Cloraminas, 3.4 ppm", detail: "Rango 1.6–4.1 ppm. En 2026 cambió temporalmente a cloro libre (31 de julio al 28 de agosto)." },
            { label: "Dureza", value: "2.4–5.5 gpg", detail: "42–94 mg/L: de blanda a moderadamente dura." },
            { label: "PFAS", value: "No detectados", detail: "Muestreo UCMR5, octubre de 2024." },
          ],
          source: { label: "Reporte de calidad del agua 2024 del condado de Collier", url: SRC.collier.url },
        },
        {
          type: "features",
          heading: "Lo que un sistema sí puede mejorar",
          items: [
            {
              icon: "GlassWater",
              title: "Sabor a cloro y cloraminas",
              text: "Un filtro de carbón catalítico para toda la casa reduce ese sabor y olor a piscina en todas las llaves y en la ducha.",
            },
            {
              icon: "FlaskConical",
              title: "Subproductos de la desinfección",
              text: "La filtración con carbón y la ósmosis inversa pueden reducir los TTHM del agua que tomas y con la que te bañas.",
            },
            {
              icon: "Droplet",
              title: "Sodio",
              text: "El agua de Fort Myers tiene 114 ppm de sodio. Si llevas una dieta baja en sodio, la ósmosis inversa en la cocina lo reduce.",
            },
            {
              icon: "CookingPot",
              title: "Mejor sabor para tomar y cocinar",
              text: "La ósmosis inversa te da agua de buen sabor para el café, la fórmula del bebé y la cocina, con opción de remineralización.",
            },
            {
              icon: "Wrench",
              title: "Tuberías viejas dentro de tu casa",
              text: "La empresa de agua responde hasta tu medidor. Las tuberías viejas dentro de la casa pueden afectar el agua que de verdad te llega.",
            },
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Las cloraminas necesitan carbón catalítico",
          text: "Lee County Utilities, el condado de Collier y Bonita Springs usan cloraminas, y el carbón normal no las maneja bien. Si tu empresa de agua usa cloraminas, tu filtro debe llevar carbón catalítico. Antes de recomendarte algo, revisamos qué desinfectante usa la tuya.",
        },
        {
          type: "facts",
          heading: "Por qué tu agua sabe distinto cada primavera",
          intro: "Las empresas que usan cloraminas hacen una purga anual con cloro libre para mantener limpia la red. Durante esas semanas pueden cambiar el sabor, el olor y hasta el color del agua.",
          items: [
            { label: "Desinfectante de Lee County Utilities", value: "Cloraminas, 3.4 ppm", detail: "Rango 0.6–4.0 ppm." },
            { label: "Purga con cloro en 2025", value: "1 al 21 de mayo", detail: "Cambio temporal a cloro libre; sabor y olor más fuertes." },
            { label: "Sodio", value: "36.7–67.8 ppm" },
            { label: "TTHM", value: "19.5 ppb", detail: "Límite federal: 80 ppb." },
          ],
          source: { label: "Reporte de calidad del agua de Lee County Utilities", url: SRC.lcu.url },
        },
        {
          type: "signs",
          heading: "Señales de que un filtro puede tener sentido para ti",
          items: [
            "Tu agua sabe o huele a piscina",
            "Compras agua embotellada porque no te gusta la de la llave",
            "Sientes la piel o el cabello resecos después de bañarte",
            "Alguien en casa lleva una dieta baja en sodio",
            "Notas cambios durante la purga anual con cloro",
            "Tu casa tiene tuberías viejas",
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre agua de ciudad",
          items: [
            {
              q: "¿Necesito suavizador con agua de ciudad?",
              a: "Casi nunca. El agua municipal de la zona es blanda o apenas moderadamente dura, y la propia ciudad de Cape Coral dice que no hace falta suavizador. Si alguien te quiere vender uno sin analizar tu agua, pregúntale por qué.",
            },
            {
              q: "¿El agua de mi ciudad es segura?",
              a: "Sí. Cumple las normas federales y estatales y se analiza de forma continua. Un filtro sirve para mejorar el sabor, el olor y preocupaciones concretas, no para volver segura un agua insegura.",
            },
            {
              q: "¿Cualquier filtro de carbón quita las cloraminas?",
              a: "No bien. Las cloraminas necesitan carbón catalítico. Por eso primero revisamos qué desinfectante usa tu empresa de agua.",
            },
            {
              q: "¿El análisis gratis también es para agua de ciudad?",
              a: "Sí. Analizamos el agua en tu casa, la comparamos con el reporte de tu empresa de agua y te decimos con honestidad si vale la pena un sistema.",
            },
          ],
        },
        {
          type: "cta",
          title: "¿No sabes si vale la pena un filtro?",
          text: "Agenda tu análisis gratis en casa. Comparamos el agua de tu llave con el reporte de tu empresa de agua y te damos una respuesta clara.",
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
      title: "Your well after a hurricane or flood: what to do, step by step",
      lead:
        "If flood water covered your well, it may be contaminated even if it looks clear. Here's what the Florida Department of Health recommends, in order, and how we can help you get your water back.",
      highlights: [
        "Based on Florida Department of Health guidance",
        "Don't drink it until it's tested",
        "We help with disinfection and retesting",
      ],
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "Don't drink your well water until it's tested",
          text: "If flood water covered your wellhead, use bottled water or water brought to a rolling boil for drinking, cooking, brushing teeth and preparing baby formula until a lab test confirms the well is free of bacteria.",
        },
        {
          type: "prose",
          heading: "Why flooding is a problem for wells",
          paragraphs: [
            "Storm surge and flood water carry soil, sewage from septic systems, chemicals and salt water. If that water reaches the top of your well or gets into the casing, it can contaminate the whole system: the well, the pressure tank, the pipes and any treatment equipment.",
            "This isn't theoretical in Southwest Florida. Hurricane Ian in 2022 brought a 6 to 9 foot storm surge to Cape Coral and Pine Island, and many homes in the area depend on private wells.",
          ],
        },
        {
          type: "signs",
          heading: "Signs your well may be affected",
          items: [
            "Flood water covered or reached the wellhead",
            "Your water is cloudy, muddy or has a new color",
            "The smell or taste changed after the storm",
            "The water tastes salty",
            "The pump, electrical or casing was damaged",
            "Your septic system flooded or backed up",
          ],
        },
        {
          type: "steps",
          heading: "What Florida Health recommends, step by step",
          intro: "Once the flood water has gone down and power is safely back on:",
          items: [
            {
              title: "Use safe water for everything you drink",
              text: "Bottled or boiled water for drinking, cooking and brushing teeth. Don't use the well for that yet.",
            },
            {
              title: "Check the well and electrical first",
              text: "If the pump or wiring was under water, have them inspected before turning anything on.",
            },
            {
              title: "Pull cartridges and membranes",
              text: "Remove filter cartridges and reverse osmosis membranes before disinfecting. They get replaced after chlorination, not reused.",
            },
            {
              title: "Shock chlorinate the well",
              text: "Disinfect the well and plumbing with a shock chlorination, and backwash softeners and iron filters with chlorinated water.",
            },
            {
              title: "Flush and install new cartridges",
              text: "Once the chlorine is flushed out, install new cartridges and membranes.",
            },
            {
              title: "Retest for bacteria before drinking",
              text: "Only drink the water again once a lab test confirms it's safe. The DOH-Lee lab is certified for well water testing.",
            },
          ],
        },
        {
          type: "facts",
          heading: "The key points from the official guidance",
          items: [
            { label: "If the well was flooded", value: "Don't drink it", detail: "Use bottled or boiled water until it's tested." },
            { label: "Disinfection", value: "Shock chlorination", detail: "Of the well and the home's plumbing." },
            { label: "Filters and membranes", value: "Remove and replace", detail: "Take them out before chlorinating; install new ones after." },
            { label: "Softeners and iron filters", value: "Backwash with chlorinated water" },
            { label: "Before drinking again", value: "Retest for bacteria" },
          ],
          source: { label: "Florida Department of Health — What to do if your well is flooded", url: SRC.fdohFlood.url },
        },
        {
          type: "features",
          heading: "How we help after a storm",
          intro: "We know well systems inside and out, and we answer in English and Spanish, 7 days a week.",
          items: [
            {
              icon: "Droplets",
              title: "Well disinfection",
              text: "We shock chlorinate your well and plumbing following the health department's guidance.",
            },
            {
              icon: "Filter",
              title: "Cartridge and membrane replacement",
              text: "We remove your cartridges and RO membranes before chlorinating and install new ones afterward.",
            },
            {
              icon: "Recycle",
              title: "Softener and filter backwash",
              text: "We backwash and sanitize your softener and iron filter so they don't hold on to contamination.",
            },
            {
              icon: "Settings",
              title: "Equipment check",
              text: "We check valves, bypasses and controls, and tell you honestly what can be saved and what can't.",
            },
            {
              icon: "TestTube",
              title: "Retesting",
              text: "We test your water again and help you get the lab bacteria test before your family drinks it.",
            },
          ],
        },
        {
          type: "faq",
          heading: "Hurricane and well questions",
          items: [
            {
              q: "My water looks clear. Do I still need to disinfect?",
              a: "If flood water covered the wellhead, yes. Bacteria aren't visible. Clear water can still be contaminated.",
            },
            {
              q: "Can I use a filter or RO system instead of disinfecting?",
              a: "No. Filters and membranes that were exposed need to be replaced, and the well itself needs to be disinfected and retested.",
            },
            {
              q: "Do I need to boil water if my well didn't flood?",
              a: "If the flood water never reached the well, the risk is lower. Still, if you notice any change in smell, color or taste after the storm, test it before drinking.",
            },
          ],
        },
        {
          type: "cta",
          title: "Need help with your well after the storm?",
          text: "Message or call us in English or Spanish. We'll help you disinfect, replace what's needed and retest your water.",
        },
      ],
    },
    es: {
      metaTitle: "¿Se inundó tu pozo tras el huracán? Qué hacer",
      metaDescription:
        "Si el agua de la tormenta cubrió tu pozo, no la tomes hasta analizarla. Guía paso a paso del Departamento de Salud: desinfección, filtros nuevos y reanálisis.",
      eyebrow: "Guía para huracanes",
      title: "Tu pozo después de un huracán o inundación: qué hacer paso a paso",
      lead:
        "Si el agua de la inundación cubrió tu pozo, puede estar contaminado aunque el agua se vea limpia. Te contamos, en orden, lo que recomienda el Departamento de Salud de Florida y cómo te ayudamos a recuperar tu agua.",
      highlights: [
        "Basado en la guía del Departamento de Salud",
        "No la tomes hasta analizarla",
        "Te ayudamos con la desinfección y el reanálisis",
      ],
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "No tomes el agua del pozo hasta analizarla",
          text: "Si el agua de la inundación cubrió la cabeza del pozo, usa agua embotellada o hervida para tomar, cocinar, lavarte los dientes y preparar la fórmula del bebé hasta que un análisis de laboratorio confirme que el pozo no tiene bacterias.",
        },
        {
          type: "prose",
          heading: "Por qué una inundación afecta al pozo",
          paragraphs: [
            "La marejada y el agua de la inundación arrastran tierra, aguas negras de los pozos sépticos, químicos y agua salada. Si esa agua llega a la parte de arriba del pozo o se mete en el revestimiento, puede contaminar todo el sistema: el pozo, el tanque de presión, las tuberías y los equipos de tratamiento.",
            "En el suroeste de Florida esto no es teoría. El huracán Ian, en 2022, trajo una marejada de 6 a 9 pies a Cape Coral y Pine Island, y muchas casas de la zona dependen de pozo privado.",
          ],
        },
        {
          type: "signs",
          heading: "Señales de que tu pozo pudo verse afectado",
          items: [
            "El agua de la inundación cubrió o llegó a la cabeza del pozo",
            "El agua sale turbia, con lodo o de otro color",
            "Cambió el olor o el sabor después de la tormenta",
            "El agua sabe salada",
            "Se dañó la bomba, la parte eléctrica o el revestimiento",
            "Tu pozo séptico se inundó o se desbordó",
          ],
        },
        {
          type: "steps",
          heading: "Lo que recomienda el Departamento de Salud, paso a paso",
          intro: "Cuando el agua haya bajado y la electricidad haya vuelto de forma segura:",
          items: [
            {
              title: "Usa agua segura para todo lo que tomes",
              text: "Agua embotellada o hervida para tomar, cocinar y lavarte los dientes. Todavía no uses el pozo para eso.",
            },
            {
              title: "Revisa primero el pozo y la electricidad",
              text: "Si la bomba o el cableado quedaron bajo el agua, haz que los revisen antes de encender nada.",
            },
            {
              title: "Retira cartuchos y membranas",
              text: "Saca los cartuchos de los filtros y las membranas de ósmosis inversa antes de desinfectar. Se reemplazan después de clorar; no se reutilizan.",
            },
            {
              title: "Haz una cloración de choque",
              text: "Desinfecta el pozo y la tubería con una cloración de choque, y retrolava los suavizadores y filtros de hierro con agua clorada.",
            },
            {
              title: "Enjuaga y pon cartuchos nuevos",
              text: "Cuando el cloro haya salido de la tubería, instala cartuchos y membranas nuevos.",
            },
            {
              title: "Vuelve a analizar antes de tomarla",
              text: "Solo vuelve a tomar el agua cuando un análisis de bacterias confirme que es segura. El laboratorio de DOH-Lee está certificado para agua de pozo.",
            },
          ],
        },
        {
          type: "facts",
          heading: "Los puntos clave de la guía oficial",
          items: [
            { label: "Si el pozo se inundó", value: "No la tomes", detail: "Usa agua embotellada o hervida hasta analizarla." },
            { label: "Desinfección", value: "Cloración de choque", detail: "Del pozo y de la tubería de la casa." },
            { label: "Filtros y membranas", value: "Retirar y reemplazar", detail: "Sácalos antes de clorar y pon nuevos después." },
            { label: "Suavizadores y filtros de hierro", value: "Retrolavar con agua clorada" },
            { label: "Antes de volver a tomarla", value: "Nuevo análisis de bacterias" },
          ],
          source: { label: "Departamento de Salud de Florida — Qué hacer si tu pozo se inundó", url: SRC.fdohFlood.url },
        },
        {
          type: "features",
          heading: "Cómo te ayudamos después de la tormenta",
          intro: "Conocemos los sistemas de pozo a fondo y te atendemos en español y en inglés, los 7 días de la semana.",
          items: [
            {
              icon: "Droplets",
              title: "Desinfección del pozo",
              text: "Hacemos la cloración de choque del pozo y de la tubería siguiendo la guía del Departamento de Salud.",
            },
            {
              icon: "Filter",
              title: "Cambio de cartuchos y membranas",
              text: "Retiramos los cartuchos y las membranas de ósmosis antes de clorar e instalamos nuevos después.",
            },
            {
              icon: "Recycle",
              title: "Retrolavado de suavizador y filtros",
              text: "Retrolavamos y desinfectamos tu suavizador y tu filtro de hierro para que no se queden con la contaminación.",
            },
            {
              icon: "Settings",
              title: "Revisión de equipos",
              text: "Revisamos válvulas, bypass y controles, y te decimos con honestidad qué se puede salvar y qué no.",
            },
            {
              icon: "TestTube",
              title: "Nuevo análisis",
              text: "Volvemos a analizar tu agua y te ayudamos con el análisis de bacterias de laboratorio antes de que tu familia la tome.",
            },
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre huracanes y pozos",
          items: [
            {
              q: "Mi agua se ve limpia. ¿Igual tengo que desinfectar?",
              a: "Si el agua de la inundación cubrió la cabeza del pozo, sí. Las bacterias no se ven. Un agua transparente puede estar contaminada.",
            },
            {
              q: "¿Puedo usar un filtro o la ósmosis en vez de desinfectar?",
              a: "No. Los filtros y membranas que estuvieron expuestos se deben reemplazar, y el pozo se tiene que desinfectar y volver a analizar.",
            },
            {
              q: "¿Tengo que hervir el agua si mi pozo no se inundó?",
              a: "Si el agua nunca llegó al pozo, el riesgo es menor. Aun así, si notas cualquier cambio de olor, color o sabor después de la tormenta, analízala antes de tomarla.",
            },
          ],
        },
        {
          type: "cta",
          title: "¿Necesitas ayuda con tu pozo después de la tormenta?",
          text: "Escríbenos o llámanos en español o en inglés. Te ayudamos a desinfectar, cambiar lo necesario y volver a analizar tu agua.",
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
      title: "Why your water smells like rotten eggs, and how to fix it",
      lead:
        "That sulfur smell is the most common complaint from well owners in Southwest Florida. The good news: it has a clear cause and proven solutions.",
      highlights: [
        "Usually hydrogen sulfide from the well",
        "Noticeable at very low levels",
        "Solved with oxidation and catalytic carbon",
      ],
      blocks: [
        {
          type: "prose",
          heading: "What causes it",
          paragraphs: [
            "The rotten egg smell comes from hydrogen sulfide, a gas that forms naturally underground. The aquifers in Southwest Florida are rich in sulfur, so many private wells here have it.",
            "If you only smell it in hot water, the cause may be different: a reaction inside the water heater, often involving the anode rod. That's why we always check both hot and cold water.",
          ],
        },
        {
          type: "signs",
          heading: "Signs you have sulfur in your water",
          items: [
            "Rotten egg smell when you open the tap or shower",
            "The smell is stronger after the water sits overnight",
            "Black stains in sinks, toilets or tubs",
            "Silverware and copper turn dark",
            "Coffee, tea and ice taste off",
            "The smell only shows up in hot water",
          ],
        },
        {
          type: "facts",
          heading: "How much it takes",
          items: [
            { label: "Noticeable smell", value: "~0.1 mg/L", detail: "You can smell it at very low concentrations." },
            { label: "Staining and corrosion", value: "~1 mg/L", detail: "From here it also stains and corrodes plumbing and fixtures." },
          ],
          source: { label: "UF/IFAS Extension Lee County", url: SRC.ifasSulfur.url },
        },
        {
          type: "callout",
          tone: "info",
          title: "Is it dangerous?",
          text: "At the levels usually found in household water, it's mainly a nuisance: bad smell, bad taste, stains and corrosion. But a smell doesn't tell you what else is in the water. A well that smells should be tested, including for bacteria.",
        },
        {
          type: "steps",
          heading: "How we confirm it",
          items: [
            { title: "Hot and cold check", text: "We compare both to know if the source is the well or the water heater." },
            { title: "On-site test", text: "We measure sulfur along with iron, hardness and pH, because they're often found together and affect the solution." },
            { title: "Clear explanation", text: "We show you the numbers and what they mean before recommending anything." },
          ],
        },
        {
          type: "features",
          heading: "Possible solutions",
          intro: "The right one depends on how much sulfur you have and what else is in your water.",
          items: [
            { icon: "Wind", title: "Air injection / oxidation", text: "Adds air to oxidize the sulfur so a filter can remove it. The most common solution for wells here." },
            { icon: "Filter", title: "Catalytic carbon", text: "Reduces remaining odor and polishes the water after oxidation." },
            { icon: "ThermometerSun", title: "Water heater check", text: "If the smell is only in hot water, the fix may be in the heater, not a new system." },
            { icon: "GlassWater", title: "Reverse osmosis for drinking", text: "Adds a final stage for the water you drink and cook with." },
          ],
        },
        {
          type: "prose",
          heading: "What happens if you don't treat it",
          paragraphs: [
            "The smell won't go away on its own. Over time, sulfur stains fixtures, darkens metals and corrodes plumbing and appliances. Many families end up buying bottled water just to avoid the taste.",
          ],
        },
        {
          type: "faq",
          heading: "Rotten egg smell questions",
          items: [
            { q: "Why is the smell worse in the morning?", a: "Water that sits in the pipes overnight lets the gas build up. The first water of the day usually smells the strongest." },
            { q: "Will a regular carbon filter fix it?", a: "Rarely on its own with well water. Most wells here need oxidation first, followed by catalytic carbon." },
            { q: "Can the smell come from the city water?", a: "It's uncommon. If you're on city water and notice it, it's often the water heater or a drain. We can help you find out." },
            { q: "Do I need a system for sure?", a: "Not necessarily. If it's only in hot water, the fix may be simpler. We test first and tell you honestly." },
          ],
        },
        {
          type: "cta",
          title: "Get rid of that smell for good",
          text: "Book a free in-home water test. We'll find the cause and tell you honestly what it takes to fix it.",
        },
      ],
    },
    es: {
      metaTitle: "¿Tu agua huele a huevo podrido? Causas y solución",
      metaDescription:
        "Si tu agua huele a huevo podrido, casi siempre es sulfuro de hidrógeno del pozo. Conoce la causa, si es peligroso y cómo se soluciona. Análisis gratis en casa.",
      eyebrow: "Problema del agua",
      title: "Por qué tu agua huele a huevo podrido y cómo solucionarlo",
      lead:
        "Ese olor a azufre es la queja más común de los dueños de pozo en el suroeste de Florida. La buena noticia: tiene una causa clara y soluciones probadas.",
      highlights: [
        "Casi siempre es sulfuro de hidrógeno del pozo",
        "Se nota incluso en niveles muy bajos",
        "Se soluciona con oxidación y carbón catalítico",
      ],
      blocks: [
        {
          type: "prose",
          heading: "Qué lo causa",
          paragraphs: [
            "El olor a huevo podrido viene del sulfuro de hidrógeno, un gas que se forma de manera natural bajo tierra. Los acuíferos del suroeste de Florida tienen mucho azufre, así que muchos pozos privados de aquí lo tienen.",
            "Si solo lo hueles en el agua caliente, la causa puede ser otra: una reacción dentro del calentador, muchas veces relacionada con la varilla de ánodo. Por eso siempre revisamos el agua fría y la caliente.",
          ],
        },
        {
          type: "signs",
          heading: "Señales de que tienes azufre en el agua",
          items: [
            "Olor a huevo podrido al abrir la llave o la ducha",
            "El olor es más fuerte cuando el agua pasó la noche en la tubería",
            "Manchas negras en lavamanos, inodoros o bañeras",
            "Los cubiertos y el cobre se oscurecen",
            "El café, el té y el hielo saben raro",
            "El olor solo aparece en el agua caliente",
          ],
        },
        {
          type: "facts",
          heading: "Cuánto hace falta",
          items: [
            { label: "Olor perceptible", value: "~0.1 mg/L", detail: "Se huele en concentraciones muy bajas." },
            { label: "Manchas y corrosión", value: "~1 mg/L", detail: "Desde aquí también mancha y corroe tuberías y accesorios." },
          ],
          source: { label: "UF/IFAS Extensión del condado de Lee", url: SRC.ifasSulfur.url },
        },
        {
          type: "callout",
          tone: "info",
          title: "¿Es peligroso?",
          text: "En los niveles que suelen encontrarse en el agua de casa, es sobre todo una molestia: mal olor, mal sabor, manchas y corrosión. Pero el olor no te dice qué más tiene el agua. Un pozo que huele mal se debe analizar, incluidas las bacterias.",
        },
        {
          type: "steps",
          heading: "Cómo lo confirmamos",
          items: [
            { title: "Agua fría y caliente", text: "Comparamos las dos para saber si el origen es el pozo o el calentador." },
            { title: "Análisis en tu casa", text: "Medimos el azufre junto con hierro, dureza y pH, porque suelen venir juntos y cambian la solución." },
            { title: "Explicación clara", text: "Te mostramos los números y lo que significan antes de recomendarte algo." },
          ],
        },
        {
          type: "features",
          heading: "Soluciones posibles",
          intro: "La correcta depende de cuánto azufre tengas y de qué más tenga tu agua.",
          items: [
            { icon: "Wind", title: "Inyección de aire / oxidación", text: "Agrega aire para oxidar el azufre y que un filtro lo retenga. Es la solución más común para los pozos de aquí." },
            { icon: "Filter", title: "Carbón catalítico", text: "Reduce el olor que quede y afina el agua después de la oxidación." },
            { icon: "ThermometerSun", title: "Revisión del calentador", text: "Si el olor es solo en el agua caliente, la solución puede estar en el calentador y no en un sistema nuevo." },
            { icon: "GlassWater", title: "Ósmosis inversa para tomar", text: "Una etapa final para el agua que tomas y con la que cocinas." },
          ],
        },
        {
          type: "prose",
          heading: "Qué pasa si no lo tratas",
          paragraphs: [
            "El olor no se va solo. Con el tiempo, el azufre mancha los baños, oscurece los metales y corroe tuberías y electrodomésticos. Muchas familias terminan comprando agua embotellada solo para no sentir el sabor.",
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre el olor a huevo podrido",
          items: [
            { q: "¿Por qué el olor es peor en la mañana?", a: "El agua que pasa la noche en la tubería acumula el gas. La primera agua del día suele oler más fuerte." },
            { q: "¿Un filtro de carbón normal lo resuelve?", a: "Con agua de pozo, rara vez por sí solo. La mayoría de los pozos de aquí necesitan primero oxidación y después carbón catalítico." },
            { q: "¿El olor puede venir del agua de la ciudad?", a: "No es lo común. Si tienes agua de ciudad y lo notas, muchas veces es el calentador o un desagüe. Te ayudamos a averiguarlo." },
            { q: "¿Seguro que necesito un sistema?", a: "No necesariamente. Si es solo en el agua caliente, la solución puede ser más sencilla. Primero analizamos y te decimos la verdad." },
          ],
        },
        {
          type: "cta",
          title: "Despídete de ese olor para siempre",
          text: "Agenda tu análisis de agua gratis en casa. Encontramos la causa y te decimos con honestidad qué hace falta para solucionarlo.",
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
      title: "Orange stains from iron in your water: causes and solutions",
      lead:
        "If your laundry, sinks or the walls hit by your sprinklers are turning orange, your well water probably has iron. It's very common in Southwest Florida, and it can be fixed.",
      highlights: [
        "Very common in SW Florida wells",
        "Stains laundry, fixtures and walls",
        "Solved with oxidation filtration",
      ],
      blocks: [
        {
          type: "prose",
          heading: "What causes it",
          paragraphs: [
            "Groundwater picks up iron as it moves through the rock and soil. Inside the well it's dissolved and invisible, so the water can come out clear. Once it meets air, it oxidizes and turns into the orange-brown particles that stain everything they touch.",
            "That's why sprinkler systems fed by a well leave orange streaks on walls, sidewalks and driveways, and why a glass of water can turn cloudy after sitting for a while.",
          ],
        },
        {
          type: "signs",
          heading: "Signs of iron in your water",
          items: [
            "Orange or brown stains on laundry, especially whites",
            "Rust-colored rings in toilets, sinks and tubs",
            "Orange streaks on walls, driveways and sidewalks from sprinklers",
            "Water that turns cloudy or yellowish after sitting",
            "Metallic taste in water, coffee or tea",
            "Slimy orange buildup in the toilet tank",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Is iron dangerous?",
          text: "At the levels typically found in well water, iron is mostly an aesthetic problem: stains, taste and clogged fixtures. It's not usually considered a health risk. Still, a well with iron should be tested for other things too, since problems often come together.",
        },
        {
          type: "steps",
          heading: "How we confirm it",
          items: [
            { title: "We measure iron on site", text: "We test the level so the solution is sized for your water, not guessed." },
            { title: "We check what comes with it", text: "Iron often comes with sulfur, hardness or low pH, and those change the right equipment." },
            { title: "We explain the options", text: "You see the numbers and the options, and decide without pressure." },
          ],
        },
        {
          type: "features",
          heading: "Possible solutions",
          items: [
            { icon: "Wind", title: "Air injection / oxidation filter", text: "Oxidizes dissolved iron so the filter can trap it, then backwashes it away automatically." },
            { icon: "Filter", title: "Catalytic carbon", text: "Works alongside oxidation when sulfur is also present." },
            { icon: "Gauge", title: "Softener, when there's hardness", text: "If your water is also hard, a softener protects fixtures and appliances from scale." },
            { icon: "Home", title: "Treatment for irrigation", text: "If the sprinklers are the problem, we evaluate whether irrigation water should be treated too." },
          ],
        },
        {
          type: "prose",
          heading: "What happens if you don't treat it",
          paragraphs: [
            "Iron stains keep building up and get harder to remove. It can ruin clothes, discolor fixtures and paint, and clog aerators, shower heads, valves and appliances over time.",
          ],
        },
        {
          type: "faq",
          heading: "Iron stain questions",
          items: [
            { q: "Can I just use a stain remover?", a: "It helps with the symptom, but the stains come back every time you wash or water. Treating the water stops them at the source." },
            { q: "Why are my walls orange if my house water looks fine?", a: "Irrigation often comes straight from the well without treatment. The iron oxidizes when it hits the wall and the sun." },
            { q: "Will a softener remove iron?", a: "It can handle small amounts, but it's not designed for it. With the iron levels common here, an oxidation filter is usually the right tool." },
          ],
        },
        {
          type: "cta",
          title: "Stop the orange stains",
          text: "Book a free in-home water test. We'll measure the iron and tell you honestly what it takes to stop the stains.",
        },
      ],
    },
    es: {
      metaTitle: "Manchas naranjas de hierro en el agua: solución",
      metaDescription:
        "Las manchas naranjas en la ropa, el lavamanos y las paredes del riego suelen ser hierro en el agua de pozo. Causas, riesgos y soluciones. Análisis gratis.",
      eyebrow: "Problema del agua",
      title: "Manchas naranjas por hierro en el agua: causas y soluciones",
      lead:
        "Si tu ropa, tus lavamanos o las paredes donde llega el riego se están poniendo naranjas, el agua de tu pozo probablemente tiene hierro. Es muy común en el suroeste de Florida y tiene solución.",
      highlights: [
        "Muy común en los pozos del SW de Florida",
        "Mancha ropa, baños y paredes",
        "Se soluciona con filtración por oxidación",
      ],
      blocks: [
        {
          type: "prose",
          heading: "Qué lo causa",
          paragraphs: [
            "El agua subterránea recoge hierro al pasar por la roca y la tierra. Dentro del pozo está disuelto y no se ve, así que el agua puede salir transparente. Cuando entra en contacto con el aire, se oxida y se convierte en esas partículas naranjas o cafés que manchan todo lo que tocan.",
            "Por eso los riegos que usan agua de pozo dejan rayas naranjas en paredes, aceras y entradas, y por eso un vaso de agua se puede poner turbio después de un rato.",
          ],
        },
        {
          type: "signs",
          heading: "Señales de hierro en el agua",
          items: [
            "Manchas naranjas o cafés en la ropa, sobre todo la blanca",
            "Aros color óxido en inodoros, lavamanos y bañeras",
            "Rayas naranjas en paredes, entradas y aceras por el riego",
            "Agua que se pone turbia o amarillenta después de reposar",
            "Sabor metálico en el agua, el café o el té",
            "Una capa viscosa naranja en el tanque del inodoro",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "¿El hierro es peligroso?",
          text: "En los niveles que suelen tener los pozos, el hierro es sobre todo un problema estético: manchas, sabor y accesorios tapados. Normalmente no se considera un riesgo para la salud. Aun así, un pozo con hierro se debe analizar completo, porque los problemas suelen venir juntos.",
        },
        {
          type: "steps",
          heading: "Cómo lo confirmamos",
          items: [
            { title: "Medimos el hierro en tu casa", text: "Sabemos el nivel exacto para que la solución se dimensione según tu agua, no a ojo." },
            { title: "Revisamos lo que viene con él", text: "El hierro suele venir con azufre, dureza o pH bajo, y eso cambia el equipo correcto." },
            { title: "Te explicamos las opciones", text: "Ves los números y las opciones, y decides sin presión." },
          ],
        },
        {
          type: "features",
          heading: "Soluciones posibles",
          items: [
            { icon: "Wind", title: "Filtro de inyección de aire / oxidación", text: "Oxida el hierro disuelto para que el filtro lo atrape y lo desecha solo en el retrolavado." },
            { icon: "Filter", title: "Carbón catalítico", text: "Trabaja junto con la oxidación cuando también hay azufre." },
            { icon: "Gauge", title: "Suavizador, si hay dureza", text: "Si tu agua además es dura, el suavizador protege baños y electrodomésticos del sarro." },
            { icon: "Home", title: "Tratamiento para el riego", text: "Si el problema son los aspersores, evaluamos si conviene tratar también el agua de riego." },
          ],
        },
        {
          type: "prose",
          heading: "Qué pasa si no lo tratas",
          paragraphs: [
            "Las manchas de hierro se van acumulando y cada vez cuesta más quitarlas. Pueden arruinar la ropa, decolorar baños y pintura, y con el tiempo tapar aireadores, cabezales de ducha, válvulas y electrodomésticos.",
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre las manchas de hierro",
          items: [
            { q: "¿No basta con un quitamanchas?", a: "Ayuda con el síntoma, pero las manchas vuelven cada vez que lavas o riegas. Tratar el agua las detiene desde el origen." },
            { q: "¿Por qué mis paredes están naranjas si el agua de la casa se ve bien?", a: "El riego muchas veces sale directo del pozo, sin tratamiento. El hierro se oxida al tocar la pared y el sol." },
            { q: "¿Un suavizador quita el hierro?", a: "Puede con cantidades pequeñas, pero no está diseñado para eso. Con los niveles de hierro comunes aquí, lo indicado suele ser un filtro de oxidación." },
          ],
        },
        {
          type: "cta",
          title: "Acaba con las manchas naranjas",
          text: "Agenda tu análisis de agua gratis en casa. Medimos el hierro y te decimos con honestidad qué hace falta para acabar con las manchas.",
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
      title: "Chlorine taste and smell in your tap water",
      lead:
        "If your water tastes like a swimming pool, it's the disinfectant your utility adds to keep it safe. It's not dangerous, but you don't have to live with it.",
      highlights: [
        "Safe, but unpleasant",
        "Chlorine or chloramines, depending on your utility",
        "Catalytic carbon handles both",
      ],
      blocks: [
        {
          type: "prose",
          heading: "What causes it",
          paragraphs: [
            "Every public water system adds a disinfectant so water stays safe all the way to your tap. Some local utilities use chlorine (Fort Myers, Cape Coral) and others use chloramines, a mix of chlorine and ammonia (Lee County Utilities, Collier County, Bonita Springs).",
            "The level can change during the year. Utilities that use chloramines do an annual free-chlorine flush, and during those weeks many people notice a much stronger taste and smell.",
          ],
        },
        {
          type: "facts",
          heading: "Disinfectant levels in Lee County Utilities",
          items: [
            { label: "Disinfectant", value: "Chloramines", detail: "Average 3.4 ppm (range 0.6–4.0 ppm)." },
            { label: "2025 chlorine flush", value: "May 1–21", detail: "Temporary switch to free chlorine; taste, odor and even color can change." },
          ],
          source: { label: "Lee County Utilities Water Quality Report", url: SRC.lcu.url },
        },
        {
          type: "signs",
          heading: "Signs",
          items: [
            "Your water tastes or smells like a pool",
            "The smell is strongest in the shower",
            "Coffee and tea taste flat or off",
            "Your skin or hair feels dry after bathing",
            "The taste gets stronger for a few weeks each year",
          ],
        },
        {
          type: "callout",
          tone: "success",
          title: "Is it dangerous?",
          text: "No. Disinfectant levels in city water are regulated and your utility stays within the limits. Reducing chlorine or chloramines at home is about taste, smell and comfort, and it can also reduce disinfection byproducts.",
        },
        {
          type: "steps",
          heading: "How we confirm it",
          items: [
            { title: "We identify your utility", text: "We check whether you get chlorine or chloramines, because it changes the filter you need." },
            { title: "We test at your tap", text: "We measure the disinfectant and compare it with your utility's report." },
            { title: "We recommend honestly", text: "If a simple kitchen solution is enough, we say so." },
          ],
        },
        {
          type: "features",
          heading: "Possible solutions",
          items: [
            { icon: "Home", title: "Whole-house catalytic carbon", text: "Reduces chlorine and chloramines in every tap and shower. Regular carbon isn't enough for chloramines." },
            { icon: "GlassWater", title: "Reverse osmosis under the sink", text: "Great-tasting water for drinking and cooking, with an optional remineralization stage for better taste." },
            { icon: "CalendarCheck", title: "Scheduled maintenance", text: "We replace media and filters on time so the taste doesn't come back." },
          ],
        },
        {
          type: "prose",
          heading: "What happens if you don't treat it",
          paragraphs: [
            "Nothing dangerous. But many families end up buying bottled water, filling jugs or putting up with a taste they don't like. A good system gives you water you actually want to drink from the tap.",
          ],
        },
        {
          type: "faq",
          heading: "Chlorine taste questions",
          items: [
            { q: "Will a pitcher filter do the job?", a: "For chlorine, it can help a little in the glass you drink. For chloramines, and for the shower, you need catalytic carbon at the point where water enters the house." },
            { q: "Why does my water taste worse some weeks?", a: "Your utility may be doing its annual free-chlorine flush. It's temporary and planned." },
            { q: "Do I need a softener too?", a: "Usually not on city water here, since it's soft or only moderately hard. We'll tell you if you don't need it." },
          ],
        },
        {
          type: "cta",
          title: "Enjoy your tap water again",
          text: "Book a free in-home test. We'll check your disinfectant and recommend only what you actually need.",
        },
      ],
    },
    es: {
      metaTitle: "¿Tu agua sabe a cloro? Por qué pasa y cómo quitarlo",
      metaDescription:
        "Si el agua de la llave sabe o huele a piscina, es segura pero molesta. Te explicamos el cloro, las cloraminas y qué filtro los reduce. Análisis gratis.",
      eyebrow: "Problema del agua",
      title: "Sabor y olor a cloro en el agua de la llave",
      lead:
        "Si tu agua sabe a piscina, es por el desinfectante que añade tu empresa de agua para mantenerla segura. No es peligroso, pero no tienes por qué aguantarlo.",
      highlights: [
        "Segura, pero desagradable",
        "Cloro o cloraminas, según tu empresa de agua",
        "El carbón catalítico reduce los dos",
      ],
      blocks: [
        {
          type: "prose",
          heading: "Qué lo causa",
          paragraphs: [
            "Todos los sistemas de agua pública añaden un desinfectante para que el agua llegue segura hasta tu llave. Algunas empresas de la zona usan cloro (Fort Myers, Cape Coral) y otras usan cloraminas, una mezcla de cloro y amoníaco (Lee County Utilities, condado de Collier, Bonita Springs).",
            "El nivel puede cambiar durante el año. Las empresas que usan cloraminas hacen una purga anual con cloro libre, y en esas semanas mucha gente nota un sabor y un olor mucho más fuertes.",
          ],
        },
        {
          type: "facts",
          heading: "Niveles de desinfectante en Lee County Utilities",
          items: [
            { label: "Desinfectante", value: "Cloraminas", detail: "Promedio 3.4 ppm (rango 0.6–4.0 ppm)." },
            { label: "Purga con cloro en 2025", value: "1 al 21 de mayo", detail: "Cambio temporal a cloro libre; pueden cambiar el sabor, el olor y hasta el color." },
          ],
          source: { label: "Reporte de calidad del agua de Lee County Utilities", url: SRC.lcu.url },
        },
        {
          type: "signs",
          heading: "Señales",
          items: [
            "Tu agua sabe o huele a piscina",
            "El olor es más fuerte en la ducha",
            "El café y el té saben raros o sin gracia",
            "Sientes la piel o el cabello resecos después de bañarte",
            "El sabor se vuelve más fuerte unas semanas cada año",
          ],
        },
        {
          type: "callout",
          tone: "success",
          title: "¿Es peligroso?",
          text: "No. Los niveles de desinfectante del agua de ciudad están regulados y tu empresa de agua se mantiene dentro de los límites. Reducir el cloro o las cloraminas en casa es cuestión de sabor, olor y comodidad, y además puede reducir los subproductos de la desinfección.",
        },
        {
          type: "steps",
          heading: "Cómo lo confirmamos",
          items: [
            { title: "Identificamos tu empresa de agua", text: "Revisamos si te llega cloro o cloraminas, porque eso cambia el filtro que necesitas." },
            { title: "Analizamos el agua de tu llave", text: "Medimos el desinfectante y lo comparamos con el reporte de tu empresa de agua." },
            { title: "Te recomendamos con honestidad", text: "Si con una solución sencilla en la cocina basta, te lo decimos." },
          ],
        },
        {
          type: "features",
          heading: "Soluciones posibles",
          items: [
            { icon: "Home", title: "Carbón catalítico para toda la casa", text: "Reduce el cloro y las cloraminas en todas las llaves y en la ducha. El carbón normal no basta para las cloraminas." },
            { icon: "GlassWater", title: "Ósmosis inversa bajo el fregadero", text: "Agua de muy buen sabor para tomar y cocinar, con opción de remineralización para mejorar el sabor." },
            { icon: "CalendarCheck", title: "Mantenimiento programado", text: "Cambiamos el medio y los filtros a tiempo para que el sabor no regrese." },
          ],
        },
        {
          type: "prose",
          heading: "Qué pasa si no lo tratas",
          paragraphs: [
            "Nada peligroso. Pero muchas familias terminan comprando agua embotellada, llenando garrafones o aguantando un sabor que no les gusta. Un buen sistema te da agua que de verdad quieres tomar de la llave.",
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre el sabor a cloro",
          items: [
            { q: "¿Una jarra con filtro sirve?", a: "Para el cloro, puede ayudar un poco en el vaso que tomas. Para las cloraminas y para la ducha, necesitas carbón catalítico en la entrada de agua de la casa." },
            { q: "¿Por qué mi agua sabe peor algunas semanas?", a: "Puede que tu empresa de agua esté haciendo su purga anual con cloro libre. Es temporal y está planificada." },
            { q: "¿También necesito un suavizador?", a: "Con agua de ciudad aquí, casi nunca, porque es blanda o apenas moderadamente dura. Si no lo necesitas, te lo decimos." },
          ],
        },
        {
          type: "cta",
          title: "Vuelve a disfrutar el agua de tu llave",
          text: "Agenda tu análisis gratis en casa. Revisamos tu desinfectante y te recomendamos solo lo que de verdad necesitas.",
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
      title: "Hard water: signs, causes and when a softener makes sense",
      lead:
        "Hard water is common in private wells in Southwest Florida. City water here is a different story: it's usually soft. Here's how to tell which case is yours.",
      highlights: [
        "Common in private wells",
        "City water here is usually soft",
        "A softener only when your test shows it",
      ],
      blocks: [
        {
          type: "prose",
          heading: "What causes it",
          paragraphs: [
            "Hard water has a lot of dissolved calcium and magnesium. Well water picks them up as it moves through limestone underground, and Southwest Florida sits on limestone. That's why hardness shows up in so many private wells here.",
            "When hard water is heated or evaporates, those minerals turn into scale: the white crust on faucets, shower glass and, where you can't see it, inside your water heater and pipes.",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "On city water? You probably don't need a softener",
          text: "Most city water in this area is soft or only moderately hard because it's treated with reverse osmosis, nanofiltration or lime. Fort Myers water is around 30 ppm, and Cape Coral says homes on city water don't need a softener. If someone recommends one for city water without testing, ask why.",
        },
        {
          type: "facts",
          heading: "Example: Cape Coral city water",
          items: [
            { label: "Hardness", value: "5.5–6.5 gpg", detail: "Treated with reverse osmosis from the Upper Floridan aquifer." },
            { label: "Softener on city water", value: "Not needed", detail: "The city recommends a carbon filter if you want to improve taste and odor." },
          ],
          source: { label: "City of Cape Coral 2024 Water Quality Report", url: SRC.capeCoral.url },
        },
        {
          type: "signs",
          heading: "Signs of hard water",
          items: [
            "White crust on faucets, shower heads and glass",
            "Spots on dishes and glasses after washing",
            "Soap and shampoo that don't lather well",
            "Dry skin and dull hair",
            "Your water heater makes noise or heats less",
            "Low flow from clogged shower heads and aerators",
          ],
        },
        {
          type: "steps",
          heading: "How we confirm it",
          items: [
            { title: "We measure hardness", text: "We test it at your home in grains per gallon (gpg) so you see the real number." },
            { title: "We check iron and pH too", text: "In wells, hardness usually comes with iron or sulfur, and that changes how the system is built." },
            { title: "We tell you if you need it", text: "If your water is soft enough, we say so, even if it means we don't sell you anything." },
          ],
        },
        {
          type: "features",
          heading: "Possible solutions",
          items: [
            { icon: "Gauge", title: "Water softener", text: "Reduces calcium and magnesium throughout the house to prevent scale on fixtures and appliances." },
            { icon: "Filter", title: "Combined well treatment", text: "If there's also iron or sulfur, we design the softener as part of a complete well system." },
            { icon: "GlassWater", title: "Reverse osmosis for drinking", text: "Optional stage for the water you drink and cook with." },
            { icon: "CalendarCheck", title: "Salt and maintenance", text: "We explain how much salt to expect and handle the maintenance so it keeps working." },
          ],
        },
        {
          type: "prose",
          heading: "What happens if you don't treat it",
          paragraphs: [
            "Hard water isn't a health risk. The cost is in your home: scale builds up inside the water heater, pipes and appliances, shower heads clog, and you spend more time and product cleaning spots and crust.",
          ],
        },
        {
          type: "faq",
          heading: "Hard water questions",
          items: [
            { q: "Is hard water bad for my health?", a: "No. Hardness is a problem for your plumbing, appliances and cleaning, not a health risk." },
            { q: "Do I need a softener on city water?", a: "In this area, usually not. City water here is soft or only moderately hard. We test before recommending anything." },
            { q: "How much salt does a softener use?", a: "It depends on your hardness and how much water you use. We calculate it with your test results so there are no surprises." },
          ],
        },
        {
          type: "cta",
          title: "Find out how hard your water really is",
          text: "Book a free in-home water test. We'll measure your hardness and tell you honestly whether you need a softener.",
        },
      ],
    },
    es: {
      metaTitle: "Agua dura en tu pozo: señales y soluciones",
      metaDescription:
        "El sarro en las llaves y un calentador que rinde menos suelen indicar agua de pozo dura. Conoce las señales y cuándo conviene un suavizador. Análisis gratis.",
      eyebrow: "Problema del agua",
      title: "Agua dura: señales, causas y cuándo conviene un suavizador",
      lead:
        "El agua dura es común en los pozos privados del suroeste de Florida. El agua de ciudad es otra historia: aquí suele ser blanda. Te explicamos cómo saber cuál es tu caso.",
      highlights: [
        "Común en pozos privados",
        "El agua de ciudad aquí suele ser blanda",
        "Suavizador solo si tu análisis lo indica",
      ],
      blocks: [
        {
          type: "prose",
          heading: "Qué la causa",
          paragraphs: [
            "El agua dura tiene mucho calcio y magnesio disueltos. El agua de pozo los recoge al pasar por la piedra caliza del subsuelo, y el suroeste de Florida está sobre caliza. Por eso la dureza aparece en tantos pozos privados de aquí.",
            "Cuando el agua dura se calienta o se evapora, esos minerales se convierten en sarro: la costra blanca en llaves, en el vidrio de la ducha y, donde no la ves, dentro del calentador y las tuberías.",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "¿Tienes agua de ciudad? Lo más probable es que no necesites suavizador",
          text: "Casi toda el agua de ciudad de la zona es blanda o apenas moderadamente dura, porque se trata con ósmosis inversa, nanofiltración o cal. El agua de Fort Myers ronda los 30 ppm, y la ciudad de Cape Coral dice que con agua municipal no hace falta suavizador. Si alguien te recomienda uno sin analizar tu agua, pregúntale por qué.",
        },
        {
          type: "facts",
          heading: "Ejemplo: el agua de ciudad de Cape Coral",
          items: [
            { label: "Dureza", value: "5.5–6.5 gpg", detail: "Tratada con ósmosis inversa desde el acuífero Floridano superior." },
            { label: "Suavizador con agua municipal", value: "No hace falta", detail: "La ciudad recomienda un filtro de carbón si quieres mejorar el sabor y el olor." },
          ],
          source: { label: "Reporte de calidad del agua 2024 de la ciudad de Cape Coral", url: SRC.capeCoral.url },
        },
        {
          type: "signs",
          heading: "Señales de agua dura",
          items: [
            "Costra blanca en llaves, cabezales de ducha y vidrios",
            "Manchas en platos y vasos después de lavarlos",
            "El jabón y el champú casi no hacen espuma",
            "Piel reseca y cabello opaco",
            "El calentador hace ruido o calienta menos",
            "Poca presión por cabezales y aireadores tapados",
          ],
        },
        {
          type: "steps",
          heading: "Cómo lo confirmamos",
          items: [
            { title: "Medimos la dureza", text: "La analizamos en tu casa en granos por galón (gpg) para que veas el número real." },
            { title: "Revisamos también hierro y pH", text: "En los pozos, la dureza suele venir con hierro o azufre, y eso cambia cómo se arma el sistema." },
            { title: "Te decimos si lo necesitas", text: "Si tu agua es lo bastante blanda, te lo decimos, aunque eso signifique no venderte nada." },
          ],
        },
        {
          type: "features",
          heading: "Soluciones posibles",
          items: [
            { icon: "Gauge", title: "Suavizador de agua", text: "Reduce el calcio y el magnesio en toda la casa para evitar el sarro en baños y electrodomésticos." },
            { icon: "Filter", title: "Tratamiento combinado para pozo", text: "Si también hay hierro o azufre, diseñamos el suavizador como parte de un sistema completo para pozo." },
            { icon: "GlassWater", title: "Ósmosis inversa para tomar", text: "Una etapa opcional para el agua que tomas y con la que cocinas." },
            { icon: "CalendarCheck", title: "Sal y mantenimiento", text: "Te explicamos cuánta sal vas a usar y nos encargamos del mantenimiento para que siga funcionando." },
          ],
        },
        {
          type: "prose",
          heading: "Qué pasa si no la tratas",
          paragraphs: [
            "El agua dura no es un riesgo para la salud. El costo lo paga tu casa: el sarro se acumula dentro del calentador, las tuberías y los electrodomésticos, los cabezales se tapan y gastas más tiempo y productos limpiando manchas y costras.",
          ],
        },
        {
          type: "faq",
          heading: "Preguntas sobre el agua dura",
          items: [
            { q: "¿El agua dura hace daño a la salud?", a: "No. La dureza es un problema para tu plomería, tus electrodomésticos y la limpieza, no un riesgo para la salud." },
            { q: "¿Necesito suavizador con agua de ciudad?", a: "En esta zona, casi nunca. El agua de ciudad aquí es blanda o apenas moderadamente dura. Siempre analizamos antes de recomendar algo." },
            { q: "¿Cuánta sal usa un suavizador?", a: "Depende de la dureza de tu agua y de cuánta agua uses. Lo calculamos con tu análisis para que no haya sorpresas." },
          ],
        },
        {
          type: "cta",
          title: "Descubre qué tan dura es tu agua de verdad",
          text: "Agenda tu análisis de agua gratis en casa. Medimos la dureza y te decimos con honestidad si necesitas un suavizador.",
        },
      ],
    },
  },
];
