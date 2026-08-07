import { motion } from 'framer-motion';

const DESSINS = {
  uno: '<g class="tete"><g class="oreille-g"><path d="M20 48 L26 6 L50 34 Z" fill="#DE9350"/><path d="M28 43 L31 19 L42 33 Z" fill="#F7CBA9"/></g><g class="oreille-d"><path d="M80 48 L74 6 L50 34 Z" fill="#DE9350"/><path d="M72 43 L69 19 L58 33 Z" fill="#F7CBA9"/></g><ellipse cx="50" cy="58" rx="33" ry="30" fill="#E8A45C"/><path d="M50 29c-9 9-12 22-11 33h22c1-11-2-24-11-33z" fill="#FFF7EC"/><ellipse cx="50" cy="71" rx="17" ry="13" fill="#FFF7EC"/><circle cx="26" cy="66" r="6.5" fill="#F09090" opacity=".45"/><circle cx="74" cy="66" r="6.5" fill="#F09090" opacity=".45"/><g class="yeux"><ellipse cx="36" cy="54" rx="5.2" ry="5.6" fill="#33261A"/><ellipse cx="64" cy="54" rx="5.2" ry="5.6" fill="#33261A"/><circle cx="37.8" cy="52" r="1.9" fill="#fff"/><circle cx="65.8" cy="52" r="1.9" fill="#fff"/></g><ellipse cx="50" cy="66" rx="6.5" ry="4.8" fill="#33261A"/><path d="M50 71v3M50 74c-4 5-10 4-12 0M50 74c4 5 10 4 12 0" stroke="#33261A" stroke-width="2.6" fill="none" stroke-linecap="round"/><g class="langue"><path d="M43 78h14c0 5-3 8.5-7 8.5S43 83 43 78z" fill="#F2778C"/></g></g>',
  youmi: '<g class="tete"><g class="oreille-g"><path d="M24 44 L28 3 L47 30 Z" fill="#332F33"/><path d="M31 39 L33 16 L41 30 Z" fill="#A86B3E"/></g><g class="oreille-d"><path d="M76 44 L72 3 L53 30 Z" fill="#332F33"/><path d="M69 39 L67 16 L59 30 Z" fill="#A86B3E"/></g><ellipse cx="50" cy="58" rx="30" ry="30" fill="#332F33"/><path d="M31 46c4-4 9-4 12 0M57 46c3-4 8-4 12 0" stroke="#A86B3E" stroke-width="3.6" stroke-linecap="round" fill="none"/><ellipse cx="50" cy="72" rx="15" ry="12" fill="#A86B3E"/><g class="yeux"><ellipse cx="37" cy="57" rx="5.2" ry="5.6" fill="#fff"/><ellipse cx="63" cy="57" rx="5.2" ry="5.6" fill="#fff"/><circle cx="37.8" cy="57.6" r="2.9" fill="#1A1A1F"/><circle cx="63.8" cy="57.6" r="2.9" fill="#1A1A1F"/></g><ellipse cx="50" cy="67" rx="6" ry="4.4" fill="#1A1A1F"/><path d="M50 71v3M50 74c-4 5-9 4-11 0M50 74c4 5 9 4 11 0" stroke="#1A1A1F" stroke-width="2.4" fill="none" stroke-linecap="round"/><g class="langue"><path d="M45 78h10c0 4.5-2 7.5-5 7.5s-5-3-5-7.5z" fill="#F2778C"/></g></g>',
  jazz: '<g class="tete"><g class="oreille-g"><path d="M22 46c-8-11-4-21 6-19 7 1 12 8 14 17z" fill="#A98C63"/></g><g class="oreille-d"><path d="M78 46c8-11 4-21-6-19-7 1-12 8-14 17z" fill="#A98C63"/></g><path d="M50 25c19 0 33 13 33 31 0 18-15 30-33 30S17 74 17 56c0-18 14-31 33-31z" fill="#D9BF95"/><path d="M17 50l-8-5 9-2zM83 50l8-5-9-2zM50 25l-5-9 10 3z" fill="#D9BF95"/><path d="M28 45c6-4 12-3 15 2M57 47c3-5 9-6 15-2" stroke="#8A7250" stroke-width="4.4" stroke-linecap="round" fill="none"/><path d="M30 76c5 12 35 12 40 0 0 14-9 22-20 22s-20-8-20-22z" fill="#F0E3C8"/><ellipse cx="50" cy="71" rx="15" ry="12" fill="#F0E3C8"/><g class="yeux"><ellipse cx="37" cy="56" rx="5.4" ry="5.8" fill="#3A2C1C"/><ellipse cx="63" cy="56" rx="5.4" ry="5.8" fill="#3A2C1C"/><circle cx="38.8" cy="54" r="1.9" fill="#fff"/><circle cx="64.8" cy="54" r="1.9" fill="#fff"/></g><ellipse cx="50" cy="66" rx="6" ry="4.6" fill="#3A2C1C"/><path d="M50 71v3M50 74c-4 4-9 3-10 0M50 74c4 4 9 3 10 0" stroke="#3A2C1C" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M31 70l-13-4M31 77l-12 4M69 70l13-4M69 77l12 4" stroke="#F0E3C8" stroke-width="3.4" stroke-linecap="round"/><path d="M38 80c4 4 20 4 24 0" stroke="#C9B48C" stroke-width="2" fill="none" stroke-linecap="round"/></g>'
};

export default function Mascotte({ animalId = 'uno', etatReponse = 'attente' }) {
  const animations = {
    attente: { y: [0, -6, 0], rotate: [-2, 2, -2], transition: { repeat: Infinity, duration: 3.2, ease: "easeInOut" } },
    joie: { y: [0, -25, 0], scale: [1, 1.1, 1], transition: { duration: 0.6, type: "spring", bounce: 0.5 } },
    oups: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  };

  const svgContent = `<svg viewBox="0 0 100 100">${DESSINS[animalId] || DESSINS.uno}</svg>`;

  return (
    <motion.div
      animate={etatReponse}
      variants={animations}
      whileTap={{ scale: 0.9 }}
      className="mascotte"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
