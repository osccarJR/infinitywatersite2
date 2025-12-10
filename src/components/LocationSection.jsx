import { MapPin, Phone, Globe2 } from 'lucide-react';

const regions = [
  {
    title: 'Florida',
    items: ['Naples', 'Fort Myers', 'Cape Coral', 'Miami', 'Orlando', 'Tampa']
  },
  {
    title: 'Costa Este',
    items: ['Connecticut', 'New York', 'New Jersey', 'Massachusetts', 'Pennsylvania']
  },
  {
    title: 'Atlántico Sur',
    items: ['Virginia', 'Washington', 'Maryland', 'Carolina del Norte', 'Georgia', 'Atlanta']
  },
  {
    title: 'Oeste y Sur',
    items: ['Arizona']
  }
];

export default function LocationSection() {
  return (
    <section id="cobertura" className="section-padding bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full mb-4 text-sm">
              <Globe2 className="w-4 h-4" />
              <span>Cobertura expandida</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-slate-900 mb-4">
              Cubrimos toda Florida y más estados clave
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              También servimos Connecticut, New York, New Jersey, Massachusetts, Pennsylvania, Virginia,
              Washington, Maryland, Arizona, Carolina del Norte, Georgia y Atlanta.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="grid sm:grid-cols-2 gap-4">
              {regions.map((region) => (
                <div key={region.title} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-blue-700 font-semibold mb-2">{region.title}</p>
                  <div className="space-y-1">
                    {region.items.map((city) => (
                      <div key={city} className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1640179840059-ffb51b831e06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Mapa cobertura"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-cyan-600/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
                    <Globe2 className="w-12 h-12 text-blue-900 mx-auto mb-3" />
                    <p className="text-slate-900 text-lg mb-1">Cobertura Multidestino</p>
                    <p className="text-slate-600 text-sm">Florida, Costa Este y más</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl border border-slate-200 px-6 py-4 flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-700" />
                <div>
                  <p className="text-sm text-slate-500">Revisamos tu zona</p>
                  <p className="text-blue-700 font-semibold">Llámanos: (475) 685-8464</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
