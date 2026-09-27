/**
 * Datos del "Chequeo de agua" de la portada.
 *
 * Una sola interaccion: eliges pozo o ciudad y tocas lo que notas. La
 * respuesta es un titular de pocas palabras, una frase de causa y una de
 * solucion. El detalle vive en la pagina de cada problema (`pageKey`).
 */
import type { Lang } from './types';

type L = Record<Lang, string>;

export type Source = 'well' | 'city';

export type Answer = { headline: L; cause: L; action: L; pageKey: string };

export type Concern = {
  id: string;
  icon: string;
  label: L;
  result: Record<Source, Answer>;
};

export const CONCERNS: Concern[] = [
  {
    id: 'smell',
    icon: 'Wind',
    label: { en: 'Rotten-egg smell', es: 'Olor a huevo' },
    result: {
      well: {
        headline: { en: 'It’s sulfur.', es: 'Es azufre.' },
        cause: {
          en: 'Hydrogen sulfide, very common in Southwest Florida wells.',
          es: 'Sulfuro de hidrógeno, muy común en los pozos de la zona.',
        },
        action: {
          en: 'An air-injection system removes it before it reaches your taps.',
          es: 'Un sistema de inyección de aire lo elimina antes de llegar a tus llaves.',
        },
        pageKey: 'rotten-egg-smell',
      },
      city: {
        headline: { en: 'Probably your water heater.', es: 'Quizá tu calentador.' },
        cause: {
          en: 'It’s rare on city water. It usually comes from the water heater or a drain.',
          es: 'Es raro con agua de ciudad. Suele venir del calentador o de un desagüe.',
        },
        action: {
          en: 'We find the source and tell you if a filter would even help.',
          es: 'Buscamos el origen y te decimos si un filtro serviría de algo.',
        },
        pageKey: 'rotten-egg-smell',
      },
    },
  },
  {
    id: 'iron',
    icon: 'Shirt',
    label: { en: 'Orange stains', es: 'Manchas naranjas' },
    result: {
      well: {
        headline: { en: 'It’s iron.', es: 'Es hierro.' },
        cause: {
          en: 'Dissolved iron from the aquifer. It stains clothes, sinks and walls.',
          es: 'Hierro disuelto del acuífero. Mancha ropa, lavamanos y paredes.',
        },
        action: {
          en: 'Oxidation plus an iron filter sized to your home and irrigation.',
          es: 'Oxidación y un filtro de hierro a la medida de tu casa y tu riego.',
        },
        pageKey: 'iron-stains',
      },
      city: {
        headline: { en: 'Check your pipes or sprinklers.', es: 'Revisa tuberías o riego.' },
        cause: {
          en: 'City water here is very low in iron. Old pipes or an irrigation well are the usual cause.',
          es: 'El agua de ciudad aquí casi no tiene hierro. Suelen ser tuberías viejas o un pozo de riego.',
        },
        action: {
          en: 'We find the real source first — and treat only that.',
          es: 'Primero encontramos el origen real, y tratamos solo eso.',
        },
        pageKey: 'iron-stains',
      },
    },
  },
  {
    id: 'scale',
    icon: 'Bath',
    label: { en: 'White scale', es: 'Sarro blanco' },
    result: {
      well: {
        headline: { en: 'It’s hard water.', es: 'Es agua dura.' },
        cause: {
          en: 'Calcium and magnesium from limestone. It builds up in pipes and appliances.',
          es: 'Calcio y magnesio de la piedra caliza. Se acumula en tuberías y equipos.',
        },
        action: {
          en: 'A softener sized to your family and your water use.',
          es: 'Un suavizador a la medida de tu familia y tu consumo.',
        },
        pageKey: 'hard-water',
      },
      city: {
        headline: { en: 'You may not need a softener.', es: 'Quizá no necesites suavizador.' },
        cause: {
          en: 'City water here is soft to moderate. Cape Coral says so itself.',
          es: 'El agua de ciudad aquí es blanda o moderada. Cape Coral lo dice.',
        },
        action: {
          en: 'We test it. If you don’t need one, we tell you.',
          es: 'La medimos. Si no lo necesitas, te lo decimos.',
        },
        pageKey: 'hard-water',
      },
    },
  },
  {
    id: 'chlorine',
    icon: 'GlassWater',
    label: { en: 'Chlorine taste', es: 'Sabor a cloro' },
    result: {
      well: {
        headline: { en: 'Check your chlorinator.', es: 'Revisa tu clorador.' },
        cause: {
          en: 'Wells aren’t chlorinated unless you have a chlorinator or a recent shock treatment.',
          es: 'Los pozos no llevan cloro, salvo que tengas clorador o una desinfección reciente.',
        },
        action: {
          en: 'We adjust your equipment or add carbon after it.',
          es: 'Ajustamos tu equipo o añadimos carbón después.',
        },
        pageKey: 'maintenance',
      },
      city: {
        headline: { en: 'It’s the disinfectant.', es: 'Es el desinfectante.' },
        cause: {
          en: 'Chlorine or chloramines keep city water safe — and you can taste them.',
          es: 'El cloro o las cloraminas mantienen el agua segura, y se notan.',
        },
        action: {
          en: 'Whole-house catalytic carbon removes them at every tap.',
          es: 'Carbón catalítico para toda la casa los quita en cada llave.',
        },
        pageKey: 'chlorine-taste',
      },
    },
  },
  {
    id: 'salty',
    icon: 'CookingPot',
    label: { en: 'Salty taste', es: 'Sabor salado' },
    result: {
      well: {
        headline: { en: 'Probably chlorides.', es: 'Probablemente cloruros.' },
        cause: {
          en: 'Some older or deeper wells in Lee County pull in salt.',
          es: 'Algunos pozos viejos o profundos de Lee County arrastran sal.',
        },
        action: {
          en: 'Reverse osmosis in the kitchen gives you great drinking water.',
          es: 'Una ósmosis inversa en la cocina te da agua excelente para beber.',
        },
        pageKey: 'reverse-osmosis',
      },
      city: {
        headline: { en: 'It’s sodium.', es: 'Es sodio.' },
        cause: {
          en: 'It varies by city. Fort Myers reports 114 mg/L.',
          es: 'Varía según la ciudad. Fort Myers reporta 114 mg/L.',
        },
        action: {
          en: 'Reverse osmosis for drinking and cooking reduces it.',
          es: 'Una ósmosis inversa para beber y cocinar lo reduce.',
        },
        pageKey: 'reverse-osmosis',
      },
    },
  },
  {
    id: 'unseen',
    icon: 'Search',
    label: { en: 'Just want to know', es: 'Solo quiero saber' },
    result: {
      well: {
        headline: { en: 'Test it once a year.', es: 'Analízalo una vez al año.' },
        cause: {
          en: 'Nobody tests a private well for you. Florida Health recommends yearly testing.',
          es: 'Nadie analiza un pozo privado por ti. Salud de Florida lo recomienda cada año.',
        },
        action: {
          en: 'We test on site and point you to a certified lab for bacteria.',
          es: 'Lo medimos en casa y te orientamos a un laboratorio para bacterias.',
        },
        pageKey: 'well-water',
      },
      city: {
        headline: { en: 'It’s safe. You can go further.', es: 'Es segura. Puedes ir más allá.' },
        cause: {
          en: 'City water meets federal standards. Byproducts vary by city.',
          es: 'El agua de ciudad cumple las normas. Los subproductos varían por ciudad.',
        },
        action: {
          en: 'Carbon for the house and reverse osmosis for drinking, if you want it.',
          es: 'Carbón para la casa y ósmosis para beber, si lo quieres.',
        },
        pageKey: 'city-water',
      },
    },
  },
];
