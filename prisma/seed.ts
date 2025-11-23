/**
 * Seed script for Prisma database
 * Run with: npm run db:seed
 * 
 * Seeds the database with Karnataka heritage sites and related data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create Tags
  console.log('📌 Creating tags...');
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'fort' },
      update: {},
      create: { name: 'Fort', slug: 'fort' },
    }),
    prisma.tag.upsert({
      where: { slug: 'temple' },
      update: {},
      create: { name: 'Temple', slug: 'temple' },
    }),
    prisma.tag.upsert({
      where: { slug: 'medieval' },
      update: {},
      create: { name: 'Medieval', slug: 'medieval' },
    }),
    prisma.tag.upsert({
      where: { slug: 'ancient' },
      update: {},
      create: { name: 'Ancient', slug: 'ancient' },
    }),
    prisma.tag.upsert({
      where: { slug: 'vijayanagara' },
      update: {},
      create: { name: 'Vijayanagara', slug: 'vijayanagara' },
    }),
    prisma.tag.upsert({
      where: { slug: 'karnataka' },
      update: {},
      create: { name: 'Karnataka', slug: 'karnataka' },
    }),
    prisma.tag.upsert({
      where: { slug: 'pilgrimage' },
      update: {},
      create: { name: 'Pilgrimage', slug: 'pilgrimage' },
    }),
    prisma.tag.upsert({
      where: { slug: 'shiva' },
      update: {},
      create: { name: 'Shiva', slug: 'shiva' },
    }),
    prisma.tag.upsert({
      where: { slug: 'river' },
      update: {},
      create: { name: 'River', slug: 'river' },
    }),
    prisma.tag.upsert({
      where: { slug: 'hoysala' },
      update: {},
      create: { name: 'Hoysala', slug: 'hoysala' },
    }),
  ]);
  console.log(`✓ Created ${tags.length} tags\n`);

  // Create Heritage Sites
  console.log('🏛️  Creating heritage sites...');

  // 1. Sonda Fort
  const sondaFort = await prisma.heritageSite.upsert({
    where: { id: 'sonda-fort' },
    update: {},
    create: {
      id: 'sonda-fort',
      name: 'Sonda Fort',
      description: 'An ancient hill fort located near Sonda on Yellapur Road, known for its historic ruins and scenic surroundings. Built during the Vijayanagara period, this fort stands as a testament to the architectural prowess of the Sonda Nayakas.',
      location: 'Yellapur Road, Sonda, Uttara Kannada, Karnataka',
      latitude: 14.737579275610653,
      longitude: 74.81412076747816,
      country: 'India',
      city: 'Sonda',
      era: 'Medieval',
      yearBuilt: 1500,
      culturalContext: 'Built by the Sonda Nayakas during the Vijayanagara Empire, this fort served as an important military outpost and administrative center in the Western Ghats region.',
      historicalFacts: 'The fort was strategically positioned to control trade routes through the dense forests. It features unique architectural elements combining Dravidian and local Kannada styles.',
      visitingInfo: 'Open daily from 6 AM to 6 PM. Best visited during cooler months (October to February). Wear comfortable shoes for climbing.',
      accessibility: 'Moderate difficulty. Requires climbing steps. Not wheelchair accessible. Parking available at the base.',
      isPublished: true,
      isFeatured: true,
      tags: {
        create: [
          { tag: { connect: { slug: 'fort' } } },
          { tag: { connect: { slug: 'medieval' } } },
          { tag: { connect: { slug: 'vijayanagara' } } },
          { tag: { connect: { slug: 'karnataka' } } },
          { tag: { connect: { slug: 'temple' } } },
        ],
      },
    },
  });
  console.log(`✓ Created: ${sondaFort.name}`);

  // 2. Sahasralinga
  const sahasralinga = await prisma.heritageSite.upsert({
    where: { id: 'sahasralinga' },
    update: {},
    create: {
      id: 'sahasralinga',
      name: 'Sahasralinga',
      description: 'Sahasralinga, near Sirsi in Karnataka, is a unique riverside site famed for its thousands of intricately carved Shiva Lingas etched into the riverbed and surrounding rocks. The tranquil setting features lush greenery, flowing water, and mystical artistry, making it a destination for both spiritual seekers and nature lovers.',
      location: 'Yellapur Road, near Somasagara, Sirsi, Uttara Kannada, Karnataka',
      latitude: 14.720131543221346,
      longitude: 74.80755928939277,
      country: 'India',
      city: 'Sirsi',
      era: 'Ancient',
      yearBuilt: 900,
      culturalContext: 'The site holds significant religious value for Hindus, attracting devotees—especially during Mahashivaratri—who come to worship the Lingas as symbols of Lord Shiva’s presence.',
      historicalFacts: 'The name "Sahasralinga" literally means "thousand lingas". Local legends suggest these were carved by devotees over centuries. The site becomes particularly spectacular during monsoons when water flows over the carvings.',
      visitingInfo: 'Best visited in winter for pleasant weather, Sahasralinga is easily accessible from Sirsi, with options for nearby accommodation and chances to explore other regional attractions like Jog Falls and Yana Rocks.',
      accessibility: 'Moderate accessibility. Involves walking on uneven riverbed rocks. Use caution during monsoons due to water flow. Limited parking available.',
      isPublished: true,
      isFeatured: true,
      tags: {
        create: [
          { tag: { connect: { slug: 'temple' } } },
          { tag: { connect: { slug: 'pilgrimage' } } },
          { tag: { connect: { slug: 'shiva' } } },
          { tag: { connect: { slug: 'river' } } },
          { tag: { connect: { slug: 'ancient' } } },
          { tag: { connect: { slug: 'karnataka' } } },
        ],
      },
    },
  });
  console.log(`✓ Created: ${sahasralinga.name}`);

  // 3. Somasagara Shiva Temple
  const somasagaraTemple = await prisma.heritageSite.upsert({
    where: { id: 'somasagara-temple' },
    update: {},
    create: {
      id: 'somasagara-temple',
      name: 'Somasagara Shiva Temple',
      description: 'The Someshwar Temple at Somasagar near Sirsi, Karnataka, is an ancient Shiva temple reportedly built during the Vijayanagara period, making it about 400 years old. The temple is known for its peaceful setting near a water body (Somasagar) and traditional Dravidian architecture.',
      location: 'Somasagara, Sirsi, Uttara Kannada, Karnataka',
      latitude: 14.559437321516864,
      longitude: 74.80592353944104,
      country: 'India',
      city: 'Sirsi',
      era: 'Ancient',
      yearBuilt: 850,
      culturalContext: 'This temple is an important place of worship for devotees of Lord Shiva, reflecting the region’s strong Shaivite traditions. It also hosts key religious rituals, serving as a spiritual gathering point for locals, especially during festivals like Mahashivaratri.',
      historicalFacts: 'Belonging to the era of the Vijayanagara Empire, the Someshwar Temple is notable for its age (around 400 years) and its architectural style. Its location and structure suggest the temple was once patronized by regional rulers, serving as a marker of historical continuity in Sirsi’s religious life.',
      visitingInfo: 'The temple lies on Somasagar Road, Masigadde, easily accessible from Sirsi. Visitors often combine trips here with exploration of other local attractions. The serene environment and historical significance make it a worthwhile stop for history lovers and devotees alike.',
      accessibility: 'Good accessibility with paved pathways. Wheelchair accessible main areas. Parking available. Basic facilities like restrooms and drinking water provided.',
      isPublished: true,
      isFeatured: false,
      tags: {
        create: [
          { tag: { connect: { slug: 'temple' } } },
          { tag: { connect: { slug: 'shiva' } } },
          { tag: { connect: { slug: 'ancient' } } },
          { tag: { connect: { slug: 'hoysala' } } },
          { tag: { connect: { slug: 'karnataka' } } },
          { tag: { connect: { slug: 'pilgrimage' } } },
        ],
      },
    },
  });
  console.log(`✓ Created: ${somasagaraTemple.name}\n`);

  // Create Assets
  console.log('📦 Creating assets...');

  // Assets for Sonda Fort
  await prisma.asset.create({
    data: {
      type: 'MODEL_3D',
      title: 'Sonda Fort - Complete 3D Model',
      description: 'High-detail 3D reconstruction of Sonda Fort including walls, ramparts, and surrounding landscape',
      storageKey: 'models/sonda_fort_complete_v1.glb',
      storageUrl: '/models/sonda-fort.glb',
      fileSize: BigInt(52428800),
      mimeType: 'model/gltf-binary',
      format: 'GLB',
      polygonCount: 150000,
      textureCount: 12,
      isPanorama: false,
      attribution: '3D model created by Prapti Heritage Team',
      license: 'CC-BY-4.0',
      isProcessed: true,
      isPublic: true,
      siteId: sondaFort.id,
    },
  });

  await prisma.asset.create({
    data: {
      type: 'PANORAMA_360',
      title: 'Sonda Fort - Main Entrance 360° View',
      description: '360-degree panoramic view of the fort\'s main entrance and courtyard',
      storageKey: 'panoramas/sonda_fort_entrance_360.jpg',
      storageUrl: '/360-images/sonda-fort-1.jpg',
      fileSize: BigInt(4096000),
      mimeType: 'image/jpeg',
      isPanorama: true,
      panoramaType: '360',
      width: 8192,
      height: 4096,
      attribution: 'Photo by Prapti Heritage Team',
      license: 'CC-BY-4.0',
      isProcessed: true,
      isPublic: true,
      siteId: sondaFort.id,
    },
  });

  await prisma.asset.create({
    data: {
      type: 'PANORAMA_360',
      title: 'Sonda Fort - Rampart View 360°',
      description: 'Panoramic view from the fort\'s ramparts overlooking the valley',
      storageKey: 'panoramas/sonda_fort_rampart_360.jpg',
      storageUrl: '/360-images/sonda-fort-2.jpg',
      fileSize: BigInt(3584000),
      mimeType: 'image/jpeg',
      isPanorama: true,
      panoramaType: '360',
      width: 8192,
      height: 4096,
      attribution: 'Photo by Prapti Heritage Team',
      license: 'CC-BY-4.0',
      isProcessed: true,
      isPublic: true,
      siteId: sondaFort.id,
    },
  });

  // Assets for Sahasralinga
  await prisma.asset.create({
    data: {
      type: 'MODEL_3D',
      title: 'Sahasralinga - Riverbed 3D Model',
      description: '3D model of the Sahasralinga site showing the carved lingas on the riverbed',
      storageKey: 'models/sahasralinga_riverbed_v1.glb',
      storageUrl: '/models/sahasralinga.glb',
      fileSize: BigInt(48234567),
      mimeType: 'model/gltf-binary',
      format: 'GLB',
      polygonCount: 120000,
      textureCount: 8,
      isPanorama: false,
      attribution: '3D model created by Prapti Heritage Team',
      license: 'CC-BY-4.0',
      isProcessed: true,
      isPublic: true,
      siteId: sahasralinga.id,
    },
  });

  await prisma.asset.create({
    data: {
      type: 'PANORAMA_360',
      title: 'Sahasralinga - River View 360°',
      description: '360° view of the sacred lingas with the river flowing over them',
      storageKey: 'panoramas/sahasralinga_monsoon_360.jpg',
      storageUrl: '/360-images/sahasra-linga.jpg',
      fileSize: BigInt(5242880),
      mimeType: 'image/jpeg',
      isPanorama: true,
      panoramaType: '360',
      width: 8192,
      height: 4096,
      attribution: 'Photo by Prapti Heritage Team',
      license: 'CC-BY-4.0',
      isProcessed: true,
      isPublic: true,
      siteId: sahasralinga.id,
    },
  });

  // Assets for Somasagara Temple
  await prisma.asset.create({
    data: {
      type: 'MODEL_3D',
      title: 'Somasagara Temple - 3D Model',
      description: 'Detailed 3D model of the Somasagara Shiva Temple complex',
      storageKey: 'models/somasagara_temple_v1.glb',
      storageUrl: '/models/somasagara.glb',
      fileSize: BigInt(35678901),
      mimeType: 'model/gltf-binary',
      format: 'GLB',
      polygonCount: 95000,
      textureCount: 6,
      isPanorama: false,
      attribution: '3D model created by Prapti Heritage Team',
      license: 'CC-BY-4.0',
      isProcessed: true,
      isPublic: true,
      siteId: somasagaraTemple.id,
    },
  });

  await prisma.asset.create({
    data: {
      type: 'PANORAMA_360',
      title: 'Somasagara Temple - Main Hall 360°',
      description: 'Panoramic view of the temple\'s main worship hall',
      storageKey: 'panoramas/somasagara_temple_360.jpg',
      storageUrl: '/360-images/somasagara.jpg',
      fileSize: BigInt(4718592),
      mimeType: 'image/jpeg',
      isPanorama: true,
      panoramaType: '360',
      width: 8192,
      height: 4096,
      attribution: 'Photo by Prapti Heritage Team',
      license: 'CC-BY-4.0',
      isProcessed: true,
      isPublic: true,
      siteId: somasagaraTemple.id,
    },
  });

  console.log('✓ Created 7 assets\n');

  // Create Trivia Questions
  console.log('❓ Creating trivia questions...');

  // Sonda Fort questions
  await prisma.triviaQuestion.create({
    data: {
      question: 'Who built Sonda Fort and during which empire?',
      difficulty: 'EASY',
      category: 'History',
      siteId: sondaFort.id,
      answers: {
        create: [
          {
            answerText: 'Sonda Nayakas during the Vijayanagara Empire',
            isCorrect: true,
            explanation: 'Sonda Fort was built by the Sonda Nayakas around 1500 CE during the Vijayanagara period, serving as an important military outpost and administrative center in the Western Ghats.',
          },
          {
            answerText: 'Hoysala Dynasty',
            isCorrect: false,
            explanation: 'The Hoysalas ruled earlier (10th-14th century) and were not associated with Sonda Fort construction.',
          },
          {
            answerText: 'British colonizers',
            isCorrect: false,
            explanation: 'The British came much later, in the colonial period, long after Sonda Fort was built.',
          },
          {
            answerText: 'Kadamba rulers',
            isCorrect: false,
            explanation: 'The Kadambas ruled Karnataka much earlier (345-525 CE) and were not the builders of this fort.',
          },
        ],
      },
    },
  });

  await prisma.triviaQuestion.create({
    data: {
      question: 'What was the strategic purpose of Sonda Fort\'s location?',
      difficulty: 'MEDIUM',
      category: 'History',
      siteId: sondaFort.id,
      answers: {
        create: [
          {
            answerText: 'To control trade routes through the dense forests',
            isCorrect: true,
            explanation: 'Sonda Fort was strategically positioned to control important trade routes through the Western Ghats dense forests, making it a crucial military and economic outpost.',
          },
          {
            answerText: 'To serve as a royal palace',
            isCorrect: false,
            explanation: 'While it had administrative functions, the fort\'s primary purpose was military and strategic control, not as a palace.',
          },
          {
            answerText: 'To protect against naval invasions',
            isCorrect: false,
            explanation: 'Sonda Fort is located inland in the Western Ghats, not on the coast, so naval defense was not its purpose.',
          },
          {
            answerText: 'To store religious artifacts',
            isCorrect: false,
            explanation: 'The fort was primarily a military outpost, not a religious storage facility.',
          },
        ],
      },
    },
  });

  await prisma.triviaQuestion.create({
    data: {
      question: 'What is the best time to visit Sonda Fort?',
      difficulty: 'EASY',
      category: 'Travel',
      siteId: sondaFort.id,
      answers: {
        create: [
          {
            answerText: 'October to February (cooler months)',
            isCorrect: true,
            explanation: 'The fort is best visited during cooler months from October to February for comfortable climbing and exploration. It\'s open daily from 6 AM to 6 PM.',
          },
          {
            answerText: 'During monsoon season',
            isCorrect: false,
            explanation: 'Monsoons can make climbing difficult and dangerous due to slippery surfaces and heavy rainfall.',
          },
          {
            answerText: 'Peak summer months',
            isCorrect: false,
            explanation: 'Summer heat makes climbing and exploration uncomfortable in the Western Ghats region.',
          },
          {
            answerText: 'Only during festivals',
            isCorrect: false,
            explanation: 'The fort is open year-round, not just during festivals, though cooler months are preferable.',
          },
        ],
      },
    },
  });

  // Sahasralinga questions
  await prisma.triviaQuestion.create({
    data: {
      question: 'What does "Sahasralinga" literally mean?',
      difficulty: 'EASY',
      category: 'Culture & Religion',
      siteId: sahasralinga.id,
      answers: {
        create: [
          {
            answerText: 'Thousand lingas',
            isCorrect: true,
            explanation: 'Sahasralinga means "thousand lingas" in Sanskrit, referring to the thousands of intricately carved Shiva Lingas etched into the riverbed and surrounding rocks.',
          },
          {
            answerText: 'Sacred river',
            isCorrect: false,
            explanation: 'While the site is by a sacred river, the name specifically refers to the thousand lingas carved there.',
          },
          {
            answerText: 'Temple of light',
            isCorrect: false,
            explanation: 'This is not the meaning of Sahasralinga. It refers to the thousand Shiva lingams carved in stone.',
          },
          {
            answerText: 'Ancient pilgrimage',
            isCorrect: false,
            explanation: 'While it is an ancient pilgrimage site, the name directly translates to "thousand lingas".',
          },
        ],
      },
    },
  });

  await prisma.triviaQuestion.create({
    data: {
      question: 'When is Sahasralinga especially popular for pilgrimages?',
      difficulty: 'EASY',
      category: 'Culture & Religion',
      siteId: sahasralinga.id,
      answers: {
        create: [
          {
            answerText: 'During Mahashivaratri festival',
            isCorrect: true,
            explanation: 'Sahasralinga attracts devotees especially during Mahashivaratri, when they come to worship the Lingas as symbols of Lord Shiva\'s presence.',
          },
          {
            answerText: 'During Diwali',
            isCorrect: false,
            explanation: 'While Diwali is celebrated, Mahashivaratri is the primary festival associated with this Shiva pilgrimage site.',
          },
          {
            answerText: 'During Holi',
            isCorrect: false,
            explanation: 'Holi is not particularly associated with Sahasralinga. Mahashivaratri is the main festival for this site.',
          },
          {
            answerText: 'During Ganesh Chaturthi',
            isCorrect: false,
            explanation: 'Ganesh Chaturthi celebrates Lord Ganesha, while Sahasralinga is dedicated to Lord Shiva and celebrates Mahashivaratri.',
          },
        ],
      },
    },
  });

  await prisma.triviaQuestion.create({
    data: {
      question: 'What makes Sahasralinga spectacular during monsoons?',
      difficulty: 'EASY',
      category: 'Geography & Nature',
      siteId: sahasralinga.id,
      answers: {
        create: [
          {
            answerText: 'River water flows over the carved lingas',
            isCorrect: true,
            explanation: 'During monsoons, the site becomes particularly spectacular when water flows over the thousands of carved lingas, creating a beautiful and spiritually significant sight.',
          },
          {
            answerText: 'Waterfalls form around the temple',
            isCorrect: false,
            explanation: 'While water flow increases, the main spectacle is the water flowing over the carved lingas in the riverbed.',
          },
          {
            answerText: 'New carvings become visible',
            isCorrect: false,
            explanation: 'The carvings are permanent. The spectacle is from water flowing over existing lingas, not revealing new ones.',
          },
          {
            answerText: 'The rocks change color dramatically',
            isCorrect: false,
            explanation: 'While wet rocks may appear different, the main attraction is the flowing water over the sacred carvings.',
          },
        ],
      },
    },
  });

  await prisma.triviaQuestion.create({
    data: {
      question: 'What nearby attractions can visitors explore near Sahasralinga?',
      difficulty: 'MEDIUM',
      category: 'Travel',
      siteId: sahasralinga.id,
      answers: {
        create: [
          {
            answerText: 'Jog Falls and Yana Rocks',
            isCorrect: true,
            explanation: 'Visitors to Sahasralinga have chances to explore other regional attractions like the magnificent Jog Falls and the unique Yana Rocks formations.',
          },
          {
            answerText: 'Taj Mahal and Red Fort',
            isCorrect: false,
            explanation: 'These are famous North Indian monuments far from Karnataka. Sahasralinga is near Jog Falls and Yana Rocks.',
          },
          {
            answerText: 'Goa beaches only',
            isCorrect: false,
            explanation: 'While Goa is relatively close, the region offers natural wonders like Jog Falls and Yana Rocks as primary nearby attractions.',
          },
          {
            answerText: 'Hampi temples',
            isCorrect: false,
            explanation: 'Hampi is in a different part of Karnataka. Closer attractions include Jog Falls and Yana Rocks.',
          },
        ],
      },
    },
  });

  // Somasagara Temple questions
  await prisma.triviaQuestion.create({
    data: {
      question: 'How old is the Somasagara Shiva Temple?',
      difficulty: 'EASY',
      category: 'History',
      siteId: somasagaraTemple.id,
      answers: {
        create: [
          {
            answerText: 'About 400 years old',
            isCorrect: true,
            explanation: 'The Someshwar Temple at Somasagar was built during the Vijayanagara period, making it approximately 400 years old.',
          },
          {
            answerText: 'Over 1000 years old',
            isCorrect: false,
            explanation: 'While ancient, the temple is about 400 years old, not 1000. It belongs to the Vijayanagara period.',
          },
          {
            answerText: 'About 100 years old',
            isCorrect: false,
            explanation: 'The temple is much older than 100 years, dating back approximately 400 years to the Vijayanagara era.',
          },
          {
            answerText: '50 years old',
            isCorrect: false,
            explanation: 'This is far too recent. The temple is a historic structure about 400 years old.',
          },
        ],
      },
    },
  });

  await prisma.triviaQuestion.create({
    data: {
      question: 'What architectural style characterizes Somasagara Temple?',
      difficulty: 'MEDIUM',
      category: 'Architecture',
      siteId: somasagaraTemple.id,
      answers: {
        create: [
          {
            answerText: 'Traditional Dravidian architecture',
            isCorrect: true,
            explanation: 'The temple is known for its traditional Dravidian architectural style, typical of South Indian temples from the Vijayanagara period.',
          },
          {
            answerText: 'Indo-Islamic architecture',
            isCorrect: false,
            explanation: 'This is a Hindu temple with Dravidian design, not Indo-Islamic which features domes and arches.',
          },
          {
            answerText: 'Modern contemporary design',
            isCorrect: false,
            explanation: 'The temple is a 400-year-old historic structure with traditional Dravidian architecture, not modern design.',
          },
          {
            answerText: 'Buddhist stupa style',
            isCorrect: false,
            explanation: 'This is a Shiva temple with Dravidian Hindu architecture, not Buddhist stupa design.',
          },
        ],
      },
    },
  });

  await prisma.triviaQuestion.create({
    data: {
      question: 'What makes Somasagara Temple special for local devotees?',
      difficulty: 'MEDIUM',
      category: 'Culture & Religion',
      siteId: somasagaraTemple.id,
      answers: {
        create: [
          {
            answerText: 'It reflects strong Shaivite traditions and hosts key rituals',
            isCorrect: true,
            explanation: 'The temple is an important place of worship reflecting the region\'s strong Shaivite traditions, hosting key religious rituals especially during festivals like Mahashivaratri.',
          },
          {
            answerText: 'It\'s the largest temple in Karnataka',
            isCorrect: false,
            explanation: 'While significant locally, it\'s not the largest temple in Karnataka. Its importance lies in its spiritual and historical value.',
          },
          {
            answerText: 'It houses ancient treasure',
            isCorrect: false,
            explanation: 'The temple\'s value is spiritual and historical, not related to material treasure.',
          },
          {
            answerText: 'It\'s a UNESCO World Heritage site',
            isCorrect: false,
            explanation: 'While historically significant, it\'s not designated as a UNESCO site. Its importance is to local devotees and regional heritage.',
          },
        ],
      },
    },
  });

  await prisma.triviaQuestion.create({
    data: {
      question: 'What accessibility features does Somasagara Temple offer?',
      difficulty: 'EASY',
      category: 'Travel',
      siteId: somasagaraTemple.id,
      answers: {
        create: [
          {
            answerText: 'Paved pathways, wheelchair access, parking, and basic facilities',
            isCorrect: true,
            explanation: 'The temple offers good accessibility with paved pathways, wheelchair accessible main areas, parking, and basic facilities like restrooms and drinking water.',
          },
          {
            answerText: 'Only accessible by steep mountain climb',
            isCorrect: false,
            explanation: 'Unlike some hilltop temples, Somasagara has good accessibility with paved pathways and wheelchair access.',
          },
          {
            answerText: 'No facilities available',
            isCorrect: false,
            explanation: 'The temple provides basic facilities including parking, restrooms, and drinking water.',
          },
          {
            answerText: 'Only accessible during specific hours',
            isCorrect: false,
            explanation: 'While there may be visiting hours, the question asks about accessibility features (physical access), which are good year-round.',
          },
        ],
      },
    },
  });

  console.log('✓ Created 12 comprehensive trivia questions\n');

  console.log('✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${tags.length} tags`);
  console.log('   - 3 heritage sites');
  console.log('   - 7 assets (3D models + 360° images)');
  console.log('   - 4 trivia questions with 16 answers');
  console.log('\n🎉 Ready to explore Karnataka heritage sites!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
