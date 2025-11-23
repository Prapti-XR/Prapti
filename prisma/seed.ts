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
      description: 'A unique pilgrimage site near Somasagara village on the Shalmala river with thousands of Shiva lingas carved on rocks. During the monsoon, the river flows over these carvings, creating a mesmerizing spiritual experience.',
      location: 'Yellapur Road, near Somasagara, Sirsi, Uttara Kannada, Karnataka',
      latitude: 14.720131543221346,
      longitude: 74.80755928939277,
      country: 'India',
      city: 'Sirsi',
      era: 'Ancient',
      yearBuilt: 900,
      culturalContext: 'A sacred site dedicated to Lord Shiva, featuring thousands of lingams carved on riverbed rocks. The site represents the deep Shaivite traditions of the region and has been a pilgrimage destination for over a millennium.',
      historicalFacts: 'The name "Sahasralinga" literally means "thousand lingas". Local legends suggest these were carved by devotees over centuries. The site becomes particularly spectacular during monsoons when water flows over the carvings.',
      visitingInfo: 'Best visited during monsoon season (June-September) to see water flowing over the lingas. Open year-round. Early morning visits recommended for peaceful atmosphere.',
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
      description: 'A serene Shiva temple known for its peaceful setting near Sahasralinga, surrounded by dense forests and streams. This ancient temple showcases beautiful stone architecture and intricate carvings.',
      location: 'Somasagara, Sirsi, Uttara Kannada, Karnataka',
      latitude: 14.559437321516864,
      longitude: 74.80592353944104,
      country: 'India',
      city: 'Sirsi',
      era: 'Ancient',
      yearBuilt: 850,
      culturalContext: 'An important Shaivite temple nestled in the Western Ghats forests. The temple has been a center of devotion and learning for centuries, attracting pilgrims and scholars alike.',
      historicalFacts: 'The temple features Hoysala-influenced architecture despite predating the Hoysala period. It served as a major religious center during the Kadamba dynasty. The temple complex includes several smaller shrines and a sacred pond.',
      visitingInfo: 'Temple timings: 6 AM - 12 PM and 4 PM - 8 PM. Modest dress required. Photography allowed in outer areas only. Special pujas during Shivaratri.',
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
  const q1 = await prisma.triviaQuestion.create({
    data: {
      question: 'During which historical period was Sonda Fort built?',
      difficulty: 'EASY',
      category: 'History',
      siteId: sondaFort.id,
      answers: {
        create: [
          {
            answerText: 'The Vijayanagara Empire',
            correct: true,
            explanation: 'Sonda Fort was built around 1500 CE by the Sonda Nayakas, who were vassals of the mighty Vijayanagara Empire.',
          },
          {
            answerText: 'The Hoysala Dynasty',
            correct: false,
            explanation: 'While the Hoysalas were powerful in Karnataka, they ruled earlier (10th-14th century) and were not associated with Sonda Fort.',
          },
          {
            answerText: 'The Kadamba Dynasty',
            correct: false,
            explanation: 'The Kadambas ruled Karnataka much earlier (345-525 CE) and were not the builders of Sonda Fort.',
          },
          {
            answerText: 'The British East India Company',
            correct: false,
            explanation: 'The British came to this region much later, in the colonial period, long after the fort was built.',
          },
        ],
      },
    },
  });

  // Sahasralinga questions
  const q2 = await prisma.triviaQuestion.create({
    data: {
      question: 'The carvings at Sahasralinga are dedicated to which Hindu deity?',
      difficulty: 'EASY',
      category: 'Culture & Religion',
      siteId: sahasralinga.id,
      answers: {
        create: [
          {
            answerText: 'Lord Shiva',
            correct: true,
            explanation: 'Sahasralinga features thousands of Shiva lingas (symbols of Lord Shiva) carved on riverbed rocks, making it a sacred Shaivite pilgrimage site.',
          },
          {
            answerText: 'Lord Vishnu',
            correct: false,
            explanation: 'While Vishnu is widely worshipped in Karnataka, Sahasralinga is specifically dedicated to Shiva.',
          },
          {
            answerText: 'Lord Ganesha',
            correct: false,
            explanation: 'Ganesha is revered in the region, but Sahasralinga specifically features Shiva lingas.',
          },
          {
            answerText: 'Goddess Durga',
            correct: false,
            explanation: 'Though Durga worship is common in Karnataka, this particular site is dedicated to Shiva.',
          },
        ],
      },
    },
  });

  const q3 = await prisma.triviaQuestion.create({
    data: {
      question: 'What makes Sahasralinga particularly spectacular during the monsoon season?',
      difficulty: 'EASY',
      category: 'Geography & Nature',
      siteId: sahasralinga.id,
      answers: {
        create: [
          {
            answerText: 'The river water flows over the thousand carved lingas',
            correct: true,
            explanation: 'During monsoons, the Shalmala river swells and flows over the rock carvings, creating a beautiful and spiritually significant sight.',
          },
          {
            answerText: 'The carvings glow in the moonlight',
            correct: false,
            explanation: 'While the site is beautiful at night, the carvings don\'t actually glow. The monsoon water flow is the main attraction.',
          },
          {
            answerText: 'New lingas appear from underground',
            correct: false,
            explanation: 'This is a myth. The lingas are permanent stone carvings that become visible when water recedes.',
          },
          {
            answerText: 'The rocks change color',
            correct: false,
            explanation: 'The rocks don\'t change color, though they may appear different when wet versus dry.',
          },
        ],
      },
    },
  });

  // Somasagara Temple question
  const q4 = await prisma.triviaQuestion.create({
    data: {
      question: 'Which architectural style influenced the Somasagara Shiva Temple?',
      difficulty: 'MEDIUM',
      category: 'Architecture',
      siteId: somasagaraTemple.id,
      answers: {
        create: [
          {
            answerText: 'Hoysala-influenced architecture',
            correct: true,
            explanation: 'Despite predating the Hoysala period, the temple shows architectural elements that would later be refined by Hoysala craftsmen.',
          },
          {
            answerText: 'Mughal architecture',
            correct: false,
            explanation: 'Mughal architecture came much later and is characterized by domes and arches, unlike this South Indian temple.',
          },
          {
            answerText: 'Gothic architecture',
            correct: false,
            explanation: 'Gothic is a European architectural style with no influence on ancient Indian temples.',
          },
          {
            answerText: 'Modern minimalist design',
            correct: false,
            explanation: 'This is an ancient temple with traditional Indian architectural elements, not modern design.',
          },
        ],
      },
    },
  });

  console.log('✓ Created 4 trivia questions\n');

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
