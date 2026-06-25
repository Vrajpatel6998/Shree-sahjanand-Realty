import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES = [
  // Backend uploads (services) - cropped exactly to 1200x800 for size verification
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop&q=80',
    dest: 'server/uploads/default-residential.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80',
    dest: 'server/uploads/default-commercial.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop&q=80',
    dest: 'server/uploads/default-industrial.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    dest: 'server/uploads/default-land.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop&q=80',
    dest: 'server/uploads/default-loans.jpg'
  },


  // Frontend assets - Hero slides
  {
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
    dest: 'public/assets/images/hero-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80',
    dest: 'public/assets/images/hero-2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    dest: 'public/assets/images/hero-3.jpg'
  },


  // Team members
  {
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    dest: 'public/assets/images/team-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    dest: 'public/assets/images/team-2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    dest: 'public/assets/images/team-3.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    dest: 'public/assets/images/team-4.jpg'
  },

  // About & visual slider
  {
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=80',
    dest: 'public/assets/images/about-office.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&q=80',
    dest: 'public/assets/images/about-property.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80',
    dest: 'public/assets/images/about-furnished.jpg'
  },

];

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    // Ensure destination directory exists
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image from ${url}. Status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // delete incomplete file
      reject(err);
    });
  });
};

const run = async () => {
  console.log(`Starting downloads for ${IMAGES.length} images...`);
  
  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    console.log(`[${i + 1}/${IMAGES.length}] Downloading ${path.basename(img.dest)}...`);
    try {
      await downloadImage(img.url, img.dest);
    } catch (err) {
      console.error(`Failed to download ${img.dest}:`, err.message);
    }
  }
  
  console.log('Image download process completed successfully.');
};

run();
