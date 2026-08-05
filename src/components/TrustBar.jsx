const badges = [
  { label: 'BBB Accredited Business', image: '/images/cert-bbb.webp' },
  { label: 'Water Quality Association', image: '/images/cert-wqa.webp' },
  { label: 'Make Alkaline Water', image: '/images/cert-alkaline.webp' },
];

export default function TrustBar() {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 py-3 md:py-4 shadow-lg">
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-start md:justify-center gap-3 sm:gap-4 md:gap-8 lg:gap-12 text-white text-xs sm:text-sm md:text-base overflow-x-auto md:overflow-visible hide-scrollbar -mx-2 px-2">
          {badges.map((badge) => (
            <li
              key={badge.label}
              className="flex-shrink-0 flex items-center gap-3 bg-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm border border-white/20 shadow-md"
            >
              <img
                src={badge.image}
                alt=""
                width="40"
                height="40"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain bg-white rounded-full p-1"
                loading="lazy"
                decoding="async"
              />
              <span className="font-semibold drop-shadow whitespace-nowrap">{badge.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
